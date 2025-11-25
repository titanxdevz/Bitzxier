const { MessageEmbed } = require('discord.js')
let enable = `<:cross:1436754701369737237><:tick:1436755134561521766>`
let disable = `<:cross:1436754701369737237><:tick:1436755134561521766>`
let protect = `<a:bitzxier_antinuke:1180431827438153821>`
let hii = `<:bitzxier:1438835471861026961>`
const wait = require('wait')

module.exports = {
    name: 'antiswear',
    aliases: [],
    cooldown: 5,
    category: 'automod',
    subcommand: ['enable', 'disable', 'punishment','word add','word remove','word reset','word list'],
    premium: false,
    run: async (client, message, args) => {
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
        let prefix = message.guild.prefix || '&' // Correct way to define default prefix

        const option = args[0]
        const isActivatedAlready =
            (await client.db.get(`antiswear_${message.guild.id}`)) ?? null

        const antiswear = client.util.embed()
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setColor(client.color)
            .setTitle('__**AntiSwear**__')
            .setDescription(
                "Fortify your server's security with Antiswear! Our cutting-edge algorithms swiftly detect and neutralize profanity, ensuring a safe and respectful environment for your community."            )
                .addFields(
                    {
                        name: '__**AntiSwear Enable**__',
                        value: `To Enable AntiSwear, use \`${prefix}antiswear enable\``
                    },
                    {
                        name: '__**AntiSwear Disable**__',
                        value: `To Disable AntiSwear, use \`${prefix}antiswear disable\``
                    },
                    {
                        name: '__**AntiSwear Punishment**__',
                        value: 'Configure the punishment for users posting suspicious links.'
                    },
                    {
                        name: 'Options',
                        value: '`ban` - Ban users, `kick` - Kick users, `mute` - Mute users, `none` - Delete Bad Words'
                    },
                    {
                        name: '__**AntiSwear Word Add**__',
                        value: 'Add words to the AntiSwear list'
                    },
                    {
                        name: '__**AntiSwear Word Remove**__',
                        value: 'Remove words from the AntiSwear list'
                    },
                    {
                        name: '__**AntiSwear Word Reset**__',
                        value: 'Reset the AntiSwear list'
                    },
                    {
                        name: '__**AntiSwear Word List**__',
                        value: 'Show the list of AntiSwear words'
                    }
                )
            .setTimestamp()
            .setFooter({ text :client.user.username, iconURL:    client.user.displayAvatarURL()})

        switch (option) {
            case undefined:
                message.channel.send({ embeds: [antiswear] })
                break

            case 'enable':
                if (!isActivatedAlready) {
                    await client.db.set(`antiswear_${message.guild.id}`, true)
                    await client.db.set(`antiswearp_${message.guild.id}`, {
                        data: 'mute'
                    })

                    const antilinkEnableMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('AntiSwear Enabled')
                        .setDescription(
                            '**Congratulations! AntiSwear has been successfully enabled on your server.**'
                        )
                        .addFields({
                           name : 'Enhanced Protection',
                            value : 'Enjoy enhanced protection against inappropriate words!'
                })
                        .setTimestamp()
                        .setFooter({
                          text :  client.user.username,
                           value : client.user.displayAvatarURL()
                })

                    await message.channel.send({
                        embeds: [antilinkEnableMessage]
                    })
                } else {
                    const antilinkSettingsEmbed = client.util.embed()
                        .setTitle(
                            `AntiSwear Settings for ${message.guild.name} ${protect}`
                        )
                        .setColor(client.color)
                        .setDescription(
                            '**AntiSwear is already enabled on your server.**'
                        )
                        .addFields({ name : 
                            'Current Status',
                           value : `AntiSwear is already enabled on your server.\n\nCurrent Status: ${enable}`
                })
                        .addFields({ name : 
                            'To Disable',
                           value :  `To disable AntiSwear, use \`${prefix}antiswear disable\``
                })
                        .setTimestamp()
                        .setFooter({ text : 
                            client.user.username,
                          iconURL :  client.user.displayAvatarURL()
                })
                    await message.channel.send({
                        embeds: [antilinkSettingsEmbed]
                    })
                }

                break

            case 'disable':
                if (isActivatedAlready) {
                    await client.db.set(`antiswear_${message.guild.id}`, false)
                    await client.db.set(`antiswearp_${message.guild.id}`, {
                        data: null
                    })
                    const antilinkDisableMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('AntiSwear Disabled')
                        .setDescription(
                            '**AntiSwear has been successfully disabled on your server.**'
                        )
                        .addFields({
                          name :  'Impact',
                          value  : 'Your server will no longer be protected against inappropriate words!.'
                })
                        .setTimestamp()
                        .setFooter({
                          text :  client.user.username,
                           iconURL : client.user.displayAvatarURL()
                })

                    await message.channel.send({
                        embeds: [antilinkDisableMessage]
                    })
                } else {
                    const antilinkSettingsEmbed = client.util.embed()
                        .setTitle(
                            `AntiSwear Settings for ${message.guild.name} ${protect}`
                        )
                        .setColor(client.color)
                        .setDescription(`**AntiSwear Status**`)
                        .addFields({
                           name : 'Current Status',
                            value : `AntiSwear is currently disabled on your server.\n\nCurrent Status: ${disable}`
                })
                        .addFields({
                          name :  'To Enable',
                          value :  `To enable AntiSwear, use \`${prefix}antiswear enable\``
                })
                        .setTimestamp()
                        .setFooter({
                          text :  client.user.username,
                           value : client.user.displayAvatarURL()
                })
                    await message.channel.send({
                        embeds: [antilinkSettingsEmbed]
                    })
                }
                break

                case 'word':
                    if (args[1] === 'add') {
                        if (!args[2]) {
                            return message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `${client.emoji.cross} | Oops! Please provide a valid word for my badwords list.`
                                        )
                                ]
                            });
                        }
                        await client.db
                            .get(`antiswearwords_${message.guild.id}`)
                            .then(async (data) => {
                                let word = args[2].toLowerCase();
                                if (!data) {
                                    await client.db.set(
                                        `antiswearwords_${message.guild.id}`,
                                        []
                                    );
                                    let msg = await message.channel.send({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(
                                                    `Please wait, setting up configuration for your server.`
                                                )
                                        ]
                                    });
                                    await client.util.sleep(2000);
                                    const saiop = client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `Great news! Your server is now configured perfectly. Feel free to use AntiSwear module and enjoy using your server hassle-free! 🚀`
                                        );
                                    return await msg.edit({ embeds: [saiop] });
                                }
                                if (word.length > 30) {
                                    return message.channel.send({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(
                                                    `${client.emoji.cross} | The word "${word}" has more than 15 characters and cannot be added to the bad words list.`
                                                )
                                        ]
                                    });
                                }
                                if (word) {
                                    if (!data.includes(word)) {
                                        await client.db.push(
                                            `antiswearwords_${message.guild.id}`,
                                            word
                                        );
                                        return message.channel.send({
                                            embeds: [
                                                client.util.embed()
                                                    .setColor(client.color)
                                                    .setDescription(
                                                        `${client.emoji.tick} | Success! The \`${word}\` word has been successfully added to bad words list.`
                                                    )
                                            ]
                                        });
                                    } else {
                                        return message.channel.send({
                                            embeds: [
                                                client.util.embed()
                                                    .setColor(client.color)
                                                    .setDescription(
                                                        `${client.emoji.cross} | Oops! It appears that \`${word}\` is already in my bad words list.`
                                                    )
                                            ]
                                        });
                                    }
                                } 

                            });
                    } else if (args[1] === 'remove') {
                        if (!args[2]) {
                            return message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `${client.emoji.cross} | Oops! Please provide a valid word for removing in my badwords list.`
                                        )
                                ]
                            });
                        }
                        await client.db
                            .get(`antiswearwords_${message.guild.id}`)
                            .then(async (data) => {
                                let word = args[2].toLowerCase();
                                if (!data) {
                                    await client.db.set(
                                        `antiswearwords_${message.guild.id}`,
                                        []
                                    );
                                    let msg = await message.channel.send({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(
                                                    `Please wait, setting up configuration for your server.`
                                                )
                                        ]
                                    });
                                    await client.util.sleep(2000);
                                    const saiop = client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `Great news! Your server is now configured perfectly. Feel free to use AntiSwear module and enjoy using your server hassle-free! 🚀`
                                        );
                                    return await msg.edit({ embeds: [saiop] });
                                }

                                if (word) {
                                    if (data.includes(word)) {
                                        await client.db.pull(
                                            `antiswearwords_${message.guild.id}`,
                                            word
                                        );
                                        return message.channel.send({
                                            embeds: [
                                                client.util.embed()
                                                    .setColor(client.color)
                                                    .setDescription(
                                                        `${client.emoji.tick} | Success! The \`${word}\` word has been successfully removed from bad words list.`
                                                    )
                                            ]
                                        });
                                    } else {
                                        return message.channel.send({
                                            embeds: [
                                                client.util.embed()
                                                    .setColor(client.color)
                                                    .setDescription(
                                                        `${client.emoji.cross} | Oops! It appears that \`${word}\` is not in my bad words list.`
                                                    )
                                            ]
                                        });
                                    }
                                } 

                            });

                    } else if (args[1] === 'reset') {
                        await client.db
                            .get(`antiswearwords_${message.guild.id}`)
                            .then(async (data) => {
                                if (!data) {
                                    await client.db.set(
                                        `antiswearwords_${message.guild.id}`,
                                        []
                                    );
                                    let msg = await message.channel.send({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(
                                                    `Please wait, setting up configuration for your server.`
                                                )
                                        ]
                                    });
                                    await client.util.sleep(2000);
                                    const saiop = client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `Great news! Your server is now configured perfectly. Feel free to use AntiSwear module and enjoy using your server hassle-free! 🚀`
                                        );
                                    return await msg.edit({ embeds: [saiop] });
                                }


                                if (data.length > 0) {
                                    const existingData = await client.db.get(
                                        `antiswearwords_${message.guild.id}`
                                    )
                                    if (existingData) {
                                        await client.db.set(
                                            `antiswearwords_${message.guild.id}`,[])
                                        return message.channel.send({
                                            embeds: [
                                                client.util.embed()
                                                    .setColor(client.color)
                                                    .setDescription(
                                                        `✨ Success! The server's bad word list has been cleared. You're all set to customize and optimize your experience now.`
                                                    )
                                            ]
                                        })
                                    }
                                } else {
                                    return message.channel.send({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(
                                                    `🌐 Whoops! It looks like no bad words has been set up in this server yet. No worries, though! You can easily configure one to tailor your experience and enhance server functionality.`
                                                )
                                        ]
                                    })
                                }
                            });
                    } else if(args[1] === 'list') {
                        let words = (await client.db.get(`antiswearwords_${message.guild.id}`)) || [];
                        let mentions = [];
                        let i = 1;
                        
                        if (Array.isArray(words) && words.length !== 0) {
                            words.forEach((word) =>
                                mentions.push(`\`${i++}\`   \`${word}\``)
                            );
                        
                            const wordlist = client.util.embed()
                                .setColor(client.color)
                                .setTitle(`**BAD WORDS LIST**`)
                                .setDescription(`${mentions.join('\n')}`);
                        
                            message.channel.send({ embeds: [wordlist] });
                        } else {
                            return message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `${client.emoji.cross} | Oops! It seems like there's no designated badwords set up in this server. No worries, though! You can easily configure one to enhance your experience.`
                                        )
                                ]
                            });
                        }
                        
    
                    } else if(!args[1]) {
                        const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setAuthor({
                            name: message.author.tag,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                        .addFields({
                            name : 'Error',
                            value : 'Please provide valid punishment arguments.'
                    })
                        .addFields({ name : 'Valid Options',value : '`add`, `remove`, `reset` , `list`'})
                        .setTimestamp()
                        .setFooter({
                          text :  client.user.username,
                        value :    client.user.displayAvatarURL()
                    })

                    return message.channel.send({ embeds: [embedMessage] })
                    }
                    break;
            case 'punishment':
                let punishment = args[1]
                if (!punishment) {
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setAuthor({
                            name: message.author.tag,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })
                        .setDescription('**Invalid Punishment**')
                        .addFields({
                            name : 'Error',
                            value : 'Please provide valid punishment arguments.'
                })
                        .addFields({ name : 'Valid Options', value : '`ban`, `kick`, `mute`'})
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                           value : client.user.displayAvatarURL()
                })

                    return message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'ban') {
                    await client.db.set(`antiswearp_${message.guild.id}`, {
                        data: 'ban'
                    })
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Punishment Configured')
                        .setDescription(
                            'The punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type', value : 'Ban'})
                        .addFields({
                           name : 'Action Taken',
                         value :   'Any user violating the rules will be banned from the server.'
                })
                        .setTimestamp()
                        .setFooter({
                         text :   client.user.username,
                           iconURL : client.user.displayAvatarURL()
                })
                    await message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'kick') {
                    await client.db.set(`antiswearp_${message.guild.id}`, {
                        data: 'kick'
                    })
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Punishment Configured')
                        .setDescription(
                            'The punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type', value : 'Kick'})
                        .addFields({ name : 
                            'Action Taken',
                         value :   'Any user violating the rules will be kicked from the server.'
                })
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                           value : client.user.displayAvatarURL()
                })

                    await message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'mute') {
                    await client.db.set(`antiswearp_${message.guild.id}`, {
                        data: 'mute'
                    })
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('AntiSwear Punishment Configured')
                        .setDescription(
                            'The AntiSwear punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type',value : 'Mute'})
                        .addFields({
                          name :  'Action Taken',
                           value : 'Any user caught sending inappropriate words will be muted.'
                })
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                          iconURL :  client.user.displayAvatarURL()
                })

                    await message.channel.send({ embeds: [embedMessage] })
                }
                
                if (punishment === 'none') {
                    await client.db.set(`antiswearp_${message.guild.id}`, {
                        data: 'none'
                    })
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('AntiSwear Punishment Configured')
                        .setDescription(
                            'The AntiSwear punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type', value : 'None'})
                        .addFields({
                           name : 'Action Taken',
                          value :  'Any user caught sending inappropriate words his messages will get deleted.'
                })
                        .setTimestamp()
                        .setFooter({
                          text :  client.user.username,
                           value : client.user.displayAvatarURL()
                })

                    await message.channel.send({ embeds: [embedMessage] })
                }
                break;
                case 'config':
                    const punish = await client.db.get(`antilinkp_${message.guild.id}`) || { data : null }
                    const value = await client.db.get(`antilink_${message.guild.id}`) || null
                    const embed = client.util.embed()
                    embed.setColor(client.color)
                    embed.setAuthor({ name: `Antiswear Config for ${message.guild.name}` })
                    embed.addFields({ name: `Antiswear Status`, value: `${value ? client.emoji.tick : client.emoji.cross}`, inline: true })
                    embed.addFields({ name: `Antiswear Punishment Type`, value: `${punish ? punish.data : "None"}`, inline: true })
                    await message.channel.send({ embeds: [embed] })
                
                default:
                return message.channel.send({ embeds: [antiswear] })
                }
    }
}