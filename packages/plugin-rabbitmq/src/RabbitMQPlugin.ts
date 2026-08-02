import { Runtime, RuntimePlugin, RetryPolicy, NoRetryPolicy } from '@agent-runtime/core';
import { RabbitMQEventBusAdapter, RabbitMQOptions } from './RabbitMQEventBusAdapter';

export interface RabbitMQPluginOptions extends RabbitMQOptions {
  retryPolicy?: RetryPolicy;
}

export class RabbitMQPlugin implements RuntimePlugin {
  name = 'RabbitMQPlugin';
  
  private adapter: RabbitMQEventBusAdapter;

  constructor(options: RabbitMQPluginOptions) {
    const retryPolicy = options.retryPolicy || new NoRetryPolicy();
    this.adapter = new RabbitMQEventBusAdapter(options, retryPolicy);
  }

  onRegister(runtime: Runtime): void {
    runtime.registerAdapter('EventBusAdapter', this.adapter);
  }
}
