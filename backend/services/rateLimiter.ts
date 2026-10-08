/**
 * Shared Circuit Breaker & Rate-Limit Management for External AI Services
 * Protects against 429 Quota Exhaustion errors and activates compliant fallback pipelines.
 */
class ApiCircuitBreaker {
  private lastRateLimitTime: number = 0;
  private cooldownDurationMs: number;
  private serviceName: string;

  constructor(serviceName: string, cooldownDurationMs = 60_000) {
    this.serviceName = serviceName;
    this.cooldownDurationMs = cooldownDurationMs;
  }

  recordRateLimit(err?: any) {
    this.lastRateLimitTime = Date.now();
    const isFirstNotification = Date.now() - this.lastRateLimitTime < 5000;
    if (isFirstNotification) {
      console.info(
        `[${this.serviceName}] 429 Quota limit active. Seamless fallback engaged for ${this.cooldownDurationMs / 1000}s.`
      );
    }
  }

  isInCooldown(): boolean {
    if (this.lastRateLimitTime === 0) return false;
    const elapsed = Date.now() - this.lastRateLimitTime;
    return elapsed < this.cooldownDurationMs;
  }

  resetCooldown() {
    this.lastRateLimitTime = 0;
  }

  isRateLimitError(err: any): boolean {
    if (!err) return false;
    const str = typeof err === 'string' ? err : `${err.message || ''} ${JSON.stringify(err)}`;
    return (
      str.includes('429') ||
      str.includes('RESOURCE_EXHAUSTED') ||
      str.includes('quota') ||
      str.includes('rate limit')
    );
  }
}

export const geminiCircuitBreaker = new ApiCircuitBreaker('Gemini API', 90_000);
export const openAiCircuitBreaker = new ApiCircuitBreaker('OpenAI API', 60_000);
