# Backend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production --legacy-peer-deps

# Copy all source files
COPY . .

# Expose port (will be configured via environment variable)
EXPOSE ${PORT:-8089}

# Start the application
CMD ["npm", "start"]
