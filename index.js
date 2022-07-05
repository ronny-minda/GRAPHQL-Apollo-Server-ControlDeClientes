// const { ApolloServer, gql } = require('apollo-server');

// const conectarDB = require('./config/db');
// const typeDefs = require('./schema');
// const resolvers = require('./resolvers'); 

import { ApolloServer } from 'apollo-server';

import conectarDB from './config/db.js';
import resolvers from './resolvers.js';
import typeDefs from './schema.js';



conectarDB()

const server = new ApolloServer({
    typeDefs,
    resolvers
});


server.listen().then( ({url}) => {
    console.log(`Server listo en la url ${url}`)
})