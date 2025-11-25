const {
    EmbedBuilder,
} = require('discord.js');

module.exports = {
    name: 'nick',
    aliases: [],
    category: 'mod',
    premium: false,

    run: async (client, message, args) => {
        let role = await client.db.get(`modrole_${message.guild.id}`) || null;

        if (!message.member.permissions.has('ManageNicknames') && !message.member.roles.cache.has(role)) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Manage Nicknames\` permission to use this command.`
                );
            return message.channel.send({ embeds: [error] });
        }
        if (!message.guild.members.me.permissions.has('ManageNicknames')) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `I must have \`Manage Nicknames\` permission to use this command.`
                );
            return message.channel.send({ embeds: [error] });
        }
        if (!client.util.hasHigher(message.member) && !message.member.roles.cache.has(role)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have a higher role than me to use this command.`
                        )
                ]
            });
        }

        if (!args.length) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | Please provide a member and optionally a new nickname.`)
                ]
            });
        }

        let member = await getUserFromMention(message, args[0]);
        let name = args.slice(1).join(" ");
        if (!member) {
            try {
                member = await message.guild.members.fetch(args[0]);
            } catch (error) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Please provide a valid member.`)
                    ]
                });
            }
        }

        try {
            if (member && !name) {
                await member.setNickname(null);
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.tick} | ${member}'s nickname has been successfully removed.`)
                    ]
                });
            } else {
                await member.setNickname(name);
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.tick} | ${member}'s nickname has been successfully changed to ${name}.`)
                    ]
                });
            }
        } catch (err) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | I may not have sufficient permissions or my highest role may not be above or the same as ${member}.`)
                ]
            });
        }
    }
};

function getUserFromMention(message, mention) {
    if (!mention) return null;

    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    return message.guild.members.fetch(id).catch(() => null); // Catch errors if member is not found
}
