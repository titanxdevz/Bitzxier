
module.exports = {
    name: 'boostcount',
    aliases : ['bc'],
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        let count = message.guild.premiumSubscriptionCount
        return message.channel.send({
            embeds: [
                await client.util.embed()
                    .setAuthor({ name : `${message.author.displayName}` , iconURL : message.author.displayAvatarURL({ dynamic : true })})
                    .setThumbnail(`https://cdn.discordapp.com/emojis/1035418876470640660.gif`)
                    .setColor(client.color)
                    .setDescription(`**Boost Count : ${count}**`)
            ]
        })
    }
}
