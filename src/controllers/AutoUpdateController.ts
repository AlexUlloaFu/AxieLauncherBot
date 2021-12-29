import { IUser } from "../models/User"
import {AutoSaveJob} from "./ScholarController"
import {GetAllUsers} from "./UserController"
const cron = require('node-cron');

export default function SetCronJob(){
    cron.schedule('1 0 * * *',() =>{
        GetAllUsers().then((users:[IUser])=>{
            users.forEach(user => {
                console.log('jelou')
                AutoSaveJob(user)
            });
        })
    })
} 

