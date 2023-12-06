import express from 'express'
import { Server } from 'socket.io'
import handlebars from 'express-handlebars'
import productsRouter from './routers/products.router.js'
import cartsRouter from './routers/carts.router.js'
import viewsRouter from './routers/views.router.js'
import chatRouter from './routers/chat.router.js'
import mongoose from 'mongoose'
import Message from './dao/models/message.model.js'

const PORT = 8080; 

const app = express(); 
app.use(express.json()); 
app.use(express.static('./src/public')); 



app.engine('handlebars', handlebars.engine());
app.set('views', './src/views');
app.set('view engine', 'handlebars');



try {
    await mongoose.connect('mongodb+srv://cardozoesteban:lyqQs94mGfCX24G8@cluster0.jycginf.mongodb.net/ecommerce') // conecta con la base de datos
    const serverHttp = app.listen(PORT, () => console.log('server up')) // levanta el servidor en el puerto especificado  
    const io = new Server(serverHttp) 
    
    app.use((req, res, next) => {
        req.io = io;
        next();
    }); 
    
    
    app.get('/', (req, res) => res.render('index')); 
    
    app.use('/chat', chatRouter); 
    app.use('/products', viewsRouter); 
    app.use('/api/products', productsRouter); 
    app.use('/api/carts', cartsRouter); 
    
    io.on('connection', socket => {
        console.log('Nuevo cliente conectado!')

        socket.broadcast.emit('Alerta');

        
        Message.find()
          .then(messages => {
            socket.emit('messages', messages); 
          })
          .catch(error => {
            console.log(error.message);
          });
    
        socket.on('message', data => {
          
          const newMessage = new Message({
            user: data.user,
            message: data.message
          });
    
          newMessage.save()
            .then(() => {
              
              Message.find()
                .then(messages => {
                  io.emit('messages', messages);
                })
                .catch(error => {
                  console.log(error.message);
                });
            })
            .catch(error => {
              console.log(error.message);
            });
        });

        socket.on('productList', async (data) => { 
            io.emit('updatedProducts', data ) 
        }) 
    }) 
} catch (error) {
    console.log(error.message)
}
