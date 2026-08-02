# Roadmap (Product Features)

Dokumen ini menjelaskan evolusi **fitur** dari framework `@agent-runtime/core` (apa yang dibangun). Untuk melihat kematangan kualitas proyek *open-source*, silakan lihat `OPEN_SOURCE_READINESS.md`.

## [v0.1] - Foundation
- [x] In-memory `EventBus` pub/sub engine.
- [x] Abstract `Agent` class for autonomous workers.
- [x] Sequential `Pipeline` processing.
- [x] Unified `Runtime` entry point.

## [v0.2] - Architecture (Current)
- [x] Plugin SDK & Lifecycle.
- [x] Provider API (Agnostic interfaces).
- [x] Adapter API (Infrastructure replacement).
- [x] Capability Registry (IoC / Dependency Injection).
- [x] Monorepo & Workspaces.

## [v0.3] - Messaging
- [ ] RabbitMQ Adapter.
- [ ] Retry Mechanism (Exponential Backoff).
- [ ] Dead-Letter Queues (DLQ) support.

## [v0.4] - Workflow
- [ ] Workflow DSL (JSON/YAML based).
- [ ] State Machine Execution.
- [ ] Human Approval / Human-in-the-loop steps.

## [v0.5] - Distributed Runtime
- [ ] Multi-Node execution.
- [ ] Agent Discovery.
- [ ] Distributed Task Scheduler.

## [v0.6] - Ecosystem
- [ ] `@agent-runtime/plugin-openai`
- [ ] `@agent-runtime/plugin-anthropic`
- [ ] `@agent-runtime/plugin-gemini`
- [ ] `@agent-runtime/plugin-kafka`
- [ ] `@agent-runtime/plugin-redis` (Stable)
- [ ] Persistence Providers (PostgreSQL, MongoDB).

## [v1.0] - Stable
- [ ] Production-ready API freeze.
