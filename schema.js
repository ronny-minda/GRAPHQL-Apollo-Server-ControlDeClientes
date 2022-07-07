
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
    
    type Token {
        token: String
    }

    type Producto {
        id: ID
        nombre: String
        existencia: Int
        precio: Float
        creado: String
    }

    type Cliente {
        id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        vendedor: ID
    }

    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        cliente: ID
        vendedor: ID
        fecha: String
        estado: EsatadoPedido
    }

    type PedidoGrupo {
        id: ID
        cantidad: Int
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

    input ProductoInput {
        nombre: String!
        existencia: Int!
        precio: Float!
    }

    input ClienteInput {
        nombre: String!
        apellido: String!
        empresa: String!
        email: String!
        telefono: String
    }

    input PedidoProductoInput {
        id: ID
        cantidad: Int
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float!
        cliente: ID!
        estado: EsatadoPedido
    }

    enum EsatadoPedido {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    

    type Query {
        # Usuarios
        obtenerUsuario(token: String!): Usuario

        # Producto
        obtenerProductos: [Producto]
        obtenerProducto(id: ID!): Producto

        # Cliente
        obtenerClientes: [Cliente]
        obtenerClientesVendedor: [Cliente]
        obtenerCliente(id: ID!): Cliente

    }

    type Mutation {
        # Usuarios
        nuevoUsuario(input: UsuarioInput): Usuario
        autenticarUsuario(input: AutenticarInput): Token
        
        # Productos
        nuevoProducto(input: ProductoInput): Producto
        actalizarProducto(id: ID, input: ProductoInput): Producto
        eliminarProducto(id: ID!): String

        # Clientes
        nuevoCliente(input: ClienteInput): Cliente
        actualizarCliente(id: ID!, input: ClienteInput): Cliente
        eliminarCliente(id: ID!): String

        # Pedido
        nuevoPedido(input: PedidoInput): Pedido
    }

`;




export default typeDefs;