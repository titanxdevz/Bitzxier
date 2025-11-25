const { Client, MessageEmbed, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const saixd = ['1383706658315960330', '1207801591890190367'];

module.exports = {
    name: 'globalban',
    aliases: ['gban'],
    category: 'owner',
    run: async (client, message, args) => {
        if (!saixd.includes(message.author.id)) return;

        let userId;
        if (args[0].startsWith('<@') && args[0].endsWith('>')) {
            userId = getUserFromMention(args[0]);
        } else {
            try {
                const user = await client.users.fetch(args[0]);
                userId = user.id;
            } catch (error) {
                return message.channel.send({
                    embeds: [
                        new MessageEmbed()
                            .setColor('RED')
                            .setDescription('❌ | Please provide a valid user ID or mention a member.')
                    ]
                });
            }
        }

        if (!userId) {
            return message.channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setDescription('❌ | Could not resolve user ID.')
                ]
            });
        }

        // Broadcast the ban command to all clusters
        const results = await client.cluster.broadcastEval(async (client, { userId }) => {
            const mutualGuilds = client.guilds.cache.filter(guild => guild.members.cache.has(userId));
            let results = [];
            
            for (const [guildId, guild] of mutualGuilds) {
                try {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Sleep
                    await guild.members.ban(userId, { 
                        reason: "User has been globally banned due to repeated and severe violations of Discord's terms of service, including but not limited to harassment, nuking, spamming, distributing malicious content, and engaging in activities that undermine the safety and well-being of the Discord community. This global ban is a result of a pattern of behavior that is deemed unacceptable, and it is necessary to ensure the integrity and security of multiple servers on the platform."
                    });
                    results.push(`Banned from ${guild.name}`);
                } catch (err) {
                    results.push(`Couldn't ban from ${guild.name}: ${err.message}`);
                    if (err.code === 429) {
                        // Handle rate limits properly
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Adjust the wait time as needed
                    }
                }
            }
            return results;
        }, { context: { userId } });

        // Collect and display the results from all clusters
        const allResults = results.flat();
        for (const res of allResults) {
            await message.channel.send(res);
        }
    }
};

function getUserFromMention(mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);
    return matches ? matches[1] : null;
}
