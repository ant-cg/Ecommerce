const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const router = express.Router();



// REGISTRO
router.post('/', async (req, res) => {
    try {
        console.log("REGISTRO REQUEST BODY:", req.body);
        const { nombre, correo, tipoUsuario, password } = req.body;

        if (!nombre || !correo || !tipoUsuario || !password) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios',
                estado: 'error'
            });
        }

        const existe = await Usuario.findOne({ correo });
        if (existe) {
            return res.status(400).json({
                mensaje: 'El correo ya está registrado',
                estado: 'error'
            });
        }

        const passwordEncriptada = await bcrypt.hash(password, 10);

        const usuarioNuevo = new Usuario({
            nombre,
            correo,
            tipoUsuario,
            password: passwordEncriptada
        });

        console.log("Intentando guardar usuario:", usuarioNuevo); 

        await usuarioNuevo.save();

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            estado: 'ok'
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({
            mensaje: 'Error al registrar usuario',
            estado: 'error',
            error: error.message
        });
    }
});


// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                mensaje: 'Correo y contraseña son obligatorios',
                estado: 'error'
            });
        }

        const usuario = await Usuario.findOne({ correo });

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado',
                estado: 'error'
            });
        }

        const passwordCorrecta = await bcrypt.compare(password, usuario.password);

        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: 'Contraseña incorrecta',
                estado: 'error'
            });
        }

        const token = jwt.sign(
            { id: usuario._id, tipoUsuario: usuario.tipoUsuario, nombre: usuario.nombre },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '24h' }
        );

        res.json({
            mensaje: 'Login exitoso',
            estado: 'ok',
            token,
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                tipoUsuario: usuario.tipoUsuario
            }
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error en el login',
            estado: 'error',
            error: error.message
        });
    }
});


// LISTAR USUARIOS (SIN PASSWORD)
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password');

        res.json({
            mensaje: 'Usuarios listados',
            total: usuarios.length,
            estado: 'ok',
            usuarios
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los usuarios',
            estado: 'error',
            error: error.message
        });
    }
});


// ELIMINAR USUARIO
router.delete('/id/:id', async (req, res) => {
    try {
        const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

        if (!usuarioEliminado) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado',
                estado: 'error'
            });
        }

        res.json({
            mensaje: 'Usuario eliminado correctamente',
            estado: 'ok'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar usuario',
            estado: 'error',
            error: error.message
        });
    }
});

module.exports = router;