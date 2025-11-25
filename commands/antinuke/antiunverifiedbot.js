module.exports = {
    name: 'antiunverified',
    aliases: [],
    category: 'security',
    subcommand : ['enable','disable'],
    premium: false,
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

        const prefix = '&' || message.guild.prefix;
        const option = args[0];
        const isActivatedAlready = await client.db.get(`antiunverified_${message.guild.id}`) || null

        const antiunverifiedEmbed = client.util.embed()
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setColor(client.color)
            .setTitle(`__**Anti-Unverified Bot Addition**__`)
            .setDescription(`Enhance your server security with Anti-Unverified Bot Addition! It swiftly removes unverified bots added to your server, protecting your members and data. Enable now for superior protection!`)
            .addFields([
                { name: `__**Enable Anti-Unverified Bot Addition**__`, value: `To Enable, Use - \`${prefix}antiunverified enable\`` },
                { name: `__**Disable Anti-Unverified Bot Addition**__`, value: `To Disable, Use - \`${prefix}antiunverified disable\`` }
            ]);

        if (!option) {
            return message.channel.send({ embeds: [antiunverifiedEmbed] });
        } else if (option === 'enable') {
            if (isActivatedAlready) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setThumbnail(client.user.displayAvatarURL())
                            .setColor(client.color)
                            .setDescription(`**Security Settings For ${message.guild.name} ${protect}\nIt seems your server has already enabled this security feature.\n\nCurrent Status: ${enable}\nTo Disable, use ${prefix}antiunverified disable**`)
                    ]
                });
            }

            await client.db.set(`antiunverified_${message.guild.id}`, true);
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setColor(client.color)
                        .setDescription(`**Security Settings For ${message.guild.name} ${protect}\nSuccessfully enabled this security feature for your server.\n\nCurrent Status: ${enable}\n\nTo Disable, use ${prefix}antiunverified disable**`)
                ]
            });

        } else if (option === 'disable') {
            if (!isActivatedAlready) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setThumbnail(client.user.displayAvatarURL())
                            .setColor(client.color)
                            .setDescription(`**Security Settings For ${message.guild.name} ${protect}\nIt seems your server hasn't enabled this security feature.\n\nCurrent Status: ${disable}\n\nTo Enable, use ${prefix}antiunverified enable**`)
                    ]
                });
            }

            await client.db.delete(`antiunverified_${message.guild.id}`)
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setThumbnail(client.user.displayAvatarURL())
                        .setColor(client.color)
                        .setDescription(`**Security Settings For ${message.guild.name} ${protect}\nSuccessfully disabled this security feature for your server.\n\nCurrent Status: ${disable}\n\nTo Enable, use ${prefix}antiunverified enable**`)
                ]
            });
        } else {
            message.channel.send({ embeds: [antiunverifiedEmbed] });
        }
    }
};
