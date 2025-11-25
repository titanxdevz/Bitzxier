const { Discord } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
this.config = require(`${process.cwd()}/config.json`);

module.exports = {
    name: 'listpremium',
    aliases: ['listprem', 'premusers'],
    category: 'Owner',
    run: async (client, message, args) => {
        const embed = client.util.embed().setColor(client.color);

        if (!this.config.premium.includes(message.author.id)) return;

        // Fetch all keys from the database
        const keys = await client.db.all(); // Adjust this according to your database library

        // Filter keys that start with 'uprem_' and have value 'true'
        const premiumUsers = keys.filter(key => key.ID.startsWith('uprem_') && key.data === 'true');

        if (premiumUsers.length === 0) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(`No premium users found.`)
                ]
            });
            
        }

        // Create a list of premium user details
        const premiumUserList = await Promise.all(premiumUsers.map(async user => {
            const userId = user.ID.split('_')[1];
            const userEnd = await client.db.get(`upremend_${userId}`);
            const userCount = await client.db.get(`upremcount_${userId}`);

            return `<@${userId}> - Premium Count: \`${userCount}\` - Expiry: <t:${Math.round(userEnd / 1000)}>`;
        }));

        return message.channel.send({
            embeds: [
                embed
                    .setColor(client.color)
                    .setDescription(`Premium Users:\n${premiumUserList.join('\n')}`)
            ]
        });
    }
};



