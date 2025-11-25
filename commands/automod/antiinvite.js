
const { text } = require('figlet')
const wait = require('wait')

module.exports = {
    name: 'antiinvite',
    aliases: [],
    cooldown: 5,
    category: 'automod',
    subcommand: ['enable', 'disable', 'punishment','config'],
    premium: false,
    run: async (client, message, args) => {
        const { enable , disable, protect , hii } = client.emoji
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
            (await client.db.get(`antiinvite_${message.guild.id}`)) || { enabled : null , punishment : null}

        const antiinvite = client.util.embed()
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setColor(client.color)
            .setTitle('__**Antiinvite**__')
            .setDescription(
"Protect your server with AntiInvite! Our intelligent system detects and blocks Discord invite links, ensuring your community remains safe from spam and unauthorized promotions."            )
            .addFields([
                {
                    name: '__**Antiinvite Enable**__',
                    value: `To Enable Antiinvite, use \`${prefix}antiinvite enable\``
                },
                {
                    name: '__**Antiinvite Disable**__',
                    value: `To Disable Antiinvite, use \`${prefix}antiinvite disable\``
                },
                {
                    name: '__**Antiinvite Punishment**__',
                    value: 'Configure the punishment for users posting discord links.'
                },
                { 
                    name: 'Options',
                    value: '`ban` - Ban users, `kick` - Kick users, `mute` - Mute users, `none` - Delete Messages Which includes links'
                },
                {
                    name: '__**Antiinvite Config**__',
                    value: `Use ${prefix}Antiinvite config\nView Current Antiinvite Configuration`

                }
            ])            
            .setTimestamp()
            .setFooter({ text : client.user.username, iconURL : client.user.displayAvatarURL()})

        switch (option) {
            case undefined:
                message.channel.send({ embeds: [antiinvite] })
                break

            case 'enable':
                if (!isActivatedAlready.enabled) {
                    let data = await client.db.get(`antiinvite_${message.guild.id}`) || { enabled : null , punishment : null}
                    data.enabled = true
                    data.punishment = 'mute'
                    await client.db.set(`antiinvite_${message.guild.id}`, data)
                    const antiinviteEnableMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Antiinvite Enabled')
                        .setDescription(
                            '**Congratulations! Antiinvite has been successfully enabled on your server.**'
                        )
                        .addFields({
                           name : 'Enhanced Protection',
                           value : 'Enjoy enhanced protection against discord links!'
                })
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                           iconURL :  client.user.displayAvatarURL()
                })

                    await message.channel.send({
                        embeds: [antiinviteEnableMessage]
                    })
                } else {
                    const antiinviteSettingsEmbed = client.util.embed()
                        .setTitle(
                            `Antiinvite Settings for ${message.guild.name} ${protect}`
                        )
                        .setColor(client.color)
                        .setDescription(
                            '**Antiinvite is already enabled on your server.**'
                        )
                        .addFields({
                         name : 'Current Status',
                 value :  `Antiinvite is already enabled on your server.\n\nCurrent Status: ${enable}`
                })
                        .addFields({
                           name : 'To Disable',
                           value : `To disable Antiinvite, use \`${prefix}antiinvite disable\``
                })
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                           iconURL : client.user.displayAvatarURL()
                })
                    await message.channel.send({
                        embeds: [antiinviteSettingsEmbed]
                    })
                }

                break

            case 'disable':
                if (isActivatedAlready.enabled) {
                    let data = await client.db.get(`antiinvite_${message.guild.id}`) || { enabled : null , punishment : null}
                    data.enabled = null
                    data.punishment = null
                    await client.db.set(`antiinvite_${message.guild.id}`, data)
                    const antiinviteDisableMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Antiinvite Disabled')
                        .setDescription(
                            '**Antiinvite has been successfully disabled on your server.**'
                        )
                        .addFields({
                    name   :'Impact',
                         value :   'Your server will no longer be protected against discord links.'
                })
                        .setTimestamp()
                        .setFooter({ 

                           text :  client.user.username,
                           iconURL :    client.user.displayAvatarURL()
                })

                    await message.channel.send({
                        embeds: [antiinviteDisableMessage]
                    })
                } else {
                    const antiinviteSettingsEmbed = client.util.embed()
                        .setTitle(
                            `Antiinvite Settings for ${message.guild.name} ${protect}`
                        )
                        .setColor(client.color)
                        .setDescription(`**Antiinvite Status**`)
                        .addFields({
                           name : 'Current Status',
                           value : `Antiinvite is currently disabled on your server.\n\nCurrent Status: ${disable}`
                })
                        .addFields({
                          name :  'To Enable',
                           value : `To enable Antiinvite, use \`${prefix}antiinvite enable\``
                })
                        .setTimestamp()
                        .setFooter({ text : 
                            client.user.username,
                           iconURL : client.user.displayAvatarURL()
                })
                    await message.channel.send({
                        embeds: [antiinviteSettingsEmbed]
                    })
                }
                break

            case 'punishment':
                let punishment = args[1]?.toLowerCase()
                if (!punishment || !['ban', 'kick', 'mute', 'none'].includes(punishment)) {
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
                        .addFields({ name : 'Valid Options', value : '`ban`, `kick`, `mute`, `none`'})
                        .setTimestamp()
                        .setFooter({
                          text :  client.user.username,
                          iconURL :  client.user.displayAvatarURL()
                })

                    return message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'ban') {
                    let data = await client.db.get(`antiinvite_${message.guild.id}`)
                    data.enabled = data.enabled
                    data.punishment = 'ban'
                    await client.db.set(`antiinvite_${message.guild.id}`, data)
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Punishment Configured')
                        .setDescription(
                            'The punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type', value : 'Ban'})
                        .addFields({
                           name : 'Action Taken',
                           value : 'Any user violating the rules will be banned from the server.'
                })
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                           iconURL : client.user.displayAvatarURL()
                })
                    await message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'kick') {
                    let data = await client.db.get(`antiinvite_${message.guild.id}`)
                    data.enabled = data.enabled
                    data.punishment = 'kick'
                    await client.db.set(`antiinvite_${message.guild.id}`, data)
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Punishment Configured')
                        .setDescription(
                            'The punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type',value :  'Kick'})
                        .addFields({
                           name :  'Action Taken',
                           value : 'Any user violating the rules will be kicked from the server.'
                })
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                           iconURL : client.user.displayAvatarURL()
                })

                    await message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'mute') {
                    let data = await client.db.get(`antiinvite_${message.guild.id}`)
                    data.enabled = data.enabled
                    data.punishment = 'mute'
                    await client.db.set(`antiinvite_${message.guild.id}`, data)
                     const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Antiinvite Punishment Configured')
                        .setDescription(
                            'The antiinvite punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type', value :'Mute'})
                        
                        
                        .addFields({
                           name : 'Action Taken',
                           value : 'Any user caught posting discord links will be muted.'
                })
                        .setTimestamp()
                        .setFooter({ text : 
                            client.user.username,
                            iconURL : client.user.displayAvatarURL()
                })

                    await message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'none') {
                    let data = await client.db.get(`antiinvite_${message.guild.id}`)
                    data.enabled = data.enabled
                    data.punishment = 'none'
                    await client.db.set(`antiinvite_${message.guild.id}`, data)
                    
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Antiinvite Punishment Configured')
                        .setDescription(
                            'The antiinvite punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type', value :'None'})
                        
                        
                        .addFields({
                           name : 'Action Taken',
                           value : 'Any user caught posting discord links his messages will be deleted.'
                })
                        .setTimestamp()
                        .setFooter({ text : 
                            client.user.username,
                            iconURL : client.user.displayAvatarURL()
                })

                    await message.channel.send({ embeds: [embedMessage] })
                }
                break;
                case 'config':
                    let data = await client.db.get(`antiinvite_${message.guild.id}`) || { enabled: null, punishment: null };
                    const embed = client.util.embed();
                    embed.setColor(client.color);
                    embed.setAuthor({ name: `Antiinvite Config for ${message.guild.name}` });
                    embed.addFields({ 
                        name: `Antiinvite Status`, 
                        value: `${data.enabled ? client.emoji.tick : client.emoji.cross}`, 
                        inline: true 
                    });
                    embed.addFields({ 
                        name: `Antiinvite Punishment Type`, 
                        value: `${data.punishment ? data.punishment : "None"}`, 
                        inline: true 
                    });
                    await message.channel.send({ embeds: [embed] });
                    break;
                default:
                return message.channel.send({ embeds: [antiinvite] })
        }
    }
}
