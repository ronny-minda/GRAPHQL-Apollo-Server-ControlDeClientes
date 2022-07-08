
import dotenv from 'dotenv';
dotenv.config()
import Usuario from "./models/Usuario.js";
import Producto from "./models/Producto.js";
import Cliente from "./models/Cliente.js";
import Pedido from "./models/Pedido.js";
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
            
        },
        obtenerProductos: async () => {
            try {

                const productos = await Producto.find({});

                return productos
                
            } catch (error) {

                console.log('no se pudo obtener la lista de productos');

            }
        },
        obtenerProducto: async ( _, {id} ) => {

            const producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('El producto no exite');
            }

            return producto;
        },
        obtenerClientes: async () => {

            try {

                const clientes = await Cliente.find({});

                return clientes;

            }catch(err) {
                console.log('no se puede los obtener clientes');
            }
        },
        obtenerClientesVendedor: async ( _, {}, ctx ) => {

            try {

                const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });

                return clientes;

            }catch(err) {
                console.log('no se puede los obtener clientes');
            }
            
        },
        obtenerCliente: async ( _, {id}, ctx ) => {

            const cliente = await Cliente.findById(id);

            if(!cliente) {
                throw new Error('Cliente no encontrado');
            }

            if(cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error('No tienes las credenciales')
            }

            return cliente;

        },
        obtenerPedidos: async () => {
            
            try {
                
                const pedidos = await Pedido.find({});



                return pedidos;

            } catch (error) {
                console.log(error+'no se puede obtener los pedidos')
            }
        },
        obtenerPedidosVendedor: async ( _, {}, ctx ) => {

            try {
                
                const pedidos = await Pedido.find({ vendedor: ctx.usuario.id });
                return pedidos;

            } catch (error) {
                console.log(error+'no se puede obtener los pedidos')
            }

        },
        obtenerPedido: async ( _, {id}, ctx ) => {
            // si el pedido eexiste o no
            const pedido = await Pedido.findById(id);
            if(!pedido) {
                throw new Error('Pedido no encontrado');
            }

            // Solo quien lo creo pueden verlo
            if(pedido.vendedor.toString() != ctx.usuario.id) {
                throw new Error('No tienes las credenciales');
            }

            // retornar el resultado
            return pedido;
        },
        obtenerPedidoEstado: async ( _, { estado }, ctx) => {
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado});
            return pedidos;
        },
        mejoresClientes: async ( _, {}, ctx ) => {
            const clientes = await Pedido.aggregate([
                { $match: { estado: 'COMPLETADO'} },
                { $group: {
                    _id: '$cliente',
                    total: { $sum: '$total'}
                }},
                {
                    $lookup: {
                        from: 'clientes',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'cliente'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total: -1 }
                }
            ])
            
            return clientes;
            
        },
        mejoresVendedores: async () => {
            const vendedores = await Pedido.aggregate([
                { $match: { estado: 'COMPLETADO'} },
                { $group: {
                    _id: '$vendedor',
                    total: {$sum: '$total'}
                }},
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendedor'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total: -1 }
                }
            ]);

            console.log(vendedores)
            
            return vendedores;
        },
        buscarProducto: async ( _, {texto} , ctx) => {
            const productos = await Producto.find({ $text: { $search: texto } }).limit(10);

            return productos;
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
        },

        nuevoProducto: async ( _, {input} ) => {

            try {

                const producto = new Producto(input);

                const resultado = await producto.save();

                return resultado;

            } catch(err) {
                console.log('no se pududo guardar el producto');
            }

        },
        actalizarProducto: async ( _, {id, input}) => {

            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('El producto no exite');
            }

            producto = await Producto.findOneAndUpdate({_id: id}, input, {new: true});

            return producto;

        },
        eliminarProducto: async ( _, {id} ) => {

            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('El producto no exite');
            }

            await Producto.findByIdAndDelete({ _id: id });

            return 'Producto eliminado';

        },
        nuevoCliente: async ( _, {input}, ctx) => {

            const { email } = input;

            const cliente = await Cliente.findOne({email});

            if(cliente) {
                throw new Error('El cliente ya esta registrado');
            }

            const nuevoCliente = new Cliente(input);


            nuevoCliente.vendedor = ctx.usuario.id;

            try {
                
                const resultado = await nuevoCliente.save();

                return resultado;

            } catch (error) {
                console.log(' no se pudo guardar el cliente');
            }

           

        },
        actualizarCliente: async ( _, {id, input}, ctx ) => {

            let cliente = await Cliente.findById(id);

            if (!cliente) {
                throw new Error('No tienes las credenciales');
            }

            if( cliente.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tiene las credenciales');
            }

            cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});

            return cliente;

        },
        eliminarCliente: async (_, {id}, ctx) => {

            let cliente = await Cliente.findById(id);

            if (!cliente) {
                throw new Error('No tienes las credenciales');
            }

            if( cliente.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tiene las credenciales');
            }

            await Cliente.findOneAndDelete({_id: id});

            return 'Cliente Eliminado';

        },
        nuevoPedido: async ( _, {input}, ctx) => {
            

            const { cliente : id } = input;


            let clienteExiste = await Cliente.findOne({id});


            if (!clienteExiste) {
                throw new Error('El cliente no existe');
            }
            
            // Verificar si el Cliente existe o no
            if( id.toString() !== ctx.usuario.id.toString() ) {
                throw new Error('No tiene las credenciales');
            }

            // Verificar si el Cliente es vendedor

            for await ( const articulo of input.pedido) {
                console.log(articulo);
                
                const { id } = articulo;

                const producto = await Producto.findOne({id});

                if(articulo.cantidad > producto.existencia) {
                    throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                } else {
                    producto.existencia = producto.existencia - articulo.cantidad;
                    await producto.save();
                }

                console.log(Producto);
                
            }

            // Crear nuevo pedido
            const nuevoPedido = new Pedido(input);

            // Revisar que el stock este disponible

            // Asingnarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

            // Guardarlo en la base de datos

            const resustado = await nuevoPedido.save();

            return resustado;

        },
        actualizarPedido: async ( _, {id, input}, ctx) => {

            const { cliente } = input;

            const existePedido = await Pedido.findById(id);
            if(!existePedido) {
                throw new Error('El pedido no existe');
            }

            const existeCliete = await Pedido.findById(cliente);
            console.log({existeCliete})
            if(!existeCliete) {
                throw new Error('El Cliente no existe');
            }

            if( existeCliete.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tiene las credenciales');
            }

            if( input.pedido ) {
                for await ( const articulo of input.pedido) {
                    
                    const { id } = articulo;

                    const producto = await Producto.findOne({id});

                    if(articulo.cantidad > producto.existencia) {
                        throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                    } else {
                        producto.existencia = producto.existencia - articulo.cantidad;
                        await producto.save();
                    }

                    const resultado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true})

                    return resultado;
                }
            }

            

        },
        eliminarPedido: async ( _, {id}, ctx) => {
            const pedido = await Pedido.findById(id);

            if(!pedido) {
                throw new Error('El pedido no existe');
            }

            if( pedido.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tienes las credenciales')
            }

            await Pedido.findOneAndDelete({_id: id});
            return 'Pedido Eliminado'
        }
    }
}


export default resolvers;
