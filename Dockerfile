FROM node:16-alpine

# Required files are whitelisted in dockerignore
COPY . ./
RUN npm install
RUN npm run build

EXPOSE 80
CMD ["npm", "start"]
