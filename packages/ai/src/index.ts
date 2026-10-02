/**
 * @platform/ai - AI Abstraction, Orchestrator, and Provider Layer
 */

export const AI_LAYER_VERSION = '0.1.0';

// Provider Interfaces & Types
export * from './providers/ai-provider.interface.js';
export * from './providers/gemini/gemini-turn-adapter.js';
export * from './providers/gemini/gemini-provider.js';
export * from './providers/provider-factory.js';

// Orchestrator Components
export * from './orchestrator/prompt-builder.js';
export * from './orchestrator/context-manager.js';
export * from './orchestrator/model-selector.js';
export * from './orchestrator/ai-orchestrator.js';

// Security & Prompt Guard
export * from './security/index.js';
