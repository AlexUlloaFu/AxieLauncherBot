import bot from '../Bot'
import { CallbackQuery } from 'node-telegram-bot-api'
import moment from 'moment'
import {UpdateUser,GetUser,GetScholarsMarkup} from './UserController'
import {GetScholarMenu,GetMyScholarshipMenu} from '../components/ScholarComponent'
import {OnStartText,GetAndSetLanguage,SetDayofPayment,GetAndSetRonin} from './EntryMenuController'
import {GetScholarshipMenu,GetScholarshipAdministrator,GetProfitAdministrator,GetScholarsProfitSubmenu,GetSkipScholarNameMarkup,GetEditScholarMarkup} from '../components/ScholarshipComponent'
import Queue from "queue-promise";
import TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard,} from "node-telegram-keyboard-wrapper";
import {GetBackToMenuRow,GetFullBackToMenuRow,GetYesNoRow,GetPersonalProfitMenu} from '../components/CommonMarkupsComponent'
import {GetConfigMenuScholar,GetConfigMenuScholarship} from '../components/ConfigMenu'
import {SetDailyReport,DeleteScholarship,CalculateProfit,ChangeUserType,GetDailyAmountMaked, ManualSetDailyReport} from './ScholarController'
import {ListScholars,AddNewScholar,DeleteScholar, UpdateScholarPercent, FindScholarIndexByUsername, ListScholarsProfits,UpdateScholarName, UpdateScholarWallet} from './ScholarshipController'
import { IScholarRegister, IUser } from '../models/User'
import {GetDataFromAPI} from '../CoinMarketAPI'
import {convertStringToDateFormat} from '../utils/DateMethods'
import endpoint from "../Const";

const axios = require("axios")
const usersViewWorkers: any = {};
let langJSON:any
let recivedUsername:any
let recivedScholarName:any
let recivedScholarWallet:any
let recivedDate:any
let lastQueryData:any
let sucess:any
let reg = /@(ronin|:|-|0x)@gm/

export let cronJob:any



bot.onText(/^\/start/, (msg)=>{
    //verificaciones de q todo bien
    if (msg.chat.type != 'private') return;

    ShowStartSync(msg)
})

export async function ShowStartSync(msg: TelegramBot.Message): Promise<any> {
    let keyUs = msg.from.id
    if (!usersViewWorkers[keyUs])
        usersViewWorkers[keyUs] = new Queue({
            concurrent: 1,
            interval: 0
        });

    usersViewWorkers[keyUs].enqueue(() => {
        return StartProcess(msg);
    });
}

async function StartProcess(msg: TelegramBot.Message) {
    const match = msg.text.match(/\/start (-?\d+)/);
    let validReferenceLink = false
    let scholarshipID = null
    let findedScholar:IScholarRegister
    let myUser = await GetUser(msg.chat.id)

    //si entra es q el usuario entro con un link
    if(match != null){
        scholarshipID = +match[1]
        
        //validar link
        await GetUser(scholarshipID).then((scholarship)=>{
            if(myUser){
                if(myUser.userType != 'scholar')
                    scholarship = null
            }
            if(scholarship){
                
                findedScholar = scholarship.scholars.find(scholar => scholar.username === msg.chat.username)
                //ESTA EN LA LISTA DE PENDIENTES
                if(findedScholar.pending) validReferenceLink = true
            }

            if(validReferenceLink){
                OnStartText(msg,scholarship._id,findedScholar)
            }
        })
    }

    if(!validReferenceLink ){
        if(scholarshipID){
            if(!langJSON) await bot.sendMessage(msg.chat.id,"Invalid reference link. Starting bot as normal...")
            else await bot.sendMessage(msg.chat.id,langJSON.Errores.invalidRefrenceLink)
        }
        OnStartText(msg,null,null)
    }
}


bot.on("callback_query", async (query) => {
    if (query.message.chat.type != 'private') return;

    console.log(`${query.from.username}(${query.from.id}) -> ${query.data} <- query`)
    await ShowViewSync(query);
});

export async function ShowViewSync(query: TelegramBot.CallbackQuery): Promise<any> {
    let keyUs = query.from.id
    
    if (!usersViewWorkers[keyUs])
        usersViewWorkers[keyUs] = new Queue({
            concurrent: 1,
            interval: 0
        });

    usersViewWorkers[keyUs].enqueue(() => {
        return ShowView(query);
    });
}

