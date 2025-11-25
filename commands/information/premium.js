const {
    EmbedBuilder,
    version,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js')
this.config = require(`${process.cwd()}/config.json`)
module.exports = {
    name: 'premium',
    aliases: ['prime'],
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        const prefix = '&'  || message.guild.prefix
        const embed = client.util.embed()
            .setColor(client.color)
            .setFooter({ text : `Developed with 💖 By Bitzxier Team`})
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Premium')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/zMxCnc29Zm')
        )
        let link = 'https://discord.gg/zMxCnc29Zm'
        if (!args[0]) {
            embed.setAuthor({ name : `${client.user.username} Premium`,
               iconURL : client.user.displayAvatarURL(),
                })
            embed.setThumbnail(message.guild.iconURL({ dynamic: true }))
            embed.addFields([
                { name: 'Upgrade Server', value: `If you are a subscriber, you can upgrade this server by typing \`${prefix}premium activate\``, inline: false },
                { name: 'Downgrade Server', value: `If you have activated [Premium](${link}) here then you can downgrade [Premium](${link}) from this server by typing \`${prefix}premium revoke\``, inline: false },
                { name: 'Check Server Premium Status', value: `To check the [Premium](${link}) status of this server just type \`${prefix}premium validity\``, inline: false },
                { name: 'Check Your Premium Status', value: `To check your [Premium](${link}) status just type \`${prefix}premium stats\``, inline: false },
                { name: 'Activate Noprefix', value: `To activate your [Premium](${link}) noprefix just type \`${prefix}premium noprefix\``, inline: false },
                { name: 'Get Premium', value: `[Click here](${link}) to Get **[Premium](${link})**`, inline: false }
            ]);
            return message.reply({ embeds: [embed], components: [row] })
        }
        const isprem = await client.db.get(`uprem_${message.author.id}`)
        let type = args[0].toLowerCase()

        let own = await client.db.get(`spremown_${message.guild.id}`)

        let servers = (await client.db.get(`upremserver_${message.author.id}`))
            ? await client.db.get(`upremserver_${message.author.id}`)
            : []

        let isp = await client.db.get(`sprem_${message.guild.id}`)

        let time = await client.db.get(`upremend_${message.author.id}`)

        let count = (await client.db.get(`upremcount_${message.author.id}`))
            ? await client.db.get(`upremcount_${message.author.id}`)
            : 0

        switch (type) {
            case `activate`:
                if (!isprem)
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `You don't have any type of premium subscription. Click [here](${link}) to [Purchase](${link}).`
                            )
                        ],
                        components: [row]
                    })
                if (count < 1)
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `You have \`0\` Premium Count remaining. Click [here](${link}) to [Purchase](${link}).`
                            )
                        ],
                        components: [row]
                    })
                if (isp === `true`)
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `This server's [Premium](${link}) has already been activated by <@${own}>.`
                            )
                        ]
                    })
                if (count > 0) {
                    await client.db.set(`sprem_${message.guild.id}`, `true`)
                    await client.db.set(`spremend_${message.guild.id}`, time)
                    await client.db.set(
                        `spremown_${message.guild.id}`,
                        `${message.author.id}`
                    )
                    await client.db.set(
                        `upremcount_${message.author.id}`,
                        count - 1
                    )
                    servers.push(`${message.guild.id}`)
                    client.db.set(`upremserver_${message.author.id}`, servers)
                    await message.guild.members.me.setNickname("Bitzxier Prime").catch((err) => {})
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `This server has been added as a [Premium](${link}) Server.\n[Premium](${link}) valid till: <t:${Math.round(
                                    (await client.db.get(
                                        `spremend_${message.guild.id}`
                                    )) / 1000
                                )}> (<t:${Math.round(
                                    (await client.db.get(
                                        `spremend_${message.guild.id}`
                                    )) / 1000
                                )}:R>)`
                            )
                        ]
                    })
                    
                }
                break

            case `revoke`:
                if (!isprem)
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `You have \`0\` Premium Count remaining. Click [here](${link}) to [Purchase](${link}).`
                            )
                        ],
                        components: [row]
                    })

                if (!isp)
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `This server haven't any type of premium subscription! If you are a subscriber, you can **upgrade** this server by typing \`${prefix}premium activate\`\nClick [here](${link}) to [Purchase](${link}).`
                            )
                        ],
                        components: [row]
                    })

                if (own !== message.author.id)
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `You haven't activated the [Premium](${link}) on this Server to revoke it.`
                            )
                        ]
                    })
                await client.db.delete(`sprem_${message.guild.id}`)
                await client.db.delete(`spremend_${message.guild.id}`)
                await client.db.delete(`spremown_${message.guild.id}`)
                await client.db.set(
                    `upremcount_${message.author.id}`,
                    count + 1
                )
                servers = servers.filter((srv) => srv != `${message.guild.id}`)
                await client.db.set(`upremserver_${message.author.id}`, servers)
                await message.guild.members.me.setNickname(null).catch((err) => {})
                return message.reply({
                    embeds: [
                        embed.setDescription(
                            `You have successfully **revoked** the [Premium](${link}) from this server.`
                        )
                    ]
                })
                break

            case `validity`:
                if (!isp)
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `This server haven't any type of premium subscription! If you are a subscriber, you can **upgrade** this server by typing \`${prefix}premium activate\`\nClick [here](${link}) to [Purchase](${link}).`
                            )
                        ],
                        components: [row]
                    })
                return message.reply({
                    embeds: [
                        embed.setDescription(
                            `**Premium: \`Active\`\nPremium Activator: <@${own}>\nPremium Ends: <t:${Math.round(
                                (await client.db.get(
                                    `spremend_${message.guild.id}`
                                )) / 1000
                            )}> (<t:${Math.round(
                                (await client.db.get(
                                    `spremend_${message.guild.id}`
                                )) / 1000
                            )}:R>)**`
                        )
                    ]
                })
                break

            case `stats`:
                if (!isprem)
                    return message.reply({
                        embeds: [
                            embed.setDescription(
                                `You have \`0\` Premium Count remaining. Click [here](${link}) to [Purchase](${link}).`
                            )
                        ],
                        components: [row]
                    })
                let info = ''
                let ss
                if (servers.length < 1) info = `No Servers`
                else {
                    for (let i = 0; i < servers.length; i++) {
                        try {
                            ss = await client.guilds.fetch(`${servers[i]}`);
                            info = info + `${i + 1} - ${ss.name} (${servers[i]})\n`;
                        } catch (error) {
                            info = info + `${i + 1} - Unknown Server (${servers[i]})\n`;
                        }
                    }
                    
                }
                return message.reply({
                    embeds: [
                        embed
                            .setDescription(
                                `**Premium Count: \`${count}\`\nPremium Ends: <t:${Math.round(
                                    time / 1000
                                )}> (<t:${Math.round(time / 1000)}:R>)**`
                            )
                            .addFields({
                               name : `**Servers where you activated Premium**`,
                               value : `\`\`\`nim\n${info}\`\`\``
                })
                    ]
                })
                case  `noprefix`:
                    if (!isprem)
                        return message.reply({
                            embeds: [
                                embed.setDescription(
                                    `You don't have any type of premium subscription. Click [here](${link}) to [Purchase](${link}).`
                                )
                            ],
                            components: [row]
                        })
                        let data = await client.db.get(`noprefix_${client.user.id}`)
                        if(!data.includes(message.author.id)) {
                        await client.db.push(`noprefix_${client.user.id}`,message.author.id)
                        return message.reply({
                            embeds: [
                                embed.setDescription(
                                    `${client.emoji.tick} Your Premium Noprefix Is Sucessfully Activated`
                                )
                            ]
                            }) 
                        } else {
                            return message.reply({
                                embeds: [
                                    embed.setDescription(
                                        `${client.emoji.cross} Your Already Having Noprefix Perk's`
                                    )
                                ]
                                }) 
                        }




            default:
                embed.setAuthor({
                   name : `${client.user.username} Premium`,
                  value :  client.user.displayAvatarURL()        });
                
                embed.setThumbnail(message.guild.iconURL({ dynamic: true }));
                
                embed.addFields([
                    { name: 'Upgrade Server', value: `If you are a subscriber, you can upgrade this server by typing \`${prefix}premium activate\``, inline: false },
                    { name: 'Downgrade Server', value: `If you have activated [Premium](${link}) here then you can downgrade [Premium](${link}) from this server by typing \`${prefix}premium revoke\``, inline: false },
                    { name: 'Check Server Premium Status', value: `To check the [Premium](${link}) status of this server just type \`${prefix}premium validity\``, inline: false },
                    { name: 'Check Your Premium Status', value: `To check your [Premium](${link}) status just type \`${prefix}premium stats\``, inline: false },
                    { name: 'Activate Noprefix', value: `To activate your [Premium](${link}) noprefix just type \`${prefix}premium noprefix\``, inline: false },
                    { name: 'Get Premium', value: `[Click here](${link}) to Get **[Premium](${link})**`, inline: false }
                ]);
                return message.reply({ embeds: [embed], components: [row] });
        }
    }
}
