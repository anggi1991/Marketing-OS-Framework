import { RuntimeEvent, EventHandler } from '../EventBus';

export interface EventBusAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
  publish(event: RuntimeEvent): Promise<void>;
}

