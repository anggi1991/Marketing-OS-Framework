import { Runtime } from '../Runtime';

/**
 * Represents external services or logic (e.g., AI Providers, Database Clients)
 */
export interface RuntimeProvider {
  name: string;
}

/**
 * Represents an implementation for an internal Framework interface (e.g., EventBusAdapter)
 */
export interface RuntimeAdapter {
  name: string;
}

/**
 * Plugins extend the capability of the Runtime.
 */
export interface RuntimePlugin {
  name: string;
  
  /**
   * Called immediately when `runtime.use()` is invoked.
   * Ideal for registering providers and adapters.
   */
  onRegister?: (runtime: Runtime) => void | Promise<void>;

  /**
   * Called during `runtime.start()`.
   * Ideal for initializing internal state.
   */
  onBoot?: (runtime: Runtime) => void | Promise<void>;

  /**
   * Called after all plugins have booted.
   * Safe to interact with other registered plugins, providers, and adapters.
   */
  onReady?: (runtime: Runtime) => void | Promise<void>;

  /**
   * Called during `runtime.stop()`.
   * Cleanup logic.
   */
  onShutdown?: (runtime: Runtime) => void | Promise<void>;
}
