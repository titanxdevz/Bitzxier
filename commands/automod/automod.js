const { StringSelectMenuBuilder, ComponentType, ActionRowBuilder,ButtonBuilder,ButtonStyle } = require('discord.js');

module.exports = {
    name: 'automod',
    aliases: [],
    cooldown: 5,
    category: 'automod',
    subcommand: ['whitelist user', 'whitelist role', 'whitelist channel'],
    premium: false,
    run: async (client, message, args) => {
try {
                const embed = client.util.embed().setColor(client.color)

        let own = message.author.id == message.guild.ownerId
        if (!message.member.permissions.has('Administrator')) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have \`Administrator\` permissions to use this command.`
                        )
                ]
            })
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
        if (
            !own &&
            message.member.roles.highest.position <=
                message.guild.members.me.roles.highest.position
        ) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have a higher role than me to use this command.`
                        )
                ]
            })
        }
        const subcommand = args[0]?.toLowerCase()
        const type = args[1]?.toLowerCase() // 'user', 'role', or 'channel'
        const action = args[2]?.toLowerCase() // 'add', 'remove', 'reset', 'list'
        const whitelistKey = `automodbypass_${message.guild.id}`;
        const whitelist = await client.db.get(whitelistKey) || { user: [], role: [], channel: [] };
        
        if(!args[0]) {
            const saixd = client.util.embed()
            .setColor(client.color)
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .addFields([
                {
                    name: `\`Automod\``,
                    value: `**Shows the current page.**`
                },
                {
                    name: `\`Automod whitelist role add <role>\``,
                    value: `**Adds the provided role to Automod Whitelist Configuration.**`
                },
                {
                    name: `\`Automod whitelist role remove <role>\``,
                    value: `**Remove the provided role to Automod Whitelist Configuration.**`
                },
                {
                    name: `\`Automod whitelist role list\``,
                    value: `**Shows the Automod role Whitelist list.**`
                },
                {
                    name: `\`Automod whitelist role reset\``,
                    value: `**Reset the Automod Whitelist role Configuration**‎ `
                },
                {
                    name: `\`Automod whitelist user add <user>\``,
                    value: `**Adds the provided user to Automod Whitelist user Configuration.**`
                },
                {
                    name: `\`Automod whitelist user remove <user>\``,
                    value: `**Remove the provided user to Automod Whitelist user Configuration.**`
                },
                {
                    name: `\`Automod whitelist user list\``,
                    value: `**Shows the Automod Whitelist user list.**`
                },
                {
                    name: `\`Automod whitelist user reset\``,
                    value: `**Reset the Automod whitelist user Configuration**`
                },
                {
                    name: `\`Automod whitelist channel add <channel>\``,
                    value: `**Adds the provided channel to Automod Whitelist channel Configuration.**`
                },
                {
                    name: `\`Automod whitelist channel remove <channel>\``,
                    value: `**Remove the provided channel to Automod Whitelist channel Configuration.**`
                },
                {
                    name: `\`Automod whitelist channel list\``,
                    value: `**Shows the Automod Whitelist channel list.**`
                },
                {
                    name: `\`Automod whitelist channel reset\``,
                    value: `**Reset the Automod whitelist channel Configuration**\n‎ `
                }
            ])
        return message.channel.send({ embeds : [saixd]})
        } else if (subcommand === 'whitelist') {
             if (action === 'add') {
                let id;
                let itemName; 
                if (type === 'user') {
                    const userMention = getUserFromMention(message, args[3]) ||
                        message.guild.members.cache.get(args[3])
                    if (!userMention) {
                        return await message.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setAuthor({
                                        name: message.author.tag,
                                        iconURL:
                                            message.author.displayAvatarURL({
                                                dynamic: true
                                            })
                                    })
                                    .setTitle('AUTOMOD WHITELIST USER OPTIONS')
                                    .addFields([
                                        {
                                            name: `\`Whitelist User\``,
                                            value: `**Shows the current page.**`
                                        },
                                        {
                                            name: `\`Automod whitelist user add <user>\``,
                                            value: `**Adds the provided user to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist user remove <user>\``,
                                            value: `**Remove the provided user to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist user list\``,
                                            value: `**Shows the Automod user Whitelist list.**`
                                        },
                                        {
                                            name: `\`Automod whitelist user reset\``,
                                            value: `**Reset the Automod Whitelist user Configuration**\n‎ `
                                        }
                                    ])
                            ]
                        })
                   }
                    id = userMention.id;
                    itemName = userMention.username; // Store username for feedback
                } else if (type === 'role') {
                    const roleMention = getRoleFromMention(message, args[3]) ||
                    message.guild.roles.cache.get(args[3])
                    if (!roleMention) {
                        return await message.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setAuthor({
                                        name: message.author.tag,
                                        iconURL:
                                            message.author.displayAvatarURL(
                                                { dynamic: true }
                                            )
                                    })
                                    .setTitle(
                                        'AUTOMOD WHITELIST ROLE OPTIONS'
                                    )
                                    .addFields([
                                        {
                                            name: `\`Whitelist Role\``,
                                            value: `**Shows the current page.**`
                                        },
                                        {
                                            name: `\`Automod whitelist role add <role>\``,
                                            value: `**Adds the provided role to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist role remove <role>\``,
                                            value: `**Remove the provided role to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist role list\``,
                                            value: `**Shows the Automod role Whitelist list.**`
                                        },
                                        {
                                            name: `\`Automod whitelist role reset\``,
                                            value: `**Reset the Automod Whitelist role Configuration**\n‎ `
                                        }
                                    ])
                            ]
                        })
                     }
                    id = roleMention.id;
                    itemName = roleMention.name; // Store role name for feedback
                } else if (type === 'channel') {
                    const channelMention = getChannelFromMention(message, args[3]) || message.guild.channels.cache.get(args[3])
                    if (!channelMention) {
                      return await message.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setAuthor({
                                        name: message.author.tag,
                                        iconURL:
                                            message.author.displayAvatarURL(
                                                { dynamic: true }
                                            )
                                    })
                                    .setTitle(
                                        'AUTOMOD WHITELIST ROLE OPTIONS'
                                    )
                                    .addFields([
                                        {
                                            name: `\`Whitelist channel\``,
                                            value: `**Shows the current page.**`
                                        },
                                        {
                                            name: `\`Automod whitelist channel add <channel>\``,
                                            value: `**Adds the provided channel to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist channel remove <channel>\``,
                                            value: `**Remove the provided channel to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist channel list\``,
                                            value: `**Shows the Automod channel Whitelist list.**`
                                        },
                                        {
                                            name: `\`Automod whitelist channel reset\``,
                                            value: `**Reset the Automod Whitelist channel Configuration**\n‎ `
                                        }
                                    ])
                            ]
                        })
                    }
                    id = channelMention.id;
                    itemName = channelMention.name; // Store channel name for feedback
                 } if(!['user', 'role', 'channel'].includes(type) || !type) {
                        const saixxxd = client.util.embed()
            .setColor(client.color)
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .addFields([
                {
                    name: `\`Automod\``,
                    value: `**Shows the current page.**`
                },
                {
                    name: `\`Automod whitelist role add <role>\``,
                    value: `**Adds the provided role to Automod Whitelist Configuration.**`
                },
                {
                    name: `\`Automod whitelist role remove <role>\``,
                    value: `**Remove the provided role to Automod Whitelist Configuration.**`
                },
                {
                    name: `\`Automod whitelist role list\``,
                    value: `**Shows the Automod role Whitelist list.**`
                },
                {
                    name: `\`Automod whitelist role reset\``,
                    value: `**Reset the Automod Whitelist role Configuration**‎ `
                },
                {
                    name: `\`Automod whitelist user add <user>\``,
                    value: `**Adds the provided user to Automod Whitelist user Configuration.**`
                },
                {
                    name: `\`Automod whitelist user remove <user>\``,
                    value: `**Remove the provided user to Automod Whitelist user Configuration.**`
                },
                {
                    name: `\`Automod whitelist user list\``,
                    value: `**Shows the Automod Whitelist user list.**`
                },
                {
                    name: `\`Automod whitelist user reset\``,
                    value: `**Reset the Automod whitelist user Configuration**`
                },
                {
                    name: `\`Automod whitelist channel add <channel>\``,
                    value: `**Adds the provided channel to Automod Whitelist channel Configuration.**`
                },
                {
                    name: `\`Automod whitelist channel remove <channel>\``,
                    value: `**Remove the provided channel to Automod Whitelist channel Configuration.**`
                },
                {
                    name: `\`Automod whitelist channel list\``,
                    value: `**Shows the Automod Whitelist channel list.**`
                },
                {
                    name: `\`Automod whitelist channel reset\``,
                    value: `**Reset the Automod whitelist channel Configuration**\n‎ `
                }
            ])
                return message.channel.send({ embeds : [saixxxd]})
            }
                  const alreadyWhitelisted = whitelist[type].some(entry => entry.id === id);
                if (alreadyWhitelisted) {
                    return message.reply({ content: `${type.charAt(0).toUpperCase() + type.slice(1)} is already whitelisted.` });
                }

                const row = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('whitelist_options')
                            .setPlaceholder('Select automod whitelist settings')
                            .setMinValues(0)
                            .setMaxValues(4)
                            .addOptions([
                                {
                                    label: 'Antilink',
                                    description: `automod whitelist ${type} with Antilink permissions`,
                                    value: 'antilink'
                                },
                                {
                                    label: 'Antispam',
                                    description: `automod whitelist ${type} with Antispam permissions`,
                                    value: 'antispam'
                                },
                                {
                                    label: 'Antiswear',
                                    description: `automod whitelist ${type} with Antiswear permissions`,
                                    value: 'antiswear'
                                },
                                {
                                    label: 'Antiinvite',
                                    description: `automod whitelist ${type} with Antiinvite permissions`,
                                    value: 'antiinvite'
                                }
                            ])
                    );


                const initialMessage = await message.reply({
                    content: `Please select which settings you want to whitelist for the ${type} with ID ${id} (${itemName}).`,
                    components: [row]
                });

                const filter = interaction => interaction.user.id === message.author.id && interaction.customId === 'whitelist_options';
                const collector = initialMessage.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 15000 });

                collector.on('collect', async interaction => {
                    if (interaction.user.id !== message.author.id) return interaction.reply({ content: `You are not allowed to interact with these buttons.`, ephemeral: true });
                    const selectedValues = interaction.values; 
                    const newEntry = {
                        id: id,
                        settings: {
                            antilink: selectedValues.includes('antilink'),
                            antispam: selectedValues.includes('antispam'),
                            antiswear: selectedValues.includes('antiswear'),
                            antiinvite: selectedValues.includes('antiinvite')
                        }
                    };
                    whitelist[type].push(newEntry);
                    await client.db.set(whitelistKey, whitelist);
                    await interaction.update({ content: `Successfully added ${type} with ID ${id} (${itemName}) with the selected settings: ${selectedValues.join(', ')}`, components: [] });
                });
                collector.on('end', collected => {
                    if (collected.size === 0) {
                        initialMessage.edit({ content: 'No options selected. The whitelist addition was canceled.', components: [] });
                    }
                });
            } else if (action === 'remove') {
                let idToRemove;
                let itemName;
                if (type === 'user') {
                    const userMention = getUserFromMention(message, args[3]) ||
                    message.guild.members.cache.get(args[3])
                if (!userMention) {
                    return await message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setAuthor({
                                    name: message.author.tag,
                                    iconURL:
                                        message.author.displayAvatarURL({
                                            dynamic: true
                                        })
                                })
                                .setTitle('AUTOMOD WHITELIST USER OPTIONS')
                                .addFields([
                                    {
                                        name: `\`Whitelist User\``,
                                        value: `**Shows the current page.**`
                                    },
                                    {
                                        name: `\`Automod whitelist user add <user>\``,
                                        value: `**Adds the provided user to Automod Whitelist Configuration.**`
                                    },
                                    {
                                        name: `\`Automod whitelist user remove <user>\``,
                                        value: `**Remove the provided user to Automod Whitelist Configuration.**`
                                    },
                                    {
                                        name: `\`Automod whitelist user list\``,
                                        value: `**Shows the Automod user Whitelist list.**`
                                    },
                                    {
                                        name: `\`Automod whitelist user reset\``,
                                        value: `**Reset the Automod Whitelist user Configuration**\n‎ `
                                    }
                                ])
                        ]
                    })
               }
                   idToRemove = userMention.id;
                   itemName = `<@${userMention.id}>`
                } else if (type === 'role') {
                    const roleMention = getRoleFromMention(message, args[3]) ||
                    message.guild.roles.cache.get(args[3])
                    if (!roleMention) {
                        return await message.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setAuthor({
                                        name: message.author.tag,
                                        iconURL:
                                            message.author.displayAvatarURL(
                                                { dynamic: true }
                                            )
                                    })
                                    .setTitle(
                                        'AUTOMOD WHITELIST ROLE OPTIONS'
                                    )
                                    .addFields([
                                        {
                                            name: `\`Whitelist Role\``,
                                            value: `**Shows the current page.**`
                                        },
                                        {
                                            name: `\`Automod whitelist role add <role>\``,
                                            value: `**Adds the provided role to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist role remove <role>\``,
                                            value: `**Remove the provided role to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist role list\``,
                                            value: `**Shows the Automod role Whitelist list.**`
                                        },
                                        {
                                            name: `\`Automod whitelist role reset\``,
                                            value: `**Reset the Automod Whitelist role Configuration**\n‎ `
                                        }
                                    ])
                            ]
                        })
                     }
                    idToRemove = roleMention.id;
                    itemName = `<@&${roleMention.id}>`
                } else if (type === 'channel') {
                    const channelMention = getChannelFromMention(message, args[3]) || message.guild.channels.cache.get(args[3])
                    if (!channelMention) {
                      return await message.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setAuthor({
                                        name: message.author.tag,
                                        iconURL:
                                            message.author.displayAvatarURL(
                                                { dynamic: true }
                                            )
                                    })
                                    .setTitle(
                                        'AUTOMOD WHITELIST ROLE OPTIONS'
                                    )
                                    .addFields([
                                        {
                                            name: `\`Whitelist channel\``,
                                            value: `**Shows the current page.**`
                                        },
                                        {
                                            name: `\`Automod whitelist channel add <channel>\``,
                                            value: `**Adds the provided channel to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist channel remove <channel>\``,
                                            value: `**Remove the provided channel to Automod Whitelist Configuration.**`
                                        },
                                        {
                                            name: `\`Automod whitelist channel list\``,
                                            value: `**Shows the Automod channel Whitelist list.**`
                                        },
                                        {
                                            name: `\`Automod whitelist channel reset\``,
                                            value: `**Reset the Automod Whitelist channel Configuration**\n‎ `
                                        }
                                    ])
                            ]
                        })
                    }
                    idToRemove = channelMention.id;
                    itemName = `<@#${channelMention.id}>`
                } else {
                    const saixd = client.util.embed()
                    .setColor(client.color)
                    .setAuthor({
                        name: message.author.tag,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields([
                        {
                            name: `\`Automod\``,
                            value: `**Shows the current page.**`
                        },
                        {
                            name: `\`Automod whitelist role add <role>\``,
                            value: `**Adds the provided role to Automod Whitelist Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist role remove <role>\``,
                            value: `**Remove the provided role to Automod Whitelist Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist role list\``,
                            value: `**Shows the Automod role Whitelist list.**`
                        },
                        {
                            name: `\`Automod whitelist role reset\``,
                            value: `**Reset the Automod Whitelist role Configuration**‎ `
                        },
                        {
                            name: `\`Automod whitelist user add <user>\``,
                            value: `**Adds the provided user to Automod Whitelist user Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist user remove <user>\``,
                            value: `**Remove the provided user to Automod Whitelist user Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist user list\``,
                            value: `**Shows the Automod Whitelist user list.**`
                        },
                        {
                            name: `\`Automod whitelist user reset\``,
                            value: `**Reset the Automod whitelist user Configuration**`
                        },
                        {
                            name: `\`Automod whitelist channel add <channel>\``,
                            value: `**Adds the provided channel to Automod Whitelist channel Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist channel remove <channel>\``,
                            value: `**Remove the provided channel to Automod Whitelist channel Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist channel list\``,
                            value: `**Shows the Automod Whitelist channel list.**`
                        },
                        {
                            name: `\`Automod whitelist channel reset\``,
                            value: `**Reset the Automod whitelist channel Configuration**\n‎ `
                        }
                    ])
                return message.channel.send({ embeds : [saixd]})
            
            }

                // Find and remove the entry from the whitelist
                const index = whitelist[type].findIndex(entry => entry.id === idToRemove);
                if (index === -1) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | The ${itemName} is not in ${type}'s whitelist`
                                )
                        ]
                    })
                }

                whitelist[type].splice(index, 1);
                await client.db.set(whitelistKey, whitelist);
                message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | Successfully removed ${itemName} ID (${idToRemove}) from ${type}'s whitelist.`
                            )
                    ]
                })
            } else if (action === 'reset') {
                if (type === 'user') {
                    whitelist.user = [];
                } else if (type === 'role') {
                    whitelist.role = [];
                } else if (type === 'channel') {
                    whitelist.channel = [];
                } else {
                    const saixxxd = client.util.embed()
                    .setColor(client.color)
                    .setAuthor({
                        name: message.author.tag,
                        iconURL: message.author.displayAvatarURL({ dynamic: true })
                    })
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields([
                        {
                            name: `\`Automod\``,
                            value: `**Shows the current page.**`
                        },
                        {
                            name: `\`Automod whitelist role add <role>\``,
                            value: `**Adds the provided role to Automod Whitelist Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist role remove <role>\``,
                            value: `**Remove the provided role to Automod Whitelist Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist role list\``,
                            value: `**Shows the Automod role Whitelist list.**`
                        },
                        {
                            name: `\`Automod whitelist role reset\``,
                            value: `**Reset the Automod Whitelist role Configuration**‎ `
                        },
                        {
                            name: `\`Automod whitelist user add <user>\``,
                            value: `**Adds the provided user to Automod Whitelist user Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist user remove <user>\``,
                            value: `**Remove the provided user to Automod Whitelist user Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist user list\``,
                            value: `**Shows the Automod Whitelist user list.**`
                        },
                        {
                            name: `\`Automod whitelist user reset\``,
                            value: `**Reset the Automod whitelist user Configuration**`
                        },
                        {
                            name: `\`Automod whitelist channel add <channel>\``,
                            value: `**Adds the provided channel to Automod Whitelist channel Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist channel remove <channel>\``,
                            value: `**Remove the provided channel to Automod Whitelist channel Configuration.**`
                        },
                        {
                            name: `\`Automod whitelist channel list\``,
                            value: `**Shows the Automod Whitelist channel list.**`
                        },
                        {
                            name: `\`Automod whitelist channel reset\``,
                            value: `**Reset the Automod whitelist channel Configuration**\n‎ `
                        }
                    ])
                return message.channel.send({ embeds : [saixxxd]})

            }
                await client.db.set(whitelistKey, whitelist);
                message.reply({ content: `Successfully reset the ${type} whitelist.` });
            } else if (action === 'list') {
               // Step 1: Define buttons for different categories (antilink, antispam, etc.)
    const buttonsRow = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('show_antilink')
            .setLabel('Antilink')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('show_antispam')
            .setLabel('Antispam')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('show_antiswear')
            .setLabel('Antiswear')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('show_antiinvite')
            .setLabel('Antiinvite')
            .setStyle(ButtonStyle.Primary)
    );

