# ArticleGen

**ArticleGen** is a full-stack web application that generates satirical articles based on a given topic.

It aggregates real news articles using [NewsAPI](https://newsapi.org/) and then transforms them into humorous, satirical versions with the help of [OpenAI](https://openai.com/)'s GPT-3.5 Turbo.

The app is built with **React + Vite** on the frontend and **Node.js + Express** on the backend. **MongoDB** is used to store both original and generated articles.

The entire application is **containerized with Docker** and deployed on an **AWS Lightsail VPS**, with **Traefik** acting as a reverse proxy and **Let's Encrypt** handling SSL certificates.

## 🔗 Live App

Check it out here → [LetsGenerateArticles.com](http://letsgeneratearticles.com/)

## 🛠 Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Infrastructure:** Docker, AWS Lightsail
- **Networking & Security:** Traefik, Let's Encrypt
- **APIs & AI:** NewsAPI, OpenAI

## 🚀 Running Locally

1. Clone the repository:

   ```sh
   git clone https://github.com/aguizaro/ArticleGen.git
   cd ArticleGen
   ```

2. Create a `.env` file in the root directory and add the following environment variables:

   ```sh
   MONGO_INITDB_ROOT_USERNAME=username
   MONGO_INITDB_ROOT_PASSWORD=password
   MONGO_DB_PORT=port
   MONGO_URI=mongodb://username:password@mongo:port

   OPENAI_API_KEY=key
   NEWS_API_KEY=key

   DOMAIN_NAME=yourdomain.com
   LETSENCRYPT_EMAIL=you@email.com
   ```

3. Set up docker network:

   ```sh
   docker network create web
   ```

4. Start the application using docker compose:
   ```sh
   docker-compose up -d
   ```
