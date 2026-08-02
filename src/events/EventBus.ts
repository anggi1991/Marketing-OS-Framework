export interface LuminaEvent<T = any> {
  id?: string;
  type: string;
  timestamp?: number;
  payload: T;
  correlationId?: string;
}

export type EventHandler = (event: LuminaEvent) => Promise<void> | void;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribe to a specific event type.
   */
  public subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
  }

  /**
   * Publish an event to the bus.
   */
  public async publish(event: LuminaEvent): Promise<void> {
    const enrichedEvent: LuminaEvent = {
      ...event,
      id: event.id || Math.random().toString(36).substring(2, 9),
      timestamp: event.timestamp || Date.now(),
    };

    const typeHandlers = this.handlers.get(event.type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];

    const allHandlers = [...typeHandlers, ...wildcardHandlers];

    await Promise.all(allHandlers.map(handler => handler(enrichedEvent)));
  }
}
