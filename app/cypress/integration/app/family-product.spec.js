describe('App - Product - Family', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.server();
    cy.route('POST', '/auth/login').as('login-user');
    cy.route('POST', '/auth/token').as('login-token');
    cy.route('POST', '/families').as('save-family');
    cy.route('GET', '/families/place').as('families-place');
    cy.route('GET', '/groups').as('groups');
    cy.visit('http://localhost:3030/');

    cy.get('form').within(() => {
      cy.get('[type="email"]').type('manager@login.com', { force: true });
      cy.get('[type="password"]').type('manager', { force: true });
      cy.get('[type="submit"]').click();
    });
    cy.wait('@login-user').should((xhr) => {
      expect(xhr.status).to.equal(200);
    });
    cy.wait('@login-token').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body).to.have.keys('token', 'refreshToken', 'user');
    });
    cy.get('[href="/familias"]').click();
    cy.wait(['@families-place', '@groups']).spread((familiesPlace, groups) => {
      expect(familiesPlace.status).to.equal(200);
      expect(groups.status).to.equal(200);
      expect(familiesPlace.response.body).to.a('array');
      expect(groups.response.body).to.a('array');
    });
  });

  it.only('Family insert', () => {
    cy.get('button:button:contains("Criar")').click();

    cy.get('form').within(() => {
      cy.get('[name="isOnGovernProgram"]').check();
      cy.get('#address').type('Endereço Mock', { force: true });
      cy.get('#numberOfRooms').type('2', { force: true });
      cy.get('#houseType').type('Residencia', { force: true });
      cy.get('#totalSalary').type('800', { force: true });
      cy.get('[name="haveSewage"]').check();
      cy.get('#sewageComment').type('Lorem ipsum', { force: true });
      cy.get('.ant-select-selection-search-input').click();
    });

    cy.wait(100);
    cy.get('.ant-select-item-option-content').first().click({ force: true });

    cy.get('button:contains("Adicionar criança")').click();
    cy.get('.ant-modal-wrap').within(() => {
      cy.get('form').within(() => {
        cy.get('#name').type('Criança 1', { force: true });
        cy.get('[name="birthday"]').type('10/06/1997', { force: true });
      });
      cy.get('button:contains("OK")').click();
    });

    cy.get('button:contains("Adicionar adulto")').click();
    cy.get('.ant-modal-wrap').within(() => {
      cy.get('form').within(() => {
        cy.get('[name="isResponsible"]').click();
        cy.get('#name').type('Adulto 1', { force: true });
        cy.get('[name="birthday"]').type('10/06/1997', { force: true });
        cy.get('#rg').type('12345678', { force: true });
        cy.get('#cpf').type('12345678901', { force: true });
        cy.get('#email').type('email@email.email', { force: true });
        cy.get('#phone').type('32988888888', { force: true });
      });
      cy.get('button:contains("OK")').click();
    });

    cy.wait(1000);
    cy.get('button:contains("Concluir")').click();

    cy.wait('@save-family').should((xhr) => {
      expect(xhr.status).to.equal(200);
    });
    cy.wait(3000);
    cy.get('.ant-modal-confirm-body-wrapper').within(() => {
      cy.get('button:contains("OK")').click();
    });
  });

  it.only('Family with member already registered', () => {
    cy.get('button:button:contains("Criar")').click();

    cy.get('form').within(() => {
      cy.get('.ant-select-selection-search-input').click();
    });
    cy.wait(100);
    cy.get('.ant-select-item-option-content').first().click({ force: true });

    cy.get('button:contains("Adicionar adulto")').click();
    cy.get('.ant-modal-wrap').within(() => {
      cy.get('form').within(() => {
        cy.get('[name="isResponsible"]').click();
        cy.get('#name').type('Adulto 1', { force: true });
        cy.get('[name="birthday"]').type('10/06/1997', { force: true });
        cy.get('#rg').type('12345678', { force: true });
        cy.get('#cpf').type('12345678901', { force: true });
      });
      cy.get('button:contains("OK")').click();
    });

    cy.wait(1000);
    cy.get('button:contains("Concluir")').click();

    cy.wait('@save-family').should((xhr) => {
      expect(xhr.status).to.equal(500);
      expect(xhr.response.body).to.a('string');
    });
    cy.get('.ant-alert').should('be.visible');
  });
});
