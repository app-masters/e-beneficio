#!/usr/bin/env bash
set -e

## Include config
source config.sh

## Use node 11
if hash nvm 2>/dev/null; then
    nvm use 11
fi
cd ..

## Set GCP compute zone
gcloud config set compute/zone ${ZONE}

### BACKEND
echo -e "\n# 1/8 - Building and tagging backend dockerfile...\n"
docker build -f deployment/backend.Dockerfile -t ${BACKEND_IMAGE_TAG} .
docker tag ${BACKEND_IMAGE_TAG} ${BACKEND_CONTAINER_IMAGE}

echo -e "\n# 2/8 - Pushing docker image to Google Container Registry...\n"
docker push ${BACKEND_CONTAINER_IMAGE}

### FRONTEND
## build and copy admin
#echo -e "\n# 3/8 - Building admin...\n"
#cd admin
#yarn install
#yarn build
#mkdir -p ../frontend/admin/
#cp -R build/ ../frontend/admin/
#cd ..
#
### build and copy admin
#echo -e "\n# 4/8 - Building app...\n"
#cd app
#yarn install
#yarn build
#mkdir -p ../frontend/place/
#cp -R build/ ../frontend/place/
#cd ..

## Build docker and so on
#echo -e "\n# 5/8 - Building and tagging frontend dockerfile...\n"
#docker build -f deployment/frontend.Dockerfile -t ${FRONTEND_IMAGE_TAG} .
#docker tag ${FRONTEND_IMAGE_TAG} ${FRONTEND_CONTAINER_IMAGE}
#
#echo -e "\n# 6/8 - Pushing docker image to Google Container Registry...\n"
#docker push ${FRONTEND_CONTAINER_IMAGE}

### FILES AND FINAL PULL
echo -e "\n# 7/8 - Copying config files to remote machine...\n"
cd deployment
gcloud compute scp ./docker-compose.yml ${INSTANCE_NAME}:~
gcloud compute scp ./.env.backend ${INSTANCE_NAME}:~
gcloud compute scp ./nginx.conf ${INSTANCE_NAME}:~

echo -e "\n\n# 8/8 - Updating remote machine...\n"
gcloud compute ssh ${INSTANCE_NAME} --command="docker-compose down && docker-compose pull && docker-compose up --remove-orphans"
