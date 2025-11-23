export interface AppUser {
  uid: string;
  nombre?: string;
  correo?: string;
  foto?: string;
  rol?: 'Admin' | 'Programador' | 'Usuario';
  especialidad?: string;
  descripcion?: string;
  redes?: { [key: string]: string };
}
