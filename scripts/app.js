const ctx1Cont = document.querySelector('.chart1-container')
const ctx1 = document.querySelector('#chart1')
const ctx2 = document.querySelector('#chart2')
const favoriteCoins = document.querySelector('.favorite-coins')
const coinSearchInput = document.querySelector('#coin-to-search')
const coinSearchOptions = document.querySelector('.options')
//Renders suggestions each time the input changes
coinSearchInput.addEventListener('input', ()=>{renderSuggestions(coinSearchInput.value)})
//Makes the suggestions dissapear when clicking outside the input
coinSearchInput.addEventListener('blur', ()=>{
    setTimeout(()=> {
        coinSearchInput.value = ''
        renderSuggestions(' ')
    }, 1000)
})
//Array to keep the 'favorite coins' that`s necesary to keep
//updating each coin with it's price.
let coinsInList = ['luna']

function addCointToList(symbol) {
    //Finds the coin to get the price to set initially 
    //when rendering the element
    console.log('edasd')
    const data = coinsData.find(coin => coin.symbol == symbol)
    const container = document.createElement('div')
    container.classList.add('coin')
    const name = document.createElement('p')
    name.classList.add('coin-list-symbol')
    name.textContent = symbol.toUpperCase()
    const price = document.createElement('p')
    price.classList.add('coin-list-price')
    price.textContent = formatPrice(data.current_price)
    container.append(name, price)
    favoriteCoins.append(container)
}
function renderList() {

}

async function getLastPrice(ids) {
    //'terra-luna%2Cripple'
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
}
function renderSuggestions(searchValue) {
    //empties the previous suggestions
    coinSearchOptions.innerHTML = ''
    const filteredCoins = coinsData.filter(coin => coin.symbol.includes(searchValue))
    //creates the option element
    filteredCoins.forEach(coin => {
        const option = document.createElement('div')
        option.classList.add('option')
        const name = document.createElement('p')
        name.textContent = coin.symbol
        const addSymbol = document.createElement('i')
        addSymbol.classList.add('fas','fa-plus')
        addSymbol.title = 'Add to list.'
        //if clicked, adds the coin to the 'favorite coins'
        addSymbol.addEventListener('click', ()=>{addCointToList(coin.symbol)})
        option.append(name,addSymbol)
        coinSearchOptions.append(option)
    })
}
//fetches the main 250 coins from the CoinGecko API
async function getCoinsList() {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false')
    const data = await response.json()
    return data
}
//Array to keep data about the fetched coins
let coinsData = []
//Used to update data regularly
// setInterval(()=> {
//     console.log(coinsData)
// }, 10000)
getCoinsList()
.then(data=> {
    coinsData = data
    console.log(data)
})
.catch(err => console.log(err))

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

async function getCoinData(id) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=8&interval=daily`)
    const data = response.json()
    return data
}


const price = getCoinData('terra-luna')
price.then(response => {
    //console.log(response)
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