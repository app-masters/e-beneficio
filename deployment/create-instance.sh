#!/usr/bin/env bash
echo -e "\nCreate remote instance"

echo -e "\n# 1/2 - Loading and setting options..."
## Show commands (if you want to check, uncomment it)
#set -x

## Stop on errors
set -e

## Validate target environment
if [[ $# -eq 0 ]]; then
    echo "No arguments supplied - inform the branch (dev|test|staging|master)";
    exit 1;
fi
if [[ !"$1" =~ ^(dev|test|staging|master)$ ]]; then
    echo "$1 is not a valid branch";
    exit 1;
fi

## Define the env name by branch
ENV=$1
if [[ ${ENV} == "master" ]]; then
   ENV="production";
elif [[ ${ENV} == "dev" || ${ENV} == "devops" ]]; then
   ENV="dev-online";
fi

## Include config
source config.sh
source ${ENV}/config.sh



## Set GCP compute zone
gcloud config set project ${PROJECT}
gcloud config set compute/zone ${ZONE}

## Create instance
echo -e "\n# 1/2 - Creating Compute Instance..."
gcloud compute instances create ${INSTANCE_NAME} \
--image-family ${IMAGE_FAMILY} \
--image-project ${IMAGE_PROJECT} \
--machine-type ${MACHINE_TYPE} \
--zone ${ZONE} \
--tags ${TAGS} \
--${DELETION_PROTECTION}
