const db = new sqlite3.Database('./partstore.db');
const axios = require('axios');

module.exports = {
    processSample: async result => {
        var data = {
            'ID': '3',
            'trans': '907-987654321-296',
            'Cardholder': 'Christopher C',
            'CCLastFour': '0123', 
            'BillingAddress': '1248 Somethingstreet', 
            'Authoirzation': 'Yes'
        };
        axios.post('http://blitz.cs.niu.edu/creditcard', data).then((response) => {           
            result(response.data);
        }).catch(err => {
            throw err;
        });
    }
}