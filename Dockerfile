# Stage 1: Builder
FROM node:lts-alpine AS builder

WORKDIR /app

# Copy package.json and lock file
COPY package.json pnpm-lock.yaml* ./

RUN corepack enable pnpm
# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runner
FROM node:lts-alpine AS runner

WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Install git
RUN apk add --no-cache git

# Create content directory
RUN mkdir -p /cms/files

# Hardcode MARKDOWN_ROOT_DIR
ENV MARKDOWN_ROOT_DIR_1=/cms/files

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
