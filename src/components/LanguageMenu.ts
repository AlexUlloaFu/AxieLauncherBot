import TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard, Row, InlineKeyboardButton } from "node-telegram-keyboard-wrapper";
import { GetBackToMenuRow } from './CommonMarkupsComponent';

const englishButton = new InlineKeyboardButton("🇬🇧English","callback_data","#english")
const spanishButton = new InlineKeyboardButton("🇪🇸Español","callback_data","#spanish")

const languageRow = new Row(
    englishButton,spanishButton
);


export const botLanguageKeyboard: TelegramBot.InlineKeyboardMarkup = new InlineKeyboard(languageRow).getMarkup()
export const botLanguageKeyboardWithBack: TelegramBot.InlineKeyboardMarkup = new InlineKeyboard(languageRow,GetBackToMenuRow(require('../../lang/English.json'))).getMarkup()