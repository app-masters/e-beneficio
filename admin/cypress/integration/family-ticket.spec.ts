/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference types="cypress" />
/// <reference path="../support/index.d.ts" />

import moment from 'moment';

// this event will automatically be unbound when this
// test ends because it's attached to 'cy'

context('Admin - Ticket', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
    cy.clearLocalStorage();
    cy.loginWithUI('admin@login.com', 'admin');
  });

  it('should be able to find a family and its balance', () => {
    cy.contains('Famílias').click();
    cy.url().should('contain', '/familias');

    // Select the NIS input
    cy.get('form').within(() => {
      cy.get('input').type('1234');
      cy.get('button').click();
    });

    // It sould countain a the available balance
    cy.get('table').within(() => {
      cy.contains('Saldo disponível');
      cy.contains('R$');
    });
  });

  it('should be able to create a benefit to the current month', () => {
    cy.createBenefit('Test Benefit', moment().endOf('month').format('DD/MM/YYYY'), '500');
    cy.deleteBenefit('Test Benefit');
  });

  it('should be able to see the faily balance increase after creating a benefit', () => {
    let initalBalance = 0;

    cy.getFamilyBalance('1234', (balance) => {
      initalBalance = Number(balance.replace(/R\$/, '').replace(/\./, '').replace(/,/, '.'));
    });

    cy.createBenefit('Test Benefit', moment().endOf('month').format('DD/MM/YYYY'), '500');

    cy.getFamilyBalance('1234', (balance) => {
      const finalBalance = Number(balance.replace(/R\$/, '').replace(/\./, '').replace(/,/, '.'));
      expect(finalBalance).to.be.gt(initalBalance);
    });

    cy.deleteBenefit('Test Benefit');
  });

  it('should be able to validate and invalidate products', () => {
    cy.server();
    cy.route('PUT', '/products/*').as('validate-product');

    cy.contains('Validar Produtos').click();
    cy.url().should('contain', '/validar');

    cy.contains('Válido').click();

    cy.wait('@validate-product').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body).to.exist;
    });

    cy.contains('Inválido').click();

    cy.wait('@validate-product').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body).to.exist;
    });
  });

  it('should not be able to submit a consumption with all data missing', () => {
    cy.contains('Informar consumo').click();
    cy.url().should('contain', '/consumo');

    cy.get('form')
      .first()
      .within(() => {
        cy.get('input').type('1234');
        cy.get('button:not([disabled])').click();
      });

    cy.get('.ant-alert')
      .first()
      .within(() => {
        cy.get('button').click();
      });

    cy.contains('Apenas itens contemplados pelo o programa estão incluídos na compra que está sendo inserida').click();
    cy.get('button:contains("Confirmar consumo")').should('be.disabled');
  });

  it('should be able to submit a consumption without a QRCode', () => {
    cy.server();
    cy.route('POST', '/consumptions').as('create-consumption');

    cy.contains('Informar consumo').click();
    cy.url().should('contain', '/consumo');

    cy.get('form')
      .first()
      .within(() => {
        cy.get('input').type('1234');
        cy.get('button:not([disabled])').click();
      });

    cy.get('.ant-alert')
      .first()
      .within(() => {
        cy.get('button').click();
      });

    cy.get('#value').type('50');
    cy.get('#invalidValue').type('0');

    cy.get('button:contains("Adicionar foto dos comprovantes")').click();

    cy.get('.ant-modal-content').within(() => {
      cy.get('input[type=file]').then((subject) => {
        cy.fixture('qr_code_ud.jpg').then((image) => {
          Cypress.Blob.base64StringToBlob(image, 'image/jpeg').then(function (blob) {
            const testfile = new File([blob], 'TestImage', { type: 'image/jpeg' });
            const dataTransfer = new DataTransfer();
            const fileInput = subject[0] as typeof subject[0] & { files: FileList };

            dataTransfer.items.add(testfile);
            fileInput.files = dataTransfer.files;

            cy.wrap(subject).trigger('change', { force: true });
          });
        });
      });
      cy.wait(500);
      cy.get('button:contains("Confirmar")').click();
    });

    cy.contains('Apenas itens contemplados pelo o programa estão incluídos na compra que está sendo inserida').click();
    cy.get('button:contains("Confirmar consumo")').click();

    cy.wait('@create-consumption').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body).to.exist;
    });
  });

  it('should be able to submit a consumption without a image', () => {
    cy.server();
    cy.route('POST', '/consumptions').as('create-consumption');

    cy.contains('Informar consumo').click();
    cy.url().should('contain', '/consumo');

    cy.get('form')
      .first()
      .within(() => {
        cy.get('input').type('1234');
        cy.get('button:not([disabled])').click();

        cy.get('.ant-alert')
          .first()
          .within(() => {
            cy.get('button').click();
          });

        cy.get('button:not([disabled])').eq(1).click();

        cy.get('#value').type('50');
        cy.get('#invalidValue').type('0');

        cy.contains(
          'Apenas itens contemplados pelo o programa estão incluídos na compra que está sendo inserida'
        ).click();
        cy.get('button:contains("Confirmar consumo")').click();
      });

    cy.wait('@create-consumption').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body).to.exist;
    });
  });
});
