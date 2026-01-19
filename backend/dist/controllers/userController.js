"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserBan = exports.deleteUser = exports.getAllUsers = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dataService_1 = require("../services/dataService");
const uuid_1 = require("uuid");
// Register Controller
const register = async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await dataService_1.DataService.getUsers();
        const userRole = users.length === 0 ? "admin" : "user";
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = {
            id: (0, uuid_1.v4)(),
            username,
            password: hashedPassword,
            role: userRole,
            isBanned: false
        };
        users.push(newUser);
        await dataService_1.DataService.saveUsers(users);
        res.status(201).json({ message: "Usuario registrado con éxito" });
    }
    catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};
exports.register = register;
// Login Controller
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const users = await dataService_1.DataService.getUsers();
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (!user) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }
        if (user.isBanned) {
            return res.status(403).json({
                message: "Tu cuenta ha sido suspendida por mal comportamiento"
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret_fallback', { expiresIn: '2h' });
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    }
    catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ message: "Error al iniciar sesión" });
    }
};
exports.login = login;
// Get All Users (Solo Admin)
const getAllUsers = async (req, res) => {
    try {
        const users = await dataService_1.DataService.getUsers();
        const userList = users.map(u => ({
            id: u.id,
            username: u.username,
            role: u.role,
            isBanned: u.isBanned
        }));
        res.json(userList);
    }
    catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};
exports.getAllUsers = getAllUsers;
// Delete User Controller (Corregido para Render/Cloudinary)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const users = await dataService_1.DataService.getUsers();
        const items = await dataService_1.DataService.getItems();
        const userExists = users.find(u => u.id === id);
        if (!userExists) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        // 1. Ya no borramos archivos locales con fs.unlinkSync.
        // Al usar Cloudinary, las imágenes simplemente se quedan en la nube 
        // o se gestionan desde el panel de Cloudinary.
        // 2. ACTUALIZAR BASE DE DATOS (Filtramos al usuario y sus anuncios)
        const filteredUsers = users.filter(u => u.id !== id);
        const filteredItems = items.filter(item => item.userId !== id);
        await dataService_1.DataService.saveUsers(filteredUsers);
        await dataService_1.DataService.saveItems(filteredItems);
        res.json({ message: `Usuario ${userExists.username} y sus anuncios eliminados correctamente.` });
    }
    catch (error) {
        console.error("Error en deleteUser:", error);
        res.status(500).json({ message: "Error al eliminar" });
    }
};
exports.deleteUser = deleteUser;
// Toggle User Ban
const toggleUserBan = async (req, res) => {
    try {
        const { id } = req.params;
        const users = await dataService_1.DataService.getUsers();
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1)
            return res.status(404).json({ message: "Usuario no encontrado" });
        users[userIndex].isBanned = !users[userIndex].isBanned;
        await dataService_1.DataService.saveUsers(users);
        const status = users[userIndex].isBanned ? "suspendida" : "activada";
        res.json({ message: `La cuenta de ${users[userIndex].username} ha sido ${status}.` });
    }
    catch (error) {
        res.status(500).json({ message: "Error al procesar el baneo" });
    }
};
exports.toggleUserBan = toggleUserBan;
