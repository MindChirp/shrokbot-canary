const API = "https://api.genius.com/songs";
const SEARCH = "https://api.genius.com/search"
const ARTIST = "https://api.genius.com/artists"
const dotenv = require("dotenv");
const XMLHttpRequest = require("xhr2");
dotenv.config();

const maxSongNumber = 1000000;

const accessToken = process.env.GENIUSACCESSTOKEN;
const searchToken = process.env.GENIUSSEARCHTOKEN;

function getRandomInt(max) { //min: 0, max: max
    return Math.round(Math.random()*max);
}

function getRandom() {
    return new Promise((resolve, reject)=>{

        //console.log(getRandomInt(maxSongNumber));
        var xhr = new XMLHttpRequest();
        xhr.open("GET", API + "/" + getRandomInt(maxSongNumber) + accessToken);
        xhr.send();
        
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                //OK
                resolve(this.responseText);
            } else if(this.readyState == 4 && this.status != 200) {
                //console.log(this.responseText);
                reject(this.responseText);
            }
        }  
    })
}

function getByArtist(artist) {
    return new Promise((resolve, reject)=>{

        var artistName = artist.join(" ");
        getArtistId(artistName)
        .then(res=>{
            var xhr = new XMLHttpRequest();
            xhr.open("GET", ARTIST + "/" + res + "/songs" + accessToken);
            xhr.send();
            
            xhr.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200) {
                    //OK
                    var res = JSON.parse(this.responseText);
                    var len = res.response.songs.length;
                    var rand = Math.round(Math.random()*len);

                    var song = res.response.songs[rand];
                    resolve(song);

                } else if(this.readyState == 4 && this.status != 200) {
                    //console.log(this.responseText);
                    reject(this.responseText);
                }
            }
        })
    })
}


function getArtistId(artistName) {
    return new Promise((resolve, reject)=>{
        var xhr = new XMLHttpRequest();
        xhr.open("GET", SEARCH + "?q=" + artistName + "&" + searchToken);
        xhr.send();
        
        xhr.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                //OK
                if(!JSON.parse(this.responseText).response.hits[0]) {reject("Artist not found"); return;}
                resolve(JSON.parse(this.responseText).response.hits[0].result.primary_artist.id)
            } else if(this.readyState == 4 && this.status != 200) {
                reject(this.responseText);
            }
        }
    })
}

module.exports = { getRandom, getByArtist };