import endpoint from "./Const";
//setting up the database
var mongoose = require('mongoose');
var mongoDB = endpoint.BOT_DB_URL;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
//Get the default connection
var db = mongoose.connection;

export default db