const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();

// Show url (nginx issue)
app.use(function (req, res, next) {
    console.log(req.method + ' ' + req.url);
    next();
});

app.get('/ping', function (req, res) {
    return res.send('pong');
});

app.use(express.static(path.join(__dirname, "admin")));
app.get('/admin/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});


// app.use(express.static(path.join(__dirname, "place")));
// app.get('/estabelecimento/*', function (req, res) {
//     res.sendFile(path.join(__dirname, 'place', 'index.html'));
// });

app.listen(process.env.PORT || 8080);
