const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

/**
 * This module exports a Discord.js slash command that displays information about the bot.
 * The command is named "infos" and its description is "Displays information about the bot."
 */

module.exports = {
  /**
   * Define the slash command with its name and description.
   * The name is used to invoke the command, and the description is displayed in the Discord client.
   */
  data: new SlashCommandBuilder()
    .setName("infos")
    .setDescription("Displays information about the bot."),

  /**
   * This function is called when the slash command is executed.
   * It takes two parameters: the interaction object, which represents the command invocation,
   * and the lastBadgeUpdate timestamp, which is used to calculate the number of days since the last badge update.
   */
  async execute(interaction, lastBadgeUpdate) {
    // Get the bot's uptime in seconds
    // process.uptime() returns the number of seconds the Node.js process has been running
    const uptime = Math.floor(process.uptime());

    // Calculate the number of days since the last badge update
    // Date.now() returns the current timestamp in milliseconds
    // lastBadgeUpdate is the timestamp of the last badge update in milliseconds
    const daysSinceUpdate = Math.floor(
      (Date.now() - lastBadgeUpdate) / (1000 * 60 * 60 * 24)
    );

    // Path to the JSON file that tracks the number of bans
    const bansCounterFile = "./data/bansCounter.json";
    let bansCounter = 0;

    // Check if the bans counter file exists and read its content
    // fs.existsSync() checks if a file exists
    // fs.readFileSync() reads the content of a file
    if (fs.existsSync(bansCounterFile)) {
      const data = fs.readFileSync(bansCounterFile);
      // JSON.parse() parses a JSON string into a JavaScript object
      bansCounter = JSON.parse(data).bans;
    }

    // Create an embed message to display bot information
    // An embed is a rich message that can contain text, images, and other media
    const embed = {
      title: "Bot Information",
      description: `Here are the details about the bot:`,
      fields: [
        { name: "Uptime", value: `${uptime} seconds`, inline: true },
        { name: "Bans Counter", value: `${bansCounter} bans`, inline: true },
      ],
      // The color of the embed
      color: 0x00ff00,
    };

    // Reply to the interaction with the embed message
    // interaction.reply() sends a response to the command invocation
    await interaction.reply({ embeds: [embed] });
  },
};
