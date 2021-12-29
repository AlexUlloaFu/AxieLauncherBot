import { Document, Schema, model, Types } from 'mongoose';
import { ITokenMaked} from './TokenMaked';
import tokenMakedModel from './TokenMaked';

export interface IUser{
    _id: number;
    ronin?: string;
    username: string;
    userType: string;
    route?: string;
    language?: string
    scholars?: (IScholarRegister)[]
    scholarshipID?: number;
    profitPercent?: number;
    makedToken?: (ITokenMaked)[];
    dayOfPayment?: number
    lastAmountMaked?: number
}

export interface IScholarRegister{
    _id:number;
    username:string;
    ronin?:string;
    scholarName?:string;
    percent:number;
    pending:boolean
}

const schema = new Schema<IUser>({
    _id:{
        type: Number,
        required: true
    },
    ronin:{
        type: String,
    },
    username:{
        type: String,
        required: true
    },
    userType:{
        type: String,
    },
    route:{
        type: String,
    },
    scholars: { 
        type:[{
            _id:Number,
            username: String,
            scholarName: String,
            percent: Number,
            pending: Boolean,
            ronin: String
        }]
    },
    makedToken:{
        type:[{
            type: Types.ObjectId, ref: tokenMakedModel 
        }]
    },
    language:{
        type: String,
    },
    scholarshipID: {
        type: Number
    },
    profitPercent: {
        type: Number
    },
    dayOfPayment: {
        type: Number
    },
    lastAmountMaked: {
        type: Number
    },
});

const UserModel = model<IUser>('User', schema);
export default UserModel