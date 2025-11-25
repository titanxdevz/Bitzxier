const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'info',
    cooldown: 5,
    premium: false,
    run: async (client, message, args) => {
        let prefix = message.guild?.prefix || '&'; // Default prefix if not set

        const row1 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('helpop')
                .setPlaceholder(`❯ ${client.user.username} Get Started!`)
                .addOptions([
                    {
                        label: 'AntiNuke',
                        description: 'Get All AntiNuke Command List',
                        value: 'antinuke',
                        emoji: '<:antinuke:1436754524734750780>'
                    },
                    {
                        label: 'Moderation',
                        description: 'Get All Moderation Command List',
                        value: 'moderation',
                        emoji: '<:moderation:1436754537548353827>'
                    },
                    {
                        label: 'Automod',
                        description: 'Get All Automod Command List',
                        value: 'automod',
                        emoji: '<:automod:1436754550643101756>'
                    },
                    {
                        label: 'Logger',
                        description: 'Get All Logger Command List',
                        value: 'logger',
                        emoji: '<:logger:1436754563452502187>'
                    },
                    {
                        label: 'Utility',
                        description: 'Get All Utility Command List',
                        value: 'utility',
                        emoji: '<:utility:1436754577528459408>'
                    }
                ])
        );

        const row2 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('helpop2')
                .setPlaceholder(`❯ ${client.user.username} Get Started!`)
                .addOptions([
                    {
                        label: 'Join To Create',
                        description: 'Get All Join To Create Command List',
                        value: 'jointocreate',
                        emoji: '<:jointocreate:1436754590002315337>'
                    },
                    {
                        label: 'Voice',
                        description: 'Get All Voice Command List',
                        value: 'voice',
                        emoji: '<:voice:1436754603008856125>'
                    },
                    {
                        label: 'Custom Role',
                        description: 'Get All Custom Role Command List',
                        value: 'customrole',
                        emoji: '<:customrole:1436754616477024356>'
                    },
                    {
                        label: 'Welcomer',
                        description: 'Get All Welcomer Command List',
                        value: 'welcomer',
                        emoji: '<:welcomer:1436754629328240721>'
                    },
                    {
                    label : 'Ticket',
                    description : 'Get All Ticket Command List',
                    value : 'ticket',
                    emoji : '<:ticket:1436754643022516430>'
                    },
                ])
        );

        const categories = {
            category1: [
                "**<:antinuke:1436754524734750780> \`:\` AntiNuke**",
                "**<:moderation:1436754537548353827> \`:\` Moderation**",
                "**<:automod:1436754550643101756> \`:\` Automod**",
                "**<:logger:1436754563452502187> \`:\` Logger**",
                "**<:utility:1436754577528459408> \`:\` Utility**",
            ],
            category2: [
                "**<:jointocreate:1436754590002315337> \`:\` Join To Create**",
                "**<:voice:1436754603008856125> \`:\` Voice**",
                "**<:customrole:1436754616477024356> \`:\` Custom Role**",
                "**<:welcomer:1436754629328240721> \`:\` Welcomer**",
                "**<:ticket:1436754643022516430> \`:\` Ticket**"
            ]
        };

        let developerUser = client.users.cache.get('1383706658315960330') ? client.users.cache.get('1383706658315960330') : await client.users.fetch('1383706658315960330').catch((err) => null)

        const embed = new EmbedBuilder()
            .setColor(client.color)
            .setAuthor({
                name: message.author.tag,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setDescription(
                `${client.emoji.dot} **Prefix for this server:** \`${prefix}\`\n` +
                `${client.emoji.dot} **Total Commands:** \`${client.util.countCommandsAndSubcommands(client)}\`\n` +
                `${client.emoji.dot} **Type \`&antinuke enable\` to get started!**\n\n${client.config.baseText}`
            )
            .addFields({
                name: '<:categories:1436754669971181661> **__Categories__**',
                value: categories.category1.join('\n'),
                inline: true
            })
            .addFields({
                name: '\u200B',
                value: categories.category2.join('\n'),
                inline: true
            })
            .addFields({
                name: "<:link:1436754683053211768> **__Links__**",
                value: `**[Invite Me](https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot) | [Support Server](https://discord.gg/zMxCnc29Zm)**`
            })
            .setFooter({
                text: `Developed with ❤️ By The Ansh </>`,
                iconURL: developerUser.displayAvatarURL({ dynamic: true })
            });
if (!client.config.owner.includes(message.author.id) && !client.config.admin.includes(message.author.id)) {
    await message.channel.send({ embeds: [embed], components: [row1, row2] });
} else {
    await message.channel.send({ embeds: [embed], components: [row1, row2], content : `Hey Owner, How Can I Help You Today?` });
}

    }
};
