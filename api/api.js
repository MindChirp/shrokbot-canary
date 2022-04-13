const bodyParser = require("body-parser");
const express = require("express");

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const EventEmitter = require("events");

const mongoose = require("mongoose");
const databaseHandler = require("./database");

const { guildTokenSchema } = require("./api-models");
//const { playVideoFromUrl1 } = require("../bot");


function startApi() {

    const app = express();

    //Create a custom event emitter
    const eventEmitter = new EventEmitter();
    //pass: 0zwG5ZbB1VCf3xBa


    //const schema = new mongoose.Schema(guildTokenSchema);
    /* function createToken() {
        const test = new Server({guildId: "263300337320853505", guildToken:"1234"});
        test.save().then(async ()=>{
            console.log("OK")
            var servs = await Server.find({guildId: "263300337320853505"}).exec();
            console.log(servs);
        });
    } */



    app.use(bodyParser.urlencoded({extended: true}));
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(cors());
    app.use(morgan('combined'));



    //set up routes
    app.get("/status", (req, res)=>{
        var obj = {
            state: "Online"
        }

        res.status(200);
        res.send(JSON.stringify(obj));
    })


    app.post("/play-song", async (req, res)=>{
        var body = req.body;
        
        var videoUrl = body.songUrl || undefined;
        var videoTitle = body.songTitle || undefined;
        var creator = body.creator || undefined;
        var guildToken = body.guildToken || undefined;


        if(!videoTitle) {
            //Did not go well, return error 
            res.status(400);
            res.send("No video title present")
        }

        if(!videoUrl) {
            //Did not go well, return error 
            res.status(400);
            res.send("No video url present")
        }

        if(!guildToken) {
            res.status(400)
            res.send("No guild token is present. There must be one present to play a song.")
        }

        //Check if the guild token is valid
        try {
            var entry = await databaseHandler.checkForGuildId(guildToken); //Return guild id
        } catch (error) {
            entry = error;
        }
        if(entry == "Does not exist") {
            //This guild token is not valid
            res.status(401)
            res.send("No valid guild token is present");
        }



        //Play song
        console.log("Playing ", videoUrl);

    /*
        //Get the guild
        if(!client.guilds.cache) return;
        var guild = client.guilds.cache.get(entry);
        if(guild) {
            console.log(guild);
        }*/

        //Emit an event
        //eventEmitter.emit("api-song-play", {url: videoUrl, title: videoTitle, guildId: entry});
        var { client } = require("../botStart");
        var client = client.client;
        var guild = client.guilds.cache.get(entry);
        console.log(guild.voice);

        res.status(200);
        res.send();
    })


    app.get("/guild-queue", (req, res)=>{
        var body = req.body;


    })

    app.post("/authenticate", async (req, res)=>{
        var body = req.body;

        var guildToken = body.guildToken;
        //Check with the database
        databaseHandler.checkForGuildId(guildToken)
        .then(()=>{
            res.status(200);
            res.send();
        })
        .catch((err)=>{
            if(err == "Does not exist") {
                res.status(401);
                res.send();
            }
        })
    })



    var server = app.listen(8080, function(err) {
        if(err) return;
        var host = server.address().address || "unknown";
        var port = server.address().port || "unknown";

        console.log("Shrokbot API listening at http://%s:%s", host, port);
    })

}


module.exports = { startApi };