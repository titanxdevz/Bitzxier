const {
    EmbedBuilder,
    Collection,
    WebhookClient,
    ButtonStyle,
    ActionRowBuilder,
    ButtonBuilder,
    StringSelectMenuBuilder,
    AttachmentBuilder,
    PermissionsBitField,
    ChannelType,
    Partials
} = require('discord.js')
const { getSettingsar } = require('../models/autorole')

this.config = require(`${process.cwd()}/config.json`)
let globalCooldown
module.exports = class Util {
    constructor(client) {
        this.client = client
        this.blacklistCache = new Map();
        this.lastBlacklistRefresh = 0;
        this.BLACKLIST_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration
    }
    
    async sendPreview(settings, member) {
        if (!settings.welcome?.enabled)
            return 'Welcome message not enabled in this server'

        const targetChannel = member.guild.channels.cache.get(
            settings.welcome.channel
        )
        if (!targetChannel)
            return 'No channel is configured to send welcome message'

        const response = await this.client.util.buildGreeting(
            member,
            'WELCOME',
            settings.welcome
        )

        let time = settings.welcome.autodel
        await this.client.util.sendMessage(targetChannel, response, time)

        return `Sent welcome preview to ${targetChannel.toString()}`
    }

    async setStatus(settings, status) {
        const enabled = status.toUpperCase() === 'ON' ? true : false
        settings.welcome.enabled = enabled
        await settings.save()
        return `Configuration saved! Welcome message ${enabled ? '**enabled**' : '**disabled**'}`
    }

    async setChannel(settings, channel) {
        if (!this.client.util.canSendEmbeds(channel)) {
            return (
                'Ugh! I cannot send greeting to that channel? I need the `Write Messages` and `Embed Links` permissions in ' +
                channel.toString()
            )
        }
        settings.welcome.channel = channel.id
        await settings.save()
        return `Configuration saved! Welcome message will be sent to ${channel ? channel.toString() : 'Not found'}`
    }

    async setDescription(settings, desc) {
        settings.welcome.embed.description = desc
        await settings.save()
        return 'Configuration saved! Welcome message updated'
    }

    async setTitle(settings, title) {
        settings.welcome.embed.title = title
        await settings.save()
        return 'Configuration saved! Welcome message updated'
    }

    async setImage(settings, image) {
        settings.welcome.embed.image = image
        await settings.save()
        return 'Configuration saved! Welcome image updated'
    }
    async setThumbnail(settings, status) {
        settings.welcome.embed.thumbnail =
            status.toUpperCase() === 'ON' ? true : false
        await settings.save()
        return 'Configuration saved! Welcome message updated'
    }

    canSendEmbeds(channel) {
        return channel.permissionsFor(channel.guild.members.me).has(['SendMessages', 'EmbedLinks'])
    }

    async buildGreeting(member, type, config) {
        if (!config) return
        let content = config.content
            ? await this.client.util.parse(config.content, member)
            : `<@${member.user.id}>`
        const embed = this.client.util.embed()
        if (config.embed.description) {
            embed.setDescription(
                await this.client.util.parse(config.embed.description, member)
            )
        }
        embed.setColor(
            config.embed.color ? config.embed.color : member.client.color
        )
        if (config.embed.thumbnail) {
            embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        }
        if(config.embed.image) {
            embed.setImage(
                await this.client.util.parse(config.embed.image, member)
            )
        }
        if (config.embed.title) {
            embed.setTitle(
                await this.client.util.parse(config.embed.title, member)
            )
        }
        if (config.embed.footer) {
            embed.setFooter({
                text: await this.client.util.parse(config.embed.footer, member)
            })
        }

        if (
            !config.content &&
            !config.embed.description &&
            !config.embed.footer 
        ) {
            return {
                content: `<@${member.user.id}>`,
                embeds: [
                    this.client.util.embed()
                        .setColor(this.client.color)
                        .setDescription(
                            `Hey ${member.displayName}, Welcome to the server <a:welcome:1188456678392348702>.`
                        )
                ]
            }
        }
        return { content, embeds: [embed] }
    }

    async sendMessage(channel, content, seconds) {
        if (!channel || !content) return
        const perms = new PermissionsBitField(['ViewChannel', 'SendMessages']);
        if (content.embeds && content.embeds.length > 0) {
            perms.add('EmbedLinks');
        }
        if (
            channel.type !== 'DM' &&
            !channel.permissionsFor(channel.guild.me).has(perms)
        )
            return
        try {
            if (!seconds || seconds == 0) return await channel.send(content)
            const reply = await channel.send(content)
            setTimeout(
                () => reply.deletable && reply.delete().catch((ex) => {}),
                seconds * 1000
            )
        } catch (ex) {
            return
        }
    }

    async sendWelcome(member, settings) {
        const config = (await getSettingsar(member.guild))?.welcome
        if (!config || !config.enabled) return

        const channel = member.guild.channels.cache.get(config.channel)
        if (!channel) return

        const response = await this.client.util.buildGreeting(
            member,
            'WELCOME',
            config
        )

        this.client.util.sendMessage(
            channel,
            response,
            settings.welcome.autodel
        )
    }

    isHex(text) {
        return /^#[0-9A-F]{6}$/i.test(text)
    }

    async refreshBlacklistCache() {
        try {
            const data = await this.client.db.get(`blacklistserver_${this.client.user.id}`) || [];
            this.blacklistCache.clear();
            data.forEach(guildId => this.blacklistCache.set(guildId, true));
            this.lastBlacklistRefresh = Date.now();
        } catch (error) {
            console.error('Error refreshing blacklist cache:', error);
        }
    }

    async BlacklistCheck(guild) {
        try {
            // Check if cache needs refresh
            if (Date.now() - this.lastBlacklistRefresh > this.BLACKLIST_CACHE_DURATION) {
                await this.refreshBlacklistCache();
            }

            // Check cache first
            if (this.blacklistCache.has(guild.id)) {
                return true;
            }

            // If not in cache, check database and update cache
            const data = await this.client.db.get(`blacklistserver_${this.client.user.id}`) || [];
            if (data.includes(guild.id)) {
                this.blacklistCache.set(guild.id, true);
                return true;
            }
            
            return false;
        } catch (error) {
            return false;
        }
    }


    async parse(content, member) {
        let mention = `<@${member.user.id}>`
        return content
            .replaceAll(/\\n/g, '\n')
            .replaceAll(/{server}/g, member.guild.name)
            .replaceAll(/{count}/g, member.guild.memberCount)
            .replaceAll(/{member:name}/g, member.displayName)
            .replaceAll(/{member:mention}/g, mention)
            .replaceAll(/{member:id}/g, member.user.id)
            .replaceAll(/{member:created_at}/g, `<t:${Math.round(member.user.createdTimestamp / 1000)}:R>`)
    }


    async purgeMessages(issuer, channel, type, amount, argument) {
        if (
            !channel
                .permissionsFor(issuer)
                .has(['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
        ) {
            return 'MEMBER_PERM'
        }

        if (
            !channel
                .permissionsFor(issuer.guild.me)
                .has(['MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
        ) {
            return 'BOT_PERM'
        }

        const toDelete = new Collection()

        try {
            const messages = await channel.messages.fetch(
                { limit: amount },
                { cache: false, force: true }
            )

            for (const message of messages.values()) {
                if (toDelete.size >= amount) break
                if (!message.deletable) continue

                if (type === 'ALL') {
                    toDelete.set(message.id, message)
                } else if (type === 'ATTACHMENT') {
                    if (message.attachments.size > 0) {
                        toDelete.set(message.id, message)
                    }
                } else if (type === 'BOT') {
                    if (message.author.bot) {
                        toDelete.set(message.id, message)
                    }
                } else if (type === 'LINK') {
                    if (containsLink(message.content)) {
                        toDelete.set(message.id, message)
                    }
                } else if (type === 'TOKEN') {
                    if (message.content.includes(argument)) {
                        toDelete.set(message.id, message)
                    }
                } else if (type === 'USER') {
                    if (message.author.id === argument) {
                        toDelete.set(message.id, message)
                    }
                }
            }

            if (toDelete.size === 0) return 'NO_MESSAGES'

            const deletedMessages = await channel.bulkDelete(toDelete, true)
            return deletedMessages.size
        } catch (ex) {
            return 'ERROR'
        }
    }

    async sendMessage(channel, content, seconds) {
        if (!channel || !content) return
        const perms = new PermissionsBitField(['ViewChannel', 'SendMessages']);
        if (content.embeds && content.embeds.length > 0) {
            perms.add('EmbedLinks');
        }
        if (
            channel.type !== ChannelType.DM &&
            !channel.permissionsFor(channel.guild.members.me).has(perms)
        )
            return
        try {
            if (!seconds || seconds == 0) return await channel.send(content)
            const reply = await channel.send(content)
            setTimeout(
                () => reply.deletable && reply.delete().catch((ex) => {}),
                seconds * 1000
            )
        } catch (ex) {
            return
        }
    }
    /**
     * @param
     */
    async isExtraOwner(member, guild) {
        const data = await this.client.db.get(`extraowner_${guild.id}`)
        if (!data) return false
        if (data?.owner?.includes(member.id)) return true
        else return false
    }

    isHex(text) {
        return /^#[0-9A-F]{6}$/i.test(text)
    }

    hasHigher(member) {
        if (
            member.roles.highest.position <=
                member.guild.members.me.roles.highest.position &&
            member.user.id != member.guild.ownerId
        )
            return false
        else return true
    }

    async selectMenuHandle(interaction) {
        try {
            let options = interaction.values
            const funny = options[0]
            let _commands
            const embed = this.client.util.embed()
                .setAuthor({
                    name: this.client.user.username,
                    iconURL: this.client.user.displayAvatarURL()
                })
                .setColor(this.client.color)

                .setThumbnail(
                    interaction.guild.iconURL({
                        dynamic: true
                    })
                )
                if (funny === 'antinuke') {
                    let cmdList = [];
                    interaction.client.commands
                    .filter((cmd) => cmd.category === 'security')
                    .forEach((cmd) => {
                        if (cmd.subcommand && cmd.subcommand.length) {
                            cmdList.push(`\`${cmd.name}\``);
                            cmd.subcommand.forEach((subCmd) => {
                                cmdList.push(`\`${cmd.name} ${subCmd}\``);
                            });
                        } else {
                            cmdList.push(`\`${cmd.name}\``);
                        }
                    });
                
                    const embed1 = new EmbedBuilder()
                        .setTitle('Antinuke Commands')
                        .setColor(interaction.client.color);
                
                    const embed2 = new EmbedBuilder()
                        .setTitle('Antinuke Commands')
                        .setColor(interaction.client.color);
                
                    const joinedCmdList = cmdList.sort().join(', ');
                    if (joinedCmdList.length <= 1024) {
                        embed1.addFields({ name: `**<:antinuke:1436754524734750780> Antinuke \`[${cmdList.length}]\`**`, value: joinedCmdList });
                        interaction.reply({ embeds: [embed1], ephemeral: true });
                    } else {
                        const half = Math.ceil(cmdList.length / 2);
                        const firstHalf = cmdList.slice(0, half).join(', ');
                        const secondHalf = cmdList.slice(half).join(', ');
                
                        embed1.addFields({ name: `**<:antinuke:1436754524734750780> Antinuke \`[${half}]\`**`, value: firstHalf });
                        embed2.addFields({ name: `**<:antinuke:1436754524734750780> Antinuke \`[${cmdList.length - half}]\`**`, value: secondHalf });
                
                        interaction.reply({ embeds: [embed1, embed2], ephemeral: true });
                    }
                    return;
                }
                
            if (funny === 'moderation') {
                    let cmdList = [];
                    interaction.client.commands
                        .filter((cmd) => cmd.category === 'mod')
                        .forEach((cmd) => {
                            if (cmd.subcommand && cmd.subcommand.length) {
                                cmdList.push(`\`${cmd.name}\``);
                                cmd.subcommand.forEach((subCmd) => {
                                    cmdList.push(`\`${cmd.name} ${subCmd}\``);
                                });
                            } else {
                                cmdList.push(`\`${cmd.name}\``);
                            }
                        });
                
                    const embed1 = new EmbedBuilder()
                        .setTitle('Moderation Commands')
                        .setColor(interaction.client.color);
                
                    const embed2 = new EmbedBuilder()
                        .setTitle('Moderation Commands')
                        .setColor(interaction.client.color);
                
                    const joinedCmdList = cmdList.sort().join(', ');
                    if (joinedCmdList.length <= 1024) {
                        embed1.addFields({ name: `**<:moderation:1436754537548353827> Moderation \`[${cmdList.length}]\`**`, value: joinedCmdList });
                        interaction.reply({ embeds: [embed1], ephemeral: true });
                    } else {
                        const half = Math.ceil(cmdList.length / 2);
                        const firstHalf = cmdList.slice(0, half).join(', ');
                        const secondHalf = cmdList.slice(half).join(', ');
                
                        embed1.addFields({ name: `**<:moderation:1436754537548353827> Moderation \`[${half}]\`**`, value: firstHalf });
                        embed2.addFields({ name: `**<:moderation:1436754537548353827> Moderation \`[${cmdList.length - half}]\`**`, value: secondHalf });
                
                        interaction.reply({ embeds: [embed1, embed2], ephemeral: true });
                    }
                    return;
                }       
            if (funny === 'automod') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'automod')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                });
                embed.addFields({
             name :  `**<:automod:1436754550643101756> Automod \`[${cmdList.length}]\`**`,
                 value : cmdList.sort().join(', ')
            })
                interaction
                    .reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                    .catch((_) => {})
                return
            }
            if (funny === 'logger') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'logging')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                });
                embed.addFields({
                   name : `**<:logger:1436754563452502187> Logging \`[${cmdList.length}]\`**`,
                    value : cmdList.sort().join(', ')
            })
                interaction
                    .reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                    .catch((_) => {})
                return
            }
            if (funny === 'utility') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'info')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
                   name : `**<:utility:1436754577528459408> Utility  \`[${cmdList.length}]\`**`,
                  value :  cmdList.sort().join(', ')
            })
                interaction
                    .reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                    .catch((_) => {})
                return
            }
            if (funny === 'serverutility') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'leaderboard')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
             name :  `**<:BitzxierBlackServerconfig:1276115343638528062> Server Utility \`[${cmdList.length}]\`**`,
                value :    cmdList.sort().join(', ')
            })
                await interaction
                .reply({
                    embeds: [embed],
                    ephemeral: true
                })
                    .catch((_) => _)
                return
            }
            if (funny === 'verification') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'verification')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
                   name : `**<:BitzxierBlackVerification:1276115246976729088> Verification \`[${cmdList.length}]\`**`,
                value :    cmdList.sort().join(', ')
            })
                interaction
                    .reply({
                        embeds: [embed],
                        ephemeral: true
                    })
                    .catch((_) => {})
                return
            }
            if (funny === 'jointocreate') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'jointocreate')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
                  name :  `**<:jointocreate:1436754590002315337> Join To Create \`[${cmdList.length}]\`**`,
                   value : cmdList.sort().join(', ')
            })
                await  interaction
                .reply({
                    embeds: [embed],
                    ephemeral: true
                })
                    .catch((_) => _)
                return
            }
            if (funny === 'voice') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'voice')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
                  name :  `**<:voice:1436754603008856125> Voice \`[${cmdList.length}]\`**`,
                   value : cmdList.sort().join(', ')
            })
                await  interaction
                .reply({
                    embeds: [embed],
                    ephemeral: true
                })
                    .catch((_) => _)
                return
            }
            if (funny === 'customrole') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'customrole')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
                  name :  `**<:customrole:1436754616477024356> Customrole \`[${cmdList.length}]\`**`,
                   value : cmdList.sort().join(', ')
            })
                await  interaction
                .reply({
                    embeds: [embed],
                    ephemeral: true
                })
                    .catch((_) => _)
                return
            }
            if (funny === 'welcomer') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'welcomer')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
                  name :  `**<:welcomer:1436754629328240721> Welcomer \`[${cmdList.length}]\`**`,
                   value : cmdList.sort().join(', ')
            })
                await  interaction
                .reply({
                    embeds: [embed],
                    ephemeral: true
                })
                    .catch((_) => _)
                return
            }
            if (funny === 'autoresponder') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'autoresponder')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
                  name :  `**<:BitzxierBlackAuto:1276598268897263768> Auto Responder \`[${cmdList.length}]\`**`,
                   value : cmdList.sort().join(', ')
            })
                await  interaction
                .reply({
                    embeds: [embed],
                    ephemeral: true
                })
                    .catch((_) => _)
                return
            }
            if (funny === 'sticky') {
                let cmdList = [];
                interaction.client.commands
                .filter((cmd) => cmd.category === 'sticky')
                .forEach((cmd) => {
                    if (cmd.subcommand && cmd.subcommand.length) {
                        cmdList.push(`\`${cmd.name}\``);
                        cmd.subcommand.forEach((subCmd) => {
                            cmdList.push(`\`${cmd.name} ${subCmd}\``);
                        });
                    } else {
                        cmdList.push(`\`${cmd.name}\``);
                    }
                })
                embed.addFields({
                  name :  `**<:BitzxierBlackSticky:1276598347502845963> Sticky \`[${cmdList.length}]\`**`,
                   value : cmdList.sort().join(', ')
            })
                await  interaction
                .reply({
                    embeds: [embed],
                    ephemeral: true
                })
                    .catch((_) => _)
                return
            }
           
         if(funny === 'ticket') {
            let cmdList = [];
            interaction.client.commands
            .filter((cmd) => cmd.category === 'ticket')
            .forEach((cmd) => {
                if (cmd.subcommand && cmd.subcommand.length) {
                    cmdList.push(`\`${cmd.name}\``);
                    cmd.subcommand.forEach((subCmd) => {
                        cmdList.push(`\`${cmd.name} ${subCmd}\``);
                    });
                } else {
                    cmdList.push(`\`${cmd.name}\``);
                }
            });
        
            const embed1 = new EmbedBuilder()
                .setTitle('Ticket Commands')
                .setColor(interaction.client.color);
        
            const embed2 = new EmbedBuilder()
                .setTitle('Ticket Commands')
                .setColor(interaction.client.color);
        
            const joinedCmdList = cmdList.sort().join(', ');
            if (joinedCmdList.length <= 1024) {
                embed1.addFields({ name: `**<:ticket:1436754643022516430> Ticket \`[${cmdList.length}]\`**`, value: joinedCmdList });
                interaction.reply({ embeds: [embed1], ephemeral: true });
            } else {
                const half = Math.ceil(cmdList.length / 2);
                const firstHalf = cmdList.slice(0, half).join(', ');
                const secondHalf = cmdList.slice(half).join(', ');
        
                embed1.addFields({ name: `**<:ticket:1436754643022516430> Ticket \`[${half}]\`**`, value: firstHalf });
                embed2.addFields({ name: `**<:ticket:1436754643022516430> Ticket \`[${cmdList.length - half}]\`**`, value: secondHalf });
        
                interaction.reply({ embeds: [embed1, embed2], ephemeral: true });
            }
    
                        return;
        }
    
        } catch (err) {
            return
        }
    }
     countCommandsAndSubcommands = (client) => {
        let totalCount = 0;
    
        this.client.commands.forEach(command => {
            totalCount++; // Count the main command
    
            // If the command has subcommands, add them to the count
            if (command.subcommand && Array.isArray(command.subcommand)) {
                totalCount += command.subcommand.length;
            }
        });
    
        return totalCount;
    };
     async manageAfk(message, client) {
        const db = require('../models/afk.js');
        let data = await db.findOne({
            Member: message.author.id,
            $or: [
                { Guild: message.guildId },   // Server-specific AFK
                { Guild: null }                // Global AFK
            ]
        });
    
        if (data) {
            if (message.author.id === data.Member) {
                if (data.Guild === message.guildId || data.Guild === null) {
                    await data.deleteOne();
                    return message.reply({
                        embeds: [
                            client.util.embed()
                                .setColor(client.color)
                                .setDescription(`I Removed Your AFK.`)
                        ]
                    });
                }
            }
        }
    
        const memberMentioned = message.mentions.users.first();
        if (memberMentioned) {
            data = await db.findOne({
                Member: memberMentioned.id,
                $or: [
                    { Guild: message.guildId },   // Server-specific AFK
                    { Guild: null }                // Global AFK
                ]
            });
    
            if (data) {
                message.reply({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `<@${memberMentioned.id}> went AFK <t:${Math.round(data.Time / 1000)}:R>\n\nFor Reason: **${data.Reason}**`
                            )
                    ]
                });
            } else {
                return;
            }
        }
    }
    
    

    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes'
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))
        return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`
    }

    ownerbutton() {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('DELETE')
                .setCustomId('DELETE_BUT')
                .setStyle('DANGER')
        )
        return row
    }
    async setPrefix(message, client) {
        let prefix = await this.client.db.get(`prefix_${message?.guild?.id}`)
        if (prefix === null) prefix = '&'
        message.guild.prefix = prefix
    }
    async noprefix() {
        let data = (await this.client.db.get(`noprefix_${this.client.user.id}`))
            ? await this.client.db.get(`noprefix_${this.client.user.id}`)
            : []
        this.client.noprefix = data
    }
    async blacklist() {
        let data = (await this.client.db.get(
            `blacklist_${this.client.user.id}`
        ))
            ? await this.client.db.get(`blacklist_${this.client.user.id}`)
            : []
        this.client.blacklist = data
    }

    async blacklistserver() {
        let data = (await this.client.db.get(
            `blacklistserver_${this.client.user.id}`
        ))
            ? await this.client.db.get(`blacklistserver_${this.client.user.id}`)
            : []
        this.client.blacklistserver = data
    }
    async sleep(ms) {
        return await new Promise((resolve) => setTimeout(resolve, ms))
    }

    async handleRateLimit() {
        globalCooldown = true
        await this.client.util.sleep(5000)
        globalCooldown = false
    }

    async FuckYou(
        member,
        reason = 'Not Whitelisted | Performed Suspicious Activity'
    ) {
        try {

            await member.guild.members
                .ban(member.id, {
                    reason: reason
                })
                .catch((_) => {})
        } catch (err) {
            return
        }
    }
    
    embed() {
		return new EmbedBuilder()
	}

   async BitzxierPagination(membersList, title, client, message) {
    const lodash = require('lodash');
    
    // Split members list into chunks of 10 items per page
    const pages = lodash.chunk(membersList, 10);
    let currentPage = 0;

    // Generate the embed for the current page
    const generateEmbed = () => {
        return new EmbedBuilder()
            .setTitle(title)
            .setDescription(pages[currentPage].join('\n')) // Displaying the members in chunks
            .setColor(client.color)
            .setAuthor({
                name: message.guild.name,
                iconURL: message.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
            })
            .setFooter({
                text: `Page: ${currentPage + 1}/${pages.length}`,
                iconURL: client.user.displayAvatarURL()
            });
    };

    if (pages.length === 0) {
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription('No members found')
                    .setAuthor({
                        name: message.guild.name,
                        iconURL: message.guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
                    })
                    .setFooter({
                        text: 'Page: 0',
                        iconURL: client.user.displayAvatarURL()
                    })
                    .setColor(client.color)
                    .setThumbnail(client.user.displayAvatarURL())
            ]
        });
    }

    if (pages.length === 1) {
        return message.channel.send({ embeds: [generateEmbed()] });
    }

    let buttonBack = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('1')
        .setEmoji('◀')
        .setDisabled(true);

    let buttonHome = new ButtonBuilder()
        .setEmoji('⏹')
        .setCustomId('2')
        .setStyle(ButtonStyle.Secondary);

    let buttonForward = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('3')
        .setEmoji('▶️');

    let buttonFirst = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('4')
        .setEmoji('⏮')
        .setDisabled(true);

    let buttonLast = new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('5')
        .setEmoji('⏭');

    const allButtons = [
        new ActionRowBuilder().addComponents([
            buttonFirst,
            buttonBack,
            buttonHome,
            buttonForward,
            buttonLast
        ])
    ];

    let swapmsg = await message.channel.send({
        embeds: [generateEmbed()],
        components: allButtons
    });

    const collector = swapmsg.createMessageComponentCollector({
        filter: (i) => i.isButton() && i.user.id === message.member.id,
        time: 60000
    });

    collector.on('collect', async (b) => {
        if (b.customId == '1') {
            // Previous Page
            if (currentPage !== 0) {
                currentPage--;
                if (currentPage === 0) {
                    buttonBack.setDisabled(true);
                    buttonFirst.setDisabled(true);
                }
                buttonForward.setDisabled(false);
                buttonLast.setDisabled(false);
            }
        } else if (b.customId == '2') {
            // Stop Pagination
            buttonBack.setDisabled(true);
            buttonForward.setDisabled(true);
            buttonHome.setDisabled(true);
            buttonFirst.setDisabled(true);
            buttonLast.setDisabled(true);
        } else if (b.customId == '3') {
            // Next Page
            if (currentPage < pages.length - 1) {
                currentPage++;
                if (currentPage === pages.length - 1) {
                    buttonForward.setDisabled(true);
                    buttonLast.setDisabled(true);
                }
                buttonBack.setDisabled(false);
                buttonFirst.setDisabled(false);
            }
        } else if (b.customId == '4') {
            // Go to the first page
            currentPage = 0;
            buttonBack.setDisabled(true);
            buttonFirst.setDisabled(true);
            buttonForward.setDisabled(false);
            buttonLast.setDisabled(false);
        } else if (b.customId == '5') {
            // Go to the last page
            currentPage = pages.length - 1;
            buttonForward.setDisabled(true);
            buttonLast.setDisabled(true);
            buttonBack.setDisabled(false);
            buttonFirst.setDisabled(false);
        }

        await swapmsg.edit({
            embeds: [generateEmbed()],
            components: [
                new ActionRowBuilder().addComponents([
                    buttonFirst,
                    buttonBack,
                    buttonHome,
                    buttonForward,
                    buttonLast
                ])
            ]
        });

        await b.deferUpdate();
    });

    collector.on('end', () => {
        if (swapmsg) {
            buttonBack.setDisabled(true);
            buttonForward.setDisabled(true);
            buttonHome.setDisabled(true);
            buttonLast.setDisabled(true);
            buttonFirst.setDisabled(true);
            swapmsg.edit({
                components: [
                    new ActionRowBuilder().addComponents([
                        buttonFirst,
                        buttonBack,
                        buttonHome,
                        buttonForward,
                        buttonLast
                    ])
                ]
            });
        }
    });
}
     
    async BlacklistCheck(guild) {
        try {
            let data = await this.client.db.get(`blacklistserver_${this.client.user.id}`) || [];
            if (data.includes(guild.id)) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    async CheckPremium(guild) {
        try {
            let data = await this.client.db.get(`sprem_${guild.id}`) || null;
            if (data) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    

    async sendBooster(guild, member) {
        const db = require(`${process.cwd()}/models/boost.js`)
        const data = await db.findOne({ Guild: guild.id })
        if (!data || !data.Boost) return
        try {
            let channel = guild.channels.cache.get(data.Boost)
            if (!channel) return
            let count = guild.premiumSubscriptionCount
            const embed = this.client.util.embed()
                .setColor(guild.roles.premiumSubscriberRole.color)
                .setAuthor({
                    name: `🎉🎉 NEW BOOSTER 🎉🎉`,
                    iconURL: `https://cdn.discordapp.com/emojis/1035418876470640660.gif`
                })
                .setThumbnail(member.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `**<@${member.id}> Just Boosted ${guild.name}. Thank You So Much For Boosting Our Server. We Now Have Total ${count} Boosts On Our Server!!**`
                )
                .setFooter({
                    text: `Server Boosted 🎉 `,
                    iconURL: guild.iconURL({ dynamic: true })
                })
                .setTimestamp()
            await channel.send({ embeds: [embed] })
        } catch (err) {
            return
        }
    }

    async pagination(message, description, desc = '') {
        const lodash = require('lodash')
        let previousbut = new ButtonBuilder()
            .setCustomId('queueprev')
            .setEmoji('<:ARROW1:1182736084766036059>')
            .setStyle(ButtonStyle.Success)
        let nextbut = new ButtonBuilder()
            .setCustomId('queuenext')
            .setEmoji('<:ARROW:1182735884978765957>')
            .setStyle(ButtonStyle.Success)
        let row = new ActionRowBuilder().addComponents(previousbut, nextbut)
        const pages = lodash.chunk(description, 10).map((x) => x.join(`\n`))
        let page = 0
        let msg
        if (pages.length <= 1) {
            return await message.channel.send({
                content: desc + this.client.util.codeText(pages[page])
            })
        } else {
            msg = await message.channel.send({
                content: desc + this.client.util.codeText(pages[page]),
                components: [row]
            })
        }
        const collector = message.channel.createMessageComponentCollector({
            filter: (b) => {
                if (b.user.id === message.author.id) return true
                else {
                    b.reply({
                        ephemeral: true,
                        content: `Only **${message.author.tag}** can use this button, run the command again to use the queue menu.`
                    })
                    return false
                }
            },
            time: 60000 * 5,
            idle: 30e3
        })
        collector.on('collect', async (b) => {
            if (!b.deferred) await b.deferUpdate().catch(() => {})
            if (b.message.id !== msg.id) return
            if (b.customId === 'queueprev') {
                page = page - 1 < 0 ? pages.length - 1 : --page
                return await msg
                    .edit({
                        content: desc + this.client.util.codeText(pages[page])
                    })
                    .catch((e) => {
                        return
                    })
            } else if (b.customId === 'queuenext')
                page = page + 1 >= pages.length ? 0 : ++page
            if (!msg) return
            return await msg
                .edit({
                    content: desc + this.client.util.codeText(pages[page])
                })
                .catch((e) => {
                    return
                })
        })
        collector.on('end', async () => {
            await msg.edit({ components: [] }).catch((e) => {
                return
            })
        })
    }

    codeText(text, type = 'js') {
        return `\`\`\`${type}\n${text}\`\`\``
    }

    async haste(text) {
        const req = await this.client.snek.post(
            'https://haste.ntmnathan.com/documents',
            { text }
        )
        return `https://haste.ntmnathan.com/${req.data.key}`
    }

    removeDuplicates(arr) {
        return [...new Set(arr)]
    }

    removeDuplicates2(arr) {
        return [...new Set(arr)]
    }
 async generateLatencyChart(ws_latency, database) {
        const QuickChart = require("quickchart-js"); 

        let data = await this.client.util._generateLatencyData(ws_latency, database);
        // Create and configure the chart
        const qc = new QuickChart();
        qc.setConfig(this._generateChartConfig(ws_latency, database, data));
        qc.setWidth(400);
        qc.setHeight(200);
        qc.setBackgroundColor("transparent");
    
        // Retrieve the short URL for the generated chart
        let uri = await qc.getShortUrl();
        return uri;
    }
    
    // Private method for generating latency data
    async _generateLatencyData(ws_latency, database) {
        const QuickChart = require("quickchart-js");

        // Data generation logic (like in the previous example)
        let data = [];
        for (let i = 0; i < 17; i++) {
            data.push(this.client.util._generateLatency(ws_latency, database));
        }
        data.push([ws_latency, database]);
        return data;
    }
    
    // Private method to generate a single data point
    _generateLatency(wsl, msg) {
        const QuickChart = require("quickchart-js");

        let rnd = Math.random();
        wsl = parseInt(wsl + Math.floor(rnd * (-wsl * 0.05 - wsl * 0.05)) + wsl * 0.05);
        msg = parseInt(msg + Math.floor(rnd * (-msg * 0.02 - msg * 0.02)) + msg * 0.02);
        return [wsl, msg];
    }
    
    // Private method for generating chart configuration
    _generateChartConfig(ws_latency, database, data) {
        const QuickChart = require("quickchart-js");

        return {
            type: "line",
            data: {
                labels: Array(17).fill("_"),
                datasets: [
                    {
                        label: "Message Latency",
                        yAxisID: "mws",
                        data: data.map((item) => item[0]),
                        fill: true,
                        borderColor: "#ff5500",
                        borderWidth: 1,
                        backgroundColor: QuickChart.getGradientFillHelper("vertical", ["#fc4e14", "#ffffff"]),
                    },
                    {
                        label: "Database Latency",
                        yAxisID: "database",
                        data: data.map((item) => item[1]),
                        fill: true,
                        borderColor: "#00d8ff",
                        borderWidth: 1,
                        backgroundColor: QuickChart.getGradientFillHelper("vertical", ["#24ffd3", "#ffffff"]),
                    },
                ],
            },
            options: {
                scales: {
                    yAxes: [
                        {
                            id: "database",
                            type: "linear",
                            position: "right",
                            ticks: {
                                suggestedMin: 0,
                                suggestedMax: 200,
                                callback: (value) => `${value}`,
                            },
                        },
                        {
                            id: "mws",
                            type: "linear",
                            position: "left",
                            ticks: {
                                suggestedMin: 0,
                                suggestedMax: database,
                                callback: (value) => `${value}`,
                            },
                        },
                    ],
                },
            },
        };
    }
    }
