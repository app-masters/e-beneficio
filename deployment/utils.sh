#!/usr/bin/env bash
set -e

function getEnvName() {
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
}

function setProject(){
  ## Set GCP compute zone
  gcloud config set compute/zone ${ZONE}

  ## Login on GCR
  gcloud auth configure-docker --quiet
}