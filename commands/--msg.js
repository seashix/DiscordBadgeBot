const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

/**
 * This module exports a Discord slash command that allows editing a message in the bans channel or sending a DM.
 * The command requires the 'type' and 'text' options, and optionally 'title' for DMs.
 */

module.exports = {
  // Define the slash command with its name and description
  data: new SlashCommandBuilder()
    .setName("msg")
    .setDescription("Edit a message in the bans channel or send a DM.")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The type of message to modify (banned/dm)")
        .setRequired(true)
        .addChoices(
          { name: "banned", value: "banned" },
          { name: "dm", value: "dm" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Text or content for the action")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Title for DM embed (only required for 'dm')")
        .setRequired(false)
    ),
  /**
   * Execute the command when it's invoked.
   * @param {Interaction} interaction - The interaction that triggered this command.
   * @param {number} bansCounter - The number of bans to display in the message.
   */
  async execute(interaction, bansCounter) {
    // Get the options from the interaction
    const type = interaction.options.getString("type");
    const text = interaction.options.getString("text");
    const title = interaction.options.getString("title");

    // Check if the type is 'banned'
    if (type === "banned") {
      // Get the ID of the bans channel from the environment variables
      const bannedChannelId = process.env.CHANNEL_ID_BANS;

      try {
        // Fetch the bans channel
        const bannedChannel = await interaction.client.channels.fetch(
          bannedChannelId
        );

        // Fetch all messages in the bans channel
        const messages = await bannedChannel.messages.fetch();
        // Find the target message that contains the text "There are"
        const targetMessage = messages.find((msg) =>
          msg.content.includes("There are")
        );

        if (targetMessage) {
          // Edit the target message with the new text, replacing {bans} with the bansCounter
          await targetMessage.edit(text.replace("{bans}", bansCounter));
          // Reply to the interaction with a success message
          await interaction.reply({
            content: "Message updated successfully.",
            ephemeral: true,
          });
        } else {
          // Reply to the interaction with an error message if the target message is not found
          await interaction.reply({
            content: "Target message not found.",
            ephemeral: true,
          });
        }
      } catch (error) {
        // Log any errors that occur during the execution
        console.error("Error fetching or editing message:", error);
        // Reply to the interaction with an error message
        await interaction.reply({
          content: "An error occurred while trying to update the message.",
          ephemeral: true,
        });
      }
    } else if (type === "dm") {
      // Handle the 'dm' type case
      // Get the user who invoked the interaction
      const user = interaction.user;
      // Create a new embed with the title and description
      const embed = new EmbedBuilder().setTitle(title).setDescription(text);

      try {
        // Send a DM to the user with the embed
        await user.send({ embeds: [embed] });
        // Reply to the interaction with a success message
        await interaction.reply({
          content: "DM sent successfully.",
          ephemeral: true,
        });
      } catch (error) {
        // Log any errors that occur during the execution
        console.error("Error sending DM:", error);
        // Reply to the interaction with an error message
        await interaction.reply({
          content: "An error occurred while trying to send the DM.",
          ephemeral: true,
        });
      }
    }
  },
};
