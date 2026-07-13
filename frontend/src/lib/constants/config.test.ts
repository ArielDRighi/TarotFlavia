import { describe, it, expect } from 'vitest';
import { CONFIG } from './config';

describe('CONFIG', () => {
  describe('CONTACT_EMAIL', () => {
    it('should be the real mailbox published to users', () => {
      expect(CONFIG.CONTACT_EMAIL).toBe('consultas@auguriatarot.com');
    });

    it('should belong to the auguriatarot.com domain', () => {
      expect(CONFIG.CONTACT_EMAIL.endsWith('@auguriatarot.com')).toBe(true);
    });
  });
});
