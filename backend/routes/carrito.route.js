const express = require('express');
const router = express.Router();
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

// Obtener carrito de un usuario
router.get('/:usuarioId', async (req, res) => {
    try {
        let carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });
        if (!carrito) {
            carrito = new Carrito({ usuarioId: req.params.usuarioId, productos: [] });
            await carrito.save();
        }
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Agregar producto al carrito
router.post('/agregar', async (req, res) => {
    try {
        const { usuarioId, productoId, cantidad } = req.body;

        const producto = await Producto.findById(productoId);
        if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

        let carrito = await Carrito.findOne({ usuarioId });
        if (!carrito) {
            carrito = new Carrito({ usuarioId, productos: [] });
        }

        const indexExistente = carrito.productos.findIndex(p => p.productoId.toString() === productoId);

        if (indexExistente !== -1) {
            carrito.productos[indexExistente].cantidad += cantidad;
        } else {
            carrito.productos.push({
                productoId,
                nombre: producto.nombre,
                cantidad,
                precio: producto.precio,
                imagen: producto.imagen
            });
        }

        await carrito.save();
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar cantidad de un producto en el carrito
router.put('/actualizar', async (req, res) => {
    try {
        const { usuarioId, productoId, cantidad } = req.body;
        const carrito = await Carrito.findOne({ usuarioId });

        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

        const producto = carrito.productos.find(p => p.productoId.toString() === productoId);
        if (!producto) return res.status(404).json({ message: 'Producto no encontrado en carrito' });

        producto.cantidad = cantidad;
        await carrito.save();
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Eliminar producto del carrito
router.delete('/:usuarioId/:productoId', async (req, res) => {
    try {
        const carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });
        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

        carrito.productos = carrito.productos.filter(p => p.productoId.toString() !== req.params.productoId);
        await carrito.save();
        res.json(carrito);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Vaciar carrito
router.delete('/vaciar/:usuarioId', async (req, res) => {
    try {
        const carrito = await Carrito.findOne({ usuarioId: req.params.usuarioId });
        if (!carrito) return res.status(404).json({ message: 'Carrito no encontrado' });

        carrito.productos = [];
        await carrito.save();
        res.json({ message: 'Carrito vaciado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;