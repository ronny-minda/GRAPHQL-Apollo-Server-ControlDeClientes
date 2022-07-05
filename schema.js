
// const { gql } = require('apollo-server');

import { gql } from 'apollo-server';

const typeDefs = gql`

    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        creado: String
    }

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    type Token {
        token: String
    }

    type Query {
        obtenerUsuario(token: String!): Usuario
    }

    type Mutation {
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticarInput): Token
    }


`;




export default typeDefs;