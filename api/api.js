const bodyParser = require("body-parser");
const express = require("express");

const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const mongoose = require("mongoose");

module.exports = { checkForApiKey };

const { guildTokenSchema } = require("./api-models");

const app = express();

//Connect database
/* main().catch(err => {
    console.log(err);
    state = "database disconnected"
});
 */
//pass: 0zwG5ZbB1VCf3xBa
const pass = "0zwG5ZbB1VCf3xBa";
mongoose.connect(`mongodb+srv://shrokbot:${pass}@shrokbot.omeyr.mongodb.net/shrokbot?retryWrites=true&w=majority`, {useNewUrlParser: true});
mongoose.connection
    .once("open", ()=>{console.log("Database connected");})
    .on("error", (error)=>{
        console.log(error);
        state = "Database disconnected";
    })

//const schema = new mongoose.Schema(guildTokenSchema);
function createToken() {
    const Server = mongoose.model("ServerToken", {guildId: String, guildToken: String});
    const test = new Server({guildId: "263300337320853505", guildToken:"1234"});
    test.save().then(async ()=>{
        console.log("OK")
        var servs = await Server.find({guildId: "263300337320853505"}).exec();
        console.log(servs);
    });
}


function checkForApiKey(guildId) {
    return new Promise(async (resolve, reject)=>{
        if(!guildId) reject("No guild id provided");
        console.log(mongoose.connection.readyState);
        //if(mongoose.connection.readyState != 1) reject("Database not connected");
        
        //Search the mongoose database
        var keys = await Server.find({guildId:guildId.toString()});
        console.log(keys);
        if(keys.length > 0) reject("Key already exists");


        resolve();
    })
}


app.use(bodyParser.urlencoded({extended: true}));
app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

var state = "online"; //"maintenance" etc..

//set up routes
app.get("/status", (req, res)=>{
    var obj = {
        state: state
    }

    console.log("REQUEST")

    res.status(200);
    res.send(JSON.stringify(obj));
})


app.post("/play-song", (req, res)=>{
    var body = req.body;
    
    var videoUrl = body.songUrl || undefined;
    var creator = body.creator || undefined;
    var guildToken = body.guildToken || undefined;

    var errorObj = {
        messages: []
    }


    if(!videoUrl) {
        //Did not go well, return error 
        res.status(400);
        errorObj.messages.push({message: "No video url was present"});

        res.send(obj);
        return;
    }

    if(!guildToken) {
        res.status(401)
        errorObj.messages.push({message: "No guild token is present. There must be one present to play a song."})
    }

    if(errorObj.messages) {
        res.send(errorObj);
        return;
    }



    //Play song
    console.log("Playing ", videoUrl);

    res.sendStatus(200);
})


app.get("/guild-queue", (req, res)=>{
    var body = req.body;


})



var server = app.listen(8080, function(err) {
    if(err) return;
    var host = server.address().address || "unknown";
    var port = server.address().port || "unknown";

    console.log("Shrokbot API listening at http://%s:%s", host, port);
})