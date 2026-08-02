import { EventBus, LuminaEvent } from './events/EventBus';
import { EventBusAdapter } from './events/adapters/EventBusAdapter';
import { InMemoryAdapter } from './events/adapters/InMemoryAdapter';
import { Agent } from './agent/Agent';
import { AIProvider } from './providers/AIProvider';
import { Pipeline } from './pipeline/Pipeline';

export interface RuntimeOptions {
  eventBusAdapter?: EventBusAdapter;
}

export class Runtime {
  private bus: EventBus;
  private aiProvider: AIProvider | null = null;
  private agents: Agent[] = [];
  private pipelines: Map<string, Pipeline> = new Map();
  private isRunning: boolean = false;

  constructor(options?: RuntimeOptions) {
    const adapter = options?.eventBusAdapter || new InMemoryAdapter();
    this.bus = new EventBus(adapter);
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
  public async start(): Promise<void> {
    if (this.isRunning) return;

    if (!this.aiProvider) {
      console.warn('[Runtime] Starting without an AI Provider configured.');
    }

    // Connect the underlying event bus adapter
    await this.bus.connect();

    // Initialize all agents
    for (const agent of this.agents) {
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
    console.log('[Runtime] Started successfully.');
  }

  /**
   * Stops the runtime and disconnects adapters.
   */
  public async stop(): Promise<void> {
    if (!this.isRunning) return;
    await this.bus.disconnect();
    this.isRunning = false;
    console.log('[Runtime] Stopped successfully.');
  }

  /**
   * Publishes an event to the runtime's event bus.
   */
  public async publish(event: LuminaEvent): Promise<void> {
    await this.bus.publish(event);
  }
}