export async function ShowView(query: TelegramBot.CallbackQuery) {
    try {
        
        if (query.data.startsWith('#')) {
            try { await bot.answerCallbackQuery(query.id) } catch { }
            return;
        }

        let user = await GetUser(query.from.id);
        if(!user) {
            try { await bot.answerCallbackQuery(query.id) } catch { }
            return
        }
        let msg = query.message;
        langJSON = require(user.language)
        let routeSplited = ['']
        let msgText:string 
        let newQuery:CallbackQuery
        let backButtonMarkup = user.route == 'main' ? new InlineKeyboard(GetBackToMenuRow(langJSON)).getMarkup() : new InlineKeyboard(GetBackToMenuRow(langJSON),GetFullBackToMenuRow(langJSON)).getMarkup()

        if(query.data == 'main' || query.data == 'scholar' || query.data == 'scholarship' || query.data == 'fullBack'){
            user.route = 'main'
            routeSplited[0] = 'main'
            lastQueryData = 'main'
        }
        else if (query.data == 'back') {
            routeSplited = user.route.split('&')
            lastQueryData = routeSplited[routeSplited.length-1]
            routeSplited.pop()
            user.route = routeSplited.join('&')
        }
        else {
            routeSplited = user.route.split('&')
            lastQueryData = routeSplited[routeSplited.length-1]
            user.route += `&${query.data}`
            routeSplited = user.route.split('&')
        }
        await UpdateUser(user)

        let currentDir = routeSplited[routeSplited.length-1]

        switch (currentDir) {
  
            case "getTokenPrice":
                let tokensData = await GetDataFromAPI()
                msgText = `${langJSON.TokenData.header}\n\n\n`
                tokensData.forEach(token => {
                    msgText += `${langJSON.TokenData.name} :\n${token.coinName} (${token.coinSymbol})\n`
                    msgText += `${langJSON.TokenData.usdPrice} :\n${token.price}\n`
                    msgText += `${langJSON.TokenData.volume_24h} :\n${token.volume_24h}\n`
                    msgText += `${langJSON.TokenData.market_cap} :\n${token.market_cap}\n`
                    msgText += '\n\n'
                });
                bot.editMessageText(msgText,{
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: backButtonMarkup
                })
                break

            case "personalProfit":
                bot.editMessageText(langJSON.PersonalProfitMenu.menuHeader,{
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup:GetPersonalProfitMenu(langJSON)
                })
                break;
            
            case "todayProfit":
                CalculateProfit(msg,user,query,0)
                break;
            
            case "acumulatedProfit":
                CalculateProfit(msg,user,query,1)

                break;
            
            case "totalProfit":
                CalculateProfit(msg,user,query,2)
                break;
            
            case "myScholarship":
                let scholarshipName:string;
                let scholarship:IUser
                let scholarshipInfo:string
                let answer:string

                if(user.scholarshipID){
                   scholarship = await GetUser(user.scholarshipID)
                   scholarshipName = '@'
                   scholarshipName += scholarship.username
                }
                scholarshipInfo = scholarshipName ? `${scholarshipName}\n ${langJSON.ScholarMyScholarshipMenu.myProfitPercent}${user.profitPercent}%\n${langJSON.ScholarMyScholarshipMenu.myPaymentDay}${scholarship.dayOfPayment}` : `${langJSON.ScholarMyScholarshipMenu.notScholarship}`
                answer = `${langJSON.ScholarMyScholarshipMenu.myScholarshipText}\n${scholarshipInfo}`
                
                bot.editMessageText(answer, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: user.scholarshipID ? GetMyScholarshipMenu(langJSON) : backButtonMarkup
                })
                break;
            
            case "deleteScholarship":
                bot.editMessageText(langJSON.ScholarMyScholarshipMenu.areYouSure, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: new InlineKeyboard(GetYesNoRow(langJSON)).getMarkup()
                })

                DeleteScholarship(msg,query,user)
                break;

            case "updateSLP":
                bot.editMessageText(langJSON.Actions.updateSLPReportText, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: backButtonMarkup
                })
                
                let dailyCant
                do{
                    dailyCant = await RequestText(query.message)
                    if (typeof dailyCant !== 'string') return;
                    if(+dailyCant){
                        if(+dailyCant > 0){
                            dailyCant = await SetDailyReport(user,dailyCant)
                        }
                    }   
                    else {
                        bot.sendMessage(msg.chat.id,langJSON.Errores.invalidTypeOfNumber)
                    }
                    if(dailyCant){
                        await backToMenuFunc(msg,user,langJSON)
                    } 
                }while(!+dailyCant)

                break;
                
            case "config":
                bot.editMessageText(langJSON.ConfigMenu.configMenuText, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: user.userType == "scholar" ? GetConfigMenuScholar(langJSON) : GetConfigMenuScholarship(langJSON)
                })
                break;
            
            case "changeLang":
                let lenguage = await GetAndSetLanguage(msg,query,false)
                user.language = lenguage
                await backToMenuFunc(msg,user,require(lenguage))
                break;

            case "changeUserType":
                let text = `${langJSON.ConfigMenu.changeUserTypeText} ${user.userType == 'scholar'?langJSON.FirstTimeEntry.role2:langJSON.FirstTimeEntry.role1}`
                bot.editMessageText(text, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: new InlineKeyboard(GetYesNoRow(langJSON),GetFullBackToMenuRow(langJSON)).getMarkup()

                })
                await ChangeUserType(msg,user,query)
                await backToMenuFunc(msg,user,langJSON)
                break;
            
            case "changeWallet":
                let returnValue = await GetAndSetRonin(msg,query,user,langJSON,false)
                if (typeof returnValue !== 'string') return;
                reg = /(ronin|:|-|0x)/gm
                user.ronin = returnValue.replace(reg,'')
                await backToMenuFunc(msg,user,langJSON)
                break
            
            case "changePaymentDay":
               user.dayOfPayment = await SetDayofPayment(msg,query,langJSON,false)
               await backToMenuFunc(msg,user,langJSON)
               break

        //#region SCHOLARSHIP SCHOLARS PROFIT

            case "scholarshipProfitAdm":
                bot.editMessageText(langJSON.ScholarshipProfitMenu.menuText, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup:GetProfitAdministrator(langJSON)
                })
                break;
            
            case 'allScholarsProfit':
                recivedUsername = null
                bot.editMessageText(langJSON.ScholarshipProfitMenu.selectLapseOfTime, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup:GetScholarsProfitSubmenu(langJSON)
                })
                break;
            
            case "oneScholarsProfit":
                bot.editMessageText(langJSON.ScholarshipProfitMenu.requestUsername, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: await GetScholarsMarkup(user)
                })

                let scholarIndex = null
                recivedUsername = (await RequestCallback(msg)).data.toString()
                recivedUsername = recivedUsername.replace('#','')
                scholarIndex = await FindScholarIndexByUsername(user,recivedUsername)
                console.log(scholarIndex)
                if(scholarIndex == -1 || scholarIndex == null) bot.editMessageText(langJSON.Errores.failedOnFindUserAsScholar,
                {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: backButtonMarkup
                })
                else{
                newQuery = query
                newQuery.data = 'selectLapseOfTime'
                ShowViewSync(newQuery)
                }
                break;

            case "selectLapseOfTime":
                bot.editMessageText(langJSON.ScholarshipProfitMenu.selectLapseOfTime, 
                    {
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        inline_message_id:query.id,
                        reply_markup:GetScholarsProfitSubmenu(langJSON)
                    })
                break

            case "oneDay":
                bot.editMessageText(langJSON.ScholarshipProfitMenu.sendDateText,
                {   
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: backButtonMarkup
                })
                //REQUEST FOR DATE
                let validDate:Boolean = false
                do{
                    recivedDate = await RequestText(query.message)
                    if (typeof recivedDate !== 'string') return;

                    validDate = moment(recivedDate,"DD-MM-YYYY").isValid()
                    if(!validDate) bot.sendMessage(msg.chat.id,langJSON.Errores.invalidDate,{reply_markup: backButtonMarkup})
                }while(!validDate)
                //SHOW STUFF
                recivedDate = convertStringToDateFormat(recivedDate)
                ListScholarsProfits(msg,user,query,recivedUsername,(new Date(recivedDate)))
                recivedDate = null

            break
            
            case "allDays":
                ListScholarsProfits(msg,user,query,recivedUsername,null)
                recivedDate = null

            break
        //#endregion       
        
        //#region SCHOLARSHIP SCHOLARS ADM

            case "scholarshipAdm":
                bot.editMessageText(langJSON.ScholarshipAdminMenu.menuText, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup:GetScholarshipAdministrator(langJSON)
                })
            break;

            case "list":
                ListScholars(msg,user,query)
                break;

            case "add":
                bot.editMessageText(langJSON.ScholarshipAdministrationOfScholars.requestNewScholarUsername, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    reply_markup: backButtonMarkup
                })
                if(!sucess) 
                sucess = null
                recivedUsername = null
                do{
                    recivedUsername = await RequestText(msg)
                    recivedUsername = recivedUsername.replace('@','')
                    sucess = true;
                }while(!sucess)

                //VALIDAR Q EL USUARIO NO EXISTA YA COMO UNO DE SUS BECADORES
                let findedUser = user.scholars.find(scholar => scholar.username == recivedUsername)
                if(findedUser){
                    if(findedUser.pending) {
                        await bot.sendMessage(msg.chat.id,langJSON.ScholarshipAdministrationOfScholars.scholarAlreadyExistsAndPending)
                        bot.sendMessage(msg.chat.id,`https://t.me/${endpoint.BOT_USERNAME}?start=${user._id}`,{reply_markup: backButtonMarkup})
                    }
                    else await bot.sendMessage(msg.chat.id,langJSON.ScholarshipAdministrationOfScholars.scholarAlreadyExists,{reply_markup: backButtonMarkup})
                    return
                }

                newQuery = query
                newQuery.data = 'setScholarWallet'
                ShowViewSync(newQuery)

            break;

            case "setScholarWallet":
                if(typeof recivedUsername != 'string')
                    bot.editMessageText(langJSON.ScholarshipAdministrationOfScholars.requestScholarWallet, {
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: backButtonMarkup
                    })
                else bot.sendMessage(msg.chat.id,langJSON.ScholarshipAdministrationOfScholars.requestScholarWallet,{reply_markup: backButtonMarkup})
                
                let apiData = null
                recivedScholarName = null
                do{
                    recivedScholarWallet = (await RequestText(msg))
                    if(typeof recivedScholarWallet != 'string') break
                    reg = /(ronin|:|-|0x)/gm
                    recivedScholarWallet = recivedScholarWallet.replace(reg,'')
                    try{
                        apiData = await axios.get("https://game-api.axie.technology/api/v1/0x" + recivedScholarWallet)
                        recivedScholarName = apiData.data.name
                    }
                    catch(e){
                        bot.sendMessage(msg.chat.id,langJSON.Errores.invalidWallet, {reply_markup: backButtonMarkup})
                    }
                }while(recivedScholarName == null)
                newQuery = query
                newQuery.data = 'setScholarPofitPercent'
                ShowViewSync(newQuery)

                break
            case "setScholarPofitPercent":
                if(typeof recivedScholarWallet != 'string')
                    bot.editMessageText(langJSON.ScholarshipAdministrationOfScholars.requestNewScholarPorcent, {
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        reply_markup: backButtonMarkup
                    })
                else bot.sendMessage(msg.chat.id,langJSON.ScholarshipAdministrationOfScholars.requestNewScholarPorcent,{reply_markup: backButtonMarkup})
                sucess = null
                let scholarPercent
                do{
                    scholarPercent = (await RequestText(msg)).toString()
                    if (typeof scholarPercent !== 'string') 
                        sucess = null;
                    
                    if(+scholarPercent){
                        if(+scholarPercent > 0)
                            sucess = true
                    } 
                    if(!sucess)
                        bot.sendMessage(msg.chat.id,langJSON.Errores.invalidTypeOfNumber)
                }while(!sucess)

                await AddNewScholar(msg,user,recivedUsername,recivedScholarWallet,recivedScholarName,+scholarPercent)
            break

            case "update":
                bot.editMessageText(langJSON.ScholarshipAdminMenu.updateText1, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: await GetScholarsMarkup(user)
                })

                recivedUsername = null
                recivedUsername = (await RequestCallback(msg)).data.toString()
                recivedUsername = recivedUsername.replace('#','')
                
                let toUpdateScholarIndex
                toUpdateScholarIndex = await FindScholarIndexByUsername(user,recivedUsername)
                if(toUpdateScholarIndex == -1){
                    bot.editMessageText(langJSON.Errores.failedOnFindUserAsScholar,{
                        chat_id: msg.chat.id,
                        message_id: msg.message_id,
                        inline_message_id:query.id,
                        reply_markup: backButtonMarkup
                    })
                    break
                }
 
                newQuery = query
                newQuery.data = 'updateScholar'
                ShowViewSync(newQuery)

                break
            
            case "updateScholar":
                bot.editMessageText(langJSON.ScholarshipAdminMenu.updateText2, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: GetEditScholarMarkup(langJSON)
                })
                break;
            
            case "updateWallet":
                bot.editMessageText(langJSON.ScholarshipAdminMenu.updateScholarWallet,{
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: backButtonMarkup
                })
                await UpdateScholarWallet(msg,query,user,await FindScholarIndexByUsername(user,recivedUsername))

                break
            
            case "updateName":
                bot.editMessageText(langJSON.ScholarshipAdminMenu.updateScholarName,{
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: backButtonMarkup
                })
                await UpdateScholarName(msg,query,user,await FindScholarIndexByUsername(user,recivedUsername))
                
                break

            case "updatePercent":
                bot.editMessageText(langJSON.ScholarshipAdminMenu.updateScholarPercent,{
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: backButtonMarkup
                })
                await UpdateScholarPercent(msg,query,user,await FindScholarIndexByUsername(user,recivedUsername))
                break

            case "delete":
                bot.editMessageText(langJSON.ScholarshipAdminMenu.removeScholarText, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: await GetScholarsMarkup(user)
                })

                recivedUsername = (await RequestCallback(msg)).data.toString()
                recivedUsername = recivedUsername.replace('#','')

                await DeleteScholar(msg,query,user,recivedUsername)
            break

        //#endregion
        
            case "main":
                bot.editMessageText(langJSON.CommonMainMenuComponents.mainMenuText, {
                    chat_id: msg.chat.id,
                    message_id: msg.message_id,
                    inline_message_id:query.id,
                    reply_markup: user.userType == "scholar" ? GetScholarMenu(langJSON) : GetScholarshipMenu(langJSON)
                })
                break
                
            default:
                break;
        
        }
        
        await UpdateUser(user)
        //await UpdateUser(user)
        try { await bot.answerCallbackQuery(query.id) } catch { }

    } catch (error) {
        console.log(`Error in ShowView ${query.from.username}(${query.from.id}): ${error.message}`)
        //await bot.sendMessage(query.from.id, `!Opps😟 parece que ha habido un problema en ShowView, su causa es: <b>${error.message}</b>.`, { parse_mode: 'HTML' })
    }
}

