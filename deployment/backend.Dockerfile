FROM node:11-alpine AS build
WORKDIR /var/www
COPY ./backend/package.json .
# COPY ./backend/package-lock.json .
RUN npm install
COPY ./backend/. .
RUN npm build

FROM node:11-alpine
WORKDIR /var/www
COPY --from=build /var/www/dist .
COPY ./backend/package.json .
# COPY yarn.lock .
COPY ./backend/.sequelizerc .
RUN date > build-date.txt
RUN yarn install --production --ignore-scripts --prefer-offline
CMD ["/bin/sh", "-c", "cd /var/www; cat build-date.txt; yarn migrate; yarn seed-production; yarn start-production; "]
