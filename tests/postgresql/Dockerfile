FROM ubuntu
MAINTAINER Geert Pasteels <geert.pasteels@gmail.com>

RUN echo "deb http://archive.ubuntu.com/ubuntu precise main universe" > /etc/apt/sources.list
RUN apt-get update
RUN apt-get upgrade -y

# add-apt-repository
RUN apt-get install -y python-software-properties 

# Wget
RUN apt-get install wget

# Install Postgresql
RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" > /etc/apt/sources.list.d/pgdg-precise.list
RUN wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | apt-key add -
RUN apt-get update
RUN apt-get -y install postgresql-9.2 postgresql-client-9.2 postgresql-contrib-9.2; \
    /etc/init.d/postgresql stop

# Startup script
ADD start start

# Port
EXPOSE 5432

ENTRYPOINT ./start
