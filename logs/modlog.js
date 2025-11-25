const wait = require('wait')
const { EmbedBuilder, AuditLogEvent, ChannelType, WebhookClient } = require('discord.js'); // Ensure correct import

module.exports = async (client) => { 

client.on("guildBanAdd", async (guild, user) => {
  let check =  await client.util.BlacklistCheck(guild.guild)
  if(check) return  
    let data = await client.db.get(`logs_${guild?.guild?.id}`);
    if(!data || !data?.modlog) return;
    const channel = data?.modlog
    const modlog1 = await guild?.guild?.channels.cache.get(channel);
    if (!modlog1) { 
      await client.db.set(`logs_${guild?.guild?.id}`,{ 
        voice : data ? data.voice : null,
      channel : data ? data.channel : null,
      rolelog : data ? data.rolelog : null,
      modlog : null,   
      message : data ? data.message : null,
      memberlog : data ? data.memberlog : null
  })
  return;
}
  const auditLogs = await guild?.guild?.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanAdd });
  const logs = auditLogs.entries.first();
  if (!logs) return
 const { executor, target, createdTimestamp } = logs;
  let = difference = Date.now() - createdTimestamp;
  if (difference > 5000 ) return;
  if (data) {
    const banEmbed = client.util.embed()
    banEmbed.setColor(client.color)
    banEmbed.setThumbnail(target.displayAvatarURL({ dynamic: true }))
    banEmbed.setAuthor({ name : `${target.username} was banned`, iconURL : target.displayAvatarURL({ dynamic : true })});
    banEmbed.addFields({ name : 'Banned By',value : `${executor.tag} (${executor.id})`});
    banEmbed.setTimestamp();
    await wait(2000);
    await modlog1.send({ embeds: [banEmbed] }).catch((_) => { });
  }
});

client.on("guildBanRemove", async (guild, user) => {
  let check =  await client.util.BlacklistCheck(guild.guild)
  if(check) return  
    let data = await client.db.get(`logs_${guild?.guild?.id}`);
    if(!data || !data?.modlog) return;
    const channel = data?.modlog
    const modlog1 = await guild?.guild?.channels.cache.get(channel);
    if (!modlog1) { 
      await client.db.set(`logs_${guild?.guild?.id}`,{ 
        voice : data ? data.voice : null,
      channel : data ? data.channel : null,
      rolelog : data ? data.rolelog : null,
      modlog : null,   
      message : data ? data.message : null,
      memberlog : data ? data.memberlog : null
  })
  return;
}
  const auditLogs = await guild?.guild?.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberBanRemove });
  const logs = auditLogs.entries.first();
 const { executor, target, createdTimestamp } = logs;
  let = difference = Date.now() - createdTimestamp;
  if (difference > 5000 ) return;
  if (data) {
    const unbanEmbed = client.util.embed()
    unbanEmbed.setColor(client.color)
    unbanEmbed.setThumbnail(target.displayAvatarURL({ dynamic: true }))
    unbanEmbed.setAuthor({ name : `${target.username} was unbanned`, iconURL : target.displayAvatarURL({ dynamic : true })});
    unbanEmbed.addFields({ name : 'Unbanned By',value :  `${executor.tag} (${executor.id})`});
    unbanEmbed.setTimestamp();
    await wait(2000);
    await modlog1.send({ embeds: [unbanEmbed] }).catch((_) => { });
  }
});

client.on("guildMemberRemove", async (member) => {
  let check = await client.util.BlacklistCheck(member.guild);
  if (check) return;

  let data = await client.db.get(`logs_${member.guild.id}`);
  if (!data || !data.modlog) return;

  const channelID = data.modlog;
  const modlogChannel = member.guild.channels.cache.get(channelID);

  if (!modlogChannel) {
    await client.db.set(`logs_${member.guild.id}`, {
      voice: data ? data.voice : null,
      channel: data ? data.channel : null,
      rolelog: data ? data.rolelog : null,
      modlog: null,
      message: data ? data.message : null,
      memberlog: data ? data.memberlog : null
    });
    return;
  }
  const auditLogs = await member.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.MemberKick });
  const logEntry = auditLogs.entries.first();

  if (!logEntry) return;

  const { executor, target, createdTimestamp } = logEntry;
  const difference = Date.now() - createdTimestamp;

  if (difference > 5000) return;

  if (data) {
    const kickEmbed = client.util.embed()
      .setColor(client.color)
      .setAuthor({ name: `${member.user.username} was kicked`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields({ name: 'Kicked By', value: `${executor.tag} (${executor.id})` })
      .setTimestamp();

    await wait(2000);
    await modlogChannel.send({ embeds: [kickEmbed] }).catch((_) => { });
  }
});
}