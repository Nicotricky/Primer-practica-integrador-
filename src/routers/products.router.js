import { Router } from "express";
import fs from 'fs';
import Product from '../dao/models/product.model.js';

const router = Router();

const filePathProducts = './src/productos.json';

router.get('/', async (req, res) => {
  console.log('¡Solicitud recibida!');
  const limit = req.query.limit || 0
  try {
    const products = await Product.find().limit(limit).lean().exec();
    //const products = JSON.parse(data);
    if (!limit) {
      res.status(200).json({ products });
    } else {
      const productsLimit = products.slice(0, limit);
      res.status(200).json({ products: productsLimit });
    }
  } catch (error) {
    console.log('Error al leer el archivo:', error);
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
});

router.get('/:pid', async (req, res) => {
  const id = req.params.pid;
  try {
    const product = await Product.findById(id).lean().exec();
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    console.log('Error al leer el producto:', error);
    res.status(500).json({ error: 'Error al leer el producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const product = req.body
    const result = await Product.create(product);
    const products = await Product.find().lean().exec();
    req.io.emit('productList', products); // emite el evento updatedProducts con la lista de productos
    res.status(201).json({ status: 'success', payload: result });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;
    const updatedFields = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedFields, {
      new: true // Para devolver el documento actualizado
    }).lean().exec();

    if (!updatedProduct) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const products = await Product.find().lean().exec();

    req.io.emit('productList', products);

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.log('Error al actualizar el producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const productId = req.params.pid;

    const deletedProduct = await Product.findByIdAndDelete(productId).lean().exec();

    if (!deletedProduct) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    const products = await Product.find().lean().exec();

    req.io.emit('productList', products);

    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    console.log('Error al eliminar el producto:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

export default router; 