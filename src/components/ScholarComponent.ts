import TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard, Row, InlineKeyboardButton } from "node-telegram-keyboard-wrapper";
import {GetTokenPrice,GetLinksRow,GetGameLinkRow,GetSocialLinksRow,GetBackToMenuRow,GetProfitRow,GetConfigRow,GetSendProfitRow} from './CommonMarkupsComponent'

export function GetScholarMenu(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
    
    let scholarMainMenuPlainTextRow = new Row(
        new InlineKeyboardButton(`🙎${languageLibrary.ScholarMainMenu.myScholarshipButton}`, 'callback_data', "myScholarship"),
    );

    return new InlineKeyboard(GetSendProfitRow(languageLibrary),GetProfitRow(languageLibrary),scholarMainMenuPlainTextRow,GetTokenPrice(languageLibrary),GetConfigRow(languageLibrary),GetGameLinkRow(languageLibrary),GetLinksRow(languageLibrary),GetSocialLinksRow(languageLibrary)).getMarkup()
}
export function GetMyScholarshipMenu(languageLibrary:any):TelegramBot.InlineKeyboardMarkup{
    let MyScholarshipRow = new Row(
        new InlineKeyboardButton(`➖${languageLibrary.ScholarMyScholarshipMenu.deleteMyScholarshipButton}`,'callback_data','deleteScholarship')
    )
    return new InlineKeyboard(MyScholarshipRow,GetBackToMenuRow(languageLibrary)).getMarkup()
}
