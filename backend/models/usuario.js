const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true, lowercase: true },
    tipoUsuario: { type: String, required: true, enum: ["cliente", "admin"] },
    password: { type: String, required: true },
    telefono: { type: String, default: '' },
    direccion: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);