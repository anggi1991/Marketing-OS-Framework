import { EventBus, LuminaEvent } from '../events/EventBus';
import { AIProvider } from '../providers/AIProvider';

export abstract class Agent {
  protected bus!: EventBus;
  protected ai!: AIProvider;

  /**
   * Called internally by the Runtime when the agent is registered.
   */
  public initialize(bus: EventBus, ai: AIProvider): void {
    this.bus = bus;
    this.ai = ai;
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
