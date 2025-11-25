const { Message, Client, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'modrole',
    aliases: ['moderatorrole'],
    category: 'mod',
    subcommand : ['set','view','reset'],
    premium: false,
    run: async (client, message, args) => {
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
                            `${client.emoji.cross} | Only Server Owner Or Extra Owner Can Run This Command.!`
                        )
                ]
            })
        }
        if (
            !own &&
            !(
                message.guild.members.cache.get(client.user.id).roles.highest
                    .position <= message.member.roles.highest.position
            )
        ) {
            const higherole = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `${client.emoji.cross} | Only Server Owner Or Extra Owner Having Higher Role Than Me Can Run This Command`
                )
            return message.channel.send({ embeds: [higherole] })
        }

        const option = args[0]?.toLowerCase()

        const antinuke = client.util.embed()
            .setThumbnail(client.user.avatarURL({ forceStatic: false }))
            .setColor(client.color)
            .setTitle(`Modrole`)
            .setDescription(
                `assigning this role as the moderator role, members will gain access to a suite of powerful moderation commands:
        
                \u2022 **Mute**: Temporarily or permanently mute disruptive members.
                \u2022 **Unmute**: Restore voice permissions to previously muted members.
                \u2022 **Purge**: Quickly delete a specified number of messages to keep the chat clean.
                \u2022 **Nick**: Change the nicknames of server members for better organization.
                
                **Important**: Only assign this role to members you trust completely, as they will have significant control over the server's moderation capabilities. Use these permissions responsibly to maintain a safe and friendly community.`
            )
            .addFields([
                {
                    name: `__**Modrole Set**__`,
                    value: `To Set Modrole, Use - \`${message.guild.prefix}modrole set @role\``
                },
                {
                    name: `__**Modrole Reset**__`,
                    value: `To Reset Modrole, Use - \`${message.guild.prefix}modrole reset\``
                },
                {
                    name: `__**Modrole View**__`,
                    value: `To View Modrole, Use - \`${message.guild.prefix}modrole view\``
                }
            ])

        if (!option) {
            return message.channel.send({ embeds: [antinuke] })
        } else if (option === 'set') {
            let role =
                getRoleFromMention(message, args[1]) ||
                message.guild.roles.cache.get(args[1])
            if (!role) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setTitle('Invalid Role')
                            .setDescription(`${client.emoji.cross} | Please provide a valid role to set up the mod role.`)
                            .setFooter({ text: 'Moderation Setup', iconURL: message.guild.iconURL() })
                            .setTimestamp()
                    ]
                })
            } else if (role.managed) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setTitle('Invalid Role')
                            .setDescription(`${client.emoji.cross} | ${role} is managed by integration.`)
                            .setFooter({ text: 'Moderation Setup', iconURL: message.guild.iconURL() })
                            .setTimestamp()
                    ]
                })
            } else {
                await client.db.set(`modrole_${message.guild.id}`, role.id)
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setTitle('Role Set Successfully')
                            .setDescription(`${client.emoji.tick} | The moderator role has been set up successfully.`)
                            .addFields({ 
                                name: "Command Permissions", 
                                value: `assigning this role as the moderator role, members will gain access to a suite of powerful moderation commands:
                                
                                \u2022 **Mute**: Temporarily or permanently mute disruptive members.
                                \u2022 **Unmute**: Restore voice permissions to previously muted members.
                                \u2022 **Purge**: Quickly delete a specified number of messages to keep the chat clean.
                                \u2022 **Nick**: Change the nicknames of server members for better organization.
                                
                                **Important**: Only assign this role to members you trust completely, as they will have significant control over the server's moderation capabilities. Use these permissions responsibly to maintain a safe and friendly community.`
                            })
                            .setFooter({ text: 'Moderation Setup', iconURL: message.guild.iconURL() })
                            .setTimestamp()
                    ]
                })
                
            }
        } else if (option === 'reset') {
            const data = await client.db.get(`modrole_${message.guild.id}`)
            if (!data) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | There is no modrole configuration in this server.`
                            )
                    ]
                })
            } else {
                await client.db.delete(`modrole_${message.guild.id}`)
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | Successfully disabled modrole configuration.`
                            )
                    ]
                })
            }
        } else if (option === 'view') {
            const data = await client.db.get(`modrole_${message.guild.id}`)
            if (!data) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | No Modrole is set.`
                            )
                    ]
                })
            } else {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`Current Modrole is <@&${data}>`)
                    ]
                })
            }
        } else {
            return message.channel.send({ embeds: [antinuke] })
        }
    }
}

function getRoleFromMention(message, mention) {
    if (!mention) return null

    const matches = mention.match(/^<@&(\d+)>$/)
    if (!matches) return null

    const roleId = matches[1]
    return message.guild.roles.cache.get(roleId)
}
