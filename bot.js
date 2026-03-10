// Importa Discord.js
const { Client, GatewayIntentBits } = require('discord.js');

// Crea el cliente con todos los intents necesarios
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,          // necesario para que el bot se conecte a servidores
    GatewayIntentBits.GuildMessages,   // necesario para leer mensajes en canales
    GatewayIntentBits.MessageContent   // necesario si manejas contenido de mensajes/interacciones
  ]
});

// Token del bot desde variables de entorno (Render)
const TOKEN = process.env.TOKEN;

// Configuración de tu bot
const MAX_ACTIVOS = 2;
const TIEMPO = 30 * 60 * 1000;
const COOLDOWN = 10 * 60 * 1000;

let activos = [];
let espera = [];
let cooldown = new Map();

// Evento ready
client.once('ready', () => {
  console.log('Bot encendido');
});

// Evento para manejar comandos slash
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

// Función para finalizar encargo y manejar cooldown
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

// Captura errores globales para verlos en logs
client.on("error", console.error);
process.on("unhandledRejection", console.error);

// Login del bot
client.login(TOKEN).catch(console.error);
