FROM node:13-alpine AS build
WORKDIR /var/www
COPY ./portal/package.json .
RUN yarn install
COPY ./portal/. .
RUN date > build-date.txt
CMD ["/bin/sh", "-c", "cd /var/www; npm run start-production;"]
