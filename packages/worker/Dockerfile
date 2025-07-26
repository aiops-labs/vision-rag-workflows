# ---- Build Stage ----
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    # Copy only package manifests for cache optimization
    COPY package*.json ./
    COPY packages/worker/package.json ./packages/worker/
    COPY packages/shared-workflows/package.json ./packages/shared-workflows/
    
    # Install full monorepo deps (dev + prod) using npm workspaces
    RUN npm ci
    
    # Copy full source (after installing deps)
    COPY . .
    
    # Build script must compile packages/worker and dependencies into /dist
    RUN chmod +x ./build.sh && ./build.sh
    
    # Optionally prune devDependencies to minimize node_modules
    RUN npm prune --omit=dev
    
    # ---- Runner Stage ----
    FROM gcr.io/distroless/nodejs20-debian11 AS runner
    
    WORKDIR /app
    
    # Copy only what's needed at runtime
    COPY --from=builder /app/packages/worker/dist ./dist
    COPY --from=builder /app/packages/worker/package.json ./package.json
    COPY --from=builder /app/node_modules ./node_modules
    
    # Use Distroless runtime (no shell, no bash, just Node)
    CMD ["node" , "dist/worker.js"]
    