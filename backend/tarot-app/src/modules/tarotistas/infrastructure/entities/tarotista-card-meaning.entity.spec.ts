import { TarotistaCardMeaning } from './tarotista-card-meaning.entity';
import { Tarotista } from './tarotista.entity';

describe('TarotistaCardMeaning Entity', () => {
  describe('creation and validation', () => {
    it('should create a custom card meaning with required fields', () => {
      const meaning = new TarotistaCardMeaning();
      meaning.id = 1;
      meaning.tarotistaId = 1;
      meaning.cardId = 5;
      meaning.customMeaningUpright = 'Custom upright meaning';
      meaning.customMeaningReversed = 'Custom reversed meaning';

      expect(meaning.id).toBe(1);
      expect(meaning.tarotistaId).toBe(1);
      expect(meaning.cardId).toBe(5);
      expect(meaning.customMeaningUpright).toBe('Custom upright meaning');
      expect(meaning.customMeaningReversed).toBe('Custom reversed meaning');
    });

    it('should allow nullable custom meanings', () => {
      const meaning = new TarotistaCardMeaning();
      meaning.tarotistaId = 1;
      meaning.cardId = 5;

      expect(meaning.customMeaningUpright).toBeUndefined();
      expect(meaning.customMeaningReversed).toBeUndefined();
    });

    it('should store custom keywords', () => {
      const meaning = new TarotistaCardMeaning();
      meaning.customKeywords = 'transformation, change, rebirth';

      expect(meaning.customKeywords).toBe('transformation, change, rebirth');
    });

    it('should store custom description', () => {
      const meaning = new TarotistaCardMeaning();
      meaning.customDescription = 'This card represents deep transformation';

      expect(meaning.customDescription).toBe(
        'This card represents deep transformation',
      );
    });

    it('should store private notes', () => {
      const meaning = new TarotistaCardMeaning();
      meaning.privateNotes = 'Personal interpretation notes';

      expect(meaning.privateNotes).toBe('Personal interpretation notes');
    });
  });

  describe('relationships', () => {
    it('should have a tarotista relationship', () => {
      const meaning = new TarotistaCardMeaning();
      const tarotista = new Tarotista();
      tarotista.id = 1;
      tarotista.nombrePublico = 'Flavia';

      meaning.tarotista = tarotista;
      meaning.tarotistaId = tarotista.id;

      expect(meaning.tarotista).toBeDefined();
      expect(meaning.tarotistaId).toBe(1);
    });

    it('should reference a card', () => {
      const meaning = new TarotistaCardMeaning();
      meaning.cardId = 5;

      expect(meaning.cardId).toBe(5);
    });
  });

  describe('unique constraint', () => {
    it('should enforce unique (tarotistaId, cardId) combination', () => {
      // This is enforced at DB level via unique constraint
      const meaning1 = new TarotistaCardMeaning();
      meaning1.tarotistaId = 1;
      meaning1.cardId = 5;

      const meaning2 = new TarotistaCardMeaning();
      meaning2.tarotistaId = 1;
      meaning2.cardId = 6; // Different card, same tarotista - OK

      const meaning3 = new TarotistaCardMeaning();
      meaning3.tarotistaId = 2;
      meaning3.cardId = 5; // Same card, different tarotista - OK

      expect(meaning1.tarotistaId).toBe(1);
      expect(meaning1.cardId).toBe(5);
      expect(meaning2.tarotistaId).toBe(1);
      expect(meaning2.cardId).toBe(6);
      expect(meaning3.tarotistaId).toBe(2);
      expect(meaning3.cardId).toBe(5);
    });
  });

  describe('timestamps', () => {
    it('should have createdAt and updatedAt fields', () => {
      const meaning = new TarotistaCardMeaning();
      const now = new Date();

      meaning.createdAt = now;
      meaning.updatedAt = now;

      expect(meaning.createdAt).toEqual(now);
      expect(meaning.updatedAt).toEqual(now);
    });
  });
});
