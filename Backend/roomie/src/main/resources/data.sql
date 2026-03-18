-- ============================================================
--  ROOMIE - Script de datos de prueba
--  Orden: usuario → piso → alquiler → foto → favorito → feedback
-- ============================================================

-- ============================================================
-- 1. USUARIOS (15 registros)
--    Roles: 10 USUARIO, 3 OWNER (se asignarán al crear los pisos),
--           2 ADMINISTRADOR
--    Contraseñas en texto plano (sin BCrypt, como está el proyecto ahora)
--    aceptado=true en todos salvo admins pendientes
-- ============================================================

INSERT INTO usuario (dni, nombre, apellido1, apellido2, anio_nacimiento,
    genero, telefono, email, nombre_usuario, password,
    mensaje_presentacion, foto, bloqueado, aceptado, rol)
VALUES
-- Administradores
('12345678A', 'Carlos',  'Fernández', 'López',   '1985-03-12', 'HOMBRE', '611111111',
 'carlos.admin@roomie.com',  'carlos_admin',   'Admin1234!',
 'Administrador principal', 'https://i.pravatar.cc/150?img=1',  false, true,  'ADMINISTRADOR'),

('87654321B', 'Lucía',   'Martínez',  'García',  '1990-07-25', 'MUJER',  '622222222',
 'lucia.admin@roomie.com',   'lucia_admin',    'Admin5678!',
 'Administradora en prácticas', 'https://i.pravatar.cc/150?img=2', false, false, 'ADMINISTRADOR'),

-- Owners (empiezan como USUARIO; cambian a OWNER cuando crean su piso)
('11111111C', 'Andrés',  'Ruiz',      'Pérez',   '1995-01-15', 'HOMBRE', '633333333',
 'andres.owner@roomie.com',  'andres_owner',   'Pass1234!',
 'Owner del Piso 1',  'https://i.pravatar.cc/150?img=3', false, true,  'OWNER'),

('22222222D', 'Sofía',   'Gómez',     'Sánchez', '1997-09-05', 'MUJER',  '644444444',
 'sofia.owner@roomie.com',   'sofia_owner',    'Pass1234!',
 'Owner del Piso 2', 'https://i.pravatar.cc/150?img=4', false, true,  'OWNER'),

('33333333E', 'Javier',  'Moreno',    'Jiménez', '1993-04-20', 'HOMBRE', '655555555',
 'javier.owner@roomie.com',  'javier_owner',   'Pass1234!',
 'Owner del Piso 3', 'https://i.pravatar.cc/150?img=5', false, true,  'OWNER'),

-- Usuarios normales
('44444444F', 'Elena',   'Torres',    'Díaz',    '1999-06-30', 'MUJER',  '666666666',
 'elena@roomie.com',         'elena_user',     'Pass1234!',
 'Busco piso tranquilo', 'https://i.pravatar.cc/150?img=6', false, true,  'USUARIO'),

('55555555G', 'Pablo',   'Ramírez',   'Vega',    '2000-02-14', 'HOMBRE', '677777777',
 'pablo@roomie.com',         'pablo_user',     'Pass1234!',
 'Estudiante universitario', 'https://i.pravatar.cc/150?img=7', false, true,  'USUARIO'),

('66666666H', 'Marta',   'López',     'Navarro', '1998-11-03', 'MUJER',  '688888888',
 'marta@roomie.com',         'marta_user',     'Pass1234!',
 'Me gusta el orden y la limpieza', 'https://i.pravatar.cc/150?img=8', false, true,  'USUARIO'),

('77777777I', 'Diego',   'Hernández', 'Castro',  '1996-08-17', 'HOMBRE', '699999999',
 'diego@roomie.com',         'diego_user',     'Pass1234!',
 'Trabajo en remoto', 'https://i.pravatar.cc/150?img=9', false, true,  'USUARIO'),

