import { RuntimeEvent } from '../events/EventBus';

export type PipelineStep = (event: RuntimeEvent) => Promise<RuntimeEvent>;

export class Pipeline {
  private steps: PipelineStep[] = [];

  /**
   * Adds a step to the pipeline.
   */
  public pipe(step: PipelineStep): this {
    this.steps.push(step);
    return this;
  }

  /**
   * Executes the pipeline steps sequentially for a given event.
   */
  public async execute(event: RuntimeEvent): Promise<RuntimeEvent> {
    let currentEvent = event;
    for (const step of this.steps) {
      currentEvent = await step(currentEvent);
    }
    return currentEvent;
  }
}
