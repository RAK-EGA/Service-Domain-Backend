# Use the official Node.js image as a base
FROM node:21-alpine3.19
 
# Set the working directory
WORKDIR /app
 
# Copy package.json and package-lock.json to install dependencies
COPY . .
 
# Install dependencies
RUN npm install
# Make port 3000 available to the world outside this container
EXPOSE 5000
# Start the Node Native app
CMD node app.js

