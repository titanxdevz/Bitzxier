

const cuteCompliments = {
    superCute: [
        'You are super duper cute!',
        'You have an adorable smile!',
        'Your cuteness is off the charts!',
        'You are a bundle of joy!',
        'Your sweetness is unparalleled!',
        'You are cuteness personified!',
        'You have a heart-melting charm!',
        'You are irresistibly cute!',
        'Your charm is simply enchanting!',
        'You are the epitome of cuteness!',
        'You have a delightful personality!',
        'Your cuteness brightens up the room!',
        'You are as cute as a button!',
        'Your presence is utterly charming!',
        'You have a magical cuteness!'
    ],
    veryCute: [
        'You are very cute!',
        'Your smile is delightful!',
        'You are a joy to be around!',
        'You have a sweet personality!',
        'You are a cutie pie!',
        'Your cuteness is captivating!',
        'You have a charming aura!',
        'You are a sweet delight!',
        'Your cuteness is enchanting!',
        'You have a lovable nature!',
        'You are absolutely adorable!',
        'Your presence is heartwarming!',
        'You are cute beyond words!',
        'You have a sweet disposition!',
        'You are the definition of cute!'
    ],
    cute: [
        'You are cute!',
        'You have a cute smile!',
        'You are a pleasure to be with!',
        'You have a lovely personality!',
        'You are a bundle of sweetness!',
        'Your cuteness is appealing!',
        'You have a charming smile!',
        'You are a cute delight!',
        'Your cuteness is adorable!',
        'You have a lovable demeanor!',
        'You are simply adorable!',
        'Your presence is delightful!',
        'You are cuteness itself!',
        'You have a pleasing charm!',
        'You are irresistibly charming!'
    ],
    moderatelyCute: [
        'You are moderately cute!',
        'You have a pleasant smile!',
        'You have a nice personality!',
        'You are a sweet person!',
        'You have an appealing charm!',
        'Your cuteness is pleasant!',
        'You have a delightful presence!',
        'You are a sweet soul!',
        'Your cuteness is charming!',
        'You have a pleasant demeanor!',
        'You are sweet and lovely!',
        'Your presence is heartwarming!',
        'You have a lovely smile!',
        'You are a joy to know!',
        'You are moderately charming!'
    ],
    needsMoreCuteness: [
        'Everyone has their own kind of cuteness!',
        'Keep smiling and stay cute!',
        'You have a unique charm!',
        'You are a work in progress!',
        'Your personality shines through!',
        'You have a special kind of cuteness!',
        'You are unique and special!',
        'Your inner beauty is radiant!',
        'Keep spreading joy!',
        'You have a distinct charm!',
        'You are uniquely cute!',
        'Your charm is your strength!',
        'You are one of a kind!',
        'Keep being wonderful you!',
        'Your smile is endearing!'
    ]
};

function getRandomCuteCompliment(score) {
    let category;
    if (score >= 130) {
        category = 'superCute';
    } else if (score >= 110) {
        category = 'veryCute';
    } else if (score >= 90) {
        category = 'cute';
    } else if (score >= 70) {
        category = 'moderatelyCute';
    } else {
        category = 'needsMoreCuteness';
    }

    const complimentsArray = cuteCompliments[category];
    return complimentsArray[Math.floor(Math.random() * complimentsArray.length)];
}

async function getUserFromMention(message, mention) {
    if (!mention) return null;

    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return null;

    const id = matches[1];
    return message.guild.members.fetch(id) || message.member;
}

module.exports = {
    name: 'cute',
    aliases: ['cuteness'],
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

        // Generate a random cuteness score between 50 and 150
        const score = Math.floor(Math.random() * 101) + 50;

        // Get a random cute compliment based on the score
        const compliment = getRandomCuteCompliment(score);

        // Create an embed message
        const cuteEmbed = client.util.embed()
            .setColor(client.color) // You can set any cute color you like
            .setTitle('Cuteness detector!')
            .setDescription(`${user.user.displayName} is ${score}% cute!`)
      //      .setTimestamp()
            .setFooter({ text : compliment});

        // Send the embed message
        message.channel.send({ embeds: [cuteEmbed] });
    }
};
