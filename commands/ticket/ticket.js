const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField } = require('discord.js');
const ticketPanelSchema = require('../../models/ticket'); // Adjust the path accordingly
const lastRenameMap = new Map();
module.exports = {
    name: 'ticket',
    aliases: [],
    premium: false,
    subcommand : ['panel setup','panel enable','panel disable','panel reset','panel list','member add','member remove','channel open','channel close','channel delete','channel rename'],
    category: 'ticket',
    run: async (client, message, args) => {
        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setThumbnail(message.guild.iconURL({ dynamic: true }) || message.author.displayAvatarURL({ dynamic: true }))
                        .setTitle('Ticket System Commands')
                        .setDescription('Use the commands below to manage your ticket system effectively.')
                        .addFields([
                            {
                                name: `${message.guild.prefix}ticket panel setup <panelname>`,
                                value: `\`Create a new ticket panel with the specified name.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket panel enable <panelname>`,
                                value: `\`Enable an existing ticket panel to accept ticket requests.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket panel disable <panelname>`,
                                value: `\`Disable a ticket panel to stop accepting ticket requests.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket panel reset <panelname/all>`,
                                value: `\`Reset a specific ticket panel or all ticket panels at once.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket panel list`,
                                value: `\`Show a list of all configured ticket panels.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket member add <@mention/userid>`,
                                value: `\`Add a member to the ticket channel so they can view and participate.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket member remove <@mention/userid>`,
                                value: `\`Remove a member from the ticket channel.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket channel open <#channel/id>`,
                                value: `\`Reopen a previously closed ticket channel.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket channel close <#channel/id>`,
                                value: `\`Close an open ticket channel.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket channel rename <#channel/id> <new-name>`,
                                value: `\`Rename a ticket channel to a new name.\``,
                                inline: false
                            },
                            {
                                name: `${message.guild.prefix}ticket channel delete <#channel/id>`,
                                value: `\`Permanently delete a ticket channel.\``,
                                inline: false
                            }
                        ])
                        .setFooter({ text: 'Ticket System', iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                ]
            });
        }        
        if(!message.guild.members.me.permissions.has('Administrator')) {
            return message.channel.send({ embeds : [client.util.embed().setColor(client.color).setDescription(`${client.emoji.cross} | I must have \`Administrator\` Permissions to run this command`)]})
        }
        if (args[0].toLowerCase() === 'panel') {
if (['setup', 'list', 'enable', 'disable', 'reset'].includes(args[1].toLowerCase()) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.cross} | You must have \`Administrator\` permissions to run this command.`)
        ]
    });
}

