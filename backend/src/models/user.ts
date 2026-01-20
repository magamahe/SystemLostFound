//==================== USER MODEL ==========================//

// para el dia de mañana poder reutilizar estos tipos en otros archivos
export type Role = "admin" | "user";

//==========================
// --- USER INTERFACE ---
//=========================
export interface User {
  id: string;
  username: string;
  password: string; // contraseña hasheada
  role: Role;
  isBanned: boolean; // <-- Nuevo campo
}