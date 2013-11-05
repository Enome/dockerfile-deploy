#!/usr/bin/env bash

# Colors
default=$(tput sgr0)
green=$(tput setaf 6)
red=$(tput setaf 9)

# Alerts
confirm() {
  echo "${green}---> ${default}$1"
}

warning() {
  echo "${red}---> ${default}$1"
}

# Dependency repositories
sudo add-apt-repository -y ppa:chris-lea/redis-server
sudo add-apt-repository -y ppa:chris-lea/node.js
sh -c "wget -qO- https://get.docker.io/gpg | apt-key add -"
sudo sh -c "echo deb http://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list"

sudo apt-get -qq update

# GIT
apt-get install -yqq git

# Docker
sudo apt-get install -yqq linux-image-extra-`uname -r`
sudo apt-get install -yqq lxc-docker=0.6.5
confirm "Installed, docker 0.6.5 has."

# Install redis and Node.js
sudo apt-get install -yqq redis-server
confirm "Installed, redis-server has."

sudo apt-get install -yqq nodejs
confirm "Installed, Node.js has."

# Install hipache
sudo npm i hipache -g
confirm "Installed, hipache has."

# Hipache upstart
sudo wget -O /etc/init/hipache.conf https://raw.github.com/dotcloud/hipache/master/upstart.conf
confirm "Installed, hipache-upstart has."

# Hipache start
sudo start hipache
confirm "Started, hipache has."

# Hipache Config
sudo cat<<EFO > /etc/hipache.json
{
  "server": {
    "accessLog": "/var/log/hipache_access.log",
      "port": 80,
      "workers": 5,
      "maxSockets": 100,
      "deadBackendTTL": 30,
      "address": ["127.0.0.1"],
      "address6": ["::1"]
  },
  "redisHost": "127.0.0.1",
  "redisPort": 6379,
  "redisDatabase": 0
}
EFO
confirm "Added, hipache upstart script was. '/var/log/hipache_access.log'"

sudo npm install /vagrant -g
confirm "Install, dockerfile-deploy was."

sudo redis-cli SET hostname dockerfile-deploy.com
confirm "Added, default hostname (dockerfile-deploy.com) was."

sudo cat<<EFO > /etc/init/dockerfile-deploy-hipache.conf
start on runlevel [2345]
stop on runlevel [06]

respawn
respawn limit 15 5

script
  sudo dockerfile-deploy-hipache >> /var/log/dockerfile-deploy-hipache
  end script
EFO

confirm "Installed, dockerfile-deploy-hipache upstart has."

sudo start dockerfile-deploy-hipache
confirm "Started, dockerfile-deploy-hipache upstart has. (logs at /var/logs/dockerfile-deploy-hipache)"

warning "Don't forget change the hostname to your domain. 'redis-cli SET hostname yourdomain.tld'"
