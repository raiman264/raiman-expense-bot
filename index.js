require("dotenv").config();
const { BOT_TOKEN } = process.env;

if(!BOT_TOKEN) {
  console.log(process.env);
  throw new Error("BOT_TOKEN not defined");
}

const TelegramBot = require('node-telegram-bot-api');
const Expenses = require('./lib/Expenses');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const expenses = new Expenses();


bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id; 
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/^\s*(\-?\d+)\s(.+)?/, async (msg, [,amount, description]) => {
  const {chat: {id: chatId}, from: { username }} = msg;

  try{
    const total = await expenses.add({
      username,
      amount,
      description
    });
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, `new balance $${total}`);
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, `An error ocurred \`${e}\``);
  }
});

bot.on('polling_error', (error) => {
  console.error(error);  // => 'EFATAL'
});

// require('http')
//   .createServer(bot.webhookCallback('/secret-path'))
//   .listen(3000)

// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))