const { Worker } = require("worker_threads");
const path = require("path");
const fs = require("fs").promises;
const { WebhookClient } = require("discord.js");
const config = require(`${process.cwd()}/config.json`);
const webhook = config.ImagineWebhookURL ? new WebhookClient({ url: config.ImagineWebhookURL }) : null;

module.exports = {
    name: 'imagine',
    category: 'info',
    premium: false,
    aliases: [],
    cooldown: 8000, 
    run: async (client, message, args) => {
    try {
    
      if (!args.length) {
        return message.reply("Please provide a prompt (e.g., `&imagine a futuristic city`).");
      }
      const prompt = args.join(" ");

      // Create a visual progress bar
      function createProgressBar(percent) {
        const filledBlocks = Math.floor(percent / 10);
        const emptyBlocks = 10 - filledBlocks;
        
        // Use block characters to create a visual bar
        const filledChar = '■';
        const emptyChar = '□';
        
        return filledChar.repeat(filledBlocks) + emptyChar.repeat(emptyBlocks);
      }

      // Create images directory if it doesn't exist
      const imagesDir = path.join(__dirname, "..", "..", "images");
      await fs.mkdir(imagesDir, { recursive: true });
      
      const timestamp = Date.now();
      const uniqueFileName = `image_${message.author.id}_${timestamp}.png`;
      const imagePath = path.join(imagesDir, uniqueFileName);

      
      const generatingMessage = await message.channel.send("Generating your image, please wait... (0%)");

      
      const worker = new Worker( "./structures/ImagineWoerkers.js", {
        workerData: { prompt, imagePath, userId: message.author.id },
      });

      worker.on("message", async (result) => {
        // Handle progress updates
        if (result.progress !== undefined) {
          const progressBar = createProgressBar(result.progress);
          await generatingMessage.edit(
            `Generating your image: ${result.progress}% ${progressBar}\n${result.status || ''}`
          );
          return; // Continue processing
        }
        
        if (result.error) {
          await generatingMessage.edit(`Failed to generate image: ${result.error}`);
          await webhook.send({
            content: `Failed to generate image: ${result.error}` }); 
          return;
        }

        
        await generatingMessage.edit({
          content: `<@${message.author.id}>, here is your imagination:`,
          files: [imagePath],
        });

       
        await fs.unlink(imagePath).catch((err) => console.error("Failed to delete image:", err));
      });

      worker.on("error", (err) => {
        console.error("Worker error:", err);  
        generatingMessage.edit("An error occurred during image generation.");
        webhook.send({
          content: `An error occurred during image generation: ${err}`
        });
      });

      worker.on("exit", (code) => {
        if (code !== 0) {
          console.error(`Worker exited with code ${code}`);
        }
      });
    } catch (err) {
      console.error("Main thread error:", err);
      await message.channel.send("An unexpected error occurred.");
      webhook.send({
        content: `An unexpected error occurred: ${err}`
      });
    }
  },
};