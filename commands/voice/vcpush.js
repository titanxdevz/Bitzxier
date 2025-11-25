const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'vcpush',
    category: 'voice',
    run: async (client, message, args) => {
        const roastingLines = [
            "Next time, try reading the rules, genius.",
            "Permission denied. Better luck next time, champ.",
            "Looks like you're not the boss here.",
            "You can't sit with us... or move us.",
            "No power, no glory. Sad life.",
            "Imagine thinking you have permissions. Couldn't be you.",
            "Try again when you're in charge, rookie.",
            "Permission? Nah, not today.",
            "Oops, someone forgot to level up their permissions.",
            "Not everyone can be a hero. Especially not you."
        ];

        const getRandomRoast = () => roastingLines[Math.floor(Math.random() * roastingLines.length)];

        if (!message.member.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Move Members\` permission to use this command.`
                )
                .setFooter({ text: getRandomRoast() });
            return message.channel.send({ embeds: [error] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MoveMembers)) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `I must have \`Move Members\` permission to use this command.`
                )
                .setFooter({ text: getRandomRoast() });
            return message.channel.send({ embeds: [error] });
        }

        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!member) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`Please provide a valid member.`)
                        .setFooter({ text: getRandomRoast() })
                ]
            });
        }

        let channel = message.guild.channels.cache.get(args[1]) || message.mentions.channels.first();
        if (!channel || channel.type !== ChannelType.GuildVoice) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`Please provide a valid voice channel.`)
                        .setFooter({ text: getRandomRoast() })
                ]
            });
        }

        if (!member.voice.channel) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`The provided member is not connected to a voice channel.`)
                        .setFooter({ text: getRandomRoast() })
                ]
            });
        }

        if (member.voice.channel.id === channel.id) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`The member is already in the specified voice channel.`)
                        .setFooter({ text: getRandomRoast() })
                ]
            });
        }

        const permissions = channel.permissionsFor(message.member);
        if (!permissions || !permissions.has(PermissionsBitField.Flags.Connect)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`You do not have permission to join ${channel}.`)
                        .setFooter({ text: getRandomRoast() })
                ]
            });
        }

        try {
            await member.voice.setChannel(channel.id, `${message.author.tag} | ${message.author.id}`);
            await message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`Successfully moved ${member} to ${channel}!`)
                ]
            });
        } catch (err) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`I don't have the required permissions to move members to ${channel}.`)
                        .setFooter({ text: getRandomRoast() })
                ]
            });
        }
    }
};
