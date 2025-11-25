const { Message, Client, MessageEmbed } = require('discord.js');

const compliments = {
    genius: [
        'You are a true genius!',
        'Einstein would be jealous!',
        'Your intelligence is off the charts!',
        'You have a brilliant mind!',
        'You\'re a beacon of intellect!',
        'Your cognitive abilities are astounding!',
        'You think like a true mastermind!',
        'Your brainpower is phenomenal!',
        'You\'re an intellectual powerhouse!',
        'You have a razor-sharp intellect!',
        'You are a mental giant!',
        'Your intellect is unparalleled!',
        'You\'re an incredible thinker!',
        'Your genius is truly inspiring!',
        'You have a mind like no other!'
    ],
    aboveAverage: [
        'You have an above-average intellect!',
        'You\'re smarter than most!',
        'Keep up the good work, you\'re brilliant!',
        'Your mind is a sharp tool!',
        'You have a knack for understanding complex things!',
        'You have impressive mental acuity!',
        'Your intelligence shines brightly!',
        'You grasp concepts quickly and easily!',
        'Your mental agility is impressive!',
        'You have a keen understanding!',
        'You excel at intellectual challenges!',
        'Your intellect is admirable!',
        'You think with clarity and precision!',
        'Your insights are remarkable!',
        'You have a sharp and curious mind!'
    ],
    average: [
        'You have a solid, average intelligence!',
        'You\'re doing great, keep it up!',
        'You\'re perfectly balanced in intellect!',
        'You have a practical and logical mind!',
        'Your intelligence is well-rounded and reliable!',
        'You have a sound mind!',
        'You think clearly and logically!',
        'Your reasoning skills are solid!',
        'You have a balanced perspective!',
        'You grasp concepts steadily!',
        'Your thinking is reliable!',
        'You approach problems with common sense!',
        'You have a pragmatic intellect!',
        'Your cognitive skills are dependable!',
        'You have a sensible and rational mind!'
    ],
    belowAverage: [
        'You have a unique perspective!',
        'You have an interesting way of thinking!',
        'You\'re one of a kind!',
        'Your creativity is your strength!',
        'You see the world in a special way!',
        'You bring a fresh outlook!',
        'You think outside the box!',
        'Your ideas are original!',
        'You have a distinctive way of thinking!',
        'You bring a unique view to the table!',
        'You think in creative ways!',
        'Your imagination is your asset!',
        'You bring new perspectives!',
        'You have a special talent for thinking differently!',
        'Your unconventional thinking is valuable!'
    ],
    needsSupport: [
        'Everyone has their strengths!',
        'Keep learning and growing!',
        'You have potential to unlock!',
        'You are on a journey of growth!',
        'Your determination is commendable!',
        'You have a heart of gold!',
        'Your persistence is inspiring!',
        'You are capable of amazing things!',
        'Your effort is admirable!',
        'You have a unique set of skills!',
        'You bring a lot to the table!',
        'Your progress is promising!',
        'You have the drive to succeed!',
        'You are building a strong foundation!',
        'Your resilience is impressive!'
    ]
};

function getRandomCompliment(iq) {
    let category;
    if (iq >= 130) {
        category = 'genius';
    } else if (iq >= 110) {
        category = 'aboveAverage';
    } else if (iq >= 90) {
        category = 'average';
    } else if (iq >= 70) {
        category = 'belowAverage';
    } else {
        category = 'needsSupport';
    }

    const complimentsArray = compliments[category];
    return complimentsArray[Math.floor(Math.random() * complimentsArray.length)];
}

async function getUserFromMention(message, mention) {
    if (!mention) return null;

    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    return message.guild.members.fetch(id)  ||  message.member;
}

module.exports = {
    name: 'Intelligence',
    aliases: ['iq'],
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        let user = await getUserFromMention(message, args[0]);
        if (!user) {
            try {
                user = message.guild.members.cache.get(args[0]) ? message.guild.members.cache.get(args[0]) : message.member;
            } catch (error) {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Please provide a valid user ID or mention a member.`
                            )
                    ]
                });
            }
        }

        // Generate a random IQ score between 50 and 150
        const iq = Math.floor(Math.random() * 101) + 50;

        // Get a random compliment based on the IQ score
        const compliment = getRandomCompliment(iq);

        // Create an embed message
        const iqEmbed = client.util.embed()
            .setColor(client.color) // You can set any color you like
            .setTitle('IQ Test Result 🧠')
            .setDescription(`Hello ${user.user.displayName}, your IQ score is **${iq}**!`)
            .setTimestamp()
            .setFooter({ text : compliment});

        // Send the embed message
       return message.channel.send({ embeds: [iqEmbed] });
    }
};

