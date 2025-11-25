const { AuditLogEvent, EmbedBuilder, PermissionsBitField, WebhookClient } = require('discord.js'); // Ensure correct imports
const wait = require('wait')

module.exports = async (client) => {
  client.on("roleCreate", async (role) => {
    let check =  await client.util.BlacklistCheck(role.guild)
    if(check) return 
  let data = await client.db.get(`logs_${role.guild.id}`);
  if(!data || !data?.rolelog) return;
  const channel = data?.rolelog
  const rolelog = await role.guild.channels.cache.get(channel);
if(!rolelog) { 
  await client.db.set(`logs_${role.guild.id}`,{ 
    voice : data ? data.voice : null,
    channel : data ? data.channel : null,
    rolelog : null,
    modlog : data ? data.modlog : null,   
    message : data ? data.message : null,
    memberlog : data ? data.memberlog : null
})
return;
}
  const auditLogs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleCreate });
  const logs = auditLogs.entries.first();
 const { executor, target, createdTimestamp } = logs;
  let = difference = Date.now() - createdTimestamp;
  if (difference > 5000 ) return;
if (data) {
  const roleCreateEmbed = client.util.embed()
  .setAuthor({ name : `${executor.tag}`,iconURL : executor.displayAvatarURL({ dynamic: true })})
  .setTitle(`Role Created: ${role.name}`)
  .setDescription(`**Role Information:**\n\n` +
  `- Role Name: ${role.name}\n` +
  `- Role ID: ${role.id}\n` +
  `- Displayed separately: ${role.hoist ? 'Yes' : 'No'}\n` +
  `- Mentionable: ${role.mentionable ? 'Yes' : 'No'}\n` +
  `- Role Position: ${role.position}\n` +
  `- Created By: ${executor.tag} (${executor.id})\n\n` +
  `**Role Permissions:**\n\n` +
  `${role.permissions.toArray().map(perm => `• ${perm}`).join('\n')}\n`
)
    
      .setColor(client.color) 
      .setThumbnail(executor.displayAvatarURL({ dynamic: true }))
  .setFooter({ text : `${role.guild.name}`, iconURL : role.guild.iconURL({ dynamic: true })})
  .setTimestamp();


  await wait(2000);
  await rolelog.send({ embeds: [roleCreateEmbed] }).catch((_) => { });

} 

})

client.on("roleDelete", async (role) => {
  let check =  await client.util.BlacklistCheck(role.guild)
  if(check) return    
    let data = await client.db.get(`logs_${role.guild.id}`);
    if(!data || !data?.rolelog) return;
    if(!data?.rolelog) return;
    const channel = data?.rolelog
    const rolelog = await role.guild.channels.cache.get(channel);
  if(!rolelog) { 
    await client.db.set(`logs_${role.guild.id}`,{ 
      voice : data ? data.voice : null,
      channel : data ? data.channel : null,
      rolelog : null,
      modlog : data ? data.modlog : null,   
      message : data ? data.message : null,
      memberlog : data ? data.memberlog : null
  })
  return;
  }
    const auditLogs = await role.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete });
    const logs = auditLogs.entries.first();
   const { executor, target, createdTimestamp } = logs;
    let = difference = Date.now() - createdTimestamp;
    if (difference > 5000 ) return;
  if(data) {
    const roleDeleteEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Role Deleted', iconURL: executor.displayAvatarURL({ dynamic: true }) })
        .setTitle(`Role: ${role.name}`)
        .setDescription(
            `**Role Information:**\n` +
            `- Role Name: ${role.name}\n` +
            `- Role ID: ${role.id}\n` +
            `- Displayed Separately: ${role.hoist ? 'Yes' : 'No'}\n` +
            `- Mentionable: ${role.mentionable ? 'Yes' : 'No'}\n` +
            `- Deleted By: ${executor.tag} (${executor.id})\n\n` +
            `**Role Permissions:**\n` +
            `${role.permissions.toArray().map(perm => `- ${perm}`).join('\n')}`
        )
        .setColor(client.color)
        .setThumbnail(executor.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: role.guild.name, iconURL: role.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

    await rolelog.send({ embeds: [roleDeleteEmbed] }).catch(() => {});
  }
    
  }
  )


  client.on("roleUpdate", async (oldRole, newRole) => {
    let check = await client.util.BlacklistCheck(oldRole.guild);
    if (check) return;

    let data = await client.db.get(`logs_${oldRole.guild.id}`);
    if(!data || !data?.rolelog) return;
  const channel = data?.rolelog
  const rolelog = await oldRole.guild.channels.cache.get(channel);
if(!rolelog) { 
  await client.db.set(`logs_${oldRole.guild.id}`,{ 
    voice : data ? data.voice : null,
    channel : data ? data.channel : null,
    rolelog : null,
    modlog : data ? data.modlog : null,   
    message : data ? data.message : null,
    memberlog : data ? data.memberlog : null
})
return;
}
    const auditLogs = await newRole.guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleUpdate });
    const logs = auditLogs.entries.first();
    if (!logs) return;

    const { executor, createdTimestamp } = logs;
    let difference = Date.now() - createdTimestamp;
    if (difference > 5000) return;

    const roleUpdateEmbed = new EmbedBuilder()
    .setColor(client.color)
    .setAuthor({ name: 'Role Update', iconURL: executor.displayAvatarURL({ dynamic: true }) })
    .setThumbnail(executor.displayAvatarURL({ dynamic: true }))
    .setDescription(`**Role:** ${oldRole}\n**Role ID:** ${oldRole.id}\n**Executor:** ${executor.tag}\n**Executor ID:** ${executor.id}`)
    .setFooter({ text: newRole.guild.name, iconURL: newRole.guild.iconURL({ dynamic: true }) })
    .setTimestamp();

if (oldRole.name !== newRole.name) {
    roleUpdateEmbed.addFields({ name: 'Name', value: `Old Name: \`${oldRole.name}\`\nNew Name: \`${newRole.name}\``, inline: false });
}
if (oldRole.color !== newRole.color) {
    roleUpdateEmbed.addFields({ name: 'Color', value: `Old Color: \`${oldRole.color}\`\nNew Color: \`${newRole.color}\``, inline: false });
}
if (oldRole.hoist !== newRole.hoist) {
    roleUpdateEmbed.addFields({ name: 'Display', value: `Old Display: \`${oldRole.hoist}\`\nNew Display: \`${newRole.hoist}\``, inline: false });
}
if (oldRole.mentionable !== newRole.mentionable) {
    roleUpdateEmbed.addFields({ name: 'Mentionable', value: `Old Mentionable: \`${oldRole.mentionable}\`\nNew Mentionable: \`${newRole.mentionable}\``, inline: false });
}

const formatPermissions = permissions => permissions instanceof PermissionsBitField
    ? permissions.toArray().map(permission => `\`${permission}\``).join(', ')
    : 'No Permissions';

roleUpdateEmbed.addFields({
    name: 'Permissions',
    value: `Old Permissions: ${formatPermissions(oldRole.permissions)}\nNew Permissions: ${formatPermissions(newRole.permissions)}`,
    inline: false
});
await rolelog.send({ embeds: [roleUpdateEmbed] }).catch((err) => { })
});

   }
