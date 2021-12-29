import UserModel,{IUser} from '../models/User'
import TelegramBot from 'node-telegram-bot-api'
import { InlineKeyboard, Row, InlineKeyboardButton } from "node-telegram-keyboard-wrapper";
import {GetFullBackToMenuRow,GetBackToMenuRow} from '../components/CommonMarkupsComponent'

export function CreateUser(msg: TelegramBot.Message){
    
    const user: IUser = {
        _id: msg.from.id,
        username: msg.chat.username ? msg.chat.username : (msg.chat.first_name + ' ' + msg.chat.last_name).trim(),
        userType:"",
        route: "main",
        makedToken: []
    };

    return  new UserModel(user);
}

export async function RegisterUser (user:IUser){
    return new UserModel(user).save();
}
export async function UpdateUser (user:IUser){
    return UserModel.replaceOne({_id: user._id},user);
}

export async function GetAllUsers(): Promise<IUser[]> {
    return UserModel.find({});
}

export async function GetUser(tid: number): Promise<IUser> {
    return UserModel.findById(tid);
}

export async function UpdateTypeOfUser(userId:number, value:string){
    return UserModel.updateOne({_id: userId},{userType: value}).exec()
}

export async function GetScholarsMarkup(user:IUser){
    
    let scholarsMarkup =  new InlineKeyboard()

    user.scholars.forEach(scholar => {
        scholarsMarkup.push( new Row(
            new InlineKeyboardButton(`🙎${scholar.scholarName ? scholar.scholarName : scholar.username}`, 'callback_data', `#${scholar.username}`)
        ))
    });

    scholarsMarkup.push(GetBackToMenuRow(require(user.language)))
    scholarsMarkup.push(GetFullBackToMenuRow(require(user.language)))

    return scholarsMarkup.getMarkup()
}