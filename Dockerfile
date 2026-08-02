# 1. Base image: lightweight Node 20
FROM node:20-alpine

# 2. Set working directory inside container
WORKDIR /app

# 3. Copy dependency files first for better caching
COPY package*.json ./

# 4. Install only production dependencies
RUN npm ci --only=production

# 5. Copy the rest of your app code
COPY . .

# 6. Northflank sets PORT automatically, default to 3000
EXPOSE 3000

# 7. Health check so Northflank knows it's alive
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/', (r) => {if (r.statusCode !== 200) throw new Error()})"

  # 8. Start the server
  CMD ["npm", "start"]