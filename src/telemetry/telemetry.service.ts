import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  StateGraph,
  START,
  END,
  Annotation,
  CompiledStateGraph,
} from '@langchain/langgraph';
import { HlsMetricsDto } from './dto/hls-metrics.dto';

/**
 * ORCHESTRATION STATE DEFINITION
 */
const GraphState = Annotation.Root({
  metrics: Annotation<HlsMetricsDto>(),

  // The reducer allows us to maintain a sliding window of telemetry
  history: Annotation<HlsMetricsDto[]>({
    reducer: (prev, next) => {
      const updated = [...(prev || []), ...next];
      return updated.slice(-5);
    },
    default: () => [],
  }),

  analysis: Annotation<string>(),
  decision: Annotation<any>(),
});

// STAFF TIP: Extract both State and Update types from the Root Annotation
type GraphStateType = typeof GraphState.State;
type GraphUpdateType = typeof GraphState.Update; // FIX: This includes OverwriteValue support

@Injectable()
export class TelemetryService implements OnModuleInit {
  private model: ChatGoogleGenerativeAI;

  // FIX: Using GraphUpdateType instead of Partial<GraphStateType>
  private graph: CompiledStateGraph<GraphStateType, GraphUpdateType, string>;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_GENAI_API_KEY');

    if (!apiKey) {
      throw new Error('GOOGLE_GENAI_API_KEY missing in .env');
    }

    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemini-1.5-flash',
      maxOutputTokens: 512,
    });
  }

  onModuleInit() {
    this.initializeGraph();
  }

  /**
   * GRAPH INITIALIZATION:
   * Maps the logic flow for video telemetry analysis.
   */
  private initializeGraph() {
    const workflow = new StateGraph(GraphState)
      .addNode('analyzer', (state: GraphStateType) => this.analyzerNode(state))
      .addNode('actuator', (state: GraphStateType) => this.actuatorNode(state))
      .addEdge(START, 'analyzer')
      .addEdge('analyzer', 'actuator')
      .addEdge('actuator', END);

    // Now the types match perfectly
    this.graph = workflow.compile();
  }

  /**
   * ANALYSIS NODE:
   * Evaluates QoS metrics using Gemini's reasoning capabilities.
   */
  private async analyzerNode(state: GraphStateType): Promise<GraphUpdateType> {
    // Using Update type for return safety
    const { metrics, history } = state;

    const prompt = `Analyze HLS stream health.
      Current Status: Buffer ${metrics.bufferLength}s, Latency ${metrics.latency}ms.
      History Trend (last 5): ${JSON.stringify(history.map((h) => h.bufferLength + 's'))}.
      
      If buffer is trending DOWN, prioritize stabilization.
      Identify STALL or SSAI risks. Respond with concise technical feedback.`;

    const response = await this.model.invoke(prompt);
    const analysisText =
      typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content);

    return {
      analysis: analysisText,
      history: [metrics],
    };
  }

  /**
   * ACTUATOR NODE:
   * Translates heuristic analysis into deterministic player actions.
   */
  private actuatorNode(state: GraphStateType): GraphUpdateType {
    const analysis = state.analysis.toLowerCase();
    let command: { action: unknown } | null = null;

    if (analysis.includes('stall') || state.metrics.bufferLength < 5) {
      command = {
        action: {
          command: 'TUNE_ABR',
          payload: { capLevel: 1, minBuffer: 30 },
        },
      };
    } else if (analysis.includes('ad failure') || analysis.includes('ssai')) {
      command = { action: { command: 'SKIP_AD_SEGMENT' } };
    }

    return { decision: command };
  }

  async processMetrics(metrics: HlsMetricsDto): Promise<unknown> {
    try {
      const result = await this.graph.invoke({ metrics });
      return result.decision;
    } catch (error) {
      console.error('LangGraph workflow execution failed:', error);
      return null;
    }
  }
}
