const { EmbedBuilder } = require('discord.js')
const { getSettingsar } = require('../../models/autorole')

module.exports = {
    name: 'autorole',
    aliases: ['ar'],
    category: 'welcomer',
    premium: false,
    subcommand: ['humans add','humans remove','humans reset','humans list','bots add','bots remove','bots reset','bots list'],
    run: async (client, message, args) => {
    /*    if (message.guild.memberCount < 50) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | Your Server Must Have More Than 50 Members TO Run This Command!!`
                        )
                ]
            })
        }*/
        const settings = await getSettingsar(message.guild)
        if (!message.member.permissions.has('Administrator')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `You must have \`Administrator\` perms to run this command.`
                        )
                ]
            })
        }
        let isown = message.author.id == message.guild.ownerId
        if (!isown && !client.util.hasHigher(message.member)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have a higher role than me to use this command.`
                        )
                ]
            })
        }

        const err = client.util.embed()
            .setColor(client.color)
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(message.guild.iconURL({ dynamic: true }))
            .addFields([
                { name: `\`autorole humans\``, value: `**Manage autorole for human users.**` },
                {
                    name: `\`autorole humans add <role>\``,
                    value: `**Adds the provided role to the autorole configuration for human users.**`
                },
                {
                    name: `\`autorole humans remove <role>\``,
                    value: `**Removes the provided role from the autorole configuration for human users.**`
                },
                {
                    name: `\`autorole humans list\``,
                    value: `**Shows the autoroles configuration for human users.**`
                },
                {
                    name: `\`autorole humans reset\``,
                    value: `**Resets the autorole configuration for human users.**`
                },
                { name: `\`autorole bots\``, value: `**Manage autorole for bots.**` },
                {
                    name: `\`autorole bots add <role>\``,
                    value: `**Adds the provided role to the autorole configuration for bots.**`
                },
                {
                    name: `\`autorole bots remove <role>\``,
                    value: `**Removes the provided role from the autorole configuration for bots.**`
                },
                {
                    name: `\`autorole bots list\``,
                    value: `**Shows the autoroles configuration for bots.**`
                },
                {
                    name: `\`autorole bots reset\``,
                    value: `**Resets the autorole configuration for bots.**`
                }
            ])
            .setFooter({
                text: `Note: At the time of providing Auto-Role when someone joins the server, I'll ignore the roles which have Administration Perms.`,
                iconURL: client.user.displayAvatarURL()
            })

        const option = args[0]
        const type = args[1]

        if (!option || !['humans','human','bots','bot'].includes(option.toLowerCase())) {
            return message.channel.send({ embeds: [err] })
        }

        if (!type || !['add', 'remove', 'reset', 'list'].includes(type.toLowerCase())) {
            return message.channel.send({ embeds: [err] })
        }

        let response
        const roleType = option.toLowerCase() === 'humans' ? 'autorole' : 'autorolebot'
        const action = type.toLowerCase()

        if (action === 'reset') {
            response = await addAutoRole(message, null, roleType)
        } else if (action === 'add') {
            let input = args.slice(2).join(' ')
            const roles = findMatchingRoles(message.guild, input)
            if (roles.length === 0)
                response = 'No matching roles found matching your query'
            else {
                response = await addAutoRole(message, roles[0], roleType)
            }
        } else if (action === 'remove') {
            let input = args.slice(2).join(' ')
            const roles = findMatchingRoles(message.guild, input)
            if (roles.length === 0)
                response = 'No matching roles found matching your query'
            else response = await removeAutoRole(message, roles[0], roleType)
        } else if (action === 'list') {
            response = await listAutoRole(message, roleType)
        } else return message.channel.send({ embeds: [err] })

        await message.channel.send({
            embeds: [
                client.util.embed()
                    .setDescription(response)
                    .setColor(client.color)
            ]
        })
    }
}

async function addAutoRole({ guild, client }, role, type) {
    const settings = await getSettingsar(guild)
    const roleType = type
    if (role) {
        if (!guild.members.me.permissions.has('ManageRoles'))
            return `${client.emoji.cross} | I don't have the \`ManageRoles\` permission`
        if (guild.members.me.roles.highest.position < role.position)
            return `${client.emoji.cross} | I don't have the permissions to assign this role`
        if (role.managed)
            return `${client.emoji.cross} | This role is managed by an integration.`
    }
    if (!role) {
        settings[roleType] = []
        await settings.save()
        return `${client.emoji.tick} | ${type.charAt(0).toUpperCase() + type.slice(1)} autorole module was successfully disabled.`
    }
    if (settings[roleType].includes(role.id))
        return `${client.emoji.cross} | This role is already present in the ${type} autorole config.`
    const maxRoles = roleType === 'autorole' ? 10 : 3
    if (settings[roleType].length === maxRoles)
        return `${client.emoji.cross} | Maximum 3 roles can be set for ${type} Auto Roles.`
    else settings[roleType].push(role.id)
    await settings.save()
    return `${client.emoji.tick} | Successfully **added** <@&${role.id}> to ${type} Autorole Config.`
}

async function removeAutoRole({ guild, client }, role, type) {
    const settings = await getSettingsar(guild)
    const roleType = type
    if (role) {
        if (!guild.members.me.permissions.has('ManageRoles'))
            return `${client.emoji.cross} | I don't have the \`ManageRoles\` permission`
    }
    if (!settings[roleType].includes(role.id))
        return `${client.emoji.cross} | This role is not present in the ${type} autorole config.`
    if (settings[roleType].length === 0)
        return `${client.emoji.cross} | There are no ${type} Autoroles in my config.`
    else settings[roleType] = settings[roleType].filter((r) => r !== role.id)
    await settings.save()
    return `${client.emoji.tick} | Successfully **removed** <@&${role.id}> from ${type} Autorole Config.`
}

async function listAutoRole({ guild, client }, type) {
    const settings = await getSettingsar(guild)
    const roleType = type
    if (settings[roleType].length === 0)
        return `There are no ${type} Autoroles available for this server.`
    let roles = settings[roleType]
        .map((role) => `${client.emoji.dot} <@&${role}> (${role})`)
        .join('\n')
    roles =
        `**Auto-=Role list for ${guild.name} - ${settings[roleType].length}\n\n` +
        roles +
        `**`
    return roles
}

function findMatchingRoles(guild, query) {
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