if (['setup', 'list', 'enable', 'disable', 'reset'].includes(args[1].toLowerCase()) && !client.util.hasHigher(message.member)) {
    return message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.cross} | You must have a higher role than the bot to run this command.`)
                .setTimestamp()
        ]
    });
}
      if (args[1].toLowerCase() === 'setup') {
                const panelName = args.slice(2).join(' ');
    
    // Check if panelName is provided
    if (!panelName) {
        return message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.cross} | Please provide a valid panel name to get started!`)
                .setFooter({ text: `Example: ${message.guild.prefix}ticket panel setup <panelname>`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
            ]
        });
    }
    
    // Check if the panelName exceeds 100 characters
    if (panelName.length > 100) {
        return message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.cross} | The panel name cannot exceed 100 characters. Please provide a shorter name.`)
                .setFooter({ text: `Panel name provided: ${panelName.length}/100 characters`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
            ]
        });
    }
                const existingSetup = await ticketPanelSchema.findOne({ guildId: message.guild.id });
               if (existingSetup && existingSetup.panels.length >= 2) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | You cannot \`create\` more than 2 ticket panels.`)]
                    });
                }

                if (existingSetup && existingSetup.panels.some(panel => panel.panelName.toLowerCase() === panelName.toLowerCase())) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | A ticket panel with the name \`${panelName}\` already exists.`)]
                    });
                }

                const maxAttempts = 3;

                async function promptUser(promptMessage, validationFn) {
                    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                        await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(promptMessage)] });

                        const filter = response => response.author.id === message.author.id;
                        try {
                            const userResponse = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
                            const result = validationFn(userResponse.first());
                            if (result) return result;

                            await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Invalid input. Please try again. (${attempt}/${maxAttempts})`)] });
                        } catch (error) {
                            await message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | You didn't respond in time. (${attempt}/${maxAttempts})`)] });
                        }

                        if (attempt === maxAttempts) return null;
                    }
                }

                // Create unique panelId for the new panel
                const panelId = existingSetup ? `panel-${existingSetup.panels.length + 1}` : 'panel-1';

                // Collect setup information for a new panel
                const ticketSetup = {
                    panelId: panelId,
                    panelName: panelName, // Use the panel name from args[1]
                    guildId: message.guild.id,
                    channelId: null,
                    categoryId: null,
                    logsChannelId: null,
                    supportRoleId: null,
                    staffRoleId: null,
                    transcriptChannelId: null
                };

                // Prompt for ticket creation channel
                const channel = await promptUser(
                    `Please provide the ticket creation channel.`,
                    (response) => {
                        const channel = response.mentions.channels.first() || message.guild.channels.cache.get(response.content);
                        return channel && channel.type === ChannelType.GuildText ? channel.id : null;
                    }
                );
                if (!channel) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });
                ticketSetup.channelId = channel;

                // Prompt for ticket creation category
                const category = await promptUser(
                    `Please provide the ticket creation category.`,
                    (response) => {
                        const category = response.mentions.channels.first() || message.guild.channels.cache.get(response.content);
                        return category && category.type === ChannelType.GuildCategory ? category.id : null;
                    }
                );
                if (!category) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });
                ticketSetup.categoryId = category;

                // Prompt for ticket logs channel decision
                const logsDecision = await promptUser(
                    `Do you need a ticket logs channel? Respond with \`yes\` or \`no\`.`,
                    (response) => ['yes', 'no'].includes(response.content.toLowerCase()) ? response.content.toLowerCase() : null
                );
                if (!logsDecision) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });

                if (logsDecision === 'yes') {
                    const logsChannel = await promptUser(
                        `Please provide the ticket logs channel.`,
                        (response) => {
                            const channel = response.mentions.channels.first() || message.guild.channels.cache.get(response.content);
                            return channel && channel.type === ChannelType.GuildText ? channel.id : null;
                        }
                    );
                    if (!logsChannel) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });
                    ticketSetup.logsChannelId = logsChannel;
                }

                // Ask for the transcript channel
                const transcriptDecision = await promptUser(
                    `Do you need a transcript channel? Respond with \`yes\` or \`no\`.`,
                    (response) => ['yes', 'no'].includes(response.content.toLowerCase()) ? response.content.toLowerCase() : null
                );
                if (!transcriptDecision) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });

                if (transcriptDecision === 'yes') {
                    const transcriptChannel = await promptUser(
                        `Please provide the transcript channel.`,
                        (response) => {
                            const channel = response.mentions.channels.first() || message.guild.channels.cache.get(response.content);
                            return channel && channel.type === ChannelType.GuildText ? channel.id : null;
                        }
                    );
                    if (!transcriptChannel) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });
                    ticketSetup.transcriptChannelId = transcriptChannel;
                }

                // Ask if user wants a support role
                const supportRoleDecision = await promptUser(
                    `Do you want to set a support role? Respond with \`yes\` or \`no\`.`,
                    (response) => ['yes', 'no'].includes(response.content.toLowerCase()) ? response.content.toLowerCase() : null
                );
                if (!supportRoleDecision) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });

                if (supportRoleDecision === 'yes') {
                    const supportRole = await promptUser(
                        `Please provide the support role.`,
                        (response) => {
                            const role = response.mentions.roles.first() || message.guild.roles.cache.get(response.content);
                            return role ? role.id : null;
                        }
                    );
                    if (!supportRole) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });
                    ticketSetup.supportRoleId = supportRole;
                }

                // Ask if user wants a staff role
                const staffRoleDecision = await promptUser(
                    `Do you want to set a staff role? Respond with \`yes\` or \`no\`.`,
                    (response) => ['yes', 'no'].includes(response.content.toLowerCase()) ? response.content.toLowerCase() : null
                );
                if (!staffRoleDecision) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });

                if (staffRoleDecision === 'yes') {
                    const staffRole = await promptUser(
                        `Please provide the staff role.`,
                        (response) => {
                            const role = response.mentions.roles.first() || message.guild.roles.cache.get(response.content);
                            return role ? role.id : null;
                        }
                    );
                    if (!staffRole) return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Failed to set up ticket panel.`)] });
                    ticketSetup.staffRoleId = staffRole;
                }

                // Save the panel to the database
                if (existingSetup) {
                    existingSetup.panels.push(ticketSetup);
                    await existingSetup.save();
                } else {
                    await new ticketPanelSchema({
                        guildId: message.guild.id,
                        panels: [ticketSetup]
                    }).save();
                }

                // Create and send the button for ticket creation with panelId
                let button = new ButtonBuilder()
                    .setEmoji("📨")
                    .setLabel("Create Tickets")
                    .setCustomId(`ticket_setup_${panelId}`)  // Append panelId to customId
                    .setStyle(ButtonStyle.Secondary);

                let row = new ActionRowBuilder().addComponents([button]);
                message.guild.channels.cache.get(channel).send({
                    embeds: [new EmbedBuilder()
						.setTitle(`${panelName} Ticket`)
                        .setDescription(`Click on the button below to create a ticket.`)
                        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL() })
                        .setTimestamp()
                        .setColor(client.color)
                    ],
                    components: [row]
                });

                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setDescription(`${client.emoji.tick} | Ticket \`panel\` has been set up in <#${channel}>!`)
                        .setColor(client.color)
                    ]
                }).then(m => {
                    setTimeout(() => {
                        if (m) m.delete().catch(() => null);
                    }, 3000);
                });
            } else if (args[1].toLowerCase() === 'enable') {
                const panelName = args.slice(2).join(' ').trim();
                if (!panelName) {
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Please provide a panel name.`)] });
                }

                const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
                if (!data) {
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Ticket system is not set up.`)] });
                }

                const panel = data.panels.find(p => p.panelName === panelName);
                if (!panel) {
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Panel not found.`)] });
                }

                if (panel.enabled) {
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Panel is already enabled.`)] });
                }

                panel.enabled = true;
                await data.save();

                message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.tick} | Panel \`${panelName}\` has been enabled.`)] });
            } else if (args[1].toLowerCase() === 'disable') {
                const panelName = args.slice(2).join(' ').trim();
                if (!panelName) {
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Please provide a panel name.`)] });
                }

                const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
                if (!data) {
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Ticket system is not set up.`)] });
                }

                const panel = data.panels.find(p => p.panelName === panelName);
                if (!panel) {
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Panel not found.`)] });
                }

                if (!panel.enabled) {
                    return message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.cross} | Panel is already disabled.`)] });
                }

                panel.enabled = false;
                await data.save();

                message.channel.send({ embeds: [new EmbedBuilder().setColor(client.color).setDescription(`${client.emoji.tick} | Panel \`${panelName}\` has been disabled.`)] });


            }
            if (args[1].toLowerCase() === 'reset') {
                if (!args[2]) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Please provide the panel name or use \`all\` to reset all panels.`)
                        ]
                    });
                }

                const panelName = args[2].trim();

                // Handle resetting all panels
                if (panelName.toLowerCase() === 'all') {
                    const data = await ticketPanelSchema.findOneAndDelete({ guildId: message.guild.id });

                    if (!data) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | There's **no** ticket setup to reset.`)
                            ]
                        });
                    }

                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.tick} | Successfully **cleared** all ticket panels.`)
                        ]
                    });
                }

                // Handle resetting a specific panel by name
                const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });

                if (!data || !data.panels || data.panels.length === 0) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | No panels are currently set up.`)
                        ]
                    });
                }

                const panelIndex = data.panels.findIndex(panel => panel.panelName.toLowerCase() === panelName.toLowerCase());

                if (panelIndex === -1) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | A panel with the name \`${panelName}\` doesn't exist.`)
                        ]
                    });
                }

                // Remove the specific panel from the array
                data.panels.splice(panelIndex, 1);

                // If no more panels exist, delete the entire document
                if (data.panels.length === 0) {
                    await ticketPanelSchema.findOneAndDelete({ guildId: message.guild.id });
                } else {
                    await data.save();
                }

                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.tick} | Successfully \`reset\` the panel \`${panelName}\`.`)
                    ]
                });
            } if (args[1].toLowerCase() === 'list') {
                const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
                if (!data || !data.panels || data.panels.length === 0) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | No ticket panels are set up in this guild.`)
                        ]
                    });
                }
                // Format the list of panels
                const panelList = data.panels.map((panel, index) => {
                    return `**${index + 1}. Panel Name:** \`${panel.panelName}\`\n**Panel ID:** ${panel.panelId}\n**Ticket Channel:** <#${panel.channelId}>\n**Category ID:** ${panel.categoryId}\n**Logs Channel:** ${panel.logsChannelId ? `<#${panel.logsChannelId}>` : 'None'}\n**Transcript Channel:** ${panel.transcriptChannelId ? `<#${panel.transcriptChannelId}>` : 'None'}\n**Panel Status:** ${panel.enabled ? `Enabled` : 'Disabled'}\n`;
                }).join("\n");
                // Send the list of panels in an embed
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(client.color)
                        .setTitle('Ticket Panels List')
                        .setDescription(panelList)
                        .setTimestamp()
                    ]
                });

            }
        } else if (args[0].toLowerCase() === 'member') {
            if (['remove','add'].includes(args[1].toLowerCase()) && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | You must have \`Manage Channels\` permissions to run this command.`)
                    ]
                });
            }            
        if (args[1].toLowerCase() === 'add') {
                const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
                if (!data) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | There's \`no\` ticket setup yet!`)
                        ]
                    });
                }

                // Find the panel where this channel is a valid ticket channel
                const ticketPanel = data.panels.find(panel => panel.channels.includes(message.channel.id));
                if (!ticketPanel) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | This channel \`isn't\` a valid ticket channel.`)
                        ]
                    });
                }

                const members = message.channel.members;
                if (members.size >= 10) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | You can only add up to \`10\` members in this ticket.`)
                        ]
                    });
                }

                if (args[2]) {
                    const member = await message.mentions.members.first() || await message.guild.members.cache.get(args[2]) || await message.guild.members.fetch(args[2]).catch(() => null);
                    if (!member) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Member \`not\` found.`)
                            ]
                        });
                    }
                    // Add support role if it exists in the panel
                    if (ticketPanel.supportRoleId) {
                        const supportRole = await message.guild.roles.fetch(ticketPanel.supportRoleId).catch(() => null);
                        if (supportRole) {
                            member.roles.add(supportRole).catch(() => null);
                        }
                    }
                    // Add staff role if it exists in the panel
                    if (ticketPanel.staffRoleId) {
                        const staffRole = await message.guild.roles.fetch(ticketPanel.staffRoleId).catch(() => null);
                        if (staffRole) {
                            member.roles.add(staffRole).catch(() => null);
                        }
                    }
                    // Modify permissions for the member in the ticket channel
                    try {
                        await message.channel.permissionOverwrites.edit(member.id, {
                            SendMessages: true,
                            AddReactions: true,
                            ViewChannel: true
                        });
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.tick} | Successfully added <@!${member.id}> to the \`ticket\` channel.`)
                            ]
                        });
                    } catch (error) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Unable to \`add\` the member to the ticket.`)
                            ]
                        });
                    }
                } else {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Please specify a member to add using the correct format: \`${message.guild.prefix}ticket member add <member>\`.`)
                        ]
                    });
                }
            } else if (args[1].toLowerCase() === 'remove') {
                const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
                if (!data) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | There's \`no\` ticket setup yet!`)
                        ]
                    });
                }

                const ticketPanel = data.panels.find(panel => panel.channels.includes(message.channel.id));
                if (!ticketPanel) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | This channel \`isn't\` a valid ticket channel.`)
                        ]
                    });
                }

                if (args[2]) {
                    const member = await message.mentions.members.first() || await message.guild.members.cache.get(args[2]) || await message.guild.members.fetch(args[2]).catch(() => null);
                    if (!member) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Member \`not\` found.`)
                            ]
                        });
                    }

                    // Remove support role if it exists and the member has it
                    if (ticketPanel.supportRoleId) {
                        const supportRole = await message.guild.roles.fetch(ticketPanel.supportRoleId).catch(() => null);
                        if (supportRole && member.roles.cache.has(supportRole.id)) {
                            member.roles.remove(supportRole).catch(() => null);
                        }
                    }

                    // Remove staff role if it exists and the member has it
                    if (ticketPanel.staffRoleId) {
                        const staffRole = await message.guild.roles.fetch(ticketPanel.staffRoleId).catch(() => null);
                        if (staffRole && member.roles.cache.has(staffRole.id)) {
                            member.roles.remove(staffRole).catch(() => null);
                        }
                    }

                    // Remove member's view permissions in the ticket channel
                    try {
                        message.channel.permissionOverwrites.edit(member.id, {
                            ViewChannel: false
                        });

                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.tick} | Successfully removed <@!${member.id}> from the \`ticket\` channel.`)
                            ]
                        });
                    } catch (error) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Unable to \`remove\` the member from the ticket.`)
                            ]
                        });
                    }
                } else {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Please specify a member to remove using the correct format: \`${message.guild.prefix}ticket member remove <member>\`.`)
                        ]
                    });
                }
            
         }
        } else if (args[0].toLowerCase() === 'channel') {
            if (['rename', 'close', 'delete', 'open'].includes(args[1].toLowerCase()) && !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | You must have \`Manage Channels\` permissions to run this command.`)
                            .setTimestamp()
                    ]
                });
            }
