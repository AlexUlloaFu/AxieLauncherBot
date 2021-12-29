import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api'
import {GetUser} from './UserController'
import tokenMakedModel,{ITokenMaked}  from '../models/TokenMaked'
import { IUser } from '../models/User'
import { RequestCallback} from './BotMainController'
import bot from '../Bot'
import { GetScholarMenu } from '../components/ScholarComponent'
import { GetScholarshipMenu } from '../components/ScholarshipComponent'
import { UpdateUser } from './UserController'
import {GetDayOfPaymentDate} from '../utils/DateMethods'
import { GetFullBackToMenuKeyboard} from '../components/CommonMarkupsComponent'
import { SetDayofPayment, YesNoQueryHandler } from './EntryMenuController'

enum timeLapses{
    'oneDay',
    'oneMonth',
    'total'
}
const axios = require("axios")

export async function GetDailyAmountMaked(user:IUser){
    let apiData
    let monto
    let ronin

    if(user.userType == 'scholar'){
        if(!user.scholarshipID) return
        let userScholarship = await GetUser(user.scholarshipID)
        let scholarshipMyRef = userScholarship.scholars.find(scholar => scholar._id == user._id)
        if(!scholarshipMyRef) return
        if(!scholarshipMyRef.ronin) return
        ronin = scholarshipMyRef.ronin
    }
    else if(user.userType == 'scholarship'){
        if(!user.ronin) return
        ronin = user.ronin
    }

    try{
        apiData = await axios.get("https://game-api.axie.technology/api/v1/0x" + ronin)
        monto = +apiData.data.in_game_slp
    }
    catch(e){
        try{
            apiData = await axios.get("https://axie-scho-tracker-server.herokuapp.com/api/account/ronin:" + ronin)
            monto = +apiData.data.slpData.in_game_slp
        }
        catch(e){
            console.log(e)
        }
    }

    return apiData.data.in_game_slp
}

export async function AutoSaveJob(user:IUser){
    let monto = await GetDailyAmountMaked(user)
    let apiAmount = monto
    if(user.lastAmountMaked){
        if(monto > user.lastAmountMaked){
            monto -= user.lastAmountMaked
            await SetDailyReport(user,monto.toString())
        }
        else if(monto < user.lastAmountMaked){
            await SetDailyReport(user,monto.toString())
        }
    }
    user.lastAmountMaked = apiAmount
    await UpdateUser(user)
}

export async function SetDailyReport(user:IUser,dailyCant:string):Promise<boolean>{
    console.log('update')
    if(user){
        if(user.userType == 'scholar')
            if(!user.scholarshipID) return false
        const today = new Date()
        today.setHours(0,0,0,0)
        today.setDate(today.getDate()-1)

        let temp = await tokenMakedModel.findOne({'date': today ,'myScholarID':user._id})
        if(temp){
            await tokenMakedModel.updateOne({_id:temp._id},{'amount': +dailyCant})
        }
        else{
            let obj:ITokenMaked =  {
                'myScholarID':user._id,
                'myScholarshipID': user.userType == 'scholar' ?  user.scholarshipID : user._id,
                'date': today,
                'amount':+dailyCant,
                'scholarProfitPercent':user.profitPercent
            }
            let tokenMModel = new tokenMakedModel(obj)
            await tokenMModel.save()
            user.makedToken.push(tokenMModel)
            await UpdateUser(user)
        }
        return true
    }
    else return false
}

export async function ManualSetDailyReport(user:IUser,dailyCant:string):Promise<boolean>{
    console.log('update')
    if(user){
        if(user.userType == 'scholar')
            if(!user.scholarshipID) return false
        const today = new Date('2021-09-30')
        today.setHours(0,0,0,0)

        let temp = await tokenMakedModel.findOne({'date': today ,'myScholarID':user._id})
        if(temp){
            await tokenMakedModel.updateOne({_id:temp._id},{'amount': +dailyCant})
        }
        else{
            let obj:ITokenMaked =  {
                'myScholarID':user._id,
                'myScholarshipID': user.userType == 'scholar' ?  user.scholarshipID : user._id,
                'date': today,
                'amount':+dailyCant,
                'scholarProfitPercent':user.profitPercent
            }
            let tokenMModel = new tokenMakedModel(obj)
            await tokenMModel.save()
            user.makedToken.push(tokenMModel)
            await UpdateUser(user)
        }
        return true
    }
    else return false
}

export async function DeleteScholarship(msg:TelegramBot.Message,query:CallbackQuery,user:IUser){
    let responseQuery = await RequestCallback(msg)
    let langJSON = require(user.language)
    if(responseQuery.data == '#yes'){
        if(user.scholarshipID){
            let scholarship = await GetUser(user.scholarshipID)
            let scholarRef = scholarship.scholars.find(scholar => scholar._id == user._id)
            scholarship.scholars.splice(scholarship.scholars.indexOf(scholarRef),1)
            user.scholarshipID = null
            user.profitPercent = null
            await UpdateUser(scholarship)
        }
    }
    user.route = 'main'
    await UpdateUser(user)
    bot.editMessageText(langJSON.CommonMainMenuComponents.mainMenuText, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        inline_message_id:query.id,
        reply_markup: user.userType == "scholar" ? GetScholarMenu(langJSON) : GetScholarshipMenu(langJSON)
    })
}

