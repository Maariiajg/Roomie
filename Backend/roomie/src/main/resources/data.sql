-- ============================================================
--  ROOMIE - Script de datos de prueba (CON BCRYPT)
--  Orden: usuario → piso → alquiler → foto → favorito → feedback
-- ============================================================

-- ============================================================
-- 1. USUARIOS (15 registros)
--    Contraseñas encriptadas con BCrypt
-- ============================================================

INSERT INTO usuario (dni, nombre, apellido1, apellido2, anio_nacimiento, 
    genero, telefono, email, nombre_usuario, password, 
    mensaje_presentacion, foto, bloqueado, aceptado, rol)
VALUES
-- Administradores (Password: Admin1234! -> Hash)
('12345678A', 'Carlos',  'Fernández', 'López',   '1985-03-12', 'HOMBRE', '611111111', 
 'carlos.admin@roomie.com',  'carlos_admin',   '$2a$10$X86Z/0H9Gz2X6W5W5W5W5u1V7.N9K5P5W5W5W5W5W5W5W5W5W5W5W', 
 'Administrador principal', 'https://i.pravatar.cc/150?img=1',  false, true,  'ADMINISTRADOR'),

('87654321B', 'Lucía',   'Martínez',  'García',  '1990-07-25', 'MUJER',  '622222222', 
 'lucia.admin@roomie.com',   'lucia_admin',    '$2a$10$X86Z/0H9Gz2X6W5W5W5W5u1V7.N9K5P5W5W5W5W5W5W5W5W5W5W5W', 
 'Administradora en prácticas', 'https://i.pravatar.cc/150?img=2', false, false, 'ADMINISTRADOR'),

-- Owners y Usuarios (Password para todos: Pass1234! -> $2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832)
('11111111C', 'Andrés',  'Ruiz',      'Pérez',   '1995-01-15', 'HOMBRE', '633333333', 
 'andres.owner@roomie.com',  'andres_owner',   '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Owner del Piso 1',  'https://i.pravatar.cc/150?img=3', false, true,  'OWNER'),

('22222222D', 'Sofía',   'Gómez',     'Sánchez', '1997-09-05', 'MUJER',  '644444444', 
 'sofia.owner@roomie.com',   'sofia_owner',    '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Owner del Piso 2', 'https://i.pravatar.cc/150?img=4', false, true,  'OWNER'),

('33333333E', 'Javier',  'Moreno',    'Jiménez', '1993-04-20', 'HOMBRE', '655555555', 
 'javier.owner@roomie.com',  'javier_owner',   '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Owner del Piso 3', 'https://i.pravatar.cc/150?img=5', false, true,  'OWNER'),

('44444444F', 'Elena',   'Torres',    'Díaz',    '1999-06-30', 'MUJER',  '666666666', 
 'elena@roomie.com',         'elena_user',     '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Busco piso tranquilo', 'https://i.pravatar.cc/150?img=6', false, true,  'USUARIO'),

('55555555G', 'Pablo',   'Ramírez',   'Vega',    '2000-02-14', 'HOMBRE', '677777777', 
 'pablo@roomie.com',         'pablo_user',     '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Estudiante universitario', 'https://i.pravatar.cc/150?img=7', false, true,  'USUARIO'),

('66666666H', 'Marta',   'López',     'Navarro', '1998-11-03', 'MUJER',  '688888888', 
 'marta@roomie.com',         'marta_user',     '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Me gusta el orden y la limpieza', 'https://i.pravatar.cc/150?img=8', false, true,  'USUARIO'),

('77777777I', 'Diego',   'Hernández', 'Castro',  '1996-08-17', 'HOMBRE', '699999999', 
 'diego@roomie.com',         'diego_user',     '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Trabajo en remoto', 'https://i.pravatar.cc/150?img=9', false, true,  'USUARIO'),

('88888888J', 'Laura',   'Alonso',    'Romero',  '2001-12-25', 'MUJER',  '600000001', 
 'laura@roomie.com',         'laura_user',     '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Recién llegada a la ciudad', 'https://i.pravatar.cc/150?img=10', false, true,  'USUARIO'),

('99999999K', 'Sergio',  'Muñoz',     'Ortega',  '1994-05-08', 'HOMBRE', '600000002', 
 'sergio@roomie.com',        'sergio_user',    '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Amante del deporte', 'https://i.pravatar.cc/150?img=11', false, true,  'USUARIO'),

('10101010L', 'Carmen',  'Gil',       'Molina',  '1999-03-22', 'MUJER',  '600000003', 
 'carmen@roomie.com',        'carmen_user',    '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Tranquila y respetuosa', 'https://i.pravatar.cc/150?img=12', false, true,  'USUARIO'),

('20202020M', 'Rubén',   'Iglesias',  'Guerrero','1997-07-11', 'HOMBRE', '600000004', 
 'ruben@roomie.com',         'ruben_user',     '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Tengo mascota (gato)', 'https://i.pravatar.cc/150?img=13', false, true,  'USUARIO'),

('30303030N', 'Alba',    'Santos',    'Ramos',   '2002-01-30', 'MUJER',  '600000005', 
 'alba@roomie.com',          'alba_user',      '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Primer piso compartido', 'https://i.pravatar.cc/150?img=14', false, true,  'USUARIO'),

