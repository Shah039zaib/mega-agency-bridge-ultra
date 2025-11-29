FROM node:18-slim
WORKDIR /app
COPY package.json ./
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install --omit=dev
COPY . .
ENV PORT=3000
EXPOSE 3000
CMD [ "npm", "start" ]
