const express = require('express');
const path = require('path');
const app = express();

app.get('/ping', function (req, res) {
    return res.send('pong');
});

app.use(express.static(path.join(__dirname, "admin")));
app.get('/admin/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.use(express.static(path.join(__dirname, "place")));
app.get('/estabelecimento/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'place', 'index.html'));
});

app.use(express.static(path.join(__dirname, "portal")));
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'portal', 'index.html'));
});

function listen(port) {
    app.portNumber = port;
    app.listen(port, () => {
        console.log("server is running on port :" + app.portNumber);
    }).on('error', function (err) {
        if (err.errno === 'EADDRINUSE') {
            console.log(`----- Port ${port} is busy, trying with port ${port + 1} -----`);
            listen(port + 1)
        } else {
            console.log(err);
        }
    });
}

listen(process.env.PORT || 8080);

