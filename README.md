<p align="center">
    <img src="https://cdn.dribbble.com/users/2401141/screenshots/5487982/developers-gif-showcase.gif" width="200" alt="Logo">
  <h1 align="center">DevBook</h1>

  <p align="center">
    FaceBook for Developers!
  </p>
</p>

[![PR's Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](https://github.com/Team-Gucci-Gang/DevBook/pulls)
![PRs](https://img.shields.io/github/issues-pr-closed/Team-Gucci-Gang/DevBook?color=pink)
![Issues](https://img.shields.io/github/issues/Team-Gucci-Gang/DevBook?color=purple)
[![Contributors](https://img.shields.io/github/contributors/Team-Gucci-Gang/DevBook)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Languages](https://img.shields.io/github/languages/count/Team-Gucci-Gang/DevBook?color=orange)

---

Whether you use this project, have learned something from it, or just like it, please consider supporting it by starring or forking it.

---

## Features

- Register with your Github account
- Create posts, share media, upload code snippets, react to posts
- Follow users with similar profiles
- Search users by the programming languages they know
- Chat with users in real-time
- Get notified for upcoming events

---

## Setup

- Clone this repo to your desktop and run `npm install` to install all the dependencies.

- You might want to look into `config/index.js` to make change the port you want to use.

- Create a file called `s3_config.json` under the `config` folder and add your AWS-S3 configuration to it (required for static content)
```
json
{
  "accessKeyId": "your_access_key_id",
  "secretAccessKey": "your_secret_access_key",
  "region": "your_aws_region"
}
```

- Copy .env.example file and populate the required environment variables


# Github
```
GITHUB_CLIENT_ID =
GITHUB_CLIENT_SECRET =
GITHUB_REDIRECT =
```
# MongoDB
```
DB_CONNECTION_URI =
```

```
PORT = 8080
```

---

## Usage

After you clone this repo to your desktop, go to its root directory and run `npm install` to install its dependencies.

Once the dependencies are installed, you can run `npm start` to start the application. You will then be able to access it at localhost:8080

---

## License

> You can check out the full license [here](https://github.com/Team-Gucci-Gang/DevBook/blob/master/LICENSE)

This project is licensed under the terms of the *MIT* license.
