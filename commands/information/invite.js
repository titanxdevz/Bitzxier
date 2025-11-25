const { EmbedBuilder ,ActionRowBuilder , ButtonBuilder , ButtonStyle } = require('discord.js')

// Command
module.exports = {
    name: 'invite',
    aliases: ['in'],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Invite Me')
                .setStyle(ButtonStyle.Link)
                .setURL(
                    `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`
                )
        )

        // Sending
        message.channel.send({
            embeds: [
                client.util.embed()
                    .setColor(client.color)
                    .setDescription(
                        `[Click here to invite me](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot)`
                    )
            ],
            components: [button]
        })
    }
}
