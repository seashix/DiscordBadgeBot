const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

// TODO : Fix the bansCounter broken and the message ID not used for edit message and all time create new...
module.exports = {
  // Event handler for the "guildMemberAdd" event
  name: "guildMemberAdd",
  async execute(member, client) {
    // Paths for storing data and logs
    const userBanDir = "./data/bans/users"; // Directory for individual user ban files
    const bansCounterFile = "./data/bansCounter.json"; // File to store the ban counter
    const messageIdFile = "./data/messageId.json"; // File to store the ID of the message in the banned channel

    // Environment variables for the IDs of specific channels
    const logsChannelId = process.env.CHANNEL_ID_LOGS; // Channel ID for logging actions
    const bannedChannelId = process.env.CHANNEL_ID_BANS; // Channel ID for tracking banned users

    // Variables to store the ban counter and the message ID
    let bansCounter = 0;
    let messageId = null;

    // Utility function to save the message ID to the file
    function saveMessageId(id) {
      fs.writeFileSync(
        messageIdFile,
        JSON.stringify({ messageId: id }, null, 2)
      );
    }

    // Create an embed message to send to the banned user via DM
    const dmEmbed = new EmbedBuilder()
      .setTitle("Informations")
      .setDescription(
        `Sorry ${member.user.displayName} (@${member.user.tag}), we can't keep you on it for the reasons explained below. 
        This Discord server is not just a “support” server, but above all a development server for a development bot. 
        
        You will therefore be automatically banned from the server to preserve the security of the information and the tests carried out on it.
        You have been ${bansCounter} to join the server and have them this message (including you).`
      )
      .setFields({
        name: "📝 **Ads**",
        value: `Find my source code on GitHub via the following link.
        https://github.com/seashix/DiscordBadgeBot
        
        And you, too, get the developer badge while also having this type of automatic ban when needed.`,
      })
      .setColor("#3c74cf")
      .setTimestamp()
      .setFooter({
        text: `2025 © ${client.user.username}#${client.user.discriminator} by Seashix`,
      });

    try {
      // Attempt to send a direct message (DM) to the user before banning them
      try {
        await member.send({ embeds: [dmEmbed] });
        console.log(
          `✅ [guildMemberAdd] DM sent to ${member.user.tag} (${member.id}).`
        );
      } catch (dmError) {
        // Handle cases where the user has DMs disabled or another error occurs
        if (dmError.code === 50007) {
          // Error code 50007: Cannot send messages to this user
          console.warn(
            `⚠️ [guildMemberAdd] Cannot send DM to ${member.user.tag} (${member.id}). DMs are disabled.`
          );
        } else {
          console.error(
            `❌ [guildMemberAdd] Unexpected error sending DM to ${member.user.tag} (${member.id}): ${dmError.message}.`
          );
        }
      }

      // Ban the user with a specific reason
      // Docs: https://discord.js.org/#/docs/discord.js/main/class/GuildMember?scrollTo=ban
      await member.ban({
        reason:
          "✅ [guildMemberAdd] Automatically banned from the server to preserve the security of the information and the tests carried out on it.",
      });
      console.log(
        `⛔ [guildMemberAdd] User banned: ${member.user.tag} (${member.id}).`
      );

      // Read the current ban counter from the file
      if (fs.existsSync(bansCounterFile)) {
        const data = fs.readFileSync(bansCounterFile);
        bansCounter = JSON.parse(data).bans || 0;
      }

      // Increment the ban counter and save it to the file
      bansCounter++;
      fs.writeFileSync(bansCounterFile, JSON.stringify({ bans: bansCounter }));

      // Save user information in a JSON file for future reference
      const userInfo = {
        id: member.id,
        displayName: member.displayName, // Nickname or display name in the server
        username: member.user.username, // Global username
        discriminator: member.user.discriminator, // Tag (e.g., #1234)
        avatar: member.user.displayAvatarURL({ dynamic: true }), // Avatar URL
        flags: null, // User-specific flags (e.g., badges)
        joined: {
          at: member.joinedAt, // Date and time the user joined the server
          timestamp: member.joinedTimestamp, // Unix timestamp for the join date
        },
        createdAt: member.user.createdAt, // Account creation date
        bannedAt: new Date().toISOString(), // Current timestamp of the ban
      };

      // Function to translate Discord flags into readable decorations
      // Docs: https://discord.js.org/#/docs/discord.js/main/class/UserFlags
      function translateFlagToDecoration(flag) {
        const flagDecorations = {
          STAFF: "Discord Staff",
          PARTNER: "Discord Partner",
          HYPESQUAD_EVENTS: "HypeSquad Events",
          BUGHUNTER_LEVEL_1: "Bug Hunter Level 1",
          BUGHUNTER_LEVEL_2: "Bug Hunter Level 2",
          EARLY_SUPPORTER: "Early Supporter",
          VERIFIED_DEVELOPER: "Verified Bot Developer",
          CERTIFIED_MODERATOR: "Certified Moderator",
          ACTIVE_DEVELOPER: "Active Developer",
          NITRO: "Nitro Subscriber", // This is not a flag but could be inferred
        };

        return flagDecorations[flag] || flag; // Return a readable name or the raw flag
      }

      // Fetch user flags and add decorations
      if (member.user.flags) {
        const userFlags = await member.user.fetchFlags(); // Fetch user flags (async)
        userInfo.flags = userFlags.toArray(); // Convert flags to an array of names
      }

      // Save the user information to a JSON file
      const userFilePath = path.join(userBanDir, `${member.id}.json`);
      fs.writeFileSync(userFilePath, JSON.stringify(userInfo, null, 2));
      console.log(
        `📁 [guildMemberAdd] User information saved: ${userFilePath}.`
      );

      // Fetch the banned users channel
      const bannedChannel = await member.client.channels
        .fetch(bannedChannelId)
        .catch((error) => {
          console.error(
            `❌ [guildMemberAdd] Failed to fetch Banned(${bannedChannelId}) channel: ${error.message}.`
          );
          return null;
        });

      if (!bannedChannel) {
        // Abort if the channel is inaccessible
        console.error(
          `❌ [guildMemberAdd] Banned(${bannedChannelId}) channel is not accessible. Aborting message creation.`
        );
        return;
      }

      // Update or create a message in the banned channel
      let targetMessage = null;
      if (messageId) {
        // Attempt to fetch the existing message
        targetMessage = await bannedChannel.messages
          .fetch(messageId)
          .catch(() => null);
      }

      const messageContent = `There are ${bansCounter} people who have already joined the server and have been banned to preserve the security and anonymity of my development. 😍`;

      if (targetMessage) {
        // Edit the existing message
        await targetMessage.edit(messageContent);
        console.log(
          `✅ [guildMemberAdd] Updated existing message with ID: ${messageId}.`
        );
      } else {
        // Create a new message if no existing message was found
        const newMessage = await bannedChannel.send(messageContent);
        messageId = newMessage.id;
        saveMessageId(messageId);
        console.log(
          `✅ [guildMemberAdd] Created new message with ID: ${messageId}.`
        );
      }

      // Fetch the logs channel and send a success log
      const logsChannel = await member.client.channels
        .fetch(logsChannelId)
        .catch((error) => {
          console.error(
            `❌ [guildMemberAdd] Failed to fetch Logs(${logsChannelId}) channel: ${error.message}.`
          );
          return null;
        });

      if (logsChannel) {
        const successEmbed = new EmbedBuilder()
          .setTitle("Join Event Action: Success")
          .setDescription(
            `${member.user.tag} \`${member.id}\` has been successfully banned.`
          )
          .setColor("#57F287"); // Green color for success
        await logsChannel.send({ embeds: [successEmbed] });
        console.log(
          `✅ [guildMemberAdd] Log message sent to Logs(${logsChannelId}) channel.`
        );
      } else {
        console.error(
          `❌ [guildMemberAdd] Logs(${logsChannelId}) channel is not accessible. No log sent.`
        );
      }
    } catch (error) {
      // Catch any unexpected errors during the event execution
      console.error(
        `❌ [guildMemberAdd] Unexpected error during execution:`,
        error
      );
    }
  },
};
