#!/usr/bin/env bash
cd "$(dirname "$0")" # Set working directory

source utils.sh

deploy() {
  tar -C postgresql -c . | vagrant ssh -- sudo node /vagrant/deploy/index.js --name postgresql
  sleep 5 
}

cleanup() {
  vagrant ssh -- 'sudo rm -r /tmp/data'
}

# Test

vagrant ssh -- 'sudo mkdir /tmp/data'

deploy
description="\"select count(name) from user where name='jimi'\" should return \"count | 1\""

PGPASSWORD=bar psql -U foo -h 11.0.0.2 -d foobar -c 'create table users ( name varchar(40) );'
PGPASSWORD=bar psql -U foo -h 11.0.0.2 -d foobar -c "insert into users values('jimi')"
result=$(PGPASSWORD=bar psql -U foo -h 11.0.0.2 -d foobar -c "select count(name) from users where name='jimi';" -t -x)

assert "$result" "count | 1" "$description"

# Test

deploy
description="select count(name)... should return count | 1 again after re-deploying (this tests data presistence with volumes)"

result=$(PGPASSWORD=bar psql -U foo -h 11.0.0.2 -d foobar -c "select count(name) from users where name='jimi';" -t -x)
assert "$result" "count | 1" "$description"
cleanup
