# Use Node.js base image
FROM node:18

# Install system dependencies
RUN apt-get update && apt-get install -y \
    openssl \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install application dependencies
RUN npm install

# Copy Prisma schema and migrations
COPY prisma ./prisma

# Generate Prisma client with the correct binary target
RUN npx prisma generate

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Run migrations to ensure the database schema is up-to-date
RUN npx prisma migrate deploy

# Expose the application port
EXPOSE 3005

# Start the application
CMD ["npm", "start"]