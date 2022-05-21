function interpretQuery(query) {
    if(query.header == "CLIENT-CATCHUP") {
        //The client has probably just connected, and wants to be informed of everything going on
    } else if(query.header == "???") {
        //???
    }
}

module.exports =  { interpretQuery };