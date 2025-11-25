module.exports = async (client) => {
    //ANTI LINK
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return
        if (message.author.id === client.user.id) return
        if (message.author.id === message.guild.ownerId) return
        if (!message.guild || !message.member) return;
        if (message.member.permissions.has('Administrator')) return;
        if (message.webhookId) return
        if(await client.util.BlacklistCheck(message?.guild)) return
        try {
            let antilink = await client.db.get(`antilink_${message?.guild?.id}`)
            if (antilink !== true) return
            const userId = message.author.id
            const whitelistData = await client.db.get(`automodbypass_${message?.guild?.id}`) || { user: [], role: [], channel: [] }
            const { user: userWhitelist = [], role: roleWhitelist = [], channel: channelWhitelist = [] } = whitelistData;
            const isUserWhitelisted = userWhitelist.some(userEntry => {
                return userEntry.id === userId && userEntry.settings.antilink;
            });
            const isRoleWhitelisted = roleWhitelist.some(roleEntry => {
                return message.member.roles.cache.some(role => role.id === roleEntry.id && roleEntry.settings.antilink);
            });
            const isChannelWhitelisted = channelWhitelist.some(channelEntry => {
                return message.channel.id === channelEntry.id && channelEntry.settings.antilink;
            });
            if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;
            let punishment = (await client.db.get(
                `antilinkp_${message.guild.id}`
            )) ?? { data: null }
            const action = punishment.data
            const urlRegex  = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
            const allowedDomains = ["giphy.com", "tenor.com"];
            const isAllowedLink = (url) => allowedDomains.some((domain) => url.includes(domain));
            const checkmessage = message.content;
            const urls = checkmessage.match(urlRegex);
            if (urls && urls.some((url) => !isAllowedLink(url))) {
                try {
                    if (!action || action === 'mute') {
                        await message.delete()
                        if (message.member.manageable) {
                            if (message.member.isCommunicationDisabled()) return
                            try {
                                await message.member.timeout(
                                    30 * 60 * 1000,
                                    'BITZXIER | ANTILINK | TIMEOUT'
                                )
                                let scucess = await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(
                                                `${message.author.tag}  has been muted for sending links.`
                                            )
                                    ]
                                })
                                await client.util.sleep(3000)
                                await scucess.delete()
                            } catch (err) {
                                if (err.code === 429) {
                                    await client.util.handleRateLimit()
                                }
                                return
                            }
                        }
                    }
                    if (action === 'kick') {
                        await message.delete()
                        if (message.member.kickable) {
                            try {
                                await message.guild.members.kick(
                                    message.member.id,
                                    'BITZXIER | ANTILINK | KICK'
                                )
                                let scucess = await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(
                                                `${message.author.tag} has been kicked for sending links.`
                                            )
                                    ]
                                })
                                await client.util.sleep(3000)
                                await scucess.delete()
                            } catch (err) {
                                if (err.code === 429) {
                                    await client.util.handleRateLimit()
                                }
                                return
                            }
                        }
                    }
                    if (action === 'ban') {
                        await message.delete()
                        if (message.member.bannable) {
                            try {
                                let reason = 'BITZXIER | ANTILINK | BAN'
                                await message.guild.members
                                    .ban(message.member.id, { reason: reason })
                                    .catch((e) => console.log(e))
                                let scucess = await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(
                                                `${message.author.tag} has been banned for sending links.`
                                            )
                                    ]
                                })
                                await client.util.sleep(3000)
                                await scucess.delete()
                            } catch (err) {
                                if (err.code === 429) {
                                    await client.util.handleRateLimit()
                                }
                                return
                            }
                        }
                    } else if (action === 'none') {
                        try {
                            await message.delete().catch((err) => { });

                            // Check if the guild has a recently warned set
                            if (!client.recentlylinkwarned) {
                                client.recentlylinkwarned = new Map();
                            }

                            if (!client.recentlylinkwarned.has(message.guild.id)) {
                                client.recentlylinkwarned.set(message.guild.id, new Set());
                            }

                            const guildWarnedSet = client.recentlylinkwarned.get(message.guild.id);

                            if (guildWarnedSet.has(message.author.id)) {
                                return;
                            }

                            // Add user to the recently warned set for this guild
                            guildWarnedSet.add(message.author.id);

                            let warningMessage = await message.channel.send({
                                content: `${message.author}, don't send links here.`,
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription('Please adhere to the server rules and avoid using links.'),
                                ],
                            });

                            await client.util.sleep(3000);
                            await warningMessage.delete();

                            // Remove user from the recently warned set after 10 seconds
                            setTimeout(() => {
                                guildWarnedSet.delete(message.author.id);
                            }, 10000);

                        } catch (err) {
                            return;
                        }

                    }
                } catch (err) {
                    if (err.code === 429) {
                        await client.util.handleRateLimit()
                    }
                    return
                }
            }
        } catch (err) {
            if (err.code === 429) {
                await client.util.handleRateLimit()
            }
            return
        }
    })
    //ANTI LINK ON EDIT 
    client.on('messageUpdate', async (oldMessage, newMessage) => {
        if (newMessage.author.bot) return;
        if (newMessage.author.id === client.user.id) return;
        if (newMessage.author.id === newMessage.guild.ownerId) return;
        if (!newMessage.guild || !newMessage.member) return;
        if (newMessage.member.permissions.has('Administrator')) return;
        if (newMessage.webhookId) return;
    
        // Check if the message content has been updated
        const oldContent = oldMessage.content;
        const newContent = newMessage.content;
    
        if (oldContent === newContent) return; // No change in message, no need to proceed

        if(await client.util.BlacklistCheck(newMessage?.guild)) return


    
        let antilink = await client.db.get(`antilink_${newMessage?.guild?.id}`);
        if (antilink !== true) return;
    
        const userId = newMessage.author.id;
        const whitelistData = await client.db.get(`automodbypass_${newMessage?.guild?.id}`) || { user: [], role: [], channel: [] };
        const { user: userWhitelist = [], role: roleWhitelist = [], channel: channelWhitelist = [] } = whitelistData;
    
        const isUserWhitelisted = userWhitelist.some(userEntry => userEntry.id === userId && userEntry.settings.antilink);
        const isRoleWhitelisted = roleWhitelist.some(roleEntry => newMessage.member.roles.cache.some(role => role.id === roleEntry.id && roleEntry.settings.antilink));
        const isChannelWhitelisted = channelWhitelist.some(channelEntry => newMessage.channel.id === channelEntry.id && channelEntry.settings.antilink);
    
        if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;
    
        let punishment = (await client.db.get(`antilinkp_${newMessage.guild.id}`)) ?? { data: null };
        const action = punishment.data;
        const urlRegex = /\b((https?:\/\/)?(www\.)?[\w-]+(\.[a-z]{2,})+(\/[\w-.,@?^=%&:/~+#]*)?)\b/g;
        const allowedDomains = ["giphy.com", "tenor.com"];
    
        const isAllowedLink = (url) => allowedDomains.some((domain) => url.includes(domain));
    
        // Match URLs in the new message content
        const urls = newContent.match(urlRegex);
    
        if (urls && urls.some((url) => !isAllowedLink(url))) {
            try {
                if (!action || action === 'mute') {
                    await newMessage.delete();
                    if (newMessage.member.manageable) {
                        if (newMessage.member.isCommunicationDisabled()) return;
                        try {
                            await newMessage.member.timeout(30 * 60 * 1000, 'BITZXIER | ANTILINK | TIMEOUT');
                            let success = await newMessage.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(`${newMessage.author.tag} has been muted for sending links.`)
                                ]
                            });
                            await client.util.sleep(3000);
                            await success.delete();
                        } catch (err) {
                            if (err.code === 429) {
                                await client.util.handleRateLimit();
                            }
                            return;
                        }
                    }
                }
                if (action === 'kick') {
                    await newMessage.delete();
                    if (newMessage.member.kickable) {
                        try {
                            await newMessage.guild.members.kick(newMessage.member.id, 'BITZXIER | ANTILINK | KICK');
                            let success = await newMessage.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(`${newMessage.author.tag} has been kicked for sending links.`)
                                ]
                            });
                            await client.util.sleep(3000);
                            await success.delete();
                        } catch (err) {
                            if (err.code === 429) {
                                await client.util.handleRateLimit();
                            }
                            return;
                        }
                    }
                }
                if (action === 'ban') {
                    await newMessage.delete();
                    if (newMessage.member.bannable) {
                        try {
                            let reason = 'BITZXIER | ANTILINK | BAN';
                            await newMessage.guild.members.ban(newMessage.member.id, { reason: reason }).catch((e) => console.log(e));
                            let success = await newMessage.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(`${newMessage.author.tag} has been banned for sending links.`)
                                ]
                            });
                            await client.util.sleep(3000);
                            await success.delete();
                        } catch (err) {
                            if (err.code === 429) {
                                await client.util.handleRateLimit();
                            }
                            return;
                        }
                    }
                } else if (action === 'none') {
                    try {
                        await newMessage.delete().catch((err) => {});
    
                        if (!client.recentlylinkwarned) {
                            client.recentlylinkwarned = new Map();
                        }
    
                        if (!client.recentlylinkwarned.has(newMessage.guild.id)) {
                            client.recentlylinkwarned.set(newMessage.guild.id, new Set());
                        }
    
                        const guildWarnedSet = client.recentlylinkwarned.get(newMessage.guild.id);
    
                        if (guildWarnedSet.has(newMessage.author.id)) {
                            return;
                        }
    
                        guildWarnedSet.add(newMessage.author.id);
    
                        let warningMessage = await newMessage.channel.send({
                            content: `${newMessage.author}, don't send links here.`,
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription('Please adhere to the server rules and avoid using links.'),
                            ],
                        });
    
                        await client.util.sleep(3000);
                        await warningMessage.delete();
    
                        setTimeout(() => {
                            guildWarnedSet.delete(newMessage.author.id);
                        }, 10000);
    
                    } catch (err) {
                        return;
                    }
                }
            } catch (err) {
                if (err.code === 429) {
                    await client.util.handleRateLimit();
                }
                return;
            }
        }
    });
    
    //ANTI SPAM
    const TIME_FRAME = 10000; // 10 seconds
    const userMap = new Map();
    client.on('messageCreate', async (message) => {
        try {
            if (
                message.author.bot ||
                message.author.id === client.user.id ||
                message.author.id === message.guild?.ownerId ||
                !message.guild ||
                !message.member ||
                message.member.permissions.has('Administrator') ||
                message.webhookId
            )
                return;
                
            if(await client.util.BlacklistCheck(message?.guild)) return

            let antispam = await client.db.get(`antispam_${message.guild.id}`);
            if (antispam !== true) return;
            const userIdd = message.author.id
            const whitelistData = await client.db.get(`automodbypass_${message?.guild?.id}`) || { user: [], role: [], channel: [] }
            const { user: userWhitelist = [], role: roleWhitelist = [], channel: channelWhitelist = [] } = whitelistData;
            const isUserWhitelisted = userWhitelist.some(userEntry => {
                return userEntry.id === userIdd && userEntry.settings.antispam;
            });
            const isRoleWhitelisted = roleWhitelist.some(roleEntry => {
                return message.member.roles.cache.some(role => role.id === roleEntry.id && roleEntry.settings.antispam);
            });
            const isChannelWhitelisted = channelWhitelist.some(channelEntry => {
                return message.channel.id === channelEntry.id && channelEntry.settings.antispam;
            });
            if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;
            let punishment = (await client.db.get(`antispamp_${message.guild.id}`)) || { data: null };
            const action = punishment.data;
            const limitData = (await client.db.get(`antispamlimit_${message.guild.id}`)) || 4;
            const LIMIT = limitData;
            const WARNING_THRESHOLD = (await client.db.get(`antispamstrikes_${message.guild.id}`)) || 1;
            const warns = WARNING_THRESHOLD;

            const now = Date.now();
            const userId = message.author.id;

            let userData = userMap.get(userId);

            if (!userData) {
                userData = {
                    lastMessage: '',
                    spamCount: 0,
                    warnings: 0,
                    lastMessageTimestamp: now,
                    messageIds: []

                };
            }

            const timeDiff = now - userData.lastMessageTimestamp;
            if (timeDiff < TIME_FRAME && message.content === userData.lastMessage) {
                userData.spamCount += 1;
            } else {
                userData.spamCount = 1;
            }

            userData.lastMessage = message.content;
            userData.lastMessageTimestamp = now;
            userData.messageIds.push(message);

            if (userData.spamCount >= LIMIT) {
                userData.warnings += 1;
                userData.spamCount = 0;



                const deleteMessages = async (userId, messageIds) => {
                    try {
                        await message.channel.bulkDelete(messageIds);
                    } catch (err) {
                        /*   if (err.code === 429) {
                               console.error("Rate limit error:", err);
                               await client.util.sleep(err.retry_after * 1000);
                               return deleteMessages(userId, messageIds);
                           } else {
                               console.error("Bulk delete error:", err);
                           } */
                        return;
                    }
                };

                if (userData.warnings >= warns) {
                    const member = message.guild.members.cache.get(userId) ? message.guild.members.cache.get(userId) : await message.guild.members.fetch(userId).catch((error) => { })
                    if (member) {
                        try {
                            if (action === 'mute' || !action) {
                                if (member.manageable && !member.isCommunicationDisabled()) {
                                    await member.timeout(
                                        30 * 60 * 1000,
                                        'BITZXIER | ANTISPAM | TIMEOUT'
                                    )
                                    let successMessage = await message.channel.send({
                                        embeds: [
                                            client.util.embed()
                                                .setColor(client.color)
                                                .setDescription(
                                                    `${message.author.tag} has been muted for spamming.`
                                                )
                                        ]
                                    })
                                    setTimeout(() => successMessage.delete(), 3000);
                                }
                            } else if (action === 'kick' && member.kickable) {
                                await member.kick('BITZXIER | ANTISPAM | KICK');
                                let successMessage = await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(
                                                `${message.author.tag} has been kicked for spamming.`
                                            )
                                    ]
                                })
                                setTimeout(() => successMessage.delete(), 3000);
                            } else if (action === 'ban' && member.bannable) {
                                await member.ban({ reason: 'BITZXIER | ANTISPAM | BAN' });
                                let successMessage = await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(
                                                `${message.author.tag} has been banned for spamming.`
                                            )
                                    ]
                                })
                                setTimeout(() => successMessage.delete(), 3000);
                            }
                        } catch (err) {
                            // console.error(`Failed to execute punishment (${action}) for ${member}:`, err);
                        }
                    }
                    await deleteMessages(userId, userData.messageIds);

                    userData.warnings = 0;
                } else {
                    let successMessage = await message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${message.author}, this is your warning ${userData.warnings}/${warns} for spamming.`
                                )
                        ]
                    })

                    await deleteMessages(userId, userData.messageIds);


                    setTimeout(() => successMessage.delete(), 3000);
                }
            }
            userMap.set(userId, userData);
        } catch (err) {
            console.error("Main error:", err);
            if (err.code === 429) {
                await client.util.handleRateLimit();
            }
        }
    });


    //ANTI SWEAR
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return
        if (message.author.id === client.user.id) return
        if (message.author.id === message.guild.ownerId) return
        if (!message.guild || !message.member) return;
        if (message.member.permissions.has('Administrator')) return;
        if (message.webhookId) return

        if(await client.util.BlacklistCheck(message?.guild)) return

        try {

            let antiswear = await client.db?.get(`antiswear_${message.guild.id}`)
            if (antiswear !== true) return
            const userId = message.author.id
            if (message.author.id === client.user.id || message.author.id === message.guild.ownerId || !message.guild || !message.member || message.member.permissions.has('Administrator')) return
            const whitelistData = await client.db.get(`automodbypass_${message?.guild?.id}`) || { user: [], role: [], channel: [] }
            const { user: userWhitelist = [], role: roleWhitelist = [], channel: channelWhitelist = [] } = whitelistData;
            const isUserWhitelisted = userWhitelist.some(userEntry => {
                return userEntry.id === userId && userEntry.settings.antiswear;
            });
            const isRoleWhitelisted = roleWhitelist.some(roleEntry => {
                return message.member.roles.cache.some(role => role.id === roleEntry.id && roleEntry.settings.antiswear);
            });
            const isChannelWhitelisted = channelWhitelist.some(channelEntry => {
                return message.channel.id === channelEntry.id && channelEntry.settings.antiswear;
            });
            if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;

            let punishment = (await client.db.get(
                `antiswearp_${message.guild.id}`
            )) || { data: null }
            let list = (await client.db.get(`antiswearwords_${message.guild.id}`)) || [];
            const action = punishment.data
            const content = message.content.toLowerCase();
            const foundBadWord = list.some(word => content.includes(word.toLowerCase()));

            if (foundBadWord) {
                if (!action || action === 'mute') {
                    await message.delete()
                    if (message.member.manageable) {
                        if (message.member.isCommunicationDisabled()) return
                        try {
                            await message.member.timeout(
                                30 * 60 * 1000,
                                'BITZXIER | ANTI WORDS | TIMEOUT'
                            )
                            let success = await message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `${message.author.tag} has been muted for using badwords.`
                                        )
                                ]
                            })
                            await client.util.sleep(3000)
                            await success.delete()
                        } catch (err) {
                            if (err.code === 429) {
                                await client.util.handleRateLimit()
                            }
                            return
                        }
                    }
                } else if (action === 'none') {
                    try {
                        await message.delete().catch((err) => { });
                        if (!client.recentlyWarned) {
                            client.recentlyWarned = new Map();
                        }

                        if (!client.recentlyWarned.has(message.guild.id)) {
                            client.recentlyWarned.set(message.guild.id, new Set());
                        }

                        const guildWarnedSet = client.recentlyWarned.get(message.guild.id);

                        if (guildWarnedSet.has(message.author.id)) {
                            return;
                        }

                        // Add user to the recently warned set for this guild
                        guildWarnedSet.add(message.author.id);

                        let warningMessage = await message.channel.send({
                            content: `${message.author}, don't use bad words.`,
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription('Please adhere to the server rules and avoid using inappropriate language.'),
                            ],
                        });

                        await client.util.sleep(3000);
                        await warningMessage.delete();

                        // Remove user from the recently warned set after 10 seconds
                        setTimeout(() => {
                            guildWarnedSet.delete(message.author.id);
                        }, 10000);

                    } catch (err) {
                        return;
                    }

                } else if (action === 'kick') {
                    //await message.channel.bulkDelete(LIMIT)

                    if (message.member.kickable) {
                        try {
                            await message.member.kick(
                                'BITZXIER | ANTI WORDS | KICK'
                            )
                            let success = await message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `${message.author.tag} has been kicked for using badwords.`
                                        )
                                ]
                            })
                            await client.util.sleep(3000)
                            await success.delete()
                        } catch (err) {
                            if (err.code === 429) {
                                await client.util.handleRateLimit()
                            }
                            return
                        }
                    }
                } else if (action === 'ban') {
                    await message.delete()
                    if (message.member.banable) {
                        try {
                            await message.member.ban(
                                'BITZXIER | ANTI WORDS | BAN'
                            )
                            let success = await message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(
                                            `${message.author.tag} has been banned for using badwords.`
                                        )
                                ]
                            })
                            await client.util.sleep(3000)
                            await success.delete()
                        } catch (err) {
                            if (err.code === 429) {
                                await client.util.handleRateLimit()
                            }
                            return
                        }
                    }
                }
            }
        } catch (err) {
            if (err.code === 429) {
                await client.util.handleRateLimit()
            }
            return
        }
    })
