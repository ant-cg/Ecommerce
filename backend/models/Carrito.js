const mongoose = require('mongoose');

const carritoSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true, unique: true },
    productos: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 1, default: 1 },
        precio: { type: Number, required: true },
        imagen: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Carrito', carritoSchema);