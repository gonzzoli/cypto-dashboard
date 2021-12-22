const ctx1Cont = document.querySelector('.chart1-container')
const ctx1 = document.querySelector('#chart1')
const ctx2 = document.querySelector('#chart2')
const coinSearchInput = document.querySelector('#coin-to-search')
const coinSearchSuggestions = document.querySelector('#coin-names')

async function getCoinsList() {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/list')
    const data = await response.json()
    return data
}
getCoinsList()
.then(data=> {
    console.log(data)
})
.catch(err => console.log(err))
async function getCoinData(coin) {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/terra-luna/market_chart?vs_currency=usd&days=8&interval=daily')
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


const price = getCoinData()
price.then(response => {
    console.log(response)
    const priceValues = response.prices.map(price => formatPrice(price[1]))
    console.log(priceValues)
    setTimeout(()=> {
        updateChart(priceValues)
    }, 10)
})
.catch(err => console.log(err))

function formatPrice(price) {
    const numStr = String(price)
    if(price[1]>=1) {
        return Number(numStr.slice(0, numStr.indexOf('.')+3))
    }
    for(let i=0; i<numStr.length; i++) {
        if(numStr[i] != '0' && numStr[i] != '.') {
            return Number(numStr.slice(0, i+4))
        }
    }
}

function updateChart(data) {
    config.data.datasets[0].data = data
    setTimeout(()=>{
        ctx1Cont.style.border = '2px solid black'
        setTimeout(()=>{
            ctx1Cont.style.border = 'none'
        },5)
    }, 5)
}

function formatDate() {
    
}