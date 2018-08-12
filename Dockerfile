FROM node:alpine

WORKDIR /usr

COPY package*.json wait-for-postgres.sh ./

RUN apk add --no-cache --virtual .build-deps build-base python postgresql-dev && \
#RUN apk add --no-cache build-base python openssh-client postgresql-dev
    npm install && \
    npm cache clean --force && \
    apk del .build-deps && \
    apk --no-cache add postgresql-client

#COPY . .

EXPOSE 3000
