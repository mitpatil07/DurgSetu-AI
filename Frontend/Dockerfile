FROM node:20-alpine

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

EXPOSE 5173

# Run Vite dev server with host binding for Docker
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
