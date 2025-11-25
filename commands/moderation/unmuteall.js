const { Message, Client, EmbedBuilder, Permissions, ActionRowBuilder, ButtonBuilder, Collection, ButtonStyle } = require('discord.js');

const { default: wait } = require('wait')
module.exports = {
    name: 'unmuteall',
    aliases: [],
    category: 'mod',
    premium: false,
    cooldown: 60,
    run: async (client, message, args) => {
        const embed = client.util.embed().setColor(client.color);
        if (!message.member.permissions.has('ModerateMembers')) {
            let error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Moderate Members\` permission to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        if (!message.guild.members.me.permissions.has('ModerateMembers')) {
            let error = client.util.embed()
                .setColor(client.color)
                .setDescription(
                    `I must have \`Moderate Members\` permission to use this command.`
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

        let members = await message.guild.members.fetch().then(members => members.filter(member => member.isCommunicationDisabled()))
if(members.size === 0) {
    return message.channel.send({
        embeds: [
            client.util.embed().setColor(client.color).setDescription(`There is No One Muted Member In Ths Server`)
        ]
    });
}
        if(!message.guild.Unmuteall) {
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
                        `**Are you sure you want to unmuteall all muted members in this server?**`
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
                                    `${client.emoji.tick} | Successfully started unmuting to all muted members.`
                                ),
                            ],
                            components: [],
                        });

                        collector.stop();
                        try {
                            message.guild.Unmuteall = true;
                            let unmuted = 0
                            const muteds = await message.guild.members.fetch().then(members => members.filter(member => member.isCommunicationDisabled()))
                            for (const m of muteds) {
                                    const muted = m[1];
                                        try {
                                            await client.util.sleep(2000)
                                            if (muted) {
                                                muted.disableCommunicationUntil(null,`Unmuteall Command Runned By ${message.author.tag} | ${message.author.id}`);
                                                unmuted++;
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
                                .setDescription(`${client.emoji.tick} | Successfully Unmuted ${unmuted} User's`)
                            await message.channel.send({ embeds: [embed] })                 
                           if (message.guild.Unmuteall) message.guild.Unmuteall = false;
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
                  .setTitle('untimeout all Timed Out')
                  .setDescription('The operation of removing timeout has been cancelled due to inactivity.')
                  .addFields({ name : 'Reason for Timeout', value : 'Your response took longer than expected, exceeding the 10-second time limit.'})
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
                        `${client.emoji.cross} | There is already a Unmute all process is going on in the server.`)
                        .setColor(client.color),
                ],
            });
        }
    }
}
