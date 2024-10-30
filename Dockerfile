FROM node:16-alpine3.16

ENV LANG="C.UTF-8" PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk update && \
    apk add --no-cache zlib-dev udev nss ca-certificates chromium && \
    adduser -h /home/administrator -D -u 10086 administrator && \
    yarn cache clean && \
    rm -rf /tmp/* /etc/apk/* /var/cache/apk/* /usr/share/man

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

USER administrator

EXPOSE 3000

CMD [ "node", "./src/app.js" ]
