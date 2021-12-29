import TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard, Row, InlineKeyboardButton } from "node-telegram-keyboard-wrapper";
import {GetBackToMenuRow} from './CommonMarkupsComponent'
export function GetConfigMenuScholar(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
    let changeLang = new InlineKeyboardButton(`${languageLibrary.ConfigMenu.changeLangButton}`,"callback_data","changeLang")
    let changeUserTypeButton = new InlineKeyboardButton(`${languageLibrary.ConfigMenu.changeUserTypeButton}`,"callback_data","changeUserType")
    
    let changeLangRow = new Row(
        changeLang
    );
    let changeUserTypeRow = new Row(
        changeUserTypeButton
    )

    return new InlineKeyboard(changeLangRow,changeUserTypeRow,GetBackToMenuRow(languageLibrary)).getMarkup()
}

export function GetConfigMenuScholarship(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
    
    let changeLang = new InlineKeyboardButton(`${languageLibrary.ConfigMenu.changeLangButton}`,"callback_data","changeLang")
    let changeUserTypeButton = new InlineKeyboardButton(`${languageLibrary.ConfigMenu.changeUserTypeButton}`,"callback_data","changeUserType")
    let changeRoninWallet = new InlineKeyboardButton(`Ronin Wallet`,"callback_data","changeWallet")
    let changePaymentDay = new InlineKeyboardButton(`${languageLibrary.ConfigMenu.changePaymentDayButton}`,"callback_data","changePaymentDay")
    
    let changeLangRow = new Row(
        changeLang
    );
    let changeUserTypeRow = new Row(
        changeUserTypeButton
    )
    let changeRoninWalletRow = new Row(
        changeRoninWallet
    )
    let changePaymentDayRow = new Row(
        changePaymentDay
    )
    return new InlineKeyboard(changeLangRow,changeUserTypeRow,changeRoninWalletRow,changePaymentDayRow,GetBackToMenuRow(languageLibrary)).getMarkup()
}
