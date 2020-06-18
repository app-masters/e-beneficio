describe('App - Product - Family', () => {
  before(() => {
    cy.server();
    cy.route('POST', '/auth/login').as('login-user');
    cy.route('POST', '/auth/token').as('login-token');
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
    cy.saveLocalStorage();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.visit('http://localhost:3030/');
  });

  it.only('Family insert', () => {
    cy.server();
    cy.route('POST', '/families').as('save-family');
    cy.get('[href="/familias"]').first().click();

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
      cy.setLocalStorage('@family', JSON.stringify(xhr.response.body));
    });
    cy.get('.ant-modal-confirm-body-wrapper').within(() => {
      cy.contains('Família salva com sucesso');
      cy.wait(1000);
      cy.get('button:contains("OK")').click();
    });

    cy.wait(2000);
    cy.saveLocalStorage();
  });

  it.only('Family with member already registered', () => {
    cy.server();
    cy.route('POST', '/families').as('save-family');
    cy.get('[href="/familias"]').first().click();

    cy.get('button:button:contains("Criar")').click();

    cy.get('form').within(() => {
      cy.get('.ant-select-selection-search-input').click();
    });
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

    cy.wait(2000);
  });

  it.only('Registered family consumption ', () => {
    cy.removeLocalStorage('persist:app/root');
    cy.server();
    cy.route('GET', '/fam*').as('families');
    cy.route('POST', '/consumptions').as('consumption');

    cy.get('[href="/consumo"]').first().click();
    const family = JSON.parse(localStorage.getItem('@family') || '');
    cy.get('form').within(() => {
      cy.get('input').type(family.code);
      cy.get('[type="button"]').first().click();
    });

    cy.wait('@families').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.url).contains('code');

      expect(xhr.response.body.balance).to.exist;
      expect(xhr.response.body.balance.length).to.be.greaterThan(0);

      cy.get('button:contains("Sim, confirmar")').click();

      cy.get('.ant-table-wrapper')
        .should('be.visible')
        .within(() => {
          const rows = cy.get('tbody > tr');
          rows.each(($li, index) => {
            if (index % 4 === 0)
              cy.wrap($li).within(() => {
                cy.get('td')
                  .last()
                  .within(() => {
                    cy.get('button').last().click({ force: true });
                  });
              });
          });
        });

      cy.get('button:contains("Foto de comprovação")').click({ force: true });

      cy.get('.ant-modal-content').within(() => {
        cy.get('input[type=file]').then((subject) => {
          cy.fixture('user.png').then((image) => {
            Cypress.Blob.base64StringToBlob(image, 'image/png').then(function (blob) {
              const testfile = new File([blob], 'TestImage', { type: 'image/png' });
              const dataTransfer = new DataTransfer();
              const fileInput = subject[0];

              dataTransfer.items.add(testfile);
              fileInput.files = dataTransfer.files;

              cy.wrap(subject).trigger('change', { force: true });
            });
          });
        });
        cy.wait(500);
        cy.get('[type="button"]').last().click({ force: true });
      });

      cy.get('button:contains("Confirmar consumo")').click({ force: true });
    });

    cy.wait('@consumption').should((xhr) => {
      expect(xhr.status).to.equal(200);
      cy.get('.ant-modal-confirm-body-wrapper').within(() => {
        cy.contains('Consumo salvo com sucesso');
        cy.wait(1000);
        cy.get('button:contains("OK")').click();
      });
    });
    cy.wait(3000);
  });
});
