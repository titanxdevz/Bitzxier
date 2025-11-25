const saixd = [
    '902363493242650635',
    '1383706658315960330',
    '1143155471159664710',
    '1187775437624053770',
    '775333233335205918',
    '855690571535876157',
    '1207801591890190367'
];

module.exports = {
    name: 'extraowner',
    aliases: [],
    category: 'security',
    subcommand: ['add', 'remove', 'list', 'reset'],
    premium: false,
    run: async (client, message, args) => {
        if (
            message.author.id !== message.guild.ownerId &&
            !saixd.includes(message.author.id)
        )
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(
                            `${client.emoji.cross} | Only Server Owner Can Run This Command!`
                        ),
                ],
            });

        const prefix = message.guild.prefix || '&';
        const option = args[0]?.toLowerCase();
        const userMention = args[1];
        const user =
            getUserFromMention(message, userMention) ||
            message.guild.members.cache.get(userMention);

        const antinuke = client.util.embed()
            .setThumbnail(client.user.avatarURL({ dynamic: true }))
            .setColor(client.color)
            .setTitle('__**Extra Owner**__')
            .setDescription(
                `ExtraOwner Can Edit Server Antinuke Status Whitelisted Members So Be Careful Before Adding Someone in it`
            )
            .addFields([
                { name: '__**Extraowner Add**__', value: `To Add Extra Owner, Use - \`${prefix}extraowner add @user\`` },
                { name: '__**Extraowner Remove**__', value: `To Remove Extra Owner, Use - \`${prefix}extraowner remove @user\`` },
                { name: '__**Extraowner Reset**__', value: `To Reset Extra Owner, Use - \`${prefix}extraowner reset\`` },
                { name: '__**Extraowner List**__', value: `To View Extra Owner, Use - \`${prefix}extraowner list\`` },
            ]);

        if (!option) {
            return message.channel.send({ embeds: [antinuke] });
        }

        let data = await client.db.get(`extraowner_${message.guild.id}`);
        if (!data || !Array.isArray(data.owner)) {
            data = { owner: [] };
        }

        if (['add', 'set'].includes(option)) {
            if (!user) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Please Provide a Valid User Mention or ID to Set as Extra Owner!`),
                    ],
                });
            }
            if (user.bot) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | You Cannot Add Bots to Extra Owner!`),
                    ],
                });
            }

            const premium = await client.db.get(`sprem_${message.guild.id}`);
            const limit = premium ? 2 : 1;

            if (data.owner.length >= limit) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | You Cannot Add Extra Owner More Than ${limit}`),
                    ],
                });
            }

            if (!data.owner.includes(user.id)) {
                data.owner.push(user.id);
                await client.db.set(`extraowner_${message.guild.id}`, data);
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.tick} | Successfully Added ${user} As Extra Owner`),
                    ],
                });
            } else {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | ${user} Already Exists in Extra Owner List`),
                    ],
                });
            }
        } else if (['remove', 'del'].includes(option)) {
            if (!user) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Please Provide a Valid User Mention or ID to Remove from Extra Owner!`),
                    ],
                });
            }

            if (data.owner.includes(user.id)) {
                data.owner = data.owner.filter((id) => id !== user.id);
                await client.db.set(`extraowner_${message.guild.id}`, data);
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.tick} | Successfully Removed ${user} From Extra Owner List`),
                    ],
                });
            } else {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | ${user} Does Not Exist in Extra Owner List`),
                    ],
                });
            }
        } else if (option === 'reset') {
            if (!data.owner.length) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | There Is No Extra Owner Configuration in This Server!`),
                    ],
                });
            } else {
                await client.db.set(`extraowner_${message.guild.id}`, { owner: [] });
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.tick} | Successfully Disabled Extra Owner Configuration!`),
                    ],
                });
            }
        } else if (option === 'list') {
            if (!data.owner.length) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | No Extra Owner is Set!`),
                    ],
                });
            } else {
                const mentions = data.owner
                    .map((userId) => `${client.emoji.dot} <@${userId}> (${userId})`)
                    .join('\n');
                const embed = client.util.embed()
                    .setColor(client.color)
                    .setDescription(mentions);
                return message.channel.send({ embeds: [embed] });
            }
        } else {
            return message.channel.send({ embeds: [antinuke] });
        }
    },
};

function getUserFromMention(message, mention) {
    if (!mention) return null;

    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    return message.client.users.cache.get(id);
}
