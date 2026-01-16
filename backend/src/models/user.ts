export type Role = "admin" | "user";

export interface User {
  id: string;
  username: string;
  password: string; // contraseña hasheada
  role: Role;
  isBanned: boolean; // <-- Nuevo campo
}