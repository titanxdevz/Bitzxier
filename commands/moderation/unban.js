
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unban',
    category: 'mod',
    premium: false,

    run: async (client, message, args) => {
        const { member, guild, channel, author } = message;
        const { cross, tick } = client.emoji;
        const color = client.color;

        if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`${cross} | You must have \`Ban Members\` permissions to use this command.`)
                ]
            });
        }

        if (!guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`${cross} | I must have \`Ban Members\` permissions to execute this command.`)
                ]
            });
        }

        const isOwner = author.id === guild.ownerId;
        if (!isOwner && !client.util.hasHigher(member)) {
            return channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`${cross} | You must have a higher role than me to use this command.`)
                ]
            });
        }

        const ID = args[0];
        if (!ID) {
            return channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`${cross} | You didn't provide the ID of the member to *Unban*.`)
                ]
            });
        }

        try {
            const userBanInfo = await guild.bans.fetch(ID);
            if (!userBanInfo) {
                return channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(color)
                            .setDescription(`${cross} | This user isn't banned in this server.`)
                    ]
                });
            }

            await guild.members.unban(ID);

            const user = await client.users.fetch(ID);

            return channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`${tick} | Successfully unbanned **${user.tag}** (${user})`)
                ]
            });
        } catch (error) {
            return channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setDescription(`${cross} | I was unable to *Unban* that member. They might not be banned or an error occurred.`)
                ]
            });
        }
    }
};
