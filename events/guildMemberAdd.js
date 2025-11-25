const { getSettingsar } = require('../models/autorole')

/**
 * @param {import('@src/structures').BotClient} client
 * @param {import('discord.js').GuildMember} member
 */
module.exports = async (client) => {
    client.on('guildMemberAdd', async (member) => {
        let check =  await client.util.BlacklistCheck(member.guild)
        if(check) return  
        if (!member || !member.guild || member.user.bot) return
        const { guild } = member
        const settings = await getSettingsar(guild)
        if (settings.autorole.length > 0) {
            let array = []
            for (let i = 0; i < settings.autorole.length; i++) {
                const roleId = settings.autorole[i]
                const role = guild.roles.cache.get(roleId)

                if (
                    role &&
                    !role.permissions.has(
                        'Administrator',
                        'KickMembers',
                        'BanMembers',
                        'ManageChannels',
                        'ManageGuild',
                        'MentionEveryone',
                        'ManageRoles',
                        'ManageWebhooks'
                    )
                ) {
                    array.push(role) 
                }
            }
            try {
                if(member.user.bot) return;
                await member.roles.add(array, 'Bitzxier Humans Autorole')
            } catch (err) {
                if (err.code === 429) {
                    await client.util.handleRateLimit()
                }
            }
        }

    })

    // autorole bot 
    client.on('guildMemberAdd', async (member) => {
        let check =  await client.util.BlacklistCheck(member.guild)
        if(check) return  
        if (!member || !member.guild || !member.user.bot) return
        const { guild } = member
        const settings = await getSettingsar(guild)
        if (settings.autorolebot.length > 0) {
            let arraybot = []
            for (let i = 0; i < settings.autorolebot.length; i++) {
                const roleId = settings.autorolebot[i]
                const role = guild.roles.cache.get(roleId)
                if (
                    role &&
                    !role.permissions.has(
                        'Administrator',
                        'KickMembers',
                        'BanMembers',
                        'ManageChannels',
                        'ManageGuild',
                        'MentionEveryone',
                        'ManageRoles',
                        'ManageWebhooks'
                    )
                ) {
                    arraybot.push(role)
                }
            }
            try {
                if(!member.user.bot) return;
                await member.roles.add(arraybot, 'Bitzxier Bots Autorole').catch((err) => { })
            } catch (err) {
                if (err.code === 429) {
                    await client.util.handleRateLimit()
                }
            }
        }
    })
    
    client.on('guildMemberAdd', async (member) => {

        let check =  await client.util.BlacklistCheck(member.guild)

        if(check) return  

        if (!member || !member.guild) return

        const { guild } = member

        const settings = await getSettingsar(guild)

        if (!settings.welcome.enabled) return

        client.util.sendWelcome(member, settings)

    })
}
