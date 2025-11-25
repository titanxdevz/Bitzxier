const { EmbedBuilder } = require('discord.js')
const { getSettingsar } = require('../../models/autorole')

module.exports = {
    name: 'welcomechannel',
    category: 'welcomer',
    premium: false,

    run: async (client, message, args) => {

        const settings = await getSettingsar(message.guild)
        if (!message.member.permissions.has('Administrator')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `You must have \`Administration\` perms to run this command.`
                        )
                ]
            })
        }
        let isown = message.author.id == message.guild.ownerId
        if (!isown && !client.util.hasHigher(message.member)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have a higher role than me to use this command.`
                        )
                ]
            })
        }
        let channel =
            message.mentions.channels.first() ||
            message.guild.channels.cache.get(args[0])
        if (!channel) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `You didn't mentioned the channel to set as welcome channel.`
                        )
                ]
            })
        }
        let response = await client.util.setChannel(settings, channel)
        return message.channel.send({
            embeds: [
                client.util.embed()
                    .setColor(client.color)
                    .setDescription(response)
            ]
        })
    }
}