export async function CalculateProfit(msg:TelegramBot.Message,user:IUser,query:CallbackQuery,selectedLapse:timeLapses){
    
    let langJSON = require(user.language)
    let today = new Date()
    today.setHours(0,0,0,0)
    let dayOfPaymentDate = GetDayOfPaymentDate(user)
    let  tokensMaked
    type profitObj = {
        date: Date,
        profit: number,
        total: number
    }
    let totalProfit:number = 0
    let totalAmount:number = 0
    let profit:number
    let profitArray: Array<profitObj> = [];
    let profitText:string = langJSON.PersonalProfitMenu.noMakedProfit
    let findedProfitReport:profitObj
    try{
        if(selectedLapse == timeLapses.oneDay){
            totalAmount = await GetDailyAmountMaked(user)
            totalAmount -= user.lastAmountMaked
            if(user.profitPercent){
                totalProfit = totalAmount * user.profitPercent / 100
            }
            profitText = `📈${langJSON.PersonalProfitMenu.todayProfit}:\n\(`
            user.userType == 'scholar'
            ? profitText += `${langJSON.ProfitReport.profit} - `
            : null
            profitText += `${langJSON.ProfitReport.total}\)\n`
        }
        else if(selectedLapse == timeLapses.oneMonth){
            tokensMaked = await tokenMakedModel.find({'date': {"$gte": dayOfPaymentDate, "$lte":today},'myScholarID':user._id})
            
            profitText = `📈${langJSON.PersonalProfitMenu.acumulatedProfit}:\n\(${langJSON.ProfitReport.day} : `
            user.userType == 'scholar'
            ? profitText += `${langJSON.ProfitReport.profit} - `
            : null
            profitText += `${langJSON.ProfitReport.total}\)\n`
        }
        else if(selectedLapse == timeLapses.total){
            tokensMaked = await tokenMakedModel.find({'date': {"$lte":today},'myScholarID':user._id})
            
            profitText = `📈${langJSON.PersonalProfitMenu.totalProfit}:\n\(${langJSON.ProfitReport.month} : `
            user.userType == 'scholar'
            ? profitText += `${langJSON.ProfitReport.profit} - `
            : null
            profitText += `${langJSON.ProfitReport.total}\)\n`
        }

        if(tokensMaked){
            tokensMaked.forEach((element) => {
                profit = 0
                if(element.scholarProfitPercent){
                    profit = (element.amount * element.scholarProfitPercent) / 100
                    
                    profit = Math.round((profit + Number.EPSILON) * 1000) / 1000

                }
                totalAmount += element.amount
                totalProfit += profit

                if(selectedLapse == timeLapses.total){
                    findedProfitReport = profitArray.find(profitReport => profitReport.date.getMonth() == element.date.getMonth())
                    if(findedProfitReport){
                        findedProfitReport.profit += profit
                        findedProfitReport.total += element.amount
                        profitArray[profitArray.indexOf(findedProfitReport)] = findedProfitReport
                    }
                }
                if(!findedProfitReport){
                    profitArray.push({'date': (element.date),'profit': profit, 'total': element.amount})
                }
                
            });
        }
        totalProfit = Math.round((totalProfit + Number.EPSILON) * 1000) / 1000
        totalAmount = Math.round((totalAmount + Number.EPSILON) * 1000) / 1000
        
        if(profitArray){
            profitArray.sort((a, b) => a.date.getTime() - b.date.getTime())
            profitArray.forEach(element => {
                if(selectedLapse == timeLapses.oneMonth){
                    profitText += `🔹 ${element.date.getDate()} : `
                    element.profit > 0  
                    ? profitText += `${element.profit} SLP -`
                    : null
                    profitText += `${element.total} SLP\n`
                }
                else if(selectedLapse == timeLapses.total){
                    profitText += `🔹${element.date.toLocaleString('default',{month: 'long'})}: `
                    element.profit > 0  
                    ? profitText += `${element.profit} SLP -`
                    : null
                    profitText += `${element.total} SLP\n`
                }
            });
        }
        profitText += `\n☑️${langJSON.ProfitReport.total}:\n`
        totalProfit > 0  
        ? profitText += `${totalProfit} SLP -`
        : null
        profitText += `${totalAmount} SLP\n`


    }
    catch(e){
        console.log(e)
    }
    
    bot.editMessageText(profitText,{
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        inline_message_id:query.id,
        reply_markup: GetFullBackToMenuKeyboard(langJSON),
    })
}

export async function ChangeUserType(msg:TelegramBot.Message,user:IUser,query:CallbackQuery){
    
    let answer = await YesNoQueryHandler(msg)
    if(answer == 'yes'){
        if(user.userType == 'scholar'){
            if(user.scholarshipID){
                let scholarship = await GetUser(user.scholarshipID)
                let scholarRef = scholarship.scholars.find(scholar => scholar._id == user._id)
                scholarship.scholars.splice(scholarship.scholars.indexOf(scholarRef),1)
                user.scholarshipID = null
                user.profitPercent = null
                await UpdateUser(scholarship)
            }
        }
        else{
            for(let scholarRef of user.scholars)
            {
                try{
                    if(scholarRef.pending) continue
                    let scholar = await GetUser(scholarRef._id)
                    scholar.scholarshipID = null
                    scholar.profitPercent = null
                    await UpdateUser(scholar)

                }catch(e){
                    console.log(e)
                }
            };
            user.scholars = []
        }

        let newUserType = user.userType == 'scholar'?'scholarship':'scholar'
        user.userType = newUserType        
        if(newUserType == 'scholarship'){
            user.dayOfPayment =  await SetDayofPayment(msg,query,require(user.language),true)
        }
    }
    else if(answer == 'no'){
        return
    }
}

