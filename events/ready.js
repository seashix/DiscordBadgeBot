/**
 * This module exports an event listener for the 'ready' event in DiscordJS.
 * The 'ready' event is emitted when the bot is fully connected to Discord and ready to start receiving events.
 */

module.exports = {
  /**
   * The name of the event listener.
   * In this case, it's set to 'ready' to listen for the 'ready' event.
   */
  name: "ready",

  /**
   * Whether the event listener should only be executed once.
   * In this case, it's set to true to ensure the event listener is only executed when the bot is first ready.
   */
  once: true,

  /**
   * The function to be executed when the 'ready' event is emitted.
   * This function takes the client object as an argument, which represents the bot.
   */
  execute(client) {
    // Log a message indicating that the bot is online
    console.log(`✅ ${client.user.tag} is now online!`);
  },
};