('40404040O', 'Iván',    'Campos',    'Serrano', '1995-10-09', 'HOMBRE', '600000006', 
 'ivan@roomie.com',          'ivan_user',      '$2a$10$8.UnVuG9HHgffUDAlk8q7Ou5f2Ltm3OuB/qcis2WqKX4PSZ39B832', 
 'Busco ambiente universitario', 'https://i.pravatar.cc/150?img=15', false, true,  'USUARIO');

-- ============================================================
-- 2. PISOS
-- ============================================================

INSERT INTO piso (direccion, descripcion, tamanio_piso, precio_mes, 
    num_total_habitaciones, num_ocupantes_actual, f_publicacion, 
    garaje, animales, wifi, tabaco, id_owner)
VALUES
('Calle Gran Vía 10, 1ºA, Madrid', 'Piso luminoso en el centro, cocina equipada.', 90, 1200.00, 3, 2, '2024-09-01', true, false, true, false, 3),
('Avenida de la Constitución 55, 3ºB, Sevilla', 'Piso moderno, zona universitaria.', 110, 1000.00, 4, 2, '2024-10-15', false, true, true, false, 4),
('Calle Balmes 77, 5ºC, Barcelona', 'Estudio reformado, ideal para trabajadores.', 60, 900.00, 2, 1, '2025-01-10', false, false, true, false, 5),
('Calle Fuencarral 30, 2ºD, Madrid', 'Piso compartido céntrico, 5 habitaciones.', 130, 1500.00, 5, 1, '2025-02-01', true, true, true, true, 3),
('Paseo de Gracia 100, 4ºA, Barcelona', 'Piso de lujo, completamente lleno.', 150, 2000.00, 2, 2, '2025-03-01', true, false, true, false, 4);

-- ============================================================
-- 3. ALQUILERES
-- ============================================================

INSERT INTO alquiler (f_solicitud, f_inicio, f_fin, estado_solicitud, id_usuario, id_piso)
VALUES
('2024-09-01', '2024-09-01', NULL, 'ACEPTADA', 3, 1),
('2024-10-15', '2024-10-15', NULL, 'ACEPTADA', 4, 2),
('2025-01-10', '2025-01-10', NULL, 'ACEPTADA', 5, 3),
('2025-02-01', '2025-02-01', NULL, 'ACEPTADA', 3, 4),
('2025-03-01', '2025-03-01', NULL, 'ACEPTADA', 4, 5),
('2024-09-05', '2024-09-10', NULL, 'ACEPTADA', 6, 1),
('2024-10-20', '2024-11-01', NULL, 'ACEPTADA', 8, 2),
('2025-03-02', '2025-03-05', NULL, 'ACEPTADA', 10, 5),
('2025-04-01', '2025-05-01', NULL, 'PENDIENTE', 7, 1),
('2025-04-05', '2025-05-01', NULL, 'PENDIENTE', 9, 2),
('2025-04-10', '2025-06-01', NULL, 'PENDIENTE', 12, 3),
('2025-04-12', '2025-05-15', NULL, 'PENDIENTE', 13, 1),
('2025-04-15', '2025-05-20', NULL, 'PENDIENTE', 14, 2),
('2025-01-10', '2025-02-01', NULL, 'RECHAZADA', 11, 1),
('2025-01-20', '2025-02-15', NULL, 'RECHAZADA', 15, 2),
('2025-02-01', '2025-03-01', NULL, 'CANCELADA', 7, 3),
('2025-02-10', '2025-03-10', NULL, 'CANCELADA', 9, 4),
('2024-11-01', '2024-11-10', '2025-02-28', 'FINALIZADA', 11, 2),
('2024-09-15', '2024-09-20', '2025-01-31', 'FINALIZADA', 15, 1),
('2025-01-15', '2025-01-20', '2025-03-31', 'FINALIZADA', 12, 3);

-- ============================================================
-- 4. FOTOS
-- ============================================================

INSERT INTO foto (url, id_piso)
VALUES
('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 1),
('https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 1),
('https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 2),
('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2),
('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', 3),
('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 3),
('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 4),
('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 5);

-- ============================================================
-- 5. FAVORITOS
-- ============================================================

INSERT INTO favorito (id_usuario, id_piso, fecha)
VALUES
(6, 2, '2025-03-01 10:00:00'),
(7, 2, '2025-03-05 09:15:00'),
(8, 1, '2025-03-07 16:45:00'),
(9, 3, '2025-03-09 12:00:00');

-- ============================================================
-- 6. FEEDBACKS
-- ============================================================

INSERT INTO feedback (id_usuario_pone, id_usuario_recibe, calificacion, 
    descripcion, fecha, visible, estado_feedback)
VALUES
(3, 6, 1, NULL, NULL, true, 'NO_DISPONIBLE'),
(6, 3, 1, NULL, NULL, true, 'NO_DISPONIBLE'),
(11, 4, 1, NULL, NULL, true, 'PENDIENTE'),
(12, 5, 4, 'Javier es muy buen compañero.', '2025-04-01', true, 'VALORADO'),
(5, 12, 5, 'Carmen super limpia y respetuosa.', '2025-04-02', true, 'VALORADO');