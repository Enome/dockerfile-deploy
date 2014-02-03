# Dockerfile-deploy

This project will install [tarcker](http://github.com/enome/tarcker) and [dopache](https://github.com/enome/dopache) and all it's dependencies. I use this to deploy directories with a Dockerfile to my Digitalocean Droplet.

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
- docker (version is locked to 0.6.6 since it's still under heavy development)
- hipache (Global Node.js module)
- hipache upstart (respawn, start on boot)
- dopache
- tarcker

## Usage

Check the dopache and tarcker repository on how to use them. 

## Customize hipache

If you want to change the hipache settings you need to edit `/etc/hipache.json` and `sudo restart hipache`. You can find all the options on their [github.com](https://github.com/dotcloud/hipache).

## File and log locations

```sh
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

# Check if dopache is running
status dopache

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

## License

*MIT*
