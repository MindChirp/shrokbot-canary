const fs = require("fs-extra");
const path = require("path");








const dbHandler = {
    functions: {
        create: function(title, type) {
            return new Promise((resolve, reject)=>{

                //Create column
                var meta = this.header;
                if(typeof title != "string") reject(new Error("Column title is not a string"));

                if(type != "number" && type != "string" && type != "boolean" && type != "object") {type = "string"} //Set default
                
                var obj = {
                    title: title,
                    type: type,
                    values: []
                }

                //get the database file

                fs.readFile(path.join(meta.path, meta.dbname + ".json"), "utf8")
                .then(res => JSON.parse(res))
                .then(file=>{
                    file.columns.push(obj);
                    fs.writeFile(path.join(meta.path, meta.dbname + ".json"), JSON.stringify(file, null, 4))
                    .then(()=>{
                        resolve();
                    })
                    .catch((err)=>{
                        reject(err);
                    })
                })
            })
        },

        insert: function(value=Object) {
            return new Promise(async(resolve, reject)=>{
                //Insert into created column
                var meta = this.header;
                //Get the database file
                try {
                    var db = JSON.parse(await fs.readFile(path.join(meta.path, meta.dbname + ".json"), "utf8"));
                } catch (error) {
                    reject(error);      
                }

                //Get the column
                //Check if the columns exist!
                var keys = Object.keys(value);
                var x;
                //Check if any of the column names do not exist in the database
                for(let i = 0; i < db.columns.length; i++) {
                    if(!keys.includes(db.columns[i].title)) {reject(new Error("Column not found!")); return;};
                }

                //Check if all the object keys exist as well
                var x;
                for(x of keys) {
                    var obj = db.columns.find(y => y.title === x);
                    if(obj == undefined) {reject(new Error("Column " + x + " not found!")); return;};
                }


                var x;
                for(x of db.columns) {
                    var title = x.title;
                    //Get the corresponding value in the input object
                    var val = value[title];
                    if(typeof val != x.type) {reject(new Error("Value type not corresponding to column value type")); return;}
                    
                    //Get the highest index value in column



                    var index;
                    if(x.values.length > 0) {
                        index = x.values.reduce((a,b)=>a.index>b.index?a:b).index + 1;
                    } else {
                        index = 0;
                    }
                    var object = {
                        index: index,
                        value: val
                    }

                    x.values.push(object);
                }
                
                

                //Save to database file

                fs.writeFile(path.join(meta.path, meta.dbname + ".json"), JSON.stringify(db, null, 4))
                .then(()=>{
                    resolve();
                })
                .catch(err=>{
                    reject(err);
                })
            })
        },

        select: function(colName, value) {
            return new Promise(async (resolve, reject)=>{
                if(typeof colName != "string") {reject(new Error("Incorrect column name")); return;}
                //Select / get values from existing column matching query
                var meta = this.header;
                try {
                    var db = JSON.parse(await fs.readFile(path.join(meta.path, meta.dbname + ".json"), "utf8"));
                } catch (error) {
                    reject(new Error("Could not find database"));
                    return;
                }


                //Find the object and its corresponding index
                if(colName == "*") {
                    var res = db.columns;
                    resolve(res);
                } else {
                    var arr;
                    try {
                        arr = db.columns.find(y => y.title === colName).values;
                    } catch (error) {
                        reject(new Error("Could not find column"));
                        return;
                    }
                    
                    var foundIndicies = [];

                    var x;
                    for(x of arr) {
                            if(x.value == value) {foundIndicies.push(x.index)}    
                    }

                    if(foundIndicies.length < 1) {resolve([])} //Resolve with empty array if no values are found

                    var result = [];

                    //Go through every column, and get the value with the correct index
                    var x;
                    for(x of db.columns) {
                        var y;
                        for(y of x.values) {
                            if(foundIndicies.includes(y.index)) {
                                //Return this value
                                result.push(y.value);
                            }
                        }
                    }

                    resolve(result);
            
                }

            })
        },
        update: (values=Object)=>{
            return "Hey! This function isn't done yet!";
        },
        wipe: function() {
            return new Promise(async (resolve, reject)=>{
                var meta = this.header;
                try {
                    var db = JSON.parse(await fs.readFile(path.join(meta.path, meta.dbname + ".json"), "utf8"));
                } catch (error) {
                    console.log(error);
                    reject(new Error("Could not find database"));
                    return;
                }

                //remove all entries with index
                var x;
                for(x of db.columns) {
                    x.values = [];
                }

                //Save to the database again
                try {
                    await fs.writeFile(path.join(meta.path, meta.dbname + ".json"), JSON.stringify(db, null, 4), "utf8");
                    resolve();
                } catch (error) {
                    reject(error);
                }
            })
        },
        delete: function(key, value){
            return new Promise(async (resolve, reject)=>{
                var meta = this.header;
                try {
                    var db = JSON.parse(await fs.readFile(path.join(meta.path, meta.dbname + ".json"), "utf8"));
                } catch (error) {
                    console.log(error);
                    reject(new Error("Could not find database"));
                    return;
                }


                //Go through every column, check for key-value pair

                var removeIndex;
                let tempDb = JSON.parse(JSON.stringify(db));
                //Clear all the values from the tempDb except from meta
                var x;
                for(x of tempDb.columns) {
                    x.values = [];
                }


                //console.log("TempDB", tempDb);

                var cols = db.columns;
                var x;
                for(x of cols) {
                    var y;
                    for(y of x.values) {
                        //Go through each and every column, and every key in that column
                        if(x.title == key && y.value.videoId == value.videoId) {
                            //This is the thing
                            removeIndex = y.index;
                            break;
                        }
                    }
                }

                console.log(removeIndex);


                //Add correct values to tempDb
                for(let i = 0; i < db.columns.length; i++) {
                    for(let k = 0; k < db.columns[i].values.length; k++) {
                        if(db.columns[i].values[k].index != removeIndex) {
                            //Copy over to tempDb
                            //console.log(db.columns[i].values[k]);
                            tempDb.columns[i].values.push(db.columns[i].values[k]);
                        }
                    }
                }


                console.log(db.columns[1], tempDb.columns[1]);

                db = tempDb;

                try {
                    await fs.writeFile(path.join(meta.path, meta.dbname + ".json"),JSON.stringify(tempDb, null, 4), "utf8");
                    resolve();
                } catch (error) {
                    console.log(error);
                    reject();
                }

                //console.log("FILLED TEMPDB", tempDb);

            })
        }
    },
    create: (name, dbpath) => {
        //Create database
        if(typeof name != "string") return(new Error("Name is not a string!"));
        return new Promise((resolve, reject)=>{            
            const dbTemplate = {
                columns: [],
                type: "MINDBASE"
            }


            fs.writeFile(path.join(dbpath, name + ".json"), JSON.stringify(dbTemplate))
            .then(()=>{
                const db = {
                    header: {
                        path: dbpath,
                        dbname: name
                    },
                    CREATE: dbHandler.functions.create,
                    INSERT: dbHandler.functions.insert,
                    SELECT: dbHandler.functions.select,
                    WIPE: dbHandler.functions.wipe,
                    DELETE: dbHandler.functions.delete
                }
                resolve(db)
            })
        })
    },
    get: async (dbpath, name)=>{
        return new Promise(async(resolve, reject)=>{

            //Get the database, and return database object!
            try {
                var db = JSON.parse(await fs.readFile(path.join(dbpath, name + ".json"), "utf8"));
            } catch (error) {
                reject(new Error("Could not find database"));
                return;
            }

            if(!db.type) {
                reject(new Error("No such database exists!"));
                return;     
            }

            const obj = {
                header: {
                    path: dbpath,
                    dbname: name
                },
                CREATE: dbHandler.functions.create,
                INSERT: dbHandler.functions.insert,
                SELECT: dbHandler.functions.select,
                WIPE: dbHandler.functions.wipe,
                DELETE: dbHandler.functions.delete
            }

            resolve(obj);
        })
    },
    drop: (dbpath, name) => {
        return new Promise(async (resolve, reject)=>{
            //First check that this file is indeed a database, so that this function cannot be used to delete any file
            try {
                var db = JSON.parse(await fs.readFile(path.join(dbpath, name + ".json"), "utf8"));
            } catch (error) {
                reject(new Error("This database does not exist (" + name + ")"));
                return;
            }

            if(db.type == "MINDBASE") {
                //this is indeed a database
                unlinkDB();
            }

            async function unlinkDB() {
                try {
                    await fs.unlink(path.join(dbpath, name + ".json"));
                } catch (error) {
                    reject(new Error("Could not remove database"));
                    return;
                }

                resolve();
            } 
        })
    }
}

module.exports = { dbHandler };
