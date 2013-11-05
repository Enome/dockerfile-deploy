#!/usr/bin/env bash

# Colors
default=$(tput sgr0)
green=$(tput setaf 6)
gray=$(tput setaf 8)
red=$(tput setaf 9)

# Alerts
confirm() {
  echo "${green}---> ${default}$1"
}

skipped() {
  echo "${gray}---> Skipped: ${default}$1"
}

warning() {
  echo "${red}---> ${default}$1"
}

# Warning
read -p "${green}--->${default} This script will add values to your ${green}/etc/hosts ${default} Continue (y/n)? " choice
case "$choice" in 
  y|Y );;
  n|N ) confirm "Setup was aborted" && exit;;
  * )  "invalid";;
esac

# Update host file
hostfile="/etc/hosts"
hostsettings="11.0.0.2 dockerfile-deploy.com nodejs.dockerfile-deploy.com" 

if grep -q "$hostsettings" $hostfile; then
  skipped "$hostfile already contains $hostsettings"
else
  echo $hostsettings | sudo tee -a $hostfile > /dev/null
  confirm "\"$hostsettings\" added to $hostfile"
fi

exit

# Update ssh configuration
sshfile="$HOME/.ssh/config"
sshsettings="Host dockerfile-deploy\nHostName 11.0.0.2\nStrictHostKeyChecking=no\nUserKnownHostsFile=/dev/null"

if grep -q "Host dockerfile-deploy" $sshfile; then
  skipped "$sshfile already contains dockerfile-deploy"
else
  echo -e "$sshsettings" >> $sshfile
  confirm "\"dockerfile-deploy\" added to $sshfile"
fi

# Copy and set public key
pub_key=$HOME/.ssh/id_rsa.pub 
if [ -f $pub_key ]; 
  then
    cat $pub_key | vagrant ssh -- "cat - >> \$HOME/.ssh/authorized_keys"
    confirm "Your public key was added to vm's authorized_keys."
  else
    warning "No public key was found at ${pub_key}."
fi
