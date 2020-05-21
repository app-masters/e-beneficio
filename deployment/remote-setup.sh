#!/usr/bin/env bash
echo -e "\nSetup remote instance"

echo -e "\n# 1/3 - Loading and setting options..."
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

## Copy script
echo -e "\n# 2/2 - Copying required files..."
gcloud compute scp ./local-setup.sh ${INSTANCE_NAME}:~
gcloud compute scp ./${ENV}/config.sh ${INSTANCE_NAME}:~

## Create remote path
echo -e "\n# 3/3 - Staring remote setup..."
gcloud beta compute --project ${PROJECT} ssh ${INSTANCE_NAME} --zone ${ZONE} --command="chmod +x local-setup.sh && ./local-setup.sh"
