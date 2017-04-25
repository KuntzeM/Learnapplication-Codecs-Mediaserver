FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# node image is on Debian Jessie which has does not include ffmpeg as default
RUN echo "deb http://ftp.uk.debian.org/debian jessie-backports main" >> /etc/apt/sources.list

# according to https://docs.docker.com/engine/userguide/eng-image/dockerfile_best-practices/
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libopenjpeg5* \
    libopenjp2-* \
    libpng16-* \
    libjpeg9* \
    build-essential \
 && rm -rf /var/lib/apt/lists/*


# install imagemagick 7 from source
RUN wget https://www.imagemagick.org/download/ImageMagick-7.0.5-5.tar.gz
RUN tar xvzf ImageMagick-7.0.5-5.tar.gz

WORKDIR ImageMagick-7.0.5-5

RUN ./configure --enable-shared --with-jpeg --with-openjp2 --with-png
RUN make
RUN make install
RUN ldconfig /usr/local/lib

WORKDIR ..

 # Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

 # Bundle app source
COPY . /usr/src/app

CMD node bin/www

