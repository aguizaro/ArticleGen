FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]

