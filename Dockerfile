FROM node:carbon

WORKDIR /usr/src/app

# Install dependencies
COPY package.json ./
RUN npm install

COPY src src
COPY data data

CMD ["npm", "start"]

