# e-Benefício
=======

Projeto open-source desenvolvido pela App Masters para a prefeitura da cidade de Juiz de Fora para auxiliar a transferência de renda para as famílias em situação de vulnerabilidade social cadastradas no Bolsa Família e com dependentes cadastrados na rede municipal de ensino. O sistema é responsável pelo cruzamento dos dados das bases municipais, assim como o registro das compras feitas pelas famílias, permitindo o cálculo do saldo mensalmente da mesma.

# Informações gerais

As informações sobre o sistema para o público em geral estão no post sobre o [projeto e-Benefício](https://appmasters.io/pt/projetos/e-beneficio/) no site da [App Masters](https://appmasters.io).

[![Logo e-Beneficio](https://e-beneficio.com/eBeneficio.png)](https://appmasters.io/pt/projetos/e-beneficio/)

# Detalhes técnicos

Projeto feito utilizando primáriamente `node` no backend e `react` no frontend.

## Rodando o projeto localmente

Clone o projeto e acesse a pasta.

```
git clone https://github.com/app-masters/e-beneficio.git
cd e-beneficio
```

### Backend

Na pasta `/backend` crie um arquivo `.env` usando o arquivo `.env.example` como exemplo, preenchendo com seus dados locais.

Após criar o `.env` execute: 

```
cd backend
npm install
npm start
```

O servidor node será inicalizado e estará servindo o backend localmente.

### Database

Você pode ter um banco de dados postgres executando locamente com o docker-compose.

```
cd backend
docker-compose up
```
Com o banco online, você deve migrar e criar os registros de testes em sua base dados, executando:

```
cd backend
npm run migrate
npm run seed
```

`IMPORTANTE:` Ao rodar o seed pela primeira vez, o seed `users` irá criar um usuário para cada role existente no sistema, seguindo o seguinte padrão: 

```
Role: admin or manager or financial or operator or cashier
Email: {role}@login.com
Password: {role}
```

### Frontend

O projeto é separado em três projetos de frontend:
 - admin: painel administrativo para gestão dos dados e acesso a relatórios;
 - app: webapp usado nas lojas para validar o consumo, também tem relatórios e informações financeiras;
 - portal: site por onde as famílias consultam seus saldos e informam seus consumos.

Dentro de cada pasta que for usar, crie o arquivo `.env` usando como modelo o arquivo `.env.example`, preenchendo com seus dados locais. Em seguida execute:

```
cd admin  # ou portal, ou app
npm install
npm start
```

No projeto app, você pode autenticar com o usuário admin, financial, ou manager.


## Documentação

### Endpoints
A lista de todos os endpoints da API podem ser acessada utilizando o Postman, importando o arquivo `/backend/docs/postman` ou por [este link](https://documenter.getpostman.com/view/3342022/SzYaVdaV).

O código está bem comentando para facilitar a compreensão. Em caso de duvidas abra uma issue. 

## Deployment

O projeto é composto por 3 partes:

- Portal (/portal) que é a página onde o cidadão vê informações sobre o programa, consulta seu saldo e informa seu consumo
- Admin (/admin) é por onde os gestores administram o programa
- API (/backend) que é quem mantem as informações e interage com os frontends

Em [deployment](/deployment) existem os scripts necessários para realizar o build e deploy de toda a estrututa para a núvem do Google Cloud.

### Containers e proxys

O projeto foi desenvolvido usando containers docker. Se preferir executar todo o projeto sem utilizar códigos, execute as imagens abaixo com as variáveis de ambiente necessárias.

- Portal: gcr.io/e-beneficio-jf/e-beneficio-portal
- Admin: gcr.io/e-beneficio-jf/e-beneficio-admin
- Backend: gcr.io/e-beneficio-jf/e-beneficio-backend

### Implamtanção

Usamos o [nginx-proxy](https://github.com/nginx-proxy/nginx-proxy) para "mapear" um domínio e diversos subdomínios, em um único docker-compose. Veja um [exemplo](/deployment/production/docker-compose.yml.example).

Foi utilizado o lets-encrypt para gerar chaves SSL auto geradas.

# Suporte

Se você é um desenvolvedor e deseja obter suporte técnico no projeto, abra uma issue no projeto.

Se você é uma instituição e deseja obter suporta para implantação completa, [fale conosco](https://app-masters-website-staging.netlify.app/pt/contato/). 
