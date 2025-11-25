const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle , InteractionCollector} = require('discord.js');
const db = require('../../models/afk.js');

module.exports = {
    name: 'afk',
    description: "Set's You Away From Keyboard",
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        const data = await db.findOne({
            Guild: message.guildId,
            Member: message.author.id
        });

        const reason = args.join(' ') ? args.join(' ') : "I'm AFK :)";

        const urlRegex = /\b(?:https?:\/\/|www\.)\S+/gi;
        const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|club)|discordapp\.com\/invite|discord\.com\/invite)\/.+[a-z]/gi;
        const checkmessage = reason;
        if (regex.test(checkmessage) || urlRegex.test(checkmessage)) { 
            return await message.channel.send({
                embeds: [client.util.embed().setColor(client.color).setDescription('You cannot add links in my AFK system. Do not attempt to advertise using me.').setFooter({ text: 'BITZXIER FETCHING | LINK FOUND' })]
            });
        }

        if (data) {
            const embed = client.util.embed()
                .setTitle('UwU, you are already AFK.')
                .setColor(client.color);
            return message.channel.send({ embeds: [embed] });
        } else {
            // Create the buttons
            const globalButton = new ButtonBuilder()
                .setCustomId('afk_global')
                .setLabel('Set Global AFK')
                .setStyle(ButtonStyle.Primary);

            const serverButton = new ButtonBuilder()
                .setCustomId('afk_server')
                .setLabel('Set Server AFK')
                .setStyle(ButtonStyle.Secondary);

            // Create the action row
            const actionRow = new ActionRowBuilder()
                .addComponents(globalButton, serverButton);

            // Send the embed with the buttons
            const embed = client.util.embed()
                .setDescription(`Please choose whether you want to set it globally or just for this server.`)
                .setColor(client.color);

                const msg = await message.channel.send({ embeds: [embed], components: [actionRow] });

                // Set up the interaction collector
                const collector = new InteractionCollector(client, {
                    message: msg,
                    time: 10000, // 10 seconds timeout
                });
        
                collector.on('collect', async (interaction) => {
                    if (!interaction.isButton()) return;
        
                    const { customId } = interaction;
                    const memberId = interaction.user.id;
                    const guildId = interaction.guildId;
        
                    if (customId === 'afk_global' || customId === 'afk_server') {
                        // Determine if the AFK should be global or server-specific
                        const isGlobal = customId === 'afk_global';
        
                        // Get the reason from the interaction (You might need a way to store and retrieve this)
                        const reason = args.join(' ') || "I'm AFK :)";
        
                        // Remove existing AFK status if present
                        await db.deleteMany({ Member: memberId });
        
                        // Save the new AFK status
                        const newData = new db({
                            Guild: isGlobal ? null : guildId,
                            Member: memberId,
                            Reason: reason,
                            Time: Date.now(),
                            IsGlobal: isGlobal
                        });
        
                        await newData.save();        
                        // Remove buttons after interaction
                        await msg.edit({ embeds : [client.util.embed().setColor(client.color).setDescription(`Your AFK is now set to: **${reason}**`)], components: [] });
        
                        collector.stop(); // Stop the collector after interaction is handled
                    }
                });
        
                collector.on('end', (collected, reason) => {
                    if (reason === 'time') {
                        // If timeout occurred, remove buttons
                        msg.edit({ components: [] });
                    }
                });
        
        }

}
};

