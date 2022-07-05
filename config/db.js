
// const mongose = require('mongose');
// require('dotenv').config();

import mongose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config()


const conectarDB = async() => {

    try {

        await mongose.connect(process.env.DB_MONGO);

        console.log('DB Conectada');
        
    } catch (error) {
        console.log(error);
        console.log('No se pudo conectar!!!');
        process.exit(1);
    }

}

export default conectarDB;