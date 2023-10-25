DROP TABLE Fees;
DROP TABLE Orders;
DROP TABLE Payments;
DROP TABLE Parts;

CREATE TABLE Parts (
    PartNum INTEGER PRIMARY KEY,
    ItemDescr VARCHAR(80),
    Quantity INTEGER DEFAULT (0)
);

INSERT INTO Parts( PartNum, ItemDescr, Quantity ) VALUES ( 1, 'windshield w/ polymer', 321 );

CREATE TABLE Payments (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Cardholder VARCHAR(80) NOT NULL,
    CCLastFour CHAR(4) NOT NULL,
    BillingAddress TEXT NOT NULL,
    Authorization TEXT NOT NULL
);

INSERT INTO Payments ( Cardholder, CCLastFour, BillingAddress, Authorization ) VALUES ( 'Chris Cardholder', '7862', '128 Testval Ln, Chicago, IL 60131', '3c6jkE3' );

CREATE TABLE Orders (
    OrderNum INTEGER PRIMARY KEY AUTOINCREMENT,
    Customer VARCHAR(80) NOT NULL,
    Shipped BOOLEAN DEFAULT(0),
    Items TEXT, --JSON [{ id: 1; qty: 7; price: 2.25; weight: 2; },{ id: 2; qty: 2; price: 3; weight: 5; }]
    Wt FLOAT DEFAULT(0),
    Subtotal FLOAT NOT NULL, -- calculated with server script after items/cart entered
    Discount FLOAT DEFAULT(0),
    Fee FLOAT NOT NULL, -- static fee associated with order in case structure changes
    Total FLOAT NOT NULL, -- static total of order at time placed
    PaymentReceived BOOLEAN DEFAULT(0),
    PaymentID INTEGER,
    TimePlaced DATE, -- DATETIME,
    OrderCompleted BOOLEAN DEFAULT(0),

    FOREIGN KEY ( PaymentID ) REFERENCES Payments ( ID )
);
--'[{ "partnum": , "qty": , "price": , "wt":  },{ "partnum": , "qty": , "price": , "wt":  }]'
INSERT INTO Orders ( Customer, Items, Wt, Subtotal, Discount, Fee, Total, PaymentID, PaymentReceived, TimePlaced, OrderCompleted ) 
VALUES ('Christopher C.', '[{ "partnum": 1, "qty": 4, "price": 5.25, "wt": 3.15 }]', 18.6, 21, 4, 2.13, 19.13, 1, false, '2023-08-01', false),
       ('Jeffy B', '[{ "partnum": 3, "qty": 7, "price": 3.5, "wt": 6 },{ "partnum": 5, "qty": 2, "price": 13, "wt": 12 }]', 66, 48.5, 1.5, 20, 67, 1, false, '2023-08-03', false),
       ('Barbara Baguette', '[{ "partnum": 12, "qty": 1, "price": 4.5, "wt": 6 },{ "partnum": 60, "qty": 2, "price": 13, "wt": 12 }]', 66, 48.5, 1.5, 4, 51, 1, false, '2023-08-04', false),
       ('Hector Challah', '[{ "partnum": 3, "qty": 9, "price": 3.5, "wt": 6 },{ "partnum": 17, "qty": 2, "price": 13, "wt": 12 }]', 66, 32, 1.5, 0, 32, 1, false, '2023-08-06', false),
       ('Peter Pumpernickel', '[{ "partnum": 43, "qty": 3, "price": 7.5, "wt": 6 },{ "partnum": 583, "qty": 2, "price": 13, "wt": 12 }]', 66, 48.5, 1.5, 20, 67, 1, false, '2023-08-08', false);


CREATE TABLE Fees (
    ID INTEGER PRIMARY KEY,
    BottomLimit FLOAT NOT NULL,
    TopLimit FLOAT NOT NULL,
    Fee FLOAT NOT NULL
);

INSERT INTO Fees ( BottomLimit, TopLimit, Fee ) VALUES ( 0, 15, 1.50 );