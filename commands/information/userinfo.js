const { EmbedBuilder } = require('discord.js')
const axios = require('axios')

module.exports = {
    name: 'userinfo',
    aliases: ['ui'],
    category: 'info',
    premium: false,
    run: async (client, message, args) => {
        let user;
        if (args[0]) {
            let Id = getId(args[0]);
            if (Id)
                user = await client.users.fetch(Id).catch(err => { });
            if (!user)
                return message.channel.send({
                    embeds: [
                        client.util.embed()
                            .setColor(client.color)
                            .setDescription(
                                `${client.emoji.cross} | Please Provide Valid user ID or Mention Member.`
                            )
                    ]
                })
        } else {
            user = message.author;
        } 
        let me = await message.guild.members.fetch(user.id).catch(err => { });
        if (me) {
            let flags = '';
            let userFlags = me.user.flags.toArray();
            if (userFlags.includes('DISCORD_EMPLOYEE')) flags += `<:discord_employe:1196836404873932962>`;
            if (userFlags.includes('DISCORD_PARTNER')) flags += `<:partner:1181495977413185596>`;
            if (userFlags.includes('BUGHUNTER_LEVEL_1')) flags += `<:BUG_HUNTER_LEVEL_1:1196836887839641620>`;
            if (userFlags.includes('BUGHUNTER_LEVEL_2')) flags += `<:Bug_Hunter_level2:1196837016990646383>`;
            if (userFlags.includes('HYPESQUAD_EVENTS')) flags += `<:hypesquad_events:1196837253977231392>`;
            if (userFlags.includes('HOUSE_BRAVERY')) flags += `<:House_Bravery:1196837562921271388>`;
            if (userFlags.includes('HOUSE_BRILLIANCE')) flags += `<:House_Bravery:1196837562921271388>`;
            if (userFlags.includes('HOUSE_BALANCE')) flags += `<:House_Balance:1196837690772050031>`;
            if (userFlags.includes('EARLY_SUPPORTER')) flags += `<:early_supporter:1196837822196359218>`;
            if (userFlags.includes('TEAM_USER')) flags += `<:TeamUser:1196838073569386616>`;
            if (userFlags.includes('SYSTEM')) flags += `**Discord System**`;
            if (userFlags.includes('VERIFIED_BOT')) flags += `<:Verified_bot:1196838340335501414>`;
            if (userFlags.includes('VERIFIED_DEVELOPER')) flags += `<:early_verified_bot_developer:1196838474142187613>`;
            if (userFlags.includes('ACTIVE_DEVELOPER')) flags += `<:ActiveDeveloper:1196839109092708474>`;
            if (flags === '') flags = `${client.emoji.cross} No User Badges`;
            let keys = '';
            let f = me.permissions.toArray();
            
           if(me.user.id === message.guild.ownerId) {
               keys = 'Server Owner';
           } else if(me.user.id === '879209290664128542') {
       keys = 'Bitzxier Premium | Daddy';        
           } else if(client.config.owner.includes(me.user.id)) {
             keys = 'Bitzxier Developer';  
           } else if (f.includes('Administrator')) {
                keys = 'Server Administrator';
            } else if (f.includes('MODERATE_MEMBERS') && f.includes('KICK_MEMBERS') && f.includes('BanMembers')) {
                keys = 'Server Moderator';
            } else if (me.user.id === message.guild.ownerId) {
                keys = 'Server Owner';
            } else {
                keys = 'Server Member';
            }
            const data = await axios
                .get(`https://discord.com/api/users/${me.user.id}`, {
                    headers: {
                        Authorization: `Bot ${client.token}`
                    }
                })
                .then((d) => d.data);

            let bannerURL = null; // Initialize bannerURL variable

            if (data.banner) {
                let url = data.banner.startsWith('a_') ? '.gif?size=4096' : '.png?size=4096';
                bannerURL = `https://cdn.discordapp.com/banners/${me.user.id}/${data.banner}${url}`;
            }

            let permArray = me.permissions.toArray().sort((a, b) => a.localeCompare(b)).map(x => translatePermission(x));
            let emb = client.util.embed().setColor(client.color).setAuthor({ name: `${me.user.tag}'s Information`, iconURL: me.user.displayAvatarURL({ dynamic: true }) }).setThumbnail(me.user.displayAvatarURL({ dynamic: true })).addFields([
                {
                    name: `__General Information__`,
                    value: `**UserName** : ${me.user.username} \n **User Id** : ${me.user.id} \n **Nickname** : ${me.nickname ? me.nickname : 'None'} \n **Bot?** : ${me.user.bot ? `${client.emoji.tick}` : `${client.emoji.cross}`} \n **Discord Badges** : ${flags} \n **Account Created** : <t:${Math.round(me.user.createdTimestamp / 1000)}:R> \n **Server Joined** : <t:${Math.round(me.joinedTimestamp / 1000)}:R>`
                },
                {
                    name: `__Roles Info__`,
                    value: `**Highest Role** : ${me.roles.highest} \n **Color** : ${me.displayHexColor} \n **Roles [${me.roles.cache.size}]** : ${me.roles.cache.size < 30 ? [...me.roles.cache.values()].sort((a, b) => b.rawPosition - a.rawPosition).map(r => `<@&${r.id}>`).join(', ') : me.roles.cache.size > 30 ? trimArray(me.roles.cache) : 'NO ROLES'}`
                },
                {
                    name: `__Key Permissions__`,
                    value: `${permArray.length ? permArray.join(', ') : "No Permissions"}`
                },
                {
                    name: `__Acknowledgement__`,
                    value: `${keys}`
                }
            ])
                .setFooter({ text: `Requested By : ${message.author.tag}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            if (bannerURL)
                emb.setImage(bannerURL)
            return message.channel.send({ embeds: [emb] });
        }
        else {
            const data = await axios
                .get(`https://discord.com/api/users/${user.id}`, {
                    headers: {
                        Authorization: `Bot ${client.token}`
                    }
                })
                .then((d) => d.data);

            let bannerURL = null; // Initialize bannerURL variable

            if (data.banner) {
                let url = data.banner.startsWith('a_') ? '.gif?size=4096' : '.png?size=4096';
                bannerURL = `https://cdn.discordapp.com/banners/${user.id}/${data.banner}${url}`;
            }
            let flags = '';
            let userFlags = user.flags.toArray();
            if (userFlags.includes('DISCORD_EMPLOYEE')) flags += `<:discord_employe:1196836404873932962>`;
            if (userFlags.includes('DISCORD_PARTNER')) flags += `<:partner:1181495977413185596>`;
            if (userFlags.includes('BUGHUNTER_LEVEL_1')) flags += `<:BUG_HUNTER_LEVEL_1:1196836887839641620>`;
            if (userFlags.includes('BUGHUNTER_LEVEL_2')) flags += `<:Bug_Hunter_level2:1196837016990646383>`;
            if (userFlags.includes('HYPESQUAD_EVENTS')) flags += `<:hypesquad_events:1196837253977231392>`;
            if (userFlags.includes('HOUSE_BRAVERY')) flags += `<:House_Bravery:1196837562921271388>`;
            if (userFlags.includes('HOUSE_BRILLIANCE')) flags += `<:House_Bravery:1196837562921271388>`;
            if (userFlags.includes('HOUSE_BALANCE')) flags += `<:House_Balance:1196837690772050031>`;
            if (userFlags.includes('EARLY_SUPPORTER')) flags += `<:early_supporter:1196837822196359218>`;
            if (userFlags.includes('TEAM_USER')) flags += `<:TeamUser:1196838073569386616>`;
            if (userFlags.includes('SYSTEM')) flags += `**Discord System**`;
            if (userFlags.includes('VERIFIED_BOT')) flags += `<:Verified_bot:1196838340335501414>`;
            if (userFlags.includes('VERIFIED_DEVELOPER')) flags += `<:early_verified_bot_developer:1196838474142187613>`;
            if (userFlags.includes('ACTIVE_DEVELOPER')) flags += `<:ActiveDeveloper:1196839109092708474>`;
            if (flags === '') flags = `${client.emoji.cross} No User Badges`;

            let em = client.util.embed().setColor(client.color).setAuthor({ name: `${user.username}'s Information`, iconURL: user.displayAvatarURL({ dynamic: true }) }).addFields([
                {
                    name: `__General Information__`,
                    value: `**UserName** : ${user.username} \n **User ID** : ${user.id} \n **Bot?** : ${user.bot ? `${client.emoji.tick}` : `${client.emoji.cross}`} \n **Discord Badges** : ${flags} \n **Account Created** : <t:${Math.round(user.createdTimestamp / 1000)}:R>`
                }
            ]).setFooter({ text: `Requested By : ${message.author.tag} | User Is Not In This Guild`, iconURL: message.author.displayAvatarURL({ dynamic: true }) }).setThumbnail(user.displayAvatarURL({ dynamic: true }))
            if (bannerURL)
                em.setImage(bannerURL)
            return message.channel.send({ embeds: [em] });
        }
    }
}

