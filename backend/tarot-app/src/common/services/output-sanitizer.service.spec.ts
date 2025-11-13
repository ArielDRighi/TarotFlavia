import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OutputSanitizerService } from './output-sanitizer.service';

describe('OutputSanitizerService', () => {
  let service: OutputSanitizerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OutputSanitizerService],
    }).compile();

    service = module.get<OutputSanitizerService>(OutputSanitizerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sanitizeAiResponse', () => {
    it('should remove script tags from text', () => {
      const maliciousText =
        'Esta es una interpretación <script>alert("XSS")</script> del tarot';
      const sanitized = service.sanitizeAiResponse(maliciousText);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('Esta es una interpretación');
      expect(sanitized).toContain('del tarot');
    });

    it('should remove event handlers from text', () => {
      const maliciousText =
        'Interpretación <div onload="malicious()">peligrosa</div>';
      const sanitized = service.sanitizeAiResponse(maliciousText);

      expect(sanitized).not.toContain('onload');
      expect(sanitized).not.toContain('malicious()');
    });

    it('should escape HTML entities', () => {
      const textWithHtml = 'El símbolo < y > son importantes & el "amor"';
      const sanitized = service.sanitizeAiResponse(textWithHtml);

      expect(sanitized).toContain('&lt;');
      expect(sanitized).toContain('&gt;');
      expect(sanitized).toContain('&amp;');
      expect(sanitized).toContain('&quot;');
    });

    it('should handle empty strings', () => {
      const sanitized = service.sanitizeAiResponse('');
      expect(sanitized).toBe('');
    });

    it('should handle null values gracefully', () => {
      const sanitized: string = service.sanitizeAiResponse(null);
      expect(sanitized).toBe('');
    });

    it('should handle undefined values gracefully', () => {
      const sanitized: string = service.sanitizeAiResponse(undefined);
      expect(sanitized).toBe('');
    });

    it('should preserve safe text without modification', () => {
      const safeText =
        'Esta es una interpretación segura del tarot sin código malicioso.';
      const sanitized = service.sanitizeAiResponse(safeText);

      expect(sanitized).toBe(safeText);
    });

    it('should remove javascript: protocol from text', () => {
      const maliciousText =
        'Haz click aquí: javascript:alert("XSS") para más info';
      const sanitized = service.sanitizeAiResponse(maliciousText);

      expect(sanitized).not.toContain('javascript:');
    });

    it('should remove data: protocol from text', () => {
      const maliciousText =
        'Imagen: data:text/html,<script>alert("XSS")</script>';
      const sanitized = service.sanitizeAiResponse(maliciousText);

      expect(sanitized).not.toContain('data:text/html');
      expect(sanitized).not.toContain('<script>');
    });

    it('should handle very long texts efficiently', () => {
      const longText = 'A'.repeat(10000) + '<script>alert("XSS")</script>';
      const startTime = Date.now();
      const sanitized = service.sanitizeAiResponse(longText);
      const duration = Date.now() - startTime;

      expect(sanitized).not.toContain('<script>');
      expect(duration).toBeLessThan(1000); // Should process in less than 1 second
    });

    it('should remove multiple script tags', () => {
      const maliciousText =
        '<script>alert(1)</script>Texto<script>alert(2)</script>';
      const sanitized = service.sanitizeAiResponse(maliciousText);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('Texto');
    });

    it('should remove iframe tags', () => {
      const maliciousText = 'Texto <iframe src="evil.com"></iframe> más texto';
      const sanitized = service.sanitizeAiResponse(maliciousText);

      expect(sanitized).not.toContain('<iframe');
      expect(sanitized).not.toContain('evil.com');
    });

    it('should log XSS attempts', () => {
      const loggerSpy = jest.spyOn(Logger.prototype, 'warn');
      const maliciousText = '<script>alert("XSS")</script>';

      service.sanitizeAiResponse(maliciousText);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Potential XSS attempt detected'),
      );

      loggerSpy.mockRestore();
    });

    it('should handle mixed case script tags', () => {
      const maliciousText = '<ScRiPt>alert("XSS")</ScRiPt>';
      const sanitized = service.sanitizeAiResponse(maliciousText);

      expect(sanitized).not.toContain('ScRiPt');
      expect(sanitized).not.toContain('alert');
    });

    it('should remove object and embed tags', () => {
      const maliciousText =
        '<object data="evil.swf"></object><embed src="evil.swf">';
      const sanitized = service.sanitizeAiResponse(maliciousText);

      expect(sanitized).not.toContain('<object');
      expect(sanitized).not.toContain('<embed');
    });
  });

  describe('sanitizeBatch', () => {
    it('should sanitize multiple responses in batch', () => {
      const responses = [
        'Interpretación segura',
        '<script>alert("XSS")</script>',
        'Otra interpretación < y >',
      ];

      const sanitized = service.sanitizeBatch(responses);

      expect(sanitized).toHaveLength(3);
      expect(sanitized[0]).toBe('Interpretación segura');
      expect(sanitized[1]).not.toContain('<script>');
      expect(sanitized[2]).toContain('&lt;');
      expect(sanitized[2]).toContain('&gt;');
    });

    it('should handle empty array', () => {
      const sanitized = service.sanitizeBatch([]);
      expect(sanitized).toEqual([]);
    });
  });
});
