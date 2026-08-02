import Redis, { RedisOptions } from 'ioredis';
import { LuminaEvent, EventHandler } from '../EventBus';
import { EventBusAdapter } from './EventBusAdapter';

export class RedisAdapter implements EventBusAdapter {
  private pubClient: Redis;
  private subClient: Redis;
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(options?: RedisOptions) {
    this.pubClient = new Redis(options || {});
    this.subClient = new Redis(options || {});
  }

  async connect(): Promise<void> {
    // ioredis connects automatically, but we set up the message listener here.
    this.subClient.on('message', async (channel, message) => {
      try {
        const event: LuminaEvent = JSON.parse(message);
        
        const typeHandlers = this.handlers.get(event.type) || [];
        const wildcardHandlers = this.handlers.get('*') || [];
        const allHandlers = [...typeHandlers, ...wildcardHandlers];

        await Promise.all(allHandlers.map(handler => handler(event)));
      } catch (err) {
        console.error('[RedisAdapter] Error processing message:', err);
      }
    });
  }

  async disconnect(): Promise<void> {
    this.subClient.removeAllListeners('message');
    await Promise.all([this.pubClient.quit(), this.subClient.quit()]);
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
      // Tell Redis to subscribe to this channel (event type)
      this.subClient.subscribe(eventType).catch(err => {
        console.error(`[RedisAdapter] Failed to subscribe to channel ${eventType}:`, err);
      });
    }
    this.handlers.get(eventType)?.push(handler);
  }

  async publish(event: LuminaEvent): Promise<void> {
    const message = JSON.stringify(event);
    // Publish to the specific event type channel
    await this.pubClient.publish(event.type, message);
    
    // Also publish to the wildcard channel for listeners observing all events
    await this.pubClient.publish('*', message);
  }
}
