import { WorkflowEngine } from './engine';
import { CompleteContext, StepDescriptor, WorkflowDefinition, WorkflowInstance, WorkflowStep } from './types';

// ==========================================
// MOCK STEP IMPLEMENTATIONS
// ==========================================

class ValidateCustomerStep implements WorkflowStep {
  descriptor: StepDescriptor = { id: 'validate_customer', name: 'Validate Customer', version: '1.0', retryable: true, maxRetries: 2 };
  async execute(context: CompleteContext) {
    const customer = context.workflow.customer;
    if (!customer) throw new Error("Customer not found in context");
    
    // Simulate validation logic
    const isPremium = customer.tier === 'Premium';
    
    // Save to step context to prove contextual isolation works
    context.step.validated = true;
    
    return { isValid: true, isPremium };
  }
}

class SendWelcomePackageStep implements WorkflowStep {
  descriptor: StepDescriptor = { id: 'send_welcome', name: 'Send Welcome Package', version: '1.0', retryable: true };
  async execute(context: CompleteContext) {
    // Execution context is ephemeral
    console.log(`[SendWelcomePackageStep] Executing at ${context.execution.startTime}`);
    return { sent: true, packageType: 'premium' };
  }
}

class SendStandardEmailStep implements WorkflowStep {
  descriptor: StepDescriptor = { id: 'send_standard', name: 'Send Standard Email', version: '1.0', retryable: true };
  async execute(context: CompleteContext) {
    console.log(`[SendStandardEmailStep] Executing at ${context.execution.startTime}`);
    return { sent: true, packageType: 'standard' };
  }
}

class FlakyStep implements WorkflowStep {
  descriptor: StepDescriptor = { id: 'flaky_step', name: 'Flaky Step', version: '1.0', retryable: true, maxRetries: 3 };
  async execute(context: CompleteContext) {
    if (context.execution.attempt < 3) {
      throw new Error(`Flaky network error on attempt ${context.execution.attempt}`);
    }
    return { success: true, message: "Finally succeeded" };
  }
}

class AlwaysFailStep implements WorkflowStep {
  descriptor: StepDescriptor = { id: 'always_fail', name: 'Always Fail Step', version: '1.0', retryable: true, maxRetries: 2 };
  async execute(context: CompleteContext) {
    throw new Error(`Catastrophic failure on attempt ${context.execution.attempt}`);
  }
}

class CompensationStep implements WorkflowStep {
  descriptor: StepDescriptor = { id: 'compensation', name: 'Compensation Action', version: '1.0', retryable: false };
  async execute(context: CompleteContext) {
    console.log(`[CompensationStep] Reverting previous actions due to failure.`);
    return { compensated: true };
  }
}

// ==========================================
// WORKFLOW DEFINITIONS
// ==========================================

const customerWorkflowDef: WorkflowDefinition = {
  id: 'wf_customer_onboarding',
  name: 'Customer Onboarding Workflow',
  initialStepId: 'validate_customer',
  steps: {
    'validate_customer': new ValidateCustomerStep().descriptor,
    'send_welcome': new SendWelcomePackageStep().descriptor,
    'send_standard': new SendStandardEmailStep().descriptor,
  },
  transitions: {
    'validate_customer': [
      {
        targetStepId: 'send_welcome',
        priority: 10,
        condition: (ctx, result) => result.isPremium === true,
      },
      {
        targetStepId: 'send_standard',
        priority: 5, // Lower priority, acts as fallback/default if not premium
        isDefaultPath: true,
      }
    ]
  }
};

const errorValidationWorkflowDef: WorkflowDefinition = {
  id: 'wf_error_validation',
  name: 'Error Handling Validation Workflow',
  initialStepId: 'flaky_step',
  steps: {
    'flaky_step': new FlakyStep().descriptor,
    'always_fail': new AlwaysFailStep().descriptor,
    'compensation': new CompensationStep().descriptor,
  },
  transitions: {
    'flaky_step': [
      {
        targetStepId: 'always_fail',
        priority: 10,
        isDefaultPath: true,
      }
    ],
    'always_fail': [
      {
        targetStepId: 'compensation',
        priority: 10,
        isErrorPath: true, // This is explicitly an error path
      }
    ]
  }
};

// ==========================================
// RUNNER
// ==========================================

async function run() {
  const engine = new WorkflowEngine({ environment: 'test' });
  
  // Register all steps
  engine.registerStep(new ValidateCustomerStep());
  engine.registerStep(new SendWelcomePackageStep());
  engine.registerStep(new SendStandardEmailStep());
  engine.registerStep(new FlakyStep());
  engine.registerStep(new AlwaysFailStep());
  engine.registerStep(new CompensationStep());

  console.log("==========================================");
  console.log("SCENARIO A1: Premium Customer Onboarding");
  console.log("==========================================");
  
  const premiumInstance: WorkflowInstance = {
    id: 'inst_1',
    definitionId: customerWorkflowDef.id,
    currentState: 'Created',
    currentStepId: null,
    workflowContext: { customer: { id: 1, tier: 'Premium' } },
    stepContexts: {}
  };
  
  const res1 = await engine.run(customerWorkflowDef, premiumInstance);
  console.log(`Final State: ${res1.currentState}`);
  
  console.log("\n==========================================");
  console.log("SCENARIO A2: Standard Customer Onboarding");
  console.log("==========================================");
  
  const standardInstance: WorkflowInstance = {
    id: 'inst_2',
    definitionId: customerWorkflowDef.id,
    currentState: 'Created',
    currentStepId: null,
    workflowContext: { customer: { id: 2, tier: 'Standard' } },
    stepContexts: {}
  };
  
  const res2 = await engine.run(customerWorkflowDef, standardInstance);
  console.log(`Final State: ${res2.currentState}`);

  console.log("\n==========================================");
  console.log("SCENARIO B: Error Handling & Retry Validation");
  console.log("==========================================");
  
  const errorInstance: WorkflowInstance = {
    id: 'inst_3',
    definitionId: errorValidationWorkflowDef.id,
    currentState: 'Created',
    currentStepId: null,
    workflowContext: {},
    stepContexts: {}
  };
  
  const res3 = await engine.run(errorValidationWorkflowDef, errorInstance);
  console.log(`Final State: ${res3.currentState}`);
}

run().catch(console.error);
