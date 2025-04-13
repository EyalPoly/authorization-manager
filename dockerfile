FROM node:22.14.0-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]