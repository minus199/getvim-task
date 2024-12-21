# Stage 1: Build
FROM node:18 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . ./

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:18 AS production

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files for production
COPY package*.json ./
RUN npm ci --only=production

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
