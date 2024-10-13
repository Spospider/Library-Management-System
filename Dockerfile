# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your app's source code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "start", "migrate-and-start"]