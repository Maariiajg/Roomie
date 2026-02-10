INSERT INTO usuario 
(dni, nombre, apellido1, apellido2, anio_nacimiento, genero, telefono, email, nombre_usuario, password, mensaje_presentacion, foto, bloqueado, aceptado, rol)
VALUES
('12345678A','Carlos','Gómez','Ruiz','1995-04-12','HOMBRE','600111222','carlos@mail.com','carlos95','password123','Busco compañeros tranquilos',NULL,false,true,'USUARIO'),
('23456789B','Laura','Martínez','López','1998-09-22','MUJER','600222333','laura@mail.com','lauram','password123','Me encanta compartir piso',NULL,false,true,'USUARIO'),
('34567890C','Miguel','Sánchez','Pérez','1992-01-10','HOMBRE','600333444','miguel@mail.com','mike92','password123','Trabajo desde casa',NULL,false,true,'OWNER'),
('45678901D','Ana','Fernández','García','1990-06-30','MUJER','600444555','ana@mail.com','anaf','password123','Propietaria responsable',NULL,false,true,'OWNER'),
('56789012E','David','López','Moreno','1997-03-18','HOMBRE','600555666','david@mail.com','david97','password123','Estudiante de máster',NULL,false,true,'USUARIO'),
('67890123F','Marta','Ruiz','Santos','1994-11-05','MUJER','600666777','marta@mail.com','martars','password123','Ordenada y tranquila',NULL,false,true,'USUARIO'),
('78901234G','Javier','Torres','Gil','1988-02-25','HOMBRE','600777888','jtorres@mail.com','jtorres','password123','Dueño con varios pisos',NULL,false,true,'OWNER'),
('89012345H','Lucía','Navarro','Cruz','2000-07-14','MUJER','600888999','lucia@mail.com','lucian','password123','Primera vez compartiendo piso',NULL,false,true,'USUARIO'),
('90123456J','Pablo','Vega','Iglesias','1993-12-01','HOMBRE','600999000','pablo@mail.com','pablov','password123','Busco alquiler largo',NULL,false,true,'USUARIO'),
('01234567K','Admin','Sistema','', '1985-01-01','HOMBRE','611111111','admin@mail.com','admin','admin1234','Administrador',NULL,false,true,'ADMINISTRADOR');



INSERT INTO piso
(direccion, descripcion, tamanio_piso, precio_mes, num_total_habitaciones, num_ocupantes_actual, f_publicacion,
 garaje, animales, wifi, tabaco, id_owner)
VALUES
('Calle Mayor 10, Madrid','Piso céntrico y luminoso',90,900,3,1,'2025-01-10',true,false,true,false,3),
('Av. Andalucía 45, Sevilla','Ideal para estudiantes',80,700,3,2,'2025-01-15',false,true,true,false,4),
('C/ Aragón 120, Barcelona','Recién reformado',75,850,2,1,'2025-01-20',false,false,true,false,7),
('Calle Gran Vía 55, Madrid','Vistas espectaculares',120,1200,4,2,'2025-01-25',true,false,true,false,3),
('C/ Serrano 88, Madrid','Zona exclusiva',150,1600,4,1,'2025-02-01',true,false,true,false,4),
('Av. del Puerto 3, Valencia','Cerca de la playa',85,750,3,1,'2025-02-03',false,true,true,true,7),
('C/ Toledo 22, Madrid','Perfecto para compartir',95,800,3,2,'2025-02-05',false,false,true,false,3),
('C/ Colón 15, Valencia','Muy bien comunicado',70,650,2,1,'2025-02-06',false,true,true,false,4),
('Av. Diagonal 300, Barcelona','Amplio y moderno',110,1100,4,2,'2025-02-07',true,false,true,false,7),
('C/ Luna 9, Granada','Ambiente universitario',65,550,2,1,'2025-02-08',false,true,true,true,3);






INSERT INTO foto (url, id_piso) VALUES
('https://img/piso1_1.jpg',1),
('https://img/piso1_2.jpg',1),
('https://img/piso2_1.jpg',2),
('https://img/piso3_1.jpg',3),
('https://img/piso4_1.jpg',4),
('https://img/piso5_1.jpg',5),
('https://img/piso6_1.jpg',6),
('https://img/piso7_1.jpg',7),
('https://img/piso8_1.jpg',8),
('https://img/piso9_1.jpg',9);



INSERT INTO alquiler
(f_inicio, f_fin, estado_solicitud, id_usuario, id_piso)
VALUES
('2025-03-01',NULL,'PENDIENTE',1,1),
('2025-03-15','2025-09-15','ACEPTADA',2,2),
('2025-04-01',NULL,'RECHAZADA',5,3),
('2025-03-10',NULL,'ACEPTADA',6,4),
('2025-05-01',NULL,'PENDIENTE',8,5),
('2025-03-20','2025-06-20','CANCELADA',9,6),
('2025-04-15',NULL,'PENDIENTE',1,7),
('2025-02-20',NULL,'ACEPTADA',2,8),
('2025-03-05',NULL,'RECHAZADA',5,9),
('2025-04-01',NULL,'PENDIENTE',6,10);




INSERT INTO feedback
(id_usuario_pone, id_usuario_recibe, calificacion, descripcion, fecha, visible)
VALUES
(1,3,5,'Muy buen propietario','2025-02-01',true),
(2,4,4,'Piso correcto y trato amable','2025-02-02',true),
(5,3,3,'Todo bien pero algo ruidoso','2025-02-03',true),
(6,4,5,'Excelente comunicación','2025-02-04',true),
(8,7,4,'Piso limpio y ordenado','2025-02-05',true),
(9,3,2,'Problemas con el wifi','2025-02-06',true),
(1,4,5,'Muy recomendable','2025-02-07',true),
(2,7,4,'Buena experiencia','2025-02-08',true),
(5,3,1,'No cumplió lo acordado','2025-02-09',false),
(6,4,5,'Repetiría sin duda','2025-02-10',true);



INSERT INTO favorito
(id_usuario, id_piso, fecha)
VALUES
(1,2,'2025-02-01 10:00:00'),
(1,3,'2025-02-01 10:05:00'),
(2,1,'2025-02-02 11:00:00'),
(5,4,'2025-02-03 12:00:00'),
(6,5,'2025-02-04 13:00:00'),
(8,6,'2025-02-05 14:00:00'),
(9,7,'2025-02-06 15:00:00'),
(2,8,'2025-02-07 16:00:00'),
(5,9,'2025-02-08 17:00:00'),
(6,10,'2025-02-09 18:00:00');







