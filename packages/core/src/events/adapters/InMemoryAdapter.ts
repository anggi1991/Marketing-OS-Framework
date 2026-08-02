import { RuntimeEvent, EventHandler } from '../EventBus';
import { EventBusAdapter } from './EventBusAdapter';

export class InMemoryAdapter implements EventBusAdapter {
  private handlers: Map<string, EventHandler[]> = new Map();

  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {
    this.handlers.clear();
  }

  subscribe(eventName: string, handler: EventHandler): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)?.push(handler);
  }

  async publish(event: RuntimeEvent): Promise<void> {
    const typeHandlers = this.handlers.get(event.name) || [];
    const wildcardHandlers = this.handlers.get('*') || [];

    const allHandlers = [...typeHandlers, ...wildcardHandlers];

    await Promise.all(allHandlers.map(handler => handler(event)));
  }
}
