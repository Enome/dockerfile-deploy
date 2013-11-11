# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::configure('2') do |config|
  config.vm.box = "raring"
  config.vm.box_url = "https://cloud-images.ubuntu.com/vagrant/raring/current/raring-server-cloudimg-amd64-vagrant-disk1.box"
  config.vm.network :private_network, ip: "11.0.0.2"
  config.vm.network :forwarded_port, guest: 80, host: 8080
  config.vm.network :forwarded_port, guest: 5432, host: 5432
  config.vm.provision :shell, :path => "install.sh"
end
