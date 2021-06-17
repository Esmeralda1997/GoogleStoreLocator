const express = require('express')
const mongoose = require('mongoose')
const axios = require('axios')

const app = express()
const port = 3000

const Store = require('./api/models/store')
const GoogleMapsService = require('./api/services/googleMapsService')
const googleMapsService = new GoogleMapsService()

require('dotenv').config();

app.use(function(req, res, next){
  res.header('Access-Control-Allow-Origin', "*");
  next();
})

app.use(express.json({limit: '50mb'}));

//handles post requests
app.post('/api/stores', (req, res) => {
    let dbstores = [];
    let stores = req.body;

    //gets specific parts from the input/request and stores in new array called dbstores
    stores.forEach((store) => {
      dbstores.push({
        storeName: store.name,
        phoneNumber: store.phoneNumber, 
        address: store.address,
        openStatusText: store.openStatusText, 
        addressLines: store.addressLines,
        location: {
          type: 'Point', 
          coordinates: [
            store.coordinates.longitude,
            store.coordinates.latitude
          ]
        } 
      })
    });

    //creates an object with the dbstores array
    //output dbstores or an error
    Store.create(dbstores, (err, dbstores) => {
      //check if there was an error when you created the data with the dbstores array
      if(err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(dbstores);
      }
    })

})

app.get('/api/stores', (req, res) => {
  const zipCode = req.query.zip_code;

  googleMapsService.getCoordinates(zipCode)
  .then((coordinates) => {
    Store.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates
          }, 
          $maxDistance: 3218
        }
      }
    }, (error, stores) =>{
      if(error){
        res.status(500).send(error);
      } else {
        res.status(200).send(stores);
        console.log(stores);
      }
    });
  }).catch((error)=>{
    console.log(error);
  });

})

app.delete('/api/stores', (req, res) => {
  Store.deleteMany({}, (err)=>{
    res.status(200).send(err);
  })
})

mongoose.connect('mongodb+srv://coralEsme:H4mE4NJxCVZwXNlz@cluster0.av9g0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
