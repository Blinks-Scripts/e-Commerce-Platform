// Require the express module
//const express = require('express');
// Import express and php-express modules
const express = require('express');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//set up email service
const { createTransport } = require('nodemailer');

const mailTransporter = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: "csci467partstore@gmail.com",
        pass: "16fJSgCGbF2kO0nV",
    },
});

const mysql = require('mysql');
var sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./partstore.db');


var phpExpress = require('php-express')({
  binPath: 'php' // Path to PHP binary
});

// Create an express app
var app = express();

// Set view engine to php-express
app.set('views', './views'); // Path to PHP files
app.engine('php', phpExpress.engine);
app.set('view engine', 'php');
app.use(express.json());
app.use('/employee', express.static(__dirname + '/employee'));


// Route requests to PHP files
app.all(/.+\.php$/, phpExpress.router);


// Define the port to run the server on
const port = 8081;

// Define a route for the root path of the server
app.get('/', function(req, res) {
  // Serve the index.html file
  res.sendFile(__dirname + '/index.html');
});

// Define a route for the /welcome.html path of the server
app.get('/welcome', function(req, res) {
  // Serve the index.php file
  res.sendFile(__dirname + '/welcome.html');
});

app.get('/reconcile', function(req, res) {
  console.log('recieved request at /reconcile \n');
  const con = mysql.createConnection({
    host: '131.156.224.116',
    user: 'student',
    password: 'student',
    database: 'csci467'
  });
    con.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL server: ' + err.stack);
      return;
    }
    console.log('Connected to MySQL server as id ' + con.threadId);
    con.query("SELECT number, description FROM parts", function (err, rows) {
    // check for error
      if (err){
       console.log(err);
      } else {
      // indicate that query was successful
      console.log('Queried all rows of parts');
      // send rows data as JSON array
      
      // indicate successful response of JSON string and show
      // the JSON string that was sent on the server console
      console.log('\n Sent all rows as JSON string\n');
      console.log(rows);
      
      var sql = db.prepare("INSERT INTO Parts (PartNum, ItemDescr) VALUES (?, ?)");
      for ( var i = 0; i < rows.length; i++ ) {
        (function(i) {
        sql.run(rows[i].number, rows[i].description, function(err) {
          // check for error on sql query
          if (err) {
            // status 500 indicates internal server error
            console.log(rows[i].description + " could not be added");
          } else {
            // status 200-299 means good
            console.log("success part #" + rows[i].number + " " + rows[i].description );
          }
        });
      })(i);
      }
      res.json(rows);
    }
  
    con.end();
  });
});
});

app.get('/getorder', (req, res) => {
  console.log('Received request at /getorder \n');

  const orderId = req.query.orderId; // Retrieve the Order ID from the query parameter

  const db = new sqlite3.Database('./partstore.db', sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
          console.error('Error opening SQLite database:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
      }

      console.log('Connected to SQLite database');

      const query = "SELECT * FROM Orders WHERE OrderNum = ?";
      db.get(query, [orderId], (err, row) => {
          if (err) {
              console.error('Error querying the database:', err);
              res.status(500).json({ error: 'Internal Server Error' });
          } else {
              if (row) {
                  res.json(row);
                  console.log('Sent order data as JSON:\n', row);
              } else {
                  res.status(404).json({ error: 'Order not found' });
                  console.log('Order not found');
              }
          }

          db.close();
      });
  });
});

app.get('/showusers', function(req, res) {
  const connection = mysql.createConnection({
  host: '131.156.224.116',
  user: 'student',
  password: 'student',
  database: 'csci467'
});
  connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL server as id ' + connnection.threadId);
  /*connection.query("SELECT * FROM parts", function (err, rows) {
    if (err) throw err;
    console.log(rows);
  });*/
  
  
  connection.end();
}); });

app.get('/catalogue', function(req, res) {
  res.sendFile(__dirname + '/catalogue.html');
});

