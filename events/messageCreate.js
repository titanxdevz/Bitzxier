const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    PermissionsBitField,
    Collection,
    WebhookClient,
    ButtonStyle
} = require('discord.js')
const config = require(`${process.cwd()}/config.json`)
const mediaConfigCache = new Map();
const mcooldown = new Set()
module.exports = async (client) => {
    client.on('messageCreate', async (message) => {
        if (message.author.bot || !message.guild) return
        try {
            if(await client.util.BlacklistCheck(message?.guild)) return
            
            let uprem = await client.db.get(`uprem_${message.author.id}`)

            let upremend = await client.db.get(`upremend_${message.author.id}`)
            //user premiums scopes ^^

            let sprem = await client.db.get(`sprem_${message.guild.id}`)

            let spremend = await client.db.get(`spremend_${message.guild.id}`)

            //server premium scopes ^^
            let scot = 0
            let slink = 'https://discord.gg/zMxCnc29Zm'
            if (upremend && Date.now() >= upremend) {
                let upremcount = (await client.db.get(
                    `upremcount_${message.author.id}`
                ))
                    ? await client.db.get(`upremcount_${message.author.id}`)
                    : 0

                let upremserver = (await client.db.get(
                    `upremserver_${message.author.id}`
                ))
                    ? await client.db.get(`upremserver_${message.author.id}`)
                    : []

                let spremown = await client.db.get(
                    `spremown_${message.guild.id}`
                )

                await client.db.delete(`upremcount_${message.author.id}`)
                await client.db.delete(`uprem_${message.author.id}`)
                await client.db.delete(`upremend_${message.author.id}`)
                await client.db.pull(`noprefix_${client.user.id}`,message.author.id)
                if (upremserver.length > 0) {
                    for (let i = 0; i < upremserver.length; i++) {
                        scot += 1
                        await client.db.delete(`sprem_${upremserver[i]}`)
                        await client.db.delete(`spremend_${upremserver[i]}`)
                        await client.db.delete(`spremown_${upremserver[i]}`)
                    }
                }
                await client.db.delete(`upremserver_${message.author.id}`)
                message.author
                    .send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `Your Premium Has Got Expired.\nTotal **\`${scot}\`** Servers [Premium](https://discord.gg/zMxCnc29Zm) was removed.\nClick [here](https://discord.gg/zMxCnc29Zm) To Buy [Premium](https://discord.gg/zMxCnc29Zm).`
                                )
                        ],
                        components: [premrow]
                    })
                    .catch((err) => { })
            }

            if (spremend && Date.now() >= spremend) {
                let scount = 0

                let us = await client.db.get(`spremown_${message.guild.id}`)

                let upremserver = (await client.db.get(`upremserver_${us}`))
                    ? await client.db.get(`upremserver_${us}`)
                    : []

                let upremcount = (await client.db.get(`upremcount_${us}`))
                    ? await client.db.get(`upremcount_${us}`)
                    : 0

                let spremown = await client.db
                    .get(`spremown_${message.guild.id}`)
                    .then((r) => client.db.get(`upremend_${r}`))

                await client.db.delete(`sprem_${message.guild.id}`)
                await client.db.delete(`spremend_${message.guild.id}`)

                if (spremown && Date.now() > spremown) {
                    await client.db.delete(`upremcount_${us}`)
                    await client.db.delete(`uprem_${us}`)
                    await client.db.delete(`upremend_${us}`)

                    for (let i = 0; i < upremserver.length; i++) {
                        scount += 1
                        await client.db.delete(`sprem_${upremserver[i]}`)
                        await client.db.delete(`spremend_${upremserver[i]}`)
                        await client.db.delete(`spremown_${upremserver[i]}`)
                    }
                    try {
                        await client.users.cache
                            .get(`${us}`)
                            .send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `Your Premium Has Got Expired.\nTotal **\`${scount}\`** Servers [Premium](https://discord.gg/zMxCnc29Zm) was removed.\nClick [here](https://discord.gg/zMxCnc29Zm) To Buy [Premium](https://discord.gg/zMxCnc29Zm).`
                                        )
                                ],
                                components: [premrow]
                            })
                            .catch((er) => { })
                    } catch (errors) { }
                }
                await client.db.delete(`upremserver_${us}`)
                await client.db.delete(`spremown_${message.guild.id}`)
                message.channel
                    .send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `The Premium Of This Server Has Got Expired.\nClick [here](https://discord.gg/zMxCnc29Zm) To Buy [Premium](https://discord.gg/zMxCnc29Zm).`
                                )
                        ],
                        components: [premrow]
                    })
                    .catch((err) => { })
            }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel(`Invite Me`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(
                        `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`
                    ),
                new ButtonBuilder()
                    .setLabel(`Support`)
                    .setStyle(ButtonStyle.Link)
                    .setURL(`https://discord.com/invite/bitzxier`)
            )



            client.util.setPrefix(message, client)
            client.util.noprefix()
            client.util.blacklist()

            let blacklistdb = client.blacklist || []
            if (
                blacklistdb.includes(message.author.id) &&
                !client.config.owner.includes(message.author.id)
            ) {
                return
            }

            if (message.content === `<@${client.user.id}>`) {
               
                if (mcooldown.has(message.author.id)) return; // Ignore repeated mentions
                mcooldown.add(message.author.id);
                setTimeout(() => mcooldown.delete(message.author.id), 4000); // Remove after 5 sec            
                let user = client.users.cache.get("1180425876798701588")  ? client.users.cache.get("1180425876798701588") : await client.users.fetch("1180425876798701588").catch(() => { });
                client.util.setPrefix(message, client);
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setTitle(message.guild.name)
                            .setDescription(
                                `Hey ${message.author},\nMy Prefix here is: \`${message.guild.prefix}\`\nServer Id: \`${message.guild.id}\`\n\nType \`${message.guild.prefix}\`**help** To Get The Command List.`
                            )
                            .setFooter({
                                text: `Developed with ❤️ By The Ansh </>`,
                                iconURL: user.displayAvatarURL({ dynamic: true })
                            })
                    ],
                    components: [row]
                });
            }

            let prefix = message.guild.prefix || '&'
            const mentionRegexPrefix = RegExp(`^<@!?${client.user.id}>`)
            const prefix1 = message.content.match(mentionRegexPrefix) ? message.content.match(mentionRegexPrefix)[0] : prefix;
            let datab = client.noprefix || []
            if (!datab.includes(message.author.id)) {
                if (!message.content.startsWith(prefix1)) return
            }

            const args =
                datab.includes(message.author.id) == false
                    ? message.content.slice(prefix1.length).trim().split(/ +/)
                    : message.content.startsWith(prefix1) == true
                        ? message.content.slice(prefix1.length).trim().split(/ +/)
                        : message.content.trim().split(/ +/)

            const cmd = args.shift().toLowerCase()

            const command =
                client.commands.get(cmd.toLowerCase()) ||
                client.commands.find((c) =>
                    c.aliases?.includes(cmd.toLowerCase())
                )



            let customdata = await client.db.get(
                `customrole_${message.guild.id}`
            )
            if (customdata) {
                for (const [index, data] of customdata.names.entries()) {
                    if (
                        (!datab.includes(message.author.id) && message.content.startsWith(prefix1) && cmd === data) ||
                        (datab.includes(message.author.id) && !message.content.startsWith(prefix1) && cmd === data) ||
                        (datab.includes(message.author.id) && message.content.startsWith(prefix1) && cmd === data)
                    ) {
                        const ignore = (await client.db?.get(`ignore_${message.guild.id}`)) ?? { channel: [], role: [] };
                        if (
                            ignore.channel.includes(message.channel.id) &&
                            !message.member.roles.cache.some((role) => ignore.role.includes(role.id))
                        ) {
                            const msg = await message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `This channel is currently in my ignore list, so commands can't be executed here. Please try another channel or reach out to the server Administrator for assistance.`
                                        )
                                ]
                            });
                            setTimeout(() => msg.delete(), 3000);
                            return;
                        }
            
                        let role = await message.guild.roles.fetch(customdata.roles[index]);
                        if (!customdata.reqrole) {
                            await message.channel.send({
                                content: `**Attention:** Before using custom commands, please set up the required role.`,
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setTitle('Required Role Setup')
                                        .setDescription(
                                            `To enable custom commands, you need to set up a specific role that users must have to access these commands.\nUse the command to set the required role: \n\`${message.guild.prefix}setup reqrole @YourRequiredRole/id\``
                                        )
                                        .setTimestamp()
                                ]
                            });
                            return;
                        }
            
                        if (!message.guild.roles.cache.has(customdata.reqrole)) {
                            customdata.reqrole = null;
                            await client.db?.set(`customrole_${message.guild.id}`, customdata);
                            await message.channel.send({
                                content: `**Warning:** The required role may have been deleted from the server. I am clearing the associated data from the database.`,
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setTitle('Database Update')
                                        .setDescription(
                                            `This action is taken to maintain consistency. Please ensure that server roles are managed appropriately.`
                                        )
                                        .setFooter({ text: 'If you encounter issues, contact a server Administrator.' })
                                ]
                            });
                            return;
                        }
            
                        if (!message.member.roles.cache.has(customdata.reqrole)) {
                            await message.channel.send({
                                content: `**Access Denied!**`,
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setTitle('Permission Error')
                                        .setDescription(`You do not have the required role to use custom commands.`)
                                        .addFields({ name: 'Required Role:', value: `<@&${customdata.reqrole}>` })
                                        .setFooter({ text: 'Please contact a server Administrator for assistance.' })
                                ]
                            });
                            return;
                        }
            
                        if (!role) {
                            customdata.names.splice(index, 1);
                            customdata.roles.splice(index, 1);
                            await client.db?.set(`customrole_${message.guild.id}`, customdata);
                            await message.channel.send({
                                content: `**Warning:** The specified role was not found, possibly deleted. I am removing associated data from the database.`,
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setTitle('Database Cleanup')
                                        .setDescription(
                                            `To maintain accurate records, the associated data is being removed. Ensure roles are managed properly to prevent future issues.`
                                        )
                                        .setFooter({ text: 'Contact a server Administrator if you encounter any problems.' })
                                ]
                            });
                            return;
                        } else if (
                            role.permissions.has(PermissionsBitField.Flags.KickMembers) ||
                            role.permissions.has(PermissionsBitField.Flags.BanMembers) ||
                            role.permissions.has(PermissionsBitField.Flags.Administrator) ||
                            role.permissions.has(PermissionsBitField.Flags.ManageChannels) ||
                            role.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
                            role.permissions.has(PermissionsBitField.Flags.MentionEveryone) ||
                            role.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
                            role.permissions.has(PermissionsBitField.Flags.ManageWebhooks) ||
                            role.permissions.has(PermissionsBitField.Flags.ManageEvents) ||
                            role.permissions.has(PermissionsBitField.Flags.ModerateMembers) ||
                            role.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)
                        ) {
                            const restrictedPermissions = [
                                PermissionsBitField.Flags.KickMembers,
                                PermissionsBitField.Flags.BanMembers,
                                PermissionsBitField.Flags.Administrator,
                                PermissionsBitField.Flags.ManageChannels,
                                PermissionsBitField.Flags.ManageGuild,
                                PermissionsBitField.Flags.MentionEveryone,
                                PermissionsBitField.Flags.ManageRoles,
                                PermissionsBitField.Flags.ManageWebhooks,
                                PermissionsBitField.Flags.ManageEvents,
                                PermissionsBitField.Flags.ModerateMembers,
                                PermissionsBitField.Flags.ManageEmojisAndStickers
                            ];
            
                            const removePermissionsButton = new ButtonBuilder()
                                .setLabel('Remove Permissions')
                                .setStyle(ButtonStyle.Danger)
                                .setCustomId('remove_permissions');
            
                            const row = new ActionRowBuilder().addComponents(removePermissionsButton);
                            const initialMessage = await message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `${client.emoji.cross} | **Permission Denied**\nI cannot add <@&${role.id}> to anyone because it possesses the following restricted permissions:\n${role.permissions.toArray()
                                                .filter(permission => restrictedPermissions.includes(permission))
                                                .map(permission => `• \`${PermissionsBitField.Flags[permission]}\``)
                                                .join('\n')}\nPlease review and adjust the role permissions accordingly.`
                                        )
                                ],
                                components: [row]
                            });
            
                            const filter = interaction => interaction.customId === 'remove_permissions' && interaction.user.id === message.author.id;
            
                            const collector = message.channel.createMessageComponentCollector({ filter, time: 15000 });
            
                            collector.on('collect', async (interaction) => {
                                if (interaction.user.id !== message.author.id) {
                                    await interaction.reply({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(`${client.emoji.cross} | Only ${message.author} can use this button.`)
                                        ],
                                        ephemeral: true // Only visible to the user who clicked the button
                                    });
                                } else if (role.editable) {
                                    await role.setPermissions([], `Action Done By ${interaction.user.username} Removed dangerous permissions from role`);
                                    await sendRoleLog(
                                        message,
                                        'Permissions Removed',
                                        role,
                                        null,
                                        'All permissions cleared for security'
                                    );
                                    await interaction.reply({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(`${client.emoji.tick} | Permissions removed successfully.`)
                                        ],
                                        ephemeral: true // Only visible to the user who clicked the button
                                    });
                                } else {
                                    await interaction.reply({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(
                                                    `${client.emoji.cross} | I don't have sufficient permissions to clear permissions from the role. Please make sure my role position is higher than the role you're trying to modify.`
                                                )
                                        ],
                                        ephemeral: true // Only visible to the user who clicked the button
                                    });
                                }
                            });
            
                            collector.on('end', () => {
                                removePermissionsButton.setDisabled(true);
                                initialMessage.edit({
                                    components: [new ActionRowBuilder().addComponents(removePermissionsButton)]
                                });
                            });
                        } else {
                            let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
                            if (!member) {
                                await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setTitle('Invalid Member')
                                            .setDescription(`Make sure to mention a valid member or provide their ID.`)
                                    ]
                                });
                                return;
                            }
                            if (!role.editable) {
                                await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(
                                                `${client.emoji.cross} | I can't provide this role as my highest role is either below or equal to the provided role.`
                                            )
                                    ]
                                });
                            } else if (member.roles.cache.has(role.id)) {
                                await member.roles.remove(role.id, `${message.author.tag} | ${message.author.id}`);
                                await sendRoleLog(
                                    message,
                                    'Role Removed',
                                    role,
                                    member
                                );
                                await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(`${client.emoji.tick} | The role ${role} has been successfully removed from ${member}`)
                                    ]
                                });
                            } else {
                                await member.roles.add(role.id, `${message.author.tag} | ${message.author.id}`);
                                await sendRoleLog(
                                    message,
                                    'Role Added',
                                    role,
                                    member
                                );
                                await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(`${client.emoji.tick} | The role ${role} has been successfully added to ${member}`)
                                    ]
                                });
                            }
                        }
                    }
                }
            }
             if (command.premium || false) {
                if (!client.config.owner.includes(message.author.id) && !uprem && !sprem) {
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('Premium')
                            .setStyle(ButtonStyle.Link)
                            .setEmoji('<a:bitzxier_premium:1092098944131137536>')
                            .setURL('https://discord.gg/zMxCnc29Zm'),
                    )
                    const embeds = client.util.embed()
                    embeds
                        .setDescription(
                            '[Click here to buy Premium](https://discord.gg/zMxCnc29Zm) so that you can use this command.'
                        )
                        .setColor(client.color)
                    return message.channel.send({
                        content : `Hey ${message.author.displayName},\nYou just found up a **Premium** Command, which can be used only in servers where there's an **Active Premium Subscription.**`,
                        embeds: [embeds],
                        components: [row]
                    })
                }
            }
            if (!command) return
            let maintain = await client.db.get(`maintanance_${client.user.id}`)
            if (maintain && !client.config.admin.includes(message.author.id)) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setLabel(`Invite Me`)
                        .setStyle(ButtonStyle.Link)
                        .setURL(
                            `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`
                        ),
                    new ButtonBuilder()
                        .setLabel(`Support`)
                        .setStyle(ButtonStyle.Link)
                        .setURL(`https://discord.com/invite/bitzxier`)
                )
                return message.channel.send({ embeds: [client.util.embed().setColor(client.color).setTitle("Notice: Bot Functionality Globally Disabled by Developers").setDescription(`Dear Discord Community Members,\n\nWe regret to inform you that the functionality of the bot has been globally disabled by the developers. We understand the inconvenience this may cause and appreciate your understanding as we work to resolve the issue.\n\nThank you for your patience and continued support.\nSincerely,\n[Ansh </>](https://discord.gg/zMxCnc29Zm)`)], components: [row] })
            }
            const ignore = (await client.db?.get(
                `ignore_${message.guild.id}`
            )) ?? { channel: [], role: [] }
            if (!client.config.owner.includes(message.author.id) &&
                ignore.channel.includes(message.channel.id) &&
                !message.member.roles.cache.some((role) =>
                    ignore.role.includes(role.id)
                )
            ) {
                return await message.channel
                    .send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `This channel is currently in my ignore list, so commands can't be executed here. Please try another channel or reach out to the server Administrator for assistance.`
                                )
                        ]
                    })
                    .then((x) => {
                        setTimeout(() => x.delete(), 3000)
                    })
            }
             
