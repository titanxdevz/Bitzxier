const {
    EmbedBuilder , ChannelType
} = require('discord.js');

module.exports = {
    name: 'vcmoveall',
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

        let channel =
            message.mentions.channels.first() ||
            message.guild.channels.cache.get(args[0]);
        if (!channel || channel.type !== ChannelType.GuildVoice) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `Invalid or non-existent voice channel provided.`
                        )
                ]
            });
        }
        let own = message.author.id == message.guild.ownerId
        if (
            !own &&
            message.member.roles.highest.position <=
                message.guild.members.me.roles.highest.position
        ) {
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
        if(channel.id === message.member.voice.channel.id) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | your providing same voice channel as you.`
                        )
                ]
            })
            }
        try {
            let i = 0;
            message.member.voice.channel.members.forEach(async (member) => {
                i++;
                await client.util.sleep(200)
                await member.voice.setChannel(channel.id,`${message.author.tag} | ${message.author.id}`);

            });
           await message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | Successfully Moved ${i} Members to ${channel}!`
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
