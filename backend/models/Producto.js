const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, unique: true },
    precio: { type: Number, required: true, min: 0 },
    imagen: { type: String, required: true },
    descripcion: { type: String, default: '' },
    stock: { type: Number, default: 10 },
    categoriaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);