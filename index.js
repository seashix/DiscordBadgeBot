const fs = require("fs");
const path = require("path");
const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
} = require("discord.js");
require("dotenv").config();

// Check if all the necessary files and folders exist.
// If not, log an error and exit the process.
const dataDir = "./data";
const bansDir = "./data/bans";
const userBanDir = "./data/bans/users";
const bansCounterFile = "./data/bansCounter.json";
const messageIdFile = "./data/messageId.json";

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(bansDir)) fs.mkdirSync(bansDir);
if (!fs.existsSync(userBanDir)) fs.mkdirSync(userBanDir);
if (!fs.existsSync(bansCounterFile))
  fs.writeFileSync(bansCounterFile, JSON.stringify({ bans: 0 }, null, 2));
if (!fs.existsSync(messageIdFile))
  fs.writeFileSync(messageIdFile, JSON.stringify({ messageId: null }, null, 2));

// Initialize the Discord client with the necessary intents.
// Intents determine what events your bot receives from Discord.
// In this case, we're subscribing to the Guilds and GuildMembers intents.
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Create a collection to store our commands.
// A collection is a data structure that allows us to store and retrieve data efficiently.
client.commands = new Collection();

// Define the path to our commands directory.
const commandsPath = path.join(__dirname, "commands");

// Read the files in the commands directory and filter out non-JS files.
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => (!file.startsWith("--") ? file.endsWith(".js") : false));

// Create an array to store our commands in a format that can be registered with Discord.
const commands = [];

// Iterate over each command file.
for (const file of commandFiles) {
  // Construct the full path to the command file.
  const filePath = path.join(commandsPath, file);

  // Load the command file.
  const command = require(filePath);

  // Check if the command has the required properties (data and execute).
  // If not, log an error and skip this command.
  if (!command.data || !command.execute) {
    console.error(
      `⚠️ [index] Command in ${file} is missing the "data" or "execute" property.`
    );
    continue;
  }

  // Add the command to our collection and the commands array.
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON()); // Add to the commands array

  // Log a success message.
  console.log(`✅ [index] Command loaded: ${command.data.name}`);
}

// Define the path to our events directory.
const eventsPath = path.join(__dirname, "events");

// Read the files in the events directory and filter out non-JS files.
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

// Iterate over each event file.
for (const file of eventFiles) {
  // Construct the full path to the event file.
  const filePath = path.join(eventsPath, file);

  // Load the event file.
  const event = require(filePath);

  // Check if the event has the required properties (name and execute).
  // If not, log an error and skip this event.
  if (!event.name || !event.execute) {
    console.error(
      `⚠️ [index] Event in ${file} is missing the "name" or "execute" property.`
    );
    continue;
  }

  // Set up the event listener.
  // If the event is marked as once, use client.once; otherwise, use client.on.
  if (event.once) {
    console.log(`🔄 [index] Loading one-time event: ${event.name}`);
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    console.log(`🔁 [index] Loading recurring event: ${event.name}`);
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// Create a new REST client to interact with the Discord API.
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

// Register our commands with Discord using the REST client.
(async () => {
  try {
    console.log("🚀 [index] Starting command registration...");

    // Put the commands array to the Discord API.
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("✅ [index] Commands registered successfully!");
  } catch (error) {
    console.error("❌ [index] Command registration failed:", error);
  }
})();

// Catch and log any unhandled promise rejections.
process.on("unhandledRejection", (error) => {
  console.error("❌ [index] Unhandled promise rejection:", error);
});

// Log in to Discord using the token from the .env file.
client.login(process.env.DISCORD_TOKEN);
