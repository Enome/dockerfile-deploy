#!/usr/bin/env bash

cd "$(dirname "$0")" # Set working directory

source utils.sh

# Update host file
hostfile="/etc/hosts"
hostsettings="11.0.0.2 node.js.dockerfile-deploy.com node.js www.node.js" 

if grep -q "$hostsettings" $hostfile; 
  then
    skipped "$hostfile already contains $hostsettings"
  else
    read -p "${green}--->${default} Adding host settings to your ${green}/etc/hosts ${default} Continue (y/n)? " choice
    case "$choice" in 
      y|Y ) echo $hostsettings | sudo tee -a $hostfile > /dev/null && confirm "\"$hostsettings\" added to $hostfile";;
      n|N );;
      * )  "invalid";;
    esac
fi

read -p "${green}--->${default} Destroy and start vagrant? (y/n)? " choice
case "$choice" in 
  y|Y ) vagrant destroy -f && vagrant up;;
  n|N ) ;;
  * )  "invalid";;
esac
