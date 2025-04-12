# Simplified Dockerfile for testing purposes
# This avoids the multi-stage build and optimization of the production version

FROM node:20-alpine

# Add build dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory explicitly to frontend
WORKDIR /app/frontend

# Copy package files first
COPY frontend/package*.json ./

# Install dependencies before copying the rest of the files
RUN npm install

# Copy the frontend application
COPY frontend/ .

# Create logs directory
RUN mkdir -p logs && \
    chown -R node:node .

# Specifically set to development mode for easier debugging
ENV NODE_ENV=development
ENV PATH /app/frontend/node_modules/.bin:$PATH

# Expose development port
EXPOSE 3000

# Default command is to start the development server
# This can be overridden in docker-compose
CMD ["npm", "start"]