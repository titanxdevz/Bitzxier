const {  WebhookClient, Permissions} = require("discord.js");
const wait = require('wait')

module.exports = async (client) => {
    client.on('voiceStateUpdate', async (oldState, newState) => {
      let check =  await client.util.BlacklistCheck(oldState.guild)
      if(check) return  
         let data = await client.db.get(`logs_${oldState.guild.id}`);
        if(!data || !data?.voice) return;
        const channell = data?.voice
        const voicelog = await oldState.guild.channels.cache.get(channell);
        if (!voicelog) { 
          await client.db.set(`logs_${oldState.guild.id}`, {
          voice : null,
          channel: data ? data.channel : null,
          rolelog: data ? data.rolelog : null,
          modlog: data ? data.modlog : null,
          message: data ? data.message : null,
          memberlog: data ? data.memberlog : null,
        })
        return;
      }
        const member = newState.member;
        const channel = newState.channel;

        if (!oldState.channelId && newState.channelId) {
            const joinedChannel = newState.channel.name || 'NONE';
    
            const joinEmbed = client.util.embed()
                .setColor(client.color) 
            
                .setThumbnail(member.displayAvatarURL({ dyanmic : true}) ? member.displayAvatarURL({ dyanmic : true}) : message.guild.iconURL({ dyanmic : true}))
                .setTitle('Member Joined Voice Channel')
                .setDescription(`${member.user.tag} joined voice channel "${joinedChannel}"`)
                .addFields({name :'Channel',value : joinedChannel })
                .setFooter({ text : `${member.user.tag} joined voice channel`, iconURL : member.displayAvatarURL({ dyanmic : true})})
                .setTimestamp();

                await wait(2000);
                await voicelog.send({ embeds: [joinEmbed] }).catch((err) => null)
        }
    
        if (oldState.channelId && !newState.channelId) {
            const leftChannel = oldState.channel.name || 'NONE';
    
            const leaveEmbed = client.util.embed()
                .setColor(client.color) 
                .setThumbnail(member.displayAvatarURL({ dyanmic : true}) ? member.displayAvatarURL({ dyanmic : true}) : message.guild.iconURL({ dyanmic : true}))
                .setTitle('Member Left Voice Channel')
                .setDescription(`${member.user.tag} left voice channel "${leftChannel}"`)
                .addFields({ name : 'Channel', value : leftChannel })
                .setFooter({ text : `${member.user.tag} Leaved voice channel`, iconURL : member.displayAvatarURL({ dyanmic : true})})
                .setTimestamp();

await wait(2000);
await voicelog.send({ embeds: [leaveEmbed] }).catch((err) => null)
        }
    
        if (
            oldState.channelId !== newState.channelId &&    // Check if the channel has changed
            oldState.channel && newState.channel           // Check if both old and new channels are not null
        ) {
            let oldChannel = oldState.channel.name;
            let newChannel = newState.channel.name;
        
            const moveEmbed = client.util.embed()
                .setColor(client.color)
                .setThumbnail(member.displayAvatarURL({ dyanmic : true}) ? member.displayAvatarURL({ dyanmic : true}) : message.guild.iconURL({ dyanmic : true}))
                .setTitle('Member Moved Voice Channels')
                .setDescription(`${member.user.tag} moved from "${oldChannel}" to "${newChannel}"`)
                .addFields({ name: 'From', value: oldChannel })
                .addFields({ name: 'To', value: newChannel })
                .setFooter({ text : `${member.user.tag} was moved from voice`, iconURL : member.user.displayAvatarURL({ dynamic: true })})
                .setTimestamp();
        
            try {
                await wait(2000);  // Optional delay
                await voicelog.send({ embeds: [moveEmbed] });
            } catch (err) {
                return;
            }
        }
    
        if (oldState.channel) {
            if (oldState.streaming !== newState.streaming) {
            const embed = client.util.embed()
                .setColor(client.color)
                .setThumbnail(member.displayAvatarURL({ dynamic: true }) ? member.displayAvatarURL({ dynamic: true }) : newState.guild.iconURL({ dynamic: true }))
                .setTitle('Screen Sharing Update')
                .setDescription(`${member.user.tag} has ${newState.streaming ? 'started' : 'stopped'} screen sharing in \`${channel ? channel.name : 'a channel'}\``)
                .addFields({ name: 'Channel', value: channel ? channel.name : 'N/A' })
                .setFooter({ text: `${member.user.tag} updated screen sharing`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
    
            try {
                await wait(2000);  // Optional delay
                await voicelog.send({ embeds: [embed] });
            } catch (err) {
                console.error('Failed to send screen sharing log:', err);
            }
        }
    
        let changes = [];
    
        // Check for server mute/unmute
        if (oldState.serverMute !== newState.serverMute) {
            changes.push({
                title: newState.serverMute ? 'User Server Muted' : 'User Server Unmuted',
                description: `${member.user.tag} has been ${newState.serverMute ? 'server muted' : 'server unmuted'} in \`${channel ? channel.name : 'a channel'}\``,
            });
        }
    
        // Check for server deafen/undeafen
        if (oldState.serverDeaf !== newState.serverDeaf) {
            changes.push({
                title: newState.serverDeaf ? 'User Server Deafened' : 'User Server Undeafened',
                description: `${member.user.tag} has been ${newState.serverDeaf ? 'server deafened' : 'server undeafened'} in \`${channel ? channel.name : 'a channel'}\``,
            });
        }
    
        // Send embed messages for each change
        for (const change of changes) {
            const embed = client.util.embed()
                .setColor(client.color)
                .setThumbnail(member.displayAvatarURL({ dynamic: true }) ? member.displayAvatarURL({ dynamic: true }) : newState.guild.iconURL({ dynamic: true }))
                .setTitle(change.title)
                .setDescription(change.description)
                .setFooter({ text: `${member.user.tag} updated voice state`, iconURL: member.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();
    
            try {
                await wait(2000);  // Optional delay
                await voicelog.send({ embeds: [embed] });
            } catch (err) {
                console.error('Failed to send voice state log:', err);
            }
        }
    }
    });    
   }
