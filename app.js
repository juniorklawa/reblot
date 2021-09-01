require('dotenv').config()
const TelegramBot = require(`node-telegram-bot-api`);
const got = require('got');
const cheerio = require("cheerio");
const fs = require('fs');
const TOKEN = process.env.TOKEN;

console.log(TOKEN)
const bot = new TelegramBot(TOKEN, { polling: true });

async function removeBlurFromUrl(url) {
  try {
    const response = await got(url);

    const name = url.substring(url.lastIndexOf('/') + 1)

    const $ = cheerio.load(response.body);
    const parsedContent = $('body > main').html();


    fs.writeFile(`${name}.html`, parsedContent, function (err) {
      if (err) return console.log(err);
    });

    return name;

  } catch (err) {
    console.error(err);
  }
}

// Matches "/echo [whatever]"
bot.onText(/\/removeBlur (.+)/, async (msg, match) => {
  const fileName = await removeBlurFromUrl(match[1]);
  const chatId = msg.chat.id;

  setTimeout(() => {
    bot.sendMessage(chatId, "Feito:");
    bot.sendDocument(chatId, `${fileName}.html`);

    fs.unlink(`${fileName}.html`, function (err) {
        if (err) throw err;
        console.log('File deleted!');
    });
  }, 2000);

});

