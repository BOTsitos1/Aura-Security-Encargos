const { Client, GatewayIntentBits } = require('discord.js');

// Creamos el cliente con los intents necesarios
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.TOKEN; // tu token está en la variable de entorno

const MAX_ACTIVOS = 2;                  // máximo de usuarios activos al mismo tiempo
const TIEMPO = 30 * 60 * 1000;         // 30 minutos en milisegundos
const COOLDOWN = 10 * 60 * 1000;       // 10 minutos de cooldown

let activos = [];
let espera = [];
let cooldown = new Map();

// Evento cuando el bot se conecta
client.once('ready', () => {
  console.log('Bot encendido');
});

// Evento cuando alguien usa un comando
client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const user = interaction.user.id;

  if (interaction.commandName === "fichar") {

    if (cooldown.has(user)) {
      return interaction.reply("⏳ Estás en cooldown.");
    }

    if (activos.length < MAX_ACTIVOS) {

      activos.push(user);

      setTimeout(() => {
        finalizar(user);
      }, TIEMPO);

      interaction.reply("✅ Has empezado un encargo.");

    } else {

      espera.push(user);
      interaction.reply("🕐 Estás en la cola.");

    }

  }

});

// Función para finalizar un encargo
function finalizar(user) {

  activos = activos.filter(u => u !== user);

  cooldown.set(user, true);

  setTimeout(() => {
    cooldown.delete(user);
  }, COOLDOWN);

  if (espera.length > 0) {

    const siguiente = espera.shift();
    activos.push(siguiente);

    setTimeout(() => {
      finalizar(siguiente);
    }, TIEMPO);

  }

}

// Arranca el bot
client.login(TOKEN);
