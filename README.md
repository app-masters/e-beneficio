# Resources 4 Vulnerables

## Getting started

Clone the project and work on the created folder.

```
git clone git@github.com:TiagoGouvea/resources4vulnerables.git
cd resources4vulnerables
```

### Backend

Inside the folder `/backend`, create the `.env` file using the keys on the `.env.example` and filling with your local data.

With the node and npm installed: 

```
cd backend
npm install
npm start
```

### Database
This step is only necessary if you are planning to run the backend locally.

You can easily run a local postgres database using the docker and the docker-compose with the file on the `backend/docs`.

```
cd backend/docs
docker-compose up
```
After this, you need to migrate and seed your database with the base data. On another console:

```
cd backend
npm run migrate
npm run seed
```

`IMPORTANT:` When seeding for the first time, the seed for the `users` will create a login and password for each available role so you can use it to login on the frontend. The default data is:

```
Role: admin or manager or financial or operator
Email: {role}@login.com
Password: {role}
```

### Frontend
The project is separated in 3 frontend projects:
 - admin: an admin panel with CRUD pages and reports about the consumptions;
 - app: application used on the store to validate the consumption. Also have some reports for the manager and finantial user;
 - portal: simple landpage to allow the family responsible see the balance on the app and know the places he can use it;

Inside the folder any of the frontend folders, create the `.env` file using the keys on the `.env.example` and filling with your local data.

With the node and npm installed: 

```
cd admin  // or portal or app
npm install
npm start
```

You can login with the admin user in the admin project or the financial or manager users on the app project;


## Documentation

### Endpoints
The list of available endpoints can be easily accessed on the folder `/backend/docs/postman` or using [this link](https://documenter.getpostman.com/view/3342022/SzYaVdaV).


