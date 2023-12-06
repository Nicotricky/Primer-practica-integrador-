import { Router } from "express"
import ProductManager from '../dao/fsManagers/ProductManager.js'
import Product from '../dao/models/product.model.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
      const products = await Product.find().lean().exec();
      res.render('home', { products });
    } catch (error) {
      console.log('Error al leer los productos:', error);
      res.status(500).json({ error: 'Error al leer los productos' });
    }
  });
  
  router.get('/realtimeproducts', async (req, res) => {
    try {
      const products = await Product.find().lean().exec();
      res.render('realTimeProducts', { products });
    } catch (error) {
      console.log('Error al leer los productos en tiempo real:', error);
      res.status(500).json({ error: 'Error al leer los productos en tiempo real' });
    }
  });
  
  export default router;