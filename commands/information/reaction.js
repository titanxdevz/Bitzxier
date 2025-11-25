const { EmbedBuilder } = require('discord.js');

// Store user IDs who are currently executing the command
const cooldown = new Set();

module.exports = {
    name: 'reaction',
    category: 'info',
    premium: false,

    run: async (client, message, args) => {
        // Check if the user is already in cooldown
        if (cooldown.has(message.author.id)) {
            return message.reply("You are currently in cooldown. Please try again later.");
        }

        // Add the user to cooldown
        cooldown.add(message.author.id);

        try {
            const gameEmbed = client.util.embed()
                .setTitle("React to play the game! 🎮")
                .setDescription("React with the emojis below to play.")
                .setColor(client.color)
                .setTimestamp();

            const gameMessage = await message.channel.send({ embeds: [gameEmbed] });

            const allEmojis = ['🍇', '🍒', '🍊', '🍓', '🍐', '🍍', '🍋', '🍎', '🥝', '🍌', '🥭', '🍏', '🍅', '🍆', '🥑'];

            for (let i = allEmojis.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allEmojis[i], allEmojis[j]] = [allEmojis[j], allEmojis[i]];
            }
            const emojis = allEmojis.slice(0, 6);

            for (const emoji of emojis) {
                await gameMessage.react(emoji);
            }

            const chosenEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            await gameMessage.react(chosenEmoji);

            gameEmbed.setDescription(`The bot chose ${chosenEmoji}!`);
            await gameMessage.edit({ embeds: [gameEmbed] });

            const filter = (reaction, user) => {
                return reaction.emoji.name === chosenEmoji && !user.bot;
            };

            const collected = await gameMessage.awaitReactions({ filter, max: 1, time: 5000 }); 

            if (collected.size > 0) {
                const winner = collected.first().users.cache.find(user => !user.bot);
                if (winner) {
                    gameEmbed.setDescription(`<@${winner.id}> won the game!`);
                } else {
                    gameEmbed.setDescription("Unable to determine the winner.");
                }
            } else {
                gameEmbed.setDescription("Nobody reacted in time! Game over.");
            }
            await gameMessage.edit({ embeds: [gameEmbed] });
        } finally {
            cooldown.delete(message.author.id);
        }
    }
};
