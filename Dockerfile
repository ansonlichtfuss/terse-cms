FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Set environment variables
ENV NODE_ENV production
ENV MARKDOWN_ROOT_DIR /content
ENV S3_BUCKET your-s3-bucket
ENV S3_REGION your-s3-region
ENV S3_ACCESS_KEY_ID your-s3-access-key
ENV S3_SECRET_ACCESS_KEY your-s3-secret-key
ENV USE_MOCK_API true
ENV GEMINI_API_KEY your-gemini-api-key

# Install git
RUN apk add --no-cache git

# Create content directory
RUN mkdir -p /content

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
