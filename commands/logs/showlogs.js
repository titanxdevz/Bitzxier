const {
    Message,
    Client,
    EmbedBuilder,
    MessageActionRow,
    MessageButton
} = require('discord.js')

module.exports = {
    name: 'showlogs',
    aliases: ["logconfig","viewlogs"],
    category: 'logging',
    premium: false,

    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageGuild')) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have \`MANAGE SERVER\` permissions to use this command.`
                        )
                ]
            });
        }
        if (!message.guild.members.me.permissions.has('Administrator')) { 
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I don't have \`Administrator\` permissions to execute this command.`
                        )
                ]
            })
        }

    let data = await client.db.get(`logs_${message.guild.id}`) 

    if(!data) {
        return await message.channel.send({ embeds: [
            new EmbedBuilder()
              .setColor(client.color)
              .setTitle('Logging System Not Configured')
              .setDescription('Your server does not have a configured logging system.')
              .addFields({ name : 'How to configure logging?', value : 'Use appropriate commands to set up logging'})
          ]})
    } else if(data) {
        const logs = new EmbedBuilder()
        .setColor(client.color)
        .setAuthor({ name : message.author.tag, iconURL : message.author.displayAvatarURL({dynamic : true})})
        .setTitle('Server Logs Configuration')
        .setThumbnail(message.guild.iconURL({ dynamic : true }))
          if(data.channel) logs.addFields({ name: 'Channel logs', value: `<#${data?.channel}>`})
          if(!data.channel) logs.addFields({ name: 'Channel logs', value: `\`NOT SET\``})
          if(data.rolelog) logs.addFields({ name: 'Role logs', value: `<#${data?.rolelog}>`})
          if(!data.rolelog) logs.addFields({ name: 'Role logs', value: `\`NOT SET\``})
          if(data.memberlog) logs.addFields({ name: 'Member logs', value: `<#${data?.memberlog}>`})
          if(!data.memberlog) logs.addFields({ name: 'Member logs', value: `\`NOT SET\``})
          if(data.modlog) logs.addFields({ name: 'Mod logs', value: `<#${data?.modlog}>`})
          if(!data.modlog) logs.addFields({ name: 'Mod logs', value: `\`NOT SET\``})
          if(data.message) logs.addFields({ name: 'Message logs', value: `<#${data?.message}>`})
          if(!data.message) logs.addFields({ name: 'Message logs', value: `\`NOT SET\``})
          if(data.voice) logs.addFields({ name: 'Voice logs', value: `<#${data?.voice}>`})
          if(!data.voice) logs.addFields({ name: 'Voice logs', value: `\`NOT SET\``})

        .setTimestamp()
      await message.channel.send({ embeds: [logs] });
      
    }

}}

