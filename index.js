const { ApolloServer, gql } = require('apollo-server');



const typeDefs = gql`

    type Curso {
        titulo: String
        tecnologia: String
    }

    type Query {
        obtenerCursos: Curso
    }
`;

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

const resolvers = {
    Query: {
        obtenerCursos: () => curso[0]
    }
}


const server = new ApolloServer({
    typeDefs,
    resolvers
});


server.listen().then( ({url}) => {
    console.log(`Server listo en la url ${url}`)
} )