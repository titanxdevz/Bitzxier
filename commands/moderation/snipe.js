module.exports = {
    name: 'snipe',
    aliases: [],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        // Check if the user has the Manage Messages permission
        if (!message.member.permissions.has('ManageMessages')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `You must have \`Manage Messages\` permissions to run this command.`
                        )
                ]
            });
        }

        // Listen for deleted messages
        client.on('messageDelete', async (deletedMessage) => {
            if (deletedMessage?.author?.bot) return;

            const snipeData = {
                content: deletedMessage.content || 'No content available',
                author: deletedMessage.author.tag || 'Unknown Author',
                timestamp: deletedMessage.createdTimestamp,
                imageUrl: deletedMessage.attachments.size > 0
                    ? deletedMessage.attachments.first().url
                    : null
            };
            // Insert snipe data into the database
            const insertSnipe = client.snipe.prepare('INSERT INTO snipes (guildId, channelId, content, author, timestamp, imageUrl) VALUES (?, ?, ?, ?, ?, ?)');
            insertSnipe.run(deletedMessage.guild.id, deletedMessage.channel.id, snipeData.content, snipeData.author, snipeData.timestamp, snipeData.imageUrl);
        });

        // Retrieve the last snipe data
        const getLastSnipe = client.snipe.prepare('SELECT * FROM snipes WHERE guildId = ? AND channelId = ? ORDER BY timestamp DESC LIMIT 1');
        const snipe = getLastSnipe.get(message.guild.id, message.channel.id);

        // Check if there's no snipe data
        if (!snipe) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`There are no deleted messages.`)
                ]
            });
        }

        // Create and send the embed with the sniped message
        const embed = client.util.embed()
            .setColor(client.color)
            .setTitle('Sniped Message')
            .addFields([
                {
                    name: 'Author',
                    value: snipe.author,
                },
                {
                    name: 'Timestamp',
                    value: `${new Date(snipe.timestamp).toLocaleString()}`,
                },
            ])
         if (snipe.content){
             embed.setDescription(`Content\n${snipe.content}`);
         }
        if (snipe.imageUrl) {
            embed.setImage(snipe.imageUrl);
        }

        return message.channel.send({ embeds: [embed] });
    },
};
