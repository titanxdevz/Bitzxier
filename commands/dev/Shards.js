const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const config = require(`${process.cwd()}/config.json`);

module.exports = {
    name: 'shards',
    aliases: ['cluster', 'clusters'],
    category: 'owner',
    run: async (client, message, args) => {
        // Check if the user is the bot owner
        if (!client.config.owner.includes(message.author.id)) return;

        // Collect shard information
        const shardInfo = await client.cluster.broadcastEval((client) => {
            const cpuUsage = process.cpuUsage();
            const cpuPercent = ((cpuUsage.user + cpuUsage.system) / (process.uptime() * 1e6)) * 100;
            const uptime = Date.now() - process.uptime() * 1000;

            return {
                id: client.cluster.id,
                shardId: client.cluster.ids[0],
                latency: client.ws.ping,
                uptime,
                ram: process.memoryUsage().rss / 1024 / 1024,
                cpu: cpuPercent,
                servers: client.guilds.cache.size,
                members: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
            };
        });

        let currentIndex = 0;
        const clustersPerPage = 3;

        // Helper function to create an embed with up to three clusters
        const createEmbed = (pageIndex) => {
            const start = pageIndex * clustersPerPage;
            const end = start + clustersPerPage;
            const pageClusters = shardInfo.slice(start, end);

            const embed = new EmbedBuilder()
                .setColor(client.color || 0x0099ff)
                .setTitle(`Cluster Status (Page ${pageIndex + 1}/${Math.ceil(shardInfo.length / clustersPerPage)})`);

            pageClusters.forEach(shard => {
                embed.addFields({
                    name: `**Cluster [${shard.id}] Status:**`,
                    value:
                        `**Latency:** ${shard.latency}ms\n` +
                        `**Uptime:** <t:${Math.floor(shard.uptime / 1000)}:R>\n` +
                        `**RAM:** ${Math.round(shard.ram)} MB\n` +
                        `**CPU:** ${shard.cpu.toFixed(2)}%\n` +
                        `**Servers:** ${shard.servers}\n` +
                        `**Members:** ${shard.members.toLocaleString()}`
                });
            });

            return embed;
        };

        // Create navigation buttons
        const row = () => new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentIndex === 0),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentIndex === Math.ceil(shardInfo.length / clustersPerPage) - 1)
            );

        // Send the initial message with the first page embed and buttons
        const messageEmbed = await message.channel.send({
            embeds: [createEmbed(currentIndex)],
            components: [row()]
        });

        // Filter for button interactions
        const filter = (i) => i.user.id === message.author.id;
        const collector = messageEmbed.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'next') currentIndex++;
            else if (interaction.customId === 'previous') currentIndex--;

            // Update embed and buttons based on currentIndex
            await interaction.update({
                embeds: [createEmbed(currentIndex)],
                components: [row()]
            });
        });

        // Disable buttons when the collector ends
        collector.on('end', async () => {
            await messageEmbed.edit({
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('previous')
                                .setLabel('Previous')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true),
                            new ButtonBuilder()
                                .setCustomId('next')
                                .setLabel('Next')
                                .setStyle(ButtonStyle.Primary)
                                .setDisabled(true)
                        )
                ]
            });
        });
    }
};
