#!/bin/bash

echo "Shutting down container"

docker-compose -f docker-compose-dev.yml down

echo "Changing directory permission"

sudo chmod a+rw ./mysql-v

echo "Running Container"

docker-compose -f docker-compose-dev.yml up --build