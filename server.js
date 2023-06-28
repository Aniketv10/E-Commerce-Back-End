const app = require('./app')
const connectDatabase = require('./config/database')


const dotenv = require('dotenv');


// Handle Uncaught Exception 

process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting Down Server Due To UnCaught Exception');
    process.exit(1)
})


// Setting up config file
dotenv.config({ path: 'backend/config/config.env'})


// Connecting to Database   
connectDatabase();

const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

// Handled And UnHandled Promise Rejection 

process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting Down the server due to unhandled promise rejection');
    server.close(() => {
        process.exit(1)
    })
})