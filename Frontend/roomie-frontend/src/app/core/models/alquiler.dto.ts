export interface AlquilerDTO {
  id: number;
  fSolicitud: string;
  fInicio: string;
  fFin: string | null;
  estadoSolicitud: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'FINALIZADA';
  piso: {
    id: number;
    direccion: string;
    fotoPrincipal?: string;
  };
}
