#!/usr/bin/env bash
set -e

## Validate target environment
if [[ $# -eq 0 ]]; then
    echo "No arguments supplied - inform the branch (dev|test|staging|master)";
    exit 1;
fi
if [[ !"$1" =~ ^(dev|test|staging|master)$ ]]; then
    echo "$1 is not a valid branch";
    exit 1;
fi

## Define the env name by branch
ENV=$1
if [[ ${ENV} == "master" ]]; then
   ENV="production";
elif [[ ${ENV} == "dev" || ${ENV} == "devops" ]]; then
   ENV="dev-online";
fi

## Include config
source config.sh
source ${ENV}/config.sh

## Use node 11
if hash nvm 2>/dev/null; then
    nvm use 13
fi
cd ..

## Set GCP compute zone
gcloud config set compute/zone ${ZONE}

## Login on GCR
gcloud auth configure-docker --quiet

## BACKEND
## build and push backend
#cd backend
#echo -e "\n# 1/9 - Building and tagging backend dockerfile...\n"
#docker build -f production.Dockerfile -t ${BACKEND_IMAGE_TAG} .
#docker tag ${BACKEND_IMAGE_TAG} ${BACKEND_CONTAINER_IMAGE}
#
#echo -e "\n# 2/9 - Pushing backend docker image to Google Container Registry...\n"
#docker push ${BACKEND_CONTAINER_IMAGE}
#cd ..
#
#
### FRONTEND
## build and push admin
#cd admin
#echo -e "\n# 3/9 - Building and tagging admin dockerfile...\n"
#docker build -f production.Dockerfile -t ${ADMIN_IMAGE_TAG} .
#docker tag ${ADMIN_IMAGE_TAG} ${ADMIN_CONTAINER_IMAGE}
#
#echo -e "\n# 4/9 - Pushing admin docker image to Google Container Registry...\n"
#docker push ${ADMIN_CONTAINER_IMAGE}
#cd ..
#
### PORTAL
## build and copy portal
#cd portal
#echo -e "\n# 5/9 - Building and tagging portal dockerfile...\n"
#docker build -f production.Dockerfile -t ${PORTAL_IMAGE_TAG} .
#docker tag ${PORTAL_IMAGE_TAG} ${PORTAL_CONTAINER_IMAGE}
#
#echo -e "\n# 6/9 - Pushing admin docker image to Google Container Registry...\n"
#docker push ${PORTAL_CONTAINER_IMAGE}
#cd ..

### FILES AND FINAL PULL
echo -e "\n# 7/9 - Copying config files to remote machine...\n"
cd deployment
gcloud compute scp ./${ENV}/docker-compose.yml ${INSTANCE_NAME}:${REMOTE_PATH}
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

## Call "docker-compose up -d" on github
if [[ -z ${GITHUB_RUN_ID} ]]; then
    DAEMON="";
else
    DAEMON="-d";
fi

echo "Daemon: ${DAEMON}"

set -x

echo -e "\n\n# 8/9 - Updating remote machine...\n"
gcloud compute ssh ${INSTANCE_NAME} --command="cd ${REMOTE_PATH} && docker-compose pull && docker-compose up ${DAEMON} --remove-orphans"
#gcloud compute ssh ${INSTANCE_NAME} --command="cd ${REMOTE_PATH} && ls -la && docker-compose down --remove-orphans && docker-compose pull && docker-compose up ${DAEMON} --remove-orphans"
#gcloud compute ssh ${INSTANCE_NAME} --command="cd ${REMOTE_PATH} && ls -la && docker image prune -a --force && docker-compose down --remove-orphans && docker-compose pull && docker-compose up ${DAEMON} --remove-orphans"

echo -e "\n\n# 9/9 - Waiting healthy response...\n"
