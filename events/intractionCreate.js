const { Events } = require('discord.js');

module.exports = async (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isStringSelectMenu()) {
            await client.util.selectMenuHandle(interaction);
        } else if (interaction.isChatInputCommand()) {
            await interaction.deferReply({ ephemeral: true }).catch(() => {});
            const cmd = client?.slashCommands?.get(interaction.commandName);
            if (!cmd) {
                return interaction.followUp({
                    content: 'This command has been removed from our system.'
                });
            }

            const args = [];

            for (let option of interaction.options.data) {
                if (option.type === 'SUB_COMMAND') {
                    if (option.name) args.push(option.name);
                    option.options?.forEach((x) => {
                        if (x.value) args.push(x.value);
                    });
                } else if (option.value) args.push(option.value);
            }
            interaction.member = await interaction.guild.members.fetch(interaction.user.id);

            cmd.run(client, interaction, args);
        } else if (interaction.isContextMenuCommand()) {
            await interaction.deferReply({ ephemeral: false });
            const command = client.slashCommands.get(interaction.commandName);
            if (command) command.run(client, interaction);
        }
    });
};
