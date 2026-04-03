# Nest-AI-adaptive-video-stream

## Summary

- Sensor Layer (Frontend): A React component using useRef to manage the hls.js instance without triggering unnecessary re-renders, emitting metrics like bufferLength, bandwidth, and latency.

- Ingestion Layer (Backend): A NestJS Gateway that receives metrics and applies a gate of 15–30 seconds to stay within the 15 RPM limit of the Gemini free tier.

- Orchestration Layer (LangGraph): A stateful graph that maintains a sliding window (History) of the last 5 metrics to identify negative health trends.

- Actuator Logic: A deterministic node that translates AI reasoning into actionable player commands like TUNE_ABR to prevent a Stall.

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
