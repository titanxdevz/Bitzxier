const { EmbedBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle  } = require('discord.js');
const Discord = require('discord.js');
const cooldown = new Set();

module.exports = {
  name: 'embed',
  category: 'info',
  premium: false,
  run: async (client, message, args) => {
    let prefix = message.guild.prefix || '&'
    if (!message.member.permissions.has('Administrator')) {
      return message.channel.send({
          embeds: [
              client.util.embed()
                  .setColor(client.color)
                  .setDescription(
                      `${client.emoji.cross} | You must have \`Administrator\` permissions to use this command.`
                  )
          ]
      });
  }
  if (!message.guild.members.me.permissions.has('Administrator')) { 
      return message.channel.send({
          embeds: [
              client.util.embed()
                  .setColor(client.color)
                  .setDescription(
                      `${client.emoji.cross} | I don't have \`Administrator\` permissions to execute this command.`
                  )
          ]
      })
  }

  if (!client.util.hasHigher(message.member)) {
      return message.channel.send({
          embeds: [
              client.util.embed()
                  .setColor(client.color)
                  .setDescription(
                      `${client.emoji.cross} | You must have a higher role than me to use this command.`
                  )
          ]
      })
  }
    
    if (cooldown.has(message.guild.id, message.author.id)) {
      return message.channel.send({ embeds : [client.util.embed().setColor(client.color).setDescription(`${client.emoji.cross} | You are currently in cooldown. Please try again later. abort your ongoing embed creation process to invoke embed command again \n`).setFooter({ text : 'Note :- if you delete embed message then wait till 1 hour after it your cooldown will automatically get removed from our system'})]})
  }

  cooldown.add(message.guild.id,message.author.id);
  setTimeout(() => { 
    cooldown.delete(message.guild.id, message.author.id);
  }, 3600000 )

    const titleEmbed = new ButtonBuilder()
       .setStyle(ButtonStyle.Primary)
      .setLabel('Title')
      .setCustomId('title_embed');

    const descriptionEmbed = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
      .setLabel('Description')
      .setCustomId('description_embed');

    const thumbnailEmbed = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
      .setLabel('Thumbnail')
      .setCustomId('thumbnail_embed');

    const imageEmbed = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
      .setLabel('Image')
      .setCustomId('image_embed');

    const footerTextEmbed = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
      .setLabel('Footer Text')
      .setCustomId('footer_text_embed');

    const footerIconEmbed = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
      .setLabel('Footer Icon')
      .setCustomId('footer_icon_embed');

    const colorEmbed = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
      .setLabel('Color')
      .setCustomId('color_embed');

    const authorTextEmbed = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
      .setLabel('Author Text')
      .setCustomId('author_text_embed');

    const authorIconEmbed = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
      .setLabel('Author Icon')
      .setCustomId('author_icon_embed');

    const defaultEmbed = new ButtonBuilder()
       .setStyle(ButtonStyle.Danger)
      .setLabel('Reset Embed')
      .setEmoji('<:Delete:1315192827193593897>')
      .setCustomId('default_embed');

    const abortButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Danger)
    .setLabel('Abort')
      .setEmoji('<:GH_Abort:1239206061228167229>')
      .setCustomId('abort_embed');

    const channelSend = new ButtonBuilder()
    .setStyle(ButtonStyle.Success)
    .setLabel('Channel To Send')
      .setEmoji('<:sended:1315193276189642792>')
      .setCustomId('channel_send');

    const button2 = new ActionRowBuilder().addComponents(authorTextEmbed, authorIconEmbed, titleEmbed, descriptionEmbed, thumbnailEmbed);
    const button3 = new ActionRowBuilder().addComponents(imageEmbed, footerTextEmbed, footerIconEmbed, colorEmbed, defaultEmbed);
    const button5 = new ActionRowBuilder().addComponents(channelSend,abortButton);


        const guideEmbed = client.util.embed()
          .setColor(client.color)
          .setDescription('Improve the Embed ');

        const messageComponent = await message.channel.send({ embeds: [guideEmbed], components: [button2,button3,button5 ] });

        const collector = messageComponent.createMessageComponentCollector({
          filter: (interaction) => {
            if (interaction.user.id !== message.author.id) {
               interaction.reply({ content: `This is Not Your Intraction if you want to use command invoke \`embed\` command`, ephemeral: true })
              return false;
            }
            return true;
          },
          time: 1000 * 60 * 30,
          idle: 1000 * 60 * 15,
        });
        
        collector.on('collect', async (interaction) => {
          if (interaction.isButton()) {
            if (interaction.customId === 'title_embed') {
              await interaction.reply({ content: `Embed Title Limit is 256 Character's Please Provide a Title Below 256 Character`, ephemeral: true })
              const messageCollectorFilter = msg => msg.author.id === message.author.id;
              const messageCollector = message.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              messageCollector.on('collect', async collectedMessage => {
                const titleTicket = collectedMessage.content.slice(0, 250);
                collectedMessage.delete();
                guideEmbed.setTitle(titleTicket);
                messageComponent.edit({ embeds: [guideEmbed] });
              });
            } else if (interaction.customId === 'description_embed') {
              await interaction.reply({ content: `Embed Description Limit is 4096 Character's Please Provide a Description Below 4096 Character`, ephemeral: true })
              const messageCollectorFilter = msg => msg.author.id === message.author.id;
              const messageCollector = message.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              messageCollector.on('collect', async collectedMessage => {
                const titleDescription = collectedMessage.content.slice(0, 4096);
                collectedMessage.delete();
                guideEmbed.setDescription(titleDescription);
                messageComponent.edit({ embeds: [guideEmbed] });
              });
            } else if (interaction.customId === 'color_embed') {
              await interaction.reply({ content: `Please provide a Color for Embed in hex code #000000`, ephemeral: true })
              const messageCollectorFilter = msg => msg.author.id === message.author.id;
              const messageCollector = message.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              messageCollector.on('collect', async collectedMessage => {
                const colorInput = collectedMessage.content;
                collectedMessage.delete();

                const colorRegex = /^#([0-9A-Fa-f]{6})$/;
                if (!colorRegex.test(colorInput)) {
                  return message.channel.send("Please use this format '#000000'.");
                }

                const hexColor = colorInput.toUpperCase();
                guideEmbed.setColor(hexColor);
                messageComponent.edit({ embeds: [guideEmbed] });
              });
            } else if (interaction.customId === 'author_text_embed') {
              await interaction.reply({ content: `Embed Author Limit is 256  Character's Please Provide a Author Below 256 Character`, ephemeral: true });

              const messageCollectorFilter = (msg) => msg.author.id === interaction.user.id;
              const messageCollector = interaction.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              let authorName = '';
              const authorIcon = guideEmbed.author ? guideEmbed.author.iconURL : null;

              messageCollector.on('collect', async (collectedMessage) => {
                authorName = collectedMessage.content.slice(0, 250);
                collectedMessage.delete();

                if (!guideEmbed.author) {
                  guideEmbed.setAuthor({ name: authorName, value: authorIcon, url: null });
                } else {
                  guideEmbed.setAuthor({ name: authorName, iconURL: guideEmbed.author.iconURL, url: guideEmbed.author.url });
                }

                messageComponent.edit({ embeds: [guideEmbed] });
              });
            } else if (interaction.customId === 'author_icon_embed') {
              await interaction.reply({
                content: `Please provide a valid image URL for the author icon, ending with .jpg, .jpeg, .png, or .gif. Alternatively, type 'reset' to remove the image.`,
                ephemeral: true,
              });

              const messageCollectorFilter = (msg) => msg.author.id === interaction.user.id;
              const messageCollector = interaction.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              messageCollector.on('collect', async (collectedMessage) => {
                const imageInput = collectedMessage.content;

                if (imageInput.toLowerCase() === 'reset') {
                  if (guideEmbed.author && guideEmbed.author.iconURL !== null) {
                    guideEmbed.setAuthor({ name: guideEmbed.author.name, iconURL: null, url: null });
                    await interaction.followUp({ content: 'Author icon removed successfully.', ephemeral: true });
                    messageComponent.edit({ embeds: [guideEmbed] });
                  } else {
                    await interaction.followUp({ content: 'There is no author icon to remove.', ephemeral: true });
                  }
                } else {
                  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/;
                  if (!imageRegex.test(imageInput)) {
                    return interaction.followUp({
                      content: "Invalid image URL. Please provide a valid image URL ending with .jpg, .jpeg, .png, or .gif. Alternatively, type 'reset' if you wish to remove the author icon.",
                      ephemeral: true,
                    });
                  }

                  collectedMessage.delete();

                  if (!guideEmbed.author) {
                    guideEmbed.setAuthor({ name: '', iconURL: imageInput, url: null });
                  } else {
                    guideEmbed.setAuthor({ name: guideEmbed.author.name, iconURL: imageInput, url: guideEmbed.author.url });
                  }

                  await interaction.followUp({ content: 'Success! Author icon has been added.', ephemeral: true });
                  messageComponent.edit({ embeds: [guideEmbed] });
                }
              });
            } else if (interaction.customId === 'footer_text_embed') {
              await interaction.reply({ content: `Embed Footer Limit is 256 Character's Please Provide a Footer Below 256 Character`, ephemeral: true });

              const messageCollectorFilter = (msg) => msg.author.id === interaction.user.id;
              const messageCollector = interaction.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              messageCollector.on('collect', async (collectedMessage) => {
                const footerText = collectedMessage.content.slice(0, 250);
                collectedMessage.delete();

                if (!guideEmbed.footer) {
                  guideEmbed.setFooter({ text: footerText, iconURL: null });
                } else {
                  guideEmbed.setFooter({ text: footerText, iconURL: guideEmbed.footer.iconURL });
                }

                messageComponent.edit({ embeds: [guideEmbed] });
              });
            } else if (interaction.customId === 'footer_icon_embed') {
              await interaction.reply({
                content: `Please provide a valid image URL (ending with .jpg, .jpeg, .png, or .gif) for the footer icon, or type 'reset' to remove the image.`,
                ephemeral: true,
              });

              const messageCollectorFilter = (msg) => msg.author.id === interaction.user.id;
              const messageCollector = interaction.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              messageCollector.on('collect', async (collectedMessage) => {
                const imageInput = collectedMessage.content;

                if (imageInput.toLowerCase() === 'reset') {
                  if (guideEmbed.footer && guideEmbed.footer.iconURL !== null) {
                    guideEmbed.setFooter({ text: guideEmbed.footer.text, iconURL: null });
                    await interaction.followUp({ content: 'Footer icon removed successfully.', ephemeral: true });
                    messageComponent.edit({ embeds: [guideEmbed] });
                  } else {
                    await interaction.followUp({ content: 'There is no footer icon to remove.', ephemeral: true });
                  }
                } else {
                  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/;
                  if (!imageRegex.test(imageInput)) {
                    return interaction.followUp({
                      content: "Invalid image URL. Please provide a valid image URL (ending with .jpg, .jpeg, .png, or .gif), or type 'reset' to remove the footer icon.",
                      ephemeral: true,
                    });
                  }

                  collectedMessage.delete();

                  if (!guideEmbed.footer) {
                    guideEmbed.setFooter({ text: '', iconURL: imageInput });
                  } else {
                    guideEmbed.setFooter({ text: guideEmbed.footer.text, iconURL: imageInput });
                  }

                  await interaction.followUp({ content: 'Footer icon added successfully.', ephemeral: true });
                  messageComponent.edit({ embeds: [guideEmbed] });
                }
              });
            } else if (interaction.customId === 'image_embed') {
              await interaction.reply({ content: `Please provide a valid image URL (ending with .jpg, .jpeg, .png, or .gif), or type 'reset' to remove the image.`, ephemeral: true });

              const messageCollectorFilter = msg => msg.author.id === interaction.user.id;
              const messageCollector = interaction.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              messageCollector.on('collect', async collectedMessage => {
                const imageInput = collectedMessage.content;

                if (imageInput.toLowerCase() === 'reset') {
                  if (guideEmbed.image !== null) {
                    guideEmbed.setImage(null);
                    await interaction.followUp({ content: "Image removed successfully.", ephemeral: true });
                    messageComponent.edit({ embeds: [guideEmbed] });
                  } else {
                    await interaction.followUp({ content: "There is no image to remove.", ephemeral: true });
                  }
                } else {
                  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/;
                  if (!imageRegex.test(imageInput)) {
                    return interaction.followUp({ content: "Invalid image URL. Please provide a valid image URL (ending with .jpg, .jpeg, .png, or .gif), or type 'reset' to remove the image.", ephemeral: true });
                  }

                  collectedMessage.delete();
                  guideEmbed.setImage(imageInput);
                  isImageSet = true;
                  await interaction.followUp({ content: "Image added successfully.", ephemeral: true });
                  messageComponent.edit({ embeds: [guideEmbed] });
                }
              });
            } else if (interaction.customId === 'thumbnail_embed') {
              await interaction.reply({ content: `Please provide a valid thumbnail image URL (ending with .jpg, .jpeg, .png, or .gif), or type 'reset' to remove the thumbnail.`, ephemeral: true });

              const messageCollectorFilter = msg => msg.author.id === interaction.user.id;
              const messageCollector = interaction.channel.createMessageCollector({
                filter: messageCollectorFilter,
                max: 1,
                time: 1000 * 60 * 30
              });

              messageCollector.on('collect', async collectedMessage => {
                const thumbnailInput = collectedMessage.content;

                if (thumbnailInput.toLowerCase() === 'reset') {
                  if (guideEmbed.thumbnail) {
                    guideEmbed.setThumbnail(null);
                    await interaction.followUp({ content: "Thumbnail removed successfully.", ephemeral: true });
                    messageComponent.edit({ embeds: [guideEmbed] });
                  } else {
                    await interaction.followUp({ content: "There is no thumbnail to remove.", ephemeral: true });
                  }
                } else {
                  const imageRegex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/;
                  if (!imageRegex.test(imageInput)) {
                    return interaction.followUp({ content: "Invalid Embed URL. Please provide a valid thumbnail image URL (ending with .jpg, .jpeg, .png, or .gif), or type 'reset' to remove the thumbnail.", ephemeral: true });
                  }

                  collectedMessage.delete();
                  guideEmbed.setThumbnail(thumbnailInput);
                  await interaction.followUp({ content: "Thumbnail added successfully.", ephemeral: true });
                  messageComponent.edit({ embeds: [guideEmbed] });
                }
              });
            } else if (interaction.customId === 'default_embed') {
              guideEmbed.setColor(client.color);
              guideEmbed.setTitle('');
              guideEmbed.setDescription('Improve the Embed');
              guideEmbed.setAuthor({ name: '', iconURL: null, url: null });
              guideEmbed.setFooter({ text: '', iconURL: null });
              guideEmbed.setThumbnail(null);
              guideEmbed.setImage(null);
              messageComponent.edit({ embeds: [guideEmbed], components: [button2,button3,button5 ] });
              await interaction.reply({ content: 'The embed has been successfully reset to its default state.', ephemeral: true });
            } else if (interaction.customId === 'channel_send') {
              await interaction.deferUpdate();
              await interaction.followUp({ content: 'Please provide the ID or mention of the channel where you like to submit this embed.', ephemeral: true });
            
              const channelFilter = (msg) => msg.author.id === interaction.user.id && (msg.mentions.channels.size > 0 || /^[0-9]+$/.test(msg.content));
              const channelCollector = interaction.channel.createMessageCollector({
                filter: channelFilter,
                max: 1,
                time: 1000 * 60 * 30
              });
            
              channelCollector.on('collect', async (collectedMessage) => {
                let channelId;
                const channelMention = collectedMessage.mentions.channels.first();
            
                if (channelMention) {
                  channelId = channelMention.id;
                } else {
                  const channelIdMatch = collectedMessage.content.trim().match(/[0-9]+/);
                  if (channelIdMatch) {
                    channelId = channelIdMatch[0];
                  }
                }
            
                if (!channelId || !interaction.guild.channels.cache.has(channelId)) {
                  await interaction.editReply({ content: 'Invalid channel ID or mention. Please provide a valid channel ID or mention a channel.', ephemeral: true });
                } else {
                  await collectedMessage.delete();
                  await interaction.editReply({ content: `Embed Sent to <#${channelId}>`, components: [], ephemeral: true });
            
                  const channelToSend = await interaction.guild.channels.fetch(channelId);
                  const panelMessage = await channelToSend.send({ embeds: [guideEmbed] });
                  await messageComponent.edit({ content: `Embed Sent to <#${channelToSend.id}>`, embeds: [], components: [] });
                  cooldown.delete(message.guild.id, message.author.id);
                }
              });
            } else if (interaction.customId === 'abort_embed') {
              const abortEmbed = client.util.embed()
              .setTitle('Embed Creation Aborted')
              .setColor(client.color)
              .setDescription('The embed creation process has been aborted. If you need assistance or have any questions, feel free to ask.');
          

              await interaction.update({ embeds: [abortEmbed], components: [] });
              cooldown.delete(message.guild.id, message.author.id);

            }
          }
        });
    }
  }
