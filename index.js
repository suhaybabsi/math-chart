var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/app'));

app.get('/', function (request, response) {
  res.render('404', { url: req.url });
});

app.get('/add', function (request, response) {

  var q = request.query;

  let no1 = q.no1;
  let no2 = q.no2;
  let result = Number(no1) + Number(no2);

  response.send("Result: " + result);
});

app.get('/multiply', function (request, response) {

  var q = request.query;

  let no1 = q.no1;
  let no2 = q.no2;
  let result = Number(no1) * Number(no2);

  response.send("Result: " + result);
});

app.get('/divide', function (request, response) {

  var q = request.query;

  let no1 = q.no1;
  let no2 = q.no2;
  let result = Number(no1) / Number(no2);

  response.send("Result: " + result);
});

app.get('/subtract', function (request, response) {

  var q = request.query;

  let no1 = q.no1;
  let no2 = q.no2;
  let result = Number(no1) - Number(no2);

  response.send("Result: " + result);
});


app.listen(app.get('port'), function () {
  console.log('Math-chart is running on port', app.get('port'));
});
