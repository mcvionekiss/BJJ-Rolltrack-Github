# Use Node.js
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install @mui/material @emotion/react @emotion/styled @emotion/styled date-fns@2.29.3 @mui/x-date-pickers dayjs

COPY . .
EXPOSE 3000

CMD ["npm", "start"]