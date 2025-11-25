const { AuditLogEvent , PermissionFlagsBits } = require('discord.js')

module.exports = async (client) => {
    client.on('webhooksUpdate', async (webhook) => {
        let check =  await client.util.BlacklistCheck(webhook.guild)
        if(check) return  
                    const auditLogs = await webhook.guild
            .fetchAuditLogs({ limit: 2, type: AuditLogEvent.WebhookDelete })
            .catch((_) => {})
        const logs = auditLogs?.entries?.first()
        if (!logs) return
        const { executor, target, createdTimestamp } = logs
        let = difference = Date.now() - createdTimestamp
        if (difference > 3600000) return
        await client.db
            ?.get(`${webhook.guild.id}_${executor?.id}_wl`)
            .then(async (data) => {
                const antinuke = await client.db.get(
                    `${webhook.guild.id}_antinuke`
                )
                if (antinuke !== true) return
                if (data) {
                    if (data.mngweb) return
                }
                if (executor.id === webhook.guild.ownerId) return
                if (executor.id === client.user.id) return
                const panic = await client.db.get(`panic_${webhook.guild.id}`)
                if(panic) {
            const member1 = webhook.guild.members.cache.get(executor?.id);
            let perms = member1 && member1.roles ? member1.roles.cache.filter(x => x.permissions.has("Administrator") && x.permissions.has("ManageWebhooks") && x.editable) : null;
            let role = webhook.guild.roles.cache.find(role => role.name == 'Quarantine')
            let punishment = await client.db.get(`panicp_${webhook.guild.id}`)
            const action = punishment.data
            if (!action || action === 'ban') {
                try {

                  if (executor.bot) {
                      executor.guild = webhook.guild
                      let ok = webhook.guild.members.cache.get(executor.id) ? webhook.guild.members.cache.get(executor.id) : await webhook.guild.members.fetch(executor.id).catch((_) => { })
                      if (ok) {
                          ok.roles.cache
                          .filter(x => x.id !== webhook.guild.roles.everyone.id && x.id !== role.id)
                          .forEach(async (r) => {
                                  try {
                                      if (r.permissions.has("ManageWebhooks") || r.permissions.has("Administrator")) {
                                          await r.setPermissions([], 'Panic Mode | Anti Webhook Delete | Not Whitelisted').catch((_) => { })
                                      }
                                      await ok.roles.remove(r.id).catch((_) => { })
                                  } catch (err) {
                                      return;
                                  }
                              });
                      await client.util.FuckYou(executor, 'Panic Mode | Anti Webhook Delete | Not Whitelisted').catch((_) => { })
                      } 
                  } else {
                      await Promise.all([
                          executor.guild = webhook.guild,
                          perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Webhook Delete | Not Whitelisted')),
                          await member1.roles.remove(perms, `Panic Mode | Anti Webhook Delete | Not Whitelisted`),
                          await client.util.FuckYou(executor, 'Panic Mode | Anti Webhook Delete | Not Whitelisted'),
                      ])
                  }
                      } catch (err) {
                  if (err.code === 429) {
                      await client.util.handleRateLimit()
                  }
                  return
              }
          
      } else if (action === 'quarantine') {
  try {
      if(!role) {
         role = await webhook.guild.roles.create({
            name : `Quarantine`,
            color : `#b38844`,
            permissions : [],
            position : 0,
            reason : `Panic Mode | Quarantine System`
          }).catch(err => null)
        }
        if (role.permissions.has("BanMembers") || role.permissions.has("Administrator") || role.permissions.has("KickMembers") || role.permissions.has("ManageChannels") || role.permissions.has("ManageGuild") || role.permissions.has("MentionEveryone") || role.permissions.has("ManageRoles") || role.permissions.has("ManageWebhooks") || role.permissions.has("ModerateMembers") || role.permissions.has("ManageEvents")) {
            await role.setPermissions([], 'Removing Dangerous Permissions From Quarentine Role')
            await role.setPosition(0)
        }
        if (executor.bot) {
          executor.guild = webhook.guild
          let ok = webhook.guild.members.cache.get(executor.id) ? webhook.guild.members.cache.get(executor.id) : await webhook.guild.members.fetch(executor.id).catch((_) => { })
          if (ok) {
              ok.roles.cache
                  .filter(x => x.id !== webhook.guild.roles.everyone.id && x.id !== role.id)
                  .forEach(async (r) => {
                      try {
                          if (r.permissions.has("ManageWebhooks") || r.permissions.has("Administrator")) {
                              await r.setPermissions([], 'Panic Mode | Anti Webhook Delete | Not Whitelisted').catch((_) => { })
                          }
                          await ok.roles.remove(r.id).catch((_) => { })
                      } catch (err) {
                          return;
                      }
                  });
              let managed = ok.roles.cache.filter(role => role.managed)
              managed.map(async x => await x.setPermissions([], 'Panic Mode | Anti Webhook Delete | Not Whitelisted')).catch((_) => { })
              await member1.roles.add(role.id, `Panic Mode | Anti Webhook Delete | Not Whitelisted`).catch((_) => { })
          }
      } else {
          await Promise.all([
              executor.guild = webhook.guild,
              await member1.roles.set([role.id], `Panic Mode | Anti Webhook Delete | Not Whitelisted`),
              perms.map(async role => await role.setPermissions([], 'Panic Mode | Anti Webhook Delete | Not Whitelisted')),
          ])
      }
      await client.util.sleep(2000)
                  } catch (err) {
              if (err.code === 429) {
                  await client.util.handleRateLimit()
              }
              return
          }
}
             } else {
                try {
                    executor.guild = webhook.guild
                    await client.util
                        .FuckYou(executor, 'Webhook Delete | Not Whitelisted')
                        .catch((err) => null)
                } catch (err) {
                    if (err.code === 429) {
                        await client.util.handleRateLimit()
                    }
                    return
                }
            }
            })
    })
}
