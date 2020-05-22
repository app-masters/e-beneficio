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
echo -e "\n# 4/9 - Pushing admin docker image to Google Container Registry...\n"
docker push ${BACKEND_CONTAINER_IMAGE}
docker push ${ADMIN_CONTAINER_IMAGE}
docker push ${PORTAL_CONTAINER_IMAGE}