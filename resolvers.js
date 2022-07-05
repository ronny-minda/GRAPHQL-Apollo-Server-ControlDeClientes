
import dotenv from 'dotenv';
dotenv.config()
import Usuario from "./models/Usuario.js";
import Producto from "./models/Producto.js";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
 

const crearToken = (usuario, secreta, expiresIn) => {
    
    const { id, email, nombre, apellido } = usuario;

    return jwt.sign({ id }, secreta, {expiresIn})

}

const resolvers = {
    Query: {
        obtenerUsuario: async ( _, {token} ) => {
            
            const usuarioId = await jwt.verify(token, process.env.SECRETA);

            return usuarioId;
            
        }
    },
    Mutation: {
        nuevoUsuario: async (_, {input}) => {

            const { email, password } = input;

            // revisar si ya existe ese usuario

            const exiteUsuario = await Usuario.findOne({email});

            if(exiteUsuario) {
                throw new Error('Ese usuario ya existe');
            }

            // Hashear su password
            const salt = await bcryptjs.genSalt(10);
            input.password = bcryptjs.hashSync(password, salt);

            // Guardar en la base de datos

            try {

                const usuario = new Usuario(input);
                usuario.save();
                return usuario;

            } catch(err) {

                console.log('no se pudo guardar el nuevo usuario');

            }

            
        },
        autenticarUsuario: async ( _, {input} ) => {

            // Si exiteUsuario
            const { email, password} = input;

            const exiteUsuario = await Usuario.findOne({email});

            if(!exiteUsuario) {
                throw new Error('Ese usuario no existe');
            }

            // Verificar password
            const passwordCorrecto = await bcryptjs.compare(password, exiteUsuario.password);

            if(!passwordCorrecto) {
                throw new Error('El password es Incorrecto');
            }

            // Crear el token
            return {
                token: crearToken(exiteUsuario, process.env.SECRETA, '24h')
            }
        }
    }
}


export default resolvers;
