const { EmbedBuilder } = require('discord.js')
module.exports = {
    name: 'unmute',
    aliases: ['untimeout'],
    category: 'mod',
    premium: false,
    run: async (client, message, args) => {
        let role = await client.db.get(`modrole_${message.guild.id}`) || null

        if (!message.member.permissions.has('ModerateMembers') && !message.member.roles.cache.has(role)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have \`Timeout Members\` permissions to use this command.`
                        )
                ]
            })
        }
        if (!message.guild.members.me.permissions.has('ModerateMembers')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I must have \`Timeout Members\` permissions to run this command.`
                        )
                ]
            })
        }
        if (!client.util.hasHigher(message.member) && !message.member.roles.cache.has(role)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have a higher role than me to use this command.`
                        )
                ]
            })
        }
        if(!args[0])
        {
            return message.channel.send({embeds : [client.util.embed().setColor(client.color).setDescription(`${message.guild.prefix}unmute <user> <reason>`)]})
        }
        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if(!user) return message.channel.send({embeds : [client.util.embed().setColor(client.color).setDescription(`Please provide me a valid user.`)]})
        
        let reason = args.slice(1).join(' ');
        if(!reason) reason = 'No Reason given';
        
        if(user.id === client.user.id) return message.channel.send({embeds : [client.util.embed().setColor(client.color).setDescription(`Are You Mad ?`)]});
        
        if(!user.isCommunicationDisabled()) return message.channel.send({embeds : [client.util.embed().setColor(client.color).setDescription(`${user} is not muted `)]})
        
        if(!user.manageable) return message.channel.send({embeds : [client.util.embed().setColor(client.color).setDescription(`I can't unmute that user.Please check my role position and permissions.`)]})
        user.disableCommunicationUntil(null,`${message.author.tag} | ${reason}`);
        return message.channel.send({
            embeds: [
                client.util.embed()
                    .setColor(client.color)
                    .setDescription(
                        `${client.emoji.tick} | Successfully unmuted <@${user.user.id}>!`
                    )
            ]
        })
        
    }
}
