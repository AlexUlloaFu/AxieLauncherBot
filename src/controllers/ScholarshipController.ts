import TelegramBot, { CallbackQuery } from 'node-telegram-bot-api'
import {RegisterUser,GetUser, UpdateUser} from './UserController'
import {RequestText} from './BotMainController'
import bot from '../Bot'
import UserModel, { IUser,IScholarRegister } from '../models/User'
import tokenMakedModel, { ITokenMaked } from '../models/TokenMaked'
import {GetFullBackToMenuKeyboard} from '../components/CommonMarkupsComponent'
import { NativeError } from 'mongoose'
import endpoint from "../Const";
import { GetDayOfPaymentDate } from '../utils/DateMethods'
const axios = require("axios")


export async function ListScholars(msg:TelegramBot.Message,myUser:IUser,query:CallbackQuery) {
    
    let langJSON = require(myUser.language) 
    let answerText = `${langJSON.ScholarshipAdminMenu.listButtonText}\n\n\n`
        for(let i = 0; i < myUser.scholars.length; i++){
            if(!myUser.scholars[i].scholarName){
                let apiData = await axios.get("https://game-api.axie.technology/api/v1/0x" + myUser.scholars[i].ronin)
                myUser.scholars[i].scholarName = apiData.data.name
                await UpdateUser(myUser)
            }
            let scholar = myUser.scholars[i]
            let pendienteText = scholar.pending == true ? langJSON.CommonMainMenuComponents.no : langJSON.CommonMainMenuComponents.yes
            let scholarName = scholar.scholarName ? `${langJSON.Scholar.name}${scholar.scholarName}(@${scholar.username})` : `${langJSON.Scholar.username}@${scholar.username}`
            let customScholar = `🙎${scholarName}\n⚖️${langJSON.Scholar.profit}${scholar.percent}% \n❓${langJSON.Scholar.pendiente}${pendienteText}\n\n\n`
            answerText += customScholar
        }
        
    answerText += `☑️${langJSON.ScholarshipAdminMenu.listButtonText2}`
    bot.editMessageText(answerText,
        {
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            inline_message_id:query.id,
            reply_markup: GetFullBackToMenuKeyboard(langJSON)
        })
}

export async function UpdateScholarPercent(msg:TelegramBot.Message,query:CallbackQuery,myUser:IUser,toUpdateScholarIndex:number) {
    
    let langJSON = require(myUser.language) 
    let newUserPercent

    let sucess = false
    do{
        newUserPercent = await RequestText(msg)
        if (typeof newUserPercent !== 'string') return;
        if(+newUserPercent) {
            if(+newUserPercent > 0 ){
                sucess = true
            }
            else bot.sendMessage(msg.chat.id,langJSON.Errores.invalidTypeOfNumber)
        }
        else bot.sendMessage(msg.chat.id,langJSON.Errores.invalidTypeOfNumber)
    }while(!sucess)

    myUser.scholars[toUpdateScholarIndex].percent = +newUserPercent
    try{
        let scholar = await GetUser(myUser.scholars[toUpdateScholarIndex]._id)
        scholar.profitPercent = +newUserPercent
        await UpdateUser(scholar)   
    }catch(e){
        console.log(e)
    }

    bot.sendMessage(msg.chat.id,langJSON.ScholarshipAdminMenu.succesPercentUpdateText,{reply_markup: GetFullBackToMenuKeyboard(langJSON)})

}

export async function UpdateScholarWallet(msg:TelegramBot.Message,query:CallbackQuery,myUser:IUser,toUpdateScholarIndex:number) {
    
    let langJSON = require(myUser.language) 
    let newScholarWallet

    newScholarWallet = await RequestText(msg)
    if (typeof newScholarWallet !== 'string') return;
    let reg = /(ronin|:|-|0x)/gm
    newScholarWallet = newScholarWallet.replace(reg,'')  
    console.log(newScholarWallet)
    myUser.scholars[toUpdateScholarIndex].ronin = newScholarWallet
    await UpdateUser(myUser)
    bot.sendMessage(msg.chat.id,langJSON.ScholarshipAdminMenu.succesWalletUpdateText,{reply_markup: GetFullBackToMenuKeyboard(langJSON)})
}

export async function UpdateScholarName(msg:TelegramBot.Message,query:CallbackQuery,myUser:IUser,toUpdateScholarIndex:number) {
    
    let langJSON = require(myUser.language) 
    let newScholarName

    newScholarName = await RequestText(msg)
    if (typeof newScholarName !== 'string') return;
        

    myUser.scholars[toUpdateScholarIndex].scholarName = newScholarName
    bot.sendMessage(msg.chat.id,langJSON.ScholarshipAdminMenu.succesNameUpdateText,{reply_markup: GetFullBackToMenuKeyboard(langJSON)})
}

