
module.exports = {
    name: 'warn',
    category: 'mod',
    premium: false,
    subcommand : ['<@member/id>','list','reset','remove'],
    run: async (client, message, args) => {
        // Check for mod role or permissions
        let role = await client.db.get(`modrole_${message.guild.id}`) || null;
        if (!message.member.permissions.has('ModerateMembers') && !message.member.roles.cache.has(role)) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setDescription(`${client.emoji.cross} | You must have \`Timeout Members\` permissions or the required role to use this command.`)
                ]
            });
        }

        if (!args[0]) {
            return message.channel.send({
                embeds: [
                    client.util.embed()
                        .setColor(client.color)
                        .setTitle('Warn Command Panel')
                        .setDescription(
                            '**Available Subcommands:**\n' +
                            `\`warn @member <reason>\`: Warn a member with the provided reason.\n` +
                            `\`warn reset @member\`: Reset all warnings for the mentioned member.\n` +
                            `\`warn list @member\`: List all warnings for the mentioned member.\n` +
                            `\`warn remove @member <warnID>\`: Remove a specific warning for the member using the warning ID.\n`
                        )
                        .setFooter({ text: 'Use the appropriate command for managing warnings.' })
                ]
            });
        }

        const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]); // Get the mentioned member
        if (member && !['list', 'remove', 'reset'].includes(args[0].toLowerCase())) {
            const reason = args.slice(1).join(' ') || "No Reason Provided";
                const timestamp = new Date().toLocaleString();
                const warnId = Math.floor(Math.random() * 1000000).toString(); // Generate a random ID for the warning

                // Check the current warnings count
                const selectWarnings = client.warn.prepare('SELECT * FROM warnings WHERE guildId = ? AND userId = ?');
                const warnings = selectWarnings.all(message.guild.id, member.id);

                if (warnings.length >= 5) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | **${member.user.tag}** has already received the maximum of 5 warnings.`)
                        ]
                    });
                }

                const insertWarn = client.warn.prepare('INSERT INTO warnings (guildId, userId, reason, moderatorId, timestamp, warnId) VALUES (?, ?, ?, ?, ?, ?)');
                insertWarn.run(message.guild.id, member.id, reason, message.member.id, timestamp, warnId);

                let notify;
                try {
                    notify = await member.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`You have been warned in **${message.guild.name}**\nReason: \`${reason}\`\nWarned by: ${message.member.displayName} at ${timestamp}\nWarning ID: ${warnId}`)
                        ]
                    });
                } catch (err) {
                    notify = false; // If the member cannot be notified
                }

                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.tick} | **${member.user.tag}** has been warned.\nReason: \`${reason}\`\nWarned by: ${message.member.displayName} | (${message.member.id})\nTimestamp: ${timestamp}\nWarning ID: ${warnId}\nMember Notified: ${notify ? "Yes" : "No"}`
                            )
                    ]
                });
        } else {
            // If no member is mentioned, proceed with other subcommands
            const otherSubcommand = args[0]?.toLowerCase();

            if (otherSubcommand === 'reset') {
                const memberToReset = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
                if (!memberToReset) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Please mention a valid member to reset warnings.`)
                        ]
                    });
                }

                const deleteWarnings = client.warn.prepare('DELETE FROM warnings WHERE guildId = ? AND userId = ?');
                const info = deleteWarnings.run(message.guild.id, memberToReset.id);
                if (info.changes > 0) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.tick} | All warnings for **${memberToReset.user.tag}** have been reset.`)
                        ]
                    });
                } else {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | **${memberToReset.user.tag}** has no warnings to reset.`)
                        ]
                    });
                }
            } else if (otherSubcommand === 'list') {
                const memberToList = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
                if (!memberToList) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Please mention a valid member to list warnings.`)
                        ]
                    });
                }

                const selectWarnings = client.warn.prepare('SELECT * FROM warnings WHERE guildId = ? AND userId = ?');
                const warnings = selectWarnings.all(message.guild.id, memberToList.id);

                if (warnings.length === 0) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | **${memberToList.user.tag}** has no warnings.`)
                        ]
                    });
                }

                const warnList = warnings.map(warn =>
                    `**ID:** \`${warn.warnId}\` | Moderator: <@${warn.moderatorId}>, Reason: \`${warn.reason}\`, Timestamp: \`${warn.timestamp}\``).join('\n');

                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setTitle(`Warnings for ${memberToList.user.tag}`)
                            .setDescription(warnList)
                    ]
                });
            } else if (otherSubcommand === 'remove') {
                const memberToRemove = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
                const warnId = args[2];

                if (!memberToRemove || !warnId) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Please mention a valid member and provide a warning ID to remove.`)
                        ]
                    });
                }

                const deleteWarning = client.warn.prepare('DELETE FROM warnings WHERE guildId = ? AND userId = ? AND warnId = ?');
                const info = deleteWarning.run(message.guild.id, memberToRemove.id, warnId);

                if (info.changes > 0) {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.tick} | Warning with ID \`${warnId}\` for **${memberToRemove.user.tag}** has been removed.`)
                        ]
                    });
                } else {
                    return message.channel.send({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`${client.emoji.cross} | Warning with ID \`${warnId}\` not found for **${memberToRemove.user.tag}**.`)
                        ]
                    });
                }
            } else {
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(`${client.emoji.cross} | Invalid subcommand. Use \`warn @member <reason>\`, \`warn reset @member\`, \`warn list @member\`, or \`warn remove @member <warnID>\`.`)
                    ]
                });
            }
        }
    }
};
