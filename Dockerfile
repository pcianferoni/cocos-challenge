# First stage
FROM node:20.18-alpine AS installer
WORKDIR /app

# Copying package.json & package-lock.json.
COPY package*.json .

# Running npm ci
RUN npm ci

FROM node:20.12-alpine AS release
WORKDIR /app

# Copying all the contents from previous stage(used - - from) into current stage
COPY --from=installer /app /app

# Copying all the repo content into our Docker environment
COPY . .

# Generate prisma statics
RUN npx prisma generate

# Build app
RUN npm run build

# USER node

# Run app when execute `docker run ...` or `docker compose up`
CMD npm run start:prod