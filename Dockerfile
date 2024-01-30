FROM node:latest
WORKDIR /app
COPY ./package*.json ./
COPY ./src/config/config.env ./src/config/
RUN npm install
COPY . /app
EXPOSE 8001
CMD [ "npm", "start", "dev" ]