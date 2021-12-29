import * as dotenv from 'dotenv'
dotenv.config();
export default{
    BOT_API_TOKEN: process.env.NODE_ENV  == "dev" 
    ? "1906027291:AAFHscvCR_28huhnEfvQWRKQgefY89ItUTs" 
    : "5040414565:AAFiPv17XH6rsYAbMtcppkt3WDrrHw4IzwE",

    BOT_DB_URL: process.env.NODE_ENV  == "dev" 
    ? 'mongodb://127.0.0.1/ScholarBotDB'
    : 'mongodb://127.0.0.1/ScholarBotDB',

    BOT_USERNAME: process.env.NODE_ENV == "dev"
    ? 'scholar_scholarship_bot'
    : "axie_scholarships_launcher_bot"
}