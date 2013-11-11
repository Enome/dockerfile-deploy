#!/usr/bin/env bash

cd "$(dirname "$0")" # Set working directory

./setup-env.sh
./test-nodejs.sh
./test-postgresql.sh
