const { EmbedBuilder } = require('discord.js');
const canvafy = require('canvafy');

module.exports = {
    name: 'ship',
    aliases: ['shiprandom'],
    category: 'info',
    cooldown: 8,
    premium: false,

    run: async (client, message, args) => {
        try {
            let member;

            if (args[0]) {
                // Check if the argument is 'random'
                if (args[0].toLowerCase() === 'random') {
                    const members = message.guild.members.cache
                        .filter(m => m.user.id !== message.author.id)
                        .map(m => m.user);
                    member = members[Math.floor(Math.random() * members.length)];
                } else {
                    // Try to get the user by mention or ID
                    member = await getUserFromMention(message, args[0]);
                    if (!member) {
                        try {
                            member = await message.guild.members.fetch(args[0]);
                        } catch (error) {
                            return message.channel.send('❌ User not found!');
                        }
                    }
                }
            } else {
                // If no argument is provided, choose a random member
                const members = message.guild.members.cache
                    .filter(m => m.user.id !== message.author.id)
                    .map(m => m.user);
                member = members[Math.floor(Math.random() * members.length)];
            }

            const lovePercentage = Math.floor(Math.random() * 100);

            const relationshipDescriptions = [
                "A relationship is plausible!",
                "Sparks are definitely flying!",
                "Maybe better as friends?",
                "True love is in the air!",
                "Opposites attract!",
                "A fiery passion awaits!",
                "The beginning of something magical!",
                "A perfect match made in heaven!",
                "They can't keep their eyes off each other!",
                "Love isn't always easy...",
                "They're each other's better half!",
                "Destined to be together!",
                "They'll be the funniest couple around!",
                "They complete each other!",
                "A cosmic connection!",
                "Love at first sight!",
                "They bring out the best in each other!",
                "Party couple vibes!",
                "Fingers crossed for a fairytale ending!",
                "They're bound to make memories together!",
                "Love like no other!",
                "A wholesome, sweet connection!",
                "A subtle yet powerful bond!",
                "Sparks of excitement fill the air!"
            ];
            const mention = (member ? member.username : (member.user ? member.user.username : 'Unknown User')) || (member.user.username || 'Unknown User')
            const randomLine = relationshipDescriptions[Math.floor(Math.random() * relationshipDescriptions.length)];
            // Generate the ship image
            const ship = await new canvafy.Ship()
                .setAvatars(
                    message.author.displayAvatarURL({ forceStatic: true, extension: 'png' }),
                    member.displayAvatarURL({ forceStatic: true, extension: 'png' })
                )
                .setBackground(
                    'image',
                    'https://cdn.discordapp.com/attachments/1189308460072960140/1303644352270041129/OIP_22.png?ex=672c80ea&is=672b2f6a&hm=78f9226530ffe9f80268c323af6601158be37bf9f205e157f36bb2a03ed85914&'
                )
                .setOverlayOpacity(0.5)
                .setCustomNumber(lovePercentage)
                .build();

            message.reply({
                files: [{
                    attachment: ship,
                    name: 'ship-image.png'
                }],
                content: `**${message.author.tag}** + **${mention}** = ${lovePercentage}% 💗\n${randomLine}`
            });
        } catch (error) {
            console.error(error);
            message.channel.send('❌ Something went wrong while generating the ship image.');
        }
    }
};

// Helper function to get user from mention or ID
async function getUserFromMention(message, mention) {
    if (!mention) return null;
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;
    const id = matches[1];
    return await message.guild.members.fetch(id).catch(() => null);
}
