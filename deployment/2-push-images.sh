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
# BACKEND
echo -e "\n# > Pushing backend dockerfile...\n"
docker push ${BACKEND_CONTAINER_IMAGE}
echo -e "\n# > Pushing admin dockerfile...\n"
docker push ${ADMIN_CONTAINER_IMAGE}
echo -e "\n# > Pushing portal dockerfile...\n"
docker push ${PORTAL_CONTAINER_IMAGE}