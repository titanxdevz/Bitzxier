
module.exports = {
    name: 'unwhitelist',
    aliases: ['uwl'],
    category: 'security',
    premium: false,
    run: async (client, message, args) => {
        const { dot, enable, disable, protect, hii, tick } = client.emoji;

        let own = message.author.id === message.guild.ownerId;
        const check = await client.util.isExtraOwner(message.author, message.guild);
        if (!own && !check) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | Only Server Owner or Extra Owner can run this command.`)
                ]
            });
        }
        if (!own && !(message.guild.members.cache.get(client.user.id).roles.highest.position <= message.member.roles.highest.position)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | Only Server Owner or Extra Owner with a higher role than me can run this command.`)
                ]
            });
        }

        const user = message.mentions.users.first() ||
            message.guild.members.cache.get(args[0])
        if (!user) {
            return message.channel.send({
                embeds: [client.util.embed()
                    .setColor(client.color)
                    .setTitle('__**Unwhitelist Commands**__')
                    .setDescription('**Removes user from whitelisted users, which means that there will be proper actions taken on the member if they trigger the antinuke module.**')
                    .addFields([
                        {
                            name: '__**Usage**__',
                            value: `${dot} \`${message.guild.prefix}unwhitelist @user/id\`\n${dot} \`${message.guild.prefix}uwl @user\``
                        }
                    ])
                ]
            });
        }

        const antinuke = await client.db.get(`${message.guild.id}_antinuke`);
        if (!antinuke) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`**${message.guild.name} security settings ${protect} Ohh NO! Looks like your server hasn't enabled security.\n\nCurrent Status: ${disable}\n\nTo enable use \`antinuke enable\`**`)
                ]
            });
        }

        const data = await client.db.get(`${message.guild.id}_${user.id}_wl`);
        if (!data) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | <@${user.id}> is not a whitelisted member.`)
                ]
            });
        }

        await client.db.pull(`${message.guild.id}_wl.whitelisted`, user.id);
        await client.db.delete(`${message.guild.id}_${user.id}_wl`);
        return message.channel.send({
            embeds: [
                client.util.embed()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} | Successfully removed <@${user.id}> from the whitelist.`)
            ]
        });
    }
};
