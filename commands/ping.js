// Import the SlashCommandBuilder class from the discord.js library
// This class is used to define the structure of a slash command
const { SlashCommandBuilder } = require("discord.js");

// Export the command module
module.exports = {
  // Define the slash command with its name and description
  // The name is the command that will be used to invoke the command
  // The description is a brief explanation of what the command does
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),

  // Define the execute function that will be called when the command is invoked
  // This function takes an interaction object as a parameter, which represents the command invocation
  async execute(interaction) {
    // Reply to the interaction with 'Pong!'
    // This sends a message back to the user who invoked the command
    await interaction.reply("Pong!");
  },
};
