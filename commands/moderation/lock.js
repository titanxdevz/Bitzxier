const {
    Message,
    Client,
    EmbedBuilder,
    PermissionsBitField
} = require('discord.js');

module.exports = {
    name: 'lock',
    category: 'mod',
    premium: false,

    run: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription('You must have `Manage Channels` permission to use this command.');
            return message.channel.send({ embeds: [error] });
        }

        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const error = client.util.embed()
                .setColor(client.color)
                .setDescription('I must have `Manage Channels` permission to use this command.');
            return message.channel.send({ embeds: [error] });
        }

        const channel =
            message.mentions.channels.first() ||
            message.guild.channels.cache.get(args[0]) ||
            message.channel;

        if (channel.manageable) {
            try {
                await channel.permissionOverwrites.edit(message.guild.id, {
                    SendMessages : false },{
                    reason: `${message.author.tag} (${message.author.id})`
                });
                const emb = client.util.embed()
                    .setDescription(`${channel} has been locked for @everyone role`)
                    .setColor(client.color);
                return message.channel.send({ embeds: [emb] });
            } catch (error) {
                const errorEmbed = client.util.embed()
                    .setDescription('An error occurred while trying to lock the channel.')
                    .setColor(client.color);
                return message.channel.send({ embeds: [errorEmbed] });
            }
        } else {
            const embi = client.util.embed()
                .setDescription('I don\'t have adequate permissions to lock this channel.')
                .setColor(client.color);
            return message.channel.send({ embeds: [embi] });
        }
    }
};
