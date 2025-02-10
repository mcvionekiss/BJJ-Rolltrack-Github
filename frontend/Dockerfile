# Use Node.js
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install @mui/material @emotion/react @emotion/styled

COPY . .
EXPOSE 3000

CMD ["npm", "start"]