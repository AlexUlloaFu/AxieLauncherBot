import bot from '../Bot'
import {botLanguageKeyboard,botLanguageKeyboardWithBack} from '../components/LanguageMenu'
import {GetUser,UpdateUser} from './UserController'
import {RequestText,RequestCallback} from './BotMainController'
import TelegramBot, { CallbackQuery, InlineKeyboardMarkup } from 'node-telegram-bot-api'
import {CreateUser,RegisterUser} from './UserController'
import {GetLanguages} from '../components/BotEntryMenu'
import {GetScholarMenu} from '../components/ScholarComponent'
import {GetScholarshipMenu} from '../components/ScholarshipComponent'
import {GetYesNoRow,GetFullBackToMenuKeyboard} from '../components/CommonMarkupsComponent'
import { IScholarRegister, IUser } from '../models/User'
import { InlineKeyboard } from "node-telegram-keyboard-wrapper";

let lastMessageSendByBot:TelegramBot.Message
let lastCallbackQuery:TelegramBot.CallbackQuery
let firstName:string
let myProfitPercent:number;
let myPaymentDay:number;
let myScholarshipID:number;


function Init(){
    lastMessageSendByBot = null
    lastCallbackQuery = null
    myProfitPercent = null
    myPaymentDay = null
    myScholarshipID = null
}

export async function OnStartText(msg:TelegramBot.Message,scholarshipID:number,scholarDataInScholarship:IScholarRegister){
    let langURL;
    let langJSON:any;
    let replyMarkup:InlineKeyboardMarkup
    let selectedUserType
    let user = await GetUser(msg.chat.id)
    Init()
    firstName = msg.from.first_name;

    //CREAR NUEVO USUARIO
    if(user == null){
        langURL = await GetAndSetLanguage(msg,null,true)
        langJSON = require(langURL)
        replyMarkup = GetScholarMenu(langJSON)

        if(scholarDataInScholarship){
            selectedUserType = 'scholar'
            await ActivateScholar(msg,scholarshipID,scholarDataInScholarship,langJSON) 
        }
        else {
            bot.editMessageText(`${langJSON.FirstTimeEntry.welcomeTxt}`,{
                chat_id: lastMessageSendByBot.chat.id,
                message_id: lastMessageSendByBot.message_id,
                inline_message_id:lastCallbackQuery.inline_message_id,
                reply_markup: GetLanguages(langJSON)
                }
            )
        
            let userTypeSelected = await RequestCallback(msg)
                    
            if(userTypeSelected.data == '#scholar'){
                selectedUserType = "scholar"
            }
            else if(userTypeSelected.data == `#scholarship`){
                selectedUserType = "scholarship"
                replyMarkup = GetScholarshipMenu(langJSON)
            }
        }
        
      
        user = await CreateUser(msg)
        
        user.language = langURL
        user.userType = selectedUserType
        if(myProfitPercent)
            user.profitPercent = myProfitPercent
        if(scholarshipID)
            user.scholarshipID = scholarshipID
        if(myPaymentDay)
            user.dayOfPayment = myPaymentDay
        if(user.userType == 'scholarship'){
            let returnValue = await GetAndSetRonin(lastMessageSendByBot,lastCallbackQuery,user,langJSON,true)
            if(typeof returnValue == 'string') {
                user.ronin = returnValue
            }
            user.dayOfPayment = await SetDayofPayment(lastMessageSendByBot,lastCallbackQuery,langJSON,true)
        }
    
        RegisterUser(user)
        .then(() =>{
            user.userType === 'scholar'
                ? bot.editMessageText(langJSON.ScholarMainMenu.scholarWelcomeTxt + firstName,{
                    chat_id: lastMessageSendByBot.chat.id,
                    message_id: lastMessageSendByBot.message_id,
                    inline_message_id:lastCallbackQuery.inline_message_id,
                    reply_markup: replyMarkup
                    })
                : bot.sendMessage(msg.chat.id,langJSON.ScholarshipMainMenu.scholarshipWelcomeTxt +  firstName,{
                    reply_markup: replyMarkup
                })
        })
        return
    }
    //EL USUARIO YA ESTA REGISTRADO
    else {
        langJSON = require(user.language)

        if(scholarDataInScholarship){
            //Set new Scholarship
            if(user.scholarshipID == null){
                await ActivateScholar(msg,scholarshipID,scholarDataInScholarship,langJSON)
                if(myProfitPercent)
                    user.profitPercent = myProfitPercent
                if(myScholarshipID)
                    user.scholarshipID = scholarshipID
                if(myPaymentDay)
                    user.dayOfPayment = myPaymentDay
            }
            //ERROR --- Arleady have a Scholarship
            else {
                await bot.sendMessage(msg.chat.id, langJSON.Errores.alreadyHaveAScholarship)
            }
        }
        user.route = 'main'
        UpdateUser(user)
        user.userType === 'scholar'
        ? bot.sendMessage(msg.chat.id, langJSON.ScholarMainMenu.scholarWelcomeTxt + firstName,{reply_markup: GetScholarMenu(langJSON)})
        : bot.sendMessage(msg.chat.id, langJSON.ScholarshipMainMenu.scholarshipWelcomeTxt + firstName,{reply_markup: GetScholarshipMenu(langJSON)})
    }
}

