const { SlashCommandBuilder } = require("discord.js");

// Import the SlashCommandBuilder class from the discord.js library,
// which is used to define and configure slash commands for Discord bots.

module.exports = {
  // Define the slash command with its name and description
  data: new SlashCommandBuilder()
    .setName("update-badge")
    .setDescription("Resets the badge update timer."),
  // Define the execute function, which is called when the slash command is invoked
  async execute(interaction, lastBadgeUpdate) {
    // Reset the last badge update timestamp to the current time
    // This line updates the lastBadgeUpdate variable to the current timestamp,
    // effectively resetting the badge update timer.
    lastBadgeUpdate = Date.now();
    // Reply to the interaction confirming the command execution
    // This line sends a response back to the user who invoked the command,
    // confirming that the command was executed successfully.
    await interaction.reply("Badge update command executed. Timer reset.");
  },
};
