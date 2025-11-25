const axios = require("axios")
module.exports = {
    name: 'dare',
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
    try {
      const request = await axios.get("https://api.truthordarebot.xyz/api/dare");
      const embed = client.util.embed()
        .setColor(client.color)
        .setTitle(`${request.data.question}`)
        .setFooter({ text : `Dare`,iconURL : message.author.displayAvatarURL({dynamic : true})})
      return message.channel.send({embeds: [embed] })
    } catch(e) {
      return message.channel.send({embeds: [client.util.embed().setColor(client.color).setDescription(`${client.emoji.cross} | truth or dare api is **currently down**.`)]})
    }
  }
}