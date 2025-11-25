const { EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'roleinfo',
    aliases: ['ri'],
    category: 'info',
    description: 'To Get Information About A Role',
    premium: false,
    run: async (client, message, args) => {
        let role =
            await message.mentions.roles.first() ||
          await message.guild.roles.fetch(args[0])
        if (!role) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You didn't provided a valid role.`
                        )
                ]
            })
        }
        let size = await message.guild.members.fetch().then(members => members.filter(member => member.roles.cache.has(role.id))).then(x=>x.size)
        let color = role.color == 0 ? '#000000' : role.color
        let created = `<t:${Math.round(role.createdTimestamp / 1000)}:R>`
        const embed = client.util.embed()
            .setAuthor({
                name: `${role.name}'s Information`,
                iconURL: client.user.displayAvatarURL()
            })
            .addFields([
                {
                    name: `General Info`,
                    value: `Role Name: **${role.name}**\nRole Id: \`${role.id}\`\nRole Position: **${role.rawPosition}**\nHex Code: \`${color}\`\nCreated At: ${created}\nMentionability: ${role.mentionable}\nIntegration: ${role.managed}`
                },
                {
                    name: `Allowed Permissions`,
                    value: `${
                        role.permissions.toArray().includes('Administrator')
                            ? '`Administrator`'
                            : role.permissions
                                  .toArray()
                                  .sort((a, b) => a.localeCompare(b))
                                  .map((p) => `\`${p}\``)
                                  .join(', ')
                    }`
                },
                {
                    name : `Role Members`,
                    value : `\`${size}\``
                }
            ])
            .setColor(color == '#000000' ? '000001' : client.color)
        message.channel.send({ embeds: [embed] })
    }
}
