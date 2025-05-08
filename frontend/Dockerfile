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

# Copy the build files from the build stage
COPY --from=build /app/frontend/build /usr/share/nginx/html

# Copy custom nginx configuration if needed
#COPY frontend/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
