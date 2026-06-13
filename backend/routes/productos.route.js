const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const productos = await Producto.find().populate('categoriaId');
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id).populate('categoriaId');
        if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener productos por categoría
router.get('/categoria/:categoriaId', async (req, res) => {
    try {
        const productos = await Producto.find({ categoriaId: req.params.categoriaId });
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear producto
router.post('/', async (req, res) => {
    try {
        const nuevoProducto = new Producto(req.body);
        const guardado = await nuevoProducto.save();
        res.status(201).json(guardado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
    try {
        const actualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizado) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
    try {
        const eliminado = await Producto.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;