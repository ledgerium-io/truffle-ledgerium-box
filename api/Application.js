const express                       = require('express');
const bodyParser                    = require('body-parser');
const getAccountsHandler            = require('./src/handlers/getAccounts/GetAccountsHandler');
const publicAddInvoiceIdHandler     = require('./src/handlers/public/addInvoiceId/AddInvoiceIdHandler');
const publicIsHashExistsHandler     = require('./src/handlers/public/isHashExists/IsHashExistsHandler');
const publicGetInvoiceIdHandler     = require('./src/handlers/public/getInvoiceId/GetInvoiceIdHandler');
const privateAddInvoiceIdHandler    = require('./src/handlers/private/addInvoiceId/AddInvoiceIdHandler');
const privateIsHashExistsHandler    = require('./src/handlers/private/isHashExists/IsHashExistsHandler');
const privateGetInvoiceIdHandler    = require('./src/handlers/private/getInvoiceId/GetInvoiceIdHandler');

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
    
    app.use('/getAccounts', getAccountsHandler);
    app.use('/public/addInvoiceId', publicAddInvoiceIdHandler);
    app.use('/public/isHashExists', publicIsHashExistsHandler);
    app.use('/public/getInvoiceId', publicGetInvoiceIdHandler);
    app.use('/private/addInvoiceId', privateAddInvoiceIdHandler);
    app.use('/private/isHashExists', privateIsHashExistsHandler);
    app.use('/private/getInvoiceId', privateGetInvoiceIdHandler);
}

server = () => {
    app.listen(port, () => {
        console.log('Listening on Port NO: ' + port);
    })
}

boot();
