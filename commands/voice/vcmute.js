const {
    EmbedBuilder
} = require('discord.js')

module.exports = {
    name: 'vcmute',
    category: 'voice',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('MuteMembers')) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Mute members\` permission to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        if (!message.guild.members.me.permissions.has('MuteMembers')) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `I must have \`Mute members\` permission to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        if (!message.member.voice.channel) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `You must be connected to a voice channel first.`
                        )
                ]
            })
        }
        let member1 =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0])
        if (!member1) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `You must mention someone whom you want to mute in your vc.`
                        )
                ]
            })
        }
        let member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0])
        if (!member.voice.channel) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `<@${member.user.id}> is not in your vc.`
                        )
                ]
            })
        }
        try {
            member.voice.setMute(
                true,
                `${message.author.tag} (${message.author.id})`
            )
            message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | Successfully Muted <@${member.user.id}> From Voice!`
                        )
                ]
            })
        } catch (err) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `I was unable to voice mute <@${member.user.id}>.`
                        )
                ]
            })
        }
    }
}