// Main command execution logic
const commandLimit = 5;

if (
    client.config.cooldown &&
    !client.config.owner.includes(message.author.id)
) {
    if (!client.cooldowns.has(command.name)) {
        client.cooldowns.set(command.name, new Collection());
    }
    const now = Date.now();
    const timestamps = client.cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown ? command.cooldown : 5) * 1000;
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            let commandCount = timestamps.get(`${message.author.id}_count`) || 0;
            commandCount++;
            timestamps.set(`${message.author.id}_count`, commandCount);
            if (commandCount > commandLimit) {
                let blacklistedUsers = (await client.db.get(`blacklist_${client.user.id}`)) || [];
                if (!blacklistedUsers.includes(message.author.id)) {
                    blacklistedUsers.push(message.author.id);
                    await client.db.set(`blacklist_${client.user.id}`, blacklistedUsers);
                    client.util.blacklist();
                }
                const saixd = client.util.embed()
                    .setColor(client.color)
                    .setTitle('Blacklisted for Spamming')
                    .setDescription(`You have been blacklisted for spamming commands. Please refrain from such behavior.`)
                    .addFields({ name: 'Support Server', value: '[Join our support server](https://discord.gg/zMxCnc29Zm)' }, true)
                    .setTimestamp();

                return message.channel.send({ embeds: [saixd] });
            }
            if (!timestamps.has(`${message.author.id}_cooldown_message_sent`)) {
                message.channel.send({
                    embeds: [client.util.embed()
                        .setColor(client.color)
                        .setDescription(`Please wait, this command is on cooldown for \`${timeLeft.toFixed(1)}s\``)
                    ]
                }).then((msg) => {
                    setTimeout(() => msg.delete().catch(() => { }), 5000);
                });
                timestamps.set(`${message.author.id}_cooldown_message_sent`, true);
            }
            return;
        }
    }
    timestamps.set(message.author.id, now);
    timestamps.set(`${message.author.id}_count`, 1);
    setTimeout(() => {
        timestamps.delete(message.author.id);
        timestamps.delete(`${message.author.id}_count`);
        timestamps.delete(`${message.author.id}_cooldown_message_sent`);
    }, cooldownAmount);
}
            
                        await command.run(client, message, args).catch((err) => null)
                        client.cmd.prepare('UPDATE total_command_count SET count = count + 1 WHERE id = 1').run();

                        if (command) {
                           const web = config.COMMAND_LOGS_URL ? new WebhookClient({ url: config.COMMAND_LOGS_URL }) : null;
            
            const commandlog = new EmbedBuilder()
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setColor(client.color)
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setDescription(
                    `Command Ran In: \`${message.guild.name} | ${message.guild.id}\`\n` +
                    `Command Ran In Channel: \`${message.channel.name} | ${message.channel.id}\`\n` +
                    `Command Name: \`${command.name}\`\n` +
                    `Command Executor: \`${message.author.tag} | ${message.author.id}\`\n` +
                    `Command Content: \`${message.content}\``
                );
            
            const queue = [];
            let isSending = false;
            
            function processQueue() {
                if (queue.length === 0 || isSending) return;
            
                isSending = true;
                const embed = queue.shift();
            
                web.send({ embeds: [embed] })
                    .then(() => {
                        setTimeout(() => {
                            isSending = false;
                            processQueue();
                        }, 2000);
                    })
                    .catch(console.error);
            }
            
            queue.push(commandlog);
            processQueue();
                        }
                    } catch(err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit()
                        }
                        return
                    }
                })

                
// Initialize webhook client for logging
const roleWebhook = config.Role_LOGS_URL ? new WebhookClient({ url: config.Role_LOGS_URL }) : null;

// Helper function to send webhook logs
async function sendRoleLog(message, action, role, member = null, permissions = null) {
    const embed = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({ 
            name: message.author.tag,
            iconURL: message.author.displayAvatarURL({ dynamic: true })
        })
        .setTitle('Custom Role Action Log')
        .setTimestamp()
        .addFields([
            { name: 'Server', value: `${message.guild.name} (${message.guild.id})` },
            { name: 'Moderator', value: `${message.author.tag} (${message.author.id})` },
            { name: 'Action', value: action },
            { name: 'Role', value: `${role.name} (${role.id})` }
        ]);

    if (member) {
        embed.addFields({ name: 'Target Member', value: `${member.user.tag} (${member.id})` });
    }

    if (permissions) {
        embed.addFields({ name: 'Permissions Modified', value: permissions });
    }

        try {
            if (roleWebhook) await roleWebhook.send({ embeds: [embed] });
        } catch (error) {
            console.error('Failed to send webhook log:', error);
        }
}
            }
            
            
         
