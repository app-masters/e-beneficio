#!/usr/bin/env bash
set -e

## Get Current env
source utils.sh
getEnvName $1

## Include config
echo -e "\n# 1/3 - Loading config and setting project...\n"
source config.sh
source ${ENV}/config.sh

## Set project
setProject

### FILES AND FINAL PULL
echo -e "\n# 2/3 - Copying config files to remote machine...\n"
source 3-copy-files.sh $1

### FILES AND FINAL PULL
echo -e "\n# 3/3 - Updating remote server...\n"
source 4-update-server.sh $1
