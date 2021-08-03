const express = require('express')
const Datastore = require('nedb')
const fetch = require('node-fetch')
require('dotenv').config()

const app = express();
const port = process.env.PORT || 3004 //process.env.PORT place where envirement variables are saved

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
})

app.use(express.static('public'));

//* Limit JSON size */
app.use(express.json({
  limit: '1mb'
}))

//define and load database
const database = new Datastore('database/database.db')
database.loadDatabase()

//Database API (GET/read)
app.get('/api', (req, res) => {
  //Send the information from db to client
  database.find({}, (err, data) => {
      if(err) {
          console.error(err)
          res.end()
      }
      //send data to client
      res.json(data)
  })
})

//Database API
app.post('/api', (req, res) => {
    //Send information to the database
    console.log('Database post endpoint got a request')
    const data = req.body
    const timestamp = Date.now()
    data.timestamp = timestamp
    database.insert(data)
    res.json(data)
})



//Weather and  AQI API Endpoint
app.get('/weather/:latlon', async (req, res) => {
    const latlon = req.params.latlon.split(',')
    const lat = latlon[0]
    const lon = latlon[1]
    // console.log(lat, lon)

    //API Key to OPENWEATHER from .env
    const apiKeyWeather = process.env.API_KEY_WEATHER
    const apiKeyAQI = process.env.API_KEY_AQI

    //Request for weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKeyWeather}`
    const weatherResponse = await fetch(weatherUrl)
    const weatherJson = await weatherResponse.json()
    // console.log(weatherJson)

    //Request for AQI
    const aqiUrl = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKeyAQI}`
    const aqiResponse = await fetch(aqiUrl)
    const aqiJson = await aqiResponse.json()
    console.log(aqiJson)


    const data = {
        weather: weatherJson,
        aqi: aqiJson
    }

    res.json(data)
})


