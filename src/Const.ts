import * as dotenv from 'dotenv'
dotenv.config();
export default{
    BOT_API_TOKEN: process.env.NODE_ENV  == "dev" 
    ? "1906027291:AAFHscvCR_28huhnEfvQWRKQgefY89ItUTs" 
    : process.env.API_BOT_TOKEN,

    BOT_DB_URL: process.env.NODE_ENV  == "dev" 
    ? 'mongodb://127.0.0.1/ScholarBotDB'
    : process.env.URL_MONGO_ATLAS,

    BOT_USERNAME: process.env.NODE_ENV == "dev"
    ? 'scholar_scholarship_bot'
    : process.env.BOT_USERNAME
}