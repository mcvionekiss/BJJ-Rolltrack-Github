# Use Node.js
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install @mui/material @emotion/react @emotion/styled @mui/x-date-pickers dayjs

COPY . .
EXPOSE 3000

CMD ["npm", "start"]