async function ActivateScholar(msg:TelegramBot.Message,recivedScholarshipID:number,scholarDataInScholarship:IScholarRegister,langJSON:any){
    
    let messageToDelete
    let secondmessageToDelete
    let answer
    let scholarship = await (await GetUser(recivedScholarshipID))
    let scholarshipUsername = scholarship.username
    messageToDelete = await bot.sendMessage(msg.chat.id, langJSON.EntryMenu.succesfullyVinculatedScholarshipPt1 +'@'+ scholarshipUsername)
    secondmessageToDelete = await  bot.sendMessage(msg.chat.id, langJSON.EntryMenu.succesfullyVinculatedScholarshipPt2,{reply_markup: new InlineKeyboard(GetYesNoRow(langJSON)).getMarkup()})
    
    answer = await YesNoQueryHandler(msg)
    if(answer == 'yes'){
        myProfitPercent = scholarDataInScholarship.percent
        myScholarshipID = recivedScholarshipID
        myPaymentDay = scholarship.dayOfPayment
        let index = scholarship.scholars.indexOf( scholarship.scholars.find(scholar => scholar.username == msg.from.username))
        console.log(index)
        scholarship.scholars[index].pending = false
        scholarship.scholars[index]._id = msg.from.id
        console.log(msg.from.id)
        await UpdateUser(scholarship)
    }
    else if(answer == 'no'){

    }
    bot.deleteMessage(msg.chat.id,messageToDelete.message_id.toString()) 
    bot.deleteMessage(msg.chat.id,secondmessageToDelete.message_id.toString())
}


export async function GetAndSetLanguage(msg:TelegramBot.Message,query:CallbackQuery,isRegistering:boolean){
    
    //SELECT LANGUAGE
    if(isRegistering)
        lastMessageSendByBot = await bot.sendMessage(msg.chat.id,"Please select bot language",{reply_markup: botLanguageKeyboard})
    else await bot.editMessageText("Please select bot language",{
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        inline_message_id:query.id,
        reply_markup: botLanguageKeyboardWithBack})

    let languageSelected = (await RequestCallback(msg))
    lastCallbackQuery = languageSelected
    
    let langData

    if(languageSelected.data == "#english"){
        langData = '../../lang/English.json'
    }
    else if(languageSelected.data == "#spanish")
        langData = '../../lang/Spanish.json'

    return langData
    
}

export async function GetAndSetRonin(msg:TelegramBot.Message,query:CallbackQuery,user:IUser,langJSON:any,isRegistering:boolean){
    if(isRegistering){
        await bot.editMessageText(`🧐${langJSON.Actions.setRoninWallet}`,{
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            inline_message_id:query.id})
    }
    else{
        await bot.editMessageText(`${langJSON.ConfigMenu.changeWalletText}🔹${user.ronin ? user.ronin : langJSON.ConfigMenu.changeWalletNoWalletText}\n${langJSON.ConfigMenu.changeWalletText2}🔸${langJSON.Actions.setRoninWallet}`,{
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            inline_message_id:query.id,
            reply_markup: GetFullBackToMenuKeyboard(langJSON)})
    }
    let returnValue ;
    returnValue = await RequestText(msg)

    return returnValue
}

export async function SetDayofPayment(msg:TelegramBot.Message,query:CallbackQuery,langJSON:any,isRegistering:boolean){
    
    await bot.sendMessage(msg.chat.id,langJSON.FirstTimeEntry.selectPaymentDay,{
        reply_markup: isRegistering ? null : GetFullBackToMenuKeyboard(langJSON)
    })
    let returnValue ;
    do{
        let dailyCant = await RequestText(msg)
        if (typeof dailyCant !== 'string') return;
        if(+dailyCant) {
            if(+dailyCant <= 30 && +dailyCant > 0)
                returnValue = +dailyCant
            else bot.sendMessage(msg.chat.id,langJSON.Errores.errorSelectingPaymentDay)
        }
        else 
            bot.sendMessage(msg.chat.id,langJSON.Errores.errorSelectingPaymentDay)

    }while(returnValue ==  null)

    return returnValue
}

export async function YesNoQueryHandler(msg:TelegramBot.Message){
    let answer
    answer = await (await RequestCallback(msg))
    if(answer.data == '#yes') return 'yes'
    else if (answer.data == '#no') return 'no'
}
