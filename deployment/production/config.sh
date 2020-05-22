#!/usr/bin/env bash

## Target docker images
BACKEND_IMAGE_TAG="e-beneficio-backend"
ADMIN_IMAGE_TAG="e-beneficio-admin"
PORTAL_IMAGE_TAG="e-beneficio-portal"

## Google cloud config
PROJECT="e-beneficio-jf"
ZONE="us-central1-a"

## Instance settings
INSTANCE_NAME="e-beneficio-jf"
REMOTE_PATH="/srv/project"

BACKEND_CONTAINER_IMAGE="gcr.io/${PROJECT}/${BACKEND_IMAGE_TAG}"
ADMIN_CONTAINER_IMAGE="gcr.io/${PROJECT}/${ADMIN_IMAGE_TAG}"
PORTAL_CONTAINER_IMAGE="gcr.io/${PROJECT}/${PORTAL_IMAGE_TAG}"

### Instance creation settings
TAGS="http-server,https-server"
DELETION_PROTECTION="deletion-protection"
IMAGE_FAMILY="ubuntu-1604-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
MACHINE_TYPE="n1-standard-1"