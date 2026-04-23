export interface AlquilerDTO {
  id: number;
  fSolicitud: string;
  fechaInicio: string;
  fInicio: string;
  fFin: string | null;
  estadoSolicitud: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'FINALIZADA';
  pisoId: number;
  piso: {
    id: number;
    direccion: string;
    fotoPrincipal?: string;
  };
  usuario: {
    id: number;
    nombre: string;
    apellido1: string;
    nombreUsuario: string;
  };
}
