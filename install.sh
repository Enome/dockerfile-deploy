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

sudo apt-get install -qqy software-properties-common

# Dependency repositories
sudo add-apt-repository -y ppa:chris-lea/redis-server
sudo add-apt-repository -y ppa:chris-lea/node.js-legacy
sh -c "wget -qO- https://get.docker.io/gpg | apt-key add -"
sudo sh -c "echo deb http://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list"

sudo apt-get -qq update

# GIT
apt-get install -yqq git

# Docker
sudo apt-get install -yqq linux-image-extra-`uname -r`
sudo apt-get install -yqq lxc-docker-0.6.6
confirm "Installed, docker 0.6.6 has."

# Install redis and Node.js
sudo apt-get install -yqq redis-server
confirm "Installed, redis-server has."

sudo apt-get install -yqq nodejs
confirm "Installed, Node.js has."

sudo apt-get install -yqq npm
sudo npm update npm -g
confirm "Installed, npm was."

# Use upstart instead of init.d
sudo /etc/init.d/redis-server stop
sudo update-rc.d -f redis-server disable
sudo update-rc.d -f redis-server remove
 
cat <<EOF > /etc/init/redis-server.conf 
# Credits: https://gist.github.com/rogerleite/5927948/raw/ae1b75db1bce71b9d11556c10143437ae19d71b5/redis-install.sh
description "Redis Server"
author "Thomas Woolford <thomas@urpages.com.au>"
 
# run when the local FS becomes available
start on local-filesystems
stop on shutdown
 
# The default redis conf has 'daemonize = yes' and will naiively fork itself.
expect fork
 
# Respawn unless redis dies 10 times in 5 seconds
respawn
respawn limit 10 5
 
env NAME=redis
 
# start a default instance
instance \$NAME
 
# run redis as the correct user
setuid redis
setgid redis
 
# run redis with the correct config file for this instance
exec /usr/bin/redis-server /etc/redis/\${NAME}.conf
EOF
 
sudo start redis-server
confirm "Started, redis-server using upstart has."

# Install hipache
sudo npm install -g git://github.com/Enome/hipache.git
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
    "deadBackendTTL": 30
  },
  "redisHost": "127.0.0.1",
  "redisPort": 6379,
  "redisDatabase": 0
}
EFO
confirm "Added, hipache upstart script was. '/var/log/hipache_access.log'"

# Install dockerfile-deploy
sudo npm install dockerfile-deploy -g
confirm "Install, dockerfile-deploy was."

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

# Add config file
sudo cat<<EFO > /etc/dockerfile-deploy.json
{ "hostname": "dockerfile-deploy.com" }
EFO
confirm "Added, configration file at /etc/dockerfile-deploy.json"
warning "Don't forget to change the hostname to your domain." 

# Start dockerfile-deploy-hipache
sudo start dockerfile-deploy-hipache
confirm "Started, dockerfile-deploy-hipache upstart has. (logs at /var/logs/dockerfile-deploy-hipache)"
