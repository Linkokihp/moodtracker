function setup() {

    //Remove Canvas
    noCanvas()
    //Capture video from webcam
    const video = createCapture()
    video.parent('main-container')
    video.size(320, 240)

    let lat, lon, city, weather, description, aqi, air
    //Geo-locate
    // console.log(navigator)
    if( 'geolocation' in navigator ) {
        navigator.geolocation.getCurrentPosition(async position => {

            try{
                // console.log(position)
                //We have lovation from user
                lat = position.coords.latitude
                lon = position.coords.longitude

                const apiUrlWeather = `weather/${lat},${lon}`

                const response = await fetch(apiUrlWeather)
                const json = await response.json()
                // console.log(json)

                city = json.weather.name
                weather = json.weather.main.temp
                description = json.weather.weather[0].description
                aqi = json.aqi

                const template = 
                `
                <div class="more_info">
                    <div class="weatherDis">
                        <div>
                            <div class="temp">${weather}</div>
                            <div class="summary">${description}</div>
                        </div>
                    </div>
                    <div>
                        <p class="location" title="${lat},${lon}">${city}</p>
                    </div>
                    <div class="weatherAQI">
                        <div>
                            <div class="aqi">${aqi}</div>
                        </div>
                    </div>
                </div>
                `

                const weatherDiv = document.createElement('div')
                weatherDiv.innerHTML = template
                document.querySelector('main').append(weatherDiv)
            } catch(error) {
                console.error(error)
            }
        })
    } else {
        console.error('Geolocation is not available in this browser')
    }

    //If user clicks button

    document.querySelector('button').addEventListener('click', async e => {
        e.preventDefault()

        // Get mood from user input
        const mood = document.querySelector('input').value
        video.loadPixels()
        const image64 = video.canvas.toDataURL()
        // Save other objects
        const location = {}
        const weather_status= {}
        const mood_info = {}
        // Mood data
        mood_info.mood = mood
        mood_info.face = image64
        // Location Data
        location.latitude = lat
        location.longitude = lon
        location.city = city
        // Weather Data
        weather_status.summary = weather.summary
        weather_status.temperature = weather.temperature

        const data = {
            city,
            weather,
            description,
            aqi,
            location,
            mood_info,
            weather_status,
            air
        }

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }

        //Send data to API endpoint
        const response = await fetch('/api', options)
        const json = await response.json()

        console.log(json)
    })
}