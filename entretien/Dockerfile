# FROM node:alpine
# RUN apk add --no-cache git
# RUN apk add --no-cache openssh
# WORKDIR /data
# RUN git clone https://github.com/Perceptive/mongo-playground.git /data/app

FROM node:16-stretch

WORKDIR /app

#Install and cache node_modules
#COPY --from=0 /data/app/package.json /tmp/
COPY package.json /tmp/
RUN cd /tmp && \
    npm install && \
    mkdir -p /app && \
    mv /tmp/node_modules /app/

#COPY --from=0 /data/app/ /app
COPY ./ /app

EXPOSE 4000

ENTRYPOINT ["npm", "start"]
