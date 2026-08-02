export interface LuminaEvent<T = any> {
  id?: string;
  type: string;
  timestamp?: number;
  payload: T;
  correlationId?: string;
}

export type EventHandler = (event: LuminaEvent) => Promise<void> | void;

import { EventBusAdapter } from './adapters/EventBusAdapter';

export class EventBus {
  private adapter: EventBusAdapter;

  constructor(adapter: EventBusAdapter) {
    this.adapter = adapter;
  }

  /**
   * Initializes the event bus connection.
   */
  public async connect(): Promise<void> {
    await this.adapter.connect();
  }

  /**
   * Closes the event bus connection.
   */
  public async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  /**
   * Subscribe to a specific event type.
   */
  public subscribe(eventType: string, handler: EventHandler): void {
    this.adapter.subscribe(eventType, handler);
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

    await this.adapter.publish(enrichedEvent);
  }
}

