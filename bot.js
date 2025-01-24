const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  REST,
  Routes,
} = require("discord.js");
const fs = require("fs");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});
const bansCounterFile = "./data/bansCounter.json";
const logsChannelId = process.env.CHANNEL_ID_LOGS;
const bannisChannelId = process.env.CHANNEL_ID_BANS;

let bansCounter = 0;
if (fs.existsSync(bansCounterFile)) {
  const data = fs.readFileSync(bansCounterFile);
  bansCounter = JSON.parse(data).bans;
}

function saveBansCounter() {
  fs.writeFileSync(bansCounterFile, JSON.stringify({ bans: bansCounter }));
}

let cooldownActive = false;
client.on("guildMemberAdd", async (member) => {
  try {
    await member.ban({
      reason:
        "Automatically banned from the server to preserve the security of the information and the tests carried out on it.",
    });
    bansCounter++;
    saveBansCounter();

    const embed = new EmbedBuilder()
      .setTitle("Informations")
      .setDescription(
        `Sorry ${member.user.tag}, this server is only for a bot in development. You have been automatically banned to preserve security.`
      )
      .setColor("RED");
    await member.send({ embeds: [embed] });

    const bannisChannel = await client.channels.fetch(bannisChannelId);
    await bannisChannel.messages.fetch().then((messages) => {
      const targetMessage = messages.find((msg) =>
        msg.content.includes(bansCounter - 1)
      );
      if (targetMessage) {
        targetMessage.edit(
          `There are ${bansCounter} people who have already joined the server and have been banned to preserve the security and anonymity of my development. 😍`
        );
      }
    });

    const logsChannel = await client.channels.fetch(logsChannelId);
    const logEmbed = new EmbedBuilder()
      .setTitle("Join Event Action: Success")
      .setDescription(
        `Discord ID \`${member.id}\` has been successfully banned.`
      )
      .setColor("GREEN");
    await logsChannel.send({ embeds: [logEmbed] });
  } catch (error) {
    console.error(error);
    const logsChannel = await client.channels.fetch(logsChannelId);
    const errorEmbed = new EmbedBuilder()
      .setTitle("Join Event Action: Erreur")
      .setDescription(`Error when banning user : ${error.message}`)
      .setColor("RED");
    await logsChannel.send({ embeds: [errorEmbed] });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "bans") {
    await interaction.reply({
      content: `There are currently ${bansCounter} banned.`,
      ephemeral: true,
    });
  } else if (commandName === "msg") {
    const type = interaction.options.getString("type");
    const text = interaction.options.getString("text");
    if (type === "bannis") {
      const bannisChannel = await client.channels.fetch(bannisChannelId);
      await bannisChannel.messages.fetch().then((messages) => {
        const targetMessage = messages.find((msg) =>
          msg.content.includes(bansCounter)
        );
        if (targetMessage) {
          targetMessage.edit(text.replace("{bans}", bansCounter));
        }
      });
      await interaction.reply({
        content: "Message updated in the banned channel.",
        ephemeral: true,
      });
    } else if (type === "dm") {
      const embedTitle = interaction.options.getString("title");
      const embedText = interaction.options.getString("text");
      const embed = new EmbedBuilder()
        .setTitle(embedTitle)
        .setDescription(embedText)
        .setColor("BLUE");
      await interaction.reply({
        content: "Embed updated (test only).",
        ephemeral: true,
      });
    }
  }
});

setInterval(() => {
  if (!cooldownActive) {
    client.user.setPresence({
      activities: [
        { name: `Uptime: ${Math.floor(process.uptime() / 60)} minutes` },
      ],
      status: "online",
    });
  }
}, 60000);

client.once("ready", () => {
  console.log(`${client.user.tag} is now online!`);
});

(async () => {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log("Registration of slash commands...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: [
        {
          name: "bans",
          description: "Displays the number of bans.",
        },
        {
          name: "msg",
          description: "Edit a message.",
          options: [
            {
              name: "type",
              type: 3,
              description: "Message type (bannis/dm)",
              required: true,
            },
            {
              name: "text",
              type: 3,
              description: "Text to be updated",
              required: true,
            },
          ],
        },
      ],
    });
    console.log("Successfully registered commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.login(process.env.DISCORD_TOKEN);
