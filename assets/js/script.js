// set savedCities array to be empy 
var savedCities = [];

var savedCityEl = document.querySelector("#savedCities");

// set API urls as global variables
var forecastApi = "https://api.openweathermap.org/data/2.5/onecall?";
var currentApi = "https://api.openweathermap.org/data/2.5/weather?q=";

// set total days to 5 and temperature units to imperial
var totalDays = "&cnt=5";
var setTempUnit = "&units=imperial";


// saves searches to local storage 
var saveSearch = function (city) {
    if (!savedCities.includes(city)) {
        savedCities.push(city);
        localStorage.setItem("savedCities", JSON.stringify(savedCities));
    }


}

// displays a saved city if user clicks on it 
var savedCityButtonClick = function (event) {
    var city = event.target.getAttribute("search");

    if (city) {
        getCity(city);

        removeForecast();
    };
};

// displays saved city 
var setSavedCities = function () {
    $("#savedCities").empty();
    for (var i = savedCities.length - 1; i >= 0; i--) {
        var recentSearch = $("<li>")
            .addClass("p-2 old-search");
        var search = $("<button>")
            .addClass("button is-large is-link is-dark")
            .attr("search", savedCities[i])
            .text(savedCities[i]);
        recentSearch.append(search);
        $("#savedCities").append(recentSearch);
    }
};

// load savedCities from local storage 
var loadSavedCity = function () {

    savedCities = JSON.parse(localStorage.getItem("savedCities"));
    if (!savedCities) {
        savedCities = [];
    };

    setSavedCities();

}

// gets geo location of city based on user input 
var getCity = function (city) {
    var apiKey = "&appid=312bd3bcab3e029ce9a7fadd43d5e2e5";
    var cityName = city;
    $("#input-city").val("");
    removeForecast();


    fetch(currentApi + city + apiKey).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                forecast(city, data.coord);
                saveSearch(cityName);
                loadSavedCity();
            });
        } else {
            alert("Unable to find this city! Please try again.");
        }
    });
};

// gets the forecast of city coordinates 
var forecast = function (city, coordinates) {
    var apiKey = "&appid=312bd3bcab3e029ce9a7fadd43d5e2e5";
    fetch(
        forecastApi +
        "lat=" +
        coordinates.lat +
        "&lon=" +
        coordinates.lon +
        totalDays +
        setTempUnit +
        apiKey +
        "&exclude=minutely,hourly"
    ).then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
                displayForecast(city, data);
            });
        } else {
            throw new Error("Request failed, status: " + response.statusText);
        }
    });
};

// removes forecast data 
var removeForecast = function () {
    $("#today").remove();
    loadSavedCity();
};

// displays the forecast 
var displayForecast= function (city, data) {
    // display current date forecast 
    var currentDate = moment.utc(data.current.dt * 1000).format("MM/DD/YYYY");
    var newCity = city.charAt(0).toUpperCase() + city.slice(1);
    var currentDayForecastEl = $("<div>")
        .addClass("tile is-child notification is-info is-light has-text-black")
        .attr("id", "today");
    var cityEl = $("<span>").addClass("icon-text");
    var displayedCity = $("<span>").addClass("pt-1 title").text(newCity + "  (" + currentDate + ")");

    var currentTemp = $("<p>")
        .addClass("subtitle")
        .text("Current Temperature: " + data.current.temp + " °F");
    var currentWind = $("<p>")
        .addClass("subtitle is-5")
        .text("Current Wind Speed: " + data.current.wind_speed + " mph");
    var currentHumidity = $("<p>")
        .addClass("subtitle is-5")
        .text("Current Humidity: " + data.current.humidity + "%");
    var currentUV = $("<p>")
        .addClass("subtitle is-5")
        .text("Current UV Index: ");
    var uvIndex = $("<span>").addClass("tag")
        .text(data.current.uvi);

    // changes background color of UV EL when hovered depending on value returned 
    if (data.current.uvi <= 2) {
        uvIndex.addClass("UV-favorable");
    } else if (data.current.uvi < 6) {
        uvIndex.addClass("UV-moderate");
    } else if (data.current.uvi >= 6) {
        uvIndex.addClass("UV-severe");
    };

    var iconEl = $("<span>").addClass("icon is-large");
    var weatherIcon = $("<img>")
        .attr("src", "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png");
    iconEl.append(weatherIcon)
    cityEl.append(displayedCity, iconEl);
    currentUV.append(uvIndex);
    currentDayForecastEl.append(cityEl, currentTemp, currentWind, currentHumidity, currentUV);
    $("#forecast").append(currentDayForecastEl);

    // Create cards for 5 day forecast 
    var forecastEl = $("<article>")
        .addClass("level card is-ancestor has-background-info-dark");

    var forecastTitle = $("<div>")
        .addClass("title is-3 has-text-centered p-3")
        .text("5-Day forecast");

    $("#today").append(forecastTitle);

    // display 5 day forecast cards
    for (var i = 1; i < 6; i++) {
        var dateForecast = moment.utc(data.daily[i].dt * 1000).format("MM/DD/YYYY");
        var forecastedEl = $("<div>")
            .addClass("level-item has-text-centered tile is-parent ");
        var forecastContainerEl = $("<div>")
            .addClass("tile is-child box fCard");
        var dateForecast = $("<p>")
            .addClass("title is-5")
            .text(dateForecast);
        var weatherIcon = $("<img>")
            .attr("src", "http://openweathermap.org/img/wn/" + data.daily[i].weather[0].icon + "@2x.png");
        var weatherIconEl = $("<span>").addClass("pt-2 icon is-large");
        weatherIconEl.append(weatherIcon);
        var tempForecast = $("<p>")
            .addClass("pt-1 has-text-left")
            .text("Temp: " + data.daily[i].temp.day + " °F");
        var windForecast = $("<p>")
            .addClass("pt-1 has-text-left")
            .text("Wind: " + data.daily[i].wind_speed + " mph");
        var humidityForecast = $("<p>")
            .addClass("pt-1 has-text-left")
            .text("Humidity: " + data.daily[i].humidity + "%");

        // append all child elements to their parent elements 
        forecastContainerEl.append(dateForecast, weatherIconEl, tempForecast, windForecast, humidityForecast);
        forecastedEl.append(forecastContainerEl);
        forecastEl.append(forecastedEl);
        $("#today").append(forecastEl);

    }

};

// load all saved cities 
loadSavedCity();

// click event listener for search button 
$("#search-btn").on("click", function () {
    var city = $("#input-city").val();
    getCity(city);
});

// click event for saved city button
savedCityEl.addEventListener("click", savedCityButtonClick);

