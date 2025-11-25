const { Message, Client, EmbedBuilder } = require('discord.js')
module.exports = {
    name: 'prefix',
    aliases: ['setprefix'],
    category: 'mod',
    premium: false,

    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */

    run: async (client, message, args) => {
        if (!message.member.permissions.has('Administrator')) {
            return message.channel.send(
                'You must have `Administrator` perms to change the prefix of this server.'
            )
        }
        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                    .setColor(client.color)
                    .setDescription(`You didn't provided the new prefix.`)
                ]
            })
        }
        if (args[1]) {
            const embed = client.util.embed()
                .setDescription('You can not set prefix a double argument')
                .setColor(client.color)
            return message.channel.send({ embeds: [embed] })
        }
        if (args[0].length > 3) {
            const embed = client.util.embed()
                .setDescription(
                    'You can not send prefix more than 3 characters'
                )
                .setColor(client.color)
            return message.channel.send({ embeds: [embed] })
        }
        if (args.join('') === '&') {
            client.db.delete(`prefix_${message.guild.id}`)
            const embed = client.util.embed()
                .setDescription('Reseted Prefix')
                .setColor(client.color)
            return await message.channel.send({ embeds: [embed] })
        }

        await client.db.set(`prefix_${message.guild.id}`, args[0])
        client.util.setPrefix(message, client)
        const embed = client.util.embed()
            .setDescription(`New Prefix For This Server Is ${args[0]}`)
            .setColor(client.color)
            await message.channel.send({ embeds: [embed] })
    }
}
