FROM node

RUN mkdir -p /nuxt
COPY . /nuxt
WORKDIR /nuxt

RUN npm update && \
    npm uninstall -g yarn \
    npm install -g yarn \
    yarn global add nuxt && \
    yarn global add vue-cli
EXPOSE 3000
