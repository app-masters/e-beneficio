#!/usr/bin/env bash
set -e

## Get Current env
source utils.sh
getEnvName $1

## Include config
source config.sh
source ${ENV}/config.sh

## Set project
setProject

#####

### FILES AND FINAL PULL
FILE=./${ENV}/docker-compose.yml
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
## Envs
FILE=./${ENV}/.env.backend
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
FILE=./${ENV}/.env.admin
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
FILE=./${ENV}/.env.portal
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
FILE=./${ENV}/.env.app
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
## Nginx
FILE=./${ENV}/nginx.tmpl
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
FILE=./${ENV}/nginx.admin.conf
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
FILE=./${ENV}/nginx.portal.conf
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
FILE=./${ENV}/nginx.app.conf
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi