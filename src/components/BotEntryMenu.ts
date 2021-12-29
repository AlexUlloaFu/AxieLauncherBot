import TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard, Row, InlineKeyboardButton } from "node-telegram-keyboard-wrapper";

export function GetLanguages(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
    let scholarButton = new InlineKeyboardButton(`${languageLibrary.FirstTimeEntry.role1}`,"callback_data","#scholar")
    let scholarshipButton = new InlineKeyboardButton(`${languageLibrary.FirstTimeEntry.role2}`,"callback_data","#scholarship")
    
    let botEntryPlainTextRow = new Row(
        scholarButton,scholarshipButton
    );
    
    return new InlineKeyboard(botEntryPlainTextRow).getMarkup()
}
