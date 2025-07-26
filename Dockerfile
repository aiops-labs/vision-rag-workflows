# ---- Build Stage ----
FROM node:20 AS builder

WORKDIR /app

# Copy root and package manifests for better caching
COPY package*.json ./
COPY packages/shared-workflows/package.json ./packages/shared-workflows/
COPY packages/worker/package.json ./packages/worker/
# (Add other package.json files if needed for workspace resolution)

# Install all dependencies (including dev)
RUN npm install

# Copy the rest of the monorepo
COPY . .

# Build all packages (using your build.sh)
RUN chmod +x ./build.sh && ./build.sh

# ---- Production Stage ----
FROM node:20-slim AS runner

WORKDIR /app

# Copy only production node_modules (from builder)
COPY --from=builder /app/node_modules ./node_modules

# Copy only the built output and necessary files
COPY --from=builder /app/packages/worker/dist ./packages/worker/dist
COPY --from=builder /app/packages/shared-workflows/dist ./packages/shared-workflows/dist
COPY --from=builder /app/packages/worker/package.json ./packages/worker/
COPY --from=builder /app/packages/shared-workflows/package.json ./packages/shared-workflows/
# (Copy any other runtime files needed)

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the worker
CMD ["node", "packages/worker/dist/worker.js"]