const express = require('express');
const router = express.Router();
const Categoria = require('../models/Categoria');

// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const categorias = await Categoria.find();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear categoría
router.post('/', async (req, res) => {
    try {
        const nueva = new Categoria(req.body);
        const guardada = await nueva.save();
        res.status(201).json(guardada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizar categoría
router.put('/:id', async (req, res) => {
    try {
        const actualizada = await Categoria.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.json(actualizada);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
    try {
        const eliminada = await Categoria.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ message: 'Categoría no encontrada' });
        res.json({ message: 'Categoría eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;