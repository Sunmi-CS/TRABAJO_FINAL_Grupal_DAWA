import { PrismaClient, Role, Provider, ReservationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Limpiar datos existentes
  await prisma.reservation.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();

  // ── Crear usuarios ────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('petcare123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Admin PetCare',
      email: 'admin@petcare.com',
      password: hashedPassword,
      role: Role.ADMIN,
      provider: Provider.LOCAL,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    },
  });

  const cliente1 = await prisma.user.create({
    data: {
      name: 'María García',
      email: 'maria@example.com',
      password: hashedPassword,
      role: Role.CLIENTE,
      provider: Provider.LOCAL,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    },
  });

  const cliente2 = await prisma.user.create({
    data: {
      name: 'Carlos López',
      email: 'carlos@example.com',
      password: hashedPassword,
      role: Role.CLIENTE,
      provider: Provider.LOCAL,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
    },
  });

  const cliente3 = await prisma.user.create({
    data: {
      name: 'Ana Martínez',
      email: 'ana@example.com',
      password: hashedPassword,
      role: Role.CLIENTE,
      provider: Provider.GOOGLE,
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    },
  });

  console.log(`✅ Usuarios creados: 4`);

  // ── Crear servicios ───────────────────────────────────────────────────────

  const service1 = await prisma.service.create({
    data: {
      name: 'Guardería por Horas',
      description: 'Cuidado personalizado de tu mascota por horas. Incluye alimentación y juego supervisado.',
      price: 15.0,
      duration: 60,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Guardería por Día',
      description: 'Cuidado completo durante todo el día (8am - 8pm). Incluye paseos, alimentación y juego.',
      price: 45.0,
      duration: 720,
    },
  });

  const service3 = await prisma.service.create({
    data: {
      name: 'Baño y Secado',
      description: 'Baño completo con shampoo premium, secado y perfume. Adecuado para todas las razas.',
      price: 25.0,
      duration: 90,
    },
  });

  const service4 = await prisma.service.create({
    data: {
      name: 'Corte de Pelo',
      description: 'Estilizado profesional según la raza y preferencia del dueño. Incluye limpieza de oídos.',
      price: 35.0,
      duration: 120,
    },
  });

  const service5 = await prisma.service.create({
    data: {
      name: 'Paseo Canino',
      description: 'Paseo de 45 minutos con guía certificado. Grupos reducidos de máximo 3 perros.',
      price: 20.0,
      duration: 45,
    },
  });

  const services = [service1, service2, service3, service4, service5];

  console.log(`✅ Servicios creados: ${services.length}`);


  // ── Crear mascotas ────────────────────────────────────────────────────────

  const pet1 = await prisma.pet.create({
    data: {
      name: 'Milo',
      species: 'Perro',
      breed: 'Golden Retriever',
      age: 3,
      weight: 28.5,
      notes: 'Muy juguetón y sociable. Le encanta el agua.',
      photoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400',
      ownerId: cliente1.id,
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      name: 'Luna',
      species: 'Gato',
      breed: 'Siamés',
      age: 2,
      weight: 4.2,
      notes: 'Muy tranquila. Prefiere espacios silenciosos.',
      photoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
      ownerId: cliente1.id,
    },
  });

  const pet3 = await prisma.pet.create({
    data: {
      name: 'Rocky',
      species: 'Perro',
      breed: 'Bulldog Francés',
      age: 4,
      weight: 12.0,
      notes: 'Tiene problemas respiratorios leves. Evitar ejercicio intenso.',
      photoUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
      ownerId: cliente2.id,
    },
  });

  const pet4 = await prisma.pet.create({
    data: {
      name: 'Coco',
      species: 'Perro',
      breed: 'Poodle',
      age: 1,
      weight: 6.5,
      notes: 'Cachorro muy activo. Necesita mucho ejercicio.',
      photoUrl: 'https://images.unsplash.com/photo-1616149664119-8e2d16e04dc7?w=400',
      ownerId: cliente3.id,
    },
  });

  const pet5 = await prisma.pet.create({
    data: {
      name: 'Simba',
      species: 'Gato',
      breed: 'Maine Coon',
      age: 5,
      weight: 7.8,
      notes: 'Le gusta ser el centro de atención. Muy cariñoso.',
      photoUrl: 'https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=400',
      ownerId: cliente3.id,
    },
  });

  const pets = [pet1, pet2, pet3, pet4, pet5];

  console.log(`✅ Mascotas creadas: ${pets.length}`);


  // ── Crear reservas ────────────────────────────────────────────────────────
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const reservation1 = await prisma.reservation.create({
    data: {
      reservationDate: tomorrow,
      reservationTime: '09:00',
      status: ReservationStatus.APPROVED,
      ownerId: cliente1.id,
      petId: pets[0].id,
      serviceId: services[1].id,
      notes: 'Por favor darle su medicina a las 2pm',
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      reservationDate: nextWeek,
      reservationTime: '10:30',
      status: ReservationStatus.PENDING,
      ownerId: cliente1.id,
      petId: pets[1].id,
      serviceId: services[2].id,
    },
  });

  const reservation3 = await prisma.reservation.create({
    data: {
      reservationDate: tomorrow,
      reservationTime: '11:00',
      status: ReservationStatus.PENDING,
      ownerId: cliente2.id,
      petId: pets[2].id,
      serviceId: services[3].id,
    },
  });

  const reservation4 = await prisma.reservation.create({
    data: {
      reservationDate: yesterday,
      reservationTime: '08:00',
      status: ReservationStatus.COMPLETED,
      ownerId: cliente2.id,
      petId: pets[2].id,
      serviceId: services[4].id,
    },
  });

  const reservation5 = await prisma.reservation.create({
    data: {
      reservationDate: lastWeek,
      reservationTime: '14:00',
      status: ReservationStatus.COMPLETED,
      ownerId: cliente3.id,
      petId: pets[3].id,
      serviceId: services[0].id,
    },
  });

  const reservation6 = await prisma.reservation.create({
    data: {
      reservationDate: lastWeek,
      reservationTime: '09:00',
      status: ReservationStatus.REJECTED,
      ownerId: cliente3.id,
      petId: pets[4].id,
      serviceId: services[1].id,
      notes: 'Cupo no disponible para esa fecha',
    },
  });

  const reservation7 = await prisma.reservation.create({
    data: {
      reservationDate: nextWeek,
      reservationTime: '16:00',
      status: ReservationStatus.PENDING,
      ownerId: cliente3.id,
      petId: pets[3].id,
      serviceId: services[2].id,
    },
  });

  const reservation8 = await prisma.reservation.create({
    data: {
      reservationDate: yesterday,
      reservationTime: '10:00',
      status: ReservationStatus.CANCELLED,
      ownerId: cliente1.id,
      petId: pets[0].id,
      serviceId: services[4].id,
      notes: 'Cancelado por enfermedad de la mascota',
    },
  });

  const reservation9 = await prisma.reservation.create({
    data: {
      reservationDate: tomorrow,
      reservationTime: '13:00',
      status: ReservationStatus.APPROVED,
      ownerId: cliente3.id,
      petId: pets[4].id,
      serviceId: services[3].id,
    },
  });

  const reservation10 = await prisma.reservation.create({
    data: {
      reservationDate: nextWeek,
      reservationTime: '08:30',
      status: ReservationStatus.PENDING,
      ownerId: cliente2.id,
      petId: pets[2].id,
      serviceId: services[0].id,
      notes: '3 horas de guardería',
    },
  });

  const reservations = [
    reservation1,
    reservation2,
    reservation3,
    reservation4,
    reservation5,
    reservation6,
    reservation7,
    reservation8,
    reservation9,
    reservation10,
  ];

  console.log(`✅ Reservas creadas: ${reservations.length}`);

  console.log('\n🎉 Seed completado exitosamente!\n');
  console.log('📋 Credenciales de prueba:');
  console.log('   Admin:    admin@petcare.com    / petcare123');
  console.log('   Cliente1: maria@example.com    / petcare123');
  console.log('   Cliente2: carlos@example.com   / petcare123');
  console.log('   Cliente3: ana@example.com      / petcare123 (Google)');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
