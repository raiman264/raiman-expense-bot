require("dotenv").config();
const { BOT_TOKEN, DEBUG_ON } = process.env;

if(!BOT_TOKEN) {
  console.log(process.env);
  throw new Error("BOT_TOKEN not defined");
}

const TelegramBot = require('node-telegram-bot-api');
const Expenses = require('./lib/Expenses');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

const expenses = new Expenses();

bot.setMyCommands([
  {
    command: 'createlist',
    description: 'Create a new expenses list'
  },
  {
    command: 'lists',
    description: 'Show all your expenses lists'
  },
  {
    command: 'ping',
    description: 'Proof of life test'
  }
])

bot.onText(/\/ping/, ({chat: {id: chatId}}) => {
  bot.sendMessage(chatId, 'pong');
});

bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, resp);
});

bot.onText(/\/(start|info)/, (msg) => {
  const { chat: { id: chatId }, from } = msg;
  bot.sendMessage(chatId, `Welcome ${from.first_name}(${from.id})`);
});

bot.onText(/\/createlist/i, async (msg) => {
  let timeoutId;
  const { message_id, chat: { id: chatId }, from } = msg;
  const question = await bot.sendMessage(
    chatId,
    'what is the name of your new list?',
    {
      reply_to_message_id: message_id,
      reply_markup:
        {
          force_reply: true,
          input_field_placeholder: 'ex: savings'
        }
    }
  );


  const replyId = bot.onReplyToMessage(chatId, question.message_id, (msg) => {
    expenses.createList(msg.from.id, msg.text);
    bot.sendMessage(
      msg.chat.id,
      `List \`${msg.text}\` created`,
      {
        reply_to_message_id: msg.message_id,
        parse_mode: 'MarkdownV2'
      }
    )
    clearTimeout(timeoutId)
  });

  timeoutId = setTimeout(() => {
    bot.removeReplyListener(replyId)
  }, 3600);
});

bot.onText(/\/lists/i, async (msg) => {
  const { message_id, chat: { id: chatId }, from } = msg;
  const lists = await expenses.getLists(from.id);
  let responseText = !lists.length ? "You have no expenses lists yet" : '';

  lists.forEach((list) => {
    responseText += `${list.name} ${list.is_default_list ? '\u2713' : ''}\n`;
  })

  bot.sendMessage(
    chatId,
    responseText,
  );


  const replyId = bot.onReplyToMessage(chatId, question.message_id, (msg) => {
    expenses.createList(msg.from.id, msg.text);
    bot.sendMessage(
      msg.chat.id,
      `List \`${msg.text}\` created`,
      {
        reply_to_message_id: msg.message_id,
        parse_mode: 'MarkdownV2'
      }
    )
    clearTimeout(timeoutId)
  });

  timeoutId = setTimeout(() => {
    bot.removeReplyListener(replyId)
  }, 3600);
});

bot.onText(/^\s*([^\$\-\d]+\s)?\$?\s*(\-?[\d\,]+\.?\d*)\s(.+)/, async (msg, [,list, amount, description]) => {
  const {chat: {id: chatId}, from, from: { id }} = msg;


  try{
    const list_id = await expenses.getList(from, list);

    if(!list_id) {
      return bot.sendMessage(chatId, `list *${list}* not found`, {parse_mode: 'MarkdownV2'});
    }

    const total = await expenses.add({
      list_id,
      amount: (+amount.replace(/[$,]/g, '')).toFixed(2),
      description
    });
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, `new balance $${total}`);
  } catch (e) {
    console.error(e);
    bot.sendMessage(chatId, `An error ocurred \`${e}\``);
  }
});

if(DEBUG_ON) {
  bot.on('message', (message) => {
    console.log('onmessage', message);
  })

  bot.on('edited_message', (message) => {
    console.log(message);
  })
}

bot.on('polling_error', (error) => {
  console.error(error);  // => 'EFATAL'
});

// require('http')
//   .createServer(bot.webhookCallback('/secret-path'))
//   .listen(3000)

// process.once('SIGINT', () => bot.stop('SIGINT'))
// process.once('SIGTERM', () => bot.stop('SIGTERM'))