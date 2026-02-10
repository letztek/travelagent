import { logger } from './logger';

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

/**
 * A higher-order function that wraps an asynchronous AI call with retry logic.
 * Implements exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 2, // Default to 2 retries (total 3 attempts) as per spec
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error: any) => {
      // Default retry logic for AI services:
      // Retry on 503 (Service Unavailable), 429 (Too Many Requests), or specific error messages
      const status = error.status || (error.response && error.response.status);
      const message = error.message?.toLowerCase() || '';
      
      // Check for Gemini specific error patterns
      return (
        status === 503 || 
        status === 429 || 
        message.includes('fetch failed') ||
        message.includes('overloaded') ||
        message.includes('deadline exceeded') ||
        message.includes('rate limit')
      );
    }
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      if (attempt < maxRetries && shouldRetry(error)) {
        logger.warn(`AI request failed (Attempt ${attempt + 1}/${maxRetries + 1}). Retrying in ${delay}ms...`, {
          error: error.message,
          status: error.status
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Exponential backoff
        delay = Math.min(delay * 2, maxDelay);
        continue;
      }
      
      // If we shouldn't retry or we've reached max retries, log the final failure
      logger.error(`AI request failed after ${attempt + 1} attempts.`, {
        error: error.message,
        status: error.status
      });
      throw error;
    }
  }

  throw lastError;
}
