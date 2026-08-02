import { EventBus } from '../events/EventBus';
import { Runtime } from '../Runtime';

export abstract class Agent {
  protected bus!: EventBus;
  protected runtime!: Runtime;

  /**
   * Initializes the agent with the event bus and runtime.
   * This is called automatically by the Runtime.
   */
  public initialize(bus: EventBus, runtime: Runtime): void {
    this.bus = bus;
    this.runtime = runtime;
    this.onStart();
  }

  /**
   * Hook that runs when the agent is registered and initialized.
   * Override this to subscribe to specific events.
   */
  protected onStart(): void {
    // Default implementation does nothing.
    // Example: this.bus.subscribe('some.event', this.handleEvent.bind(this));
  }
}
