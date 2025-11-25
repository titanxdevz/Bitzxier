const { Message, Client, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'firstmsg',
    aliases: ['firstmessage'],
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        const fetchMessages = await message.channel.messages.fetch({
            after: 1,
            limit: 1
        })
        const msg = fetchMessages.first()

        const embed = client.util.embed()
            .setTitle(`First Messsage in ${message.guild.name}`)
            .setURL(msg.url)
            .setDescription('Content: ' + msg.content)
            .addFields({ name : 'Author', value :`${msg.author}`})
            .addFields({ name : 'Message ID',value : `${msg.id}`})
            .addFields({ name : 'Created At',value : `${message.createdAt.toLocaleDateString()}`})
            .setColor(client.color)
        message.channel.send({ embeds: [embed] })
    }
}