if (args[1].toLowerCase() === 'rename') {
    let channel;
    const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
    // Check if ticket system exists
    if (!data) {
        return message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.cross} | There's \`no\` ticket setup yet!`)
            ]
        });
    }
    try {
        // Handle if a specific channel is provided
        if (args[2]) {
            let channel =
           await getChannelFromMention(message, args[2]) ||
            message.guild.channels.cache.get(args[2])
            if (!channel) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | Please Provide a valid channel.`)
                    ]
                });
            }
            const panel = data.panels.find(panel => panel.channels.includes(channel.id));
            // Ensure that the channel is a ticket channel
            if (!panel) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | This channel \`isn't\` a ticket channel!`)
                    ]
                });
            }
            // Check if the channel was renamed in the last 10 minutes using the Map
            const now = Date.now();
            const lastRename = lastRenameMap.get(channel.id) || 0;
            const timeDiff = now - lastRename;
            const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
            if (timeDiff < tenMinutes) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You can rename this ticket only once every 10 minutes!`)
                    ]
                });
            }
            // Rename the channel
            const newName = args.slice(3).join(' '); // Get the new name from arguments
            if (!newName) {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | Please provide a valid channel name.`)
                    ]
                });
            }

            await channel.setName(newName, 'Ticket channel renamed').catch(() => null);

            // Update the lastRename timestamp in the Map
            lastRenameMap.set(channel.id, Date.now());

            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.tick} | The channel has been \`successfully\` renamed to **${newName}**.`)
                ]
            });
        } 
    } catch (e) {
        // Error handling
        console.log(e)
        return message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.cross} | Unable to \`rename\` the channel!`)
            ]
        });
    }
} else if (args[1].toLowerCase() === 'close') {
    // Fetch ticket data from the database
    const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
    if (!data) {
        return message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.cross} | There's \`no\` ticket setup yet!`)
            ]
        });
    }
    // Ensure that the channel is a ticket channel
    try {
        let channel =
       await getChannelFromMention(message, args[2]) ||
        message.guild.channels.cache.get(args[2])
        if (!channel) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | Please Provide a valid channel.`)
                ]
            });
        }
        const panel = data.panels.find(panel => panel.channels.includes(channel.id));

        // Check if the channel exists
        if (!panel) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | This channel isn't part of any ticket panel!`)
                ]
            });
        }

        // Find the ticket in the database
        const ticketIndex = data.createdBy.findIndex(ticket => ticket.panelId === panel.panelId && ticket.channelId === channel.id);
        if (ticketIndex === -1) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.emoji.cross} | Could not find the ticket in the database.`)
                ]
            });
        }

        // Get the ticket creator's ID
        const ticketCreator = data.createdBy[ticketIndex]?.userId;
        const member = message.guild.members.cache.get(ticketCreator) || await message.guild.members.fetch(ticketCreator).catch(console.error);

        // Check if the person closing the ticket has permission
        if (!message.member.permissions.has("ManageChannels") && message.author.id !== member?.id) {
            return message.reply({ content: `${client.emoji.cross} | You don't have permission to close this ticket.` });
        }

        // Check if the ticket is already closed
        const isOpen = channel.permissionOverwrites.cache.get(member.id)?.deny.has(['ViewChannel', 'SendMessages']);
        if (isOpen) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`Ticket <#${channel.id}> is already **closed**.`)
                ]
            });
        }

        // Close the ticket: Update permissions and remove access for the user
        await channel.permissionOverwrites.edit(member.id, { ViewChannel: false, SendMessages: false });

        // Update the ticket status to 'closed'
        data.createdBy[ticketIndex].status = 'closed';
        await data.save();

        // Send confirmation message
        await message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`Ticket <#${channel.id}> has been **closed** by ${message.author.tag}.`)
            ]
        });

        // Log for ticket closing
        const ticketlogs = panel.logsChannelId ? message.guild.channels.cache.get(panel.logsChannelId) : null;
        if (ticketlogs) {
            ticketlogs.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setAuthor({ name: `Ticket Closed`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                        .setDescription(`A ticket has been closed.`)
                        .addFields([
                            { name: 'Ticket Owner', value: `<@${ticketCreator}>`, inline: true },
                            { name: 'Closed By', value: `<@${message.author.id}>`, inline: true },
                            { name: 'Ticket Channel', value: channel.name, inline: true },
                            { name: 'Ticket Action', value: 'Closed', inline: true },
                            { name: 'Panel Name', value: panel.panelName, inline: true },
                            { name: 'Panel ID', value: panel.panelId, inline: true },
                            { name: 'Ticket ID', value: channel.id, inline: true }
                        ])
                        .setFooter({ text: `Ticket closed in panel: ${panel.panelName}` })
                        .setTimestamp()
                ]
            }).catch(err => console.error("Failed to send ticket close log: ", err));
        } else {
            if(panel.logsChannelId){
                panel.logsChannelId = null;
            }
            await data.save()
        }

    } catch (error) {
        console.error(error);
        return message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`${client.emoji.cross} | Unable to close the ticket!`)
            ]
        });
    }
} else if (args[1].toLowerCase() === 'delete') {
                
                // Fetch ticket data from the database
                const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
                if (!data) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | There's \`no\` ticket setup yet!`)
                        ]
                    });
                }
            
                try {
                    // Fetch the mentioned cha
                    
        let channel =
        await getChannelFromMention(message, args[2]) ||
         message.guild.channels.cache.get(args[2])
         if (!channel) {
             return message.channel.send({
                 embeds: [new EmbedBuilder()
                     .setColor(client.color)
                     .setDescription(`${client.emoji.cross} | Please Provide a valid channel.`)
                 ]
             });
         }
 
                    if (!channel) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Please provide a valid channel.`)
                            ]
                        });
                    }
                    // Ensure the channel is part of the ticket system
                    const panel = data.panels.find(panel => panel.channels.includes(channel.id));
                    if (!panel) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | This channel isn't part of any ticket panel!`)
                            ]
                        });
                    }
            
                    // Find the ticket in the database
                    const ticketIndex = data.createdBy.findIndex(ticket => ticket.panelId === panel.panelId && ticket.channelId === channel.id);
                    if (ticketIndex === -1) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Could not find the ticket in the database.`)
                            ]
                        });
                    }
            
                    // Get the ticket creator's ID
                    const ticketCreator = data.createdBy[ticketIndex]?.userId;
            
                    // Remove the channel from the panel's channels array
                    const channelIndex = panel.channels.indexOf(channel.id);
                    if (channelIndex !== -1) {
                        panel.channels.splice(channelIndex, 1);
                    }
            
                    // Remove the ticket from the createdBy array
                    if (ticketIndex !== -1) {
                        data.createdBy.splice(ticketIndex, 1);
                    }
            
                    await data.save();
            
                    // Log the ticket deletion
                    const ticketlogs = panel.logsChannelId ? message.guild.channels.cache.get(panel.logsChannelId) : null;
                    if (ticketlogs) {
                        ticketlogs.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(client.color)
                                    .setAuthor({ name: `Ticket Deleted`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                                    .setDescription(`A ticket has been deleted.`)
                                    .addFields([
                                        { name: 'Ticket Owner', value: `<@${ticketCreator}>`, inline: true },
                                        { name: 'Deleted By', value: `<@${message.author.id}>`, inline: true },
                                        { name: 'Ticket Channel', value: channel.name, inline: true },
                                        { name: 'Panel Name', value: panel.panelName, inline: true },
                                        { name: 'Panel ID', value: panel.panelId, inline: true },
                                        { name: 'Ticket ID', value: channel.id, inline: true }
                                    ])
                                    .setFooter({ text: `Ticket deleted from panel: ${panel.panelName}` })
                                    .setTimestamp()
                            ]
                        }).catch(err => console.error("Failed to send ticket deletion log: ", err));
                    } else {
                        if(panel.logsChannelId){
                            panel.logsChannelId = null
                        }
                        
                    await data.save();
            
                    }
            
                    // Notify the user and delete the channel
                    await message.reply(`${client.emoji.tick} | Deleting this **ticket** in 3 seconds...`);
                    setTimeout(async () => {
                        await channel.delete().catch(() => null);
                    }, 3000);
            
                } catch (error) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Unable to delete the ticket!`)
                        ]
                    });
                }
            }  else if (args[1].toLowerCase() === 'open') {
                const data = await ticketPanelSchema.findOne({ guildId: message.guild.id });
                
                // Check if the ticket system exists
                if (!data) {
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Ticket system is not set up yet!`)
                        ]
                    });
                }
            
                try {
                    // Fetch the channel to be opened
                    if (args[2]) {
   
                        let channel =
                        await getChannelFromMention(message, args[2]) ||
                         message.guild.channels.cache.get(args[2])
                         if (!channel) {
                             return message.channel.send({
                                 embeds: [new EmbedBuilder()
                                     .setColor(client.color)
                                     .setDescription(`${client.emoji.cross} | Please Provide a valid channel.`)
                                 ]
                             });
                         }

                    }
        
                    // Ensure the channel is a valid ticket channel
                    const panel = data.panels.find(panel => panel.channels.includes(channel.id));
                    if (!panel) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | This channel isn't part of any ticket panel!`)
                            ]
                        });
                    }
            
                    // Find the ticket associated with this channel
                    const ticketIndex = data.createdBy.findIndex(ticket => ticket.panelId === panel.panelId && ticket.channelId === channel.id);
                    if (ticketIndex === -1) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Ticket not found in the database.`)
                            ]
                        });
                    }
            
                    const ticketCreator = data.createdBy[ticketIndex]?.userId;
                    const member = message.guild.members.cache.get(ticketCreator) || await message.guild.members.fetch(ticketCreator).catch(console.error);
            
                    // Check if the ticket is already open
                    const open = channel.permissionOverwrites.cache.get(member.id)?.allow.has(['ViewChannel', 'SendMessages']);
                    if (open) {
                        return message.channel.send({
                            embeds: [new EmbedBuilder()
                                .setColor(client.color)
                                .setDescription(`Ticket <#${channel.id}> is already **open**.`)
                            ]
                        });
                    }
            
                    // Reopen the ticket by adjusting permissions
                    await channel.permissionOverwrites.edit(member.id, { ViewChannel: true, SendMessages: true });
                    data.createdBy[ticketIndex].status = 'open';
                    await data.save();
            
                    // Log the ticket reopening
                    const ticketlogs = panel.logsChannelId ? message.guild.channels.cache.get(panel.logsChannelId) : null;
                    if (ticketlogs) {
                        ticketlogs.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(client.color)
                                    .setAuthor({ name: `Ticket Opened`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                                    .setDescription(`A ticket has been reopened.`)
                                    .addFields([
                                        { name: 'Ticket Owner', value: `<@${ticketCreator}>`, inline: true },
                                        { name: 'Opened By', value: `<@${message.author.id}>`, inline: true },
                                        { name: 'Ticket Channel', value: `<#${channel.id}>`, inline: true },
                                        { name: 'Ticket Action', value: 'Opened', inline: true },
                                        { name: 'Panel Name', value: panel.panelName, inline: true },
                                        { name: 'Panel ID', value: panel.panelId, inline: true },
                                        { name: 'Ticket ID', value: channel.id, inline: true }
                                    ])
                                    .setFooter({ text: `Ticket opened on panel: ${panel.panelName}` })
                                    .setTimestamp()
                            ]
                        }).catch(err => console.error("Failed to send ticket open log: ", err));
                    } else {
                        if(panel.logsChannelId){
                            panel.logsChannelId = null;
                        }
                        await data.save()
                    }
            
                    // Success message after opening the ticket
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`Ticket <#${channel.id}> has been **opened** by ${message.author.tag}.`)
                        ]
                    });
            
                } catch (error) {
                    console.error(error);
                    return message.channel.send({
                        embeds: [new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Unable to open the ticket!`)
                        ]
                    });
                }
            } else {
                return message.channel.send({
                    embeds: [new EmbedBuilder()
                        .setFooter({ text: `Developed with ❤️ by ${client.user.username} development.` })
                        .setColor(client.color)
                        .setAuthor({ name: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL() })
                        .setDescription(`${client.config.baseText}\n\`${message.guild.prefix}ticket\`\nShows you the current page.\n\n\`${message.guild.prefix}ticket setup\`\nSets up the ticket system.\n\n\`${message.guild.prefix}ticket reset\`\nResets the ticket system.\n\n\`${message.guild.prefix}ticket add <member>\`\nAdds a member to a ticket.\n\n\`${message.guild.prefix}ticket remove <member>\`\nRemoves a member from the ticket.\n\n\`${message.guild.prefix}ticket delete [channelId]\`\nDeletes an existing ticket.\n\n\`${message.guild.prefix}ticket close [channelId]\`\nCloses an opened ticket.`)
                    ]
                });
            }
        }
    }
    
}



async function getChannelFromMention(message, mention) {
    if (!mention) return null

    const matches = mention.match(/^<#(\d+)>$/)
    if (!matches) return null

    const channelId = matches[1]
    return await message.guild.channels.fetch(channelId) || message.channel
}
