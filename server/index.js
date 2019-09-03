const express                       = require('express');
const bodyParser                    = require('body-parser');
const getAccountsHandler            = require('./src/handlers/getaccounts/getaccountshandler');
const publicAddInvoiceIdHandler     = require('./src/handlers/public/addinvoiceid/addinvoiceidhandler');
const publicIsHashExistsHandler     = require('./src/handlers/public/ishashexists/ishashexistshandler');
const publicGetInvoiceIdHandler     = require('./src/handlers/public/getinvoiceid/getinvoiceidhandler');
const privateAddInvoiceIdHandler    = require('./src/handlers/private/addinvoiceid/addinvoiceidhandler');
const privateIsHashExistsHandler    = require('./src/handlers/private/ishashexists/ishashexistshandler');
const privateGetInvoiceIdHandler    = require('./src/handlers/private/getinvoiceid/getinvoiceidhandler');

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
    app.use((req, res, next) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS, POST, PUT");
        res.setHeader("Access-Control-Allow-Headers", "Accept, Access-Control-Allow-Headers, Access-Control-Request-Headers, Access-Control-Request-Method, Authorization, Content-Type, Origin, X-Requested-With");
        next();
    });
    
    app.use('/getaccounts', getAccountsHandler);
    app.use('/public/addinvoiceid', publicAddInvoiceIdHandler);
    app.use('/public/ishashexists', publicIsHashExistsHandler);
    app.use('/public/getinvoiceid', publicGetInvoiceIdHandler);
    app.use('/private/addinvoiceid', privateAddInvoiceIdHandler);
    app.use('/private/ishashexists', privateIsHashExistsHandler);
    app.use('/private/getinvoiceid', privateGetInvoiceIdHandler);
}

server = () => {
    app.listen(port, () => {
        console.log('Listening on Port: ' + port);
    })
}

boot();
