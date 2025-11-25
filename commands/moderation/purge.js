const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'purge',
    aliases: ['clear', 'c'],
    category: 'mod',
    premium: false,
    run: async (client, message, args) => {
        let role = await client.db.get(`modrole_${message.guild.id}`) || null

        if (!'1031182493350645801'.includes(message.author.id) && !message.member.permissions.has('ManageMessages') && !message.member.roles.cache.has(role)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | You must have \`Manage Messages\` permissions to use this command.`
                        )
                ]
            });
        }

        if (!message.guild.members.me.permissions.has('ManageMessages')) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | I must have \`Manage Messages\` permissions to use this command.`
                        )
                ]
            });
        }

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `You didn't provide the purge type.\nUsage: \`purge <type> <amount> [content]\`\nPurge Types: \`bots\`, \`humans\`, \`links\`, \`attachments\`, \`mentions\`, \`emojis\`, \`stickers\`, \`user\`, \`contains\``
                        )
                ]
            });
        }
        await message.delete().catch((err) => { })
        if (args[0].toLowerCase() === 'user' || args[0].toLowerCase() === 'users') {
            let user = await getUserFromMention(message, args[1])
            let count = parseInt(args[2]) || 99;
            if (!args[1]) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `Please provide valid content message to delete.\nUsage: \`purge user <member> <ammount>\``
                                )
                        ]
                    })
            }
            if (!user) {
                try {
                    user = await message.guild.members.cache.get(args[1])
                } catch (error) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `Please provide valid content message to delete.\nUsage: \`purge user <member> <ammount>\``
                                )
                        ]
                    })
                }
            }
            const messages = await message.channel.messages.fetch({ limit: count },{ cache: false, force: true })
            let botmessages = messages.filter(msg => msg.author.id === user.id)
            await client.util.sleep(2000)
            await message.channel.bulkDelete(botmessages, true).catch((err) => { })
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.tick} | Successfully deleted ${botmessages.size} messages from ${user}.`
                        )
                ]
            }).then(msg => setTimeout(() => msg.delete(), 4000));
        }
        const type = args[0].toLowerCase();
        const amount = parseInt(args[1]) || 99;
        const contentToSearch = args.slice(2).join(" ");

        let messagesToDelete;

        switch (type) {
            case 'bot':
            case 'bots':
                messagesToDelete = await fetchAndFilterMessages(message.channel, amount, msg => msg.author.bot);
                break;
            case 'emoji':
            case 'emojis':
                messagesToDelete = await fetchAndFilterMessages(message.channel, amount, msg => hasDiscordEmojis(msg.content));
                break;
            case 'sticker':
            case 'stickers':
                messagesToDelete = await fetchAndFilterMessages(message.channel, amount, msg => msg.stickers.size > 0);
                break;
            case 'mention':
            case 'mentions':
                messagesToDelete = await fetchAndFilterMessages(message.channel, amount, msg => msg.mentions.users.size > 0);
                break;
            case 'human':
            case 'humans':
                messagesToDelete = await fetchAndFilterMessages(message.channel, amount, msg => !msg.author.bot);
                break;
            case 'link':
            case 'links':
                messagesToDelete = await fetchAndFilterMessages(message.channel, amount, msg => msg.content.match(/(https?|ftp):\/\/[^\s/$.?#].[^\s]*/i));
                break;
            case 'attachment':
            case 'attachments':
                messagesToDelete = await fetchAndFilterMessages(message.channel, amount, msg => msg.attachments.size > 0);
                break;
            case 'content':
            case 'contains':
                if (!contentToSearch) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `Please provide valid content message to delete.\nUsage: \`purge contains <amount> <content>\``
                                )
                        ]
                    });
                }
                messagesToDelete = await fetchAndFilterMessages(message.channel, amount, msg => msg.content.includes(contentToSearch));
                break;
            default:
                const avg = args[0]
                if (isNaN(avg) || avg <= 0) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | You must provide a valid number of messages to be deleted.`
                                )
                        ]
                    });
                }
                if (avg >= 1000) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(
                                    `${client.emoji.cross} | You can't delete more than **999** messages at a time.`
                                )
                        ]
                    });
                }
                await message.delete().catch(() => { });
                await deleteMessages(message.channel, avg);
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | Successfully deleted ${avg} messages.`
                            )
                    ]
                }).then((m) => {
                    setTimeout(() => {
                        m.delete().catch((err) => { });
                    }, 2000);
                });
        }
        if (messagesToDelete.size === 0) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `There are no messages matching the criteria to delete.`
                        )
                ]
            });
        }

        await message.channel.bulkDelete(messagesToDelete, true).catch((err) => { });
        return message.channel.send({
            embeds: [
                client.util.embed()
                    .setColor(client.color)
                    .setDescription(
                        `${client.emoji.tick} | Successfully Deleted \`${messagesToDelete.size}\` Messages`
                    )
            ]
        }).then(msg => setTimeout(() => msg.delete(), 4000));
    }
};

async function fetchAndFilterMessages(channel, amount, filterFunction) {
    const messages = await channel.messages.fetch({ limit: amount });
    return messages.filter(filterFunction);
}

async function deleteMessages(channel, amount) {
    for (let i = amount; i > 0; i -= 100) {
        try {
            await channel.bulkDelete(Math.min(i, 100), true);
        } catch (error) {
            return;
        }
    }
}
function hasDiscordEmojis(text) {
    const emojiRegex = /<a?:\w+:\d+>/;
    return emojiRegex.test(text);
}
function getUserFromMention(message, mention) {
    if (!mention) return null

    const matches = mention.match(/^<@!?(\d+)>$/)
    if (!matches) return null

    const id = matches[1]
    return message.guild.members.fetch(id)
}
