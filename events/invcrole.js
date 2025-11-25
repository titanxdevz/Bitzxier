module.exports = async (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
        await client.util.BlacklistCheck(oldState.guild.id)
        let guild = oldState.guild
        let data = await client.db.get(`vcroles_${guild.id}`)
        if (!data) return
        let role = await guild.roles.cache.get(data.vcrole)
        if (!role) {
            await client.db.set(`vcroles_${guild.id}`, {
                vcrole: null,
                vcrolebot: data ? data.vcrolebot : null
            })
            return
        }
        if (
            role &&
            !role.permissions.has([
                'Administrator',
                'KickMembers',
                'BanMembers',
                'ManageChannels',
                'ManageGuild',
                'MentionEveryone',
                'ManageRoles',
                'ManageWebhooks'
            ])
        ) {
            if (!oldState.channel && newState.channel) {
                await client.util.sleep(1000)
                if (!newState.member.user.bot) {
                    await newState.member.roles
                        .add(role, 'Member Joined Vc | Bitzxier Humans VC Role')
                        .catch((err) => null)
                }
            } else if (oldState.channel && !newState.channel) {
                await client.util.sleep(1000)
                if (!newState.member.user.bot) {
                    await oldState.member.roles
                        .remove(
                            role,
                            'Member Left Vc | Bitzxier Humans VC Role'
                        )
                        .catch((err) => null)
                }
            }
        }
    })

    client.on('voiceStateUpdate', async (oldState, newState) => {
        await client.util.BlacklistCheck(oldState.guild.id)
        let guild = oldState.guild
        let data = await client.db.get(`vcroles_${guild.id}`)
        if (!data) return
        let role = await guild.roles.cache.get(data.vcrolebot)
        if (!role) {
            await client.db.set(`vcroles_${guild.id}`, {
                vcrole: data ? data.vcrole : null,
                vcrolebot: null
            })
            return
        }
        try {
            if (
                role &&
                !role.permissions.has([
                    'Administrator',
                    'KickMembers',
                    'BanMembers',
                    'ManageChannels',
                    'ManageGuild',
                    'MentionEveryone',
                    'ManageRoles',
                    'ManageWebhooks'
                ])
            ) {
                if (!oldState.channel && newState.channel) {
                    await client.util.sleep(1000)
                    if (newState.member.user.bot) {
                        await newState.member.roles
                            .add(role, 'Bot Joined Vc | Bitzxier Bot Vc Role')
                            .catch((err) => null)
                    }
                } else if (oldState.channel && !newState.channel) {
                    await client.util.sleep(1000)
                    if (oldState.member.user.bot) {
                        await oldState.member.roles
                            .remove(role, 'Bot Left Vc | Bitzxier Bot Vc Role')
                            .catch((err) => null)
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
}
