const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

//conectar mongoDB
mongo.connect('mongodb://127.0.0.1/chatsocket', { useNewUrlParser: true } , function(err, db) {
    if (err) {
        throw err;
    }else{
        console.log('MongoDB Conectando...');
    }
    //conectando Socket.io
    client.on('connection', function(socket) {
        let chat = db.db('chatsocket').collection ('mensaje');

        sendStatus = function(s) {
            socket.emit('status', s);
        }
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res) {
            if (err) {
                throw err;
            }

            socket.emit('output', res);
        });
        socket.on('input',function (data) {
            let name = data.usuario;
            let message = data.mensaje;

            if(name =='' || message == ''){
                sendStatus('Por favor ingrese un usuario y/o mensaje');
            }else{
                chat.insertMany({usuario:name,mensaje:message}, function() {
                    client.emit('output', [data]);

                    //sendStatus({
                        //message : 'mensaje enviado',
                        //clear:true
                   // });
                });
            }
        });

        socket.on('clear', function(data) {
            chat.remove({}, function () {
                socket.emit('cleared');
            });
        });
    });
});