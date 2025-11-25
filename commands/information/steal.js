const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { parse } = require('twemoji-parser');
const fetch = require('node-fetch');

module.exports = {
    name: 'steal',
    aliases: [],
    cooldown: 5,
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have \`Manage Emoji\` perms to use this command.`
                        )
                ]
            });
        }
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I must have \`Manage Emoji\` perms to use this command.`
                        )
                ]
            });
        }

        let emojis = args.length ? args.join(' ').match(/<a?:\w+:\d+>/g) : [];
        if (!emojis.length) {
            const reply = message.reference?.messageId
                ? await message.channel.messages.fetch(message.reference.messageId)
                : null;

            if (!reply) {
                const noReplyEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('You need to reply to a message containing emojis or stickers, or provide an emoji as an argument to use this command.');
                return message.channel.send({ embeds: [noReplyEmbed] });
            }

            const customEmojis = reply.content.match(/<a?:\w+:\d+>/g) || [];
            const unicodeEmojis = parse(reply.content).map(emoji => emoji.url);
            const stickers = reply.stickers.map(sticker => sticker.url);

            emojis = customEmojis.concat(unicodeEmojis).concat(stickers);
        }

        if (emojis.length === 0) {
            const noEmojisEmbed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription('No emojis or stickers found in the provided arguments or the replied message.');
            return message.channel.send({ embeds: [noEmojisEmbed] });
        }

        let currentPage = 0;
        const totalPages = emojis.length;

        const getItemEmbed = (index) => {
            const item = emojis[index];
            const isCustomEmoji = item.startsWith('<');
            const isSticker = item.endsWith('.webp');

            let itemUrl;
            if (isCustomEmoji) {
                itemUrl = `https://cdn.discordapp.com/emojis/${item.split(':')[2]?.replace('>', '')}${item.startsWith('<a') ? '.gif' : '.png'}`;
            } else if (isSticker) {
                itemUrl = item.replace('.webp', '.png');
            } else {
                itemUrl = item;
            }

            if (!itemUrl) {
                itemUrl = 'https://via.placeholder.com/128?text=Invalid+Item';
            }

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle(`Item ${index + 1} of ${totalPages}`)
                .setImage(itemUrl);
            return embed;
        };

        const itemEmbed = getItemEmbed(currentPage);
        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
                new ButtonBuilder().setCustomId('previous').setLabel('Previous').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
                new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1),
                new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1),
                new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('steal_emoji').setLabel('Steal as Emoji').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('steal_sticker').setLabel('Steal as Sticker').setStyle(ButtonStyle.Success),
            );

        const itemMessage = await message.channel.send({ embeds: [itemEmbed], components: [row1, row2] });

        const filter = (i) => i.user.id === message.author.id;
        const collector = itemMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            await interaction.deferUpdate(); // Defer interaction to extend processing time
            if (!interaction.isButton()) return;
            if (interaction.customId === 'first') currentPage = 0;
            if (interaction.customId === 'previous') currentPage = Math.max(0, currentPage - 1);
            if (interaction.customId === 'next') currentPage = Math.min(totalPages - 1, currentPage + 1);
            if (interaction.customId === 'last') currentPage = totalPages - 1;

            if (['first', 'previous', 'next', 'last'].includes(interaction.customId)) {
                await interaction.editReply({
                    embeds: [getItemEmbed(currentPage)],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
                                new ButtonBuilder().setCustomId('previous').setLabel('Previous').setStyle(ButtonStyle.Primary).setDisabled(currentPage === 0),
                                new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1),
                                new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Primary).setDisabled(currentPage === totalPages - 1),
                                new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger),
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId('steal_emoji').setLabel('Steal as Emoji').setStyle(ButtonStyle.Success),
                                new ButtonBuilder().setCustomId('steal_sticker').setLabel('Steal as Sticker').setStyle(ButtonStyle.Success),
                            ),
                    ],
                });
            }

            if (interaction.customId === 'steal_emoji') {
                try {
                    const itemUrl = emojis[currentPage].startsWith('http') ? emojis[currentPage] : `https://cdn.discordapp.com/emojis/${emojis[currentPage].split(':')[2]?.replace('>', '')}${emojis[currentPage].startsWith('<a') ? '.gif' : '.png'}`;
                    const name = `emoji_${Date.now()}`;
                    await message.guild.emojis.create({ attachment: itemUrl, name: name });
                    await interaction.followUp({ content: `Emoji added with name: ${name}`, ephemeral: true });
                } catch (error) {
                    await interaction.followUp({ content: 'Failed to add emoji. Ensure the bot has the Manage Emojis permission.', ephemeral: true });
                }
            }

            if (interaction.customId === 'steal_sticker') {
                try {
                    const itemUrl = emojis[currentPage].startsWith('http') ? emojis[currentPage] : `https://cdn.discordapp.com/emojis/${emojis[currentPage].split(':')[2]?.replace('>', '')}${emojis[currentPage].startsWith('<a') ? '.gif' : '.png'}`;
                    const name = `sticker_${Date.now()}`;

                    // Fetch the image data
                    const response = await fetch(itemUrl);
                    const buffer = await response.buffer();

                    await message.guild.stickers.create({
                        file: buffer,
                        name: name,
                        description: 'An awesome sticker'
                    });
                    await interaction.followUp({ content: `Sticker added with name: ${name}`, ephemeral: true });
                } catch (error) {
                    await interaction.followUp({ content: 'Failed to add sticker. Ensure the bot has the Manage Stickers permission.', ephemeral: true });
                }
            }

            if (interaction.customId === 'delete') {
                await itemMessage.delete();
                const itemDeletedEmbed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('Item selection has been deleted.');
                await message.channel.send({ embeds: [itemDeletedEmbed] });
                collector.stop();
            } else {
                return;
            }
        });

        collector.on('end', async () => {
            try {
                await itemMessage.edit({
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId('first').setLabel('First').setStyle(ButtonStyle.Primary).setDisabled(true),
                                new ButtonBuilder().setCustomId('previous').setLabel('Previous').setStyle(ButtonStyle.Primary).setDisabled(true),
                                new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(ButtonStyle.Primary).setDisabled(true),
                                new ButtonBuilder().setCustomId('last').setLabel('Last').setStyle(ButtonStyle.Primary).setDisabled(true),
                                new ButtonBuilder().setCustomId('delete').setLabel('Delete').setStyle(ButtonStyle.Danger).setDisabled(true),
                            ),
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder().setCustomId('steal_emoji').setLabel('Steal as Emoji').setStyle(ButtonStyle.Success).setDisabled(true),
                                new ButtonBuilder().setCustomId('steal_sticker').setLabel('Steal as Sticker').setStyle(ButtonStyle.Success).setDisabled(true),
                            ),
                    ],
                });
            } catch (error) {
                console.error(error);
                return;
            }
        });
    },
};
