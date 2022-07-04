const { ApolloServer, gql } = require('apollo-server');


const curso = [
    {
        titulo: 'Soy titulo #1',
        tecnologia: 'soy tecnologia #1'
    },
    {
        titulo: 'Soy titulo #1',
        tecnologia: 'soy tecnologia #1'
    }
]

const typeDefs = gql`
    type Curso {
        titulo: String
    }

    type Tecnologia {
        tecnologia: String
    }

    type Query {
        obtenerCursos: [Curso]
        obtenerTecnologia: [Tecnologia]
    }
`;


const resolvers = {
    Query: {
        obtenerCursos: () => curso,
        obtenerTecnologia: () => curso
    }
}


const server = new ApolloServer({
    typeDefs,
    resolvers
});


server.listen().then( ({url}) => {
    console.log(`Server listo en la url ${url}`)
} )