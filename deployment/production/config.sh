#!/usr/bin/env bash


## Google cloud config
PROJECT="e-beneficio-jf"
ZONE="us-central1-a"

## Instance settings
INSTANCE_NAME="e-beneficio-jf"
REMOTE_PATH="/srv/project"

### Instance creation settings
TAGS="http-server,https-server"
DELETION_PROTECTION="deletion-protection"
IMAGE_FAMILY="ubuntu-1604-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
MACHINE_TYPE="n1-standard-1"