// ANTI SWEAR ON EDIT 
client.on('messageUpdate', async (oldMessage, newMessage) => {
    // Ensure we're not processing messages from bots or the client itself
    if (
        newMessage.author.bot ||
        newMessage.author.id === client.user.id ||
        newMessage.author.id === newMessage.guild.ownerId ||
        !newMessage.guild ||
        !newMessage.member ||
        newMessage.member.permissions.has('Administrator') ||
        newMessage.webhookId
    ) return;
        const oldContent = oldMessage.content;
        const newContent = newMessage.content;
        if (oldContent === newContent) return;

        if(await client.util.BlacklistCheck(newMessage?.guild)) return


    try {
        let antiswear = await client.db?.get(`antiswear_${newMessage.guild.id}`);
        if (antiswear !== true) return;

        const userId = newMessage.author.id;
        if (newMessage.author.id === client.user.id || newMessage.author.id === newMessage.guild.ownerId || !newMessage.guild || !newMessage.member || newMessage.member.permissions.has('Administrator')) return;

        const whitelistData = await client.db.get(`automodbypass_${newMessage?.guild?.id}`) || { user: [], role: [], channel: [] };
        const { user: userWhitelist = [], role: roleWhitelist = [], channel: channelWhitelist = [] } = whitelistData;

        const isUserWhitelisted = userWhitelist.some(userEntry => userEntry.id === userId && userEntry.settings.antiswear);
        const isRoleWhitelisted = roleWhitelist.some(roleEntry => newMessage.member.roles.cache.some(role => role.id === roleEntry.id && roleEntry.settings.antiswear));
        const isChannelWhitelisted = channelWhitelist.some(channelEntry => newMessage.channel.id === channelEntry.id && channelEntry.settings.antiswear);

        if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;

        let punishment = (await client.db.get(`antiswearp_${newMessage.guild.id}`)) || { data: null };
        let list = (await client.db.get(`antiswearwords_${newMessage.guild.id}`)) || [];
        const action = punishment.data;
        const content = newMessage.content.toLowerCase();
        const foundBadWord = list.some(word => content.includes(word.toLowerCase()));

        if (foundBadWord) {
            if (!action || action === 'mute') {
                await newMessage.delete();
                if (newMessage.member.manageable) {
                    if (newMessage.member.isCommunicationDisabled()) return;
                    try {
                        await newMessage.member.timeout(30 * 60 * 1000, 'BITZXIER | ANTI WORDS | TIMEOUT');
                        let success = await newMessage.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(`${newMessage.author.tag} has been muted for using bad words.`),
                            ],
                        });
                        await client.util.sleep(3000);
                        await success.delete();
                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit();
                        }
                        return;
                    }
                }
            } else if (action === 'none') {
                try {
                    await newMessage.delete().catch(() => {});
                    if (!client.recentlyWarned) {
                        client.recentlyWarned = new Map();
                    }

                    if (!client.recentlyWarned.has(newMessage.guild.id)) {
                        client.recentlyWarned.set(newMessage.guild.id, new Set());
                    }

                    const guildWarnedSet = client.recentlyWarned.get(newMessage.guild.id);
                    if (guildWarnedSet.has(newMessage.author.id)) return;

                    guildWarnedSet.add(newMessage.author.id);
                    let warningMessage = await newMessage.channel.send({
                        content: `${newMessage.author}, don't use bad words.`,
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription('Please adhere to the server rules and avoid using inappropriate language.'),
                        ],
                    });
                    await client.util.sleep(3000);
                    await warningMessage.delete();

                    setTimeout(() => {
                        guildWarnedSet.delete(newMessage.author.id);
                    }, 10000);
                } catch (err) {
                    return;
                }
            } else if (action === 'kick') {
                if (newMessage.member.kickable) {
                    try {
                        await newMessage.member.kick('BITZXIER | ANTI WORDS | KICK');
                        let success = await newMessage.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(`${newMessage.author.tag} has been kicked for using bad words.`),
                            ],
                        });
                        await client.util.sleep(3000);
                        await success.delete();
                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit();
                        }
                        return;
                    }
                }
            } else if (action === 'ban') {
                await newMessage.delete();
                if (newMessage.member.banable) {
                    try {
                        await newMessage.member.ban('BITZXIER | ANTI WORDS | BAN');
                        let success = await newMessage.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(`${newMessage.author.tag} has been banned for using bad words.`),
                            ],
                        });
                        await client.util.sleep(3000);
                        await success.delete();
                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit();
                        }
                        return;
                    }
                }
            }
        }
    } catch (err) {
        if (err.code === 429) {
            await client.util.handleRateLimit();
        }
        return;
    }
});

    //ANTI NSFW
   /*
    const FormData = require('form-data');

    client.on('messageCreate', async (message) => {
        let check = await client.db.get(`blacklistserver_${client.user.id}`) || [];
        if (check.includes(message?.guild?.id)) return;
        try {
            if (message.author.bot || message.webhookId) return;

            let antinsfw = await client.db.get(`antinsfw_${message.guild.id}.enable`);
            if (antinsfw !== true) return;
            const userId = message.author.id
            const imageUrlPattern = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
            if (message.author.id === client.user.id || message.author.id === message.guild.ownerId) return;
            if (!message.guild || !message.member) return;
            if (message.member.permissions.has('Administrator')) return;
            const whitelistData = await client.db.get(`automodbypass_${message?.guild?.id}`) || { user: [], role: [], channel: [] }
            const { user: userWhitelist = [], role: roleWhitelist = [], channel: channelWhitelist = [] } = whitelistData
            const isUserWhitelisted = userWhitelist.some(userEntry => {
                return userEntry.id === userId && userEntry.settings.antinsfw;
            });
            const isRoleWhitelisted = roleWhitelist.some(roleEntry => {
                return message.member.roles.cache.some(role => role.id === roleEntry.id && roleEntry.settings.antinsfw);
            });
            const isChannelWhitelisted = channelWhitelist.some(channelEntry => {
                return message.channel.id === channelEntry.id && channelEntry.settings.antinsfw;
            });
            if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;

            let imageUrls = [];
            if (message.embeds.length > 0) {
                message.embeds.forEach(embed => {
                    if (embed.image) imageUrls.push(embed.image.url);
                    else if (embed.thumbnail) imageUrls.push(embed.thumbnail.url);
                });
            }

            const contentUrls = message.content.match(imageUrlPattern);
            if (contentUrls) imageUrls.push(...contentUrls);

            // Prepare promises for NSFW checks
            const promises = [];

            if (message.attachments.size > 0) {
                message.attachments.forEach((attachment) => {
                    promises.push(checkNSFW(attachment.url, message));
                });
            }

            if (imageUrls.length > 0) {
                imageUrls.forEach((url) => {
                    promises.push(checkNSFW(url, message));
                });
            }

            await Promise.all(promises);

        } catch (err) {
            if (err.code === 429) {
                await client.util.handleRateLimit();
            }
            console.error('Error in messageCreate handler:', err);
        }

        // NSFW check function integrated within the message handler
        async function checkNSFW(imageUrl, message) {
            const action = (await message.client.db.get(`antinsfw_${message.guild.id}.punishment`)) || "none";
            try {
                // Get image data
                let response = await message.client.snek.get(imageUrl, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(response.data);
                const formData = new FormData();
                formData.append('image', buffer, { filename: 'image.webp', contentType: 'image/webp' });

                // NSFW detection API call
                const nsfwResponse = await message.client.snek.post('http://137.184.31.177:1504/detect_nsfw', formData, {
                    headers: formData.getHeaders(),
                });

                const { is_nsfw } = nsfwResponse.data;
                if (is_nsfw) {
                    await message.delete();
                    switch (action) {
                        case 'mute':
                            if (message.member.manageable && !message.member.isCommunicationDisabled()) {
                                await message.member.timeout(30 * 60 * 1000, 'BITZXIER | ANTI-NSFW | TIMEOUT');
                                let successMessage = await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(`${message.author.tag} has been muted for sending NSFW content.`)
                                    ]
                                });
                                await client.util.sleep(3000);
                                await successMessage.delete();
                            }
                            break;

                        case 'kick':
                            if (message.member.kickable) {
                                await message.guild.members.kick(message.member.id, 'BITZXIER | ANTI-NSFW | KICK');
                                let successMessage = await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(`${message.author.tag} has been kicked for sending NSFW content.`)
                                    ]
                                });
                                await client.util.sleep(3000);
                                await successMessage.delete();
                            }
                            break;

                        case 'ban':
                            if (message.member.bannable) {
                                await message.guild.members.ban(message.member.id, { reason: 'BITZXIER | ANTI-NSFW | BAN' });
                                let successMessage = await message.channel.send({
                                    embeds: [
                                        client.util.embed()
                                            .setColor(client.color)
                                            .setDescription(`${message.author.tag} has been banned for sending NSFW content.`)
                                    ]
                                });
                                await client.util.sleep(3000);
                                await successMessage.delete();
                            }
                            break;

                        case 'none':
                            await message.delete();
                            if (!message.client.recentlyLinkWarned) {
                                message.client.recentlyLinkWarned = new Map();
                            }
                            if (!message.client.recentlyLinkWarned.has(message.guild.id)) {
                                message.client.recentlyLinkWarned.set(message.guild.id, new Set());
                            }

                            const guildWarnedSet = message.client.recentlyLinkWarned.get(message.guild.id);
                            if (guildWarnedSet.has(message.author.id)) return;
                            guildWarnedSet.add(message.author.id);
                            let warningMessage = await message.channel.send({
                                content: `${message.author}, please refrain from sending inappropriate content.`,
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription('To ensure a respectful and safe environment, we kindly ask you to adhere to the server rules and avoid sharing any NSFW content. Thank you for your cooperation.')
                                ],
                            });
                            await client.util.sleep(3000);
                            await warningMessage.delete();
                            setTimeout(() => {
                                guildWarnedSet.delete(message.author.id);
                            }, 10000);
                            break;

                        default:
                            console.error(`Unknown action: ${action}`);
                    }
                }
            } catch (err) {
                if (err.code === 429) {
                    await message.util.handleRateLimit();
                }
                console.error('Error in NSFW check:', err);
            }
        }
    });
*/


    // ANTI INVITE
    client.on('messageCreate', async (message) => {
        if (message.author.bot || message.author.id === client.user.id || message.author.id === message.guild.ownerId || !message.guild || !message.member || message.member.permissions.has('Administrator') || message.webhookId) return;
        if(await client.util.BlacklistCheck(message?.guild)) return
        try {

            let antiinvite = await client.db.get(`antiinvite_${message?.guild?.id}`);
            if (antiinvite.enabled !== true) return;

            const userId = message.author.id;
            const whitelistData = await client.db.get(`automodbypass_${message?.guild?.id}`) || { user: [], role: [], channel: [] };
            const { user: userWhitelist = [], role: roleWhitelist = [], channel: channelWhitelist = [] } = whitelistData;

            const isUserWhitelisted = userWhitelist.some((userEntry) => userEntry.id === userId && userEntry.settings.antiinvite);
            const isRoleWhitelisted = roleWhitelist.some((roleEntry) => message.member.roles.cache.some((role) => role.id === roleEntry.id && roleEntry.settings.antiinvite));
            const isChannelWhitelisted = channelWhitelist.some((channelEntry) => message.channel.id === channelEntry.id && channelEntry.settings.antiinvite);

            if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;

            const action = antiinvite.punishment;
            const urlRegex =  /(?:https?:\/\/)?(?:www\.)?(discord\.(gg|io|me|li|club)|discord(app)?\.com\/invite)\/[\w-]+/i;
            const allowedDomains = ["giphy.com", "tenor.com"];
            const isAllowedLink = (url) => allowedDomains.some((domain) => url.includes(domain));
            const checkmessage = message.content;
            const urls = checkmessage.match(urlRegex);

            if (urls && urls.some((url) => !isAllowedLink(url))) {
                await message.delete().catch(() => { });

                if (!action || action === "mute") {
                    try {
                        if (message.member.manageable && !message.member.isCommunicationDisabled()) {
                            await message.member.timeout(30 * 60 * 1000, "BITZXIER | ANTIINVITE | TIMEOUT").catch((err) => { });
                            let success = await message.channel.send({
                                embeds: [
                                    client.util.embed()
                                        .setColor(client.color)
                                        .setDescription(`${message.author.tag} has been muted for sending invite links.`),
                                ],
                            }).catch((err) => { });
                            await client.util.sleep(3000);
                            await success.delete().catch((err) => { });
                        }
                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit();
                        }
                    }
                } else if (action === "kick") {
                    try {
                        if (message.member.kickable) {
                            await message.guild.members.kick(message.member.id, "BITZXIER | ANTIINVITE | KICK").catch((err) => { });
                            let success = await message.channel.send({
                                embeds: [
                                    client.util
                                        .embed()
                                        .setColor(client.color)
                                        .setDescription(`${message.author.tag} has been kicked for sending invite links.`),
                                ],
                            }).catch((err) => { });
                            await client.util.sleep(3000);
                            await success.delete().catch((err) => { });
                        }
                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit();
                        }
                    }
                } else if (action === "ban") {
                    try {
                        if (message.member.bannable) {
                            await message.guild.members.ban(message.member.id, { reason: "BITZXIER | ANTIINVITE | BAN" }).catch((err) => { });
                            let success = await message.channel.send({
                                embeds: [
                                    client.util
                                        .embed()
                                        .setColor(client.color)
                                        .setDescription(`${message.author.tag} has been banned for sending invite links.`),
                                ],
                            }).catch((err) => { });
                            await client.util.sleep(3000);
                            await success.delete().catch((err) => { });
                        }
                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit();
                        }
                    }
                } else if (action === "none") {
                    try {
                        if (!client.recentlyinvitelinkwarned) client.recentlyinvitelinkwarned = new Map();
                        if (!client.recentlyinvitelinkwarned.has(message.guild.id)) client.recentlyinvitelinkwarned.set(message.guild.id, new Set());

                        const guildWarnedSet = client.recentlyinvitelinkwarned.get(message.guild.id);
                        if (guildWarnedSet.has(message.author.id)) return;

                        guildWarnedSet.add(message.author.id);
                        let warningMessage = await message.channel.send({
                            content: `${message.author}, don't send invite links here.`,
                            embeds: [
                                client.util
                                    .embed()
                                    .setColor(client.color)
                                    .setDescription("Please adhere to the server rules and avoid using invite links."),
                            ],
                        }).catch((err) => { });
                        await client.util.sleep(3000);
                        await warningMessage.delete().catch((err) => { });

                        setTimeout(() => {
                            guildWarnedSet.delete(message.author.id);
                        }, 10000);
                    } catch (err) {
                        if (err.code === 429) {
                            await client.util.handleRateLimit();
                        }
                    }
                }
            }
        } catch (err) {
            if (err.code === 429) {
                await client.util.handleRateLimit();
            }
        }
    });



