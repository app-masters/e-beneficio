describe('Portal - Family search', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3031/');
  });
  it.only('Invalid family', () => {
    cy.server();
    cy.route('GET', 'public/**').as('public-families');
    cy.get('form').within(() => {
      cy.get('[type="number"]').type('111', { force: true });
      cy.get('[type="button"]').click();
    });
    cy.wait('@public-families').should((xhr) => {
      expect(xhr.status).to.equal(404);
      cy.contains(
        'Não encontramos nenhuma família utilizando esse NIS.Tenha certeza que é o NIS do responsável familiar para conseguir consultar'
      );
    });
    cy.wait(2000);
  });
  it.only('Valid family', () => {
    cy.server();
    cy.route('GET', 'public/**').as('public-families');
    cy.get('form').within(() => {
      cy.get('[type="number"]').type('1234', { force: true });
      cy.get('[type="button"]').click();
    });
    cy.wait('@public-families').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.url).contains('nis');
      expect(xhr.url).contains('cityId');
      cy.get('form:contains("Aniversário do responsável")').within(() => {
        cy.get('#birthday').type('20/12/1991');
        cy.get('[type="submit"]').click({ force: true });
      });
      cy.get('button:contains("Sim, confirmar")').click({ force: true });
      cy.contains('Saldo disponível:');
    });
    cy.wait(2000);
  });
});

describe('Portal - Consumption input', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3031/');
  });

  it.only('Invalid consumption', () => {
    cy.get('button:contains("Informar compra")').click({ force: true });

    cy.get('.ant-modal-wrap').within(() => {
      cy.get('form').within(() => {
        cy.get('[name="nis"]').type('1234');
        cy.get('[type="submit"]').click();
      });

      cy.get('#birthday').type('20/12/1991');
      cy.get('[type="submit"]').click();
      cy.get('button:contains("Sim, confirmar")').click();
      cy.get('button:contains("Meu comprovante tem o QRCode")').click();

      cy.get('button:contains("Confirmar")').click();
      cy.wait(2000);
    });
  });

  it.only('Valid consumption', () => {
    cy.server();
    cy.route('POST', '/public/*').as('save-consumption');
    cy.route('GET', 'public/*').as('public-families');
    cy.get('button:contains("Informar compra")').click({ force: true });

    cy.get('.ant-modal-wrap').within(() => {
      cy.get('form').within(() => {
        cy.get('[name="nis"]').type('1234');
        cy.get('[type="submit"]').click();
      });

      cy.wait('@public-families').should((xhr) => {
        expect(xhr.status).to.equal(200);
        expect(xhr.url).contains('nis');
        expect(xhr.url).contains('cityId');

        cy.get('#birthday').type('20/12/1991');
        cy.get('[type="submit"]').click();
        cy.get('button:contains("Sim, confirmar")').click();
        cy.get('button:contains("Meu comprovante tem o QRCode")').click();

        cy.get('#value').type('20');

        cy.get(
          '#nfce'
        ).type(
          'https://nfce.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=31200519560168000260652020000215401387112952|2|1|1|038d7b68e58da7f62e8e70f94b093cf78baac165',
          { force: true }
        );

        cy.get('button:contains("Confirmar")').click();

        cy.wait('@save-consumption').should((xhr) => {
          expect(xhr.status).to.equal(200);
        });
      });
    });
    cy.get('.ant-modal-confirm-body-wrapper').within(() => {
      cy.wait(1000);
      cy.get('button:contains("OK")').click();
    });
  });
});
