import { Router } from "express";
import Cart from '../dao/models/cart.model.js';
import Product from '../dao/models/product.model.js';

const router = Router();

const filePathProducts = './src/productos.json';
const filePathCarts = './src/carrito.json';

router.get('/', async (req, res) => {
    try {
        const carts = await Cart.find().lean().exec();
        res.status(200).json(carts);
    } catch (error) {
        console.log('Error al obtener los carritos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});
  
router.get('/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const cart = await Cart.findById(cartId).lean().exec();
  
      if (!cart) {
        res.status(404).json({ error: 'Carrito no encontrado' });
        return;
      }
  
      res.status(200).json(cart.products);
    } catch (error) {
      console.log('Error al obtener los productos del carrito:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
  
router.post('/', async (req, res) => {
    try {
      const newCart = await Cart.create({ products: [] });
  
      res.status(201).json(newCart);
    } catch (error) {
      console.log('Error al crear el carrito:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });
  
router.post('/:cid/product/:pid', async (req, res) => {
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
  
      const product = await Product.findById(productId).lean().exec();
  
      if (!product) {
        res.status(404).json({ error: 'Producto no encontrado' });
        return;
      }
  
      const cart = await Cart.findById(cartId).lean().exec();
  
      if (!cart) {
        res.status(404).json({ error: 'Carrito no encontrado' });
        return;
      }
  
      const existingProductIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );
  
      if (existingProductIndex !== -1) {
        // Si el producto ya está en el carrito, incrementar la cantidad
        cart.products[existingProductIndex].quantity++;
      } else {
        // Si el producto no está en el carrito, agregarlo con cantidad 1
        cart.products.push({
          product: productId,
          quantity: 1
        });
      }
  
      await Cart.findByIdAndUpdate(cartId, { products: cart.products }).exec();
  
      res.status(201).json(cart);
    } catch (error) {
      console.log('Error al agregar producto al carrito:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });

router.delete('/:cid', async (req, res) => {
    try {
      const cartId = req.params.cid;
  
      const deletedCart = await Cart.findByIdAndDelete(cartId).lean().exec();
  
      if (!deletedCart) {
        res.status(404).json({ error: 'Carrito no encontrado' });
        return;
      }
  
      res.status(200).json({ message: 'Carrito eliminado satisfactoriamente' });
    } catch (error) {
      console.log('Error al eliminar el carrito:', error);
      res.status(500).json({ error: 'Error en el servidor' });
    }
  });

export default router;