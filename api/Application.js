const express                       = require('express');
const bodyParser                    = require('body-parser');
const getAccountsHandler            = require('./src/handlers/getAccounts/GetAccountsHandler');
const publicAddInvoiceHandler       = require('./src/handlers/public/addInvoice/AddInvoiceHandler');
const publicIsHashExistsHandler     = require('./src/handlers/public/isHashExists/IsHashExistsHandler');
const publicGetInvoiceIdHandler     = require('./src/handlers/public/getInvoiceId/GetInvoiceIdHandler');

const app               = express();
const port              = process.env.PORT || 9086;

boot = () => {
    intialize();
    registerRoutes();
    server();    
}

intialize = () => {
    app.use(bodyParser.json());
}
registerRoutes = () => {
    app.get('/', (req, res) => res.send({status: true, msg: 'Hello from API'}))    
    app.use('/getAccounts', getAccountsHandler);
    app.use('/public/addInvoice', publicAddInvoiceHandler);
    app.use('/public/isHashExists', publicIsHashExistsHandler);
    app.use('/public/getInvoiceId', publicGetInvoiceIdHandler);
}

server = () => {
    app.listen(port, () => {
        console.log('Listening on Port NO: ' + port);
    })
}

boot();
