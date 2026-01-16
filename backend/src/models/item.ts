// para el dia de mañana poder reutilizar estos tipos en otros archivos
export type Role = "admin" | "user";
export type ItemStatus = "pending" | "approved" | "rejected";

export interface Item {
  id: string;
  title: string;
  description: string;
  image: string; // Guardaremos la URL o nombre del archivo: "/uploads/foto.jpg"
  status: ItemStatus;
  type: "lost" | "found";
  phone: string;
  userId: string;
  createdAt: string;
}

