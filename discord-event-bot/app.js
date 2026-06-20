// app.js
const fs = require("fs");
const path = require("path");
const express = require("express");
const moment = require("moment-timezone");
const { Client, GatewayIntentBits } = require("discord.js");

const config = require("./config.json");
const USERS_FILE = path.join(__dirname, "users.json");

// ---------------------------
// 1. Discord Bot
// ---------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    console.log(`Bot logged in as ${client.user.tag}`);
    startScheduler();
});

client.login(config.token);

// ---------------------------
// 2. Scheduler
// ---------------------------
function startScheduler() {
    let eventIndex = 0;

    async function createNextEvent() {
        let users;
        try {
            users = JSON.parse(fs.readFileSync(USERS_FILE));
        } catch (e) {
            console.error("Failed to read users.json:", e);
            users = [];
        }

        if (!users || users.length === 0) {
            console.log("No users in users.json. Waiting 5 minutes before retrying.");
            setTimeout(createNextEvent, 1000 * 60 * 5);
            return;
        }

        let guild;
        try {
            guild = await client.guilds.fetch(config.guildId);
        } catch (e) {
            console.error("Failed to fetch guild:", e);
            setTimeout(createNextEvent, 1000 * 60 * 5);
            return;
        }

        const user = users[eventIndex % users.length];
        const eventNumber = (eventIndex % 15) + 1;

        const startTimeUTC = moment().add(1, "hour").utc().toDate();
        const endTimeUTC = moment().add(2, "hour").utc().toDate();

        try {
            await guild.scheduledEvents.create({
                name: `Event #${eventNumber} — ${user.name}`,
                scheduledStartTime: startTimeUTC,
                scheduledEndTime: endTimeUTC,
                privacyLevel: 2,
                entityType: 3,
                description: `Assigned to ${user.name}`
            });

            console.log(`Created event #${eventNumber} for ${user.name}`);
            sendUserNotification(user, startTimeUTC);
        } catch (e) {
            console.error("Failed to create scheduled event:", e);
        }

        eventIndex++;
        setTimeout(createNextEvent, 1000 * 60 * 60 * 2); // every 2 hours
    }

    createNextEvent();
}

function sendUserNotification(user, utcDate) {
    const unix = Math.floor(utcDate.getTime() / 1000);
    const channel = client.channels.cache.get(config.channelId);

    if (!channel) {
        console.error("Notification channel not found. Check channelId in config.json.");
        return;
    }

    channel.send(
        `<@${user.id}> your next event is scheduled at <t:${unix}:F>.`
    ).catch(err => console.error("Failed to send notification:", err));
}

// ---------------------------
// 3. Dashboard Server
// ---------------------------
const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/api/users", (req, res) => {
    try {
        const users = JSON.parse(fs.readFileSync(USERS_FILE));
        res.json(users);
    } catch (e) {
        console.error("Failed to read users.json:", e);
        res.status(500).json({ error: "Failed to read users.json" });
    }
});

app.post("/api/users", (req, res) => {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (e) {
        console.error("Failed to write users.json:", e);
        res.status(500).json({ error: "Failed to write users.json" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Dashboard running at http://localhost:${PORT}`);
});