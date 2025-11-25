const { Message, Client, EmbedBuilder, Permissions, ActionRowBuilder, ButtonBuilder, Collection, ButtonStyle } = require('discord.js');

const { default: wait } = require('wait')
module.exports = {
    name: 'unlockall',
    aliases: [],
    category: 'mod',
    premium: false,
    cooldown: 60,

    run: async (client, message, args) => {
        const embed = client.util.embed().setColor(client.color);
        if (!message.member.permissions.has('ManageChannles')) {
            let error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Manage Channels\` permission to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        if (client.util.hasHigher(message.member) == false) {
            let error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `Your highest role must be higher than my highest role to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }

        if(!message.guild.unlockall) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('yes_button')
                    .setLabel('Yes')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('no_button')
                    .setLabel('No')
                    .setStyle(ButtonStyle.Danger)
            );
            const interactionMessage = await message.channel.send({
                embeds: [
                    embed.setDescription(
                        `**${client.emoji.process} | Processing Command Please Wait**`
                    ),
                ],
            });
        await client.util.sleep(4000)
            interactionMessage.edit({
                embeds: [
                    embed.setDescription(
                        `**Are you sure you want to unlock all channels to in this server?**`
                    ),
                ], components: [row],
            });
            const filter = interaction => (interaction.customId === 'yes_button' || interaction.customId === 'no_button') && interaction.user.id === message.author.id;

            const collector = interactionMessage.createMessageComponentCollector({ filter, time: 10000 });

            collector.on('collect', async interaction => {
                if (interaction.isButton()) {
                    if (interaction.customId === 'yes_button') {
                        interactionMessage.edit({
                            embeds: [
                                embed.setDescription(
                                    `${client.emoji.tick} | Successfully started unlocking all channnels.`
                                ),
                            ],
                            components: [],
                        });

                        collector.stop();
                        try {
                            message.guild.unlockall = true;
                            let hided = 0
                            const channels = await message.guild.channels.fetch();
                                for (const c of channels) {
                                    const channel = c[1];
                                        try {
                                            await client.util.sleep(2000)
                                            if (channel.manageable) {
                                                await channel.permissionOverwrites.edit(message.guild.id, {
                                                    SendMessages : true
                                                },{
                                                    reason: `UNLOCKALL BY ${message.author.tag} (${message.author.id})`
                                                })
                                                 hided++;
                                                    }
                                        } catch (err) {
                                            if (err.code === 429) {
                                                await client.util.handleRateLimit();
                                                return;
                                            }
                                        }
                                }

                                const embed = client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.tick} | Successfully Unlocked ${hided} channels`)
                            await message.channel.send({ embeds: [embed] })                 
                           if (message.guild.unlockall) message.guild.unlockall = false;

                        }catch (err) { 
                            return;
                        }
        } else if (interaction.customId === 'no_button') {
            interactionMessage.edit({
                embeds: [
                    embed.setDescription(
                        `Process canceled.`
                    ),
                ],
                components: [],
            });

            collector.stop();
        }
    }
})
collector.on('end', collected => {
    if (collected.size === 0) {
        interactionMessage.edit({
            embeds: [
                client.util.embed()
                  .setColor(client.color)
                  .setTitle('Unlock all Timed Out')
                  .setDescription('The operation of Unlocking all channels has been cancelled due to inactivity.')
                  .addFields({ name : 'Reason for Timeout', value :  'Your response took longer than expected, exceeding the 10-second time limit.'})
                  .setTimestamp()
              ],
            components: [],
        });
    }
});
        } else { 
            return message.channel.send({
                embeds: [
                    embed.setDescription(
                        `${client.emoji.cross} | There is already a Unlock all process is going on in the server.`)
                        .setColor(client.color),
                ],
            });
        }
    }
}
