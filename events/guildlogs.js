const { EmbedBuilder, WebhookClient } = require('discord.js');
const config = require(`${process.cwd()}/config.json`);

module.exports = async (client) => {
    const join = config.Join_logs_URL ? new WebhookClient({ url: config.Join_logs_URL }) : null;
    const leave = config.leave_logs_URL ? new WebhookClient({ url: config.leave_logs_URL }) : null;

    client.on('guildCreate', async (guild) => {
        try {
			if(!client.ready) return
            // Fetch total server and user count across shards
            const totalServers = await client.cluster
                .broadcastEval(client => client.guilds.cache.size)
                .then(results => results.reduce((prev, val) => prev + val, 0));

            const totalUsers = await client.cluster
                .broadcastEval(client => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
                .then(results => results.reduce((acc, count) => acc + count, 0));

            let owner = await guild.fetchOwner();
            let bannerUrl = guild.bannerURL({ dynamic: true, size: 1024 });
            
            // Check for partnered and verified status
            let emoji = '';
            if (guild.partnered && guild.verified) {
                emoji = `<:partner:1181495977413185596><:verified:1181495980525363220>`;
            } else if (guild.partnered) {
                emoji = '<:partner:1181495977413185596>';
            } else if (guild.verified) {
                emoji = '<:verified:1181495980525363220>';
            } else {
                emoji = `${client.emoji.cross}`;
            }

            const embed = new EmbedBuilder()
                .setTitle(guild.name)
                .setDescription(`Id: **${guild.id}**\nName: **${guild.name}**\nDiscord Level: ${emoji}\nMemberCount: \`${guild.memberCount}\`\nCreated At: <t:${Math.round(guild.createdTimestamp / 1000)}:R>\nJoined At: <t:${Math.round(guild.joinedTimestamp / 1000)}:R>`)
                embed.addFields([
                    { name: '**Owner**', value: `Info: **${owner.user.tag} (${owner.id})**\nMentions: <@${owner.id}>\nCreated At: <t:${Math.round(owner.user.createdTimestamp / 1000)}:R>` },
                    { name: `**${client.user.username}'s Total Servers**`, value: `\`\`\`js\n${totalServers}\`\`\``, inline: true },
                    { name: `**${client.user.username}'s Total Users**`, value: `\`\`\`js\n${totalUsers}\`\`\``, inline: true },
                    { name: `**Shard Id**`, value: `\`\`\`js\n${guild.shardId}\`\`\``, inline: true }
                ])
                .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
                .setColor(client.color);

            if (guild.vanityURLCode) {
                embed.setURL(`https://discord.gg/${guild.vanityURLCode}`);
            }
            if (guild.banner) {
                embed.setImage(bannerUrl);
            }

            // Send embed using the join webhook
            if (join) await join.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildCreate event:', error);
        }
    });

    client.on('guildDelete', async (guild) => {
        try {
		if(!client.ready) return
            const totalServers = await client.cluster
                .broadcastEval(client => client.guilds.cache.size)
                .then(results => results.reduce((prev, val) => prev + val, 0));

            const totalUsers = await client.cluster
                .broadcastEval(client => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0))
                .then(results => results.reduce((acc, count) => acc + count, 0));

            let bannerUrl = guild.bannerURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                //.setTitle(guild.name)
                .setDescription(`Id: **${guild.id}**\nName: **${guild.name}**\nMemberCount: \`${guild.memberCount}\`\nCreated At: <t:${Math.round(guild.createdTimestamp / 1000)}:R>\nJoined At: <t:${Math.round(guild.joinedTimestamp / 1000)}:R>`)
                embed.addFields([
                    { name: `**${client.user.username}'s Total Servers**`, value: `\`\`\`js\n${totalServers}\`\`\``, inline: true },
                    { name: `**${client.user.username}'s Total Users**`, value: `\`\`\`js\n${totalUsers}\`\`\``, inline: true }
                ])
                .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
                .setColor(client.color);

            if (guild.vanityURLCode) {
                embed.setURL(`https://discord.gg/${guild.vanityURLCode}`);
            }
            if (guild.banner) {
                embed.setImage(bannerUrl);

            }

            // Send embed using the leave webhook
            if (leave) await leave.send({ embeds: [embed] });
        } catch (error) {
            console.error('Error in guildDelete event:', error);
        }
    });
};


