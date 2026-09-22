
export const CONTACT_EMAIL = 'contact@elsueldoneto.es';

/*
 * Identite legale de l'editeur (RECETTE-SITE.md, controle check-legal).
 * Un champ laisse vide ressort en jaune sur la page legale et fait echouer le
 * controle : rien ne part en ligne avec une mention manquante.
 */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',
  legalForm: '',                 // vide : publication a titre personnel, pas de societe
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: 'Francia',          // pays de l'editeur, pas du site
  phone: '',
  registerLabel: 'SIREN',
  registerNumber: '',
  vatLabel: 'Número de IVA',
  vatNumber: '',                 // vide : non assujetti
  jurisdiction: 'España',
  supervisoryAuthority: 'Agencia Española de Protección de Datos (AEPD), C/ Jorge Juan 6, 28001 Madrid, España',
  supervisoryAuthorityUrl: 'https://sedeagpd.gob.es/sede-electronica-web/vistas/formReclamacionDerechos/reclamacionDerechos.jsf',
  hosting: {
    name: 'OVH SAS',
    address: '2 rue Kellermann, 59100 Roubaix, Francia',
    phone: '+33 9 72 10 10 07',
    url: 'https://www.ovhcloud.com',
  },
};
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];
