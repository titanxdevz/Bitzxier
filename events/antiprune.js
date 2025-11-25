const { AuditLogEvent } = require('discord.js')
module.exports = async (client) => {
  client.on('guildAuditLogEntryCreate', async (audit, guild) => {
      const { executor } = audit;
      let check = await client.db.get(`blacklistserver_${client.user.id}`) || [];
      if (check.includes(guild?.id)) return
      await client.db
      ?.get(`${guild?.id}_${executor?.id}_wl`)
      .then(async (data) => {
      const antinuke = await client.db?.get(`${guild?.id}_antinuke`)
      if (audit.action === AuditLogEvent.MemberPrune) {
      if (antinuke !== true) return
      if (data) {
          if (data.prune) return
       }
      if(executor.id === client.user.id) return;
      if(executor.id === guild.ownerId) return;
      await guild.members.ban(executor.id, {
        reason : 'Member Prune | Not Whitelisted'
      }).catch((_) => { })
    } 
  })
  });
};
