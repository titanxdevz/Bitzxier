
module.exports = {
    name: 'channelcount',
    aliases : ['cc'],
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        return message.channel.send({
            embeds: [
                await client.util.embed()
                    .setAuthor({ name : message.author.displayName , iconURL : message.author.displayAvatarURL({ dynamic : true })})
                    .setColor(client.color)
                    .setThumbnail(`https://cdn.discordapp.com/emojis/1237720054762573875.webp?size=80&quality=lossless`)
                    .setDescription(`**Channel Count : ${message.guild.channels.cache.size}**`)
                    
            ]
        })
    }
}
