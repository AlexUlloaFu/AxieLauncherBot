import TelegramBot from "node-telegram-bot-api";
import endpoint from "./Const";

const bot = new TelegramBot(
  endpoint.BOT_API_TOKEN,
  { polling: true }
);

bot.on('polling_error', (error)=>{
  console.log(error);
});
bot.on('message',(msg,mtdata)=>{
  console.log(msg.chat.id + " ha escrito")
})

export default bot;
