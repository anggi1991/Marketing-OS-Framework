export type WorkflowState =
  | 'Created'
  | 'Queued'
  | 'Running'
  | 'Waiting'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

// Context Hierarchy
export interface GlobalContext {
  [key: string]: any;
}

export interface WorkflowContext {
  [key: string]: any;
}

export interface StepContext {
  [key: string]: any;
}

export interface ExecutionContext {
  stepId: string;
  attempt: number;
  [key: string]: any;
}

export interface CompleteContext {
  global: GlobalContext;
  workflow: WorkflowContext;
  step: StepContext;
  execution: ExecutionContext;
}

// Step Contract
export interface StepDescriptor {
  id: string;
  name: string;
  version: string;
  retryable: boolean;
  maxRetries?: number;
}

export interface WorkflowStep {
  descriptor: StepDescriptor;
  /**
   * AD-0001: Runtime does not know what is inside execute.
   * execute() MUST return output or throw Error.
   * Retry logic is handled outside this step.
   */
  execute(context: CompleteContext): Promise<any>;
}

// Transition
export interface Transition {
  targetStepId: string;
  priority: number;
  condition?: (context: CompleteContext, stepResult: any) => boolean;
  guard?: (context: CompleteContext) => boolean;
  isErrorPath?: boolean;
  isDefaultPath?: boolean;
}

// Definition vs Instance
export interface WorkflowDefinition {
  id: string;
  name: string;
  initialStepId: string;
  steps: Record<string, StepDescriptor>;
  transitions: Record<string, Transition[]>; // Key: sourceStepId
}

export interface WorkflowInstance {
  id: string;
  definitionId: string;
  currentState: WorkflowState;
  currentStepId: string | null;
  workflowContext: WorkflowContext;
  stepContexts: Record<string, StepContext>;
}
