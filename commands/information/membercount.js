const { Message, Client, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'membercount',
    aliases: ['mc'],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        const embed = client.util.embed()
            .setColor(client.color)
            .setTitle(`Members`)
            .setDescription(`${message.guild.memberCount}`)
            .setTimestamp()

        message.channel.send({ embeds: [embed] })
    }
}
