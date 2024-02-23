const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const connectedUsers = new Map();

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/views/login.html');
});

app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/public/views/index.html');
});

io.on('connection', (socket) => {
    console.log('Connected to the socket.io...');
    
    socket.on('login', (name, acknowledgmentCallback) => {
        console.log(`${name} đã đăng nhập.`);
        connectedUsers.set(socket.id, name);
        io.emit('update-user-list', Array.from(connectedUsers.values()));
        console.log(Array.from(connectedUsers.values()))
        acknowledgmentCallback('success');
    });
    

    socket.on('on-chat', (data) => {
        const { name, message, file } = data;
        console.log('Received chat data:', data);

        // Broadcast the message to all connected clients
        if (file) {
            io.emit('user-chat', { name, message, file });
        } else {
            // Regular text message without file
            io.emit('user-chat', { name, message });
        }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
        const disconnectedUser = connectedUsers.get(socket.id);
        if (disconnectedUser) {
            console.log(`${disconnectedUser} đã đăng xuất. Reason: ${reason}`);
            connectedUsers.delete(socket.id);
            // Notify all clients to update the user list
            io.emit('update-user-list', Array.from(connectedUsers.values()));
        }
    });
});

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});
