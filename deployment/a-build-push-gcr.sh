#!/usr/bin/env bash
set -e

## Get Current env
source utils.sh

## Include config
echo -e "\n# 1/3 - Loading config and setting project...\n"
source config.sh

## Set project
setProject

## BUILD IMAGES
echo -e "\n# 2/3 - Pushing admin docker image to Google Container Registry...\n"
source 1-build-images.sh

## PUSH IMAGES
echo -e "\n# 3/3 - Pushing admin docker image to Google Container Registry...\n"
source 2-push-images.sh