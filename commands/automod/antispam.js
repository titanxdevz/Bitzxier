const enable = `<:cross:1436754701369737237><:tick:1436755134561521766>`
const disable = `<:cross:1436754701369737237><:tick:1436755134561521766>`
const protect = `<a:bitzxier_antinuke:1180431827438153821>`
const hii = `<:bitzxier:1438835471861026961>`
const wait = require('wait')
module.exports = {
    name: 'antispam',
    aliases: [],
    cooldown: 5,
    category: 'automod',
    subcommand: ['enable', 'disable', 'punishment', 'limit','strikes','config'],
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

            let prefix = message.guild.prefix || '&' // Correct way to define default prefix

            const option = args[0]
            const isActivatedAlready =
                (await client.db.get(`antispam_${message.guild.id}`)) || null

            const antispam = client.util.embed()
                .setThumbnail(client.user.avatarURL({ dynamic: true }))
                .setColor(client.color)
                .setTitle('__**Antispam**__')
                .setDescription(
                    'Prevent spam and maintain the integrity of your server with Antispam! Our advanced algorithms swiftly detect and handle spam messages, ensuring a clean and enjoyable environment for your community.'
                )
                .addFields([
                    {
                        name: '__**Antispam Enable**__',
                        value: `To Enable Antispam, use \`${prefix}antispam enable\``
                    },
                    {
                        name: '__**Antispam Disable**__',
                        value: `To Disable Antispam, use \`${prefix}antispam disable\``
                    },
                    {
                        name: '__**Antispam Punishment**__',
                        value: 'Configure the punishment for spammers.'
                    },
                    {
                        name: 'Options',
                        value: '`ban` - Ban spammers, `kick` - Kick spammers, `mute` - Mute spammers'
                    },
                    {
                        name: '__**Antispam Limit**__',
                        value: 'Configure the message limit to trigger antispam.'
                    },
                    {
                        name: 'Usage',
                        value: 'Use numbers to specify the message limit, e.g., `4`, `10`'
                    },
                    {
                        name: '__**Antispam Strikes**__',
                        value: 'Configure the Strike limit to trigger antispam.'
                    },
                    {
                        name: 'Usage',
                        value: 'Use numbers to specify the strike limit, e.g., `1`, `10`\n Defaults Strikes limit is 1'
                    },
                    {
                        name: '__**Antispam Config**__',
                        value: `Use ${prefix}Antispam config\nView Current Antispam Configuration`

                    }
                ])
                .setTimestamp()
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })

            switch (option) {
                case undefined:
                    message.channel.send({ embeds: [antispam] })
                    break

                case 'enable':
                    if (!isActivatedAlready) {
                        await client.db.set(`antispam_${message.guild.id}`, true)
                        await client.db.set(`antispamlimit_${message.guild.id}`, 4)
                        await client.db.set(`antispamstrikes_${message.guild.id}`, 1)
                        await client.db.set(`antispamp_${message.guild.id}`, {
                            data: 'mute'
                        })

                        const antispamEnableMessage = client.util.embed()
                            .setColor(client.color)
                            .setTitle('Antispam Enabled')
                            .setDescription(
                                '**Congratulations! Antispam has been successfully enabled on your server.**'
                            )
                            .addFields({

                                name: 'Enhanced Protection',
                                value: 'Enjoy enhanced protection against spam messages!'
                            })
                            .setTimestamp()
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })

                        await message.channel.send({
                            embeds: [antispamEnableMessage]
                        })
                    } else {
                        const antispamSettingsEmbed = client.util.embed()
                            .setTitle(
                                `Antispam Settings for ${message.guild.name} ${protect}`
                            )
                            .setColor(client.color)
                            .setDescription(`**Antispam Status**`)
                            .addFields({
                                name: 'Current Status',
                                value: `Antispam is already enabled on your server.\n\nCurrent Status: ${enable}`
                            })
                            .addFields({
                                name: 'To Disable',
                                value: `To disable Antispam, use \`${prefix}antispam disable\``
                            })
                            .setTimestamp()
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })
                        await message.channel.send({
                            embeds: [antispamSettingsEmbed]
                        })
                    }
                    break

                case 'disable':
                    if (isActivatedAlready) {
                        await client.db.set(`antispam_${message.guild.id}`, false)
                        await client.db.set(`antispamp_${message.guild.id}`, {
                            data: null
                        })
                        const embedMessage = client.util.embed()
                            .setColor(client.color)
                            .setDescription('**Antispam Disabled**')
                            .addFields({
                                name: 'Status',
                                value: 'Antispam has been successfully disabled on your server.'
                            })
                            .addFields({
                                name: 'Impact',
                                value: 'Your server will no longer be protected against spam messages.'
                            })
                            .setTimestamp()
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })
                        return message.channel.send({ embeds: [embedMessage] })
                    } else {
                        const embedMessage = client.util.embed()
                            .setColor(client.color)
                            .setDescription(`**Antispam Status**`)
                            .addFields({
                                name: 'Current Status',
                                value: `Antispam is already disabled on your server.\n\nCurrent Status: ${disable}`
                            })
                            .addFields({
                                name: 'To Enable',
                                value: `To enable Antispam, use \`${prefix}antispam enable\``
                            })
                            .setTimestamp()
                            .setFooter({
                                name: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })
                        return message.channel.send({ embeds: [embedMessage] })
                    }
                    case 'punishment':
                        let punishment = args[1]?.toLowerCase();
                        if (!punishment) {
                            const embedMessagess = client.util.embed()
                                .setColor(client.color)
                                .setAuthor({
                                    name: message.author.tag,
                                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                                })
                                .setDescription('**Error:** Please provide valid punishment arguments.')
                                .addFields({
                                    name: 'Valid Punishments',
                                    value: 'Valid options are: `ban`, `kick`, `mute`.'
                                })
                                .setTimestamp()
                                .setFooter({
                                    text: client.user.username,
                                    iconURL: client.user.displayAvatarURL()
                                });
                            return message.channel.send({ embeds: [embedMessagess] });
                        }
                        const actions = {
                            ban: {
                                description: 'Any user caught spamming will be banned.',
                                title: 'Ban',
                                dbValue: 'ban',
                            },
                            kick: {
                                description: 'Any user caught spamming will be kicked.',
                                title: 'Kick',
                                dbValue: 'kick',
                            },
                            mute: {
                                description: 'Any user caught spamming will be muted.',
                                title: 'Mute',
                                dbValue: 'mute',
                                extraField: { name: 'Duration', value: '5 minutes' }
                            }
                        };
                    
                        const action = actions[punishment.toLowerCase()];
                        if (!action) {
                            const embedMessages = client.util.embed()
                                .setColor(client.color)
                                .setAuthor({
                                    name: message.author.tag,
                                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                                })
                                .setDescription('**Error:** Invalid punishment type provided.')
                                .addFields({
                                    name: 'Valid Punishments',
                                    value: 'Valid options are: `ban`, `kick`, `mute`.'
                                })
                                .setTimestamp()
                                .setFooter({
                                    text: client.user.username,
                                    iconURL: client.user.displayAvatarURL()
                                });
                            return message.channel.send({ embeds: [embedMessages] });
                        }
                    
                        await client.db.set(`antispamp_${message.guild.id}`, { data: action.dbValue });
                    
                        const embeds = client.util.embed()
                            .setColor(client.color)
                            .setTitle('Anti-Spam Punishment Configured')
                            .setDescription('The anti-spam punishment has been successfully configured.')
                            .addFields([
                                { name: 'Punishment Type', value: action.title },
                                { name: 'Action Taken', value: action.description }
                            ])
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            });
                    
                        if (action.extraField) {
                            embeds.addFields(action.extraField);
                        }
                    
                        await message.channel.send({ embeds: [embeds] });
                        break;                    
                case 'limit':
                    let limit = args[1]
                    if (!limit) {
                        const embedMessage = client.util.embed()
                            .setColor(client.color)
                            .setAuthor({
                                name: message.author.tag,
                                iconURL: message.author.displayAvatarURL({
                                    dynamic: true
                                })
                            })
                            .setDescription(
                                `**Error:** Please provide valid message limit arguments.`
                            )
                            .addFields({
                                name: 'Example',
                                value: 'Use the command like this: `Antispam limit 4`'
                            })
                            .setTimestamp()
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })
                        return message.channel.send({ embeds: [embedMessage] })
                    }
                    if (limit >= 4 && limit <= 10) {
                        await client.db.set(`antispamlimit_${message.guild.id}`, limit)
                        const embedMessage = client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | **Spam Threshold Updated**`
                            )
                            .addFields({ name: 'New Spam Threshold', value: `${limit}`, inline: true })
                            .setTimestamp()
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })
                        await message.channel.send({ embeds: [embedMessage] })
                    } else {
                        const embedMessage = client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | **Error: Invalid Message Count Limit**`
                            )
                            .addFields({
                                name: 'Valid Range',
                                value: 'Message count limit must be greater than 3 and less than 10'
                            })
                            .setTimestamp()
                            .setFooter({
                                text:
                                    client.user.username,
                                    iconURL: client.user.displayAvatarURL()
                            })
                        await message.channel.send({ embeds: [embedMessage] })
                    }
                    break;
                case 'strikes':
                    let strikes = args[1]
                    if (!strikes) {
                        const embedMessage = client.util.embed()
                            .setColor(client.color)
                            .setAuthor({
                                name: message.author.tag,
                                iconURL: message.author.displayAvatarURL({
                                    dynamic: true
                                })
                            })
                            .setDescription(
                                `**Error:** Please provide valid strikes arguments.`
                            )
                            .addFields({
                                name: 'Example',
                                value: 'Use the command like this: `Antispam strikes 4`'
                            })
                            .setTimestamp()
                            .setFooter({
                                text: client.user.username,
                                iconURL : client.user.displayAvatarURL()
                            })
                        return message.channel.send({ embeds: [embedMessage] })
                    }
                    if (strikes >= 1 && strikes <= 10) {  // Updated condition to accept only numbers from 1 to 10
                        await client.db.set(`antispamstrikes_${message.guild.id}`, strikes)
                        const embedMessage = client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | **Spam Warnings Updated**`
                            )
                            .addFields({ name: 'New Spam Warnings', value: `${strikes}`,  inline  : true})
                            .setTimestamp()
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })
                        await message.channel.send({ embeds: [embedMessage] })
                    } else {
                        const embedMessage = client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `**Error:** Please provide valid strikes arguments.`
                            )
                            .addFields({
                                name: 'Example',
                                value: 'Use the command like this: `Antispam strikes 4`'
                            })
                            .setTimestamp()
                            .setFooter({
                                text: client.user.username,
                                iconURL: client.user.displayAvatarURL()
                            })
                        await message.channel.send({ embeds: [embedMessage] })
                    }
                    break;

                case 'config':
                    const strike = await client.db.get(`antispamstrikes_${message.guild.id}`)
                    const punish = await client.db.get(`antispamp_${message.guild.id}`)
                    const limits = await client.db.get(`antispamlimit_${message.guild.id}`)
                    const value = await client.db.get(`antispam_${message.guild.id}`)
                    const embed = client.util.embed()
                    embed.setColor(client.color)
                    embed.setAuthor({ name: `Antispam Config for ${message.guild.name}` })
                    embed.addFields({ name: `Antispam Status`, value: `${value ? client.emoji.tick : client.emoji.cross}`, inline: true })
                    embed.addFields({ name: `Antispam Punishment Type`, value: `${punish ? punish.data : "None"}`, inline: true })
                    embed.addFields({ name: `Antispam Strike Count`, value: `${strike ? strike : "None"}`, inline: true })
                    embed.addFields({ name: `Antispam Limit Count`, value: `${limits ? limits : "None"}`, inline: true })
                    await message.channel.send({ embeds: [embed] })
               break;
                default :
                return message.channel.send({ embeds: [antispam] })
            
            }
        } catch (err) {
            console.err(err)
        }
    }
}