export const RequestText = async (msg: TelegramBot.Message) => {
    
    return new Promise<string | TelegramBot.CallbackQuery>(async (resolve, reject) => {
        var listener = async (msg_query: TelegramBot.Message) => {
            if (msg_query.chat.id != msg.chat.id) return;
            bot.removeListener('text', listener);
            if (!msg_query.text.startsWith('/'))
                resolve(msg_query.text);
            else
                reject();
        }
        var listenerCallback = async (query: TelegramBot.CallbackQuery) => {
            if (query.from.id != msg.chat.id) return;
            bot.removeListener('text', listener);
            bot.removeListener('callback_query', listenerCallback);
            if (query.data == 'back' || query.data == 'main')
                reject();
            else
                resolve(query);
        }

        bot.on('text', listener);
        bot.on('callback_query', listenerCallback);
    })
}

export const RequestCallback = async (msg: TelegramBot.Message) => {
    return new Promise<TelegramBot.CallbackQuery>(async (resolve, reject) => {
        var listenerCallback = async (query: TelegramBot.CallbackQuery) => {
            if (query.from.id != msg.chat.id) return;
            bot.removeListener('callback_query', listenerCallback);
            if (query.data.startsWith('#')){
                resolve(query);
            }
            else
                reject();
        }
        var listenerText = async (msg_query: TelegramBot.Message) => {
            if (msg_query.chat.id != msg.chat.id) return;
            if (msg_query.text.startsWith('/')) {
                bot.removeListener('text', listenerText);
                bot.removeListener('callback_query', listenerCallback);
                reject();
            }
        }

        bot.on('text', listenerText);
        bot.on('callback_query', listenerCallback);
    })
}

function backToMenuFunc(msg:TelegramBot.Message,user:IUser,langJSON:any){
    
    bot.sendMessage(msg.chat.id,langJSON.CommonMainMenuComponents.mainMenuText,{
        reply_markup: user.userType == "scholar" ? GetScholarMenu(langJSON) : GetScholarshipMenu(langJSON)
    })
    bot.deleteMessage(msg.chat.id,msg.message_id.toString())
    user.route = 'main'
}