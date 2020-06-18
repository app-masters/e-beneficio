describe('Admin - Product - Family', () => {
  before(() => {
    cy.server();
    cy.route('POST', '/auth/login').as('login-user');
    cy.route('POST', '/auth/token').as('login-token');
    cy.visit('http://localhost:3000/');

    cy.get('form').within(() => {
      cy.get('[type="email"]').type('admin@login.com', { force: true });
      cy.get('[type="password"]').type('admin', { force: true });
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
    cy.wait(1000);
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    // cy.visit('http://localhost:3000/');
  });

  it.only('Family insert', () => {
    cy.server();
    cy.route('POST', '/families').as('save-family');
    cy.route('GET', '/families/place*').as('list-family');
    cy.get('[href="/familias"]').first().click();

    cy.get('button:contains("Criar")').click();
    cy.get('form').within(() => {
      cy.get('[name="isOnGovernProgram"]').check();
      cy.get('#address').type('Endereço Mock', { force: true });
      cy.get('#numberOfRooms').type('2', { force: true });
      cy.get('#houseType').type('Residencia', { force: true });
      cy.get('#totalSalary').type('800', { force: true });
      cy.get('[name="haveSewage"]').check();
      cy.get('#sewageComment').type('Lorem ipsum', { force: true });
    });
    cy.get('.ant-select-selection-search-input').first().click();
    cy.get('.ant-select-item-option-content').first().click({ force: true });

    cy.get('.ant-select-selection-search-input').last().click();
    cy.get('.ant-select-item-option-content').last().click({ force: true });

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

    cy.get('.ant-select-selection-search-input').last().click();
    cy.get('.ant-select-item-option-content').last().click({ force: true });

    cy.wait('@list-family').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body).to.exist;
    });

    cy.wait(2000);
    cy.saveLocalStorage();
  });

  it.only('Family with member already registered', () => {
    cy.server();
    cy.route('POST', '/families').as('save-family');
    cy.get('[href="/familias"]').first().click();

    cy.get('button:contains("Criar")').click();

    cy.get('.ant-select-selection-search-input').first().click();
    cy.get('.ant-select-item-option-content').first().click({ force: true });

    cy.get('.ant-select-selection-search-input').last().click();
    cy.get('.ant-select-item-option-content').last().click({ force: true });

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

    cy.wait(2000);
  });

  it.only('Benefit insert', () => {
    cy.server();
    cy.route('GET', '/benefits*').as('list-benefits');
    cy.get('[href="/beneficios"]').first().click();

    cy.route('GET', '/institutions*').as('list-institutions');
    cy.route('GET', '/products*').as('list-products');
    cy.route('GET', '/groups*').as('list-groups');
    cy.route('POST', '/benefits*').as('save-benefit');

    cy.get('button:contains("Criar")').click();

    cy.get('.ant-modal-wrap').within(() => {
      cy.get('form').within(() => {
        cy.get('#title').type('Benefit Teste', { force: true });
        cy.get('[name="date"]').type('06/2020', { force: true });

        cy.wait(['@list-institutions', '@list-products', '@list-groups']).spread((institutions, products, groups) => {
          expect(institutions.status).to.equal(200);
          expect(products.status).to.equal(200);
          expect(groups.status).to.equal(200);

          expect(institutions.response.body).to.exist;
          expect(products.response.body).to.exist;
          expect(groups.response.body).to.exist;

          expect(institutions.response.body.length).to.be.greaterThan(0);
          expect(products.response.body.length).to.be.greaterThan(0);
          expect(groups.response.body.length).to.be.greaterThan(0);

          cy.get('table').within(() => {
            const rows = cy.get('tbody > tr');
            rows.each(($li, index) => {
              if (index < 10)
                cy.wrap($li).within(() => {
                  cy.get('td')
                    .last()
                    .within(() => {
                      cy.get('button').last().click({ force: true });
                    });
                });
            });
          });
        });
      });
      cy.get('button:contains("OK")').click();
    });

    cy.wait('@save-benefit').should((xhr) => {
      expect(xhr.status).to.equal(200);
      expect(xhr.response.body).exist;
    });

    cy.wait(2000);
    cy.saveLocalStorage();
  });
});
