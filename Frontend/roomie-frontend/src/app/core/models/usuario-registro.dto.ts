export enum Genero {
  HOMBRE = 'HOMBRE',
  MUJER = 'MUJER'
}

export interface UsuarioRegistroDTO {
  dni?: string;
  nombre?: string;
  apellido1?: string;
  apellido2?: string;
  anioNacimiento?: string; // Formato YYYY-MM-DD
  genero?: Genero;
  telefono?: string;
  email?: string;
  nombreUsuario?: string;
  password?: string;
  repetirPassword?: string;
  foto?: string;
  mensajePresentacion?: string;
}
