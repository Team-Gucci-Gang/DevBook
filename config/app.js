var dbHost = process.env.dbHost || "localhost";
require('dotenv').config();

module.exports = {
  name: devbook,
  title: devbook,
  commands: {
    package:
      "electron-packager electron.js openfuel --electronVersion=2.0.12 --overwrite --icon=/public/images/logo/logo.png --prune=true --out=release",
    build: ""
  },
  http: {
    host: "localhost",
    port: 8080
  },
  author: "Soham Parekh",
  version: "1.0.0",
  db: {
    connectionUri: process.env.DB_CONNECTION_URI,
    params: {},
    collections: ["moment", "user", "feeling", "ask"]
  }
};
