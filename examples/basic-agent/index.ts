import { Runtime, Agent, EventBus, AIProvider, AIProviderOptions } from '../../src';

/**
 * A mock AI Provider for demonstration purposes.
 * In a real application, you would use OpenAI, Anthropic, etc.
 */
class MockAIProvider implements AIProvider {
  name = 'mock-provider';

  async generate(prompt: string, options?: AIProviderOptions): Promise<string> {
    return "This is a mocked AI response.";
  }

  async analyze<T = any>(payload: any, options?: AIProviderOptions): Promise<T> {
    console.log(`[MockAI] Analyzing payload:`, payload);
    return { score: 85, recommendation: 'contact_sales' } as any as T;
  }
}

/**
 * A simple Lead Scoring Agent that listens for new leads and scores them.
 */
class LeadScoringAgent extends Agent {
  protected onStart(): void {
    console.log(`[LeadScoringAgent] Started. Listening to 'lead.created'`);
    this.bus.subscribe('lead.created', async (event) => {
      console.log(`[LeadScoringAgent] Received lead:`, event.payload);
      
      const analysis = await this.ai.analyze(event.payload);
      console.log(`[LeadScoringAgent] AI Decision:`, analysis);

      await this.bus.publish({
        type: 'lead.scored',
        payload: {
          originalLead: event.payload,
          score: analysis.score,
          action: analysis.recommendation
        }
      });
    });
  }
}

/**
 * Application Bootstrapper
 */
async function bootstrap() {
  const runtime = new Runtime();
  
  // Setup the provider
  runtime.use(new MockAIProvider());
  
  // Register our agent
  runtime.register(new LeadScoringAgent());
  
  // Start the runtime
  await runtime.start();

  // Simulate an external system (e.g., webhook) firing an event
  setTimeout(() => {
    console.log('\n--- Simulating External Webhook ---');
    runtime.publish({
      type: 'lead.created',
      payload: { email: 'ceo@bigcompany.com', name: 'John Doe' }
    });
  }, 1000);
}

bootstrap();
