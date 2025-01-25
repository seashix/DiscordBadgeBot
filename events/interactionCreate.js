/**
 * Event listener for Discord's interactionCreate event.
 * This event is triggered when a user interacts with a command or other interactive component.
 */
module.exports = {
  name: "interactionCreate",
  /**
   * Execute function for the interactionCreate event.
   * This function is called when the event is triggered.
   * @param {Interaction} interaction - The interaction object.
   */
  execute(interaction) {
    // Log the received interaction command name
    console.log(
      "🚀 [interactionCreate] Interaction received:",
      interaction.commandName
    );

    // Check if the interaction is a chat input command
    // This is a type of interaction that is triggered by a user typing a command in a chat.
    if (!interaction.isChatInputCommand()) return;

    // Retrieve the command from the client's command collection
    // The client's command collection is a map of command names to command objects.
    const command = interaction.client.commands.get(interaction.commandName);

    // If the command is not found, log an error
    if (!command) {
      console.error(
        `❌ [interactionCreate] No matching command found for ${interaction.commandName}.`
      );
      return;
    }

    try {
      // Execute the command
      // This calls the execute function on the command object, passing the interaction object as an argument.
      command.execute(interaction);
    } catch (error) {
      // Log any errors that occur during command execution
      console.error(
        `❌ [interactionCreate] Error executing ${interaction.commandName}:`,
        error
      );
      // Reply to the interaction with an error message
      // This sends a message back to the user who triggered the interaction, indicating that an error occurred.
      interaction.reply({
        content: "An error occurred while executing the command.",
        ephemeral: true,
      });
    }
  },
};
