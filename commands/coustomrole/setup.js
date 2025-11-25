const {
    PermissionsBitField,
    ButtonBuilder,
    ActionRowBuilder,
    inlineCode
} = require('discord.js')
module.exports = {
    name: 'setup',
    aliases: ['customrole'],
    subcommand: ['add', 'remove', 'config', 'reset', 'list', 'reqrole'],
    category: 'customrole',
    premium: false,

    run: async (client, message, args) => {
        const embed = client.util.embed().setColor(client.color)
        let own = message.author.id == message.guild.ownerId
        if (!message.member.permissions.has('ManageRoles')) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have \`Manage Roles\` permissions to use this command.`
                        )
                ]
            })
        }
        if (!message.guild.members.me.permissions.has('ManageRoles')) {
            return message.channel.send({
                embeds: [
                    embed
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I don't have \`Manage Roles\` permissions to execute this command.`
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
        if (!args[0])
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setAuthor({
                            name: message.guild.name,
                            iconURL:
                                message.guild.iconURL({ dynamic: true }) ||
                                client.user.displayAvatarURL()
                        })
                        .setFooter({ text: `${client.user.username}` })
                        .setColor(client.color)
                        .setDescription(
                            `\n\`${message.guild.prefix}setup add <name> <role>\`\nSetups a role with the provided name.\n\n\`${message.guild.prefix}setup remove <name>\`\nRemoves a role with the provided name.\n\n\`${message.guild.prefix}setup reqrole <role>\`\nSetups a requirement role.\n\n\`${message.guild.prefix}setup add girl <role>\`\nSetups a role for girls\n\n\`${message.guild.prefix}setup add guest <role>\`\nSetups a role for guests.\n\n\`${message.guild.prefix}setup add vip <role>\`\nSetups a role for vip members.\n\n\`${message.guild.prefix}setup add official <role>\`\nSetups a role for official mebers.\n\n\`${message.guild.prefix}setup list\`\nShows you the list of all custom roles.\n\n\`${message.guild.prefix}setup config\`\nShows you the configuration of custom roles.\n\n\`${message.guild.prefix}setup reset\`\nClear the configuration of custom roles.`
                        )
                ]
            })
        const input = args[0].toLowerCase()
        if (input === 'add') {
            const data = await client.db?.get(`customrole_${message.guild.id}`) || {
                names: [],
                roles: [],
                reqrole: null }
            if (!data) {
                await client.db?.set(`customrole_${message.guild.id}`, {
                    names: [],
                    roles: [],
                    reqrole: null
                })
                let msg = await message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `Please wait, setting up configuration for your server. This may take a moment...`
                            )
                    ]
                })
                await client.util.sleep(2000)
                const setupRoleEmbed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`Server Configuration Complete!`)
                    .setDescription(
                        `Congratulations! Your server has been configured successfully. You can now use custom roles and enjoy the enhanced features hassle-free! 🚀`
                    )
                    .setFooter(
                        `Setup completed by ${message.author.tag}`,
                        message.author.displayAvatarURL({ dynamic: true })
                    )
                return await msg.edit({ embeds: [setupRoleEmbed] })
            }
            if (data) {
                let limit;
                let premium = await client.db.get(`sprem_${message.guild.id}`);
                if (premium) {
                    limit = 100;
                } else {
                    limit = 50;
                }
                if (data.names.length > limit) {
                    const embed = client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | Sorry, you've reached the limit of ${limit} custom role setups. Please remove some setups to add new ones.`
                        )

                    return message.channel.send({ embeds: [embed] })
                }
            }
            if (!args[1])
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | ${message.guild.prefix}setup add <name> <role>`
                            )
                    ]
                })
            let id = args[1].replace(/[<@&#>]/giu, '')
            const check = message.guild.roles.cache.get(id)
            if (check)
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | ${message.guild.prefix}setup add <name> <role>`
                            )
                    ]
                })
            const name = args[1].toLowerCase()
            const mentionRegex = /<(@|#|&)([!&]?)(\d+)>/g;
            if(mentionRegex.test(name)) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `You Cannot Add User Mentions role mentions & channel mentions in name`
                            )
                    ]
                })
            }
            if (data)
                if (data.names.length > 0) {
                    if (data.names.includes(name)) {
                        const embed = client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Oops! The custom role **${name}** already exists in my list. Please choose a different name.`
                            )

                        return message.channel.send({ embeds: [embed] })
                    }
                }
            if (!args[2])
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | ${message.guild.prefix}setup add ${args[1]} <role>`
                            )
                    ]
                })
            const role =
                message.mentions.roles.first() ||
                message.guild.roles.cache.get(args[2]) ||
                message.guild.roles.cache.find(
                    (r) =>
                        r.name.toLowerCase() ===
                        args.slice(2).join(' ').toLowerCase()
                )
            if (!role)
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Role **not** found!`
                            )
                    ]
                })
            if (role.managed)
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | <@&${role.id}> isn't a **server** role!`
                            )
                    ]
                })
                if(role)
            {
                if (data.roles.length > 0) {
                        if (data.roles.includes(role.id)) {
                            const embed = client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | Oops! The custom role **${role}** already exists in my list. Please choose a different name.`
                                )
    
                            return message.channel.send({ embeds: [embed] })
                        }
                    }
                    }
            let array = [
                'KickMembers',
                'BanMembers',
                'Administrator',
                'ManageChannels',
                'ManageGuild',
                'MentionEveryone',
                'ManageRoles',
                'ManageWebhooks',
                'ManageEvents',
                'ModerateMembers',
                'ManageEmojisAndStickers'
            ]

            if (
                role.permissions.has('KickMembers') ||
                role.permissions.has('BanMembers') ||
                role.permissions.has('Administrator') ||
                role.permissions.has('ManageChannels') ||
                role.permissions.has('ManageGuild') ||
                role.permissions.has('MentionEveryone') ||
                role.permissions.has('ManageRoles') ||
                role.permissions.has('ManageWebhooks') ||
                role.permissions.has('ManageEvents') ||
                role.permissions.has('ModerateMembers') ||
                role.permissions.has('ManageEmojisAndStickers')
            )
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setDescription(
                                `${client.emoji.cross} | I can't **add** <@&${role.id}> in my **custom role** list because it has ${new PermissionsBitField.Flags(
                                    role.permissions.bitfield
                                )
                                    .toArray()
                                    .filter((a) => array.includes(a))
                                    .map((arr) => `\`${arr}\``)
                                    .join(', ')} permissions`
                            )
                            .setColor(client.color)
                    ]
                })

            let names = [],
                roles = []
            if (data) {
                if (data.roles.length > 0) data.roles.map((r) => roles.push(r))
                if (data.names.length > 0) data.names.map((r) => names.push(r))
            }
            roles.push(role.id)
            names.push(name)
            await client.db?.set(`customrole_${message.guild.id}`, {
                names: names,
                roles: roles,
                reqrole: data ? data.reqrole : null
            })
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setTitle(`Custom Role Added`)
                        .setDescription(
                            `The role <@&${role.id}> has been successfully added to my custom role list.`
                        )
                        .addFields({ name : 'Role Name', value : `<@&${role.id}>`, inline : true})
                        .addFields({ name : 'List Size', value : `${data.names.length + 1}`, inline : true})
                        .setFooter({
                           text : `${client.user.username}`,
                          iconURL :  client.user.displayAvatarURL({ dynamic: true })
            })
                ]
            })
        } else if (input == 'remove') {
            let data = await client.db?.get(`customrole_${message.guild.id}`)
            if (!data) {
                await client.db?.set(`customrole_${message.guild.id}`, {
                    names: [],
                    roles: [],
                    reqrole: null
                })
                let msg = await message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `Please wait, setting up configuration for your server. This may take a moment...`
                            )
                    ]
                })
                await client.util.sleep(2000)
                const setupRoleEmbed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`Server Configuration Complete!`)
                    .setDescription(
                        `Congratulations! Your server has been configured successfully. You can now use custom roles and enjoy the enhanced features hassle-free! 🚀`
                    )
                    .setFooter({
                      name :  `Setup completed by ${message.author.tag}`,
                      iconURL :  message.author.displayAvatarURL({ dynamic: true })
            })
                return await msg.edit({ embeds: [setupRoleEmbed] })
            }
            if (!data.names.length) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setDescription(
                        `${client.emoji.cross} | Oops! It seems like there are no custom role setups configured yet. Use \`${message.guild.prefix}setup\` to create custom roles.`
                    )
                return message.channel.send({ embeds: [embed] })
            }

            if (!args[1]) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${message.guild.prefix}setup remove <name>`
                            )
                    ]
                })
            }

            const roleName = args[1].toLowerCase()
            const roleIndex = data.names.indexOf(roleName)

            if (roleIndex === -1) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setDescription(
                        `${client.emoji.cross} | Oops! The role with the name **${roleName}** couldn't be found in my custom role setups. Double-check the name and try again.`
                    )
                return message.channel.send({ embeds: [embed] })
            }

            data.names.splice(roleIndex, 1)
            data.roles.splice(roleIndex, 1)

            await client.db?.set(`customrole_${message.guildId}`, data)

            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setTitle(`Custom Role Removed`)
                        .setDescription(
                            `The role **${roleName}** has been successfully removed from my custom role list.`
                        )
                        .addFields({ name : 'Removed Role', value : roleName, inline : true})
                        .addFields({
                          name :  'Remaining Roles',
                           value :  `${data.names.length}`, inline : true})
                        .setFooter({ text :
                            `Role removed by ${message.author.tag}`,
                           iconURL : message.author.displayAvatarURL({ dynamic: true })
            })
                ]
            })
        } else if (input == 'list') {
            const data = await client.db?.get(`customrole_${message.guild.id}`)
            if (!data) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`Nothing to Show`)
                    .setDescription(
                        `${client.emoji.cross} | Oops! There's nothing to display for custom role setups.`
                    )
                    .setAuthor({
                        name: message.guild.name,
                        iconURL:
                            message.guild.iconURL({ dynamic: true }) ||
                            client.user.displayAvatarURL()
                    })
                    .setFooter({
                        text: `Requested By ${message.author.tag}`,
                        iconURL: `${message.author.displayAvatarURL({ dynamic: true })}`
                    })

                return message.channel.send({ embeds: [embed] })
            }

            if (data) {
                if (data.names.length < 1) {
                    const embed = client.util.embed()
                        .setColor(client.color)
                        .setTitle(`Nothing to Show`)
                        .setDescription(
                            `${client.emoji.cross} | Oops! There's nothing to display for custom role setups.`
                        )
                        .setAuthor({
                            name: message.guild.name,
                            iconURL:
                                message.guild.iconURL({ dynamic: true }) ||
                                client.user.displayAvatarURL()
                        })
                        .setFooter({
                            text: `Requested By ${message.author.tag}`,
                            iconURL: `${message.author.displayAvatarURL({ dynamic: true })}`
                        })

                    return message.channel.send({ embeds: [embed] })
                }
                let c = 0;
                let mappedData = data.names.map((d, index) => 
                  `[\`${++c}\`] | **${message.guild.prefix}${d}**: <@&${data.roles[index]}> | \`${data.roles[index]}\`` // Correctly concatenating values
                ) // Joining the array into a single string with line breaks only between entries
                
                return client.util.BitzxierPagination(mappedData, `Custom roles in ${message.guild.name}`, client, message);
                }
        } else if (input == 'reset') {
            const data = await client.db?.get(`customrole_${message.guild.id}`)
            if (!data) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`No Custom Role Setups Found`)
                    .setDescription(
                        `Oops! It appears there are no custom role setups configured yet. Use \`${message.guild.prefix}setup\` to create custom roles and enhance your server experience.`
                    )

                return message.channel.send({ embeds: [embed] })
            }
            await client.db?.delete(`customrole_${message.guild.id}`)
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setTitle(`Custom Role Module Successfully Reset`)
                        .setDescription(
                            `The custom role module has been successfully reset. All custom roles, configurations, and settings have been cleared. You can now start fresh with your custom role setups.`
                        )
                        .setFooter({
                           name : `Reset by ${message.author.tag}`,
                         value :   message.author.displayAvatarURL({ dynamic: true })
            })
                ]
            })
        } else if (input == 'reqrole') {
            let data = await client.db?.get(`customrole_${message.guild.id}`)
            if (!data) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`Custom Role Setup Not Found`)
                    .setDescription(
                        `Oops! It seems like there are no custom role setups configured for this server yet. Use \`${message.guild.prefix}setup\` to create custom roles and personalize your server's roles.`
                    )
                    .setFooter({
                      name :  `Requested by ${message.author.tag}`,
                      value :  message.author.displayAvatarURL({ dynamic: true })
            })

                return message.channel.send({ embeds: [embed] })
            }
            if (data)
                if (!data?.names?.length) {
                    const embed = client.util.embed()
                        .setColor(client.color)
                        .setTitle(`Custom Role Setup Not Found`)
                        .setDescription(
                            `Oops! It seems like there are no custom role setups configured for this server yet. Use \`${message.guild.prefix}setup\` to create custom roles and personalize your server's roles.`
                        )
                        .setFooter({
                           text : `Requested by ${message.author.tag}`,
                          iconURL :  message.author.displayAvatarURL({ dynamic: true })
                })

                    return message.channel.send({ embeds: [embed] })
                }
            if (!args[1])
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${message.guild.prefix}setup reqrole <role>`
                            )
                    ]
                })
            const role =
                message.mentions.roles.first() ||
                message.guild.roles.cache.get(args[1]) ||
                message.guild.roles.cache.find(
                    (r) => r?.name?.toLowerCase() == args[1].toLowerCase()
                )
            if (!role) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`Role Not Found`)
                    .setDescription(
                        `Oops! The specified role could not be found. Please double-check the role mention or name and try again.`
                    )
                    .setFooter({
                       text : `Requested by ${message.author.tag}`,
                     value :   message.author.displayAvatarURL({ dynamic: true })
            })

                return message.channel.send({ embeds: [embed] })
            }
            if (role.managed) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`Role Not Valid`)
                    .setDescription(
                        `<@&${role.id}> appears to be a role managed by an internal service and cannot be assigned as a server role. Please choose a different role.`
                    )
                    .setFooter({ text :
                        `Requested by ${message.author.tag}`,
                       value : message.author.displayAvatarURL({ dynamic: true })
            })

                return message.channel.send({ embeds: [embed] })
            }
            if (
                role.position >= message.member.roles.highest.position &&
                message.author.id !== message.guild.ownerId
            ) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`${client.emoji.cross} Role Position Issue`)
                    .setDescription(
                        `<@&${role.id}> cannot be assigned because its position is either equal to or higher than your highest role. Please adjust your roles or choose a role with a lower position.`
                    )
                    .setFooter({
                       text : `Requested by ${message.author.tag}`,
                       iconURL : message.author.displayAvatarURL({ dynamic: true })
            })

                return message.channel.send({ embeds: [embed] })
            }
            if (role.position >= message.guild.members.me.roles.highest.position) {
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setTitle(`Role Position Issue`)
                    .setDescription(
                        `<@&${role.id}> cannot be assigned because its position is either equal to or higher than my highest role. Please adjust the role positions or choose a role with a lower position.`
                    )
                    .setFooter({ text :
                        `Requested by ${message.author.tag}`,
                      iconURL :  message.author.displayAvatarURL({ dynamic: true })
            })

                return message.channel.send({ embeds: [embed] })
            }
            await client.db?.set(`customrole_${message.guild.id}`, {
                roles: data.roles,
                names: data.names,
                reqrole: role.id
            })
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setTitle(`Custom Requirement Role Set`)
                        .setDescription(
                            `The role <@&${role.id}> has been successfully set up as a custom requirement role. Members will now need this role to assign features.`
                        )
                        .setFooter({
                         text :   `Setup by ${message.author.tag}`,
                          name :  message.author.displayAvatarURL({ dynamic: true })
            })
                ]
            })
        } else if (input == 'config') {
            const data = await client.db?.get(`customrole_${message.guild.id}`)
            if (!data)
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setAuthor({
                                name: message.guild.name,
                                iconURL:
                                    message.guild.iconURL({ dynamic: true }) ||
                                    client.user.displayAvatarURL()
                            })
                            .setFooter({ text: `${client.user.username}` })
                            .setColor(client.color)
                            .setDescription(
                                `**__Reqrole__**\n\n*Role Not set*.\n\n**__Girl__**\n\n*Role Not set*.\n\n**__Guest__**\n*Role Not set*.\n\n**__Vip__**\n\n*Role Not set*.\n\n**__Official__**\n\n*Role Not set*.`
                            )
                            .setThumbnail(client.user.displayAvatarURL())
                    ]
                })
            if (data.roles.length < 1 && data.names.length < 1 && !data.reqrole)
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setAuthor({
                                name: message.guild.name,
                                iconURL:
                                    message.guild.iconURL({ dynamic: true }) ||
                                    client.user.displayAvatarURL()
                            })
                            .setFooter({ text: `${client.user.username}` })
                            .setColor(client.color)
                            .setDescription(
                                `**__Reqrole__**\n*Role Not set*.\n\n**__Girl__**\n*Role Not set*.\n\n**__Guest__**\n*Role Not set*.\n\n**__Vip__**\n*Role Not set*.\n\n**__Official__**\n*Role Not set*.`
                            )
                            .setThumbnail(client.user.displayAvatarURL())
                    ]
                })
            let reqrole, girl, guest, vip, official
            const check = await message.guild.roles.fetch(data.reqrole)
            const check1 = await message.guild.roles.fetch(
                data.roles[
                    data.names.indexOf(
                        data.names.filter((n) => n.toLowerCase() === 'girl')[0]
                    )
                ]
            )
            const check2 = await message.guild.roles.fetch(
                data.roles[
                    data.names.indexOf(
                        data.names.filter((n) => n.toLowerCase() === 'guest')[0]
                    )
                ]
            )
            const check3 = await message.guild.roles.fetch(
                data.roles[
                    data.names.indexOf(
                        data.names.filter((n) => n.toLowerCase() === 'vip')[0]
                    )
                ]
            )
            const check4 = await message.guild.roles.fetch(
                data.roles[
                    data.names.indexOf(
                        data.names.filter(
                            (n) => n.toLowerCase() === 'official'
                        )[0]
                    )
                ]
            )
            if (check) reqrole = check
            else reqrole = '*Role Not set*'
            if (check1) girl = check1
            else girl = '*Role Not set*'
            if (check) guest = check2
            else guest = '*Role Not set*'
            if (check) vip = check3
            else vip = '*Role Not set*'
            if (check) official = check4
            else official = '*Role Not set*'

            let description = `**__Reqrole__**\n${reqrole?.id ? `<@&${reqrole.id}>` : '*Role Not set*'}.\n\n**__Girl__**\n${girl?.id ? `<@&${girl.id}>` : '*Role Not set*'}.\n\n**__Guest__**\n${guest?.id ? `<@&${guest.id}>` : '*Role Not set*'}.\n\n**__Vip__**\n${vip?.id ? `<@&${vip.id}>` : '*Role Not set*'}.\n\n**__Official__**\n${official?.id ? `<@&${official.id}>` : '*Role Not set*'}.`

            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setAuthor({
                            name: message.guild.name,
                            iconURL:
                                message.guild.iconURL({ dynamic: true }) ||
                                client.user.displayAvatarURL()
                        })
                        .setFooter({ text: `${client.user.username}` })
                        .setThumbnail(client.user.displayAvatarURL())
                        .setColor(client.color)
                        .setDescription(description)
                ]
            })
        } else {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setAuthor({
                            name: message.guild.name,
                            iconURL:
                                message.guild.iconURL({ dynamic: true }) ||
                                client.user.displayAvatarURL()
                        })
                        .setFooter({ text: `${client.user.username}` })
                        .setColor(client.color)
                        .setDescription(
                            `.\n\`${message.guild.prefix}setup add <name> <role>\`\nSetups a role with the provided name.\n\n\`${message.guild.prefix}setup remove <name>\`\nRemoves a role with the provided name.\n\n\`${message.guild.prefix}setup reqrole <role>\`\nSetups a requirement role.\n\n\`${message.guild.prefix}setup add girl <role>\`\nSetups a role for girls\n\n\`${message.guild.prefix}setup add guest <role>\`\nSetups a role for guests.\n\n\`${message.guild.prefix}setup add vip <role>\`\nSetups a role for vip members.\n\n\`${message.guild.prefix}setup add official <role>\`\nSetups a role for official mebers.\n\n\`${message.guild.prefix}setup list\`\nShows you the list of all custom roles.\n\n\`${message.guild.prefix}setup config\`\nShows you the configuration of custom roles.`
                        )
                ]
            })
        }
    }
}