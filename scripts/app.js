const ctx1Cont = document.querySelector('.chart1-container')
const ctx1 = document.querySelector('#chart1')
const ctx2 = document.querySelector('#chart2')


async function getCoinData(coin) {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/shiba-inu/market_chart?vs_currency=usd&days=1&interval=hourly')
    const data = response.json()
    return data
}

const Chart = require('chart.js')

let labels = ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']
let data = {
    labels, 
    datasets: [{
        data: [211,326,165,350,420,370,500,375,415],
        label: 'Sales of this year erasasa'
        },
    ],
}

let config = {
    type: 'line',
    data: data,
    options: {
        responsive: true
    }
}

let myChart = new Chart(ctx1, config)

// For the chart to update, the parent elmeent has to be
// resized, thats why we do this actions, we change the
// size briefly and put it back to 50%
setTimeout(()=>{
    config.data.datasets[0].data[3] = 1500
    ctx1Cont.style.height = '51%'
    setTimeout(()=>{
        ctx1Cont.style.height = '50%'
    },5)
}, 5)

const price = getCoinData()
price.then(response => {
    console.log(response)
    const priceValues = response.prices.map(price => {
        const numStr = String(price[1])
        if(price[1]>=1) {
            return Number(numStr.slice(0, numStr.indexOf('.')+3))
        } else {
            for(let i=0; i<numStr.length; i++) {
                if(numStr[i] != '0' && numStr[i] != '.') {
                    return Number(numStr.slice(0, i+4))
                }
            }
        }
    })
    console.log(priceValues)
})
.catch(err => console.log(err))

