# Argonavis
# Discord Event Bot — Rotating Events + Web Dashboard

A fully automated Discord bot that:

- Creates **15 rotating scheduled events**
- Cycles through a **user list**
- Sends notifications using **Discord’s native timestamp format** (`<t:unix:F>`)
- Includes a **web dashboard** to edit users, names, and timezones
- Runs everything from **one command**

---

## Setup

### 1. Install Node.js  
https://nodejs.org

### 2. Install dependencies

npm install

Code

### 3. Configure the bot

Edit `config.json`:

```json
{
  "token": "YOUR_DISCORD_BOT_TOKEN",
  "guildId": "YOUR_GUILD_ID",
  "channelId": "CHANNEL_FOR_NOTIFICATIONS"
}
4. Start the bot
Code
npm start
Dashboard:
http://localhost:3000
