const { EmbedBuilder, AuditLogEvent, ChannelType, WebhookClient } = require('discord.js'); // Ensure correct imports
const wait = require('wait')
module.exports = async (client) => {

  async function logPermissionChanges(action, oldChannel, newChannel, target, overwrite) {
    try {
        const check = await client.util.BlacklistCheck(oldChannel.guild);
        if (check) return;

        const data = await client.db.get(`logs_${oldChannel.guild.id}`);
        if(!data || !data?.channel) return;
        const cchannel = data?.channel
        const channellog = await oldChannel.guild.channels.cache.get(cchannel);
        if(!channellog) {
          await client.db.set(`logs_${oldChannel.guild.id}`,{ 
            voice : data ? data.voice : null,
            channel : null,
            rolelog : data ? data.rolelog : null,
            modlog : data ? data.modlog : null,   
            message : data ? data.message : null,
            memberlog : data ? data.memberlog : null
        })
        return;
        }
        const auditLogs = await newChannel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelOverwriteUpdate });
        const auditEntry = auditLogs.entries.first();
        const responsibleUser = auditEntry ? auditEntry.executor : null;

        const targetType = target.user ? 'User' : 'Role';
        const targetName = target.user ? target.user.tag : target.name;
        const targetId = target.id;

        let changes = [];
        if (overwrite) {
            const allow = overwrite.allow.toArray().join(", ") || 'None';
            const deny = overwrite.deny.toArray().join(", ") || 'None';
            changes.push({
                name: `${action}`,
                value: `**Allow:** ${allow}\n**Deny:** ${deny}\n**Type:** ${targetType}\n**Name:** ${targetName}\n**Id:** ${targetId}`
            });
        } else {
            changes.push({
                name: `${action}`,
                value: `**Type:** ${targetType}\n**Name:** ${targetName}\n**Id:** ${targetId}`
            });
        }

        if (changes.length > 0) {
            const responsible = responsibleUser ? `<@${responsibleUser.id}>` : 'Unknown';
            const channel = `<#${newChannel.id}>`;

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle('Channel Permission Update')
                .addFields(
                    { name: 'Responsible', value: responsible, inline: true },
                    { name: 'Channel', value: channel, inline: true },
                    { name: 'Timestamp', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
                    ...changes
                )
                .setFooter({ text: 'Permission Change Log', iconURL: client.user.avatarURL() });

    await channellog.send({ embeds: [embed] }).catch((err) => { })
        }
    } catch (error) {
      return;
    }
}

client.on('channelUpdate', async (oldChannel, newChannel) => {
    try {
        const oldPermissions = oldChannel.permissionOverwrites.cache;
        const newPermissions = newChannel.permissionOverwrites.cache;

        newPermissions.forEach(async (overwrite, id) => {
          const oldOverwrite = oldPermissions.get(id);
            const target = newChannel.guild.roles.cache.get(id) || newChannel.guild.members.cache.get(id);

            if (!oldOverwrite) {
              await logPermissionChanges('Granted', oldChannel, newChannel, target, overwrite);
                return;
            }

            const oldAllow = oldOverwrite.allow.toArray();
            const newAllow = overwrite.allow.toArray();

            const grantedPermissions = newAllow.filter(perm => !oldAllow.includes(perm));
            const deniedPermissions = oldAllow.filter(perm => !newAllow.includes(perm));

            if (grantedPermissions.length > 0) {
          await logPermissionChanges('Granted', oldChannel, newChannel, target, overwrite);
            }

            if (deniedPermissions.length > 0) {
          await logPermissionChanges('Denied', oldChannel, newChannel, target, overwrite);
            }
        });

        oldPermissions.forEach(async (overwrite, id) => {
            if (!newPermissions.get(id)) {
              const target = newChannel.guild.roles.cache.get(id) || newChannel.guild.members.cache.get(id);
                await logPermissionChanges('Denied', oldChannel, newChannel, target, null);
            }
        });
    } catch (error) {
      return;
      }
});

client.on("channelCreate", async (channel) => {
  let check =  await client.util.BlacklistCheck(channel.guild)
  if(check) return   
  let data = await client.db.get(`logs_${channel.guild.id}`);
  if(!data || !data?.channel) return;
  const cchannel = data?.channel
  const channellog = await channel.guild.channels.cache.get(cchannel);
  if(!channellog) {
    await client.db.set(`logs_${channel.guild.id}`,{ 
      voice : data ? data.voice : null,
      channel : null,
      rolelog : data ? data.rolelog : null,
      modlog : data ? data.modlog : null,   
      message : data ? data.message : null,
      memberlog : data ? data.memberlog : null
  })
  return; 
  }
  const auditLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelCreate });
  const logs = auditLogs.entries.first();
 const { executor, target, createdTimestamp } = logs;
  let = difference = Date.now() - createdTimestamp;
  if (difference > 5000 ) return;  
  if(executor.id === client.user.id) return
