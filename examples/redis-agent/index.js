"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@agent-runtime/core");
const plugin_redis_1 = require("@agent-runtime/plugin-redis");
// Configure the runtime
const runtime = new core_1.Runtime();
// Use the Redis plugin to hook the distributed EventBus adapter
runtime.use(new plugin_redis_1.RedisPlugin({
    host: "127.0.0.1",
    port: 6379,
}));
/**
 * Node 1: A service that listens for orders.
 */
class OrderFulfillmentAgent extends core_1.Agent {
    onStart() {
        this.bus.subscribe("order.created", async (event) => {
            console.log(`[OrderFulfillmentAgent] Processing order for ${event.payload.email}`);
            // Simulate processing
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.bus.publish({
                type: "order.shipped",
                payload: { orderId: event.payload.orderId, trackingNumber: "TRK12345" }
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
            type: "order.created",
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
