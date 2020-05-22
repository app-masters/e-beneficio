#!/usr/bin/env bash
set -e

## Get Current env
source utils.sh
getEnvName $1

## Include config
echo -e "\n# 1/5 - Loading config and setting project...\n"
source config.sh
source ${ENV}/config.sh

## Set project
setProject

## BUILD IMAGES
echo -e "\n# 2/5 - Pushing admin docker image to Google Container Registry...\n"
source 1-build-images.sh $1

## PUSH IMAGES
echo -e "\n# 3/5 - Pushing admin docker image to Google Container Registry...\n"
source 2-push-images.sh $1

### FILES AND FINAL PULL
echo -e "\n# 4/5 - Copying config files to remote machine...\n"
source 3-copy-files.sh $1

### FILES AND FINAL PULL
echo -e "\n# 5/5 - Copying config files to remote machine...\n"
source 4-update-server.sh $1
