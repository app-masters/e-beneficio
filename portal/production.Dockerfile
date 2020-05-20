FROM node:13-alpine AS build
WORKDIR /var/www
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
RUN date
RUN yarn install
## Cached until here most of time
COPY ./ ./
RUN yarn checks
RUN date
RUN yarn build
RUN date

FROM nginx:1.16.0-alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /var/www/build /usr/share/nginx/html
COPY ./env.sh /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

## Run it! // ADD script to get env
CMD ["sh", "-c", "sh /usr/share/nginx/html/env.sh && cat /usr/share/nginx/html/env-config.js && exec nginx -g 'daemon off;' "]
