#!/usr/bin/env bash

cd "$(dirname "$0")" # Set working directory

source utils.sh

deploy() {
  tar -C nodejs -c . | vagrant ssh -- sudo dockerfile-deploy --name nodejs
  sleep 2
}

warning "Don't forget to run 'vagrant-up' and 'setup-env.sh'."



# Test 1

description="curl nodejs.dockerfile-deploy.com return 'Express.js application'."

deploy
result=$(curl nodejs.dockerfile-deploy.com 2> /dev/null)
assert "$result" "Express.js application" "$description"



# Test 2

description="curl nodejs.dockerfile-deploy.com return 'Node.js application' after pushing a new version."

sed -i "s/Express.js application/Node.js application/g" nodejs/index.js
deploy

result=$(curl nodejs.dockerfile-deploy.com 2> /dev/null)
assert "$result" "Node.js application" "$description"

## Clean up
sed -i "s/Node.js application/Express.js application/g" nodejs/index.js



# Test

description="curl nodejs.dockerfile-deploy.com return 'Node.js application after restarting the vm'."
vagrant halt && vagrant up

result=$(curl nodejs.dockerfile-deploy.com 2> /dev/null)
assert "$result" "Node.js application" "$description"
