#!/usr/bin/env bash

## Target docker images
BACKEND_IMAGE_TAG="resource-4-vulnerable-backend"
FRONTEND_IMAGE_TAG="resource-4-vulnerable-frontend"

## Google cloud config
PROJECT="covid19jf"
ZONE="us-central1-a"

## Instance settings
INSTANCE_NAME="resources-dev-2"
SSH_USER="tiagogouvea"
REMOTE_PATH="/srv/project"

BACKEND_CONTAINER_IMAGE="gcr.io/${PROJECT}/${BACKEND_IMAGE_TAG}"
FRONTEND_CONTAINER_IMAGE="gcr.io/${PROJECT}/${FRONTEND_IMAGE_TAG}"
