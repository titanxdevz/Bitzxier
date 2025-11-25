
const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

module.exports = {
    name: 'roleicon',
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        const sai = client.util.embed().setColor(client.color);

        // Check if the user has Manage Roles permissions
        if (!message.member.permissions.has('ManageRoles')) {
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | You must have \`Manage Roles\` permissions to use this command.`
                    )
                ]
            });
        }

        // Check if the bot has Manage Roles permissions
        if (!message.guild.members.me.permissions.has('ManageRoles')) {
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | I don't have \`Manage Roles\` permissions to execute this command.`
                    )
                ]
            });
        }

        // Check if the user is the guild owner or has a higher role than the bot
        if (message.author.id !== message.guild.ownerId && message.member.roles.highest.position <= message.guild.members.me.roles.highest.position) {
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | You must have a higher role than me to use this command.`
                    )
                ]
            });
        }

        // Check if the server has the required boost level
        const premiumTier = parseInt(message.guild.premiumTier || "0");
        if (premiumTier < 2) {
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | Your server doesn't meet the **Roleicon** requirements. Servers with level **2** boosts are allowed to set role icons.`
                    )
                ]
            });
        }

        // Check if role and emoji arguments are provided
        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | Usage: ${message.guild.prefix}roleicon <role> <emoji>`
                    )
                ]
            });
        }

        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) {
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | Provide a valid role.`
                    )
                ]
            });
        }

        // Check if the role position is higher than the bot's highest role
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | ${role} is higher or equal in the role hierarchy than my highest role.`
                    )
                ]
            });
        }

        // Remove role icon if it exists and no new emoji is provided
        if (role.iconURL() && !args[1]) {
            try {
                await role.setIcon(null);
                return message.channel.send({
                    embeds: [
                        sai.setDescription(
                            `${client.emoji.tick} | Successfully removed icon from ${role}.`
                        )
                    ]
                });
            } catch (err) {
                return message.channel.send({
                    embeds: [
                        sai.setDescription(
                            `${client.emoji.cross} | An error occurred while removing the icon.`
                        )
                    ]
                });
            }
        }

        // Check if emoji argument is provided
        if (!args[1]) {
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | Provide an emoji.`
                    )
                ]
            });
        }

        const emojiRegex = /<a?:\w{2,}:\d{17,20}>/g;
        const getEmojiUrl = async (emoji) => {
            if (emoji.match(emojiRegex)) {
                const emojiID = emoji.match(/:\d{17,20}>$/)[0].slice(1, -1);
                return `https://cdn.discordapp.com/emojis/${emojiID}.png`;
            } else if (emoji.match(standardEmojiRegex)) {
                const codePoint = emoji.codePointAt(0).toString(16);
                return `https://twemoji.maxcdn.com/v/latest/72x72/${codePoint}.png`;
            } else {
                throw new Error('Invalid emoji format');
            }
        };
        

        try {
            const emojiUrl = await getEmojiUrl(args[1]);
            const response = await axios.get(emojiUrl, { responseType: 'arraybuffer' });
            await role.setIcon(response.data);
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.tick} | Successfully set the icon for ${role}.`
                    )
                ]
            });
        } catch (err) {
          //  console.error("Error setting role icon:", err);
            return message.channel.send({
                embeds: [
                    sai.setDescription(
                        `${client.emoji.cross} | An error occurred while setting the icon.`
                    )
                ]
            });
        }
    }
};





