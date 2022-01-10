const express = require('express');
require('dotenv').config();
const app = express();
const bodyParser = require('body-parser');
const BookController =require('./Routes/BookRoutes');
const AccountRouters =require('./Routes/AccountRoutes');
// app.use(express.json());

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', parameterLimit: 100000, extended: true}));

const cors = require("cors")
app.use(cors());

 app.use('/books', BookController);
app.use('/users', AccountRouters)


app.listen(process.env.PORT || '3000' , ()=>{
  console.log(`server running on port : ${process.env.PORT}`);
});

module.exports = app; 