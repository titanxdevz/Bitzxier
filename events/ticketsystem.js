const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const ticketPanelSchema = require('../models/ticket');
const discordTranscripts = require('discord-html-transcripts');
const transcriptCooldowns = new Map();
const closeCooldowns = new Map();
const deleteCooldowns = new Map();
const closeRenameCooldowns = new Map(); // Cooldown map for renaming
const openRenameCooldowns = new Map(); // Cooldown map for renaming

module.exports = async (client) => {
  client.on("interactionCreate", async (i) => {
    try {
      if (i.isButton()) {
        const closeButton = new ButtonBuilder()
          .setEmoji("🔒")
          .setCustomId("close")
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Close");

        const deleteButton = new ButtonBuilder()
          .setEmoji("💣")
          .setCustomId("delete")
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Delete")
        const transcriptButton = new ButtonBuilder()
          .setEmoji("📃")
          .setCustomId("transcript")
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Generate Transcripts")
        const openButton = new ButtonBuilder()
          .setEmoji("🔓")
          .setCustomId("Open")
          .setStyle(ButtonStyle.Secondary)
          .setLabel("Open")

        const closeRow = new ActionRowBuilder().addComponents([closeButton]);
        const deleteRow = new ActionRowBuilder().addComponents([deleteButton, transcriptButton, openButton]);
        if (i.customId.startsWith("ticket_setup_")) {
          const panelId = i.customId.split("_")[2];
          const data = await ticketPanelSchema.findOne({ guildId: i.guild.id });
          if (!data) {
            return i.reply({ content: `${client.emoji.cross} | Ticket system is not set up.`, ephemeral: true });
          }
          const userTicket = data.createdBy.find(ticket => ticket.userId === i.user.id && ticket.panelId === panelId && ticket.status === "open");
          if (userTicket) {
            return i.reply({ content: `${client.emoji.cross} | You cannot create more than 1 ticket in this panel.`, ephemeral: true });
          }
          const panel = data.panels.find(panel => panel.panelId === panelId);
          if (!panel) {
            return i.reply({ content: `${client.emoji.cross} | Panel not found.`, ephemeral: true });
          }
          if (!panel.enabled) {
            return i.reply({ content: `${client.emoji.cross} | This panel is currently disabled.`, ephemeral: true });
          }
          const panelName = panel.panelName || `ticket`;
          const ticketChannelName = `${panelName}-${i.user.username}`;
          const categoryChannel = i.guild.channels.cache.get(panel.categoryId);
          const permissionOverwrites = [
            {
                id: i.guild.id,
                deny: ["ViewChannel"],
            },
            {
                id: i.user.id,
                allow: ["ViewChannel", "SendMessages", "ReadMessageHistory", "EmbedLinks", "AttachFiles", "AddReactions"],
            },
            {
                id: client.user.id,
                allow: ["ManageChannels"],
            },
        ];
        // Add staff role if it exists
        if (panel.staffRoleId) {
            permissionOverwrites.push({
                id: panel.staffRoleId,
                allow: ["ViewChannel", "SendMessages", "ReadMessageHistory", "EmbedLinks", "AttachFiles", "AddReactions"],
            });
        }
        // Add support role if it exists
        if (panel.supportRoleId) {
            permissionOverwrites.push({
                id: panel.supportRoleId,
                allow: ["ViewChannel", "SendMessages", "ReadMessageHistory", "EmbedLinks", "AttachFiles", "AddReactions"],
            });
        }
        const channel = await i.guild.channels.create({
            name: ticketChannelName,
            type: 0,
            parent: categoryChannel,
            permissionOverwrites: permissionOverwrites,
        });
          panel.channels.push(channel.id);
          data.createdBy.push({ userId: i.user.id, panelId, channelId: channel.id }); // Add channelId here
          await data.save();
          const content = panel.staffRoleId
            ? `Welcome <@${i.user.id}>, <@&${panel.staffRoleId}> staff will assist you shortly!`
            : `Welcome <@${i.user.id}>!`;
          // Check if there's a logs channel set up for this panel
          const ticketlogs = panel.logsChannelId ? i.guild.channels.cache.get(panel.logsChannelId) : null;
          if (ticketlogs) {
            ticketlogs.send({
              embeds: [
                new EmbedBuilder()
                  .setColor(client.color) // Set to your bot's embed color
                  .setAuthor({ name: `Ticket Created`, iconURL: i.user.displayAvatarURL({ dynamic: true }) })
                  .setDescription(`A new ticket has been created.`)
                  .addFields([
                    { name: 'Ticket Owner', value: `<@${i.user.id}>`, inline: true }, // Mention the user who created the ticket
                    { name: 'Ticket Channel', value: `<#${i.channel.id}>`, inline: true }, // Mention the ticket channel
                    { name: 'Ticket Action', value: 'Created', inline: true }, // Mention the action
                    { name: 'Panel Name', value: panel.panelName, inline: true }, // Display the panel name
                    { name: 'Panel ID', value: panel.panelId, inline: true }, // Display the panel ID for reference
                  ])
                  .setFooter({ text: `Ticket ID: ${i.channel.id}` }) // Optional: Add ticket ID to the footer
                  .setTimestamp() // Set timestamp of the ticket creation
              ]
            }).catch((err) => null);
          }
          await data.save();
          await channel.send({
            content: content,
            embeds: [new EmbedBuilder()
              .setDescription("Support will be with you shortly.\nTo close this ticket click the 🔒 button.")
              .setColor(client.color)
            ],
            components: [closeRow],
          });

          return i.reply({ content: `✅ | Ticket created: <#${channel.id}>`, ephemeral: true });
        }


        if (i.customId === "close") {
            const now = Date.now();
            const cooldownTime = 10 * 1000; // 10 seconds cooldown for closing tickets
            const renameCooldownTime = 10 * 60 * 1000; // 10 minutes cooldown for renaming
            const lastClosed = closeCooldowns.get(i.channel.id);
            const lastRenamed = closeRenameCooldowns.get(i.channel.id);
        
            if (lastClosed && now - lastClosed < cooldownTime) {
                const timeLeft = Math.ceil((cooldownTime - (now - lastClosed)) / 1000);
                return i.reply({ content: `Please wait ${timeLeft} seconds before closing this ticket again.`, ephemeral: true });
            }
        
            closeCooldowns.set(i.channel.id, now);
        
            const data = await ticketPanelSchema.findOne({ guildId: i.guild.id });
            if (!data) {
                return i.reply({ content: `${client.emoji.cross} | Ticket system is not set up.`, ephemeral: true });
            }
        
            // Find the panel that this ticket belongs to
            const panel = data.panels.find(panel => panel.channels.includes(i.channel.id));
            if (!panel) {
                return i.reply({ content: `${client.emoji.cross} | This ticket does not belong to a valid panel.`, ephemeral: true });
            }
        
            // Find the ticket that is being closed
            const ticketIndex = data.createdBy.findIndex(ticket => ticket.panelId === panel.panelId && ticket.channelId === i.channel.id);
            if (ticketIndex === -1) {
                return i.reply({ content: `${client.emoji.cross} | Could not find the ticket in the database.`, ephemeral: true });
            }
        
            // Get the ticket creator's ID
            const ticketCreator = data.createdBy[ticketIndex]?.userId;
            const member = i.guild.members.cache.get(ticketCreator) || await i.guild.members.fetch(ticketCreator).catch(console.error);
        
            // Check if the person closing the ticket has permission
            if (!i.member.permissions.has("ManageChannels") && i.user.id !== member?.id) {
                return i.reply({ content: `${client.emoji.cross} | You don't have permission to close this ticket.`, ephemeral: true });
            }
        
            // Check if the ticket is already closed
            const isOpen = i.channel.permissionOverwrites.cache.get(member.id)?.deny.has(['ViewChannel', 'SendMessages']);
            if (isOpen) {
                await i.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Ticket <#${i.channel.id}> is already **closed**`)
                        .setColor(client.color)
                    ],
                    ephemeral: true
                });
            } else {
                // Close the ticket: Update permissions and remove access for the user
                await i.channel.permissionOverwrites.edit(member.id, { ViewChannel: false, SendMessages: false });
        
                // Update the ticket status to 'closed'
                data.createdBy[ticketIndex].status = 'closed';
        
                // Rename the ticket channel, but only if 10 minutes have passed since the last rename
                if (!lastRenamed || now - lastRenamed >= renameCooldownTime) {
                    const originalName = i.channel.name.replace(/^closed-/, ''); // Remove 'closed-' if it exists
                    await i.channel.setName(`closed-${originalName}`).catch(console.error);
                    closeRenameCooldowns.set(i.channel.id, now);
                } else {
                    // If rename is on cooldown, send a message indicating the rename is skipped
                    await i.reply({
                        content: `The channel renaming is on cooldown. Skipping rename operation.`,
                        ephemeral: true
                    });
                }
        
                await i.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Ticket <#${i.channel.id}> has been **closed** by ${i.user.tag}`)
                        .setColor(client.color)
                    ],
                    components: [deleteRow],  // Assuming you have a row of buttons for further actions
                });
        
                // Log for ticket closing
                const ticketlogs = panel.logsChannelId ? i.guild.channels.cache.get(panel.logsChannelId) : null;
                if (ticketlogs) {
                    ticketlogs.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(client.color)
                                .setAuthor({ name: `Ticket Closed`, iconURL: i.user.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`A ticket has been closed.`)
                                .addFields([
                                    { name: 'Ticket Owner', value: `<@${ticketCreator}>`, inline: true },
                                    { name: 'Closed By', value: `<@${i.user.id}>`, inline: true },
                                    { name: 'Ticket Channel', value: i.channel.name, inline: true },
                                    { name: 'Ticket Action', value: 'Closed', inline: true },
                                    { name: 'Panel Name', value: panel.panelName, inline: true },
                                    { name: 'Panel ID', value: panel.panelId, inline: true },
                                    { name: 'Ticket ID', value: i.channel.id, inline: true }
                                ])
                                .setFooter({ text: `Ticket closed in panel: ${panel.panelName}` })
                                .setTimestamp()
                        ]
                    }).catch(err => console.error("Failed to send ticket close log: ", err));
                } else {
                    if (panel.logsChannelId) {
                        panel.logsChannelId = null;
                    }
                }
            }
            await data.save();
        }
         if (i.customId === "delete") {
          const now = Date.now();
          const cooldownTime = 10 * 1000; // 10 seconds cooldown
          const lastDeleted = deleteCooldowns.get(i.channel.id);

          // Check if the cooldown has passed
          if (lastDeleted && now - lastDeleted < cooldownTime) {
            const timeLeft = Math.ceil((cooldownTime - (now - lastDeleted)) / 1000);
            return i.reply({ content: `Please wait ${timeLeft} seconds before deleting this ticket again.`, ephemeral: true });
          }

          // Set the cooldown
          deleteCooldowns.set(i.channel.id, now);

          // Fetch ticket data from the database
          const data = await ticketPanelSchema.findOne({ guildId: i.guild.id });
          if (!data) {
            return i.reply({ content: `${client.emoji.cross} | Ticket system is not set up.`, ephemeral: true });
          }

          // Find the panel the ticket belongs to
          const panel = data.panels.find(p => p.channels.includes(i.channel.id));
          if (!panel) {
            return i.reply({ content: `${client.emoji.cross} | This ticket does not belong to a valid panel.`, ephemeral: true });
          }
          const ticketIndex = data.createdBy.findIndex(ticket => ticket.panelId === panel.panelId && ticket.channelId === i.channel.id);
          if (ticketIndex === -1) {
            return i.reply({ content: `${client.emoji.cross} | Could not find the ticket in the database.`, ephemeral: true });
          }

          // Get the ticket creator's ID
          const ticketCreator = data.createdBy[ticketIndex]?.userId;
         
          // Remove the channel ID from the panel's channels array
          const channelIndex = panel.channels.indexOf(i.channel.id);
          if (channelIndex !== -1) {
            panel.channels.splice(channelIndex, 1);
          }

          // Remove the ticket from the createdBy array
          const creatorIndex = data.createdBy.findIndex(ticket => ticket.panelId === panel.panelId && ticket.channelId === i.channel.id);
          if (creatorIndex !== -1) {
            data.createdBy.splice(creatorIndex, 1); // Remove the ticket entry
          }
          await data.save();

// Log for ticket deletion
const ticketlogs = panel.logsChannelId ? i.guild.channels.cache.get(panel.logsChannelId) : null;

if (ticketlogs) {
    ticketlogs.send({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: `Ticket Deleted`, iconURL: i.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`A ticket has been deleted.`)
                .addFields([
                    { name: 'Ticket Owner', value: `<@${ticketCreator}>`, inline: true }, // Who originally created the ticket
                    { name: 'Deleted By', value: `<@${i.user.id}>`, inline: true }, // Who deleted the ticket
                    { name: 'Ticket Channel', value: i.channel.name, inline: true }, // Ticket channel (if available)
                    { name: 'Ticket Action', value: 'Deleted', inline: true }, // Action
                    { name: 'Panel Name', value: panel.panelName, inline: true }, // Panel name
                    { name: 'Panel ID', value: panel.panelId, inline: true }, // Panel ID
                    { name: 'Ticket ID', value: i.channel.id, inline: true } // Ticket ID
                ])
                .setFooter({ text: `Ticket deleted from panel: ${panel.panelName}` })
                .setTimestamp()
        ]
    })
  if (panel.logsChannelId) {
    panel.logsChannelId = null
  }
  await data.save();
}
          await i.reply({ content: "Deleting this ticket in 3 seconds...", ephemeral: true });
          await client.util.sleep(3000);
          await i.channel.delete().catch(() => null);
        }
        if (i.customId === "Open") {
            const now = Date.now();
            const renameCooldownTime = 10 * 60 * 1000; // 10 minutes cooldown for renaming
            const lastRenamed = openRenameCooldowns.get(i.channel.id);
        
            const data = await ticketPanelSchema.findOne({ guildId: i.guild.id });
            if (!data) {
                return i.reply({ content: `${client.emoji.cross} | Ticket system is not set up.`, ephemeral: true });
            }
        
            // Find the panel that this ticket belongs to
            const panel = data.panels.find(panel => panel.channels.includes(i.channel.id));
            if (!panel) {
                return i.reply({ content: `${client.emoji.cross} | This ticket does not belong to a valid panel.`, ephemeral: true });
            }
        
            // Find the ticket that is being reopened
            const ticketIndex = data.createdBy.findIndex(ticket => ticket.panelId === panel.panelId && ticket.channelId === i.channel.id);
            if (ticketIndex === -1) {
                return i.reply({ content: `${client.emoji.cross} | Could not find the ticket in the database.`, ephemeral: true });
            }
        
            // Get the ticket creator's ID
            const ticketCreator = data.createdBy[ticketIndex]?.userId;
            const member = i.guild.members.cache.get(ticketCreator) || await i.guild.members.fetch(ticketCreator).catch(console.error);
        
            const open = i.channel.permissionOverwrites.cache.get(member.id)?.allow.has(['ViewChannel', 'SendMessages']);
            if (open) {
                await i.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Ticket <#${i.channel.id}> is already **opened**`)
                        .setColor(client.color)
                    ],
                    ephemeral: true // Send as ephemeral if needed
                });
            } else {
                // Reopen the ticket: Update permissions and grant access for the user
                await i.channel.permissionOverwrites.edit(member.id, { ViewChannel: true, SendMessages: true });
                data.createdBy[ticketIndex].status = 'open';
        
                // Rename the ticket channel if it contains 'closed-' and if not on cooldown
                if (i.channel.name.startsWith('closed-')) {
                    if (!lastRenamed || now - lastRenamed >= renameCooldownTime) {
                        const newName = i.channel.name.replace(/^closed-/, ''); // Remove 'closed-' prefix
                        await i.channel.setName(newName).catch(console.error);
                        openRenameCooldowns.set(i.channel.id, now); // Set the cooldown
                    } else {
                        const timeLeft = Math.ceil((renameCooldownTime - (now - lastRenamed)) / 60000); // Minutes left for cooldown
                        await i.reply({
                            content: `Channel rename on cooldown. Skipping rename operation. Try again in ${timeLeft} minutes.`,
                            ephemeral: true
                        });
                    }
                }
        
                await data.save();
        
                // Log for ticket opening
                const ticketlogs = panel.logsChannelId ? i.guild.channels.cache.get(panel.logsChannelId) : null;
                if (ticketlogs) {
                    ticketlogs.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(client.color)
                                .setAuthor({ name: `Ticket Opened`, iconURL: i.user.displayAvatarURL({ dynamic: true }) })
                                .setDescription(`A ticket has been opened.`)
                                .addFields([
                                    { name: 'Ticket Owner', value: `<@${ticketCreator}>`, inline: true },
                                    { name: 'Opened By', value: `<@${i.user.id}>`, inline: true },
                                    { name: 'Ticket Channel', value: `<#${i.channel.id}>`, inline: true },
                                    { name: 'Ticket Action', value: 'Opened', inline: true },
                                    { name: 'Panel Name', value: panel.panelName, inline: true },
                                    { name: 'Panel ID', value: panel.panelId, inline: true },
                                    { name: 'Ticket ID', value: i.channel.id, inline: true }
                                ])
                                .setFooter({ text: `Ticket opened on panel: ${panel.panelName}` })
                                .setTimestamp()
                        ]
                    }).catch(err => console.error("Failed to send ticket open log: ", err));
                } else {
                    if (panel.logsChannelId) {
                        panel.logsChannelId = null;
                    }
                    await data.save();
                }
        
                await i.reply({
                    embeds: [new EmbedBuilder()
                        .setDescription(`Ticket <#${i.channel.id}> has been **opened** by ${i.user.tag}`)
                        .setColor(client.color)
                    ],
                });
            }
        }
                if (i.customId === "transcript") {
          try {
            // Fetch ticket panel data for the guild
            const data = await ticketPanelSchema.findOne({ guildId: i.guild.id });
            if (!data) {
              return i.reply({ content: `${client.emoji.cross} | Ticket system is not set up.`, ephemeral: true });
            }

            // Find the panel that the ticket belongs to
            const panel = data.panels.find(panel => panel.channels.includes(i.channel.id));
            if (!panel) {
              return i.reply({ content: `${client.emoji.cross} | This ticket does not belong to a valid panel.`, ephemeral: true });
            }

            const ticketChannel = i.channel;
            const transcriptChannelId = panel.transcriptChannelId;

            // Check if transcript channel is set in the ticket panel
            if (!transcriptChannelId) {
              return i.reply({ content: `${client.emoji.cross} | Transcript channel is not set up for this ticket panel.`, ephemeral: true });
            }

            const transcriptChannel = i.guild.channels.cache.get(transcriptChannelId);
            if (!transcriptChannel) {
              return i.reply({ content: `${client.emoji.cross} | Transcript channel not found.`, ephemeral: true });
            }
            const ticketCreator = data.createdBy.find(ticket => ticket?.panelId === panel?.panelId && panel?.channels.includes(i.channel.id))?.userId;

            const now = Date.now();
            const cooldownTime = 60 * 1000; // 1 minute cooldown in milliseconds
            const lastGenerated = transcriptCooldowns.get(ticketChannel.id);

            if (lastGenerated && now - lastGenerated < cooldownTime) {
              const timeLeft = Math.ceil((cooldownTime - (now - lastGenerated)) / 1000);
              return i.reply({ content: `${client.emoji.cross} | Please wait ${timeLeft} seconds before generating another transcript.`, ephemeral: true });
            }

            // Fetch all messages from the ticket channel
            const fetchAllMessages = async (channel) => {
              let messages = [];
              let lastMessageId = null;
              let fetchedMessages;

              do {
                fetchedMessages = await channel.messages.fetch({ limit: 100, before: lastMessageId });
                messages = messages.concat(Array.from(fetchedMessages.values()));
                lastMessageId = fetchedMessages.last()?.id;
              } while (fetchedMessages.size > 0);

              return messages;
            };

            const allMessages = await fetchAllMessages(ticketChannel);
            const sortedMessages = allMessages.reverse(); // Sort messages in chronological order

            // Generate the transcript
            const transcript = await discordTranscripts.generateFromMessages(sortedMessages, ticketChannel, {
              returnType: 'attachment',
              filename: `${panel.panelName}-${ticketChannel.name}-transcript.html`,
              saveImages: true,
              footerText: `${panel.panelName} Ticket Transcript Exported`,
              callbacks: {
                resolveChannel: (channelId) => i.guild.channels.cache.get(channelId),
                resolveUser: (userId) => i.client.users.fetch(userId),
                resolveRole: (roleId) => i.guild.roles.cache.get(roleId),
              },
              poweredBy: false,
              ssr: true
            });

            // Send the transcript file to the transcript channel first and get the message ID
            const transcriptMessage = await transcriptChannel.send({
              content: `Transcript for the ticket in ${ticketChannel.name} has been generated.`,
              files: [transcript]
            });

            const transcriptFileURL = transcriptMessage.attachments.first()?.url;

            // Fetch all users involved in the ticket conversation
            const participants = new Set();
            allMessages.forEach(message => participants.add(message.author.tag));
            const participantList = [...participants].map((user, index) => `**${index + 1}** - ${user}`).join('\n');

            // Create an embed with details about the ticket
            const transcriptEmbed = new EmbedBuilder()
              .setColor('#2F3136')
              .setAuthor({ name: i.user.tag, iconURL: i.user.displayAvatarURL() })
              .setTitle('Ticket Transcript')
              .addFields(
                { name: 'Ticket Owner', value: `<@${ticketCreator || "N/A"}>`, inline: true },
                { name: 'Ticket Name', value: ticketChannel.name, inline: true },
                { name: 'Panel Name', value: panel.panelName || "N/A", inline: true },
                { name: 'Transcript', value: 'Attached below', inline: true },
                { name: 'Direct Transcript', value: 'Use Button', inline: true },
                { name: 'Users in Transcript', value: participantList, inline: true }
              )
              .setFooter({ text: `Ticket ID: ${ticketChannel.id}`, iconURL: i.guild.iconURL() })
              .setTimestamp();

            // Create the button for direct download using the transcript URL
            const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setLabel('Direct Download Link')
                  .setEmoji('📄')
                  .setStyle(ButtonStyle.Link)
                  .setURL(transcriptFileURL) // Use the transcript file URL
              );

            // Send the embed and button in the transcript channel
            await transcriptChannel.send({
              embeds: [transcriptEmbed],
              components: [row]
            });

            // Store the timestamp of the last transcript generation
            transcriptCooldowns.set(ticketChannel.id, now);

            // Reply to the user to confirm success
            await i.reply({ content: `${client.emoji.tick} | Transcript has been successfully sent to the transcript channel.`, ephemeral: true });
// Log for ticket transcript
const ticketlogs = panel.logsChannelId ? i.guild.channels.cache.get(panel.logsChannelId) : null;

if (ticketlogs) {
    ticketlogs.send({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setAuthor({ name: `Ticket Transcript`, iconURL: i.user.displayAvatarURL({ dynamic: true }) })
                .setDescription(`A ticket transcript has been generated.`)
                .addFields([
                    { name: 'Ticket Owner', value: `<@${ticketCreator}>`, inline: true }, // Who created the ticket
                    { name: 'Transcript Generated By', value: `<@${i.user.id}>`, inline: true }, // Who generated the transcript
                    { name: 'Ticket Channel', value: `<#${i.channel.id}>`, inline: true }, // Ticket channel
                    { name: 'Ticket Action', value: 'Transcript Generated', inline: true }, // Action
                    { name: 'Panel Name', value: panel.panelName, inline: true }, // Panel name
                    { name: 'Panel ID', value: panel.panelId, inline: true }, // Panel ID
                    { name: 'Transcript Channel', value: `<#${panel.transcriptChannelId}>`, inline: true } // Where transcript is sent
                ])
                .setFooter({ text: `Transcript generated for panel: ${panel.panelName}` })
                .setTimestamp()
        ]
    }).catch((err) => { });
 } else {
  if (panel.logsChannelId) {
    panel.logsChannelId = null
  }
  await data.save();
 }
          } catch (error) {
            console.error('Error generating transcript:', error);
            return i.reply({ content: `${client.emoji.cross} | Failed to generate or send the transcript. Please try again later.`, ephemeral: true });
          }
        }
      }
    } catch (e) {
      console.error(e);
      return i.reply({ content: `${client.emoji.cross} | Something went wrong.`, ephemeral: true });
    }
  });
};
