import multer from 'multer';

// --- CONFIGURACIÓN DE MEMORIA ---
// Al usar memoryStorage, el archivo se guarda temporalmente en el objeto 'req.file.buffer'
// y NUNCA se escribe en la carpeta 'uploads' de forma automática.
const storage = multer.memoryStorage();

// Filtro de seguridad opcional: solo imágenes
const fileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo no es una imagen'), false);
    }
};

export const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5MB
    }
});