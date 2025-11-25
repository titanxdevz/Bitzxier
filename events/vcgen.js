const { 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ModalBuilder, 
  TextInputBuilder, 
  PermissionFlagsBits, 
  ChannelType,
  RoleSelectMenuBuilder,
  UserSelectMenuBuilder,
  ComponentType, 
  ButtonStyle,
  ButtonBuilder
} = require('discord.js');
const GuildConfig = require('../models/guildconfig');

module.exports = async (client) => {
  client.on('voiceStateUpdate', async (oldState, newState) => {
    const guild = newState.guild;
    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
    if (!guildConfig) return;
    
    const hubChannel = guild.channels.cache.get(guildConfig.hubChannelId) || 
      await guild.channels.fetch(guildConfig.hubChannelId).catch(() => { });
    const categoryChannel = guild.channels.cache.get(guildConfig.categoryId) || 
      await guild.channels.fetch(guildConfig.categoryId).catch(() => { });

    if (!hubChannel || !categoryChannel) {
      await GuildConfig.deleteOne({ guildId: guild.id });
      return;
    }

    if (oldState.channel) {
      const tempChannel = guildConfig.tempVoiceChannels.find(ch => ch.channelId === oldState.channel.id);
      if (tempChannel) {
        const voiceChannel = guild.channels.cache.get(tempChannel.channelId);
        if (oldState.member.id === tempChannel.ownerId) {
          if (voiceChannel.members.size > 0 && !newState.member.user.bot) {
            const newOwner = voiceChannel.members.first();
            if (newOwner) {
              await GuildConfig.updateOne(
                { guildId: guild.id, 'tempVoiceChannels.channelId': voiceChannel.id },
                { $set: { 'tempVoiceChannels.$.ownerId': newOwner.id } }
              );
              await voiceChannel.setName(`${newOwner.user.displayName}'s Vc`);
            }
          } else {
            await voiceChannel.delete();
            await GuildConfig.updateOne(
              { guildId: guild.id },
              { $pull: { tempVoiceChannels: { channelId: voiceChannel.id } } }
            );
          }
        } else if (voiceChannel.members.size === 0) {
          await voiceChannel.delete();
          await GuildConfig.updateOne(
            { guildId: guild.id },
            { $pull: { tempVoiceChannels: { channelId: voiceChannel.id } } }
          );
        }
      }
    }

    if (newState.channelId === guildConfig.hubChannelId && !newState.member.user.bot) {
      const newChannel = await guild.channels.create({
        name: `${newState.member.user.displayName}'s Vc`,
        type: ChannelType.GuildVoice,
        parent: guildConfig.categoryId,
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [
              PermissionFlagsBits.ViewChannel, 
              PermissionFlagsBits.Speak, 
              PermissionFlagsBits.Connect
            ]
          }
        ]
      });

      await newState.setChannel(newChannel);
      await GuildConfig.updateOne(
        { guildId: guild.id },
        { $push: { tempVoiceChannels: { channelId: newChannel.id, ownerId: newState.member.id } } }
      );
    }
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;
    if (!['lock','unhide','hide','unlock','selectUserToKick','vckick','selectUserToMute','vcmute','selectUserToUnmute','vcunmute','selectUserToDeaf','vcdeaf','selectUserToUndeaf','vcundeaf','selectUserToBan','vcban','channelname','channelnameModal','changeregion','selectRegion','userlimitModal','userlimit','bitrateModal','changebitrate','bitrateInput','userlimitInput','transferownership','selectUserToTransferOwnership','selectUserToKick','selectUserToBan','selectUserToMute','selectUserToDeaf','selectUserToUndeaf','selectUserToUndeaf','selectUserToUnmute','userlimitModal','channelnameModal','bitrateModal'].includes(interaction.customId)) return;
  
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction?.guild?.id });
      if (!guildConfig) return;

      const member = interaction.guild.members.cache.get(interaction.user.id);
      const voiceChannel = member.voice.channel 
      const tempChannel = guildConfig.tempVoiceChannels.find(ch => ch?.channelId === voiceChannel?.id);
      if(!voiceChannel || !tempChannel) {
        return interaction.reply({ content: `It seems you either don't have a temporary channel or you're not currently in a voice channel. Please ensure you're in the correct voice channel and try again.` , ephemeral: true});
      }
      if (tempChannel?.ownerId === interaction?.user?.id) {

        const getMaxBitrate = (guild) => {
          const boostLevel = guild.premiumTier;
          switch (boostLevel) {
            case 'TIER_1': return 128000;
            case 'TIER_2': return 256000;
            case 'TIER_3': return 384000;
            default: return 96000;
          }
        };
  
        const maxBitrate = getMaxBitrate(interaction.guild);

        switch (interaction.customId) {
            case 'lock':
              try {
              await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                Connect : false
              });
              interaction.reply({ content: 'Voice channel has been locked.', ephemeral: true });
              }catch(err) {
                interaction.reply({ content : 'Unknown Error Ouccured' , ephemeral : true })
              }
              break;

              case 'unlock':
                try {
                await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                  Connect : true
                });
                interaction.reply({ content: 'Voice channel has been locked.', ephemeral: true });
                }catch(err) {
                  interaction.reply({ content : 'Unknown Error Ouccured' , ephemeral : true })
                }
                break;

                case 'hide':
                  try {
                  await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                    ViewChannel : false
                  });
                  interaction.reply({ content: 'Voice channel has been Hidden.', ephemeral: true });
                  }catch(err) {
                    interaction.reply({ content : 'Unknown Error Ouccured' , ephemeral : true })
                  }
                  break;
                  case 'unhide':
                    try {
                    await voiceChannel.permissionOverwrites.edit(interaction.guild.id, {
                      ViewChannel : true
                    });
                    interaction.reply({ content: 'Voice channel has been unhidden.', ephemeral: true });
                    }catch(err) {
                      interaction.reply({ content : 'Unknown Error Ouccured' , ephemeral : true })
                    }
                    break;
          case 'vckick':
            const kickRow = new ActionRowBuilder()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('selectUserToKick')
                  .setPlaceholder('Select a user to kick')
                  .addOptions(voiceChannel.members.map(member => ({
                    label: member.user.username,
                    value: member.id
                  })).slice(0, 24))
                  .setMaxValues(voiceChannel.members.size)
              );

            await interaction.reply({
              content: 'Select a user to kick from the voice channel:',
              components: [kickRow],
              ephemeral: true
            });
            break;

          case 'vcmute':
            if(voiceChannel.members.filter(member => !member.voice.serverMute).size === 0) {
              return interaction.reply({ content: 'There are no users unmuted in voice channel', ephemeral: true });
            }
            const muteRow = new ActionRowBuilder()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('selectUserToMute')
                  .setPlaceholder('Select a user to Mute')
                  .addOptions(
                    voiceChannel.members
                      .filter(member => !member.voice.serverMute)
                      .map(member => ({
                        label: member.user.username,
                        value: member.id
                      }))
                      .slice(0, 24))
                  .setMaxValues(voiceChannel.members.filter(member => !member.voice.serverMute).size)
              );

            await interaction.reply({
              content: 'Select a user to mute from the voice channel:',
              components: [muteRow],
              ephemeral: true
            });
            break;

            case 'vcunmute':
              if(voiceChannel.members.filter(member => member.voice.serverMute).size === 0) {
                return interaction.reply({ content: 'There are no users unmuted in voice channel', ephemeral: true });
              }
              const unmuteRow = new ActionRowBuilder()
                .addComponents(
                  new StringSelectMenuBuilder()
                    .setCustomId('selectUserToUnmute')
                    .setPlaceholder('Select a user to Unmute')
                    .addOptions(
                      voiceChannel.members
                        .filter(member => member.voice.serverMute)
                        .map(member => ({
                          label: member.user.username,
                          value: member.id
                        }))
                        .slice(0, 24))
                    .setMaxValues(voiceChannel.members.filter(member => member.voice.serverMute).size)
                );
  
              await interaction.reply({
                content: 'Select a user to mute from the voice channel:',
                components: [unmuteRow],
                ephemeral: true
              });
              break;

          case 'vcdeaf':
            if(voiceChannel.members.filter(member => !member.voice.serverDeaf).size === 0) {
              return interaction.reply({ content: 'There are no users undeafen in voice channel', ephemeral: true });
            }
            const deafRow = new ActionRowBuilder()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('selectUserToDeaf')
                  .setPlaceholder('Select a user to deafen')
                  .addOptions(
                    voiceChannel.members
                      .filter(member => !member.voice.serverDeaf)
                      .map(member => ({
                        label: member.user.username,
                        value: member.id
                      }))
                      .slice(0, 24)
                  )
                  .setMaxValues(voiceChannel.members.filter(member => !member.voice.serverDeaf).size)
              );

            await interaction.reply({
              content: 'Select a user to deafen from the voice channel:',
              components: [deafRow],
              ephemeral: true
            });
            break;

          case 'vcundeaf':
            if(voiceChannel.members.filter(member => member.voice.serverDeaf).size === 0) {
              return interaction.reply({ content: 'There are no users deafen in voice channel', ephemeral: true });
            }
            const undeafRow = new ActionRowBuilder()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('selectUserToUndeaf')
                  .setPlaceholder('Select a user to undeafen')
                  .addOptions(
                    voiceChannel.members
                      .filter(member => member.voice.serverDeaf)
                      .map(member => ({
                        label: member.user.username,
                        value: member.id
                      }))
                      .slice(0, 24)
                  )
                  .setMaxValues(voiceChannel.members.filter(member => member.voice.serverDeaf).size)
              );

            await interaction.reply({
              content: 'Select a user to undeafen from the voice channel:',
              components: [undeafRow],
              ephemeral: true
            });
            break;

          case 'vcban':
            const banRow = new ActionRowBuilder()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('selectUserToBan')
                  .setPlaceholder('Select a user to ban')
                  .addOptions(voiceChannel.members.map(member => ({
                    label: member.user.username,
                    value: member.id
                  })).slice(0, 24))
                  .setMaxValues(voiceChannel.members.size)
              );

            await interaction.reply({
              content: 'Select a user to ban from the voice channel:',
              components: [banRow],
              ephemeral: true
            });
            break;

          case 'channelname':
            const channelNameModal = new ModalBuilder()
              .setCustomId('channelnameModal')
              .setTitle('Change Channel Name')
              .addComponents(
                new ActionRowBuilder().addComponents(
                  new TextInputBuilder()
                    .setCustomId('channelnameInput')
                    .setLabel('Enter new channel name:')
                    .setStyle('Short')
                    .setRequired(true)
                )
              );

            await interaction.showModal(channelNameModal);
            break;

          case 'changeregion':
            const regions = [
              { label: 'India', value: 'india' },
              { label: 'Brazil', value: 'brazil' },
              { label: 'Hong Kong', value: 'hongkong' },
              { label: 'Japan', value: 'japan' },
              { label: 'Rotterdam', value: 'rotterdam' },
              { label: 'Russia', value: 'russia' },
              { label: 'Singapore', value: 'singapore' },
              { label: 'South Korea', value: 'south-korea' },
              { label: 'South Africa', value: 'southafrica' },
              { label: 'Sydney', value: 'sydney' },
              { label: 'US Central', value: 'us-central' },
              { label: 'US East', value: 'us-east' },
              { label: 'US South', value: 'us-south' },
              { label: 'US West', value: 'us-west' }
            ];
            const roww = new ActionRowBuilder()
              .addComponents(
                new StringSelectMenuBuilder()
                  .setCustomId('selectRegion')
                  .setPlaceholder('Select a region')
                  .addOptions(regions)
              );
            await interaction.reply({
              content: 'Select a region for the voice channel:',
              components: [roww],
              ephemeral: true
            });
            break;

          case 'selectRegion' : 
          const region = interaction.values[0];
          await voiceChannel.setRTCRegion(region);
          return interaction.reply({ content: `Voice channel region has been changed to ${region}.`, ephemeral: true });
          break;

          case 'userlimit':
            const userLimitModal = new ModalBuilder()
              .setCustomId('userlimitModal')
              .setTitle('Change User Limit')
              .addComponents(
                new ActionRowBuilder().addComponents(
                  new TextInputBuilder()
                    .setCustomId('userlimitInput')
                    .setLabel('Enter new user limit:')
                    .setStyle('Short')
                    .setRequired(true)
                )
              );

            await interaction.showModal(userLimitModal);
            break;

          case 'changebitrate':
            const bitrateModal = new ModalBuilder()
              .setCustomId('bitrateModal')
              .setTitle('Change Bitrate')
              .addComponents(
                new ActionRowBuilder().addComponents(
                  new TextInputBuilder()
                    .setCustomId('bitrateInput')
                    .setLabel(`Enter new bitrate (max: ${maxBitrate / 1000} kbps):`)
                    .setStyle('Short')
                    .setRequired(true)
                )
              );

            await interaction.showModal(bitrateModal);
            break;

            case 'transferownership':
              const row = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('selectUserToTransferOwnership')
              .setPlaceholder('Select a user to transfer ownership')
              .addOptions(voiceChannel.members.map(member => ({
                label: member.user.username,
                value: member.id
              })).slice(0, 24))
          );
  
        await interaction.reply({
          content: 'Select a user to transfer ownership of the voice channel:',
          components: [row],
          ephemeral: true
        });
          break;
          case 'selectUserToTransferOwnership':
            const newOwnerId = interaction.values[0];
            const newOwner = voiceChannel.members.get(newOwnerId);
            if (newOwnerId === interaction.user.id) {
              return interaction.reply({ content: `Are you dumb? you cannot pass ownership to yourself you already own it`, ephemeral: true });
            }
            if (newOwner) {
              await GuildConfig.updateOne(
                { guildId: interaction.guild.id, 'tempVoiceChannels.channelId': voiceChannel.id },
                { $set: { 'tempVoiceChannels.$.ownerId': newOwner.id } }
              );
              await voiceChannel.setName(`${newOwner.user.displayName}'s Vc`);
              return interaction.reply({ content: `Ownership has been transferred to ${newOwner.user.tag}.`, ephemeral: true });
            } else {
              interaction.reply({ content: 'User is not in the voice channel.', ephemeral: true });
            }
            break;
        }

        switch (interaction.customId) {
          case 'selectUserToKick' : 
          await interaction.deferReply({ ephemeral: true });
          const userIds = interaction.values;
          let success = 0;
          userIds.forEach(userId => {
            const memberToKick = voiceChannel.members.get(userId);
            if (memberToKick) {
              memberToKick.voice.disconnect();
              success++;
            }
          });
          return interaction.editReply({ content: `\`${success}\` Users have been kicked from the voice channel.`, ephemeral: true });
          break;

          case 'selectUserToBan' : 
          await interaction.deferReply({ ephemeral: true });
          const bans = interaction.values;
          let succes = 0;
          bans.forEach(userId => {
            const memberToKick = voiceChannel.members.get(userId);
            if (memberToKick) {
              memberToKick.voice.disconnect();
              voiceChannel.permissionOverwrites.edit(memberToKick.id, {
                Connect : false,
                ViewChannel : false
              });
              succes++;
            }
          });
          return interaction.editReply({ content: `\`${succes}\` Users have been banned from the voice channel.`, ephemeral: true });
          break;
          case 'selectUserToMute' :
            await interaction.deferReply({ ephemeral: true });
            const mute = interaction.values;
            let succe = 0;
            mute.forEach(userId => {
              const memberToKick = voiceChannel.members.get(userId);
              if (memberToKick) {
                memberToKick.voice.setMute(true);
                succe++;
              }
            });
            return interaction.editReply({ content: `\`${succe}\` Users have been muted in the voice channel.`, ephemeral: true });
            break;
            case 'selectUserToDeaf' : 
            await interaction.deferReply({ ephemeral: true });
            const def = interaction.values;
            let suc = 0;
            def.forEach(userId => {
              const memberToKick = voiceChannel.members.get(userId);
              if (memberToKick) {
                memberToKick.voice.setDeaf(true);
                suc++;
              }
            });
            return interaction.editReply({ content: `\`${suc}\` Users have been deafened in the voice channel.`, ephemeral: true });
            break;
            case 'selectUserToUndeaf' : 
            await interaction.deferReply({ ephemeral: true });
            const undef = interaction.values;
            let sucs = 0;
            undef.forEach(userId => {
              const memberToKick = voiceChannel.members.get(userId);
              if (memberToKick) {
                memberToKick.voice.setDeaf(false);
                sucs++;
              }
            });
            return interaction.editReply({ content: `\`${sucs}\` Users have been undeafened in the voice channel.`, ephemeral: true });
            break;

            case 'selectUserToUnmute' :
              await interaction.deferReply({ ephemeral: true });
              const unmute = interaction.values;
              let e = 0;
              unmute.forEach(userId => {
                const memberToKick = voiceChannel.members.get(userId);
                if (memberToKick) {
                  memberToKick.voice.setMute(false);
                  e++;
                }
              });
              return interaction.editReply({ content: `\`${e}\` Users have been unmuted in the voice channel.`, ephemeral: true });
              break;
          case 'bitrateModal':
            const bitrateKbps = parseInt(interaction.fields.getTextInputValue('bitrateInput'));
            if (isNaN(bitrateKbps) || bitrateKbps < 8 || bitrateKbps * 1000 > maxBitrate) {
              return interaction.reply({ content: `Invalid bitrate value. Please enter a number between 8 and ${maxBitrate / 1000} kbps.`, ephemeral: true });
            }
            await voiceChannel.setBitrate(bitrateKbps * 1000);
            await interaction.reply({ content: `Voice channel bitrate has been changed to ${bitrateKbps} kbps.`, ephemeral: true });
            break;

          case 'channelnameModal':
            const channelName = interaction.fields.getTextInputValue('channelnameInput');
            if (channelName.length < 1 || channelName.length > 24) {
              return interaction.reply({ content: `Channel Name must be between 1 and 24 characters.`, ephemeral: true });
            }
            await voiceChannel.setName(channelName);
            await interaction.reply({ content: `Successfully changed voice channel name to ${channelName}.`, ephemeral: true });
            break;

          case 'userlimitModal':
            const userLimit = parseInt(interaction.fields.getTextInputValue('userlimitInput'));
            if (isNaN(userLimit) || userLimit < 0 || userLimit > 99) {
              return interaction.reply({ content: `Invalid user limit value. Please enter a number between 0 and 99.`, ephemeral: true });
            }
            await voiceChannel.setUserLimit(userLimit);
            await interaction.reply({ content: `Voice channel user limit has been changed to ${userLimit}.`, ephemeral: true });
            break;

          default:
            if(!voiceChannel || !tempChannel) return interaction.reply({ content: `It seems you either don't have a temporary channel or you're not currently in a voice channel. Please ensure you're in the correct voice channel and try again.` , ephemeral: true});

        }
      }
    } catch (e) {
      console.error(e);
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  });
/*
  // Initialize cooldowns map
  const cooldown = new Map();
  
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;
  
    // Cooldown logic
    const cooldownTime = 3;
    const userId = interaction.user.id;
  
    if (cooldown.has(userId)) {
      const expirationTime = cooldown.get(userId) + cooldownTime * 1000;
      if (Date.now() < expirationTime) {
        const timeLeft = ((expirationTime - Date.now()) / 1000).toFixed(1);
        return interaction.reply({ content: `Please wait ${timeLeft} more second(s) before using this again.`, ephemeral: true });
      }
    }
  
    cooldown.set(userId, Date.now());
  
    try {
      const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
      if (!guildConfig) return;
  
      const member = interaction.guild.members.cache.get(interaction.user.id);
      const voiceChannel = member.voice.channel;
      const tempChannel = guildConfig.tempVoiceChannels.find(ch => ch.channelId === voiceChannel.id);
  
      if (!voiceChannel || !tempChannel) {
        return interaction.reply({ content: `It seems you either don't have a temporary channel or you're not currently in a voice channel. Please ensure you're in the correct voice channel and try again.`, ephemeral: true });
      }
  
      if (tempChannel.ownerId !== interaction.user.id) {
        return interaction.reply({ content: `You are not the owner of this channel.`, ephemeral: true });
      }
  
      if (interaction.isButton()) {
        if (interaction.customId === 'permit') {
          const permitButtons = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('user_select')
                .setLabel('Permit Users')
                .setStyle(ButtonStyle.Primary),
              new ButtonBuilder()
                .setCustomId('role_select')
                .setLabel('Permit Roles')
                .setStyle(ButtonStyle.Secondary)
            );
  
          await interaction.reply({
            content: 'Select users and roles to permit access:',
            components: [permitButtons],
            ephemeral: true
          });
        } else if (interaction.customId === 'user_select') {
          const userSelectMenu = createUserSelectMenu();
          await interaction.reply({
            content: 'Select users to permit access:',
            components: [userSelectMenu],
            ephemeral: true
          });
        } else if (interaction.customId === 'role_select') {
          const roleSelectMenu = createRoleSelectMenu();
          await interaction.reply({
            content: 'Select roles to permit access:',
            components: [roleSelectMenu],
            ephemeral: true
          });
        }
      } else if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'user_select') {
          const selectedUsers = interaction.values || [];
          if (selectedUsers.length === 0) {
            return interaction.reply({
              content: 'No users selected.',
              ephemeral: true
            });
          }
  
          let success = 0;
          for (const userId of selectedUsers) {
            const memberToPermit = interaction.guild.members.cache.get(userId);
            if (memberToPermit) {
              await voiceChannel.permissionOverwrites.edit(memberToPermit.id, {
                ViewChannel: true,
                Connect: true,
                Speak: true
              });
              success++;
            }
          }
  
          await interaction.update({
            content: `Successfully granted permissions to ${success} selected user(s).`,
            ephemeral: true
          });
        } else if (interaction.customId === 'role_select') {
          const selectedRoles = interaction.values || [];
          if (selectedRoles.length === 0) {
            return interaction.reply({
              content: 'No roles selected.',
              ephemeral: true
            });
          }
  
          for (const roleId of selectedRoles) {
            await voiceChannel.permissionOverwrites.edit(roleId, {
              ViewChannel: true,
              Connect: true,
              Speak: true
            });
          }
  
          await interaction.update({
            content: `Successfully granted permissions to selected role(s).`,
            components: [],
            ephemeral: true
          });
        }
      }
    } catch (e) {
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  });
  function createUserSelectMenu() {
    return new ActionRowBuilder()
      .addComponents(
        new UserSelectMenuBuilder()
          .setCustomId('user_select')
          .setPlaceholder('Select users')
          .setMaxValues(10)
      );
  }
  
  function createRoleSelectMenu() {
    return new ActionRowBuilder()
      .addComponents(
        new RoleSelectMenuBuilder()
          .setCustomId('role_select')
          .setPlaceholder('Select roles')
          .setMaxValues(10)
      );
  }
  */
}
  