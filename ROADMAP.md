# Roadmap

This document outlines the high-level goals and upcoming features for the **Agent Runtime Core** framework. Our goal is to build a robust, distributed AI Workflow Runtime.

## [v0.1.0] - Foundation (Current)
- [x] In-memory `EventBus` pub/sub engine.
- [x] Abstract `Agent` class for autonomous workers.
- [x] Sequential `Pipeline` processing.
- [x] `AIProvider` interface (agnostic to OpenAI/Anthropic/Gemini).
- [x] Unified `Runtime` entry point.

## [v0.2.0] - Scalability
- [ ] Redis-backed distributed `EventBus`.
- [ ] Persistent event logging and observability hooks.

## [v0.3.0] - Enterprise Messaging
- [ ] RabbitMQ integration for high-throughput event queues.
- [ ] Dead-letter queues and retry mechanisms.

## [v0.4.0] - Extensibility
- [ ] Official Plugin SDK for custom connectors.
- [ ] Provider packages (`@agent-runtime/openai`, `@agent-runtime/anthropic`).

## [v0.5.0] - Orchestration
- [ ] Stateful Workflow Engine (DAG execution).
- [ ] Human-in-the-loop (Approval) steps.

## [v0.6.0] - Distributed Systems
- [ ] Distributed Runtime (multi-node agent execution).
- [ ] Agent registry and discovery.

## [v1.0.0] - Stable
- [ ] Production-ready API freeze.
- [ ] Comprehensive documentation and community examples.

*Note: The roadmap is subject to change based on community feedback and contributions.*
