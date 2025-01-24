const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

// Export the module with the command data and execution function
module.exports = {
  // Define the slash command with its name and description
  data: new SlashCommandBuilder()
    .setName("bans")
    .setDescription(
      "Displays the number of bans and the list of banned users."
    ),
  // The execute function is called when the slash command is invoked
  async execute(interaction) {
    // Path to the JSON file that tracks the number of bans
    const bansCounterFile = "./data/bansCounter.json";
    // Initialize the bans counter to 0
    let bansCounter = 0;
    // Check if the bans counter file exists and read its content
    if (fs.existsSync(bansCounterFile)) {
      // Read the content of the file
      const data = fs.readFileSync(bansCounterFile);
      // Parse the JSON data and extract the bans counter
      bansCounter = JSON.parse(data).bans;
    }

    // Reply to the interaction with the current number of banned users
    // The interaction.reply function is a part of the Discord.js API
    // It sends a response to the user who invoked the slash command
    await interaction.reply({
      // The content of the response
      content: `There are currently **${bansCounter}** banned users.`,
      // The flags option is used to specify the type of response
      // In this case, the response is a public message (flags: 0)
      flags: 0,
    });
  },
};
