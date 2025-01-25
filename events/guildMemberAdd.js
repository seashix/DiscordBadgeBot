const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

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
        msg.content.includes(bansCounter - 1)
      );

      let messageId; // Variable to store the message ID
      const messageContent = `There are ${bansCounter} people who have already joined the server and have been banned to preserve the security and anonymity of my development. 😍`;

      if (targetMessage) {
        // If the message exists, edit it
        messageId = targetMessage.id; // Store the ID for future reference
        await targetMessage.edit(messageContent);
      } else {
        // If the message does not exist, create a new one
        const newMessage = await bannisChannel.send(messageContent);
        messageId = newMessage.id; // Store the ID of the newly created message
      }

      // Optionally, you can save the message ID to a file or database if needed
      console.log(`Message ID: ${messageId}`);

      // Log success to the logs channel using Discord.js's TextChannel.send() method
      const logsChannel = await client.channels.fetch(logsChannelId);
      const successEmbed = new EmbedBuilder()
        .setTitle("Join Event Action: Success")
        .setDescription(
          `Discord ID \`${member.id}\` has been successfully banned.`
        )
        .setColor("GREEN");

      await logsChannel.send({ embeds: [successEmbed] });

      // Create a bans counter and user data JSON file
      const counterFilePath = "./data/bans/counter.json";
      const userDir = "./data/bans/user/";

      // Check if the counter file exists
      let bansCount = 0;
      if (fs.existsSync(counterFilePath)) {
        const data = fs.readFileSync(counterFilePath);
        bansCount = JSON.parse(data).count;
      } else {
        // Create the counter file with initial value
        fs.writeFileSync(
          counterFilePath,
          JSON.stringify({ count: bansCount }, null, 2)
        );
      }

      // Increment the ban counter
      bansCount += 1;
      fs.writeFileSync(
        counterFilePath,
        JSON.stringify({ count: bansCount }, null, 2)
      );

      // Save user data
      const userId = member.id;
      const userFilePath = path.join(userDir, `${userId}.json`);

      // User information to save
      const userInfo = {
        id: member.id,
        username: member.user.username,
        display_name: member.displayName,
        avatar: member.user.avatar,
        createdAt: member.user.createdAt,
        joinedAt: member.joinedAt,
      };

      // Ensure the user directory exists
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Save user information to their respective file
      fs.writeFileSync(userFilePath, JSON.stringify(userInfo, null, 2));

      console.log(
        `⛔ User banned: ${member.user.username}. Total bans: ${bansCount}`
      );
    } catch (error) {
      console.error("❌ Error banning member:", error);

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
