# Use node version 8 as parent image
FROM node:8

# Set working dir to app
WORKDIR /app

# Copy contents of current dir into app
COPY . /app

# Install node modules
RUN npm install

# Make port 3000 available outside
EXPOSE 3000

# Run the node http server with npm
ENTRYPOINT ["npm", "start"]
CMD []
