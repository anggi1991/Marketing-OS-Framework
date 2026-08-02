import { EventBus, LuminaEvent } from './events/EventBus';
import { Agent } from './agent/Agent';
import { AIProvider } from './providers/AIProvider';
import { Pipeline } from './pipeline/Pipeline';

export class Runtime {
  private bus: EventBus;
  private aiProvider: AIProvider | null = null;
  private agents: Agent[] = [];
  private pipelines: Map<string, Pipeline> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.bus = new EventBus();
  }

  /**
   * Configures the AI Provider for the runtime.
   */
  public use(provider: AIProvider): this {
    this.aiProvider = provider;
    return this;
  }

  /**
   * Registers an agent to the runtime.
   */
  public register(agent: Agent): this {
    this.agents.push(agent);
    return this;
  }

  /**
   * Registers a pipeline for a specific event type.
   */
  public registerPipeline(eventType: string, pipeline: Pipeline): this {
    this.pipelines.set(eventType, pipeline);
    return this;
  }

  /**
   * Starts the runtime, initializing all agents and pipelines.
   */
  public start(): void {
    if (this.isRunning) return;

    if (!this.aiProvider) {
      console.warn('[Lumina Runtime] Starting without an AI Provider configured.');
    }

    // Initialize all agents
    for (const agent of this.agents) {
      // Create a dummy provider if none exists, just to prevent crashes
      // In a real scenario, this might throw an error if AI is mandatory for the agent.
      const provider = this.aiProvider || ({} as AIProvider);
      agent.initialize(this.bus, provider);
    }

    // Hook pipelines to the Event Bus
    for (const [eventType, pipeline] of this.pipelines.entries()) {
      this.bus.subscribe(eventType, async (event: LuminaEvent) => {
        await pipeline.execute(event);
      });
    }

    this.isRunning = true;
    console.log('[Lumina Runtime] Started successfully.');
  }

  /**
   * Publishes an event to the runtime's event bus.
   */
  public async publish(event: LuminaEvent): Promise<void> {
    await this.bus.publish(event);
  }
}
