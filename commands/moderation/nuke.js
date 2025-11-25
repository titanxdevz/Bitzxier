const {
    Message,
    Client,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js')

module.exports = {
    name: 'nuke',
    category: 'mod',
    premium: false,

    run: async (client, message, args) => {
        if (!message.member.permissions.has('ManageChannels')) {
            let error = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(
                    `You must have \`Manage Channels\` permission to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        if (!client.util.hasHigher(message.member)) {
            let error = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(
                    `Your highest role must be higher than my highest role to use this command.`
                )
            return message.channel.send({ embeds: [error] })
        }
        try {
            let row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('YES')
                    .setStyle(ButtonStyle.Success)
                    .setLabel('Yes'),
                new ButtonBuilder()
                    .setCustomId('NO')
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('No')
            )
            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setDescription(
                    `Are you sure that you want to nuke this channel?`
                )
            let msg = await message.channel.send({
                embeds: [embed],
                components: [row]
            })
            const filter = (interaction) => {
                if (interaction.user.id === message.author.id) return true
                return interaction.reply({
                    content: `Only ${message.author.username} can use these buttons`,
                    ephemeral: true
                })
            }
            const collector = message.channel.createMessageComponentCollector({
                filter,
                max: 1
            })

            collector.on('collect', async (buttonInteraction) => {
                await buttonInteraction.deferUpdate();
                const id = buttonInteraction.customId
                if (id === 'YES') {
                    message.channel.clone().then((ch) => {
                        let reason = args.join(' ') || 'No Reason'
                        let embed = new EmbedBuilder()
                            .setTitle('**Channel Successfully Nuked**')
                            .setColor(client.color)
                            .setImage('https://tenor.com/view/explosion-boom-iron-man-gif-14282225')
                        ch.setParent(message.channel.parent)
                        ch.setPosition(message.channel.position)
                        message.channel.delete().then(() => {
                            ch.send({ embeds: [embed] }).then((msg) => {
                                setTimeout(() => msg.delete(), 10000)
                            })
                        })
                    })
                }
                if (id === 'NO') {
                    msg.delete().catch((e) => {})
                }
            })
        } catch (err) {
            return message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(client.color)
                        .setDescription(`I was unable to nuke this channel.`)
                ]
            })
        }
    }
}
