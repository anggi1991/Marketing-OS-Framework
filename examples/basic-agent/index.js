"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@agent-runtime/core");
/**
 * A mock AI Provider for demonstration purposes.
 * In a real application, you would use OpenAI, Anthropic, etc.
 */
class MockAIProvider {
    name = 'mock-provider';
    async generate(prompt, options) {
        return "This is a mocked AI response.";
    }
    async analyze(payload, options) {
        console.log(`[MockAI] Analyzing payload:`, payload);
        return { score: 85, recommendation: 'contact_sales' };
    }
}
/**
 * A simple Lead Scoring Agent that listens for new leads and scores them.
 */
class LeadScoringAgent extends core_1.Agent {
    onStart() {
        console.log(`[LeadScoringAgent] Started. Listening to 'lead.created'`);
        this.bus.subscribe('lead.created', async (event) => {
            console.log(`[LeadScoringAgent] Received lead:`, event.payload);
            const analysis = await this.runtime.getProvider('AIProvider').analyze(event.payload);
            console.log(`[LeadScoringAgent] AI Decision:`, analysis);
            await this.bus.publish({
                name: 'lead.scored',
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
    const runtime = new core_1.Runtime();
    // Setup the provider
    runtime.registerProvider('AIProvider', new MockAIProvider());
    // Register our agent
    runtime.register(new LeadScoringAgent());
    // Start the runtime
    await runtime.start();
    // Simulate an external system (e.g., webhook) firing an event
    setTimeout(() => {
        console.log('\n--- Simulating External Webhook ---');
        runtime.publish({
            name: 'lead.created',
            payload: { email: 'ceo@bigcompany.com', fullName: 'John Doe' } // Changed 'name' to 'fullName' to avoid collision with event.name
        });
    }, 1000);
}
bootstrap();