app.get('/showorders', function(req, res) {
  console.log('received request at /showorders \n');
  var sqlShowOrders = "SELECT * FROM Orders";
  db.all(sqlShowOrders, function(err, rows) {
    // check for error
    if (err) {
      console.error(err.message);
      res.status(500).send('Something went wrong');
    } else {
      // indicate that query was successful
      console.log('Queried all Orders');
      // send rows data as JSON array
      res.json(rows);
      // indicate successful response of JSON string and show
      // the JSON string that was sent on the server console
      console.log('\n Sent all rows as JSON string\n');
      console.log(rows);
    }
  });
});

app.get('/showcatalog', function(req, res) {
console.log('recieved request at /showcatalog \n');
const con = mysql.createConnection({
  host: '131.156.224.116',
  user: 'student',
  password: 'student',
  database: 'csci467'
});
  con.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL server: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL server as id ' + con.threadId);
  con.query("SELECT * FROM parts", function (err, rows) {
  // check for error
  /*if (err) {
    console.error(err.message);
    res.status(500).send('Something went wrong');*/
    if (err){

     throw err;
    
  } else {
    // indicate that query was successful
    console.log('Queried all rows of parts');
    // send rows data as JSON array
    res.json(rows);
    // indicate successful response of JSON string and show
    // the JSON string that was sent on the server console
    console.log('\n Sent all rows as JSON string\n');
    console.log(rows);
  }

  con.end()
});

});
});


async function calculateTotal(cart) {
  var total = 0;
  var orderWeight = 0;
  var rowCtnr = [];
  let promises = []; // will store query response promises
  let sql = "SELECT price, weight, number FROM parts WHERE number = ? ;";
  return new Promise((resolve, reject) => {
    const con = mysql.createConnection({
      host: '131.156.224.116',
      user: 'student',
      password: 'student',
      database: 'csci467'
    });

    con.connect((err) => {
      if (err) {
        console.error('Error connecting to MySQL server: ' + err.stack);
        return;
      }
      console.log('Connected to MySQL server as id ' + con.threadId);

      // Execute the statement and bind the JSON string to the placeholder
      console.log("json: " + JSON.stringify(cart));
      for ( var i = 0; i < cart.length; i++ ) {

        let promise = new Promise((resolve, reject) => {
          con.query(sql, cart[i].PartNum, (err, rows) => {
            // Handle any errors
            if (err) {
              console.error(err.message);
              reject(err);
            } else {
              console.log(rows[0].number + "  " + rows[0].price);
              resolve(rows);
              /*
              let row = rows[i];
              console.log("Part number " + row.number + ", purchasing " + cart[i].Qty);
              console.log(" costs " + row.price + " each for total of $" + ( +row.price * +cart[i].Qty) );
              total += row.price * row.Qty;
              rowCtnr.push(row);
              */ 
            }

          });
        });

        promises.push(promise); //push promise to array of promises needing resolution
      }

      Promise.all(promises) // check that entire array of promises is resolved
      .then((results) => {
        var row;
        for ( var i = 0; i < results.length; i++ ) {
            row = results[i][0];
            console.log("Part number " + row.number + ", purchasing " + cart[i].Qty);
            console.log(" costs " + row.price + " each for total of $" + ( +row.price * +cart[i].Qty) );
            console.log("Weight each: " + row.weight + "lbs for weight of " + (+row.weight * +cart[i].Qty) );
            total += +row.price * cart[i].Qty;
            orderWeight += +row.weight * +cart[i].Qty;

        }
        console.log("order weight: " + orderWeight );
        console.log("order total (pre-shipping): $" + total);
        con.end();
        resolve({"total": total, "weight": orderWeight});
      })

      .catch((error) => {
        console.error(error.message);
        con.end();
        reject(error);
      });
    }); 
  });

    // mysql lookup item.PartNum price and weight
    
    // sum prices x qty
    // sum weights
    // look up fee for weight
    // sum fee + price for total
    // total += 1 * item.Qty; //<--test code

  console.log("calculating total");
};