export async function DeleteScholar(msg:TelegramBot.Message,query:CallbackQuery,myUser:IUser,toDeleteUsername:String) {
    
    let langJSON = require(myUser.language) 
    let toDeleteScholarIndex = await FindScholarIndexByUsername(myUser,toDeleteUsername)
    
    if(toDeleteScholarIndex != -1){
        let scholar = await GetUser(myUser.scholars[toDeleteScholarIndex]._id)
        if(scholar){
            scholar.scholarshipID = null
            scholar.profitPercent = null
            scholar.lastAmountMaked = null
            await UpdateUser(scholar)
        }
        myUser.scholars.splice(toDeleteScholarIndex,1)
        await UpdateUser(myUser)
        bot.editMessageText(langJSON.ScholarshipAdminMenu.succesRemoveScholarText,{
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            inline_message_id:query.id,
            reply_markup: GetFullBackToMenuKeyboard(langJSON)
        })
    }
    else{
        bot.editMessageText(langJSON.Errores.failedOnFindUserAsScholar,{
            chat_id: msg.chat.id,
            message_id: msg.message_id,
            inline_message_id:query.id,
            reply_markup: GetFullBackToMenuKeyboard(langJSON)
        })
    }
}

export async function AddNewScholar(msg:TelegramBot.Message,myUser:IUser,recivedUsername:string,recivedScholarWallet:string,recivedScholarName:string,recivedScholarPercent:number){
    
    let langJSON = require(myUser.language) 
    let scholars = myUser.scholars
    let scholar:IScholarRegister = {
        'username': recivedUsername,
        'percent':recivedScholarPercent,
        'scholarName':recivedScholarName,
        'ronin':recivedScholarWallet,
        '_id':0,
        'pending':true
    }
    myUser.scholars.push(scholar)
    await UpdateUser(myUser)
    await bot.sendMessage(msg.chat.id,`${langJSON.ScholarshipAdministrationOfScholars.scuccesCreatingNewScholar}\nhttps://t.me/${endpoint.BOT_USERNAME}?start=${myUser._id}`,{reply_markup: GetFullBackToMenuKeyboard(langJSON)})
}

export async function FindScholarIndexByUsername(myUser:IUser,toCompareUsername:String){
    let scholarIndex = myUser.scholars.indexOf( myUser.scholars.find(scholar => scholar.username == toCompareUsername ))
    if(scholarIndex == -1)
        scholarIndex = myUser.scholars.indexOf( myUser.scholars.find(scholar => scholar.scholarName == toCompareUsername ))
    return scholarIndex
}