('88888888J', 'Laura',   'Alonso',    'Romero',  '2001-12-25', 'MUJER',  '600000001',
 'laura@roomie.com',         'laura_user',     'Pass1234!',
 'Recién llegada a la ciudad', 'https://i.pravatar.cc/150?img=10', false, true,  'USUARIO'),

('99999999K', 'Sergio',  'Muñoz',     'Ortega',  '1994-05-08', 'HOMBRE', '600000002',
 'sergio@roomie.com',        'sergio_user',    'Pass1234!',
 'Amante del deporte', 'https://i.pravatar.cc/150?img=11', false, true,  'USUARIO'),

('10101010L', 'Carmen',  'Gil',       'Molina',  '1999-03-22', 'MUJER',  '600000003',
 'carmen@roomie.com',        'carmen_user',    'Pass1234!',
 'Tranquila y respetuosa', 'https://i.pravatar.cc/150?img=12', false, true,  'USUARIO'),

('20202020M', 'Rubén',   'Iglesias',  'Guerrero','1997-07-11', 'HOMBRE', '600000004',
 'ruben@roomie.com',         'ruben_user',     'Pass1234!',
 'Tengo mascota (gato)', 'https://i.pravatar.cc/150?img=13', false, true,  'USUARIO'),

('30303030N', 'Alba',    'Santos',    'Ramos',   '2002-01-30', 'MUJER',  '600000005',
 'alba@roomie.com',          'alba_user',      'Pass1234!',
 'Primer piso compartido', 'https://i.pravatar.cc/150?img=14', false, true,  'USUARIO'),

('40404040O', 'Iván',    'Campos',    'Serrano', '1995-10-09', 'HOMBRE', '600000006',
 'ivan@roomie.com',          'ivan_user',      'Pass1234!',
 'Busco ambiente universitario', 'https://i.pravatar.cc/150?img=15', false, true,  'USUARIO');


-- ============================================================
-- 2. PISOS (5 registros)
--    owner ids: Andrés(3), Sofía(4), Javier(5)
--    Dos pisos extra para filtros y casos borde
-- ============================================================

INSERT INTO piso (direccion, descripcion, tamanio_piso, precio_mes,
    num_total_habitaciones, num_ocupantes_actual, f_publicacion,
    garaje, animales, wifi, tabaco, id_owner)
VALUES
-- Piso 1: Andrés owner, 3 habitaciones, ahora con 2 ocupantes (andrés + alguien)
('Calle Gran Vía 10, 1ºA, Madrid',
 'Piso luminoso en el centro, cocina equipada y salón amplio.',
 90, 1200.00, 3, 2, '2024-09-01', true,  false, true,  false, 3),

-- Piso 2: Sofía owner, 4 habitaciones, 2 ocupantes
('Avenida de la Constitución 55, 3ºB, Sevilla',
 'Piso moderno, todas las habitaciones exteriores, zona universitaria.',
 110, 1000.00, 4, 2, '2024-10-15', false, true,  true,  false, 4),

-- Piso 3: Javier owner, 2 habitaciones, 1 ocupante (solo él)
('Calle Balmes 77, 5ºC, Barcelona',
 'Estudio reformado, muy tranquilo, ideal para trabajadores.',
 60, 900.00, 2, 1, '2025-01-10', false, false, true,  false, 5),

-- Piso 4: Andrés owner, segundo piso (para probar que luego se cede/elimina)
('Calle Fuencarral 30, 2ºD, Madrid',
 'Piso compartido céntrico, amueblado, 5 habitaciones.',
 130, 1500.00, 5, 1, '2025-02-01', true,  true,  true,  true,  3),

-- Piso 5: Sofía owner — completo (para probar que NO aparece en búsquedas libres)
('Paseo de Gracia 100, 4ºA, Barcelona',
 'Piso de lujo, completamente lleno.',
 150, 2000.00, 2, 2, '2025-03-01', true,  false, true,  false, 4);


