const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'uptime',
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        const duration1 = Math.round(
            (Date.now() - message.client.uptime) / 1000
        )
        const embed = client.util.embed()
        embed.setColor(client.color)
        embed.setDescription(`I am online from <t:${duration1}:R>`)
        message.channel.send({ embeds: [embed] }) 
    }
}
