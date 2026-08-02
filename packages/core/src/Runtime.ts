import { EventBus, RuntimeEvent } from './events/EventBus';
import { EventBusAdapter } from './events/adapters/EventBusAdapter';
import { InMemoryAdapter } from './events/adapters/InMemoryAdapter';
import { Agent } from './agent/Agent';
import { Pipeline } from './pipeline/Pipeline';
import { RuntimePlugin, RuntimeProvider, RuntimeAdapter } from './plugins/Types';
import { AIProvider } from './providers/AIProvider'; // Keeping for backward compatibility if needed, but it should technically be a RuntimeProvider

export class Runtime {
  private bus: EventBus;
  private agents: Agent[] = [];
  private pipelines: Map<string, Pipeline> = new Map();
  private isRunning: boolean = false;
  
  private plugins: RuntimePlugin[] = [];
  private providers: Map<string, RuntimeProvider> = new Map();
  private adapters: Map<string, RuntimeAdapter> = new Map();

  constructor() {
    // EventBus will be lazily initialized or re-initialized if a plugin registers an adapter
    this.bus = new EventBus(new InMemoryAdapter());
  }

  /**
   * Registers a plugin and triggers its onRegister hook.
   */
  public use(plugin: RuntimePlugin): this {
    this.plugins.push(plugin);
    if (plugin.onRegister) {
      plugin.onRegister(this); // Can be async, but for builder pattern we fire-and-forget or require users to await a setup phase.
      // Better: we aggregate them in a boot phase. Let's make it sync for registration, or handle it during start().
    }
    return this;
  }

  // Capability Registry Methods
  public registerProvider(token: string, provider: RuntimeProvider): this {
    this.providers.set(token, provider);
    return this;
  }

  public getProvider<T extends RuntimeProvider>(token: string): T {
    const provider = this.providers.get(token);
    if (!provider) throw new Error(`Provider [${token}] not found`);
    return provider as T;
  }

  public registerAdapter(token: string, adapter: RuntimeAdapter): this {
    this.adapters.set(token, adapter);
    
    // Auto-wire EventBus if an EventBusAdapter is registered
    if (token === 'EventBusAdapter') {
      this.bus = new EventBus(adapter as unknown as EventBusAdapter);
    }
    
    return this;
  }

  public getAdapter<T extends RuntimeAdapter>(token: string): T {
    const adapter = this.adapters.get(token);
    if (!adapter) throw new Error(`Adapter [${token}] not found`);
    return adapter as T;
  }

  public register(agent: Agent): this {
    this.agents.push(agent);
    return this;
  }

  public registerPipeline(eventName: string, pipeline: Pipeline): this {
    this.pipelines.set(eventName, pipeline);
    return this;
  }

  public async start(): Promise<void> {
    if (this.isRunning) return;

    // Phase 1: Boot
    for (const plugin of this.plugins) {
      if (plugin.onBoot) await plugin.onBoot(this);
    }

    // Connect Event Bus Adapter
    await this.bus.connect();

    // Phase 2: Ready
    for (const plugin of this.plugins) {
      if (plugin.onReady) await plugin.onReady(this);
    }

    // Initialize all agents (Passing bus and runtime)
    for (const agent of this.agents) {
      // Temporary compatibility: if agent needs AIProvider, it can try to fetch it from runtime.
      agent.initialize(this.bus, this);
    }

    // Hook pipelines to the Event Bus
    for (const [eventName, pipeline] of this.pipelines.entries()) {
      this.bus.subscribe(eventName, async (event: RuntimeEvent) => {
        await pipeline.execute(event);
      });
    }

    this.isRunning = true;
    console.log('[Runtime] Started successfully.');
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) return;
    
    // Phase 3: Shutdown
    for (const plugin of this.plugins) {
      if (plugin.onShutdown) await plugin.onShutdown(this);
    }

    await this.bus.disconnect();
    this.isRunning = false;
    console.log('[Runtime] Stopped successfully.');
  }

  public async publish(event: RuntimeEvent): Promise<void> {
    await this.bus.publish(event);
  }
}


