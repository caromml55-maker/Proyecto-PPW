export interface Notification {
  idNotification: string;
  fechaHora: string;
  mensaje: string;
  leido: boolean;
  usuarioId: string;
}

export interface Horario {
  idHorario: string;
  fecha: string;
  inicio: string;
  fin: string;
  programadorId: string;
}

export interface Portafolio {
  idPortafolio: string;
  nombre: string;
  descripcion: string;
  tecnologias: string;
  tipo: string;
  tipoParticipacion: string;
  urlRepositorio: string;
  enlaceDemo: string;
  expandido: boolean;
  uidProgramador: string;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  createdAt: string;
}

export interface Asesoria {
  idAsesoria: string;
  comentario: string;
  estado: string;
  fechaHora: string;
  programadorId: string;
  respuesta: string;
  usuarioId: string;
}

