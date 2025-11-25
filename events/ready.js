const { ActivityType } = require('discord.js')
module.exports = async (client) => {
    client.on('ready', async () => {
	client.ready = true
    client.user.setPresence({
        activities: [
            {
                name: `Leaked By Titan X Dev`, 
                type: ActivityType.Listening 
            }
        ],
        status: 'online' 
    });
        client.logger.log(`Logged in to ${client.user.tag}`, 'ready')

    })
    

}
