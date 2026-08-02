import { Runtime, RuntimePlugin, RuntimeAdapter, RuntimeEvent, EventHandler } from '@agent-runtime/core';
import Redis, { RedisOptions } from 'ioredis';

/**
 * The Adapter implementation for Redis EventBus.
 */
export class RedisEventBusAdapter implements RuntimeAdapter {
  name = 'EventBusAdapter'; // This token maps it to EventBus inside Runtime
  
  private pubClient: Redis;
  private subClient: Redis;
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(options?: RedisOptions) {
    this.pubClient = new Redis(options || {});
    this.subClient = new Redis(options || {});
  }

  async connect(): Promise<void> {
    this.subClient.on('message', async (channel, message) => {
      try {
        const event: RuntimeEvent = JSON.parse(message);
        
        const typeHandlers = this.handlers.get(event.name) || [];
        const wildcardHandlers = this.handlers.get('*') || [];
        const allHandlers = [...typeHandlers, ...wildcardHandlers];

        await Promise.all(allHandlers.map(handler => handler(event)));
      } catch (err) {
        console.error('[RedisEventBusAdapter] Error processing message:', err);
      }
    });
  }

  async disconnect(): Promise<void> {
    this.subClient.removeAllListeners('message');
    await Promise.all([this.pubClient.quit(), this.subClient.quit()]);
  }

  subscribe(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
      this.subClient.subscribe(eventName).catch(err => {
        console.error(`[RedisEventBusAdapter] Failed to subscribe to channel ${eventName}:`, err);
      });
    }
    this.handlers.get(eventName)?.push(handler);
  }

  async publish(event: RuntimeEvent): Promise<void> {
    const message = JSON.stringify(event);
    await this.pubClient.publish(event.name, message);
    await this.pubClient.publish('*', message);
  }
}

/**
 * The Plugin that registers the RedisAdapter into the Runtime.
 */
export class RedisPlugin implements RuntimePlugin {
  name = 'RedisPlugin';
  private options?: RedisOptions;

  constructor(options?: RedisOptions) {
    this.options = options;
  }

  onRegister(runtime: Runtime): void {
    // We register the adapter. The Runtime will auto-wire it if it matches 'EventBusAdapter'
    runtime.registerAdapter('EventBusAdapter', new RedisEventBusAdapter(this.options));
    console.log('[RedisPlugin] Registered RedisEventBusAdapter');
  }
}
