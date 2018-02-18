'use strict';

const express = require('express');
const elasticsearch = require('elasticsearch')
const fs = require('fs');
const getDist = require('./util');
const ping = require('ping');


var client  = new elasticsearch.Client({
    host: 'es:9200',
});


// Insert all the pubs into the db
//client.indices.delete({ index: 'pubs' }).then(() => {

client.indices.exists({ index: 'pubs' }).then((indexExists) => {
    if (indexExists) {
        console.log("Pubs index already exists...");
        return;
    }

    console.log("Creating index...");

    client.indices.create({
        index: 'pubs',

        body: {
            mappings: {
                pub: {
                    properties: {
                        name:       { "type": "text"  },
                        address:    { "type": "text"  },
                        postcode:   { "type": "text"  },
                        location:   { "type": "geo_point"},
                        rating:     { "type": "integer" },
                        pricePence: { "type": "integer" },
                    }
                }
            }
        }
    }).then(_ => {

        console.log("Creating bulk insert query...");

        // Insert the pub data
        const pubsData = require('../data/open_pubs.json');
        const bulkReq = pubsData.map((rawPub, i) => {
            const pubDoc = {
                name: rawPub.name,
                address: rawPub.address,
                postcode: rawPub.postcode,
                location: rawPub.latitude + "," + rawPub.longitude,
                rating: null,
                pricePence: null,
            }

            return [
                { index: { _index: 'pubs', _type: 'pub', _id: i } },
                pubDoc
            ];

        }).reduce((a, b) => a.concat(b) );

        console.log("Beginning data insert...");

        client.bulk({
            body: bulkReq,
        }).then(_ => {
            console.log("Data added to database!");
        })
            .catch(err => {
                console.log(err);
                process.exit(1);
            });


    }).catch(err => {
        console.log("Error creating index in elasticsearch db");
        console.log(err);
        process.exit(1);
    });

});

//}); // delete

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
    res.send('PintNow server 0.0.1');
});

app.get('/pubs', (req, res) => {
    var lat = req.query.lat;
    var lon = req.query.lon;
    var num = req.query.num || 25;

    res.set('Access-Control-Allow-Origin', '*')


    if (!lat || !lon || !num) {
        return res.status(400).send({ error: "please supply lat, lon and num variables" });
    }

    try {
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        num = parseInt(num);
    } catch (e) {
        console.log(e);
        return res.status(400).send({ error: "type error: lat and lon are floats and num is an integer" });
    }


    if (num > 500) {
        return res.status(400).send({ error: "num must be under 500" });
    }

    // Fetch the data from the database
    client.search({
        index: 'pubs',
        size: num,
        body: {
            sort: [
                {
                    _geo_distance: {
                        location: { lat, lon },
                        order: "asc",
                        unit: "km", 
                        distance_type: "plane" 
                    }
                }
            ]
        }
    })
    .then((resp) => {
        res.send(resp.hits.hits.map(h => {
            h._source.id = h._id;
            try {
            var lat2 = parseFloat(h._source.location.split(',')[0]);
            var lon2 = parseFloat(h._source.location.split(',')[1]);
            } catch(e) {
                console.log(e);
            }

            h._source.distance = getDist(lat, lon, lat2, lon2);

            return h._source;
        }));
    })
    .catch(error => {
        res.send({ error });
    });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);

