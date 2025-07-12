import { describe, it, expect } from '@jest/globals';
import { EmbedRequestSchema, SearchRequestSchema } from '../types';

describe('Zod Schemas', () => {
  describe('EmbedRequestSchema', () => {
    it('should validate a valid embed request', () => {
      const validRequest = {
        text: 'This is a test text',
        namespace: 'test-namespace',
        metadata: { source: 'test' }
      };

      const result = EmbedRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid embed request', () => {
      const invalidRequest = {
        text: '', // Empty text
        namespace: 'test-namespace'
      };

      const result = EmbedRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('SearchRequestSchema', () => {
    it('should validate a valid search request', () => {
      const validRequest = {
        query: 'test query',
        namespace: 'test-namespace',
        topK: 5
      };

      const result = SearchRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should use default topK value', () => {
      const request = {
        query: 'test query',
        namespace: 'test-namespace'
      };

      const result = SearchRequestSchema.parse(request);
      expect(result.topK).toBe(10);
    });
  });
}); 