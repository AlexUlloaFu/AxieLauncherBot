import TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard, Row, InlineKeyboardButton } from "node-telegram-keyboard-wrapper";
import {GetTokenPrice,GetFullBackToMenuRow,GetLinksRow,GetGameLinkRow,GetSocialLinksRow,GetBackToMenuRow,GetProfitRow,GetSendProfitRow,GetConfigRow} from './CommonMarkupsComponent'

export function GetScholarshipMenu(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
    let scholarshipMainMenuPlainTextRow = new Row(
        new InlineKeyboardButton(`🛠${languageLibrary.ScholarshipMainMenu.scholarshipAdmButton}`, 'callback_data', "scholarshipAdm"),
    );
    let scholarshipMainMenuPlainTextRowSecond = new Row(
        new InlineKeyboardButton(`📊${languageLibrary.ScholarshipMainMenu.profitAdmButton}`, 'callback_data', "scholarshipProfitAdm")
    )
    return new InlineKeyboard(GetSendProfitRow(languageLibrary),GetProfitRow(languageLibrary),scholarshipMainMenuPlainTextRow,scholarshipMainMenuPlainTextRowSecond,GetTokenPrice(languageLibrary),GetConfigRow(languageLibrary),GetGameLinkRow(languageLibrary),GetLinksRow(languageLibrary),GetSocialLinksRow(languageLibrary)).getMarkup()
}

export function GetScholarshipAdministrator(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
    let ListRow = new Row(
        new InlineKeyboardButton(`📋${languageLibrary.ScholarshipAdminMenu.listButton}`, 'callback_data', "list"),
        
    );
    let AddRow = new Row(
        new InlineKeyboardButton(`➕${languageLibrary.ScholarshipAdminMenu.addButton}`, 'callback_data', "add"),
    );
    let UpdateRow = new Row(
        new InlineKeyboardButton(`📝${languageLibrary.ScholarshipAdminMenu.updateButton}`, 'callback_data', "update"),
    );
    let DelRow = new Row(
        new InlineKeyboardButton(`➖${languageLibrary.ScholarshipAdminMenu.removeButton}`, 'callback_data', "delete"),
    );
    
    return new InlineKeyboard(ListRow,AddRow,UpdateRow,DelRow,GetBackToMenuRow(languageLibrary)).getMarkup()
}   

export function GetProfitAdministrator(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
    let allscholarsRow = new Row(
        new InlineKeyboardButton(`${languageLibrary.ScholarshipProfitMenu.profitByAllScholarsButton}`, 'callback_data', "allScholarsProfit"),
        
    );
    let oneScholarRow = new Row(
        new InlineKeyboardButton(`${languageLibrary.ScholarshipProfitMenu.profitByOneScholarButton}`, 'callback_data', "oneScholarsProfit"),
    );
    
    return new InlineKeyboard(allscholarsRow,oneScholarRow,GetBackToMenuRow(languageLibrary)).getMarkup()
}   

export function GetScholarsProfitSubmenu(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
   
    let allDaysRow = new Row(
        new InlineKeyboardButton(`${languageLibrary.ScholarshipProfitMenu.profitByDaysButton}`, 'callback_data', "allDays"),
    );
    let oneDayRow = new Row(
        new InlineKeyboardButton(`${languageLibrary.ScholarshipProfitMenu.profitByOneDayButton}`, 'callback_data', "oneDay"),
    );
    
    return new InlineKeyboard(allDaysRow,oneDayRow,GetBackToMenuRow(languageLibrary),GetFullBackToMenuRow(languageLibrary)).getMarkup()
}

export function GetSkipScholarNameMarkup(languageLibrary:any,nextCallback:string): TelegramBot.InlineKeyboardMarkup{
   
    let skipRow = new Row(
        new InlineKeyboardButton(`⏩${languageLibrary.ScholarshipAdministrationOfScholars.skipButton}`, 'callback_data', nextCallback),
    );
    
    return new InlineKeyboard(skipRow,GetBackToMenuRow(languageLibrary),GetFullBackToMenuRow(languageLibrary)).getMarkup()
}

export function GetEditScholarMarkup(languageLibrary:any): TelegramBot.InlineKeyboardMarkup{
   
    let updateRoninWalletRow = new Row(
        new InlineKeyboardButton(`🗂${languageLibrary.ScholarshipAdminMenu.updateScholarWalletButton}`, 'callback_data', "updateWallet"),
    );
    let updateNameRow = new Row(
        new InlineKeyboardButton(`🏷${languageLibrary.ScholarshipAdminMenu.updateScholarNameButton}`, 'callback_data', "updateName"),
    );
    let updatePercentRow = new Row(
        new InlineKeyboardButton(`⚖️${languageLibrary.ScholarshipAdminMenu.updateScholarPercentButton}`, 'callback_data', "updatePercent"),
    );

    
    return new InlineKeyboard(updateRoninWalletRow,updateNameRow,updatePercentRow,GetBackToMenuRow(languageLibrary),GetFullBackToMenuRow(languageLibrary)).getMarkup()
}