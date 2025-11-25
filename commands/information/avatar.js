const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    name: 'avatar',
    aliases: ['av', 'photo'],
    category: 'info',
    cooldown: 4,
    premium: false,

    run: async (client, message, args) => {
        let member;

        // Handle the case when a mention or ID is provided
        if (args[0]) {
            member = await getUserFromMention(message, args[0]);
            if (!member) {
                try {
                    member = await client.users.fetch(args[0]); // Fetch by ID
                } catch (error) {
            member = message.member; // Fallback to the message author if no mention or ID
                }
            }
        } else {
            member = message.member; // Fallback to the message author if no mention or ID
        }

        // Fetch the guild member to check if the user is in the same guild
        const guildMember = message.guild.members.cache.get(member.id);

        // Check if the user has a server avatar
        const hasServerAvatar = guildMember && guildMember.avatar;

        // Create the initial embed with the user's main avatar
        let embed = new EmbedBuilder()
            .setAuthor({ name: member.username || member.user.username, iconURL: member.displayAvatarURL() })
            .setImage(member.displayAvatarURL({ forceStatic: false, size: 2048 }))
            .setDescription(
                `[\`PNG\`](${member.displayAvatarURL({
                    forceStatic: false,
                    size: 2048,
                    extension: 'png'
                })}) | [\`JPG\`](${member.displayAvatarURL({
                    forceStatic: false,
                    size: 2048,
                    extension: 'jpg'
                })}) | [\`WEBP\`](${member.displayAvatarURL({
                    forceStatic: false,
                    size: 2048,
                    extension: 'webp'
                })})`
            )
            .setColor(client.color)
            .setFooter({ text: `Requested By ${message.member.displayName}` });

        if (hasServerAvatar) {
            // If the member is in the same guild and has a server avatar, show buttons

            // Create buttons for the avatar and server avatar
            const buttons = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('avatar')
                        .setLabel('Avatar')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('server_avatar')
                        .setLabel('Server Avatar')
                        .setStyle(ButtonStyle.Secondary)
                );

            // Send the initial message with the embed and buttons
            const msg = await message.channel.send({ embeds: [embed], components: [buttons] });

            // Create an interaction collector for the buttons
            const filter = (interaction) => interaction.isButton() && interaction.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter, componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async (interaction) => {
                if(!['avatar','server_avatar'].includes(interaction.customId)) return;
                if(interaction.user.id !== message.author.id) {
                    return interaction.reply({ content : `${client.emoji.cross} | ${interaction.user} Hey ! it's not your interaction`})
                }
                if (interaction.customId === 'avatar') {
                    // Update the embed to show the user's main avatar
                    embed.setImage(member.displayAvatarURL({ forceStatic: false, size: 2048 }));
                    embed.setDescription(
                        `[\`PNG\`](${member.displayAvatarURL({
                            forceStatic: false,
                            size: 2048,
                            extension: 'png'
                        })}) | [\`JPG\`](${member.displayAvatarURL({
                            forceStatic: false,
                            size: 2048,
                            extension: 'jpg'
                        })}) | [\`WEBP\`](${member.displayAvatarURL({
                            forceStatic: false,
                            size: 2048,
                            extension: 'webp'
                        })})`
                    );
                    await interaction.update({ embeds: [embed] });
                } else if (interaction.customId === 'server_avatar') {
                    // Update the embed to show the user's server avatar
                    embed.setImage(guildMember.displayAvatarURL({ forceStatic: false, size: 2048, dynamic: true }));
                    embed.setDescription(
                        `[\`PNG\`](${guildMember.displayAvatarURL({
                            forceStatic: false,
                            size: 2048,
                            extension: 'png'
                        })}) | [\`JPG\`](${guildMember.displayAvatarURL({
                            forceStatic: false,
                            size: 2048,
                            extension: 'jpg'
                        })}) | [\`WEBP\`](${guildMember.displayAvatarURL({
                            forceStatic: false,
                            size: 2048,
                            extension: 'webp'
                        })})`
                    );
                    await interaction.update({ embeds: [embed] });
                }
            });

            collector.on('end', () => {
                // Disable buttons after the collector ends
                const disabledButtons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('avatar')
                            .setLabel('Avatar')
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId('server_avatar')
                            .setLabel('Server Avatar')
                            .setStyle(ButtonStyle.Secondary)
                            .setDisabled(true)
                    );
                msg.edit({ components: [disabledButtons] });
            });

        } else {
            // If the member is not in the guild or doesn't have a server avatar, send only the avatar
            return message.channel.send({ embeds: [embed] });
        }
    }
};

// Helper function to get user from mention or ID
async function getUserFromMention(message, mention) {
    if (!mention) return null;

    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    return await message.client.users.fetch(id).catch(() => null) || message.member;
}
