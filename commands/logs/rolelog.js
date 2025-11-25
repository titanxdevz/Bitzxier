const {
    Message,
    Client,
    EmbedBuilder,
    MessageActionRow,
    MessageButton
} = require('discord.js')
module.exports = {
    name: 'rolelog',
    aliases: [],
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

        if (!client.util.hasHigher(message.member)) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have a higher role than me to use this command.`
                        )
                ]
            })
        }

    let channel = getChannelFromMention(message, args[0]) || message.guild.channels.cache.get(args[0])
if(!channel){
    await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setTitle('Invalid Channel')
            .setDescription('Please provide a valid channel for channel logs.')
        ],
      });}
if(channel) {
    let data = await client.db.get(`logs_${message.guild.id}`)
    if(!data){
        await client.db.set(`logs_${message.guild.id}`,{ 
            voice : null,
            channel : null,
            rolelog : null,
            modlog : null,   
            message : null,
            memberlog : null
        })
        const initialMessage = await message.channel.send({
            embeds: [new EmbedBuilder().setColor(client.color).setDescription('Configuring your server...')],
          });
          await client.util.sleep(2000);
          initialMessage.edit({
            embeds: [
              new EmbedBuilder()
                .setColor(client.color)
                .setTitle('Server Configuration Successful')
                .setDescription('Your server has been successfully configured for logging.')
            ],
          });
                } 
if(data) {
    await client.db.set(`logs_${message.guild.id}`,{ 
        voice : data ? data.voice : null,
        channel : data ? data.channel : null,
        rolelog : channel.id,
        modlog : data ? data.modlog : null,   
        message : data ? data.message : null,
        memberlog : data ? data.memberlog : null
    })
    await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(client.color)
            .setTitle('Role Logs Configured')
            .setDescription(`The channel ${channel} has been successfully configured for logging role-related events.`)
            .addFields({ name : 'Types of Role Logging Enabled', value : '\`Role Create\`\n\`Role Delete\`\n\`Role Update\`'})
            .addFields({ name : 'What happens now?', value :'The bot will log role creation, deletion, and updates in the configured channel.'})
        ],
      });
    }
    }}
}

function getChannelFromMention(message, mention) {
    if (!mention) return null;

    const matches = mention.match(/^<#(\d+)>$/); 
    if (!matches) return null;

    const channelId = matches[1];
    return message.guild.channels.cache.get(channelId);
}
