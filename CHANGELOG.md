# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-02
### Added
- Initial release of the `@agent-runtime/core` AI Workflow Runtime.
- Abstract `Runtime` engine as the primary entry point.
- Generic `EventBus` for pub/sub messaging.
- `AIProvider` interface to support LLMs (OpenAI, Anthropic, Gemini, etc.).
- `Agent` base class for building autonomous workflows.
- `Pipeline` implementation for sequential event processing.
- `basic-agent` example demonstrating a complete lead scoring workflow.
- GitHub Actions CI pipeline for linting and testing.
