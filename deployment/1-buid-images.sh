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


####

cd ..
### FILES AND FINAL PULL
# BACKEND
# build and push backend
cd backend
echo -e "\n# 1/9 - Building and tagging backend dockerfile...\n"
docker build -f production.Dockerfile -t ${BACKEND_IMAGE_TAG} .
docker tag ${BACKEND_IMAGE_TAG} ${BACKEND_CONTAINER_IMAGE}
cd ..

## FRONTEND
# build and push admin
cd admin
echo -e "\n# 3/9 - Building and tagging admin dockerfile...\n"
docker build -f production.Dockerfile -t ${ADMIN_IMAGE_TAG} .
docker tag ${ADMIN_IMAGE_TAG} ${ADMIN_CONTAINER_IMAGE}
cd ..

## PORTAL
# build and copy portal
cd portal
echo -e "\n# 5/9 - Building and tagging portal dockerfile...\n"
docker build -f production.Dockerfile -t ${PORTAL_IMAGE_TAG} .
docker tag ${PORTAL_IMAGE_TAG} ${PORTAL_CONTAINER_IMAGE}
cd ..