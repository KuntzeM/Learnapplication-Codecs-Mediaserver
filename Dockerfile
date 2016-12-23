FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# node image is on debain jessie which has does not include ffmpeg as default
RUN echo "deb http://ftp.uk.debian.org/debian jessie-backports main" >> /etc/apt/sources.list

# according to https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices/
RUN apt-get update && apt-get install -y \
    imagemagick \
    ffmpeg \
 && rm -rf /var/lib/apt/lists/*





 # Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

 # Bundle app source
COPY . /usr/src/app

CMD node bin/www

