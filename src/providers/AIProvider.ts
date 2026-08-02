export interface AIProviderOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export interface AIProvider {
  /**
   * The name of the provider (e.g., 'openai', 'anthropic')
   */
  readonly name: string;

  /**
   * Generates a text completion or structured response based on the prompt.
   */
  generate(prompt: string, options?: AIProviderOptions): Promise<string>;

  /**
   * Analyzes a payload (like an event) and returns a structured decision.
   */
  analyze<T = any>(payload: any, options?: AIProviderOptions): Promise<T>;
}
