export interface PerfilUsuarioDTO {
  id: number;
  nombreUsuario: string;
  nombre: string;
  apellido1: string;
  apellido2: string;
  email: string;
  telefono: string;
  foto: string;
  mensajePresentacion: string;
  rol?: string;
  bloqueado?: boolean;
}

export interface PisoDTO {
  id: number;
  direccion: string;
  poblacion: string;
  descripcion: string;
  tamanio: number;
  precioMes: number;
  numTotalHabitaciones: number;
  numOcupantesActual: number;
  fPublicacion: string;
  garaje: boolean;
  animales: boolean;
  wifi: boolean;
  tabaco: boolean;
  estadoPiso: 'LIBRE' | 'COMPLETO' | 'INACTIVO';
  precioMesPersona: number;
  plazasLibres: number;
  owner: PerfilUsuarioDTO;
}