function trimArray(arr, maxLen = 25) {
    if ([...arr.values()].length > maxLen) {
        const len = [...arr.values()].length - maxLen;
        arr = [...arr.values()].sort((a, b) => b?.rawPosition - a.rawPosition).slice(0, maxLen);
        arr.map(role => `<@&${role.id}>`)
        arr.push(`${len} more...`);
    }
    return arr.join(", ");
}
function translatePermission(permission) {
    switch (permission) {
        case 'CREATE_INSTANT_INVITE':
            return 'Create Instant Invite';
        case 'KICK_MEMBERS':
            return 'Kick Members';
        case 'BanMembers':
            return 'Ban Members';
        case 'Administrator':
            return 'Administrator';
        case 'MANAGE_CHANNELS':
            return 'Manage Channels';
        case 'ManageGuild':
            return 'Manage Server';
        case 'ADD_REACTIONS':
            return 'Add Reactions';
        case 'VIEW_AUDIT_LOG':
            return 'View Audit Log';
        case 'PRIORITY_SPEAKER':
            return 'Priority Speaker';
        case 'STREAM':
            return 'Stream';
        case 'VIEW_CHANNEL':
            return 'View Channel';
        case 'SEND_MESSAGES':
            return 'Send Messages';
        case 'SEND_TTS_MESSAGES':
            return 'Send TTS Messages';
        case 'MANAGE_MESSAGES':
            return 'Manage Messages';
        case 'EMBED_LINKS':
            return 'Embed Links';
        case 'ATTACH_FILES':
            return 'Attach Files';
        case 'READ_MESSAGE_HISTORY':
            return 'Read Message History';
        case 'MENTION_EVERYONE':
            return 'Mention Everyone';
        case 'USE_EXTERNAL_EMOJIS':
            return 'Use External Emojis';
        case 'CONNECT':
            return 'Connect';
        case 'SPEAK':
            return 'Speak';
        case 'MUTE_MEMBERS':
            return 'Mute Members';
        case 'DEAFEN_MEMBERS':
            return 'Deafen Members';
        case 'MOVE_MEMBERS':
            return 'Move Members';
        case 'USE_VAD':
            return 'Use Voice Activity';
        case 'CHANGE_NICKNAME':
            return 'Change Nickname';
        case 'MANAGE_NICKNAMES':
            return 'Manage Nicknames';
        case 'ManageRoles':
            return 'Manage Roles';
        case 'ManageWebhooks':
            return 'Manage Webhooks';
        case 'MANAGE_EMOJIS':
            return 'Manage Emojis';
        default:
            return permission.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    }
}

function getId(args) {
    if (args.startsWith("<@")) {
        let id = args.match(/^<@!?(\d+)>$/);
        if (!id) return null;
        return id[1];
    } else {
        return args;
    }
}