-- ============================================================
-- 3. ALQUILERES (20 registros)
--
--  Regla de negocio:
--    · Al crear un piso el owner recibe un alquiler ACEPTADA automático
--    · Los ids se asignan por orden de inserción
--
--  Mapa de pisos e ids:
--    piso 1 (Gran Vía)       → owner Andrés (id 3)
--    piso 2 (Constitución)   → owner Sofía  (id 4)
--    piso 3 (Balmes)         → owner Javier (id 5)
--    piso 4 (Fuencarral)     → owner Andrés (id 3) [segundo piso]
--    piso 5 (Gracia)         → owner Sofía  (id 4)
-- ============================================================

INSERT INTO alquiler (f_solicitud, f_inicio, f_fin, estado_solicitud, id_usuario, id_piso)
VALUES
-- === ALQUILERES AUTOMÁTICOS DE OWNERS (ACEPTADA) ===
-- Andrés vive en piso 1
('2024-09-01', '2024-09-01', NULL, 'ACEPTADA', 3, 1),
-- Sofía vive en piso 2
('2024-10-15', '2024-10-15', NULL, 'ACEPTADA', 4, 2),
-- Javier vive en piso 3
('2025-01-10', '2025-01-10', NULL, 'ACEPTADA', 5, 3),
-- Andrés también vive en piso 4 (segundo piso suyo)
('2025-02-01', '2025-02-01', NULL, 'ACEPTADA', 3, 4),
-- Sofía vive en piso 5
('2025-03-01', '2025-03-01', NULL, 'ACEPTADA', 4, 5),

-- === SOLICITUDES ACEPTADAS (compañeros ya viviendo) ===
-- Elena (6) vive en piso 1 con Andrés
('2024-09-05', '2024-09-10', NULL, 'ACEPTADA', 6, 1),
-- Marta (8) vive en piso 2 con Sofía
('2024-10-20', '2024-11-01', NULL, 'ACEPTADA', 8, 2),
-- Laura (10) vive en piso 5 con Sofía (piso completo)
('2025-03-02', '2025-03-05', NULL, 'ACEPTADA', 10, 5),

-- === SOLICITUDES PENDIENTES (para probar el endpoint del owner) ===
-- Pablo (7) solicita piso 1
('2025-04-01', '2025-05-01', NULL, 'PENDIENTE', 7, 1),
-- Diego (9) solicita piso 2
('2025-04-05', '2025-05-01', NULL, 'PENDIENTE', 9, 2),
-- Carmen (12) solicita piso 3 (solo Javier allí)
('2025-04-10', '2025-06-01', NULL, 'PENDIENTE', 12, 3),
-- Rubén (13) solicita piso 1
('2025-04-12', '2025-05-15', NULL, 'PENDIENTE', 13, 1),
-- Alba (14) solicita piso 2
('2025-04-15', '2025-05-20', NULL, 'PENDIENTE', 14, 2),

-- === SOLICITUDES RECHAZADAS (para historial) ===
-- Sergio (11) rechazado en piso 1
('2025-01-10', '2025-02-01', NULL, 'RECHAZADA', 11, 1),
-- Iván (15) rechazado en piso 2
('2025-01-20', '2025-02-15', NULL, 'RECHAZADA', 15, 2),

-- === SOLICITUDES CANCELADAS (para historial) ===
-- Pablo (7) canceló una solicitud anterior al piso 3
('2025-02-01', '2025-03-01', NULL, 'CANCELADA', 7, 3),
-- Diego (9) canceló solicitud al piso 4
('2025-02-10', '2025-03-10', NULL, 'CANCELADA', 9, 4),

-- === SOLICITUDES FINALIZADAS (para historial y activar feedbacks) ===
-- Sergio (11) vivió y salió del piso 2
('2024-11-01', '2024-11-10', '2025-02-28', 'FINALIZADA', 11, 2),
-- Iván (15) vivió y salió del piso 1
('2024-09-15', '2024-09-20', '2025-01-31', 'FINALIZADA', 15, 1),
-- Carmen (12) vivió y salió del piso 3
('2025-01-15', '2025-01-20', '2025-03-31', 'FINALIZADA', 12, 3);


