import { LuminaEvent } from '../events/EventBus';

export type PipelineStep = (event: LuminaEvent, context: Record<string, any>) => Promise<void> | void;

export class Pipeline {
  private steps: PipelineStep[] = [];

  /**
   * Adds a step to the pipeline.
   */
  public addStep(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Executes the pipeline steps sequentially for a given event.
   */
  public async execute(event: LuminaEvent): Promise<Record<string, any>> {
    const context: Record<string, any> = {};
    for (const step of this.steps) {
      await step(event, context);
    }
    return context;
  }
}
