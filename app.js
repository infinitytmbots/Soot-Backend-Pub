
// Importing Modules

const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const qdb = require('discortics.db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {DateTime} = require('luxon');

// Declaring Variables, Constants & Functions

let database = {};
var corsOptions = {
    origin: '*',
    // credentials: true,
    optionsSuccessStatus: 200
};
let salt = process.env.SALT;
// Importing Basic Middleware

const app = express();
app.set('etag', false);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('[:date[clf]] :status || ":method :url HTTP/:http-version" || ":referrer" ":user-agent"'));
app.use(helmet());
app.use(cors(corsOptions));
var http = require('http').Server(app);

app.post("/signin", async (req, res) => {
    if(!req.body.username || !req.body.password) return res.status(403).json({ status:403, message:"Authorization Required" });
    let fetched = await database.user.table.findOne({ username: req.body.username});
    if(!fetched) return res.status(503).json({ status:503, message:"Unknown User" });
    let result = await bcrypt.compare(req.body.password, fetched.password);
    if(!result) return res.status(503).json({ status:503, message:"Unknown User" });
    let token = jwt.sign({ token: fetched.userID }, salt, { expiresIn:'7d' });
    res.status(200).json({ status:200, message:"Successful", token });
});

console.log(`[${DateTime.local().toFormat('D HH:mm:ss.u')}] Starting Server`);
qdb.connect(process.env.DATABASE).then(async () => {
    console.log(`[${DateTime.local().toFormat('D HH:mm:ss.u')}] Connected to Database`);
    database.user = await new qdb.table('user');
    //start server
    server = http.listen(3001, () => {
        console.log(`[${DateTime.local().toFormat('D HH:mm:ss.u')}] Server is Ready. Listening to Port ${server.address().port}`);
    });
});