-- ============================================================
-- 4. FOTOS (18 registros — al menos 3 por piso)
-- ============================================================

INSERT INTO foto (url, id_piso)
VALUES
-- Piso 1
('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 1),
('https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800', 1),
('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 1),
-- Piso 2
('https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 2),
('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 2),
('https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800', 2),
-- Piso 3
('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', 3),
('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 3),
('https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', 3),
-- Piso 4
('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 4),
('https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800', 4),
('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 4),
-- Piso 5
('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 5),
('https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 5),
('https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800', 5),
('https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800', 1),
('https://images.unsplash.com/photo-1560448075-bb485b067938?w=800', 2),
('https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800', 3);


-- ============================================================
-- 5. FAVORITOS (15 registros)
--    Usuarios marcan pisos como favoritos
-- ============================================================

INSERT INTO favorito (id_usuario, id_piso, fecha)
VALUES
(6,  2, '2025-03-01 10:00:00'),
(6,  3, '2025-03-02 11:30:00'),
(7,  2, '2025-03-05 09:15:00'),
(7,  3, '2025-03-06 14:00:00'),
(8,  1, '2025-03-07 16:45:00'),
(9,  1, '2025-03-08 08:00:00'),
(9,  3, '2025-03-09 12:00:00'),
(10, 3, '2025-03-10 17:30:00'),
(10, 4, '2025-03-11 11:00:00'),
(11, 1, '2025-03-12 09:45:00'),
(11, 4, '2025-03-13 15:00:00'),
(12, 2, '2025-03-14 13:30:00'),
(13, 3, '2025-03-15 10:15:00'),
(14, 1, '2025-03-16 18:00:00'),
(15, 4, '2025-03-17 20:00:00');


-- ============================================================
-- 6. FEEDBACKS (20 registros)
--
--  Escenarios cubiertos:
--    A) NO_DISPONIBLE: usuarios que aún conviven (Andrés↔Elena en piso1,
--       Sofía↔Marta en piso2)
--    B) PENDIENTE: Sergio salió del piso2, Iván salió del piso1,
--       Carmen salió del piso3 → sus feedbacks pasan a PENDIENTE
--    C) VALORADO: algunos feedbacks ya completados para probar media
--       y visibilidad
--
--  NOTA: visible=true por defecto; se ponen algunos a false para
--        probar el toggle del administrador.
-- ============================================================

INSERT INTO feedback (id_usuario_pone, id_usuario_recibe, calificacion,
    descripcion, fecha, visible, estado_feedback)
VALUES
-- === A) NO_DISPONIBLE — compañeros que aún conviven ===
-- Andrés(3) ↔ Elena(6) en piso 1
(3,  6,  1, NULL, NULL, true, 'NO_DISPONIBLE'),
(6,  3,  1, NULL, NULL, true, 'NO_DISPONIBLE'),
-- Sofía(4) ↔ Marta(8) en piso 2
(4,  8,  1, NULL, NULL, true, 'NO_DISPONIBLE'),
(8,  4,  1, NULL, NULL, true, 'NO_DISPONIBLE'),
-- Sofía(4) ↔ Laura(10) en piso 5
(4,  10, 1, NULL, NULL, true, 'NO_DISPONIBLE'),
(10, 4,  1, NULL, NULL, true, 'NO_DISPONIBLE'),

-- === B) PENDIENTE — ex-compañeros aún sin valorar ===
-- Sergio(11) salió del piso2: puede valorar a Sofía(4) y Marta(8)
(11, 4,  1, NULL, NULL, true, 'PENDIENTE'),
(4,  11, 1, NULL, NULL, true, 'PENDIENTE'),
(11, 8,  1, NULL, NULL, true, 'PENDIENTE'),
(8,  11, 1, NULL, NULL, true, 'PENDIENTE'),
-- Iván(15) salió del piso1: puede valorar a Andrés(3) y Elena(6)
(15, 3,  1, NULL, NULL, true, 'PENDIENTE'),
(3,  15, 1, NULL, NULL, true, 'PENDIENTE'),
(15, 6,  1, NULL, NULL, true, 'PENDIENTE'),
(6,  15, 1, NULL, NULL, true, 'PENDIENTE'),

-- === C) VALORADO — feedbacks ya completados ===
-- Carmen(12) salió del piso3 y valoró a Javier(5) y viceversa
(12, 5,  4, 'Javier es muy buen compañero, ordenado y tranquilo.',
 '2025-04-01', true,  'VALORADO'),
(5,  12, 5, 'Carmen super limpia y respetuosa, la recomiendo.',
 '2025-04-02', true,  'VALORADO'),
-- Sergio(11) valora a Marta(8) (ya valorado)
(11, 8,  3, 'Buen rollo pero algo ruidosa por las noches.',
 '2025-04-05', true,  'VALORADO'),
-- Feedback oculto por el administrador (para probar toggle)
(8,  11, 2, 'Dejaba la cocina sucia con frecuencia.',
 '2025-04-06', false, 'VALORADO'),
-- Iván(15) valora a Elena(6)
(15, 6,  5, 'Elena es la mejor compañera de piso que he tenido.',
 '2025-04-10', true,  'VALORADO'),
-- Elena(6) valora a Iván(15)
(6,  15, 4, 'Iván es muy majo aunque a veces trae amigos sin avisar.',
 '2025-04-11', true,  'VALORADO');


-- ============================================================
-- RESUMEN DE IDs ÚTILES PARA POSTMAN
-- ============================================================
-- Usuarios:
--   1  → Carlos  (ADMINISTRADOR, aceptado)
--   2  → Lucía   (ADMINISTRADOR, pendiente aceptación)
--   3  → Andrés  (OWNER piso1 y piso4)
--   4  → Sofía   (OWNER piso2 y piso5)
--   5  → Javier  (OWNER piso3)
--   6  → Elena   (USUARIO, vive en piso1)
--   7  → Pablo   (USUARIO, solicitud pendiente en piso1)
--   8  → Marta   (USUARIO, vive en piso2)
--   9  → Diego   (USUARIO, solicitud pendiente en piso2)
--  10  → Laura   (USUARIO, vive en piso5)
--  11  → Sergio  (USUARIO, ex-residente piso2)
--  12  → Carmen  (USUARIO, ex-residente piso3, solicitud pendiente piso3)
--  13  → Rubén   (USUARIO, solicitud pendiente piso1)
--  14  → Alba    (USUARIO, solicitud pendiente piso2)
--  15  → Iván    (USUARIO, ex-residente piso1)
--
-- Pisos:
--   1 → Gran Vía Madrid    (3 hab, 2 ocup, LIBRE)
--   2 → Constitución Sev.  (4 hab, 2 ocup, LIBRE)
--   3 → Balmes Barcelona   (2 hab, 1 ocup, LIBRE)
--   4 → Fuencarral Madrid  (5 hab, 1 ocup, LIBRE)
--   5 → Gracia Barcelona   (2 hab, 2 ocup, COMPLETO - no aparece en búsquedas)
--
-- Alquileres (ids aproximados por orden de inserción):
--   1-5   → Alquileres ACEPTADA de owners
--   6-7   → ACEPTADA Elena en piso1, Marta en piso2
--   8     → ACEPTADA Laura en piso5
--   9-13  → PENDIENTE (Pablo→p1, Diego→p2, Carmen→p3, Rubén→p1, Alba→p2)
--  14-15  → RECHAZADA (Sergio→p1, Iván→p2)
--  16-17  → CANCELADA (Pablo→p3, Diego→p4)
--  18-20  → FINALIZADA (Sergio→p2, Iván→p1, Carmen→p3)
-- ============================================================