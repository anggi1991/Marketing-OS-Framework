import {
  CompleteContext,
  GlobalContext,
  Transition,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowState,
  WorkflowStep,
} from './types';

export class WorkflowEngine {
  private globalContext: GlobalContext;
  private stepRegistry: Map<string, WorkflowStep> = new Map();

  constructor(globalContext: GlobalContext = {}) {
    this.globalContext = globalContext;
  }

  registerStep(step: WorkflowStep) {
    this.stepRegistry.set(step.descriptor.id, step);
  }

  async run(definition: WorkflowDefinition, instance: WorkflowInstance): Promise<WorkflowInstance> {
    if (instance.currentState === 'Created') {
      instance.currentState = 'Queued';
    }

    if (instance.currentState === 'Queued') {
      instance.currentState = 'Running';
      instance.currentStepId = definition.initialStepId;
    }

    while (instance.currentState === 'Running' && instance.currentStepId) {
      await this.executeCurrentStep(definition, instance);
    }

    return instance;
  }

  private async executeCurrentStep(definition: WorkflowDefinition, instance: WorkflowInstance) {
    const stepId = instance.currentStepId!;
    const step = this.stepRegistry.get(stepId);

    if (!step) {
      console.error(`[Engine] Step implementation not found for: ${stepId}`);
      instance.currentState = 'Failed';
      return;
    }

    console.log(`\n[Engine] Executing Step: ${step.descriptor.name} (${stepId})`);

    // Ensure step context exists
    if (!instance.stepContexts[stepId]) {
      instance.stepContexts[stepId] = {};
    }

    // Execution Context is ephemeral per step execution
    const executionContext = {
      stepId,
      attempt: 1,
      startTime: Date.now(),
    };

    const completeContext: CompleteContext = {
      global: this.globalContext,
      workflow: instance.workflowContext,
      step: instance.stepContexts[stepId],
      execution: executionContext,
    };

    const maxRetries = step.descriptor.retryable ? (step.descriptor.maxRetries ?? 1) : 0;
    let stepResult: any = null;
    let stepError: any = null;
    let success = false;

    // Retry Loop centrally handled by Runtime (AD-0001)
    while (executionContext.attempt <= maxRetries + 1) {
      try {
        console.log(`[Engine] -> Attempt ${executionContext.attempt}/${maxRetries + 1}`);
        stepResult = await step.execute(completeContext);
        success = true;
        break; // break retry loop on success
      } catch (err) {
        stepError = err;
        console.log(`[Engine] -> Attempt ${executionContext.attempt} failed: ${(err as Error).message}`);
        executionContext.attempt++;
      }
    }

    const transitions = definition.transitions[stepId] || [];
    
    // Sort transitions by priority descending
    transitions.sort((a, b) => b.priority - a.priority);

    if (success) {
      // Find normal transition
      const nextTransition = transitions.find(t => {
        if (t.isErrorPath) return false; // Ignore error paths on success
        if (t.guard && !t.guard(completeContext)) return false;
        if (t.condition && !t.condition(completeContext, stepResult)) return false;
        return true;
      }) || transitions.find(t => t.isDefaultPath && !t.isErrorPath);

      if (nextTransition) {
        console.log(`[Engine] Transitioning to: ${nextTransition.targetStepId}`);
        instance.currentStepId = nextTransition.targetStepId;
      } else {
        console.log(`[Engine] No next transition found. Workflow Completed.`);
        instance.currentStepId = null;
        instance.currentState = 'Completed';
      }
    } else {
      // Find error transition
      const errorTransition = transitions.find(t => {
        if (!t.isErrorPath) return false;
        if (t.guard && !t.guard(completeContext)) return false;
        // Condition might inspect the error context, but for simplicity here we just use guard
        return true;
      }) || transitions.find(t => t.isDefaultPath && t.isErrorPath);

      if (errorTransition) {
        console.log(`[Engine] Error caught. Transitioning to Error Path: ${errorTransition.targetStepId}`);
        instance.currentStepId = errorTransition.targetStepId;
      } else {
        console.log(`[Engine] Step failed and no Error Path found. Workflow Failed.`);
        instance.currentStepId = null;
        instance.currentState = 'Failed';
      }
    }
  }
}
