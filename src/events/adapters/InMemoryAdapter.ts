import { LuminaEvent, EventHandler } from '../EventBus';
import { EventBusAdapter } from './EventBusAdapter';

export class InMemoryAdapter implements EventBusAdapter {
  private handlers: Map<string, EventHandler[]> = new Map();

  async connect(): Promise<void> {
    // In-memory doesn't require connection
  }

  async disconnect(): Promise<void> {
    this.handlers.clear();
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  async publish(event: LuminaEvent): Promise<void> {
    const typeHandlers = this.handlers.get(event.type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];

    const allHandlers = [...typeHandlers, ...wildcardHandlers];

    await Promise.all(allHandlers.map(handler => handler(event)));
  }
}