// Step 2: Send the initial message with buttons
const sentMessage = await message.reply({
    content: 'Click a button to see whitelisted users for that category:',
    components: [buttonsRow]
});

const buttonFilter = interaction => interaction.user.id === message.author.id && interaction.customId.startsWith('show_');
const buttonCollector = sentMessage.createMessageComponentCollector({ filter: buttonFilter, time: 60000 });

buttonCollector.on('collect', async interaction => {
    if (interaction.user.id !== message.author.id) return interaction.editReply({ content: `You are not allowed to interact with these buttons.`, ephemeral: true });
    const category = interaction.customId.split('_')[1];
    const entries = whitelist[type].filter(entry => entry.settings[category]);
    if (entries.length === 0) {
        return interaction.update({ content: `There are no whitelisted ${type} entries for the ${category}.`, components: [] });
    }
    let i = 0;
    const membersList = entries.map(entry => 
        type === 'user' ? `${++i}. <@${entry.id}> | (${entry.id})` : 
        type === 'role' ? `${++i}. <@&${entry.id}> | (${entry.id})` : 
        `${++i}. <#${entry.id}> | (${entry.id})`
    );

    await client.util.BitzxierPagination(membersList, `Whitelisted ${type} for ${category}`, client, message);

    await interaction.update({ content: `Displaying whitelisted ${type} for ${category}.`, components: [] });
});

