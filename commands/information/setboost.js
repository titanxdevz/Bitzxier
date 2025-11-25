const { EmbedBuilder } = require('discord.js')
const db = require('../../models/boost.js')

module.exports = {
    name: 'setboost',
    aliases: ['boost'],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have \`Administration\` perms to run this command.`
                        )
                ]
            })
        }
        let disable = args[0] ? args[0].toLowerCase() == 'off' : null
        let channel,
            hasPerms = null
        if (!disable)
            channel =
                message.mentions.channels.first() ||
                message.guild.channels.cache.get(args[0])
        if (!disable && !channel) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setFooter({ text : `if you want enable boost message then provied channel\n${message.guild.prefix}setboost <#channel> or Channel id \nfor disable type ${message.guild.prefix}setboost off`})
                        .setDescription(
                            `${client.emoji.cross} | You didn't provided a valid channel.`
                        )
                ]
            })
        }
        if (!disable)
            hasPerms = message.guild.members.me
                .permissionsIn(channel)
                .has('SendMessages')
        if (!disable && !hasPerms) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I didn't have permissions to send messages in <#${channel.id}>.`
                        )
                ]
            })
        }
        let data = await db.findOne({ Guild: message.guildId })
        if (!data)
            data = new db({
                Guild: message.guild.id,
                Boost: disable ? null : channel.id
            })
        else data.Boost = disable ? null : channel.id
        await data.save()
        message.channel.send({
            embeds: [
                client.util.embed()
                    .setColor(client.color)
                    .setDescription(
                        disable
                            ? `${client.emoji.tick} | I'll not send messages when when someone boosts the server.`
                            : `${client.emoji.tick} | I'll now send messages to <#${channel.id}> when someone boosts the server.`
                    )
            ]
        })
    }
}