if(data) {
  const channelType = channel.type === ChannelType.GuildText ? 'TEXT CHANNEL' :
  channel.type === ChannelType.GuildVoice ? 'VOICE CHANNEL' :
  channel.type === ChannelType.GuildCategory ? 'CATEGORY CHANNEL' :
  channel.type === ChannelType.GuildAnnouncement ? 'NEWS CHANNEL' :
  channel.type === ChannelType.GuildDirectory ? 'STORE CHANNEL' :
  'UNKNOWN CHANNEL TYPE';
   const channelcreate = client.util.embed()
   channelcreate.setAuthor({ name : executor.tag, iconURL  : executor.displayAvatarURL({ dynamic : true })})
  channelcreate.addFields([
    {
        name: `Channel Name`,
        value: `${channel.name}`
    },
    {
        name: `Channel Mention`,
        value: `<#${channel.id}>`
    },
  {
    name: `Channel Id`,
    value: `${channel.id}`

  },
  {
    name : `Channel Category`,
    value: ` ${channel.parent ? channel.parent.name : "No Category"}`
  },
{
  name : `Created By`,
  value: `${executor}\n`
},
{
name : `User Id`,
value : `${executor.id}`
},
{
  name : `Time`,
  value : `<t:${Math.round(channel.createdTimestamp / 1000)}:R>`
},
{
  name : `Channel Type`,
  value: `\`${channelType}\``
}
])
   channelcreate.setThumbnail(`${executor.displayAvatarURL({dynamic: true})}`)

    channelcreate.setColor(client.color)
  channelcreate.setFooter({ text : channel.guild.name, iconURL : channel.guild.iconURL({dynamic : true })})
    channelcreate.setTimestamp()
    await wait(2000);
    await channellog.send({ embeds : [channelcreate]}).catch((_) => { });
}
});
 
