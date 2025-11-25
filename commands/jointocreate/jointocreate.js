const { Client, Intents, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType } = require('discord.js');
const mongoose = require('mongoose');
const GuildConfig = require('../../models/guildconfig'); // Adjust the path according to your project structure

module.exports = {
    name: 'jointocreate',
    aliases: ['jtc', 'vcgen'],
    category: 'jointocreate',
    subcommand : ['setup','view','reset'],
    premium: false,
    run: async (client, message, args) => {
        if (!message.member.permissions.has('Administrator')) {

      return message.channel.send({

          embeds: [

              client.util.embed()

                  .setColor(client.color)

                  .setDescription(

                      `${client.emoji.cross} | You must have \`Administrator\` permissions to use this command.`

                  )

          ]

      });

  }

  if (!message.guild.members.me.permissions.has('Administrator')) { 

      return message.channel.send({

          embeds: [

              embed

                  .setColor(client.color)

                  .setDescription(

                      `${client.emoji.cross} | I don't have \`Administrator\` permissions to execute this command.`

                  )

          ]

      })

  }

  if (!client.util.hasHigher(message.member)) {

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
        const prefix = '&' || message.guild.prefix;
        const option = args[0];

        const infoEmbed = client.util.embed()
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setColor(client.color)
            .setTitle('__**Join To Create (4)**__')
            .addFields([
                { name: '**Join To Create**', value: 'Configures the voice channel generation system.' },
                { name: '__**jointocreate setup**__', value: 'Sets up the voice channel generator in the server.' },
                { name: '__**jointocreate reset**__', value: 'Disables the voice channel generator in the server.' },
                { name: '__**jointocreate view**__', value: 'Displays the current voice channel generator configuration.' }
            ]);

        if (!option) {
            return message.channel.send({ embeds: [infoEmbed] });
        }

        if (option.toLowerCase() === 'setup') {
            const existingConfig = await GuildConfig.findOne({ guildId: message.guild.id });
            if (existingConfig) {
                const setupAlreadyCompleteEmbed = client.util.embed()
                .setColor(client.color)
                    .setTitle('Setup Already Completed')
                    .setDescription('The setup process has already been completed for this server.');

                return message.reply({ embeds: [setupAlreadyCompleteEmbed] });
            }

            const category = await message.guild.channels.create({
                name : "Bitzxier Temporary Voice Channels",
                type: ChannelType.GuildCategory
            });

            const hubChannel = await message.guild.channels.create({
                name : "Join To Create",
                type: ChannelType.GuildVoice,
                parent: category.id
            });

            const interfaceChannel = await message.guild.channels.create({
                name : "Bitzxier Voice InterFace",
                type: ChannelType.GuildText,
                parent: category.id
            });

            await GuildConfig.findOneAndUpdate(
                { guildId: message.guild.id },
                { guildId: message.guild.id, hubChannelId: hubChannel.id, categoryId: category.id, interfaceChannelId: interfaceChannel.id },
                { upsert: true }
            );

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('transferownership')
                        .setLabel('Transfer Ownership')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('changeregion')
                        .setLabel('Change Region')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('changebitrate')
                        .setLabel('Change Bitrate')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('userlimit')
                        .setLabel('User Limit')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('channelname')
                        .setLabel('Channel Name')
                        .setStyle(ButtonStyle.Primary),
                );

            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('lock')
                        .setLabel('Lock')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('unlock')
                        .setLabel('Unlock')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('hide')
                        .setLabel('Hide')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('unhide')
                        .setLabel('Unhide')
                        .setStyle(ButtonStyle.Secondary),
                );

            const row3 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('vcmute')
                        .setLabel('VC Mute')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('vcunmute')
                        .setLabel('VC Unmute')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('vcdeaf')
                        .setLabel('VC Deafen')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('vcundeaf')
                        .setLabel('VC Undeafen')
                        .setStyle(ButtonStyle.Danger),
                );

            const row4 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('vcban')
                        .setLabel('VC Ban')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('vckick')
                        .setLabel('VC Kick')
                        .setStyle(ButtonStyle.Danger),
                );

            await interfaceChannel.send({
                content: 'Voice channel controls:',
                components: [row, row2, row3, row4]
            });

            const setupCompleteEmbed = client.util.embed()
            .setColor(client.color)
            .setTitle('Setup Complete')
                .setDescription(`The setup is complete. Created category: **${category.name}**, hub channel: **${hubChannel.name}**, and interface channel: **${interfaceChannel.name}**.`);

            return message.reply({ embeds: [setupCompleteEmbed] });
        }

        if (option.toLowerCase() === 'reset') {
            const config = await GuildConfig.findOne({ guildId: message.guild.id });
            if (!config) {
                const noConfigEmbed = client.util.embed()
                .setColor(client.color)
                    .setTitle('No Configuration Found')
                    .setDescription('No configuration was found for this server.');

                return message.reply({ embeds: [noConfigEmbed] });
            }

            try {
                const category = message.guild.channels.cache.get(config.categoryId);
                if (category) await category.delete();

                const hubChannel = message.guild.channels.cache.get(config.hubChannelId);
                if (hubChannel) await hubChannel.delete();

                const interfaceChannel = message.guild.channels.cache.get(config.interfaceChannelId);
                if (interfaceChannel) await interfaceChannel.delete();

                await GuildConfig.deleteOne({ guildId: message.guild.id });

                const resetCompleteEmbed = client.util.embed()
                .setColor(client.color)
                    .setTitle('Reset Complete')
                    .setDescription('The configuration has been reset and the channels have been deleted.');

                return message.reply({ embeds: [resetCompleteEmbed] });
            } catch (error) {
                const errorEmbed = client.util.embed()
                .setColor(client.color)
                    .setTitle('Error')
                    .setDescription('An error occurred while resetting the configuration.');

                return message.reply({ embeds: [errorEmbed] });
            }
        }

        if (option.toLowerCase() === 'view') {
            const config = await GuildConfig.findOne({ guildId: message.guild.id });
            if (!config) {
                const noConfigEmbed = client.util.embed()
                .setColor(client.color)
                    .setTitle('No Configuration Found')
                    .setDescription('No configuration was found for this server.');

                return message.reply({ embeds: [noConfigEmbed] });
            }

            const viewConfigEmbed = client.util.embed()
                .setColor(client.color)
                .setTitle('Current Configuration')
                .setDescription(`Category ID: <#${config.categoryId}> (${config.categoryId})\nHub Channel ID: <#${config.hubChannelId}> (${config.hubChannelId})\nInterface Channel ID: <#${config.interfaceChannelId}> (${config.interfaceChannelId})`);

            return message.reply({ embeds: [viewConfigEmbed] });
        }
    }
};
