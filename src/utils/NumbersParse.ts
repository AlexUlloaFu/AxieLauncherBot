export function SetNumberToThreeUnits(number:number){
    let sufixText = ''
    
    
    if(number/1000000000 >= 1){
        number/=1000000000
        number = Math.round(number)
        sufixText = ' B'
    }
    else if(number/1000000 >= 1){
        number/=1000000
        number = Math.round(number)
        sufixText = ' M'
    }
    else if(number/1000 >= 1){
        number/=1000
        number = Math.round(number)
        sufixText = ' K'
    }
    else {
        number = Math.round((number + Number.EPSILON) * 1000) / 1000

    }

   
    return `${number}${sufixText}`
}