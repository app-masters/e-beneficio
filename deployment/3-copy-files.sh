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
echo -e "\n# 7/9 - Copying config files to remote machine...\n"
cd deployment
FILE=./${ENV}/docker-compose.yml
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
FILE=./${ENV}/nginx.tmpl
if test -f "$FILE"; then
    gcloud compute scp ${FILE} ${INSTANCE_NAME}:${REMOTE_PATH}
else
    echo "Not sending ${FILE}";
fi
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