async function calculateShippingFee(wt) {
  console.log("wt="+wt);
  var sql = `SELECT BottomLimit, TopLimit, Fee
            FROM Fees 
            WHERE BottomLimit < ? 
            AND TopLimit > ? ;`;
  return new Promise((resolve, reject) => {
    db.all(sql,[wt,wt], ((err,row) => {
      if (err) {
        reject(err);
      } else {
        console.log("row=\n"+ JSON.stringify(row[0]));
        resolve(row[0].Fee);
      }
    }));
  })
  
  .then((value) => {
    console.log("resolved fee: " + value);
    return value;
  })
  .catch((err) => {
    console.log(err);
  });
}

function getDateString() {
  var date = new Date();
  var year, month, day, hour, minute, second;
  // for other implementation
  year = date.getFullYear();
  month = date.getMonth();
  day = date.getDate();
  hour = date.getHours();
  minute = date.getMinutes();
  second = date.getSeconds();
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  if (second < 10) {
    second = "0" + second;
  }

  // functional code
  var dateString = date.toISOString();
  console.log(dateString + " timestring created");
  return dateString;
}

app.post('/ccauth', function(req, res) {
  console.log("received ccauth request");
  let data = req.body;
  console.log(data);

  var pmtSql = db.prepare(`INSERT INTO Payments (Cardholder, CCLastFour, BillingAddress, Authorization) VALUES (?, ?, ?, ?)`);
  pmtSql.run(data.auth.name, data.auth.cc.substring(12,16), JSON.stringify(data.ship), "not-authorized" , function(err) {
    if (err) {
      console.log("error adding payment record: " + err );
    }
  });

  var pmtID;
  var pmtLinker = db.prepare(`SELECT ID FROM Payments WHERE Cardholder = ? AND CCLastFour = ? AND BillingAddress = ?`);
  pmtLinker.all(data.auth.name, data.auth.cc.substring(12,16), JSON.stringify(data.ship), (err,rows) => {
    pmtID = rows[0].ID;
    console.log("pmtLinker found ID: " + pmtID );
    var cartLinker = JSON.stringify(data.cart);
    console.log("cartlinker: " + cartLinker);
  
    var linkCart = db.prepare(`UPDATE Orders SET PaymentID = ? WHERE Customer = "guest" AND Items = ?`);
    console.log(data.cart);
    console.log("stringified: " + JSON.stringify(data.cart));
    linkCart.run(pmtID, JSON.stringify(data.cart), function(error) {
      if ( error ) {
        console.log("something went wrong linking the payment to an order: " + err );
      } else {
        console.log("updated order payment successfully");
      }
    })
  
    var updateName = db.prepare(`UPDATE Orders SET Customer = ? WHERE Customer = "guest" AND Items = ?`);
    updateName.run(data.auth.name, JSON.stringify(data.cart), function(error) {
      if ( error ) {
        console.log("something went wrong updating order owner: " + err );
      } else {
        console.log("updated order owner successfully");
      }
    });
  } );







  console.log(data);

  var date = getDateString();
  var txnNum = date + ( data.auth.cc.substring(12,16));


  var authPacket = {
    'vendor': 'Grp1A-PS',
    'trans': txnNum,
    'cc': data.auth.cc,
    'name': data.auth.name, 
    'exp': data.auth.exp, 
    'amount': data.auth.amt
  };

  var http = new XMLHttpRequest();
  console.log("XMLHhttpReq obj made");
  http.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      console.log("callback entered");
      var response = JSON.parse(this.responseText);
      console.log(response);
      var auth = {"auth": false };
      if (response.errors) {
        console.log("bad cc number");
        auth.auth = false;
      } else if (response.authorization ) {
        console.log("purchase authorized");
        auth.auth = true;

        var updateAuth = db.prepare(`UPDATE Payments SET Authorization = ? WHERE ID = ?`);
        updateAuth.run(response.authorization, pmtID, function(err) {
          if ( err ) {
            console.log("something went wrong updating order owner: " + err );
          } else {
            console.log("updated order owner successfully");
          }
        })

        var updateOrderPmt = db.prepare(`UPDATE Orders SET PaymentReceived = true WHERE PaymentID = ?`);
        updateOrderPmt.run( pmtID, function(err) {
          if ( err ) {
            console.log("something went wrong updating order payment status: " + err );
          } else {
            console.log("updated order payment status");
          }
        })
}
      
      res.send(JSON.stringify(auth));
    }
  }
  http.open("POST","http://blitz.cs.niu.edu/creditcard");
  http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  console.log("sending packet to ccauth service");
  http.send(JSON.stringify(authPacket));
});


