// Dummy import to fix --isolatedModules error
import '../../src/env';

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('loginWithUI', (email: string, password: string) => {
  cy.visit('http://localhost:3000/');

  cy.get('form').within(() => {
    cy.get('[type="email"]').type(email);
    cy.get('[type="password"]').type(password);
    cy.get('[type="submit"]').click();
  });
});

Cypress.Commands.add('loginAndSaveStorage', (email: string, password: string) => {
  cy.server();
  cy.route('POST', '/auth/login').as('login-user');
  cy.route('POST', '/auth/token').as('login-token');

  cy.get('form').within(() => {
    cy.get('[type="email"]').type(email);
    cy.get('[type="password"]').type(password);
    cy.get('[type="submit"]').click();
  });
  cy.wait('@login-user').should((xhr) => {
    expect(xhr.status).to.equal(200);
  });
  cy.wait('@login-token').should((xhr) => {
    expect(xhr.status).to.equal(200);
    expect(xhr.response.body).to.have.keys('token', 'refreshToken', 'user');
  });
});

Cypress.Commands.add('createBenefit', (name: string, date: string, value: string) => {
  cy.contains('Beneficios').click();
  cy.url().should('contain', '/beneficios');

  cy.get('button:contains("Criar")').click();
  cy.url().should('contain', '/beneficios/criar');

  cy.get('#title').type(name);
  cy.get('.ant-picker-input').eq(0).click();
  cy.get('[name="date"]').type(date, { force: true });

  cy.get('.ant-select-selection-search-input').eq(0).focus().click();
  cy.get('.ant-select-item-option-content').eq(0).click({ force: true });

  cy.get('.ant-select-selection-search-input').eq(1).focus().click();
  cy.get('.ant-select-item-option-content').eq(5).click({ force: true });

  cy.get('#value').type(value);
  cy.get('button:contains("OK")').click();

  cy.url().should('not.contain', '/criar');
  cy.contains(name);
});

Cypress.Commands.add('deleteBenefit', (name: string) => {
  cy.get('a[href="/beneficios"]').click();
  cy.contains(name)
    .parent()
    .within(() => {
      cy.contains('Excluir').click();
    });
  cy.get('.ant-btn-danger').click();
});

Cypress.Commands.add('getFamilyBalance', (nis: string, callback?: (value: string) => void) => {
  cy.get('body').within(() => {
    cy.contains('Famílias').click();
    cy.url().should('contain', '/familias');

    // Select the NIS input
    cy.get('form').within(() => {
      cy.get('input').type(nis);
      cy.get('button').click();
    });

    // It sould countain a the available balance
    cy.get('table').within(() => {
      cy.contains('R$');
      cy.contains('R$').then(($label) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        if (callback) callback($label.text());
      });
    });
  });
});
