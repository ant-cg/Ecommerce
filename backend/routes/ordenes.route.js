const express = require('express');
const router = express.Router();
const Orden = require('../models/Orden');
const Carrito = require('../models/Carrito');

// Crear orden desde el carrito
router.post('/', async (req, res) => {
    try {
        const { usuarioId, direccion, telefono } = req.body;

        const carrito = await Carrito.findOne({ usuarioId });
        if (!carrito || carrito.productos.length === 0) {
            return res.status(400).json({ message: 'Carrito vacío' });
        }

        let subtotal = 0;
        const productosOrden = carrito.productos.map(p => {
            const totalProducto = p.cantidad * p.precio;
            subtotal += totalProducto;
            return {
                productoId: p.productoId,
                nombre: p.nombre,
                cantidad: p.cantidad,
                precio: p.precio
            };
        });

        const iva = subtotal * 0.13;
        const total = subtotal + iva;

        const nuevaOrden = new Orden({
            usuarioId,
            productos: productosOrden,
            subtotal,
            iva,
            total,
            direccion,
            telefono
        });

        await nuevaOrden.save();

        carrito.productos = [];
        await carrito.save();

        res.status(201).json(nuevaOrden);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener órdenes de un usuario
router.get('/usuario/:usuarioId', async (req, res) => {
    try {
        const ordenes = await Orden.find({ usuarioId: req.params.usuarioId }).sort({ createdAt: -1 });
        res.json(ordenes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener orden por ID
router.get('/:id', async (req, res) => {
    try {
        const orden = await Orden.findById(req.params.id);
        if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
        res.json(orden);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar estado de orden
router.put('/:id/estado', async (req, res) => {
    try {
        const { estado } = req.body;
        const orden = await Orden.findByIdAndUpdate(
            req.params.id,
            { estado },
            { new: true }
        );
        if (!orden) return res.status(404).json({ message: 'Orden no encontrada' });
        res.json(orden);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;