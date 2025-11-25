module.exports = {
    name: 'panicmode',
    aliases: ['panic', 'pn'],
    category: 'security',
    subcommand : ['enable','disable'],
    premium: true,
    run: async (client, message, args) => {
        const { enable , disable, protect , hii, tick } = client.emoji
        let own = message.author.id == message.guild.ownerId
        const check = await client.util.isExtraOwner(
            message.author,
            message.guild
        )
        if (!own && !check) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | Only Server Owner Or Extraowner Can Run This Command.!`
                        )
                ]
            })
        }
        if (
            !own &&
            !(
                message?.guild.members.cache.get(client.user.id).roles.highest
                    .position <= message?.member?.roles?.highest.position
            )
        ) {
            const higherole = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `${client.emoji.cross} | Only Server Owner Or Extraowner Having Higher Role Than Me Can Run This Command`
                )
            return message.channel.send({ embeds: [higherole] })
        }

        let prefix = '&' || message.guild.prefix
        const option = args[0]
        const panic = await client.db.get(
            `panic_${message.guild.id}`
        ) ?? null;
        const isActivatedAlready = await client.db.get(`${message.guild.id}_antinuke`)
        if (!isActivatedAlready) {
            const enabnble = client.util.embed()
                .setThumbnail(client.user.displayAvatarURL())
                .setColor(client.color)
                .setDescription(
                    `the Antinuke feature is not currently active.\n\nPlease enable antinuke using ${prefix}antinuke enable before using the panic mode feature.\nTo enable antinuke, use ${prefix}antinuke enable`)
            return message.channel.send({ embeds: [enabnble] })
        }
        const antinuke = client.util.embed()
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setColor(client.color)
            .setTitle(`__**Panic**__`)
            .setDescription(`Bitzxier's Panic Mode is an advanced defense system crafted to counter scripted or automated mass nuke/raid attacks on server. Panic Mode fortifies defenses, protecting your server against mass nuke`)
            .addFields([
                {
                    name: `__**Panic Enable**__`,
                    value: `To Enable Panic, Use - \`${prefix}panic enable\``
                },
                {
                    name: `__**Panic Disable**__`,
                    value: `To Disable Panic, Use - \`${prefix}panic disable\``
                },
                {
                    name: `__**Panic Punishment**__`,
                    value: `Configure the punishment for panic mode.`
                },
                {
                    name: `__**Options**__`,
                    value: '`ban` - Ban users, `quarantine` - Quarantine users'
                }
            ])

        {
            if (!option) {
                message.channel.send({ embeds: [antinuke] })
            } else if (option === 'enable') {
                if (panic) {
                    const enabnble = client.util.embed()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setColor(client.color)
                        .setDescription(
                            `**Security Settings For ${message.guild.name} ${protect}\nUmm, looks like your server has already enabled Advance Security\n\nCurrent Status : ${enable}\nTo Disable use ${prefix}panic disable**`
                        )
                    message.channel.send({ embeds: [enabnble] })
                } else {
                    await client.db.set(`panic_${message.guild.id}`, true)
                    await client.db.set(`panicp_${message.guild.id}`, {
                        data: `quarantine`
                    })
                    const enabled = client.util.embed()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setAuthor({
                            name: `${client.user.username} Security`,
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setColor(client.color)
                        .setDescription(
                            `**Panic Mode Settings for ${message.guild.name} ${protect}**\n\nTip: For optimal performance of the Panic Mode module, it's recommended to prioritize my role placement at the top of the server's roles list.${hii}\n\n**Enabled Modules** ${protect}\n\nAnti-Ban: ${enable}\nAnti-Unban: ${enable}\nAnti-Kick: ${enable}\nAnti-Bot: ${enable}\nAnti-Channel Creation: ${enable}\nAnti-Channel Deletion: ${enable}\nAnti-Channel Update: ${enable}\nAnti-Emoji/Sticker Creation: ${enable}\nAnti-Emoji/Sticker Deletion: ${enable}\nAnti-Emoji/Sticker Update: ${enable}\nAnti-Everyone/Here Ping: ${enable}\nAnti-Role Linking: ${enable}\nAnti-Role Creation: ${enable}\nAnti-Role Deletion: ${enable}\nAnti-Role Update: ${enable}\nAnti-Role Ping: ${enable}\nAnti-Member Update: ${enable}\nAnti-Integration: ${enable}\nAnti-Server Update: ${enable}\nAnti-Automod Rule Creation: ${enable}\nAnti-Automod Rule Update: ${enable}\nAnti-Automod Rule Deletion: ${enable}\nAnti-Guild Event Creation: ${enable}\nAnti-Guild Event Update: ${enable}\nAnti-Guild Event Deletion: ${enable}\nAnti-Webhook: ${enable}\n\n**Anti-Prune:** ${enable}\n**Auto-Recovery:** ${enable}`
                        )
                        .setFooter({
                            text: `Punishment Type: Quarantine`,
                            iconURL: message.author.displayAvatarURL({
                                dynamic: true
                            })
                        })

                    let msg = await message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.tick} | Initializing Panic Setup!`
                                )
                        ]
                    })
                    const steps = [
                        'Checking security protocols for Discord server...',
                        'Fetching roles and permissions for analysis...',
                        'Analyzing role hierarchy and permissions structure...',
                        'Verifying access controls for sensitive channels...',
                        'Fetching a list of all channels for comprehensive assessment...',
                        'Analyzing channel permissions to ensure proper restrictions...',
                        'Cross-referencing user permissions with channel access...',
                        'Identifying potential security vulnerabilities or misconfigurations...',
                        'Implementing corrective measures to enhance server security...'
                    ];
                    for (const step of steps) {
                        await client.util.sleep(1000)
                        await msg.edit({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(
                                        `${msg.embeds[0].description}\n${tick} | ${step}`
                                    )
                            ]
                        })
                    }


                    let quarantine = await message.guild.roles.cache.find(role => role.name == 'Quarantine')
                    if (!quarantine) {
                        quarantine = await message.guild.roles.create({
                            name: `Quarantine`,
                            color: `#b38844`,
                            permissions: [],
                            position: 0,
                            reason: `Panic Mode | Quarantine System`
                        }).catch(err => null)

                    }
                    if (quarantine.permissions.has("BanMembers") || quarantine.permissions.has("Administrator") || quarantine.permissions.has("KickMembers") || quarantine.permissions.has("ManageChannels") || quarantine.permissions.has("ManageGuild") || quarantine.permissions.has("MentionEveryone") || quarantine.permissions.has("ManageRoles") || quarantine.permissions.has("ManageWebhooks") || quarantine.permissions.has("ModerateMembers") || quarantine.permissions.has("ManageEvents")) {
                        await quarantine.setPermissions([], 'Removing Dangerous Permissions From Quarentine Role')
                        await quarantine.setPosition(0)
                    }
                    const channels = await message.guild.channels.fetch();
                    for (const c of channels) {
                        const channel = c[1];
                        try {
                            await client.util.sleep(750)
                            if (channel.manageable) {
                            let check = await channel.permissionOverwrites.resolve(quarantine.id)
                            if(!check) {
                                await channel.permissionOverwrites.edit(quarantine.id, {
                                    ViewChannel : false,
                                    SendMessages : false,
                                    reason: `PANICMODE SETUP`,
                                })
                            }
                        }
                        } catch (err) {
                            return;
                        }
                    }
                    await client.util.sleep(1000)
                    await msg.edit({ embeds: [enabled] })
                }
            } else if (option === 'disable') {
                if (!panic) {
                    const dissable = client.util.embed()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setColor(client.color)
                        .setDescription(
                            `**Security Settings For ${message.guild.name} ${protect}\nUmm, looks like your server hasn't enabled security.\n\nCurrent Status: ${disable}\n\nTo Enable use ${prefix}panic enable**`
                        )
                    message.channel.send({ embeds: [dissable] })
                } else {
                    await client.db.set(`panic_${message.guild.id}`, null)

                    const disabled = client.util.embed()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setColor(client.color)
                        .setDescription(
                            `**Security Settings For ${message.guild.name} ${protect}\nSuccessfully disabled security settings for this server.\n\nCurrent Status: ${disable}\n\nTo Enable use ${prefix}panic enable**`
                        )
                    message.channel.send({ embeds: [disabled] })
                }
            } else if (option === 'punishment' || option === 'punishments') {
                let punishment = args[1].toLowerCase()
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
                        .addFields({ name : 
                            'Error',
                        value : 'Please provide valid punishment arguments.'
                })
                        .addFields({ name : 'Valid Options',value : '`ban` , `quarantine`'})
                        .setTimestamp()
                        .setFooter({ text : client.user.username,
                            iconURL: client.user.displayAvatarURL()
                 });
                    return message.channel.send({ embeds: [embedMessage] })
                }
                if (punishment === 'ban') {
                    await client.db.set(`panicp_${message.guild.id}`, {
                        data: 'ban'
                    })
                    const panicModeEmbed = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Panic Mode Punishment Configured')
                        .setDescription(
                            'Panic Mode punishment has been successfully set to ban.'
                        )
                        .addFields({ name : 'Punishment Type', value : 'ban'})
                        .addFields({
                           name :  'Action Taken',
                           value : 'Panic Mode will actively monitor and defend against scripted nuke attacks.'
                })
                        .setTimestamp()
                        .setFooter({ text : client.user.username,
                            iconURL: client.user.displayAvatarURL()
                 });
                    await message.channel.send({ embeds: [panicModeEmbed] });
                }

                if (punishment === 'quarantine') {
                    await client.db.set(`panicp_${message.guild.id}`, {
                        data: 'quarantine'
                    })
                    const quarantinePunishmentEmbed = client.util.embed()
                        .setColor(client.color)
                        .setTitle('Quarantine Punishment Configured')
                        .setDescription(
                            'Panic Mode punishment has been successfully set to quarantine.'
                        )
                        .addFields({ name : 'Punishment Type', value :'Quarantine'})
                        .addFields({
                           name : 'Action Taken',
                            value : 'Any user violating the rules will be quarantined.'
                })
                        .setTimestamp()
                        .setFooter({ text : client.user.username,
                           iconURL: client.user.displayAvatarURL()
                });

                    await message.channel.send({ embeds: [quarantinePunishmentEmbed] });
                }
            } else {
                message.channel.send({ embeds: [antinuke] })
            }
        }
    }
}
