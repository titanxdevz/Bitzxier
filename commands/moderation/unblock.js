const {
    Message,
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder
} = require('discord.js')

module.exports = {
    name: 'unblock',
    aliases: [],
    category: 'mod',
    cooldown: 5,
    premium: false,

    run: async (client, message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Administrator\` permission to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        if (!message.guild.members.me.permissions.has('Administrator')) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `I must have \`Administrator\` permission to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        if (!args[0]) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Please Provide Valid user ID or Mention Member To Unblock.`
                            )
                    ]
                })
      }
        let user = await getUserFromMention(message, args[0])
        if (!user) {
            try {
                user = await message.guild.members.cache.get(args[0])
            } catch (error) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Please Provide Valid user ID or Mention Member To Unblock.`
                            )
                    ]
                })
            }
        }
        const channel =
        message.mentions.channels.first() ||
        message.guild.channels.cache.get(args[2]) ||
        message.channel

        let isown = message.author.id == message.guild.ownerId

        if (user.id === client.user.id) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You can't Unblock Me.`
                        )
                ]
            })
        }
        if (user.id === message.guild.ownerId) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I can't unblock the owner of this server.`
                        )
                ]
            })
        }
        if (!client.util.hasHigher(message.member) && !isown) {
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
        if(user.permissions.has("Administrator")) {
            return message.channel.send({ embeds : [client.util.embed().setColor(client.color).setDescription(`${client.emoji.cross} | You Cannot Unblock The Administrator Of This Server`)]})
        }

            channel.permissionOverwrites.edit(user.id, {
                ViewChannel : true,
                SendMessages : true,
                reason: `${message.author.tag} (${message.author.id})`
            })
            const emb = client.util.embed()
                .setDescription(`${user} has been unblocked for ${channel}`)
                .setColor(client.color)
            return message.channel.send({ embeds: [emb] })
    }
}


function getUserFromMention(message, mention) {
    if (!mention) return null

    const matches = mention.match(/^<@!?(\d+)>$/)
    if (!matches) return null

    const id = matches[1]
    return message.guild.members.fetch(id)
}
