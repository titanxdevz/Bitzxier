const { EmbedBuilder, AuditLogEvent, ChannelType, WebhookClient } = require('discord.js'); // Ensure correct import
const discordTranscripts = require('discord-html-transcripts');

module.exports = async (client) => {
  const wait = require('wait')
    client.on('messageDelete', async (message) => {
      let check = await client.db.get(`blacklistserver_${client.user.id}`) || [];
      if (check.includes(message?.guild?.id)) return;
        let data = await client.db.get(`logs_${message?.guild?.id}`);
        if (message?.author?.bot || !message?.guild || message?.system) return;
        if(!data || !data?.message) return;
          const channel = data?.message
          const msglogs = await message.guild.channels.cache.get(channel);
          if(!msglogs) {
            await client.db.set(`logs_${message.guild.id}`,{ 
              voice : data ? data.voice : null,
              channel : data ? data.channel : null,
              rolelog : data ? data.rolelog : null,
              modlog : data ? data.modlog : null,   
              message : null,
              memberlog : data ? data.memberlog : null
          })
          return;
          }
      if(data){
        const embed = client.util.embed()
        .setColor(client.color)
        .setAuthor({name : 'Message Delete',iconURL  : message.author.displayAvatarURL({ dynamic: true })})
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setDescription(`Message Content : ${message.content} \n\nAuthor : ${message.author.tag}\n\nMessaged Deleted In : ${message.channel}\n\nChannel ID : ${message.channel.id}`);
          if (message.attachments.size > 0) {
        embed.setImage(message.attachments.first().url);
      }
      await wait(2000);
      await msglogs.send({ embeds : [embed] }).catch((_) => { });
      }
      
      })

      client.on('messageUpdate', async (oldMessage, newMessage) => { 
        let check = await client.db.get(`blacklistserver_${client.user.id}`) || [];
        if (check.includes(oldMessage?.guild?.id)) return;
        let data = await client.db.get(`logs_${oldMessage?.guild?.id}`);
        if(!data || !data?.message) return;
          const channel = data?.message
          const msglogs = await oldMessage.guild.channels.cache.get(channel);
          if(!msglogs) {
            await client.db.set(`logs_${oldMessage.guild.id}`,{ 
              voice : data ? data.voice : null,
              channel : data ? data.channel : null,
              rolelog : data ? data.rolelog : null,
              modlog : data ? data.modlog : null,   
              message : null,
              memberlog : data ? data.memberlog : null
          })
          return;
          }
       if (!oldMessage.author) return;
       if (newMessage.author.bot) return;
       if (oldMessage.author.id === client.user.id) return;
       if(data){
    var edit = client.util.embed()
    .setTimestamp()
    .setAuthor({ name : 'Message Edit', iconURL :  newMessage.author.displayAvatarURL({dynamic: true})})
    .setThumbnail(`${newMessage.author.displayAvatarURL({dynamic: true})}`)
    .setColor(client.color)
    .setDescription(`Original : \`${oldMessage}\` \n\nEdited : \`${newMessage}\`\n\nAuthor Id : ${newMessage.author.id} \n\nAuthor : ${newMessage.author.tag}\n\n Channel : ${newMessage.channel}\n\n Channel ID : ${newMessage.channel.id}`)
      .setTimestamp()
      await wait(2000);
      await msglogs.send({ embeds : [edit] }).catch((_) => { });
      }
      }

      
    
     )
      
    
     const deletedMessageCache = new Map();

     client.on('messageDeleteBulk', async (messages) => {
         const guildId = messages.first().guild.id;
         let check = await client.db.get(`blacklistserver_${client.user.id}`) || [];
         if (check.includes(guildId)) return;
     
         let data = await client.db.get(`logs_${guildId}`);
         if (!data || !data?.message) return;
     
         const channelID = data.message
         const msglogs = await messages.first().guild.channels.cache.get(channelID);
     
         if (!msglogs) {
             await client.db.set(`logs_${guildId}`, {
                 voice: data ? data.voice : null,
                 channel: data ? data.channel : null,
                 rolelog: data ? data.rolelog : null,
                 modlog: data ? data.modlog : null,
                 message: null,
                 memberlog: data ? data.memberlog : null
             });
             return;
         }
     
         const deletedChannel = messages.first().channel;
         const bulkDeleteEmbed = new EmbedBuilder()
             .setColor(client.color)
             .setTitle('Bulk Message Delete')
             .setDescription(`${messages.size} messages were deleted in ${deletedChannel}.`)
             .setTimestamp();
              const cachedMessages = deletedMessageCache.get(guildId) || new Map();
         const deletedMessages = Array.from(messages.values());
     
         const sortedMessages = deletedMessages.reverse();
           const transcript = await discordTranscripts.generateFromMessages(sortedMessages, deletedChannel, {
             limit: -1,
             returnType: 'attachment',
             filename: 'bitzxier-deleted-messages.html',
             saveImages: true,
             footerText: "Bitzxier Message Delete Log Exported {number} message{s}",
             callbacks: {
                 resolveChannel: (channelId) => client.channels.cache.get(channelId),
                 resolveUser: (userId) => client.users.fetch(userId),
                 resolveRole: (roleId) => deletedChannel.guild.roles.cache.get(roleId)
             },
             poweredBy: false,
             ssr: true
         });
     
         await msglogs.send({
             embeds: [bulkDeleteEmbed],
             files: [transcript]
         }).catch((error) => {
          return;
         });
              deletedMessageCache.delete(guildId);
     });
     

}