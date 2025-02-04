# Build stage using Node.js to compile the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Set build arguments (these will be passed at build time)
ARG VITE_BACKEND_URL

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Set Vite environment variable at build time
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Build the Vite app
RUN npm run build

# Serve the built frontend with Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
