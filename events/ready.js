const fs = require("fs");

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
    console.log(`✅ [ready] ${client.user.tag} is now online!`);

    function updatePresence() {
      const filePath = "./data/badgesCounter.json";
      let lastBadgeUpdate = Date.now();

      // Check if the badgesCounter.json file exists
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath);
        lastBadgeUpdate = JSON.parse(data).lastBadgeUpdate;
      } else {
        // Create the file with the current timestamp
        const initialData = { lastBadgeUpdate: lastBadgeUpdate };
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
      }

      const daysSinceUpdate = Math.floor(
        (Date.now() - lastBadgeUpdate) / (1000 * 60 * 60 * 24)
      );
      const timeRemaining = 30 - daysSinceUpdate;

      console.log(
        `🔄 [ready] Updating presence: ${timeRemaining} days remaining.`
      );

      client.user.setPresence({
        status: "online",
        activities: [
          { name: `/update-badge in ${timeRemaining} days max.`, type: 0 }, // Type 0 = Playing
        ],
      });
    }

    // Set the bot's presence immediately
    updatePresence();

    // Update the bot's presence every 10 minutes.
    setInterval(() => {
      updatePresence();
    }, 10 * 60 * 1000);
  },
};
