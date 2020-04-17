FROM node:11-alpine AS build
WORKDIR /var/www
COPY ./frontend/package.json .
RUN yarn install
COPY ./frontend/. .
RUN date > build-date.txt
CMD ["/bin/sh", "-c", "cd /var/www; npm run start-production;"]
