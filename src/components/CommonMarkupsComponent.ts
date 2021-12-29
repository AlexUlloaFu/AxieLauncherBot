import TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard, Row, InlineKeyboardButton } from "node-telegram-keyboard-wrapper";

export function GetLinksRow(languageLibrary:any): Row<InlineKeyboardButton<"url">>{
    return new Row(
        new InlineKeyboardButton(`🌐${languageLibrary.CommonMainMenuComponents.axieDiscord}`, "url", "https://discord.com/invite/axie/"),
        new InlineKeyboardButton(`🌐${languageLibrary.CommonMainMenuComponents.axieESDiscord}`, "url", "https://discord.gg/axiees"),
    );
}
export function GetSocialLinksRow(languageLibrary:any): Row<InlineKeyboardButton<"url">>{
    return new Row(
        new InlineKeyboardButton(`🌐${languageLibrary.CommonMainMenuComponents.axieInstagram}`, "url", "https://www.instagram.com/axieinfinity/"),
        new InlineKeyboardButton(`🌐${languageLibrary.CommonMainMenuComponents.axieTwitter}`, "url", "https://www.twitter.com/AxieInfinity/"),
    );
}
export function GetGameLinkRow(languageLibrary:any): Row<InlineKeyboardButton<"url">>{
    return new Row(
        new InlineKeyboardButton(`🌐${languageLibrary.CommonMainMenuComponents.axieWeb}`, "url", "https://www.axieinfinity.com/"),
    );
}

export function GetProfitRow(languageLibrary:any):Row<InlineKeyboardButton<"callback_data">>{
   return new Row(
        new InlineKeyboardButton(`💰${languageLibrary.CommonMainMenuComponents.calculateProfitsButton}`, 'callback_data', "personalProfit"),
        )
}
export function GetSendProfitRow(languageLibrary:any):Row<InlineKeyboardButton<"callback_data">>{
    return new Row(
         new InlineKeyboardButton(`📝${languageLibrary.ScholarMainMenu.updateSLPReportButton}`, 'callback_data', "updateSLP")
         )
 }

 export function GetTokenPrice(languageLibrary:any):Row<InlineKeyboardButton<"callback_data">>{
    return new Row(
        new InlineKeyboardButton(`📈${languageLibrary.CommonMainMenuComponents.tokenPriceButton}`, "callback_data", "getTokenPrice")
        )
 }

export function GetPersonalProfitMenu(languageLibrary:any):TelegramBot.InlineKeyboardMarkup{
    let todayProfitRow = new Row(
        new InlineKeyboardButton(`${languageLibrary.PersonalProfitMenu.todayProfit}`,"callback_data","todayProfit"),

    );
    let acumulatedProfitRow = new Row(
        new InlineKeyboardButton(`${languageLibrary.PersonalProfitMenu.acumulatedProfit}`,"callback_data","acumulatedProfit")
    );
    let totalProfitRow = new Row(
        new InlineKeyboardButton(`${languageLibrary.PersonalProfitMenu.totalProfit}`,"callback_data","totalProfit")
    );
    return new InlineKeyboard(todayProfitRow,acumulatedProfitRow,totalProfitRow,GetBackToMenuRow(languageLibrary)).getMarkup()
}

export function GetBackToMenuRow(languageLibrary:any): Row<InlineKeyboardButton<"callback_data">>{
    return new Row(new InlineKeyboardButton(`⬅️${languageLibrary.CommonMainMenuComponents.backButton}`,"callback_data","back"))
}

export function GetFullBackToMenuRow(languageLibrary:any): Row<InlineKeyboardButton<"callback_data">>{
    return new Row(new InlineKeyboardButton(`⬅️${languageLibrary.CommonMainMenuComponents.fullBackButton}`,"callback_data","fullBack"))
}

export function GetFullBackToMenuKeyboard(languageLibrary:any):TelegramBot.InlineKeyboardMarkup{

    return new InlineKeyboard(GetBackToMenuRow(languageLibrary),GetFullBackToMenuRow(languageLibrary)).getMarkup()
}


export function GetYesNoRow(languageLibrary:any): Row<InlineKeyboardButton<"callback_data">>{
    return new Row(
        new InlineKeyboardButton(`👍${languageLibrary.CommonMainMenuComponents.yes}`, "callback_data", "#yes"),
        new InlineKeyboardButton(`👎${languageLibrary.CommonMainMenuComponents.no}`, "callback_data", "#no"),
    );
}

export function GetConfigRow(languageLibrary:any): Row<InlineKeyboardButton<"callback_data">>{
    return new Row(
        new InlineKeyboardButton(`⚙️${languageLibrary.CommonMainMenuComponents.configButton}`, "callback_data", "config"),
    );
}