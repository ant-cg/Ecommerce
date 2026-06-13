const mongoose = require('mongoose');

const ordenSchema = new mongoose.Schema({
    usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    productos: [{
        productoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
        nombre: { type: String, required: true },
        cantidad: { type: Number, required: true, min: 1 },
        precio: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    iva: { type: Number, required: true },
    total: { type: Number, required: true },
    estado: { 
        type: String, 
        enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'], 
        default: 'pendiente' 
    },
    direccion: { type: String, required: true },
    telefono: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Orden', ordenSchema);