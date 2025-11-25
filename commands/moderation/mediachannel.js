const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'media',
    aliases: ['mediachannel'],
    category: 'mod',
    premium: false,
    cooldown: 6,
    subcommands: ['channel', 'whitelist', 'channel add', 'channel remove','channel list','channel reset','whitelist role add', 'whitelist role remove', 'whitelist role reset', 'whitelist role list', 'whitelist user add', 'whitelist user remove', 'whitelist user reset', 'whitelist user list'],
    run: async (client, message, args) => {
        try {
            // Check permissions
            if (!message.member.permissions.has('ManageGuild')) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | You need \`MANAGE SERVER\` permissions to use this command.`
                            )
                    ]
                });
            }

            if (!message.guild.members.me.permissions.has('Administrator')) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | I require \`ADMINISTRATOR\` permissions to execute this command.`
                            )
                    ]
                });
            }

            const category = args[0]?.toLowerCase();
            const subCategory = args[1]?.toLowerCase();
            const action = category === 'whitelist' ? args[2]?.toLowerCase() : subCategory;
            const target = args.slice(category === 'whitelist' ? 3 : 2).join(' ');

            const data = await client.db.get(`mediachannel_${message.guild.id}`) || { channel: [], role: [], user: [] };

            if (!category || !['channel', 'whitelist'].includes(category)) {
                const infoEmbed = new EmbedBuilder()
                    .setTitle('Media Command Overview')
                    .setColor(client.color)
                    .setThumbnail(client.user.displayAvatarURL({ dynamic: true }) || message.guild.iconURL({ dynamic: true }))
                    .setDescription(
                        `The \`media\` command allows you to configure media-only channels and manage whitelisted roles or users.\n\nUse the following subcommands to set up and manage media configurations.`
                    )
                    .addFields([
                        { name: `**Media Channel Commands**`, value: `Commands for managing media-only channels.`, inline: false },
                        { name: `\`media channel add\``, value: `Adds a media-only channel to the server.\n**Example:** \`media channel add #channel-name\``, inline: true },
                        { name: `\`media channel remove\``, value: `Removes a media-only channel from the server.\n**Example:** \`media channel remove #channel-name\``, inline: true },
                        { name: `\`media channel list\``, value: `Lists all configured media-only channels.\n**Example:** \`media channel list\``, inline: true },
                        { name: `\`media channel reset\``, value: `Resets all media-only channels in the server.\n**Example:** \`media channel reset\``, inline: true },

                        { name: `**Whitelist User Commands**`, value: `Commands for managing whitelisted users.`, inline: false },
                        { name: `\`media whitelist user add\``, value: `Adds a user to the media whitelist.\n**Example:** \`media whitelist user add @User\``, inline: true },
                        { name: `\`media whitelist user remove\``, value: `Removes a user from the media whitelist.\n**Example:** \`media whitelist user remove @User\``, inline: true },
                        { name: `\`media whitelist user list\``, value: `Lists all whitelisted users.\n**Example:** \`media whitelist user list\``, inline: true },
                        { name: `\`media whitelist user reset\``, value: `Resets all whitelisted users.\n**Example:** \`media whitelist user reset\``, inline: true },

                        { name: `**Whitelist Role Commands**`, value: `Commands for managing whitelisted roles.`, inline: false },
                        { name: `\`media whitelist role add\``, value: `Adds a role to the media whitelist.\n**Example:** \`media whitelist role add @Role\``, inline: true },
                        { name: `\`media whitelist role remove\``, value: `Removes a role from the media whitelist.\n**Example:** \`media whitelist role remove @Role\``, inline: true },
                        { name: `\`media whitelist role list\``, value: `Lists all whitelisted roles.\n**Example:** \`media whitelist role list\``, inline: true },
                        { name: `\`media whitelist role reset\``, value: `Resets all whitelisted roles.\n**Example:** \`media whitelist role reset\``, inline: true },
                    ])
                    .setFooter({ text: `Use 'channel' or 'whitelist' as the first argument.`, iconURL: message.guild.iconURL({ dynamic: true }) });
                return message.channel.send({ embeds: [infoEmbed] });
            }

            if (category === 'channel') {
                if (!action || !['add', 'remove', 'reset', 'list'].includes(action)) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | Invalid action! Use \`add\`, \`remove\`, \`reset\`, or \`list\`.`
                                )
                        ]
                    });
                }
                if (action === 'add') return handleAdd('channel');
                if (action === 'remove') return handleRemove('channel');
                if (action === 'reset') return handleReset('channel');
                if (action === 'list') return handleList('channel');
            }

            if (category === 'whitelist') {
                if (!subCategory || !['user', 'role'].includes(subCategory)) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Specify \`role\` or \`user\` for the whitelist command.`)
                        ]
                    });
                }
                
                if (subCategory === 'user') {
                    if (!action || !['add', 'remove', 'reset', 'list'].includes(action)) {
                        return message.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(
                                        `${client.emoji.cross} | Invalid action! Use \`add\`, \`remove\`, \`reset\`, or \`list\`.`
                                    )
                            ]
                        });
                    }
                    if (action === 'add') return handleAdd('user');
                    if (action === 'remove') return handleRemove('user');
                    if (action === 'reset') return handleReset('user');
                    if (action === 'list') return handleList('user');
                }
                if (subCategory === 'role') {
                    if (!action || !['add', 'remove', 'reset', 'list'].includes(action)) {
                        return message.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(
                                        `${client.emoji.cross} | Invalid action! Use \`add\`, \`remove\`, \`reset\`, or \`list\`.`
                                    )
                            ]
                        });
                    }
                    if (action === 'add') return handleAdd('role');
                    if (action === 'remove') return handleRemove('role');
                    if (action === 'reset') return handleReset('role');
                    if (action === 'list') return handleList('role');
                }
            }
                        

            async function handleAdd(type) {
                if (!target) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | Please specify a valid ${type === 'role' ? 'role' : type === 'user' ? 'user' : 'channel'} to add.`
                                )
                        ]
                    });
                }
            
                let targetObj;
                if (type === 'role') {
                    targetObj = getRoleFromMention(message, target) || message.guild.roles.cache.get(target);
                } else if (type === 'user') {
                    targetObj = getUserFromMention(message, target) || message.guild.members.cache.get(target);
                } else if (type === 'channel') {
                    targetObj = getChannelFromMention(message, target) || message.guild.channels.cache.get(target);
                }
            
                if (!targetObj) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | Please provide a valid ${type === 'role' ? 'role' : type === 'user' ? 'user' : 'channel'}.`
                                )
                        ]
                    });
                }
            
                const id = targetObj.id;
                if (data[type].includes(id)) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | This ${type === 'role' ? 'role' : type === 'user' ? 'user' : 'channel'} is already added.`
                                )
                        ]
                    });
                }
            
                if (type === 'channel' && data['channel'].length >= 1) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | You can only add 1 channel.`)
                                .setFooter({ text : `Buy premium so you can add more channels`})
                            ]
                    });
                }
            
                if (type !== 'channel' && data[type].length >= 10) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | You can only add up to 10 ${type === 'role' ? 'roles' : type === 'user' ? 'users' : 'channels'}.`
                                )
                        ]
                    });
                }
            
                // Add the ID to the appropriate array
                data[type].push(id);
            
                // Update the entire object in the database
                await client.db.set(`mediachannel_${message.guild.id}`, data);
            
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | Successfully added the ${type === 'role' ? `role: ${targetObj.name}` : type === 'user' ? `user: ${targetObj.tag || targetObj.user.tag}` : `channel: ${targetObj.name}`}.`
                            )
                    ]
                });
            }
            
            async function handleRemove(type) {
                if (!target) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | Please specify a valid ${type === 'role' ? 'role' : type === 'user' ? 'user' : 'channel'} to remove.`
                                )
                        ]
                    });
                }

                let targetObj;
                if (type === 'role') {
                    targetObj = getRoleFromMention(message, target) || message.guild.roles.cache.get(target);
                } else if (type === 'user') {
                    targetObj = getUserFromMention(message, target) || message.guild.members.cache.get(target);
                } else if (type === 'channel') {
                    targetObj = getChannelFromMention(message, target) || message.guild.channels.cache.get(target);
                }

                if (!targetObj) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | Please provide a valid ${type === 'role' ? 'role' : type === 'user' ? 'user' : 'channel'}.`
                                )
                        ]
                    });
                }

                const id = targetObj.id;
                if (!data[type].includes(id)) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | This ${type === 'role' ? 'role' : type === 'user' ? 'user' : 'channel'} is not in the list.`
                                )
                        ]
                    });
                }

                data[type] = data[type].filter(item => item !== id);
                await client.db.set(`mediachannel_${message.guild.id}.${type}`, data[type]);

                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | Successfully removed the ${type === 'role' ? `role: ${targetObj.name}` : type === 'user' ? `user: ${targetObj.tag || targetObj.user.tag}` : `channel: ${targetObj.name}`}.`
                            )
                    ]
                });
            }

            async function handleReset(type) {
                if (!data[type].length) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | The ${type} list is empty.`)
                        ]
                    });
                }
                data[type] = [];
                await client.db.set(`mediachannel_${message.guild.id}.${type}`, []);
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.tick} | Successfully reset the ${type} list.`)
                    ]
                });
            }

            async function handleList(type) {
                if (!data[type].length) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | The ${type} list is empty.`)
                        ]
                    });
                }
            
                const list = data[type]
                    .map((id, index) => {
                        let mention;
                        if (type === 'user') {
                            mention = `<@${id}>`; // Mention user
                        } else if (type === 'role') {
                            mention = `<@&${id}>`; // Mention role
                        } else if (type === 'channel') {
                            mention = `<#${id}>`; // Mention channel
                        }
                        return `${index + 1}. ${mention} (${id})`;
                    })
                    .join('\n');
            
            
                // Dynamic title customization
                let customTitle;
                if (category === 'channel') {
                    customTitle = 'Media Channel List';
                } else if (category === 'whitelist') {
                    customTitle = `Media Whitelist ${type.charAt(0).toUpperCase() + type.slice(1)} List`;
                } else {
                    customTitle = `List of ${type.charAt(0).toUpperCase() + type.slice(1)}s`;
                }
            
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setTitle(customTitle) // Set dynamic title here
                            .setDescription(list)
                    ]
                });
            }
            
        }catch(err) {

        }
    }
}
function getRoleFromMention(message, mention) {
    if (!mention) return null;
    const matches = mention.match(/^<@&(\d+)>$/); // Match role mention format
    return matches ? message.guild.roles.cache.get(matches[1]) : message.guild.roles.cache.get(mention); // Also handle plain IDs
}

function getUserFromMention(message, mention) {
    if (!mention) return null;
    const matches = mention.match(/^<@!?(\d+)>$/); // Match user mention format
    return matches ? message.guild.members.cache.get(matches[1]) : message.guild.members.cache.get(mention); // Also handle plain IDs
}

function getChannelFromMention(message, mention) {
    if (!mention) return null;
    const matches = mention.match(/^<#(\d+)>$/); // Match channel mention format
    return matches ? message.guild.channels.cache.get(matches[1]) : message.guild.channels.cache.get(mention); // Also handle plain IDs
}

