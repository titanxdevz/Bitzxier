module.exports = {
    name: 'reload',
    aliases: ['rlcmd'],
    category: 'owner',
    run: async (client, message, args) => {
        if (!client.config.owner.includes(message.author.id)) return
        try {
            let reload = false
            for (let i = 0; i < client.categories.length; i += 1) {
                let dir = client.categories[i]
                try {
                    if (!args[0]) {
                        const opp = client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | You didn't provided the command name.`
                            )
                        return message.channel.send({ embeds: [opp] })
                    }
                    delete require.cache[
                        require.resolve(`../../commands/${dir}/${args[0]}.js`)
                    ]
                    client.commands.delete(args[0])
                    const pull = require(`../../commands/${dir}/${args[0]}.js`)
                    client.commands.set(args[0], pull)
                    reload = true
                } catch {}
            }
            if (reload) {
                const op = client.util.embed()
                    .setColor(client.color)
                    .setDescription(
                        `${client.emoji.tick} | Successfully reloaded \`${args[0]}\``
                    )
                return message.channel.send({ embeds: [op] })
            }
            const notop = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `${client.emoji.cross} | I was unable to reload \`${args[0]}\``
                )
            return message.channel.send({ embeds: [notop] })
        } catch (e) {
            const emesdf = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `${client.emoji.cross} | I was unable to reload \`${args[0]}\``
                )
            return message.channel.send({ embeds: [emesdf] })
        }
    }
}