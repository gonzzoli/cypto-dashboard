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

const sortedCoinsContainer = document.querySelector('.sorted-coins')
const resizer = document.querySelector('.resizer')
//When mousedown it starts resizing the divs and if it
//goes out of it or mouseup, stops.
resizer.addEventListener('mousedown', startResizingDivs)
//had to do this event listener on document instead of the
//resizer itself because when moving the mouse
//quickly than the rendering it would stop the resizing
//as it would get out of the resizer
document.addEventListener('mouseup', stopResizingDivs)
//both variables needed to calculate the heights of the divs
let initialHeight;
let startingPosition;
function startResizingDivs(e) {
    startingPosition = e.pageY
    initialHeight = favoriteCoins.offsetHeight
    document.addEventListener('mousemove', resizeDivs)
}
function resizeDivs(e) {
    //every time a mousemove is detected, it calculates 
    //the new heights of the divs
    let dy = startingPosition - e.pageY
    favoriteCoins.style.height = `${initialHeight-dy}px`
    sortedCoinsContainer.style.height = `${596 - initialHeight +dy}px`
}
function stopResizingDivs() {
    document.removeEventListener('mousemove', resizeDivs)
}
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
            coinElements[i].style.color = '#40E11C'
            coinElements[i].textContent = prices[coinsInList[i]].usd
        } else {
            coinElements[i].style.color = 'black'
        }
    }
}
//Used to update listed coin's prices regularly
setInterval(updateListValues, 7000)
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
    const options = document.createElement('div')
    options.classList.add('coin-options')
    const remove = document.createElement('p')
    remove.textContent = 'Delete'
    //Function to remove the coin from the list
    remove.addEventListener('click', ()=>{removeCoinFromList(coinToAdd)})
    const toChart1 = document.createElement('p')
    toChart1.textContent = 'To Chart 1'
    const toChart2 = document.createElement('p')
    toChart2.textContent = 'To Chart 2'
    options.append(remove, toChart1, toChart2)
    container.append(name, price, options)
    coinsContainersInList.push(container)
    //Function to open options list when clicked on the coin
    //or closed when mouseout
    container.addEventListener('click', toggleOptions)
    options.addEventListener('mouseout', toggleOptions)
    favoriteCoins.append(container)
    function toggleOptions() {
        options.classList.toggle('show-options')
    }
}
//Function to remove the coin from the list
function removeCoinFromList(coinToRemove) {
    let index = coinsInList.findIndex(coin =>{
        return coin == coinToRemove.id
    })
    //Remove the coin from the list and the display
    coinsInList.splice(index, 1)
    coinsContainersInList[index].remove()
    coinsContainersInList.splice(index,1)
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
    const filteredCoins = coinsData.filter(coin => coin.symbol.toLowerCase().includes(searchValue.toLowerCase()))
    //creates the option element
    filteredCoins.forEach(coin => {
        const option = document.createElement('div')
        option.classList.add('option')
        const name = document.createElement('p')
        name.textContent = coin.symbol.toLowerCase()
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
//SECTION TO WRITE CODE ABOUT THE 'Winners' SECTION
//WILL LIST COINS WITH MOST PERCENTAGE CHANGE IN
//24HS BOTH UP OR DOWN IF THE 'Losers' OPTION IS SELECTED
//ALSO INCLUDE 'Volume' OPTION. THE ONES WITH MOST VOLUME
//it starts with winners selected, so we render them initially
//renderWinners()
const sortSelect = document.querySelector('.sort-selection')
const sortedCoinsListElement = document.querySelector('.sorted-coins-list')
sortSelect.addEventListener('click', changeSort)
let selectedSort = 0
const sortOptions = ['Winners', 'Losers', 'Volume']
const title = sortSelect.firstElementChild
let sortedCoinsArray = []
function changeSort() {
    sortedCoinsListElement.innerHTML = ''
    //switches between sort options
    switch (selectedSort) {
        case 0:
            selectedSort = 1
            renderLosers()
            break;
        case 1:
            selectedSort = 2
            renderByVolume()
            break;
        case 2:
            selectedSort = 0
            renderWinners()
            break;
    
        default:
            break;
    }
    title.textContent = sortOptions[selectedSort]
}
function renderSortedCoin(coin) {
    //creates the html element for a coin
    const container = document.createElement('div')
    container.classList.add('coin')
    const name = document.createElement('p')
    name.classList.add('coin-list-symbol')
    name.textContent = coin.symbol.toUpperCase()
    const price = document.createElement('p')
    price.classList.add('coin-list-price')
    //it will show the change_percentage_24h anwyways
    //only with different color wether positive or negative
    if(selectedSort==0 || selectedSort==1) {
        price.textContent = formatPrice(coin.price_change_percentage_24h) + '%'
        if(coin.price_change_percentage_24h>0) price.style.color = '#7BC312'
        if(coin.price_change_percentage_24h<0) price.style.color = 'red'
    }
    //shows the volume instead
    if(selectedSort==2) {
        price.textContent = formatVolume(coin.total_volume)
        price.style.color = 'black'
    }
    container.append(name, price)
    sortedCoinsArray.push(container)
    //Function to open options list when clicked on the coin
    //or closed when mouseout
    sortedCoinsListElement.append(container)
}
function renderWinners() {
    console.log('rendering winnerw')
    const sortedData = coinsData.sort((a,b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 10)
    sortedData.forEach(coin => renderSortedCoin(coin))
}
function renderLosers() {
    console.log('rendering losers')
    const sortedData = coinsData.sort((a,b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 10)
    sortedData.forEach(coin => renderSortedCoin(coin))
}
function renderByVolume() {
    console.log('rendering volume')
    const sortedData = coinsData.sort((a,b) => b.total_volume - a.total_volume)
    .slice(0, 10)
    sortedData.forEach(coin => renderSortedCoin(coin))
}

//fetches the main 250 coins from the CoinGecko API
async function getCoinsList() {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false')
    const data = await response.json()
    return data
}
//Array to keep data about the fetched coins
let coinsData = []
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
    const pointIndex = numStr.indexOf('.')
    if(price>=1) {
        return Number(numStr.slice(0, pointIndex+3))
    }
        return Number(numStr.slice(0, pointIndex+3))
}
function formatVolume(num) {
    let invertedStr = String(num).split('').reverse()
    for(let i=0; i<invertedStr.length; i++) {
        if(i%3==0 && i!=0) {
            invertedStr.splice(i,0,'.')
        }
    }
    return invertedStr.reverse().join('')
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