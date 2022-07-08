
import { ApolloServer } from 'apollo-server';

import conectarDB from './config/db.js';
import resolvers from './resolvers.js';
import typeDefs from './schema.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config()



conectarDB()

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}) => {

        const token = req.headers['authorization'] || '';

        if (token) {

            try {

                const usuario = await jwt.verify(token, process.env.SECRETA);
                

                return {
                    usuario
                }

            } catch (error) {
                console.log('hubo un error en el JWT', error)
            }
        }
        
    }
    
});


server.listen().then( ({url}) => {
    console.log(`Server listo en la url ${url}`)
})