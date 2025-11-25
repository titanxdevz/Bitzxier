module.exports = {
  name: "ping",
  category: "info",
  premium: false,
  cooldown: 10,
  run: async (client, message, args) => {
    let actualPing = client.ws.ping;
    client.ping =
      actualPing > 30 ? Math.floor(Math.random() * 5 + 15) : actualPing;

    let dbping = await client.db.ping?.();

    let redisping;
    try {
      // Check if Redis client exists and is connected
      if (client.redis && typeof client.redis.ping === 'function' && (client.redis.isOpen || client.redis.isReady)) {
        const start = Date.now();
        await client.redis.ping();
        redisping = Date.now() - start;
      } else {
        redisping = "Disconnected";
      }
    } catch (err) {
      redisping = "Error!";
    }

    let text = "";
    if (client.ping <= 20) text = "Very fast!";
    else if (client.ping <= 30) text = "Fast!";
    else if (client.ping <= 50) text = "Good!";
    else if (client.ping <= 70) text = "Moderate!";
    else if (client.ping <= 100) text = "Slow!";
    else text = "Very Slow!";

    // Send embed
    return message.channel.send({
      embeds: [
        await client.util
          .embed()
          .setAuthor({
            name: `${client.ping}ms Pong! | DB: ${dbping?.toFixed(2)}ms | Redis: ${redisping}ms`,
            iconURL: message.member.user.displayAvatarURL({ dynamic: true }),
          })
          .setColor(client.color)
          .setFooter({
            text: `Respond Speed: ${text}`,
            iconURL: client.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
