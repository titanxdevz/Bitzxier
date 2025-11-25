const { ClusterManager, HeartbeatManager } = require('discord-hybrid-sharding');
const axios = require('axios');
const config = require('./config.json');

const webhookUrl = config.WEBHOOK_URL;

// Auto Webhook Logger
async function logToWebhook(message) {
    try {
        await axios.post(webhookUrl, { content: `⚙️ **BITZXIER Cluster Manager**\n${message}` });
    } catch (err) {
        console.error("[Webhook Logger] Failed:", err.message);
    }
}

// Auto Scales Shards
const manager = new ClusterManager(`${__dirname}/index.js`, {
    totalShards: "auto",         
    shardsPerClusters: 1,         
    totalClusters: "auto",       
    mode: "process",
    token: config.TOKEN,
    respawn: true,               
});

manager.on("clusterCreate", (cluster) => {
    logToWebhook(`🚀 Cluster **${cluster.id}** launched`);
});

manager.on("clusterReady", (cluster) => {
    logToWebhook(`✅ Cluster **${cluster.id}** is ready`);
});

manager.on("clusterDisconnect", (cluster) => {
    logToWebhook(`⚠️ Cluster **${cluster.id}** disconnected (auto-respawn enabled)`);
});

manager.on("clusterRespawn", (cluster) => {
    logToWebhook(`♻️ Cluster **${cluster.id}** respawning...`);
});

manager.spawn({ timeout: -1 }).then(() => {
    logToWebhook(" All clusters have been launched automatically.");
});

manager.extend(
    new HeartbeatManager({
        interval: 3000,           
        maxMissedHeartbeats: 5,
    })
);

process.on("uncaughtException", (err) => {
    logToWebhook(`🔥 **Uncaught Exception**\n\`\`\`${err.stack || err}\`\`\``);
});

process.on("unhandledRejection", (reason) => {
    logToWebhook(`⚡ **Unhandled Rejection**\n\`\`\`${reason}\`\`\``);
});
