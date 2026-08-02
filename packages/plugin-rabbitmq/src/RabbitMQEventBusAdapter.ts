import * as amqp from 'amqplib';
import { EventBusAdapter, RuntimeEvent, EventHandler, RetryPolicy } from '@agent-runtime/core';

export interface RabbitMQOptions {
  url: string;
  exchangeName: string;
  deadLetter?: boolean;
}

export class RabbitMQEventBusAdapter implements EventBusAdapter {
  name = 'EventBusAdapter';
  private connection: any = null;
  private channel: any = null;
  
  constructor(
    private options: RabbitMQOptions,
    private retryPolicy: RetryPolicy
  ) {}

  public async connect(): Promise<void> {
    this.connection = await amqp.connect(this.options.url);
    this.channel = await this.connection.createChannel();

    // Declare Main Exchange
    await this.channel.assertExchange(this.options.exchangeName, 'topic', { durable: true });

    // Declare Dead Letter Exchange if configured
    if (this.options.deadLetter) {
      const dlx = `${this.options.exchangeName}.dlx`;
      await this.channel.assertExchange(dlx, 'fanout', { durable: true });
      await this.channel.assertQueue(`${this.options.exchangeName}.dlq`, { durable: true });
      await this.channel.bindQueue(`${this.options.exchangeName}.dlq`, dlx, '');
    }

    console.log(`[RabbitMQAdapter] Connected to exchange: ${this.options.exchangeName}`);
  }

  public async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  public subscribe(eventName: string, handler: EventHandler): void {
    if (!this.channel) throw new Error("Channel is not connected.");

    // Create a queue specifically for this event type
    const queueName = `queue_${this.options.exchangeName}_${eventName}`;
    
    // Add DLX arguments if DLQ is enabled
    const queueArgs: any = {};
    if (this.options.deadLetter) {
      queueArgs['x-dead-letter-exchange'] = `${this.options.exchangeName}.dlx`;
    }

    this.channel.assertQueue(queueName, { durable: true, arguments: queueArgs })
      .then(() => {
        // Bind the queue to the exchange with the routing key (eventName)
        return this.channel!.bindQueue(queueName, this.options.exchangeName, eventName);
      })
      .then(() => {
        this.channel!.consume(queueName, async (msg: amqp.ConsumeMessage | null) => {
          if (!msg) return;

          try {
            const eventStr = msg.content.toString();
            const event: RuntimeEvent = JSON.parse(eventStr);

            // Execute handler with Retry Policy wrapper
            await this.retryPolicy.execute(async () => {
              await handler(event);
            });

            // If success, acknowledge the message
            this.channel!.ack(msg);
          } catch (error) {
            console.error(`[RabbitMQAdapter] Handler for ${eventName} failed permanently. NACKing message.`);
            // Reject without requeue -> send to DLX (if configured) or discard
            this.channel!.nack(msg, false, false);
          }
        }, { noAck: false }); // explicit acknowledgment required
      });
  }

  public async publish(event: RuntimeEvent): Promise<void> {
    if (!this.channel) throw new Error("Channel is not connected.");

    const buffer = Buffer.from(JSON.stringify(event));
    this.channel.publish(this.options.exchangeName, event.name, buffer, { persistent: true });
  }
}
