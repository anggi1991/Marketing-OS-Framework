import { LuminaEvent, EventHandler } from '../EventBus';

export interface EventBusAdapter {
  /**
   * Initializes the adapter (e.g., connecting to Redis).
   */
  connect(): Promise<void>;

  /**
   * Disconnects the adapter cleanly.
   */
  disconnect(): Promise<void>;

  /**
   * Subscribes a handler to a specific event type.
   */
  subscribe(eventType: string, handler: EventHandler): void;

  /**
   * Publishes an event to the underlying messaging system.
   */
  publish(event: LuminaEvent): Promise<void>;
}
