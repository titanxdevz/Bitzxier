const {
    Message,
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js')

module.exports = {
    name: 'logreset',
    aliases: ['resetlog','resetlogs'],
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
 
    let data = await client.db.get(`logs_${message.guild.id}`)
    if(data.modlog === null && data.memberlog === null && data.message === null && data.channel === null && data.rolelog === null && data.voice === null){
        await client.db.set(`logs_${message.guild.id}`,{ 
            voice : null,
            channel : null,
            rolelog : null,
            modlog : null,   
            message : null,
            memberlog : null
        })
        return message.channel.send({
            embeds: [
              new EmbedBuilder()
                .setColor(client.color)
                .setTitle('Logging System Not Configured')
                .setDescription('Your server does not have a configured logging system.')
                .addFields({ name : 'How to configure logging?',value : 'Use appropriate commands to set up logging'})
            ],
          });
                  } else if(data) {
            const confirmationRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm')
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Danger),
            );
 
        const confirmationEmbed = new EmbedBuilder()
            .setColor(client.color)
            .setDescription('Are you sure you want to reset the server logging module? This action will disable all logging features, and you will lose all existing log settings.')
            .addFields({ name : 'Note', value :'This operation is irreversible. Make sure you want to proceed before confirming.'})
            .setFooter({ text :'React with the buttons below to Yes or No.'})
            
        const confirmationMessage = await message.channel.send({
            embeds: [confirmationEmbed],
            components: [confirmationRow],
        });

        const filter = i => (i.customId === 'confirm' || i.customId === 'cancel') && i.user.id === message.author.id;

        const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'confirm') {
                await client.db.set(`logs_${message.guild.id}`, {
                    voice : null,
                    channel: null,
                    rolelog: null,
                    modlog: null,
                    message: null,
                    memberlog: null,
                });

                await i.update({
                    embeds: [
                        new EmbedBuilder()
                          .setColor(client.color)
                          .setTitle('Log Reset Successful')
                          .setDescription(`Logging system has been successfully disabled for ${message.guild.name}.`)
                          .setFooter({ text : 'You can configure logging again using the appropriate commands.'})
                      ],
                     components: [],
                });
            } else {
                await i.update({
                    embeds: [
                        new EmbedBuilder()
                          .setColor(client.color)
                          .setTitle('Log Reset Cancelled')
                          .setDescription('The operation to reset the logging system has been cancelled.')
                          .addFields({ name : 'Why was it cancelled?', value : 'Either you decided not to proceed, or the interaction timed out.'})
                          .setFooter({ text : 'Feel free to run the command again if needed.'})
                      ],
                components: [],
                });
            }

            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                confirmationMessage.edit({
                    embeds: [
                        new EmbedBuilder()
                          .setColor(client.color)
                          .setTitle('Log Reset Timed Out')
                          .setDescription('You took too long to respond, and the operation to reset the logging system has been cancelled.')
                          .addFields({ name : 'Why did it time out?', value : 'The interaction timed out after 15 seconds.'})
                          .setFooter({ text : 'Feel free to run the command again if needed.'})
                      ],
                    components: [],
                });
            }
        });
    }
}}

