const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'maintanance',
    aliases: ['main'],
    category: 'owner',
    run: async (client, message, args) => {
        if (!client.config.owner.includes(message.author.id)) return;
        const embed = client.util.embed().setColor(client.color);
        if (!args[0]) {
            embed.setDescription("Please provide arguments like `&maintanance enable/disable`");
            return message.channel.send({ embeds :[embed]});
        }
        let maintain = await client.db.get(`maintanance_${client.user.id}`)
        
        if (args[0].toLowerCase() == "enable") {
            if (!maintain)  {
                await client.db.set(`maintanance_${client.user.id}`,true)
                embed.setDescription("Maintenance mode is successfully enabled!");
                return message.channel.send({ embeds :[embed]});
            } else  {
            embed.setDescription("Maintenance mode is already enabled!");
            return message.channel.send({ embeds :[embed]});
        }
    } else if (args[0].toLowerCase() == "disable") {
            if (maintain) {
                await client.db.set(`maintanance_${client.user.id}`,false)
                embed.setDescription("Maintenance mode is successfully disabled!");
                return message.channel.send({ embeds :[embed]});
            }
            embed.setDescription("Maintenance mode is not enabled yet!");
            return message.channel.send({ embeds :[embed]});
        } else {
            embed.setDescription("Please give valid arguments like `&maintanance enable/disable`");
            return message.channel.send({ embeds :[embed]});
        }
    }
}