export async function ListScholarsProfits(msg:TelegramBot.Message,myUser:IUser,query:CallbackQuery,recivedUsername:string,recivedDate:Date) {
    
    let langJSON = require(myUser.language) 
    let makedReport:ITokenMaked[]
    let scholarUserModel:IUser;
    let sendNewMsg:boolean
    type scholarReportData = {
        id:number,
        scholarReports:[string],
        scholarProfit:number,
        firstDay?:Date,
        lastDay?:Date
    }
    let report:Array<scholarReportData> = []
    let reportString:string
    let profitAmount:number = 0
    let showResumedReport = false

    let dayOfPaymentDate = GetDayOfPaymentDate(myUser)
    if(recivedDate)
        recivedDate.setHours(0,0,0,0)

    if(recivedUsername){
        await UserModel.findOne({'username': recivedUsername},(err:NativeError,doc:IUser)=>{
            scholarUserModel = doc
        })
        if(recivedDate){
            sendNewMsg = true
            makedReport = await tokenMakedModel.find({'myScholarshipID':myUser._id, 'myScholarID':scholarUserModel._id, 'date': recivedDate})
        }
        else {
            makedReport = await tokenMakedModel.find({'myScholarshipID':myUser._id, 'myScholarID':scholarUserModel._id, 'date':{"$gte": dayOfPaymentDate}})
        }
    }
    else{

        if(recivedDate){
            sendNewMsg = true
            
            makedReport = await tokenMakedModel.find({'myScholarshipID':myUser._id,'date': recivedDate})
        }
        else{
           makedReport = await tokenMakedModel.find({'myScholarshipID': myUser._id, 'date':{"$gte": dayOfPaymentDate}})
        }
    }


    if(!makedReport){
        if(sendNewMsg){
            bot.sendMessage(msg.chat.id,langJSON.ScholarshipProfitMenu.noProfitText,{reply_markup:GetFullBackToMenuKeyboard(langJSON)})
        }
        else{
            await bot.editMessageText(langJSON.ScholarshipProfitMenu.noProfitText,{
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                inline_message_id:query.id,
                reply_markup: GetFullBackToMenuKeyboard(langJSON)})
        }
        
    }
    else {

        //EN CASO DE Q SE MUESTRE TODOS LOS BENEFICIOS DE TODOS LOS BECARIOS SE RESUMEN LAS FECHAS
        if(!recivedUsername && !recivedDate)
            showResumedReport = true


        //AGRUPAR LOS REPORTES EN SUS RESPECTIVOS USUARIOS
        for(let i:number = 0 ; i < makedReport.length;i++){

            let userReport = makedReport[i]
            let currentUserProfit = 0
            let currScholarRef

            currScholarRef =  GetUser(userReport.myScholarID) 
            
            if(!currScholarRef)
                continue

            if(userReport.myScholarshipID != myUser._id)
                continue

            if(userReport.myScholarID == myUser._id){
                currentUserProfit = userReport.amount 
            }
            else currentUserProfit = userReport.amount * (100 -userReport.scholarProfitPercent) / 100
            
            currentUserProfit = Math.round((currentUserProfit + Number.EPSILON) * 1000) / 1000

            if(!showResumedReport)
                reportString = `${userReport.date.toLocaleDateString()} ➖ ${userReport.amount} SLP\n`
                
            let existingScholarData = report.find(scholar => scholar.id == userReport.myScholarID)
            if(existingScholarData){
                let index =  report.indexOf ( existingScholarData )
                if(showResumedReport){
                    if(!report[index].firstDay)
                        report[index].firstDay = userReport.date

                    else if(report[index].firstDay > userReport.date){
                        report[index].firstDay = userReport.date
                    }
                    if(!report[index].lastDay)
                        report[index].lastDay = userReport.date

                    else if(report[index].lastDay < userReport.date){
                        report[index].lastDay = userReport.date
                    }
                }
                else report[index].scholarReports.push(reportString) 
                report[index].scholarProfit += currentUserProfit
            }
            else{
                if(showResumedReport)
                    report.push({'id':userReport.myScholarID,'firstDay':userReport.date,'lastDay':userReport.date,'scholarReports':[reportString],'scholarProfit':currentUserProfit})
                else 
                    report.push({'id':userReport.myScholarID,'scholarReports':[reportString],'scholarProfit':currentUserProfit})

            }

            profitAmount += currentUserProfit

        }

        if(showResumedReport){
            for(const scholar of report)
                scholar.scholarReports[0] = `${scholar.firstDay.toLocaleDateString()}➖${scholar.lastDay.toLocaleDateString()}\n`
        }

        reportString = `📊${langJSON.ScholarshipProfitMenu.reportHeader}\n`

        //ver si entre la lista de reportes se encuentra el propio becador
        let scholarshipReport = report.find(scholar => scholar.id == myUser._id)
        
        if(scholarshipReport)
        {
            let currentScholarModel = await GetUser(scholarshipReport.id)
            if(currentScholarModel._id == myUser._id){
                //SI HAY Q MOSTRAR TODOS LOS USUARIOS SE MUESTRA EL PROPIO BECADOR TAMBIEN
                if(!recivedUsername){
                    reportString += `\n🙎${langJSON.ProfitReport.myReport}\n🗓${langJSON.Scholar.maked}\n`
                    for(const scholarReport of scholarshipReport.scholarReports){
                        reportString += scholarReport.toString()
                    }
                    reportString += `💰${langJSON.ProfitReport.perScholarMyProfit} ${scholarshipReport.scholarProfit} SLP \n` 
                }
                //sacar al propio becador de la lista de reportes de becarios
                report.splice(report.indexOf(scholarshipReport),1)
            }
        }

        for( const scholar of report){
            let currentScholarModel = await GetUser(scholar.id)
            let currScholarRefInScholarship = myUser.scholars.find(scholar => scholar.username == currentScholarModel.username)
            let scholarName = currScholarRefInScholarship.scholarName ? `${langJSON.Scholar.name}${currScholarRefInScholarship.scholarName}(@${currentScholarModel.username})` : `${langJSON.Scholar.username}@${currentScholarModel.username}`
            let activeText = currentScholarModel.scholarshipID == myUser._id ? langJSON.CommonMainMenuComponents.yes : langJSON.CommonMainMenuComponents.no
            let scholarPercent = currentScholarModel.scholarshipID == myUser._id ? `⚖️${langJSON.Scholar.profit}${currentScholarModel.profitPercent}%\n` : ''
            
            reportString += `\n🙎${scholarName}\n${langJSON.Scholar.pendiente}${activeText}\n${scholarPercent}🗓${langJSON.Scholar.maked}\n`
            for(const scholarReport of scholar.scholarReports){
                reportString += scholarReport.toString()
            }
            reportString += `💰${langJSON.ProfitReport.perScholarMyProfit} ${scholar.scholarProfit} SLP \n` 
        }
        
        profitAmount = Math.round((profitAmount + Number.EPSILON) * 1000) / 1000
        reportString += `\n💰${langJSON.ProfitReport.myProfit} ${profitAmount} SLP\n`
        reportString += `\n☑️${langJSON.ScholarshipProfitMenu.reportComplete}`

        if(sendNewMsg){
            bot.sendMessage(msg.chat.id,reportString,{reply_markup:GetFullBackToMenuKeyboard(langJSON)})
        }
        else{
            bot.editMessageText(reportString,{
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                inline_message_id:query.id,
                reply_markup:GetFullBackToMenuKeyboard(langJSON)
            })
        }
       
    }
}