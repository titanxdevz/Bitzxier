const { AsyncQueue } = require('@sapphire/async-queue');
const cooldowns = new Map();
let lastWarningTime = 0;

module.exports = async (client) => {
    const queue = new AsyncQueue();
    const messageDelay = 1000; // 1 second delay between deletions
    const warningCooldown = 10000; // 10 seconds cooldown for warning message


    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return;
        
        if(await client.util.BlacklistCheck(message?.guild)) return

        const mediaConfig = (await client.db.get(`mediachannel_${message.guild.id}`)) || { channel: [], user: [], role: [] };
        if (!mediaConfig || !Array.isArray(mediaConfig.channel) || mediaConfig.channel.length === 0) return;
        
        if (mediaConfig.channel.includes(message.channel.id) && 
            !message.attachments.size && 
            !message.member.roles.cache.some(r => mediaConfig.role.includes(r.id)) && 
            !mediaConfig.user.includes(message.author.id)) {
            
            await queue.wait();
            try {
                await message.delete().catch(() => {});
                await new Promise(resolve => setTimeout(resolve, messageDelay));
                
                if (Date.now() - lastWarningTime > warningCooldown) {
                    lastWarningTime = Date.now();
                    const errorMessage = client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `This channel is configured as a media-only channel. You are not allowed to send messages here without attachments.`
                        );
                    
                    const msg = await message.channel.send({ embeds: [errorMessage] }).catch(() => {});
                    if (msg) setTimeout(() => msg.delete().catch(() => {}), 5000);
                }
            } finally {
                queue.shift();
            }
        }
    });
};
