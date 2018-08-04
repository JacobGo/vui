'use strict';
const express = require('express')
const proxy = require('express-http-proxy');
const app = express()
var port = 8080;
if (process.argv.length > 2) {
  port = process.argv[2]
}
const io = require('socket.io').listen(app.listen(port, function () {
  console.log('VUI app listening on port',port)
}))
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const validator = require("email-validator")
const json2csv = require('json2csv')
const request = require('request');

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const url = 'mongodb://localhost:27017'
const dbName = 'vui-emails'
const assert = require('assert')
const nodemailer = require('nodemailer');

const auth = require('http-auth')

var db
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err)
  console.log("Connected successfully to server");
  db = client.db(dbName)
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/plyr', express.static(__dirname + '/node_modules/plyr/dist/'))

app.get('/', function (req, res) {
  res.render('index')
})

app.get('/pricing', function (req, res) {
  res.render('pricing')
})

app.get('/platform',  function (req, res) {
  res.render('platform')
})

app.get('/about', function (req, res) {
  db.collection('team').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('about', {members: result})
  })
})
app.get('/about-edit', function (req, res) {
  db.collection('team').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('team-edit', {members: result})
  })
})

app.post('/about-edit/new', urlencodedParser, function(req, res) {
  db.collection('team').save(req.body, (err,results) => {
    if (err) return console.log(err)
    else res.redirect('/about-edit');
  })
})
app.post('/about-edit/update', urlencodedParser, function(req, res) {
  var id = req.body._id;
  delete req.body._id;
  db.collection('team').update({"_id": ObjectID(id)}, req.body, (err,results) => {
    if (err) return console.log(err)
    else    res.redirect('/about-edit');
  })
})  
app.post('/about-edit/delete', urlencodedParser, function(req, res) {
  db.collection('team').remove({"_id": ObjectID(req.body._id)}, (err,results) => {
    if (err) return console.log(err)
    else   res.redirect('/about-edit');
  })
})

app.get('/legal', function (req, res) {
  res.render('legal')
})



app.get('/emails', function(req,res){
  db.collection('emails').find().toArray((err, result) => {
    if (err) return console.log(err)
    res.render('emails.ejs', {emails: result})
  })
})
app.get('/emails/download', function(req,res){
  db.collection('emails').find().toArray((err, result) => {
    if (err) return console.log(err)
    for (var i = 0; i < result.length; i++){
      console.log(result[i].name)
      if (result[i].name == '' || result[i].name == null || result[i].name == undefined) { result[i].name = "N/A" }
      console.log(result[i].name)
      
    }
    var fields = ['email', 'time', 'name', 'company'];
    var fieldNames = ['Email', 'Time', 'Name', 'Company'];
    var data = json2csv({ data: result, fields: fields, fieldNames: fieldNames });
    res.attachment('vui_emails.csv');
    res.status(200).send(data);
  })
})
io.on('connection', function (socket) {
  socket.on('clean', function (data) {
    db.collection('emails').find()
    .forEach(function(email){
      if (!validator.validate(email.email)){
        db.collection('emails').deleteOne({_id: email._id}, (err, result) =>{
          socket.emit('removed', email.time)
        })
      }
      else socket.emit('allowed', email.time)
    })
  })
})
var ejs = require('ejs')
var Recaptcha = require('express-recaptcha');
var recaptcha = new Recaptcha('6LdC-EIUAAAAAKsZeao_5c-kpsUw2kf7eopmLXFD', '6LdC-EIUAAAAAHFMoBz-XQUqAFxRLyo1hxYKosGQ')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post('/', recaptcha.middleware.verify, function (req, res) {
  let email = req.body.email;
  let name = req.body.name;
  let company = req.body.company;
  console.log(email,name,company)
  let time = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
  res.render('thanks', {
    name: name,
    email: email
  });
  if (!req.recaptcha.error){
    if (validator.validate(email)){
      ejs.renderFile(__dirname + "/views/mail.ejs",
          { email : email,
            name: name
          },
          function(err, data){
            if (err) console.log(err)
            const mailOptions = {
              from: 'VUI Team',
              to: email,
              subject: 'Welcome to VUI',
              html: data
            };
            // transporter.sendMail(mailOptions, function(err, data){
            //   (err) ? console.log(err) : console.log(data)
            // })
        })
    }
  
    db.collection('emails').save({
      email:email,
      name: name,
      company: company,
      time:time
    }, (err,results) => {
      if (err) return console.log(err)
      else console.log(email + ' saved to database')
    })
  } 
  
})
