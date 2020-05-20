FROM node:13-alpine AS build
WORKDIR /var/www
RUN mkdir -p ./dist
COPY ./package.json .
RUN rm -f package-lock.json rm yarn.lock
RUN yarn install
COPY ./. .
RUN yarn checks
RUN yarn build

FROM node:13-alpine
WORKDIR /var/www
COPY --from=build /var/www/dist .
COPY ./package.json .
COPY ./.sequelizerc .
RUN date > build-date.txt
RUN yarn install --production --ignore-scripts --prefer-offline

EXPOSE 80 443

CMD ["/bin/sh", "-c", "cd /var/www; cat build-date.txt; yarn migrate; yarn seed-production; yarn start-production; "]
