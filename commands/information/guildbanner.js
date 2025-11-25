const { Message, Client, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'serverbanner',
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        if (message.guild.banner) {
            let embed = client.util.embed()
                .setTitle(`${message.guild.name} SERVER BANNER`)
                .setColor(`#2f3136`)
                .setImage(message.guild.bannerURL({ size: 4096 }))
            message.channel.send({ embeds: [embed] })
        } else {
            let embed = client.util.embed()
                .setDescription(`This Server has no Banner!`)
                .setColor(client.color)

            message.channel.send({ embeds: [embed] })
        }
    }
}
