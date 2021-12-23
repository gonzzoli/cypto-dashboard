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
    }, 400)
})

//Array to keep the 'favorite coins' that`s necesary to keep
//updating each coin with it's price.
let coinsInList = []
let coinsContainersInList = []

async function updateListValues() {
    //Format the symbols in a string to query the API and get
    //last price of each one
    const coinElements = Array.from(coinsContainersInList).map(coin => {
        return Array.from(coin.children)[1]
    })
    console.log('updated')
    const queryString = coinsInList.join('%2C')
    //awaits the response from querying the last prices
    const prices = await getLastPrice(queryString)
    //updates the prices shown
    for(let i=0; i<coinsInList.length; i++) {
        //if its price went up, it will paint it green or red if went down
        //else just come back to black
        if(Number(coinElements[i].textContent) > prices[coinsInList[i]].usd) {
            coinElements[i].style.color = 'red'
            coinElements[i].textContent = prices[coinsInList[i]].usd
        } else if(Number(coinElements[i].textContent) < prices[coinsInList[i]].usd){
            coinElements[i].style.color = 'lightgreen'
            coinElements[i].textContent = prices[coinsInList[i]].usd
        } else {
            coinElements[i].style.color = 'black'
        }
    }
}
setInterval(updateListValues, 25000)
function addCointToList(coinToAdd) {
    coinsInList.push(coinToAdd.id)
    //dissapears at once to not allow multiple 'addings' to list
    //of the same coin
    coinSearchOptions.style.display = 'none'
    //Finds the coin to get the price to set initially 
    //when rendering the element
    const data = coinsData.find(coin => coin.symbol == coinToAdd.symbol)
    const container = document.createElement('div')
    container.classList.add('coin')
    const name = document.createElement('p')
    name.classList.add('coin-list-symbol')
    name.textContent = coinToAdd.symbol.toUpperCase()
    const price = document.createElement('p')
    price.classList.add('coin-list-price')
    price.textContent = data.current_price
    container.append(name, price)
    coinsContainersInList.push(container)
    favoriteCoins.append(container)
}

async function getLastPrice(ids) {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
    const data = await response.json()
    return data
}
function renderSuggestions(searchValue) {
    //empties the previous suggestions
    coinSearchOptions.style.display = 'block'
    coinSearchOptions.innerHTML = ''
    const filteredCoins = coinsData.filter(coin => coin.symbol.includes(searchValue))
    //creates the option element
    filteredCoins.forEach(coin => {
        const option = document.createElement('div')
        option.classList.add('option')
        const name = document.createElement('p')
        name.textContent = coin.symbol
        //If it already is in the list, do not append the add symbol
        if(coinsInList.includes(coin.id)) {
            option.append(name)
            coinSearchOptions.append(option)
            return
        }
        //If its not on the list, append the add symbol
        const addSymbol = document.createElement('i')
        addSymbol.classList.add('fas','fa-plus')
        addSymbol.title = 'Add to list.'
        //if clicked, adds the coin to the 'favorite coins'
        addSymbol.addEventListener('click', ()=>{addCointToList(coin)})
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

//Gets data of a single coin
async function getCoinData(id) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=8&interval=daily`)
    const data = response.json()
    return data
}

//just to fetch data and have some initial chart drawing
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
    //Formats the price to not add more than 2 decimal places
    //or if its price is less than $1 it shows all the decimals
    if(price>=1) {
        return Number(numStr.slice(0, numStr.indexOf('.')+3))
    }
        return Number(numStr.slice(0, i+4))
}
//Resets the data with new data and resizes for a 
//brief time the chart container cuz i cant find
//other way to make it re-render with new data
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