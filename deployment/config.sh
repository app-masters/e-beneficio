#!/usr/bin/env bash

## Target docker images
BACKEND_IMAGE_TAG="e-beneficio-backend"
ADMIN_IMAGE_TAG="e-beneficio-admin"
PORTAL_IMAGE_TAG="e-beneficio-portal"
APP_IMAGE_TAG="e-beneficio-app"


## Final image name
BACKEND_CONTAINER_IMAGE="gcr.io/e-beneficio-jf/${BACKEND_IMAGE_TAG}"
ADMIN_CONTAINER_IMAGE="gcr.io/e-beneficio-jf/${ADMIN_IMAGE_TAG}"
PORTAL_CONTAINER_IMAGE="gcr.io/e-beneficio-jf/${PORTAL_IMAGE_TAG}"
APP_CONTAINER_IMAGE="gcr.io/e-beneficio-jf/${APP_IMAGE_TAG}"


## Instance settings (will be replaced by another loaded config)
INSTANCE_NAME=""
REMOTE_PATH=""

## Google cloud config (will be replaced by another loaded config)
PROJECT=""
ZONE="us-central1-a"
