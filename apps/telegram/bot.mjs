const token = process.env.TELEGRAM_BOT_TOKEN;
const miniAppUrl = process.env.TELEGRAM_APP_URL;

if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN is required in apps/telegram/.env");
}

if (!miniAppUrl) {
  throw new Error("TELEGRAM_APP_URL is required in apps/telegram/.env");
}

const apiBase = `https://api.telegram.org/bot${token}`;
let offset = 0;

async function callTelegram(method, body) {
  const response = await fetch(`${apiBase}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!payload.ok) {
    throw new Error(`Telegram API error on ${method}: ${payload.description}`);
  }

  return payload.result;
}

async function sendLaunchMessage(chatId) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text: [
      "MTBank Pet Game готов.",
      "Открывай Mini App, проходи лабиринты и делись challenge-ссылками.",
    ].join("\n"),
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open Mini App",
            web_app: {
              url: miniAppUrl,
            },
          },
        ],
      ],
    },
  });
}

async function setupBot() {
  await callTelegram("setMyCommands", {
    commands: [
      { command: "start", description: "Open MTBank Pet Game mini app" },
      { command: "play", description: "Get the mini app launch button again" },
    ],
  });
}

async function handleUpdate(update) {
  const message = update.message;

  if (!message?.text || !message.chat?.id) {
    return;
  }

  if (message.text.startsWith("/start") || message.text.startsWith("/play")) {
    await sendLaunchMessage(message.chat.id);
  }
}

async function poll() {
  const updates = await callTelegram("getUpdates", {
    offset,
    timeout: 25,
    allowed_updates: ["message"],
  });

  for (const update of updates) {
    offset = update.update_id + 1;
    await handleUpdate(update);
  }
}

await setupBot();
console.log(`Telegram bot polling started for ${miniAppUrl}`);

for (;;) {
  try {
    await poll();
  } catch (error) {
    console.error(error);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}
