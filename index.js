const weatherAPIKey = '9ece9a427fa24d5ca9745825230805';
let numberOfCities = 1;
const weatherIcons = new Map();
weatherIcons.set('Sunny', 'ion-ios-sunny');
weatherIcons.set('Partly cloudy', 'ion-ios-cloud');
weatherIcons.set('Cloudy', 'ion-ios-cloud');
weatherIcons.set('Overcast', 'ion-ios-cloud');
weatherIcons.set('Mist', 'ion-ios-cloud');
weatherIcons.set('Fog', 'ion-ios-cloud');
weatherIcons.set('Clear', 'ion-ios-moon');
weatherIcons.set('Light drizzle', 'ion-ios-rainy');
weatherIcons.set('Light rain', 'ion-ios-rainy');
weatherIcons.set('Light drizzle', 'ion-ios-rainy');
weatherIcons.set('Moderate rain', 'ion-ios-rainy');
weatherIcons.set('Heavy rain', 'ion-ios-rainy');

window.onload = function(){
    let storedCities = JSON.parse(localStorage.getItem("cities"));

    navigator.geolocation.getCurrentPosition(getPositionSuccess);
    if(storedCities != null){
        let numberOfCarouselItems = Math.floor(storedCities.length/4 + 1);
        for(let i = 1; i < numberOfCarouselItems; i++){
            createCarouselItem(i*4);
        }

        for(let i = 1; i < storedCities.length + 1; i++){
            getCurrentWeather(storedCities[i-1][0], String(i));
        }
    }
}

function getPositionSuccess(pos){
    const position = pos.coords;
    const coordinatesString = String(position.latitude) + ',' + String(position.longitude);
    getCurrentWeather(coordinatesString, '0');
}

function getCurrentWeather(query, position){

    let cityData;
    const xhr = new XMLHttpRequest();
    const url = 'http://api.weatherapi.com/v1/current.json?key=' + weatherAPIKey + '&q=' + query + '&aqi=no';
    xhr.open('GET', url)
    xhr.onload = () => {
        if(xhr.status === 200){
            cityData = JSON.parse(xhr.responseText);
            loadWeatherCard(cityData, position);
            //console.log(cityData);
        }
        else{
            console.error('Request failed');
        }
    };

    xhr.send();
}

function hideDialog(id) {
    document
      .getElementById(id)
      .hide();
};

function showSearchDialog(){
    let dialog = document.getElementById('searchCity-dialog');

    if (dialog) {
      dialog.show();
    } else {
      ons.createElement('searchCity.html', { append: true })
        .then(function(dialog) {
          dialog.show();
        });
    }
}

function addNewCity(){
    const query = document.getElementById('queryInput').value;

    let cityData;
    const xhr = new XMLHttpRequest();
    const url = 'http://api.weatherapi.com/v1/current.json?key=' + weatherAPIKey + '&q=' + query + '&aqi=no';
    xhr.open('GET', url)
    xhr.onload = () => {
        if(xhr.status === 200){
            cityData = JSON.parse(xhr.responseText);
            let storedCities = localStorage.getItem("cities");

            if(storedCities == null){
                let citiesArray = [[cityData.location.name, numberOfCities]];
                localStorage.setItem("cities", JSON.stringify(citiesArray));
            }
            else{
                let citiesArray = JSON.parse(storedCities);
                citiesArray.push([cityData.location.name, numberOfCities]);
                localStorage.setItem("cities", JSON.stringify(citiesArray));
            }

            if(numberOfCities % 4 == 0 && numberOfCities > 0){
                createCarouselItem(numberOfCities);
            }

            getCurrentWeather(cityData.location.name, numberOfCities);
        }
        else{
            console.error('Request failed');
        }
    };

    xhr.send();
    hideDialog('searchCity-dialog');
}

function loadWeatherCard(cityTempData, position){
    ons.createElement('card.html').then(function(cardElement){
        cardElement.setAttribute('id', cityTempData.location.name);
        cardElement.children[0].children[0].innerHTML = cityTempData.location.name;
        cardElement.children[0].children[1].setAttribute('icon', weatherIcons.get(cityTempData.current.condition.text))
        cardElement.children[1].children[0].innerHTML = cityTempData.current.temp_c + '&deg';
        cardElement.children[2].children[0].setAttribute('onclick', 'deleteCity("' + cityTempData.location.name + '")');
        if(position != 0){
            numberOfCities++;
        }
        else{
            cardElement.children[2].children[0].setAttribute('disabled','true');
        }
        document.getElementById('col' + position).appendChild(cardElement);
    })
}

function createCarouselItem(i){
    let newCarItem = ons.createElement('<ons-carousel-item style="background-color: lightskyblue;"></ons-carousel-item>');
    let firstRow = ons.createElement('<ons-row></ons-row>');
    let secondRow = ons.createElement('<ons-row></ons-row>');
    let zeroColumn = ons.createElement('<ons-col class="ons_col" id="col' + String(i) +'"></ons-col>');
    let firstColumn = ons.createElement('<ons-col class="ons_col" id="col' + String(i + 1) +'"></ons-col>');
    let secondColumn = ons.createElement('<ons-col class="ons_col" id="col' + String(i + 2) +'"></ons-col>');
    let thirdColumn = ons.createElement('<ons-col class="ons_col" id="col' + String(i + 3) +'"></ons-col>');

    firstRow.appendChild(zeroColumn);
    firstRow.appendChild(firstColumn);
    secondRow.appendChild(secondColumn);
    secondRow.appendChild(thirdColumn);
    newCarItem.appendChild(firstRow);
    newCarItem.appendChild(secondRow);

    document.getElementById('carousel').appendChild(newCarItem);
}

function deleteCity(cityName){
    let card = document.getElementById(cityName);
    card.remove();
    
    numberOfCities--;
    let storedCities = JSON.parse(localStorage.getItem("cities"));
    for(let i = 0; i < storedCities.length; i++){
        if(storedCities[i][0] == cityName){
            storedCities.splice(i, 1);
            for(let j = i; j < storedCities.length; j++){
                storedCities[j][1] = String(Number(storedCities[j][1]) - 1);
            }
            break;
        }
    }

    localStorage.setItem('cities', JSON.stringify(storedCities));
    location.reload();
}