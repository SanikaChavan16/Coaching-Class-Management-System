FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available) and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 5000

# Correct CMD syntax (fixing missing space and adding file extension)
CMD ["node", "server.js"]