app.post('/ordercart', function(req, res) {
  // Parse the JSON string into an array of objects
  let items = req.body;

  // make a temp table out of the usercart and join it
  // with the internal parts inventory where there is
  // sufficient inventory. Resulting table is valid cart
  //
  // json_each function makes some weird table out of a json string,
  // the table is a definition of the json data so we can't quite
  // use it normally. We join the tables on the partnumber, but we
  // search for the part number in a values column and then have to make sure
  // the adjacent key is "PartNum" to know that the value we found is a PartNum and
  // not a quantity. Then filter out matched keys where there is not enough inventory
  // to fulfill the order
  //
  let sql = "WITH ItemsTemp AS (SELECT * FROM json_each(?)) \
    SELECT Parts.PartNum, Parts.Quantity, ItemsTemp.value->>'Qty' AS OrderQty \
    FROM Parts \
    JOIN ItemsTemp ON Parts.PartNum = ItemsTemp.value->>'PartNum' \
    WHERE Parts.Quantity >= ItemsTemp.value->>'Qty'; \
  ";

  let orderSql = db.prepare(`INSERT INTO Orders ( Customer, Items, Wt, Subtotal, Discount, Fee, Total, PaymentReceived ) VALUES
                  (?,?,?,?,?,?,?,?)`);

  // Execute the statement and bind the JSON string to the placeholder
  db.all(sql, [JSON.stringify(items)], async (err, rows) => {
    // Handle any errors
    if (err) {
      console.error(err.message);
    }
    // Process the result rows
    let newCart = [];
    let total = 0;
    rows.forEach((row) => {
      console.log("Part number " + row.PartNum + " has sufficient inventory: " + row.Quantity);
      // Add the item to the new cart
      newCart.push({ PartNum: row.PartNum, Qty: row.OrderQty });
    });
    // Send the new cart and total as a JSON packet
    let totals = await calculateTotal(newCart);
    let fee = await calculateShippingFee(totals.weight);
    let arr = [ "guest", JSON.stringify(newCart), totals.weight, totals.total, 0, fee, (+totals.total + +fee), false ];
    orderSql.run(arr[0],arr[1],arr[2],arr[3],arr[4],arr[5],arr[6],arr[7], function(err) {
      if (err) {
        console.log("error adding pending order to db");
      } else {
        console.log("pending order entered to db");
      }
    });
    let packet = { "total": totals.total, "weight": totals.weight, "shipping": fee, "cart": newCart };
    console.log("Sending JSON packet: " + JSON.stringify(packet));
    res.json(packet);
  });
});





app.post('/shiporder', function(req, res) {
  var order = req.body;
  console.log(order.OrderNum);
  var sqlCheckStatus = db.prepare("SELECT * FROM Orders WHERE OrderNum = ?");
  sqlCheckStatus.all(order.OrderNum, function(err, rows) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Something went wrong');
    } else {
      // indicate that query was successful
      console.log('Queried all Orders');
      console.log(rows);
      if ( rows.Shipped ) { 
        console.log('this item has already been shipped');
      }
    }

  });

  var sql = db.prepare("UPDATE Orders SET Shipped = true WHERE OrderNum = ?");
  sql.run(order.OrderNum, function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Something went wrong');
    } else {
      // indicate that query was successful
      var mailOptions = {
        from: 'csci467partstore@gmail.com',
        to: 'jeffblinks@gmail.com',
        subject: '467Partstore: Order# ' + order.OrderNum + ' shipped!',
        text: order.Customer + ', thanks for ordering!',
      };
      mailTransporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      console.log('Updated order ' + order.OrderNum + ' to shipped\n');
    }
  });

  res.status(200).send('');
});

