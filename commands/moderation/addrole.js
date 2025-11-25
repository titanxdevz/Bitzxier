const { Message, Client, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection,PermissionFlagsBits } = require('discord.js');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
    name: 'role',
    aliases: ['r'],
    category: 'mod',
    subcommand : ['all','humans','cancel','status'],
    premium: false,

    run: async (client, message, args) => {
        const embed = client.util.embed().setColor(client.color);
        const own = message.author.id === message.guild.ownerId;

        if (!message.member.permissions.has('ManageRoles')) {
            return message.channel.send({
                embeds: [
                    embed.setDescription(
                        `${client.emoji.cross} | You must have \`Manage Roles\` permissions to use this command.`
                    )
                ]
            });
        }


        if (!message.guild.members.me.permissions.has('ManageRoles')) {
            return message.channel.send({
                embeds: [
                    embed.setDescription(
                        `${client.emoji.cross} | I don't have \`Manage Roles\` permissions to execute this command.`
                    )
                ]
            });
        }

        if (!own && message.member.roles.highest.position <= message.guild.members.me.roles.highest.position) {
            return message.channel.send({
                embeds: [
                    embed.setDescription(
                        `${client.emoji.cross} | You must have a higher role than me to use this command.`
                    )
                ]
            });
        }

        let roleToAdd = findMatchingRoles(message.guild, args.slice(1).join(' '));
        roleToAdd = roleToAdd[0];
        if (args[0] === 'all') {
            if (!roleToAdd) {
                return message.channel.send({
                    embeds: [
                        client.util.embed().setDescription(
                            `${client.emoji.cross} | You didn't provide a valid role.\n\`${message.guild.prefix}role all <role>\``
                        )
                    ]
                });
            }
            if (roleToAdd.managed) {
                return message.channel.send({
                    embeds: [
                        embed.setColor(client.color).setDescription(
                            `${client.emoji.cross} | This Role Is Managed By Integration`
                        )
                    ]
                });
            }
            if (!roleToAdd.editable) {
                return message.channel.send({
                    embeds: [
                        client.util.embed().setColor(client.color).setDescription(
                            `${client.emoji.cross} | I can't provide this role as my highest role is either below or equal to the provided role.`
                        )
                    ]
                });
            }

            let array = ["KickMembers", "BanMembers", "Administrator", "ManageChannels", "ManageGuild", "MentionEveryone", "ManageRoles", "ManageWebhooks", "ManageEvents", "ModerateMembers", "ManageEmojisAndStickers"];
            if (roleToAdd.permissions.has("KickMembers") || roleToAdd.permissions.has("BanMembers") || roleToAdd.permissions.has("Administrator") || roleToAdd.permissions.has("ManageChannels") || roleToAdd.permissions.has("ManageGuild") || roleToAdd.permissions.has("MentionEveryone") || roleToAdd.permissions.has("ManageRoles") || roleToAdd.permissions.has("ManageWebhooks") || roleToAdd.permissions.has("ManageEvents") || roleToAdd.permissions.has("ModerateMembers") || roleToAdd.permissions.has("ManageEmojisAndStickers")) {
                return message.channel.send({ embeds: [client.util.embed().setDescription(`${client.emoji.cross} | This <@&${roleToAdd.id}> Role is having Dangerous Permissions So i won't give it to everyone \n ROLE PERMISSIONS : ${new PermissionsBitFieldBitField(roleToAdd.permissions.bitfield).toArray().filter(a => array.includes(a)).map(arr => `\`${arr}\``).join(", ")} permissions`).setColor(client.color)] })
            }
            const membersWithoutRole = await message.guild.members.fetch().then(m => m.filter(x => !x.roles.cache.has(roleToAdd.id)));
            if (membersWithoutRole.size === 0) {
                return message.channel.send({
                    embeds: [
                        client.util.embed().setColor(client.color).setDescription(`All members already have the provided role: ${roleToAdd.name}`)
                    ]
                });
            }

            if (roleToAdd && !message.guild.roleAssignmentActive) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('yes_button')
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('no_button')
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger)
                );
                const interactionMessage = await message.channel.send({
                    embeds: [
                        embed.setDescription(
                            `**${client.emoji.process} | Processing Command Please Wait**`
                        ),
                    ],
                });
            await client.util.sleep(4000)
                interactionMessage.edit({
                    embeds: [
                        embed.setDescription(
                            `**Are you sure you want to give ${roleToAdd} to everyone in this server?**`
                        ),
                    ], components: [row],
                });
                const filter = interaction => (interaction.customId === 'yes_button' || interaction.customId === 'no_button') && interaction.user.id === message.author.id;

                const collector = interactionMessage.createMessageComponentCollector({ filter, time: 10000 });

                collector.on('collect', async interaction => {
                    if (interaction.isButton()) {
                        if (interaction.customId === 'yes_button') {
                            interactionMessage.edit({
                                embeds: [
                                    embed.setDescription(
                                        `${client.emoji.tick} | Successfully started adding <@&${roleToAdd.id}> to all members.`
                                    ),
                                ],
                                components: [],
                            });

                            collector.stop();
                            try {
                                const members = await message.guild.members.fetch();
                                let num = 0;
                                message.guild.roleAssignmentActive = true;
                                message.guild.roleToAssign = roleToAdd;
                                if (message.guild.roleAssignmentActive && message.guild.roleToAssign) {
                                    for (const m of members) {
                                        const member = m[1];
                                        if (message.guild.roles.cache.has(roleToAdd.id) && !member.roles.cache.has(message.guild.roleToAssign.id) && !message.guild.roleToAssign.permissions.has("KickMembers") && !message.guild.roleToAssign.permissions.has("BanMembers") && !message.guild.roleToAssign.permissions.has("Administrator") && !message.guild.roleToAssign.permissions.has("ManageChannels") && !message.guild.roleToAssign.permissions.has("ManageGuild") && !message.guild.roleToAssign.permissions.has("MentionEveryone") && !message.guild.roleToAssign.permissions.has("ManageRoles") && !message.guild.roleToAssign.permissions.has("ManageWebhooks") && !message.guild.roleToAssign.permissions.has("ManageEvents") && !message.guild.roleToAssign.permissions.has("ModerateMembers") && !message.guild.roleToAssign.permissions.has("ManageEmojisAndStickers")) {
                                            try {
                                                await client.util.sleep(1400)
                                                await member.roles.add(message.guild.roleToAssign.id, `Role All Command Executed By: ${message.author.tag} | ${message.member.id}`);
                                                num++;
                                            } catch (err) {
                                                if (err.code === 429) {
                                                    await client.util.handleRateLimit();
                                                    return;
                                                }
                                            }
                                        }
                                    }
                                    

                                    const embed = client.util.embed()
                                    .setColor(client.color)
                                    .setTitle('Role Assignment Successful')
                                    .setDescription(`Successfully assigned the role **${message.guild.roleToAssign.name}** to ${num} members who previously lacked it`)
                                    .setTimestamp();
                                await message.channel.send({ embeds: [embed] })                 
                               if (message.guild.roleAssignmentActive) message.guild.roleAssignmentActive = false;
                                    message.guild.roleToAssign = null;
                                }
                            } catch (error) {
                                return;
                            }
                        } else if (interaction.customId === 'no_button') {
                            interactionMessage.edit({
                                embeds: [
                                    embed.setDescription(
                                        `Role addition process canceled.`
                                    ),
                                ],
                                components: [],
                            });

                            collector.stop();
                        }
                    }
                });
        collector.on('end', collected => {
            if (collected.size === 0) {
                interactionMessage.edit({
                    embeds: [
                        client.util.embed()
                          .setColor(client.color)
                          .setTitle('Role Assignment Timed Out')
                          .setDescription('The operation of role assignment has been cancelled due to inactivity.')
                          .addFields({ name : 'Reason for Timeout', value : 'Your response took longer than expected, exceeding the 10-second time limit.'})
                          .setTimestamp()
                      ],
                    components: [],
                });
            }
        });
            } else {
                return message.channel.send({
                    embeds: [
                        embed.setDescription(
                            `${client.emoji.cross} | There is already a role addition process going on in the server.`)
                            .setColor(client.color),
                    ],
                });
            }

        } else  if (args[0].toLowerCase() === 'humans' || args[0].toLowerCase() === 'human') {
            if (!roleToAdd) {
                return message.channel.send({
                    embeds: [
                        client.util.embed().setDescription(
                            `${client.emoji.cross} | You didn't provide a valid role.\n\`${message.guild.prefix}role humans <role>\``
                        )
                    ]
                });
            }
            if (roleToAdd.managed) {
                return message.channel.send({
                    embeds: [
                        embed.setColor(client.color).setDescription(
                            `${client.emoji.cross} | This Role Is Managed By Integration`
                        )
                    ]
                });
            }
            if (!roleToAdd.editable) {
                return message.channel.send({
                    embeds: [
                        client.util.embed().setColor(client.color).setDescription(
                            `${client.emoji.cross} | I can't provide this role as my highest role is either below or equal to the provided role.`
                        )
                    ]
                });
            }

            let array = ["KickMembers", "BanMembers", "Administrator", "ManageChannels", "ManageGuild", "MentionEveryone", "ManageRoles", "ManageWebhooks", "ManageEvents", "ModerateMembers", "ManageEmojisAndStickers"];
            if (roleToAdd.permissions.has("KickMembers") || roleToAdd.permissions.has("BanMembers") || roleToAdd.permissions.has("Administrator") || roleToAdd.permissions.has("ManageChannels") || roleToAdd.permissions.has("ManageGuild") || roleToAdd.permissions.has("MentionEveryone") || roleToAdd.permissions.has("ManageRoles") || roleToAdd.permissions.has("ManageWebhooks") || roleToAdd.permissions.has("ManageEvents") || roleToAdd.permissions.has("ModerateMembers") || roleToAdd.permissions.has("ManageEmojisAndStickers")) {
                return message.channel.send({ embeds: [client.util.embed().setDescription(`${client.emoji.cross} | This <@&${roleToAdd.id}> Role is having Dangerous Permissions So i won't give it to everyone \n ROLE PERMISSIONS : ${new PermissionsBitField(roleToAdd.permissions.bitfield).toArray().filter(a => array.includes(a)).map(arr => `\`${arr}\``).join(", ")} permissions`).setColor(client.color)] })
            }
            const membersWithoutRole = await message.guild.members.fetch().then(m => m.filter(x => !x.user.bot && !x.roles.cache.has(roleToAdd.id)));
            if (membersWithoutRole.size === 0) {
                return message.channel.send({
                    embeds: [
                        client.util.embed().setColor(client.color).setDescription(`All members already have the provided role: ${roleToAdd.name}`)
                    ]
                });
            }

            if (roleToAdd && !message.guild.roleAssignmentActive) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('yes_button')
                        .setLabel('Yes')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('no_button')
                        .setLabel('No')
                        .setStyle(ButtonStyle.Danger)
                );
                const interactionMessage = await message.channel.send({
                    embeds: [
                        embed.setDescription(
                            `**${client.emoji.process} | Processing Command Please Wait**`
                        ),
                    ],
                });
            await client.util.sleep(4000)
                interactionMessage.edit({
                    embeds: [
                        embed.setDescription(
                            `**Are you sure you want to give ${roleToAdd} to everyone in this server?**`
                        ),
                    ], components: [row],
                });
                const filter = interaction => (interaction.customId === 'yes_button' || interaction.customId === 'no_button') && interaction.user.id === message.author.id;

                const collector = interactionMessage.createMessageComponentCollector({ filter, time: 10000 });

                collector.on('collect', async interaction => {
                    if (interaction.isButton()) {
                        if (interaction.customId === 'yes_button') {
                            interactionMessage.edit({
                                embeds: [
                                    embed.setDescription(
                                        `${client.emoji.tick} | Successfully started adding <@&${roleToAdd.id}> to all members.`
                                    ),
                                ],
                                components: [],
                            });

                            collector.stop();
                            try {
                                const members = await message.guild.members.fetch();
                                let num = 0;
                                message.guild.roleAssignmentActive = true;
                                message.guild.roleToAssign = roleToAdd;
                                if (message.guild.roleAssignmentActive && message.guild.roleToAssign) {
                                    for (const m of members) {
                                        
                                        const member = m[1];
                                        if (message.guild.roles.cache.has(roleToAdd.id) && !member.user.bot && !member.roles.cache.has(message.guild.roleToAssign.id) && !message.guild.roleToAssign.permissions.has("KickMembers") && !message.guild.roleToAssign.permissions.has("BanMembers") && !message.guild.roleToAssign.permissions.has("Administrator") && !message.guild.roleToAssign.permissions.has("ManageChannels") && !message.guild.roleToAssign.permissions.has("ManageGuild") && !message.guild.roleToAssign.permissions.has("MentionEveryone") && !message.guild.roleToAssign.permissions.has("ManageRoles") && !message.guild.roleToAssign.permissions.has("ManageWebhooks") && !message.guild.roleToAssign.permissions.has("ManageEvents") && !message.guild.roleToAssign.permissions.has("ModerateMembers") && !message.guild.roleToAssign.permissions.has("ManageEmojisAndStickers")) {
                                            try {
                                                await client.util.sleep(1400)
                                                await member.roles.add(message.guild.roleToAssign.id, `Role All Command Executed By: ${message.author.tag} | ${message.member.id}`);
                                                num++;
                                            } catch (err) {
                                                if (err.code === 429) {
                                                    await client.util.handleRateLimit();
                                                    return;
                                                }
                                            }
                                        }
                                    }
                                    

                                    const embed = client.util.embed()
                                    .setColor(client.color)
                                    .setTitle('Role Assignment Successful')
                                    .setDescription(`Successfully assigned the role **${message.guild.roleToAssign.name}** to ${num} members who previously lacked it`)
                                    .setTimestamp();
                                await message.channel.send({ embeds: [embed] })                 
                               if (message.guild.roleAssignmentActive) message.guild.roleAssignmentActive = false;
                                    message.guild.roleToAssign = null;
                                }
                            } catch (error) {
                                return;
                            }
                        } else if (interaction.customId === 'no_button') {
                            interactionMessage.edit({
                                embeds: [
                                    embed.setDescription(
                                        `Role addition process canceled.`
                                    ),
                                ],
                                components: [],
                            });

                            collector.stop();
                        }
                    }
                });
        collector.on('end', collected => {
            if (collected.size === 0) {
                interactionMessage.edit({
                    embeds: [
                        client.util.embed()
                          .setColor(client.color)
                          .setTitle('Role Assignment Timed Out')
                          .setDescription('The operation of role assignment has been cancelled due to inactivity.')
                          .addFields({ name : 'Reason for Timeout', value : 'Your response took longer than expected, exceeding the 10-second time limit.'})
                          .setTimestamp()
                      ],
                    components: [],
                });
            }
        });
            } else {
                return message.channel.send({
                    embeds: [
                        embed.setDescription(
                            `${client.emoji.cross} | There is already a role addition process going on in the server.`)
                            .setColor(client.color),
                    ],
                });
            }

} else if (args[0] === 'cancel') {
            if (message.guild.roleAssignmentActive && message.guild.roleToAssign) {
                if (message.guild.roleAssignmentActive) message.guild.roleAssignmentActive = false; // Set roleAssignmentActive to false
                message.guild.roleToAssign = null;
                return message.channel.send({
                    embeds: [
                        embed.setDescription(
                            `${client.emoji.tick} | Successfully Stopped Ongoing Role Addition Process`
                        ).setColor(client.color),
                    ],
                });
            } else {
                return message.channel.send({
                    embeds: [
                        embed.setDescription(
                            `${client.emoji.cross} | There is no Ongoing Role Addition Process`
                        ).setColor(client.color),
                    ],
                });
            }
        } else if (args[0].toLowerCase() === 'status') {

            if (message.guild.roleAssignmentActive && message.guild.roleToAssign) {
                const totalMembers = message.guild.memberCount;
                const role = message.guild.roles.cache.get(message.guild.roleToAssign.id);
                
                if (!role) return
                
                const roleMembers = message.guild.members.cache.filter(member => member.roles.cache.has(role.id)).size;
                const percentage = totalMembers > 0 ? (roleMembers / totalMembers) * 100 : 0;
                
                // Calculate ETA
                const remainingMembers = totalMembers - roleMembers;
                const etaMilliseconds = remainingMembers * 1400;
                const etaTimeWilltake = Math.round((Date.now() + etaMilliseconds) / 1000);
                
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setTitle('Role Assignment Report')
                    .setDescription('Here\'s the role assignment report:')
                    .addFields(
                        { name: 'Role:', value: role.name || 'Deleted Role' },
                        { name: 'Percentage of Members:', value: `${percentage.toFixed(2)}%` },
                        { name: 'Estimated Time:', value: `<t:${etaTimeWilltake}:R>` },
                    )
                    .setTimestamp();
                    await message.channel.send({ embeds: [embed] });
            } else {
                await message.channel.send({ embeds: [client.util.embed().setColor(client.color).setDescription(`There is no ongoing role process available`)] });
            }
        } else {
            let member = message.guild.members.cache.get(args[0]) || message.mentions.members.first();

            if (!member) {
                return message.channel.send({
                    embeds: [
                        embed.setColor(client.color).setDescription(
                            `${client.emoji.cross} | You didn't use the command correctly.\n\`${message.guild.prefix}role <user> <role>\``
                        )
                    ]
                });
            }

            let role = findMatchingRoles(message.guild, args.slice(1).join(' '));
            role = role[0];

            if (!role) {
                return message.channel.send({
                    embeds: [
                        embed.setColor(client.color).setDescription(
                            `${client.emoji.cross} | You didn't provide a valid role.\n\`${message.guild.prefix}role <user> <role>\``
                        )
                    ]
                });
            }

            if (role.managed) {
                return message.channel.send({
                    embeds: [
                        embed.setColor(client.color).setDescription(
                            `${client.emoji.cross} | This Role Is Managed By Integration`
                        )
                    ]
                });
            }
            if (role.position >= message.guild.members.me.roles.highest.position) {
                return message.channel.send({
                    embeds: [
                        embed
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | I can't provide this role as my highest role is either below or equal to the provided role.`
                            )
                    ]
                })
            }
            if (!own && message.member.roles.highest.position <= role.position) {
                return message.channel.send({
                    embeds: [
                        embed
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | I can't provide this role as your highest role is either below or equal to the provided role.`
                            )
                    ]
                })
            }
            let hasRole = member.roles.cache.has(role.id)
            if (hasRole) {
                member.roles.remove(
                    role.id,
                    `${message.author.tag}(${message.author.id})`
                )
                return message.channel.send({
                    embeds: [
                        embed
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | Successfully removed <@&${role.id}> from <@${member.id}>.`
                            )
                    ]
                })
            } else {
                member.roles.add(
                    role.id,
                    `${message.author.tag}(${message.author.id})`
                )
                return message.channel.send({
                    embeds: [
                        embed
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | Successfully added <@&${role.id}> to <@${member.id}>.`
                            )
                    ]
                })
            }
        }

    }
}
async function findMatchingRoles(guild, query) {
    const ROLE_MENTION = /<?@?&?(\d{17,20})>?/
   
    if (!guild || !query || typeof query !== 'string') return []

    const patternMatch = query.match(ROLE_MENTION)
    if (patternMatch) {
        const id = patternMatch[1]
        const role = guild.roles.cache.find((r) => r.id === id)
        if (role) return [role]
    }

    const exact = []
    const startsWith = []
    const includes = []
    guild.roles.cache.forEach((role) => {
        const lowerName = role.name.toLowerCase()
        if (role.name === query) exact.push(role)
        if (lowerName.startsWith(query.toLowerCase())) startsWith.push(role)
        if (lowerName.includes(query.toLowerCase())) includes.push(role)
    })
    if (exact.length > 0) return exact
    if (startsWith.length > 0) return startsWith
    if (includes.length > 0) return includes
    return []
}











  
      
      
  




