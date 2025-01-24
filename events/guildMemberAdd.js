const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

/**
 * Event handler for when a member joins the guild.
 * Automatically bans the member to preserve security and logs the action.
 */
module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    // Path to the JSON file that tracks the number of bans
    const bansCounterFile = "./data/bansCounter.json";
    // Channel IDs for logging and bans
    const logsChannelId = process.env.CHANNEL_ID_LOGS;
    const bannisChannelId = process.env.CHANNEL_ID_BANS;

    let bansCounter = 0;
    // Check if the bans counter file exists and read its content
    if (fs.existsSync(bansCounterFile)) {
      const data = fs.readFileSync(bansCounterFile);
      bansCounter = JSON.parse(data).bans;
    }

    /**
     * Saves the current bans counter to the JSON file.
     */
    function saveBansCounter() {
      fs.writeFileSync(bansCounterFile, JSON.stringify({ bans: bansCounter }));
    }

    try {
      // Ban the user with a specified reason using Discord.js's GuildMember.ban() method
      await member.ban({
        reason:
          "Automatically banned from the server to preserve the security of the information and the tests carried out on it.",
      });

      // Increment the bans counter and save it
      bansCounter++;
      saveBansCounter();

      // Create an embed message to send to the banned user using Discord.js's EmbedBuilder
      const embed = new EmbedBuilder()
        .setTitle("Information")
        .setDescription(
          `Sorry ${member.user.tag}, this server is only for a bot in development. You have been automatically banned to preserve security.`
        )
        .setColor("RED");

      // Send the embed message to the banned user using Discord.js's GuildMember.send() method
      await member.send({ embeds: [embed] });

      // Update the message in the "bannis" channel to reflect the current bans count
      const bannisChannel = await client.channels.fetch(bannisChannelId);
      const messages = await bannisChannel.messages.fetch();
      const targetMessage = messages.find((msg) =>
        msg.content.includes("There are")
      );

      if (targetMessage) {
        await targetMessage.edit(
          `There are ${bansCounter} people who have already joined the server and have been banned to preserve the security and anonymity of my development. 😍`
        );
      }

      // Log success to the logs channel using Discord.js's TextChannel.send() method
      const logsChannel = await client.channels.fetch(logsChannelId);
      const successEmbed = new EmbedBuilder()
        .setTitle("Join Event Action: Success")
        .setDescription(
          `Discord ID \`${member.id}\` has been successfully banned.`
        )
        .setColor("GREEN");

      await logsChannel.send({ embeds: [successEmbed] });
    } catch (error) {
      console.error("Error banning member:", error);

      // Log error to the logs channel using Discord.js's TextChannel.send() method
      const logsChannel = await client.channels.fetch(logsChannelId);
      const errorEmbed = new EmbedBuilder()
        .setTitle("Join Event Action: Error")
        .setDescription(`Error when banning user: ${error.message}`)
        .setColor("RED");

      await logsChannel.send({ embeds: [errorEmbed] });
    }
  },
};
