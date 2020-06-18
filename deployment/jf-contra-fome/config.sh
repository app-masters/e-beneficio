#!/usr/bin/env bash

## Google cloud config
PROJECT="jf-contra-fome"
ZONE="us-central1-a"

## Instance settings
INSTANCE_NAME="jf-contra-fome"
REMOTE_PATH="/srv/project"

### Instance creation settings
TAGS="http-server,https-server"
DELETION_PROTECTION="deletion-protection"
IMAGE_FAMILY="ubuntu-1604-lts"
IMAGE_PROJECT="ubuntu-os-cloud"
MACHINE_TYPE="g1-small"