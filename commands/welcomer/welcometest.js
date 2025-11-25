const { EmbedBuilder } = require('discord.js')
const { getSettingsar } = require('../../models/autorole')

module.exports = {
    name: 'welcometest',
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
        let response = await client.util.sendPreview(settings, message.member)
        return message.channel.send({
            embeds: [
                client.util.embed()
                    .setColor(client.color)
                    .setDescription(response)
            ]
        })
    }
}
