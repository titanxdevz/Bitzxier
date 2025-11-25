const { MessageEmbed, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const moment = require('moment');
const os = require('os');

module.exports = {
    name: 'stats',
    category: 'info',
    aliases: ['botinfo', 'bi'],
    usage: 'stats',
    premium: false,

    run: async (client, message, args) => {
        try {
        const row1 = client.cmd.prepare('SELECT count FROM total_command_count WHERE id = 1').get();
const totalCount = row1 ? row1.count : 0; // Fallback to 0 if row is undefined
        // Buttons for various information
        let button = new ButtonBuilder()
            .setLabel('Team Info')
            .setCustomId('team')
            .setStyle(ButtonStyle.Success);

        let button1 = new ButtonBuilder()
            .setLabel('General Info')
            .setCustomId('general')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

        let button2 = new ButtonBuilder()
            .setLabel('System Info')
            .setCustomId('system')
            .setStyle(ButtonStyle.Danger);

        let button3 = new ButtonBuilder()
            .setLabel('Partners')
            .setCustomId('partners')
            .setStyle(ButtonStyle.Secondary);

        // New button for the graph
        let buttonGraph = new ButtonBuilder()
            .setLabel('Latency Graph')
            .setCustomId('latencyGraph')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents([button, button1, button2, button3, buttonGraph]);

        const uptime = Math.round(Date.now() - client.uptime);
        let guilds1 = client.guilds.cache.size;
        let member1 = client.guilds.cache.reduce((x, y) => x + y.memberCount, 0);

        const embed = client.util.embed()
            .setColor(client.color)
            .setTitle(`These statistics are only for cluster ${client.cluster.id} not for the entire bot.`)
            .setURL('https://discord.gg/zMxCnc29Zm')
            .setAuthor({
                name: client.users.cache.get('1383706658315960330').globalName,
                iconURL: client.guilds.cache.get('1363482845749842080')?.members?.cache?.get('1383706658315960330')?.user?.displayAvatarURL({ dynamic: true })
            })
            .setDescription(
                `**__General Informations__**\nBot's Mention: <@!${client.user.id}>\nBot's Tag: ${client.user.tag}\nCluster: ${client.cluster.id}\nShard: ${message.guild.shardId}\nBot's Version: 4.0.0\nTotal Servers: ${guilds1}\nTotal Users: ${member1} (${client.users.cache.size} Cached)\nTotal Channels: ${client.channels.cache.size}\nLast Rebooted: ${moment(uptime).fromNow()}\nCommands Executed : ${totalCount}`
            )
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter({
                text: `Requested By ${message.author.tag}`,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            });

        let msg = await message.channel.send({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            filter: (i) => i.user && i.isButton(),
            time: 60000
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({
                    content: "> This isn't for you.",
                    ephemeral: true
                });
            }

            if (i.isButton()) {
                if (i.customId == 'latencyGraph') {
                    i.deferUpdate();
                    let db = await client.db.ping()
                    const uri = await client.util.generateLatencyChart(client.ws.ping, db);
                    const graphEmbed = client.util.embed().setColor(client.color).setDescription('This graph represents the latency between the bot and the database, alongside the WebSocket ping. A lower value indicates better performance.').setFooter({
                        text: `Requested by ${message.author.tag} | Latency Overview`,
                        iconURL: message.author.displayAvatarURL({ dynamic: true }),
                    })
                    .setImage(uri); // Use the chart URL as the image for the embed
                    button = button.setDisabled(false);
                    button1 = button1.setDisabled(false);
                    button2 = button2.setDisabled(false);
                    button3 = button3.setDisabled(false);
                    buttonGraph = buttonGraph.setDisabled(true); // Disable the graph button after timeout
                    const row1 = new ActionRowBuilder().addComponents([button, button1, button2, button3, buttonGraph]);

                    if (msg) return msg.edit({ embeds: [graphEmbed], components: [row1] });
                }

                // Handle Partners button
                if (i.customId == 'partners') {
                    i.deferUpdate();

                    const em = client.util.embed()
                        .setColor(client.color)
                        .setAuthor({
                            name: "BITZXIER Partner's",
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setDescription(
                            `VexaNode was born in 2025 with the idea of providing the latest generation products to customers. We provide **Virtual Private Servers**, **Panels**, Virtual Dedicated Servers, and Dedicated Servers [click here to see website](https://VexaNode.cloud/)\n[discord server](https://discord.gg/tDsyReUVJc)`
                        )
                        .setFooter({
                            text: `© Powered By VexaNode`,
                            iconURL: 'https://images-ext-1.discordapp.net/external/3hFrTBehcBVk_7mVipmQ8orghcR9-jLFMgtcrWtmrco/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1339234787654766593/46731a4ce9d490314f0de63a3fbcb14e.png?format=webp&quality=lossless'
                        })
                        .setImage('https://images-ext-1.discordapp.net/external/3hFrTBehcBVk_7mVipmQ8orghcR9-jLFMgtcrWtmrco/%3Fsize%3D1024/https/cdn.discordapp.com/icons/1339234787654766593/46731a4ce9d490314f0de63a3fbcb14e.png?format=webp&quality=lossless');

                    button = button.setDisabled(false);
                    button1 = button1.setDisabled(false);
                    button2 = button2.setDisabled(false);
                    button3 = button3.setDisabled(true);
                    buttonGraph = buttonGraph.setDisabled(false); // Disable the graph button after timeout
                    const row1 = new ActionRowBuilder().addComponents([button, button1, button2, button3, buttonGraph]);

                    if (msg) return msg.edit({ embeds: [em], components: [row1] });
                }

                // Handle Team button
                if (i.customId == 'team') {
                    i.deferUpdate();

                    let dev = [], cteam = [], supp = [], supe = [];
                    let user = await client.users.fetch('1383706658315960330'); //Ansh
                    dev.push(`[${user.username}](https://discord.com/users/1383706658315960330)`);

                    const em = client.util.embed()
                        .setColor(client.color)
                        .setAuthor({ name: `${client.user.username} 's Information`,iconURL: client.user.displayAvatarURL()})
                        .setThumbnail(message.guild.iconURL({ dynamic: true }))
                        .addFields([
                            { name: `**__Developers__**`, value: dev.join(', ') }
                        ])
                        .setFooter({
                            text: `Requested By ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({ dynamic: true })
                        })
                        .setThumbnail(client.user.displayAvatarURL());

                    button = button.setDisabled(true);
                    button1 = button1.setDisabled(false);
                    button2 = button2.setDisabled(false);
                    button3 = button3.setDisabled(false);
                    buttonGraph = buttonGraph.setDisabled(false); // Disable the graph button after timeout
                    const row1 = new ActionRowBuilder().addComponents([button, button1, button2, button3, buttonGraph]);

                    if (msg) return msg.edit({ embeds: [em], components: [row1] });
                }

                // Handle General Info button
                if (i.customId == 'general') {
                    i.deferUpdate();

                    let member1 = client.guilds.cache.reduce((x, y) => x + y.memberCount, 0) || 0;
                    let guilds = client.guilds.cache.size;

                    const embed = client.util.embed()
                        .setColor(client.color)
                        .setTitle(`These statistics are only for cluster ${client.cluster.id} not for the entire bot.`)
                        .setURL('https://discord.gg/zMxCnc29Zm')
                        .setAuthor({
                            name: client.users.cache.get('1383706658315960330').globalName,
                            iconURL: client.guilds.cache.get('1363482845749842080')?.members?.cache?.get('1383706658315960330')?.user?.displayAvatarURL({ dynamic: true })
                        })
                        .setDescription(
                            `**__General Informations__**\nBot's Mention: <@!${client.user.id}>\nBot's Tag: ${client.user.tag}\nCluster: ${client.cluster.id}\nShard: ${message.guild.shardId}\nBot's Version: 4.0.0\nTotal Servers: ${guilds}\nTotal Users: ${member1} (${client.users.cache.size} Cached)\nTotal Channels: ${client.channels.cache.size}\nLast Rebooted: ${moment(uptime).fromNow()}\nCommands Executed : ${totalCount}`
                        )
                        .setThumbnail(client.user.displayAvatarURL())
                        .setFooter({
                            text: `Requested By ${message.author.tag}`,
                            iconURL: message.author.displayAvatarURL({ dynamic: true })
                        });

                    button = button.setDisabled(false);
                    button1 = button1.setDisabled(true);
                    button2 = button2.setDisabled(false);
                    button3 = button3.setDisabled(false);
                    buttonGraph = buttonGraph.setDisabled(false); // Disable the graph button after timeout
                    const row1 = new ActionRowBuilder().addComponents([button, button1, button2, button3, buttonGraph]);

                    if (msg) return msg.edit({ embeds: [embed], components: [row1] });
                }
                if (i.customId == 'system') {
                    button = button.setDisabled(false);
                    button1 = button1.setDisabled(false);
                    button2 = button2.setDisabled(true);
                    button3 = button3.setDisabled(false);
                    buttonGraph = buttonGraph.setDisabled(false); // Disable the graph button after timeout
                    i.deferUpdate()
                    if (msg)
                        msg.edit({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setAuthor({
                                        name: 'BITZXIER Informations',
                                        iconURL: client.guilds.cache
                                            .get('1363482845749842080')
                                            ?.members?.cache?.get(
                                                '1383706658315960330'
                                            )
                                            ?.user?.displayAvatarURL({
                                                dynamic: true
                                            })
                                    })
                                    .setFooter({
                                        text: `Requested By ${message.author.tag}`,
                                        iconURL:
                                            message.author.displayAvatarURL({
                                                dynamic: true
                                            })
                                    })
                                    .setDescription(
                                        '<:bitzxier_mainrole:1181290802022977576> | **Fetching** all the **resources**...'
                                    )
                            ],
                            components: [row]
                        })
                    const totalMemoryBytes = os.totalmem()
                    const cpuCount = os.cpus().length
                    const freeMemoryBytes = os.freemem()
                    const memoryUsageBytes = totalMemoryBytes - freeMemoryBytes

                    let totalMemoryGB = totalMemoryBytes / (1024 * 1024 * 1024)
                    let memoryUsageGB = memoryUsageBytes / (1024 * 1024 * 1024)

                    if (
                        totalMemoryGB >=
                        totalMemoryBytes / (1024 * 1024 * 1024)
                    )
                        totalMemoryGB = totalMemoryGB.toFixed(2) + ' GB'
                    else
                        totalMemoryGB =
                            (totalMemoryBytes / (1024 * 1024)).toFixed(2) +
                            ' MB'

                    if (
                        memoryUsageGB >=
                        memoryUsageBytes / (1024 * 1024 * 1024)
                    )
                        memoryUsageGB = memoryUsageGB.toFixed(2) + ' GB'
                    else
                        memoryUsageGB =
                            memoryUsageBytes / (1024 * 1024).toFixed(2) + ' MB'

                    const processors = os.cpus()

                    const cpuUsage1 = os.cpus()[0].times
                    const startUsage1 =
                        cpuUsage1.user +
                        cpuUsage1.nice +
                        cpuUsage1.sys +
                        cpuUsage1.irq
                    let cpuUsage2
                    setTimeout(async () => {
                        cpuUsage2 = os.cpus()[0].times
                        const endUsage1 =
                            cpuUsage2?.user +
                            cpuUsage2?.nice +
                            cpuUsage2?.sys +
                            cpuUsage2?.irq

                        const totalUsage = endUsage1 - startUsage1

                        let idleUsage = 0
                        let totalIdle = 0

                        for (let i = 0; i < cpuCount; i++) {
                            const cpuUsage = os.cpus()[i].times
                            totalIdle += cpuUsage.idle
                        }

                        idleUsage =
                            totalIdle - (cpuUsage2.idle - cpuUsage1.idle)
                        const cpuUsagePercentage =
                            (totalUsage / (totalUsage + idleUsage)) * 100
                        const startTime = process.cpuUsage()
                        const endTime = process.cpuUsage()
                        const usedTime =
                            endTime.user -
                            startTime.user +
                            endTime.system -
                            startTime.system
                        const ping = await client?.db?.ping()
                        const embed1 = client.util.embed()
                            .setColor(client.color)
                            .setAuthor({
                                name: 'BITZXIER Informations',
                                iconURL: client.guilds.cache
                                    .get('1363482845749842080')
                                    ?.members?.cache?.get('1383706658315960330')
                                    ?.user?.displayAvatarURL({ dynamic: true })
                            })
                            .setDescription(
                                `**__System Informations__**\nSystem Latency: ${
                                    client.ws.ping
                                }ms\nPlatform: ${
                                    process.platform
                                }\nArchitecture: ${
                                    process.arch
                                }\nMemory Usage: ${memoryUsageGB}/${totalMemoryGB}\nProcessor 1:\n Model: ${
                                    processors[0].model
                                }\n Speed: ${
                                    processors[0].speed
                                } MHz\nTimes:\n User: ${
                                    cpuUsage2.user
                                } ms\n Sys: ${
                                    cpuUsage2.sys
                                } ms\n Idle: ${cpuUsage2.idle} ms\n IRQ: ${
                                    cpuUsage2.irq
                                } ms\nDatabase Latency: ${
                                    ping?.toFixed(2) || '0'
                                }ms`
                            )
                            .setThumbnail(client.user.displayAvatarURL())
                            .setFooter({
                                text: `Requested By ${message.author.tag}`,
                                iconURL: message.author.displayAvatarURL({
                                    dynamic: true
                                })
                            })
                        button = button.setDisabled(false)
                        button1 = button1.setDisabled(false)
                        button2 = button2.setDisabled(true)
                        button3 = button3.setDisabled(false)
                        buttonGraph = buttonGraph.setDisabled(false)
                        const row1 = new ActionRowBuilder().addComponents([
                            button,
                            button1,
                            button2,
                            button3,
                            buttonGraph
                        ])
                        if (msg)
                            return msg.edit(
                                { embeds: [embed1], components: [row1] },
                                message,
                                msg
                            )
                    }, 2000)
                }
            }
        });

        collector.on('end', () => {
            if (msg) {
                button = button.setDisabled(true);
                button1 = button1.setDisabled(true);
                button2 = button2.setDisabled(true);
                button3 = button3.setDisabled(true); // Disable all buttons after timeout
                buttonGraph = buttonGraph.setDisabled(true); // Disable the graph button after timeout
                const row1 = new ActionRowBuilder().addComponents([button, button1, button2, button3, buttonGraph]);
                return msg.edit({ components: [row1] });
            }
        });
    }catch (e) {
        console.log(e)
    }
}
};
