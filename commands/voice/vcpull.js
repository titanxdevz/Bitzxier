const {
    MessageEmbed
} = require('discord.js');

module.exports = {
    name: 'vcpull',
    category: 'voice',
    run: async (client, message, args) => {
        if (!message.member.permissions.has('MoveMembers')) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Move members\` permission to use this command.`
                );
            return message.channel.send({
                embeds: [error]
            });
        }
        if (!message.guild.members.me.permissions.has('MoveMembers')) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `I must have \`Move members\` permission to use this command.`
                );
            return message.channel.send({
                embeds: [error]
            });
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
            });
        }
        let member =
            message.mentions.members.first() ||
            message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `Please Proide a valid member`
                        )
                ]
            });
        }
        if(!member.voice.channel) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `provided member is not connected to voice channel.`
                        )
                ]
            });
        }

        if(member.voice.channel.id === message.member.voice.channel.id) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | did you think i am dumb ? you both are in same voice channel`
                        )
                ]
            })
            }
        try {
            await member.voice.setChannel(message.member.voice.channel.id,`${message.author.tag} | ${message.author.id}`)
           await message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | Successfully Moved ${member} Members to ${message.member.voice.channel}!`
                        )
                ]
            });
        } catch (err) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `I don't have the required permissions to move members to ${channel}.`
                        )
                ]
            });
        }
    }
};