// Define a route for the /adduser path of the server
app.post('/adduser', function(req, res) {
  console.log('received request at /adduser \n');
  // check that POST request has data in the body
  if ( req.body ) {
    var data = req.body;
    // make sure the data in the body includes username and password
    if ( data.username && data.password ) {
    // construct the SQLite query using the data
    var sqlAdd = db.prepare("INSERT INTO users (username, password) VALUES (?, ?)");

    // fill wildcards, execute the query and 
    // send back the result as JSON string
    sqlAdd.run( data.username, data.password, function(err) {
      // check for error on sql query
      if (err) {
        // status 500 indicates internal server error
        res.status(500).send(JSON.stringify({ "error": err.message }));
      } else {
        // status 200-299 means good
        res.status(200).send(JSON.stringify({ "success": true }));
      }
    }) } else {
      // send an error message if data is missing username or password
      res.status(400).json({ "error": "Missing or invalid username or password" });
    }
  } else { 
    // send an error message if req.body is undefined
    res.status(400).json({ "error": "No JSON data received" });
  }

});


app.post('/qtycheck', express.urlencoded({ extended: true }), (req, res) => {
  const part_id = req.body.part_id;

  db.get('SELECT Quantity FROM Parts WHERE PartNum = ?', [part_id], (err, row) => {
    if (err) {
      return res.status(500).send('Error querying the database.');
    }

    if (!row) {
        return res.send('No value found for the provided name.');
    }

    // Send the value back to the client-side (HTML/JavaScript)
    res.send(row);
  });
});


app.get('/employee/admin', function(req, res) {
  res.sendFile(__dirname + '/employee/admin.html');
});

app.get('/employee/receiving', function(req, res) {
  res.sendFile(__dirname + '/employee/receiving.html');
});

app.get('/employee/shipping', function(req, res) {
  res.sendFile(__dirname + '/employee/shipping.html');
});


app.post('/addinventory', function(req, res) {
  console.log('received request at /addinventory \n');
  // check that GET request has data in the body
  if ( req.body ) {
    var data = req.body;
    // make sure the data in the body includes username and password
    if ( data.search && data.quantity ) {
    // construct the SQLite query using the data
    var sqlAdd = db.prepare('UPDATE Parts SET Quantity = Quantity + ? WHERE PartNum = ? OR ItemDescr = ?');

    // fill wildcards, execute the query and 
    // send back the result as JSON string
    sqlAdd.run( data.quantity, data.search, data.search, function(err) {
      // check for error on sql query
      if (err) {
        // status 500 indicates internal server error
        res.status(500).send(JSON.stringify({ "error": err.message }));
      } else {
        // status 200-299 means good
        res.status(200).send(JSON.stringify({ "success": true }));
      }
    }) } else {
      // send an error message if data is missing username or password
      res.status(400).json({ "error": "Missing or invalid search and quantity" });
    }
  } else { 
    // send an error message if req.body is undefined
    res.status(400).json({ "error": "No JSON data received" });
  }
});

app.post('/addbracketfee', function(req, res) {
  console.log('received request at /addbracketfee \n');
  // check that POST request has data in the body
  if ( req.body ) {
    var data = req.body;
    // make sure the data in the body includes weight bracket min/max and fee
    if ( data.minimum && data.maximum && data.fee ) {
    // construct the SQLite query using the data
    var sqlInsert = db.prepare('INSERT INTO Fees ( BottomLimit, TopLimit, Fee ) VALUES ( ?, ?, ? );');

    // fill wildcards, execute the query and 
    // send back the result as JSON string
    sqlInsert.run( data.minimum, data.maximum, data.fee, function(err) {
      // check for error on sql query
      if (err) {
        // status 500 indicates internal server error
        res.status(500).send(JSON.stringify({ "error": err.message }));
      } else {
        // status 200-299 means good
        res.status(200).send(JSON.stringify({ "success": true }));
      }
    }) } else {
      // send an error message if data is missing
      res.status(400).json({ "error": "Missing or invalid inputs" });
    }
  } else { 
    // send an error message if req.body is undefined
    res.status(400).json({ "error": "No JSON data received" });
  }
});

