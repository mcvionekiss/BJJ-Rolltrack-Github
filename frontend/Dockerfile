# Multi-stage build for production-ready frontend
# Stage 1: Build the application
FROM node:20-alpine as build

# Add build dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory
WORKDIR /app/frontend

# Copy package files first
COPY frontend/package*.json ./

# Install dependencies before copying the rest of the files
RUN npm install

# Copy the frontend application
COPY frontend/ .

# Create logs directory
RUN mkdir -p logs

# Build the application for production
RUN npm run build

# Stage 2: Serve the application using nginx
FROM nginx:alpine

# Copy the build files from the build stage
COPY --from=build /app/frontend/build /usr/share/nginx/html

# Copy custom nginx configuration if needed
COPY frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]