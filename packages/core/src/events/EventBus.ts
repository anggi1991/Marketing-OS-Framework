import { EventBusAdapter } from './adapters/EventBusAdapter';

export interface RuntimeEvent<T = any> {
  id?: string;
  name: string;
  timestamp?: number;
  metadata?: Record<string, any>;
  payload: T;
}

export type EventHandler = (event: RuntimeEvent) => Promise<void> | void;

export class EventBus {
  private adapter: EventBusAdapter;

  constructor(adapter: EventBusAdapter) {
    this.adapter = adapter;
  }

  public async connect(): Promise<void> {
    await this.adapter.connect();
  }

  public async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  public subscribe(eventName: string, handler: EventHandler): void {
    this.adapter.subscribe(eventName, handler);
  }

  public async publish(event: RuntimeEvent): Promise<void> {
    const enrichedEvent: RuntimeEvent = {
      ...event,
      id: event.id || Math.random().toString(36).substring(2, 9),
      timestamp: event.timestamp || Date.now(),
    };

    await this.adapter.publish(enrichedEvent);
  }
}


