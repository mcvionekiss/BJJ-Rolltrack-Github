# Use Node.js
FROM node:20-alpine

# Set environment variables
ARG REACT_APP_ENV=development
ARG REACT_APP_API_URL=http://localhost:8000
ARG REACT_APP_PUBLIC_URL=http://localhost:3000

ENV REACT_APP_ENV=${REACT_APP_ENV}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_PUBLIC_URL=${REACT_APP_PUBLIC_URL}
ENV NODE_ENV=${REACT_APP_ENV}

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

# For production/staging: build the app and setup nginx
RUN if [ "$REACT_APP_ENV" = "production" ] || [ "$REACT_APP_ENV" = "staging" ]; then \
        npm run build && \
        apk add --no-cache nginx && \
        mkdir -p /run/nginx && \
        echo 'server { \
            listen 80; \
            root /app/frontend/build; \
            location / { \
                try_files $uri $uri/ /index.html; \
            } \
        }' > /etc/nginx/http.d/default.conf; \
    fi

# Use node user for development, root for production (nginx needs it)
USER node
RUN if [ "$REACT_APP_ENV" = "production" ] || [ "$REACT_APP_ENV" = "staging" ]; then \
        echo "Running as root for production/staging"; \
    else \
        echo "Running as node for development"; \
    fi

# Set PATH for development
ENV PATH /app/frontend/node_modules/.bin:$PATH

# Expose port 3000 for development, 80 for production
EXPOSE 3000 80

# Start the appropriate server based on environment
CMD if [ "$REACT_APP_ENV" = "production" ] || [ "$REACT_APP_ENV" = "staging" ]; then \
        nginx -g 'daemon off;'; \
    else \
        npm start; \
    fi