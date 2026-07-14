import { CONTACT_EMAIL, GEOCODING_USER_AGENT } from './contact.constants';

describe('contact.constants', () => {
  describe('CONTACT_EMAIL', () => {
    it('debe ser la casilla real del proyecto', () => {
      expect(CONTACT_EMAIL).toBe('consultas@auguriatarot.com');
    });

    it('debe pertenecer al dominio real (auguriatarot.com)', () => {
      expect(CONTACT_EMAIL.endsWith('@auguriatarot.com')).toBe(true);
    });
  });

  describe('GEOCODING_USER_AGENT', () => {
    it('debe identificar la aplicación y el medio de contacto, como exige Nominatim', () => {
      expect(GEOCODING_USER_AGENT).toBe(`Auguria/1.0 (${CONTACT_EMAIL})`);
    });

    it('debe declarar un buzón que existe y leemos, y ningún otro', () => {
      const mailboxes = GEOCODING_USER_AGENT.match(/[\w.+-]+@[\w.-]+\.\w+/g);

      expect(mailboxes).toEqual([CONTACT_EMAIL]);
    });
  });
});