buttonCollector.on('end', collected => {
    if (collected.size === 0) {
        message.reply('No button was clicked. The category listing was canceled.');
    }
});
} else {
    const saixxxxd = client.util.embed()
    .setColor(client.color)
    .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .addFields([
        {
            name: `\`Automod\``,
            value: `**Shows the current page.**`
        },
        {
            name: `\`Automod whitelist role add <role>\``,
            value: `**Adds the provided role to Automod Whitelist Configuration.**`
        },
        {
            name: `\`Automod whitelist role remove <role>\``,
            value: `**Remove the provided role to Automod Whitelist Configuration.**`
        },
        {
            name: `\`Automod whitelist role list\``,
            value: `**Shows the Automod role Whitelist list.**`
        },
        {
            name: `\`Automod whitelist role reset\``,
            value: `**Reset the Automod Whitelist role Configuration**‎ `
        },
        {
            name: `\`Automod whitelist user add <user>\``,
            value: `**Adds the provided user to Automod Whitelist user Configuration.**`
        },
        {
            name: `\`Automod whitelist user remove <user>\``,
            value: `**Remove the provided user to Automod Whitelist user Configuration.**`
        },
        {
            name: `\`Automod whitelist user list\``,
            value: `**Shows the Automod Whitelist user list.**`
        },
        {
            name: `\`Automod whitelist user reset\``,
            value: `**Reset the Automod whitelist user Configuration**`
        },
        {
            name: `\`Automod whitelist channel add <channel>\``,
            value: `**Adds the provided channel to Automod Whitelist channel Configuration.**`
        },
        {
            name: `\`Automod whitelist channel remove <channel>\``,
            value: `**Remove the provided channel to Automod Whitelist channel Configuration.**`
        },
        {
            name: `\`Automod whitelist channel list\``,
            value: `**Shows the Automod Whitelist channel list.**`
        },
        {
            name: `\`Automod whitelist channel reset\``,
            value: `**Reset the Automod whitelist channel Configuration**\n‎ `
        }
    ])
return message.channel.send({ embeds : [saixxxxd]})

}
} else if(!subcommand || !type.includes(['user','role','channel'])){
    const saixxxxd = client.util.embed()
    .setColor(client.color)
    .setAuthor({
        name: message.author.tag,
        iconURL: message.author.displayAvatarURL({ dynamic: true })
    })
    .setThumbnail(message.guild.iconURL({ dynamic: true }))
    .addFields([
        {
            name: `\`Automod\``,
            value: `**Shows the current page.**`
        },
        {
            name: `\`Automod whitelist role add <role>\``,
            value: `**Adds the provided role to Automod Whitelist Configuration.**`
        },
        {
            name: `\`Automod whitelist role remove <role>\``,
            value: `**Remove the provided role to Automod Whitelist Configuration.**`
        },
        {
            name: `\`Automod whitelist role list\``,
            value: `**Shows the Automod role Whitelist list.**`
        },
        {
            name: `\`Automod whitelist role reset\``,
            value: `**Reset the Automod Whitelist role Configuration**‎ `
        },
        {
            name: `\`Automod whitelist user add <user>\``,
            value: `**Adds the provided user to Automod Whitelist user Configuration.**`
        },
        {
            name: `\`Automod whitelist user remove <user>\``,
            value: `**Remove the provided user to Automod Whitelist user Configuration.**`
        },
        {
            name: `\`Automod whitelist user list\``,
            value: `**Shows the Automod Whitelist user list.**`
        },
        {
            name: `\`Automod whitelist user reset\``,
            value: `**Reset the Automod whitelist user Configuration**`
        },
        {
            name: `\`Automod whitelist channel add <channel>\``,
            value: `**Adds the provided channel to Automod Whitelist channel Configuration.**`
        },
        {
            name: `\`Automod whitelist channel remove <channel>\``,
            value: `**Remove the provided channel to Automod Whitelist channel Configuration.**`
        },
        {
            name: `\`Automod whitelist channel list\``,
            value: `**Shows the Automod Whitelist channel list.**`
        },
        {
            name: `\`Automod whitelist channel reset\``,
            value: `**Reset the Automod whitelist channel Configuration**\n‎ `
        }
    ])
return message.channel.send({ embeds : [saixxxxd]})
}
}catch(err) {
    console.error(err)
}
}
};
function getRoleFromMention(message, mention) {
    if (!mention) return null

    const matches = mention.match(/^<@&(\d+)>$/)
    if (!matches) return null

    const roleId = matches[1]
    return message.guild.roles.cache.get(roleId)
}
function getUserFromMention(message, mention) {
    if (!mention) return null

    const matches = mention.match(/^<@!?(\d+)>$/)
    if (!matches) return null

    const id = matches[1]
    return message.client.users.cache.get(id)
}
function getChannelFromMention(message, mention) {
    if (!mention) return null;

    const matches = mention.match(/^<#(\d+)>$/);
    if (!matches) return null;

    const channelId = matches[1];
    return message.guild.channels.cache.get(channelId);
}
