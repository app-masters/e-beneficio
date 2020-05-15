#!/usr/bin/env bash

## Target docker images
BACKEND_IMAGE_TAG="resource-4-vulnerable-backend"
ADMIN_IMAGE_TAG="resource-4-vulnerable-admin"
PORTAL_IMAGE_TAG="resource-4-vulnerable-portal"

## Google cloud config
PROJECT="covid19jf"
ZONE="us-central1-a"

## Instance settings
INSTANCE_NAME="resources-dev-2"
REMOTE_PATH="/srv/project"

BACKEND_CONTAINER_IMAGE="gcr.io/${PROJECT}/${BACKEND_IMAGE_TAG}"
ADMIN_CONTAINER_IMAGE="gcr.io/${PROJECT}/${ADMIN_IMAGE_TAG}"
PORTAL_CONTAINER_IMAGE="gcr.io/${PROJECT}/${PORTAL_IMAGE_TAG}"