client.on("channelDelete", async (channel) => {
  let check =  await client.util.BlacklistCheck(channel.guild)
  if(check) return   
   let data = await client.db.get(`logs_${channel.guild.id}`);
   if(!data || !data?.channel || !data?.channel?.webhook) return;
   const cchannel = data.channel.channelID;
   const channellog = await channel.guild.channels.cache.get(cchannel);
   if(!channellog) {
     await client.db.set(`logs_${channel.guild.id}`,{ 
       voice : data ? data.voice : null,
       channel : null,
       rolelog : data ? data.rolelog : null,
       modlog : data ? data.modlog : null,   
       message : data ? data.message : null,
       memberlog : data ? data.memberlog : null
   })
   return;
   }
const auditLogs = await channel.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
const logs = auditLogs.entries.first();
const { executor, target, createdTimestamp } = logs;
  let = difference = Date.now() - createdTimestamp;
  if (difference > 5000 ) return;  

  if(executor.id === client.user.id) return
  if(data) {
    const channelType = channel.type === ChannelType.GuildText ? 'TEXT CHANNEL' :
    channel.type === ChannelType.GuildVoice ? 'VOICE CHANNEL' :
    channel.type === ChannelType.GuildCategory ? 'CATEGORY CHANNEL' :
    channel.type === ChannelType.GuildAnnouncement ? 'NEWS CHANNEL' :
    channel.type === ChannelType.GuildDirectory ? 'STORE CHANNEL' :
    'UNKNOWN CHANNEL TYPE';
   const channeldelete = client.util.embed()
   channeldelete.setAuthor({ name : executor.tag, iconURL : executor.displayAvatarURL({dynamic : true})})
   channeldelete.addFields([
    {
        name: `Channel Name`,
        value: `${channel.name}`
    },
    {
        name: `Channel Mention`,
        value: `<#${channel.id}>`
    },
  {
    name: `Channel Id`,
    value: `${channel.id}`

  },
  
{
  name : `Removed By`,
  value: `${executor}\n`
},
{
name : `User Id`,
value : `${executor.id}`
},
{
  name : `Time`,
  value : `<t:${Math.round(logs.createdTimestamp  / 1000)}:R>`
},
{
  name : `Channel Type`,
  value: `\`${channelType}\``
}
])
   channeldelete.setThumbnail(`${executor.displayAvatarURL({dynamic: true})}`)

    channeldelete.setColor(client.color)
  channeldelete.setFooter({ text : channel.guild.name, iconURL : channel.guild.iconURL({dynamic : true })})
    channeldelete.setTimestamp()
    await wait(2000);
    await channellog.send({ embeds : [channeldelete]}).catch((_) => { });
    }
  });

  client.on("channelUpdate", async (o, n) => {
   let check =  await client.util.BlacklistCheck(o.guild)
   if(check) return
    let data = await client.db.get(`logs_${o.guild.id}`);
    if(!data || !data?.channel) return;
    const cchannel = data?.channel
    const channellog = await o.guild.channels.cache.get(cchannel);
    if(!channellog) {
      await client.db.set(`logs_${o.guild.id}`,{ 
        voice : data ? data.voice : null,
        channel : null,
        rolelog : data ? data.rolelog : null,
        modlog : data ? data.modlog : null,   
        message : data ? data.message : null,
        memberlog : data ? data.memberlog : null
    })
    return;
    }
    const auditLogs = await n.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelUpdate });
    const logs = auditLogs.entries.first();
   const { executor, target, createdTimestamp } = logs;
    let = difference = Date.now() - createdTimestamp;
    if (difference > 5000 ) return;  
    if(executor.id === client.user.id) return

    const oldName = o.name;
      const newName = n.name;
   const oldNsfw = o.nsfw;
        const newNsfw = n.nsfw;
    const oldTopic = o.topic;
        const newTopic = n.topic;
    const oldrtcRegion = o.rtcRegion;
        const newrtcRegion = n.rtcRegion;
  const oldbitrate = o.bitrate;
        const newbitrate = n.bitrate;
    const olduserLimit = o.userLimit;
        const newuserLimit = n.userLimit;
    const oldvideoQualityMode = o.videoQualityMode;
        const newvideoQualityMode = n.videoQualityMode;
    const oldcooldown = o.rateLimitPerUser;
    const newcooldown = n.rateLimitPerUser;
    

  const newbitratevalue = n.bitrate / 1000
  const oldbitratevalue = o.bitrate / 1000
  
  if(data){
    const channelupdate = client.util.embed()
  
    channelupdate.setAuthor({ name : executor.tag, iconURL : executor.displayAvatarURL({ dynamic : true })})
    channelupdate.setTimestamp()
    channelupdate.setDescription(`${o.type === ChannelType.GuildText ? 'Text' : 'Voice'} Channel <#${n.id}> updated by ${executor}\n`)
    channelupdate.setColor(client.color)
    if(oldName !== newName ) channelupdate.addFields(
          { name: 'Channel Renamed', value: `\`${o.name}\` -> \`${n.name}\``,inline: false },
      )
      if(oldNsfw !== newNsfw ) channelupdate.addFields(
          { name: 'Channel NSFW State Updated', value: `\`${o.nsfw}\` -> \`${n.nsfw}\``,inline: false },
      )
     if(oldcooldown !== newcooldown ) channelupdate.addFields(
          { name: 'Channel Slowmode Updated', value: `\`${o.rateLimitPerUser} seconds \` -> \`${n.rateLimitPerUser} seconds \``,inline: false },
      )
     if(oldTopic !== newTopic ) channelupdate.addFields(
          { name: 'Channel Topic Updated', value: `\`${o.topic} \` -> \`${n.topic} \``,inline: false },
      )
      if(oldrtcRegion !== newrtcRegion ) channelupdate.addFields(
          { name: 'Channel Voice Region Updated', value: `\`${o.rtcRegion} \` -> \`${n.rtcRegion} \``,inline: false },
      )
     if(oldbitrate !== newbitrate ) channelupdate.addFields(
          { name: 'Channel Voice Bitrate Updated', value: `\`${oldbitratevalue} Kbps\` -> \`${newbitratevalue} Kbps\``,inline: false },
      )
       if(olduserLimit !== newuserLimit ) channelupdate.addFields(
          { name: 'Channel Voice UserLimit Updated', value: `\`${o.userLimit} users\` -> \`${n.userLimit} users\``,inline: false },
      )
      
    else if (o.type === ChannelType.GuildVoice) {
    channelupdate.addFields(
          { name: 'Channel Voice Updated', value: `Channel Video Quality Mode Updated`,inline: false },
      )}
      channelupdate.addFields(
        { name: 'Updated At', value: `<t:${Math.round(logs.createdTimestamp  / 1000)}:R>`,inline: false },
    )
      await wait(2000);
      await channellog.send({ embeds : [channelupdate]}).catch((_) => { });
  
    
      }
  
    
  
  }) 




};
