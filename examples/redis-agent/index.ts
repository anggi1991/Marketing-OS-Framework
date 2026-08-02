import { Runtime, Agent } from "@agent-runtime/core";
import { RedisPlugin } from "@agent-runtime/plugin-redis";

// Configure the runtime
const runtime = new Runtime();

// Use the Redis plugin to hook the distributed EventBus adapter
runtime.use(new RedisPlugin({
  host: "127.0.0.1",
  port: 6379,
}));


/**
 * Node 1: A service that listens for orders.
 */
class OrderFulfillmentAgent extends Agent {
  protected onStart(): void {
    this.bus.subscribe("order.created", async (event) => {
      console.log(`[OrderFulfillmentAgent] Processing order for ${event.payload.email}`);
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.bus.publish({
        name: "order.processed",
        payload: { ...event.payload, status: "PROCESSED" },
      });
    });
  }
}

runtime.register(new OrderFulfillmentAgent());

async function run() {
  await runtime.start();

  console.log("Redis Agent Runtime Started.");
  console.log("Waiting for events (or publishing our own test event)...");

  // Node 2: Another service (or the same one) publishes an event
  setTimeout(() => {
    console.log("Publishing 'order.created' event to Redis...");
    runtime.publish({
      name: "order.created",
      payload: { email: "customer@example.com", orderId: "ORD-999" }
    });
  }, 2000);

  // Graceful shutdown after a while to stop the test
  setTimeout(async () => {
    console.log("Shutting down runtime...");
    await runtime.stop();
    process.exit(0);
  }, 5000);
}

run();
