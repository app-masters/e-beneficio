#!/usr/bin/env bash
set -e

## Get Current env
source utils.sh

## Include config
source config.sh

## Set project
setProject

####

cd ..

### FILES AND FINAL PULL
# BACKEND
# build and push backend
cd backend
echo -e "\n# > Building and tagging backend dockerfile...\n"
docker build -f production.Dockerfile -t "${BACKEND_IMAGE_TAG}" .
docker tag "${BACKEND_IMAGE_TAG}" "${BACKEND_CONTAINER_IMAGE}"
cd ..

## FRONTEND
# build and push admin
cd admin
echo -e "\n# > Building and tagging admin dockerfile...\n"
docker build -f production.Dockerfile -t "${ADMIN_IMAGE_TAG}" .
docker tag "${ADMIN_IMAGE_TAG}" "${ADMIN_CONTAINER_IMAGE}"
cd ..

## PORTAL
# build and copy portal
cd portal
echo -e "\n# > Building and tagging portal dockerfile...\n"
docker build -f production.Dockerfile -t "${PORTAL_IMAGE_TAG}" .
docker tag "${PORTAL_IMAGE_TAG}" "${PORTAL_CONTAINER_IMAGE}"
cd ..

## APP
# build and copy app
cd app
echo -e "\n# > Building and tagging app dockerfile...\n"
docker build -f production.Dockerfile -t "${APP_IMAGE_TAG}" .
docker tag "${APP_IMAGE_TAG}" "${APP_CONTAINER_IMAGE}"
cd ..

cd deployment