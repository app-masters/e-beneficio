#!/usr/bin/env bash
set -e

## Get Current env
source utils.sh

## Include config
source config.sh

## Set project
setProject

## Login on GCR
gcloud auth configure-docker --quiet

#####


### FILES AND FINAL PULL
# BACKEND
echo -e "\n# > Pushing backend dockerfile...\n"
docker push "${BACKEND_CONTAINER_IMAGE}"
#echo -e "\n# > Pushing admin dockerfile...\n"
#docker push "${ADMIN_CONTAINER_IMAGE}"
#echo -e "\n# > Pushing portal dockerfile...\n"
#docker push "${PORTAL_CONTAINER_IMAGE}"
#echo -e "\n# > Pushing app dockerfile...\n"
#docker push "${APP_CONTAINER_IMAGE}"