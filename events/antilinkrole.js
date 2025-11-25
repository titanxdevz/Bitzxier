module.exports = async (client) => {
    client.on("guildMemberUpdate", async (oldMember, newMember) => {
        try {
            const oldRoles = oldMember.roles.cache;
            const newRoles = newMember.roles.cache;
            const antinuke = await client.db.get(`${oldMember.guild.id}_antinuke`)
            if (antinuke !== true) return
            if (newMember.id === newMember.guild.ownerId) return
            if (newMember.id === client.user.id) return
            const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
            addedRoles.forEach(role => {
                if (role.tags.guildConnections && (role.permissions.has("BanMembers") || role.permissions.has("Administrator") || role.permissions.has("KickMembers") || role.permissions.has("ManageChannels") || role.permissions.has("ManageGuild") || role.permissions.has("MentionEveryone") || role.permissions.has("ManageRoles") || role.permissions.has("ManageWebhooks") || role.permissions.has("ModerateMembers") || role.permissions.has("ManageEvents"))) {
                    role.setPermissions([], `Link Role With Dangorous Permissions Got Added To ${newMember.user.tag}`)
                }
            });
        } catch (error) {
            return;
        }
    });
};