app.post('/displayorders1', function(req, res) {
  console.log('received request at /displayorders1 \n');
  if ( req.body ) {
    console.log(req.body)
    var data = req.body;
    // if ( data.search ) { console.log(data.search) } else { console.log('found no data') }
    if ( data.search ) {
    // construct the SQLite query using the data
      if ( data.search === "authorized" ) {
        console.log('entered authorized')
        var sqlDisplayOrders = 'SELECT * FROM Orders WHERE PaymentReceived = 1';
      } else if ( data.search === "shipped" ) {
        var sqlDisplayOrders = 'SELECT * FROM Orders WHERE OrderCompleted = 1';
      } else if (data.search === "unauthorized") {
        var sqlDisplayOrders = 'SELECT * FROM Orders WHERE PaymentReceived = 0';
      } else if (data.search === "not shipped") {
        var sqlDisplayOrders = 'SELECT * FROM Orders WHERE OrderCompleted = 0';
      } 
    }
    // var sqlDisplayOrders = "SELECT * FROM Orders";
    db.all(sqlDisplayOrders, function(err, rows) {
    // check for error
    if (err) {
      console.error(err.message);
      res.status(500).send('Something went wrong');
    } else {
      // indicate that query was successful
      console.log('Queried according to status searched');
      // send rows data as JSON array
      res.json(rows);
      // indicate successful response of JSON string and show
      // the JSON string that was sent on the server console
      console.log('\n Sent rows as JSON string\n');
      console.log(rows);
    }
  });
} else { 
  // send an error message if req.body is undefined
  res.status(400).json({ "error": "No JSON data received" });
}
});

app.post('/displayorders2', function(req, res) {
  console.log('received request at /displayorders2 \n');
  if ( req.body ) {
    console.log(req.body)
    var data = req.body;
    // if ( data.search ) { console.log(data.search) } else { console.log('found no data') }
    if ( data.min && data.max ) { 
      var sqlDisplayOrders ='SELECT * FROM Orders WHERE Total BETWEEN ? AND ?';
    }

    // fill wildcards, execute the query and 
    // send back the result as JSON string
    // sqlDisplayOrders.run( data.min, data.max, function(err, rows) {
      db.all(sqlDisplayOrders, data.min, data.max, function(err, rows) {
    // check for error
    if (err) {
      console.error(err.message);
      res.status(500).send('Something went wrong');
    } else {
      // indicate that query was successful
      console.log('Queried according to price range searched');
      // send rows data as JSON array
      res.json(rows);
      // indicate successful response of JSON string and show
      // the JSON string that was sent on the server console
      console.log('\n Sent rows as JSON string\n');
      console.log(rows);
    }
  });
} else { 
  // send an error message if req.body is undefined
  res.status(400).json({ "error": "No JSON data received" });
}
});

app.post('/displayorders3', function(req, res) {
  console.log('received request at /displayorders3 \n');
  if ( req.body ) {
    console.log(req.body)
    var data = req.body;
    // if ( data.search ) { console.log(data.search) } else { console.log('found no data') }
    if ( data.start && data.end ) { 
      var sqlDisplayOrders ='SELECT * FROM Orders WHERE TimePlaced BETWEEN ? AND ?';
    }

    // fill wildcards, execute the query and 
    // send back the result as JSON string
    // sqlDisplayOrders.run( data.min, data.max, function(err, rows) {
      db.all(sqlDisplayOrders, data.start, data.end, function(err, rows) {
    // check for error
    if (err) {
      console.error(err.message);
      res.status(500).send('Something went wrong');
    } else {
      // indicate that query was successful
      console.log('Queried according to date range searched');
      // send rows data as JSON array
      res.json(rows);
      // indicate successful response of JSON string and show
      // the JSON string that was sent on the server console
      console.log('\n Sent rows as JSON string\n');
      console.log(rows);
    }
  });
} else { 
  // send an error message if req.body is undefined
  res.status(400).json({ "error": "No JSON data received" });
}
});

// Start the server and listen on the port
app.listen(port, function() {
  // notify that server is running and indicate the port number
  console.log(`Server is running on port ${port}`);
});