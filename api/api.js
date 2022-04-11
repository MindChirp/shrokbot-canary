var express = require("express");
var app = express();


//set up routes
var server = app.listen(8080, function() {
    var host = server.address().address || "unknown";
    var port = server.address().port || "unknown";

    console.log("Shrokbot API listening at http://%s:%s", host, port);
})


const state = "online"; //"maintenance" etc..


app.get("/status", (req, res)=>{
    var obj = {
        state: state
    }

    console.log("REQUEST")

    res.status(200);
    res.send(JSON.stringify(obj));
})