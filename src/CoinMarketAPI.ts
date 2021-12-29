import { SetNumberToThreeUnits } from "./utils/NumbersParse";
const axios = require("axios").create({baseUrl: "https://pro-api.coinmarketcap.com/"});
let qs = `?symbol=SLP,AXS`

export async function GetDataFromAPI() {
    let coinsInfo = []
    let res = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest' + qs, {
                headers: { 'X-CMC_PRO_API_KEY': '361ae9a6-bd9b-409d-bcaf-3bb6467c0665' }
            });
    for(let keys in res.data.data){
        
        let currentCoin = res.data.data[keys]
        let price
        let volume_24h
        let market_cap
        
        for(let qutoesKeys in currentCoin.quote){
            if(qutoesKeys === "USD"){
                price = currentCoin.quote[qutoesKeys].price
                market_cap = currentCoin.quote[qutoesKeys].market_cap
                volume_24h = currentCoin.quote[qutoesKeys].volume_24h
            }
        }

        price = `${SetNumberToThreeUnits(+price)} USD`
        market_cap = SetNumberToThreeUnits(+market_cap)
        volume_24h = SetNumberToThreeUnits(+volume_24h)

        coinsInfo.push({
        'coinName':currentCoin.name,
        'coinSymbol':currentCoin.symbol,
        'price':price,
        'volume_24h':volume_24h,
        'market_cap':market_cap
        })
    }

    return coinsInfo;
}

