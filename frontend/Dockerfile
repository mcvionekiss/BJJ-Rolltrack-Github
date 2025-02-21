FROM node:20-alpine

# Add build dependencies
RUN apk add --no-cache python3 make g++ git

# Set working directory explicitly to frontend
WORKDIR /app/frontend

# Copy package files for frontend only
COPY package*.json ./
COPY package-lock*.json ./

# Copy the frontend application
COPY . .

# Install dependencies
RUN npm install

# Create logs directory
RUN mkdir -p logs && \
    chown -R node:node .

# Use node user instead of root
USER node

ENV NODE_ENV=development
ENV PATH /app/frontend/node_modules/.bin:$PATH

EXPOSE 3000

CMD ["npm", "start"]