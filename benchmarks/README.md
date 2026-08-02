# Agent Runtime Benchmarks

This directory contains scripts used to benchmark the performance and memory footprint of the `@agent-runtime/core` framework and its plugins.

## Environment Details
When running these benchmarks or sharing results, please provide the environment context as hardware and runtime conditions heavily influence the metrics.

- **Node.js Version**: (e.g., v20.10.0)
- **OS**: (e.g., Ubuntu 22.04, Windows 11)
- **CPU**: (e.g., Apple M2, Intel i7-12700H)
- **RAM**: (e.g., 16GB, 32GB)

## Running Benchmarks

Before running benchmarks, ensure all packages are built:
```bash
npm run build --workspaces
```

### 1. Performance Benchmark
The performance benchmark measures throughput (operations per second) for internal framework components and external adapters.

**Command**:
```bash
npm run ts-node benchmarks/performance.ts
```

**Metrics Explained**:
- **Framework - Event Publish**: Latency of instantiating and publishing a raw event to a NOOP adapter.
- **Framework - Event Dispatch**: Latency of routing an event to a registered `EventHandler`.
- **Adapter - InMemory**: Latency of publishing and subscribing within the native Node.js process using memory.
- **Adapter - Redis**: Latency of network calls + serialization via Redis Pub/Sub. *(Requires local Redis instance on port 6379)*
- **Adapter - RabbitMQ**: Latency of network calls + AMQP protocol via RabbitMQ. *(Requires local RabbitMQ instance on port 5672)*

### 2. Memory Benchmark
The memory benchmark monitors the garbage collector's ability to reclaim memory after processing a massive number of events (1,000,000 events), identifying potential memory leaks.

**Command**:
```bash
npm run ts-node benchmarks/memory.ts
```

**Metrics Explained**:
- **0 Subscribers**: Verifies if raw publishing without listeners leaks memory.
- **100 Subscribers**: Verifies if the event bus routing logic leaks memory when fanning out to multiple handlers.
- **Heap Used**: The amount of memory actively held in the V8 heap (in MB). A significant spike after GC indicates a leak.
