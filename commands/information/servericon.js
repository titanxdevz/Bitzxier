const {
    Message,
    Client,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder
} = require('discord.js')

module.exports = {
    name: 'servericon',
    aliases: ['serverav', 'serveravatar'],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        if(message.guild.icon !== null) {
        const embed = client.util.embed()
            .setDescription(
                `[\`PNG\`](${message.guild.iconURL({
                    dynamic: true,
                    size: 2048,
                    format: 'png'
                })}) | [\`JPG\`](${message.guild.iconURL({
                    dynamic: true,
                    size: 2048,
                    format: 'jpg'
                })}) | [\`WEBP\`](${message.guild.iconURL({
                    dynamic: true,
                    size: 2048,
                    format: 'webp'
                })})`
            )
            .setColor(client.color)
            .setImage(message.guild.iconURL({ dynamic: true, size: 2048 }))

        message.channel.send({ embeds: [embed] }) 
    } else {
        return message.channel.send({
            embeds : [
                client.util.embed().setColor(client.color).setDescription(`${client.emoji.cross} | This Guild Has No Avatar`)
            ]
        })
    }
    }
}
