#!/usr/bin/env bash
cd "$(dirname "$0")" # Set working directory

source utils.sh

deploy() {
  tar -C nodejs -c . | vagrant ssh -- sudo dockerfile-deploy --name node.js
  sleep 2
}

# Test 1

description="curl nodejs.dockerfile-deploy.com returns 'Express.js application'."

deploy
result=$(curl node.js.dockerfile-deploy.com 2> /dev/null)
assert "$result" "Express.js application" "$description"

# Test 1.1 

description="curl node.js returns 'Express.js application'."

result=$(curl node.js 2> /dev/null)
assert "$result" "Express.js application" "$description"

# Test 1.2

description="curl www.node.js returns 'Express.js application'."

result=$(curl www.node.js 2> /dev/null)
assert "$result" "Express.js application" "$description"

# Test 2

description="curl node.js.dockerfile-deploy.com returns 'Node.js application' after pushing a new version."

sed -i "s/Express.js application/Node.js application/g" nodejs/index.js
deploy

result=$(curl node.js.dockerfile-deploy.com 2> /dev/null)
assert "$result" "Node.js application" "$description"

## Clean up
sed -i "s/Node.js application/Express.js application/g" nodejs/index.js

# Test 3

description="curl nodejs.dockerfile-deploy.com returns 'Node.js application after restarting the vm'."
vagrant halt && vagrant up

result=$(curl node.js.dockerfile-deploy.com 2> /dev/null)
assert "$result" "Node.js application" "$description"
