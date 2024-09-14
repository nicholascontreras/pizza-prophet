# Full size node container with dev dependencies
# Used to build our ts into js
FROM node as builder
WORKDIR /usr/app

COPY ./package.json package.json
COPY ./package-lock.json package-lock.json
RUN npm ci

COPY ./tsconfig.json tsconfig.json
COPY ./src src
RUN npm run compile



# Slim node container for actually running the app
FROM node:alpine
WORKDIR /usr/app

COPY ./package.json package.json
COPY ./package-lock.json package-lock.json
RUN npm ci --omit=dev

COPY images/ images/
COPY --from=builder /usr/app/dist dist

CMD [ "npm", "start" ]
