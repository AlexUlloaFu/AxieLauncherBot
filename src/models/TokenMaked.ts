import { Document, Schema, model, Mongoose, NativeDate } from 'mongoose';

export interface ITokenMaked{
    myScholarID: number;
    myScholarshipID?: number;
    date:Date;
    amount:number;
    scholarProfitPercent:number;
}

const tokenMakedSchema = new Schema<ITokenMaked>({
    myScholarID:{
        type: Number,
        required: true
    },
    myScholarshipID:{
        type: Number,
    },
    date:{
        type: Date,
        required: true
    },
    amount:{
        type: Number,
        required: true
    },
    scholarProfitPercent:{
        type: Number,
    }
})

const tokenMakedModel =  model<ITokenMaked>('TokenMaked',tokenMakedSchema)
export default tokenMakedModel