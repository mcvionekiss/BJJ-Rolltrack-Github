# Use Node.js
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

# Use node user instead of root
USER node

ENV NODE_ENV=development
ENV PATH /app/frontend/node_modules/.bin:$PATH

EXPOSE 3000

CMD ["npm", "start"]