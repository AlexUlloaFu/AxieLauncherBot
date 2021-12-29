import { IUser } from "../models/User"

export function GetNextDayDate(today:Date){
    let tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate()+1)
    return tomorrow
}
export function GetFirstDayOfMonthDate(today:Date){
    let monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1)
    return monthStartDate
}

export function GetDayOfPaymentDate(myUser:IUser){
    let dayOfPaymentDate = new Date()
    if(myUser.dayOfPayment)
        dayOfPaymentDate.setDate(myUser.dayOfPayment)
    else 
        dayOfPaymentDate = GetFirstDayOfMonthDate(dayOfPaymentDate)
    
    dayOfPaymentDate.setHours(0,0,0,0)
    if(dayOfPaymentDate > new Date()){
        dayOfPaymentDate.setMonth(dayOfPaymentDate.getMonth()-1)
    }
    return dayOfPaymentDate
}

export function convertStringToDateFormat(date:string){
    var datearray = date.split("/");
    var newdate = datearray[1] + '/' + datearray[0] + '/' + datearray[2];
    return newdate;
    
}