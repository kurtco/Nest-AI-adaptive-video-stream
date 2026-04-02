# Nest-AI-adaptive-video-stream

## Summary

**Nest-AI-adaptive-video-stream** is a high-performance, closed-loop video orchestration engine designed to maximize Quality of Experience (QoE) and protect advertising inventory (SSAI/CSAI). The system bridges real-time HLS.js telemetry with a deterministic AI agent (LangGraph) to autonomously diagnose and mitigate network or media delivery failures in real-time.

## Architecture

- **Frontend:** React + HLS.js Custom Wrapper for high-frequency telemetry emission.
- **Backend:** NestJS WebSocket Gateway for metric ingestion and aggregation.
- **AI Orchestration:** LangGraph + Gemini-powered state machine for real-time diagnostic workflows.
- **Delivery:** HLS (Adaptive Bitrate Streaming) with dynamic configuration injection.

## Changes

- **Edge Telemetry:** Implementation of a custom HLS.js observer for buffer and network event monitoring.
- **Telemetry Gateway:** NestJS engine for real-time ingestion of vital playback metrics.
- **AI Diagnostic Agent:** LangGraph orchestration to differentiate between CDN failures and Ad-server stalls.
- **Dynamic Tuning:** Real-time injection of HLS.js configuration overrides (ABR logic) via WebSockets.
