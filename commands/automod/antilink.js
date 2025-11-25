
const { text } = require('figlet')
const wait = require('wait')

module.exports = {
    name: 'antilink',
    aliases: [],
    cooldown: 5,
    category: 'automod',
    subcommand: ['enable', 'disable', 'punishment', 'config'],
    premium: false,
    run: async (client, message, args) => {
        const { enable , disable, protect , hii } = client.emoji
        const embed = client.util.embed().setColor(client.color)
        let own = message.author.id == message.guild.ownerId
        if (!message.member.permissions.has('Administrator')) {
            return message.channel.send({
                embeds: [
                    embed
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
            (await client.db.get(`antilink_${message.guild.id}`)) || null

        const antilink = client.util.embed()
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setColor(client.color)
            .setTitle('__**Antilink**__')
            .setDescription(
                "Enhance your server's protection with Antilink! Our advanced algorithms swiftly identify suspicious links and take immediate action against them, safeguarding your community from potential threats."
            )
            .addFields([
                {
                    name: '__**Antilink Enable**__',
                    value: `To Enable Antilink, use \`${prefix}antilink enable\``
                },
                {
                    name: '__**Antilink Disable**__',
                    value: `To Disable Antilink, use \`${prefix}antilink disable\``
                },
                {
                    name: '__**Antilink Punishment**__',
                    value: 'Configure the punishment for users posting suspicious links.'
                },
                { 
                    name: 'Options',
                    value: '`ban` - Ban users, `kick` - Kick users, `mute` - Mute users, `none` - Delete Messages Which includes links'
                },
                {
                    name: '__**Antilink Config**__',
                    value: `Use ${prefix}Antilink config\nView Current Antilink Configuration`

                }
            ])            
            .setTimestamp()
            .setFooter({ text : client.user.username, iconURL : client.user.displayAvatarURL()})

        switch (option) {
            case undefined:
                message.channel.send({ embeds: [antilink] })
                break

            case 'enable':
                if (!isActivatedAlready) {
                    await client.db.set(`antilink_${message.guild.id}`, true)
                    await client.db.set(`antilinkp_${message.guild.id}`, {
                        data: 'mute'
                    })

                    const antilinkEnableMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Antilink Enabled')
                        .setDescription(
                            '**Congratulations! Antilink has been successfully enabled on your server.**'
                        )
                        .addFields({
                           name : 'Enhanced Protection',
                           value : 'Enjoy enhanced protection against suspicious links!'
                })
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                           iconURL :  client.user.displayAvatarURL()
                })

                    await message.channel.send({
                        embeds: [antilinkEnableMessage]
                    })
                } else {
                    const antilinkSettingsEmbed = client.util.embed()
                        .setTitle(
                            `Antilink Settings for ${message.guild.name} ${protect}`
                        )
                        .setColor(client.color)
                        .setDescription(
                            '**Antilink is already enabled on your server.**'
                        )
                        .addFields({
                         name : 'Current Status',
                 value :  `Antilink is already enabled on your server.\n\nCurrent Status: ${enable}`
                })
                        .addFields({
                           name : 'To Disable',
                           value : `To disable Antilink, use \`${prefix}antilink disable\``
                })
                        .setTimestamp()
                        .setFooter({
                           text : client.user.username,
                           iconURL : client.user.displayAvatarURL()
                })
                    await message.channel.send({
                        embeds: [antilinkSettingsEmbed]
                    })
                }

                break

            case 'disable':
                if (isActivatedAlready) {
                    await client.db.set(`antilink_${message.guild.id}`, false)
                    await client.db.set(`antilinkp_${message.guild.id}`, {
                        data: null
                    })
                    const antilinkDisableMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Antilink Disabled')
                        .setDescription(
                            '**Antilink has been successfully disabled on your server.**'
                        )
                        .addFields({
                    name   :'Impact',
                         value :   'Your server will no longer be protected against suspicious links.'
                })
                        .setTimestamp()
                        .setFooter({ 

                           text :  client.user.username,
                           iconURL :    client.user.displayAvatarURL()
                })

                    await message.channel.send({
                        embeds: [antilinkDisableMessage]
                    })
                } else {
                    const antilinkSettingsEmbed = client.util.embed()
                        .setTitle(
                            `Antilink Settings for ${message.guild.name} ${protect}`
                        )
                        .setColor(client.color)
                        .setDescription(`**Antilink Status**`)
                        .addFields({
                           name : 'Current Status',
                           value : `Antilink is currently disabled on your server.\n\nCurrent Status: ${disable}`
                })
                        .addFields({
                          name :  'To Enable',
                           value : `To enable Antilink, use \`${prefix}antilink enable\``
                })
                        .setTimestamp()
                        .setFooter({ text : 
                            client.user.username,
                            iconURL : client.user.displayAvatarURL()
                })
                    await message.channel.send({
                        embeds: [antilinkSettingsEmbed]
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
                    await client.db.set(`antilinkp_${message.guild.id}`, {
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
                    await client.db.set(`antilinkp_${message.guild.id}`, {
                        data: 'kick'
                    })
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
                    await client.db.set(`antilinkp_${message.guild.id}`, {
                        data: 'mute'
                    })
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Antilink Punishment Configured')
                        .setDescription(
                            'The antilink punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type', value :'Mute'})
                        
                        
                        .addFields({
                           name : 'Action Taken',
                           value : 'Any user caught posting links will be muted.'
                })
                        .setTimestamp()
                        .setFooter({ text : 
                            client.user.username,
                            iconURL : client.user.displayAvatarURL()
                })

                    await message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'none') {
                    await client.db.set(`antilinkp_${message.guild.id}`, {
                        data: 'none'
                    })
                    const embedMessage = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Antilink Punishment Configured')
                        .setDescription(
                            'The antilink punishment has been successfully configured.'
                        )
                        .addFields({ name : 'Punishment Type', value :'None'})
                        
                        
                        .addFields({
                           name : 'Action Taken',
                           value : 'Any user caught posting links his messages will be deleted.'
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
                    const punish = await client.db.get(`antilinkp_${message.guild.id}`)
                    const value = await client.db.get(`antilink_${message.guild.id}`)
                    const embed = client.util.embed()
                    embed.setColor(client.color)
                    embed.setAuthor({ name: `Antilink Config for ${message.guild.name}` })
                    embed.addFields({ name: `Antilink Status`, value: `${value ? client.emoji.tick : client.emoji.cross}`, inline: true })
                    embed.addFields({ name: `Antilink Punishment Type`, value: `${punish ? punish.data : "None"}`, inline: true })
                    await message.channel.send({ embeds: [embed] })
                break;
                default: 
                return message.channel.send({ embeds : [antilink]})
        }
    }
}
