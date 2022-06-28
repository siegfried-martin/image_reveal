var connection

function connect(token) {
    connection = new Connection(token);
    //connection.sendMessage("new message");
}

function sendMessage(message) {
    connection.sendMessage(message)
}

class Connection {
    constructor(token) {
        this.token = token;
        this.baseUrl = "ws://68.60.89.135";
        this.port = "40000";
        this.socket = null;
        this.openConnection()
    }

    getUrl(){
        //return this.baseUrl+":"+this.port+"?token="+this.token;
        //return this.baseUrl+":"+this.port;
        return "ws://68.60.89.135:40000"
    }

    openConnection(){
        this.socket = new WebSocket(this.getUrl());

        this.socket.onopen = function(test) {
            console.log("opening websocket", test);
            connection.sendMessage("hi");
        };

        this.socket.onclose = function() {
            console.log("connection closed");
        };

        this.socket.onmessage = function(event) {
            console.log("received message")
            console.log(event.data)
        }
    }



    sendMessage(message) {
        var data = {
            "message": message
        };
        this.socket.send(JSON.stringify(data))
    }
}