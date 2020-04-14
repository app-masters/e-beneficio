#!/usr/bin/env bash
set -e

function getEnvName() {
     set +x
     if [[ $# -eq 0 ]]; then
        echo "No arguments supplied - inform the branch";
        exit 1;
    fi
    if [[ !"$1" =~ ^(dev|test|staging|master)$ ]]; then
        echo "$1 is not a valid branch";
        exit 1;
    fi

    ## Define the env name by branch
    ENV=$1
    if [[ ${ENV} == "master" ]]; then
       ENV = "production";
    fi

    set -x
}

function setVariables(){

    # Get Env
    if [[ ${ENV} == '' ]]; then
        getEnvName $1
    fi

    ## Define instance params by env
    if [[ ${ENV} == "production" ]]; then
        TAGS="http-server, https-server"
        DELETION_PROTECTION="deletion-protection"
    else
        TAGS="http-server"
        DELETION_PROTECTION="no-deletion-protection"
    fi

    set -ex
    ## Print variables
    #DATE=`date +%Y-%m-%d--%H-%M-%S`
    ENV=${ENV};
    IMAGE_FAMILY="cos-stable"
    IMAGE_PROJECT="cos-cloud"
    PROJECT="deep-pursuit-264612"
    IMAGE_TAG="${ENV}-backend"
    INSTANCE_NAME="phormar-${ENV}-backend"
    CONTAINER_IMAGE="gcr.io/${PROJECT}/${IMAGE_TAG}"
    MACHINE_TYPE="g1-small"
    ZONE_NAME="us-central1-a"
    TAGS=${TAGS};
    DELETION_PROTECTION=${DELETION_PROTECTION}
    DOCKER_FILENAME="${ENV}.remote.Dockerfile";

    # Config project and zone
    if hash gcloud 2>/dev/null; then
        gcloud config set project ${PROJECT}
        gcloud config set compute/zone ${ZONE_NAME}
    fi

}

function copyEssentialFiles(){
    gcloud compute scp ./local-update.sh ${INSTANCE_NAME}:~
    gcloud compute scp ./local-show-logs.sh ${INSTANCE_NAME}:~
    gcloud compute scp ./utils.sh ${INSTANCE_NAME}:~
    gcloud compute scp ./${ENV}/docker-compose.yml ${INSTANCE_NAME}:~
    gcloud compute scp ./${ENV}/.env.backend ${INSTANCE_NAME}:~
}

function authDocker(){
    set +x

    # Docker compose alias
    echo alias docker-compose="'"'docker run --rm \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v "$PWD:$PWD" \
        -w="$PWD" \
        docker/compose:1.25.0'"'" >> ~/.bashrc
    source ~/.bashrc

    # Docker GCR auth setup
    # https://cloud.google.com/container-registry/docs/advanced-authentication
    METADATA=http://metadata.google.internal/computeMetadata/v1
    SVC_ACCT=$METADATA/instance/service-accounts/default
    ACCESS_TOKEN=$(curl -H 'Metadata-Flavor: Google' $SVC_ACCT/token | cut -d'"' -f 4)
    docker login -u oauth2accesstoken -p $ACCESS_TOKEN https://gcr.io

    #docker-credential-gcr configure-docker

    set -x
}
