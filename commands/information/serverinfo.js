const { EmbedBuilder, ChannelType } = require('discord.js');
const moment = require('moment');

const verificationLevels = {
    0: 'None',
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Very High',
};

const booster = {
    0: 'Level 0',
    1: 'Level: 1',
    2: 'Level: 2',
    3: 'Level: 3',
};

const disabled = '<:bitzxier_crosss:1180470543896551438>';
const enabled = '<:bitzxier_tick:1180470648053702657>';

module.exports = {
    name: 'serverinfo',
    category: 'info',
    aliases: ['si'],
    description: 'To Get Information About The Server',
    premium: false,
    run: async (client, message, args) => {
        try {
            const guild = message.guild;
            const { createdTimestamp, ownerId, description, features } = guild;

            const roles = guild.roles.cache
                .sort((a, b) => b.position - a.position)
                .map((role) => role.toString())
                .slice(0, -1);

            const rolesdisplay = roles.length < 15
                ? roles.join(' ') || 'None'
                : `${roles.slice(0, 15).join(' ')} \`and more...\``;

            const members = guild.members.cache;
            const channels = guild.channels.cache;
            const emojis = guild.emojis.cache;

            const bans = await guild.bans.fetch().then((x) => x.size).catch(() => 'N/A');
            const activeInvites = await guild.invites.fetch().catch(() => []);
            const inviteCount = activeInvites.size;

            let vanityData;
            try {
                vanityData = await guild.fetchVanityData();
            } catch {
                vanityData = { code: 'No vanity URL', uses: 'N/A' };
            }

            // Create pairs of features for adding to embed fields
            const featurePairs = [];
            for (let i = 0; i < features.length; i += 4) {
                const pair = features.slice(i, i + 4)
                    .map(feature => `${enabled} \`${feature.replace(/_/g, ' ').toLowerCase()}\``)
                    .join('\n');
                featurePairs.push(pair);
            }

            const embed = new EmbedBuilder()
                .setColor(client.color)
                .setTitle(`${guild.name}'s Information`)
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .addFields(
                    {
                        name: '__About__',
                        value: `**Name**: ${guild.name}\n**ID**: ${guild.id}\n**Owner <a:OWNER:1183476311038111865>:** <@!${ownerId}> (${ownerId})\n**Created at:** <t:${parseInt(createdTimestamp / 1000)}:R>\n**Description**: ${description || 'No description set.'}\n**Region**: ${guild.preferredLocale}\n**Members:** ${guild.memberCount}\n**Banned Members:** ${bans}`,
                    },
                    {
                        name: '__Server Information__',
                        value: `**Verification Level:** ${verificationLevels[guild.verificationLevel]}\n**Inactive Channel:** ${guild.afkChannelId ? `<#${guild.afkChannelId}>` : `${disabled}`}\n**Inactive Timeout:** ${guild.afkTimeout / 60} mins\n**System Messages Channel:** ${guild.systemChannelId ? `<#${guild.systemChannelId}>` : disabled}\n**Boost Bar Enabled:** ${guild.premiumProgressBarEnabled ? enabled : disabled}\n**Active Invites:** ${inviteCount}\n**Vanity URL:** ${vanityData.code}\n**Vanity URL Uses:** ${vanityData.uses}`,
                    },
                    {
                        name: '__Channels__',
                        value: `**Total:** ${channels.size}\n**Text Channels:** ${channels.filter((channel) => channel.type === ChannelType.GuildText).size}\n**Voice Channels:** ${channels.filter((channel) => channel.type === ChannelType.GuildVoice).size}\n**Categories:** ${channels.filter((channel) => channel.type === ChannelType.GuildCategory).size}\n**Announcements:** ${channels.filter((channel) => channel.type === ChannelType.GuildNews).size}\n**Stages:** ${channels.filter((channel) => channel.type === ChannelType.GuildStageVoice).size}`,
                    },
                    {
                        name: '__Emoji Info__',
                        value: `**Regular:** ${emojis.filter((emoji) => !emoji.animated).size}\n**Animated:** ${emojis.filter((emoji) => emoji.animated).size}\n**Total:** ${emojis.size}`,
                    },
                    {
                        name: '__Boost Status__',
                        value: `${booster[guild.premiumTier]} [<a:boost:1183480032035876936> ${guild.premiumSubscriptionCount || '0'} Boosts]`,
                    }
                )
                .setTimestamp();

            // Add the feature pairs as separate fields
            featurePairs.forEach((pair, index) => {
                embed.addFields({
                    name: index === 0 ? '__Server Features__' : `	`,
                    value: pair,
                });
            });

            if (guild.bannerURL()) {
                embed.setImage(guild.bannerURL({ dynamic: true, size: 4096 }));
            }

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error(error);
        }
    },
};
