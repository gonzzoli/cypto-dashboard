const ctx1 = document.querySelector('#chart1')
const ctx2 = document.querySelector('#chart2')
const favoriteCoins = document.querySelector('.favorite-coins')
const coinSearchInput = document.querySelector('#coin-to-search')
const coinSearchOptions = document.querySelector('.options')
//Renders suggestions each time the input changes
coinSearchInput.addEventListener('input', ()=>{renderSuggestions(coinSearchInput.value)})
//Makes the suggestions dissapear when clicking outside the input
//A brief timeout because when pressing on the + to add a coin
//it may dissapear first, without adding the coin.
coinSearchInput.addEventListener('blur', ()=>{
    setTimeout(()=> {
        coinSearchInput.value = ''
        renderSuggestions(' ')
    }, 400)
})
//Following code is to resize the main section between
//the charts and the coins listed on the side
let initialWidth;
let totalWidth;
const mainResizer = document.querySelector('.main-resizer')
const chartsContainer = document.querySelector('.charts')
const coinsListContainer = document.querySelector('.coins-list')
mainResizer.addEventListener('mousedown', startResizingMain)

function startResizingMain(e) {
    startingPosition = e.clientX
    initialWidth = chartsContainer.offsetWidth
    totalWidth = chartsContainer.offsetWidth + coinsListContainer.offsetWidth
    document.addEventListener('mousemove', resizeMain)
    mainResizer.style.background = '#F1D181'
}
function resizeMain(e) {
    let dx = startingPosition - e.clientX
    chartsContainer.style.width = `${initialWidth-dx}px`
    coinsListContainer.style.width = `${totalWidth - initialWidth + dx}px`
}
const sortedCoinsContainer = document.querySelector('.sorted-coins')
const listResizer = document.querySelector('.list-resizer')
//When mousedown it starts resizing the divs and if it
//goes out of it or mouseup, stops.
listResizer.addEventListener('mousedown', startResizingDivs)
//had to do this event listener on document instead of the
//resizer itself because when moving the mouse
//quickly than the rendering it would stop the resizing
//as it would get out of the resizer
document.addEventListener('mouseup', stopResizingAll)
//both variables needed to calculate the heights of the divs
let initialHeight;
let startingPosition;
let totalHeight;
function startResizingDivs(e) {
    startingPosition = e.pageY
    initialHeight = favoriteCoins.offsetHeight
    totalHeight = favoriteCoins.offsetHeight + sortedCoinsContainer.offsetHeight
    document.addEventListener('mousemove', resizeDivs)
    listResizer.style.background = '#F1D181'
}
function resizeDivs(e) {
    //every time a mousemove is detected, it calculates 
    //the new heights of the divs
    let dy = startingPosition - e.pageY
    favoriteCoins.style.height = `${initialHeight-dy}px`
    sortedCoinsContainer.style.height = `${totalHeight - initialHeight +dy}px`
}
function stopResizingAll() {
    document.removeEventListener('mousemove', resizeDivs)
    document.removeEventListener('mousemove', resizeMain)
    listResizer.style.background = '#918e8e'
    mainResizer.style.background = '#918e8e'
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
//setInterval(updateListValues, 7000)
setInterval(() => {
    updateListValues()
    getCoinsList()
    .then(data => {
        coinsData = data
        updateSortedCoins()
    })
    .catch(err => console.log(err))
}, 7000)
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
    toChart1.addEventListener('click', ()=>{showInChart(coinToAdd, 1)})
    const toChart2 = document.createElement('p')
    toChart2.textContent = 'To Chart 2'
    toChart2.addEventListener('click', ()=>{showInChart(coinToAdd, 2)})
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

const sortSelect = document.querySelector('.sort-selection')
const sortedCoinsListElement = document.querySelector('.sorted-coins-list')
sortSelect.addEventListener('click', changeSort)
let selectedSort = 0
const sortOptions = ['Winners', 'Losers', 'Volume']
const title = sortSelect.firstElementChild
//contains the elements of the sorted coins
let sortedCoinsArray = []

function changeSort() {
    sortedCoinsListElement.innerHTML = ''
    sortedCoinsArray = []
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
    console.log(sortedCoinsArray)
    updateSortedCoins()
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
    const options = document.createElement('div')
    options.classList.add('coin-options')
    const toChart1 = document.createElement('p')
    toChart1.textContent = 'To Chart 1'
    toChart1.addEventListener('click', ()=>{showInChart(coin, 1)})
    const toChart2 = document.createElement('p')
    toChart2.textContent = 'To Chart 2'
    toChart2.addEventListener('click', ()=>{showInChart(coin, 2)})
    options.append(toChart1, toChart2)
    //it will show the change_percentage_24h anwyways
    //only with different color wether positive or negative
    if(selectedSort==0 || selectedSort==1) {
        price.textContent = formatPrice(coin.price_change_percentage_24h) + '%'
        if(coin.price_change_percentage_24h>0) price.style.color = '#7BC312'
        if(coin.price_change_percentage_24h<0) price.style.color = 'red'
    }
    //shows the volume instead
    if(selectedSort==2) {
        //uses toLocaleString to format the number
        price.textContent = coin.total_volume.toLocaleString()
        price.style.color = 'black'
    }
    container.append(name, price, options)
    sortedCoinsArray.push(container)
    //Function to open options list when clicked on the coin
    //or closed when mouseout
    sortedCoinsListElement.append(container)
    container.addEventListener('click', toggleOptions)
    options.addEventListener('mouseout', toggleOptions)
    function toggleOptions() {
        options.classList.toggle('show-options')
    }
}
function renderWinners() {
    const sortedData = coinsData.sort((a,b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
    .slice(0, 20)
    sortedData.forEach(coin => renderSortedCoin(coin))
}
function renderLosers() {
    const sortedData = coinsData.sort((a,b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 20)
    sortedData.forEach(coin => renderSortedCoin(coin))
}
function renderByVolume() {
    const sortedData = coinsData.sort((a,b) => b.total_volume - a.total_volume)
    .slice(0, 20)
    sortedData.forEach(coin => renderSortedCoin(coin))
}
function updateSortedCoins() {
    if(selectedSort==0) {
        sortedCoinsListElement.innerHTML = ''
        sortedCoinsArray = []
        renderWinners()
    }
    if(selectedSort==1) {
        sortedCoinsListElement.innerHTML = ''
        sortedCoinsArray = []
        renderLosers()
    }
    if(selectedSort==2) {
        sortedCoinsListElement.innerHTML = ''
        sortedCoinsArray = []
        renderByVolume()
    }
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
    //calls it here as it needs the coinsData
    //and must be called on page load
    renderWinners()
})
.catch(err => console.log(err))

const Chart = require('chart.js')

function showInChart(coin, chartNum) {
    //console.log(coin, chartNum)
    const action = getCoinData(coin.id)
    .then(response => {
        console.log(response)
        const symbol = coin.symbol.toUpperCase()
        const priceValues = response.prices.map(price => formatPrice(price[1]))
        const dateValues = response.prices.map(price => {
            const coso = new Date(price[0])
            const day = coso.getDate().toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false
            })
            const month = coso.getMonth()
            return `${day}/${month}`
        })
        const data = {symbol, priceValues, dateValues}
        updateChart(data, chartNum)
    })
    .catch(err => console.log(err))
}
//Resets the data with the coin passed to show
function updateChart(data, chartNum) {
    if(chartNum==1) {
        configC1.data.datasets[0].data = data.priceValues
        configC1.data.labels = data.dateValues
        configC1.data.datasets[0].label = data.symbol
        chart1.update()
    } else if(chartNum==2) {
        configC2.data.datasets[0].data = data.priceValues
        configC2.data.labels = data.dateValues
        configC2.data.datasets[0].label = data.symbol
        chart2.update()
    }
    
}
let labelsC1 = ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']
let dataC1 = {
    labels:labelsC1,
    datasets: [{
        data: [211,326,165,350,420,370,500,375,415],
        label: 'Sales of this year erasasa',
        borderColor: '#E59008',
        backgroundColor: '#E59008'
        },
    ],
}

let configC1 = {
    type: 'line',
    data: dataC1,
    options: {
        responsive: true,
        scales: {
            x: {
                //not sure how all works but it modifies
                //the timestamps displayed on x axis
                ticks: {
                    callback: function(val, index) {
                        return index % /*2*/ 1 == 0 ? this.getLabelForValue(val) : ''
                    }
                }
            }
        }
    }
}
let labelsC2 = ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019']
let dataC2 = {
    labels:labelsC2,
    datasets: [{
        data: [211,326,165,350,420,370,500,375,415],
        label: 'Sales of this year erasasa',
        borderColor: '#E59008',
        backgroundColor: '#E59008'
        },
    ],
}

let configC2 = {
    type: 'line',
    data: dataC2,
    options: {
        responsive: true,
        scales: {
            x: {
                //not sure how all works but it modifies
                //the timestamps displayed on x axis
                ticks: {
                    callback: function(val, index) {
                        return index % /*2*/ 1 == 0 ? this.getLabelForValue(val) : ''
                    }
                }
            }
        }
    }
}

let chart1 = new Chart(ctx1, configC1)
let chart2 = new Chart(ctx2, configC2)

//Gets data of a single coin
async function getCoinData(id) {
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=8&interval=daily`)
    const data = response.json()
    return data
}

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

function formatDate() {
    
}