// ANTI INVITE ON EDIT 
client.on('messageUpdate', async (oldMessage, newMessage) => {
    // Ensure we're not processing messages from bots or the client itself
    if (
        newMessage.author.bot ||
        newMessage.author.id === client.user.id ||
        newMessage.author.id === newMessage.guild.ownerId ||
        !newMessage.guild ||
        !newMessage.member ||
        newMessage.member.permissions.has('Administrator') ||
        newMessage.webhookId
    ) return;
    
    if(await client.util.BlacklistCheck(newMessage?.guild)) return

       const oldContent = oldMessage.content;
        const newContent = newMessage.content;

    if (oldContent === newContent) return;
    try {
        let antiinvite = await client.db.get(`antiinvite_${newMessage?.guild?.id}`);
        if (antiinvite.enabled !== true) return;

        const userId = newMessage.author.id;
        const whitelistData = await client.db.get(`automodbypass_${newMessage?.guild?.id}`) || { user: [], role: [], channel: [] };
        const { user: userWhitelist = [], role: roleWhitelist = [], channel: channelWhitelist = [] } = whitelistData;

        const isUserWhitelisted = userWhitelist.some((userEntry) => userEntry.id === userId && userEntry.settings.antiinvite);
        const isRoleWhitelisted = roleWhitelist.some((roleEntry) => newMessage.member.roles.cache.some((role) => role.id === roleEntry.id && roleEntry.settings.antiinvite));
        const isChannelWhitelisted = channelWhitelist.some((channelEntry) => newMessage.channel.id === channelEntry.id && channelEntry.settings.antiinvite);

        if (isUserWhitelisted || isRoleWhitelisted || isChannelWhitelisted) return;

        const action = antiinvite.punishment;
        const urlRegex = /(?:https?:\/\/)?(?:www\.)?(discord\.(gg|io|me|li|club)|discord(app)?\.com\/invite)\/[\w-]+/i;
        const allowedDomains = ["giphy.com", "tenor.com"];
        const isAllowedLink = (url) => allowedDomains.some((domain) => url.includes(domain));

 
        // If message content changes

        const urls = newContent.match(urlRegex);

        if (urls && urls.some((url) => !isAllowedLink(url))) {
            await newMessage.delete().catch(() => {});

            if (!action || action === "mute") {
                try {
                    if (newMessage.member.manageable && !newMessage.member.isCommunicationDisabled()) {
                        await newMessage.member.timeout(30 * 60 * 1000, "BITZXIER | ANTIINVITE | TIMEOUT").catch(() => {});
                        let success = await newMessage.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(`${newMessage.author.tag} has been muted for sending invite links.`),
                            ],
                        }).catch(() => {});
                        await client.util.sleep(3000);
                        await success.delete().catch(() => {});
                    }
                } catch (err) {
                    if (err.code === 429) {
                        await client.util.handleRateLimit();
                    }
                }
            } else if (action === "kick") {
                try {
                    if (newMessage.member.kickable) {
                        await newMessage.guild.members.kick(newMessage.member.id, "BITZXIER | ANTIINVITE | KICK").catch(() => {});
                        let success = await newMessage.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(`${newMessage.author.tag} has been kicked for sending invite links.`),
                            ],
                        }).catch(() => {});
                        await client.util.sleep(3000);
                        await success.delete().catch(() => {});
                    }
                } catch (err) {
                    if (err.code === 429) {
                        await client.util.handleRateLimit();
                    }
                }
            } else if (action === "ban") {
                try {
                    if (newMessage.member.bannable) {
                        await newMessage.guild.members.ban(newMessage.member.id, { reason: "BITZXIER | ANTIINVITE | BAN" }).catch(() => {});
                        let success = await newMessage.channel.send({
                            embeds: [
                                client.util.embed()
                                    .setColor(client.color)
                                    .setDescription(`${newMessage.author.tag} has been banned for sending invite links.`),
                            ],
                        }).catch(() => {});
                        await client.util.sleep(3000);
                        await success.delete().catch(() => {});
                    }
                } catch (err) {
                    if (err.code === 429) {
                        await client.util.handleRateLimit();
                    }
                }
            } else if (action === "none") {
                try {
                    if (!client.recentlyinvitelinkwarned) client.recentlyinvitelinkwarned = new Map();
                    if (!client.recentlyinvitelinkwarned.has(newMessage.guild.id)) client.recentlyinvitelinkwarned.set(newMessage.guild.id, new Set());

                    const guildWarnedSet = client.recentlyinvitelinkwarned.get(newMessage.guild.id);
                    if (guildWarnedSet.has(newMessage.author.id)) return;

                    guildWarnedSet.add(newMessage.author.id);
                    let warningMessage = await newMessage.channel.send({
                        content: `${newMessage.author}, don't send invite links here.`,
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription("Please adhere to the server rules and avoid using invite links."),
                        ],
                    }).catch(() => {});
                    await client.util.sleep(3000);
                    await warningMessage.delete().catch(() => {});

                    setTimeout(() => {
                        guildWarnedSet.delete(newMessage.author.id);
                    }, 10000);
                } catch (err) {
                    if (err.code === 429) {
                        await client.util.handleRateLimit();
                    }
                }
            }
        }
    } catch (err) {
        if (err.code === 429) {
            await client.util.handleRateLimit();
        }
    }
});

}