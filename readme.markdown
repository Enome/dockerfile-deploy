# Dockerfile-deploy

*This is a new project and still needs to be battle tested*

This project consists out of two Node.js apps. The first one (**dockerfile-deploy**) builds a docker image and runs a  container from a Dockerfile in a directory. The second one (**dockerfile-deploy-hipache**) is a long running process that inspects running docker containers and adds their port and ip to hipache.

## Installation

*It's recommended that you use ubuntu 13.04/64 other versions haven't been tested yet.*

```sh
git clone git@github.com:Enome/dockerfile-deploy.git
cd dockerfile-deploy
./install.sh
```

This will install the following.

- Node.js
- git
- redis
- redis upstart (respawn, start on boot)
- docker (version is locked to 0.6.5 since it's still under heavy development)
- hipache (Global Node.js module)
- hipache upstart (respawn, start on boot)
- dockerfile-deploy (Global Node.js module)
- dockerfile-deploy-hipache upstart script (respawn, start on boot).

After it's done installing you should edit the `/etc/dockerfile-deploy.json` file and add your own domain. If you rather install this manually take a look at the install file.

## Usage

The deployment executable (dockerfile-deploy) expects a directory that contains a Dockerfile. We use tar to transport that directory.

Lets use the directory in `tests/nodejs` as an example.

```sh
tar -C tests/nodejs -c . | sudo dockerfile-deploy --name foobar.com
```

The `--name` argument is the name of the project. It is used as the domain, subdomain and as the name for the image and container. This means if you push two projects and give them the same name the second one will overwrite the first.

Each time you pipe a new directory dockerfile-deploy will build the image and check if a container with that name is already running. If it is running the container will be stopped and removed and a new container will start.

If your settings file has the hostname `dockerfile-deploy.com` and we named the project `foobar.com` then hipache will add the following frontends:

- frontend:foobar.com.dockerfile-deploy.com
- frontend:foobar.com
- frontend:\*.foobar.com

The Dockerfile also needs to have an `ENTRYPOINT` and/or `CMD` as the containers are run without any arguments. In this case `docker run container-foobar.com` with `ENTRYPOINT ["node", "/app/index.js"]`. Container and image names are prefixed with `container-` and `image-`.


## Customize hipache

If you want to change the hipache settings you need to edit `/etc/hipache.json` and `sudo restart hipache`. You can find all the options on their [github.com](https://github.com/dotcloud/hipache).

## File and log locations

```sh
# docker-deploy settings (doesn't need restart on change)
/etc/dockerfile-deploy.json

# dockerfile-deploy-hipache log
/var/log/dockerfile-deploy-hipache

# Hipache settings (needs restart on change)
/etc/hipache.json 

# Hipache logs
/var/log/hipache_access.log

# Redis log
/var/log/redis/redis-server.log
```

## Helpful commands

```sh
# Get all the hipache frontends
redis-cli keys frontend*

# Get the identifier and backends of a frontend.
# This returns a list. The first item is the identifier (hipache needs this) 
# second item will be http://ip:port of your container.
redis-cli lrange frontend:foobar.dockerfile-deploy.com 0 -1

# Check if redis is running
status redis-server
redis-cli ping

# Check if hipache is running
status hipache

# Check if dockerfile-deploy-hipache is running
status dockerfile-deploy-hipache

# Tar over ssh
tar -C mydir -c . | ssh user@ip 'sudo dockerfile-deploy'

# Tar to vagrant vm (mostly for testing)
tar -C mydir -c . | vagrant ssh -- 'sudo dockerfile-deploy'
```

## Tests

The tests will use vagrant to setup a vm so make sure you have vagrant installed. It will also promps you to add `nodejs.dockerfile-deploy.com` to your `/etc/hosts` file to fake dns. The tests can take a couple of minutes since a vm is created and restarted.

```sh
./tests/run-tests.sh
```
