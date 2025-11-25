const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'bitzxier',
    aliases: ['control'],
    description: 'Execute a command as another user',
    category: 'owner',
    premium: false,

    run: async (client, message, args) => {
        if(!client.config.bitzxier.includes(message.author.id)) return;
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription('Please mention a valid user or provide a valid user ID.')],
            }).then(m => setTimeout(() => {if(m) m.delete(), 5000})).catch((err) => { })
        }

        const commandName = args[1];

        const commandArgs = args.slice(2); 

        const command = client.commands.get(commandName.toLowerCase()) || client.commands.find((c) => c.aliases?.includes(commandName.toLowerCase()))
    
        if (!command) {
            return message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`The command \`${commandName}\` does not exist.`)],
            }).then(m => setTimeout(() => {if(m) m.delete(), 3000})).catch((err) => { })
        }
    if(command && command.category === 'owner') {
        return message.channel.send({
            embeds: [new EmbedBuilder()
                .setColor(client.color)
                .setDescription(`You are not authorized to use the \`${commandName}\` command.`)],
        }).then(m => setTimeout(() => {if(m) m.delete(), 4000})).catch((err) => { })
    }
       const fakeMessage = {
            ...message,
            author: target.user,
            member: target,
            client: client, 
            content: `${message.guild.prefix}${commandName} ${commandArgs.join(' ')}`, 
            channel: message.channel,
            guild: message.guild
        };
        try {
            await command.run(client, fakeMessage, commandArgs);
            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`Successfully executed \`${commandName}\` as ${target.user.tag}.`)],
            }).then(m => setTimeout(() => {if(m) m.delete(), 5000})).catch((err) => { })
        } catch (err) {
            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`There was an error executing the command.`)],
            }).then(m => setTimeout(() => {if(m) m.delete(), 5000})).catch((err) => { })
        }
    }
};
