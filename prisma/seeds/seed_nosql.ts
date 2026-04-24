import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import mongoose from 'mongoose';
import Injury from '../../models/Injury';
import TransferRumor from '../../models/TransferRumor';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedNoSQL() {
  console.log('🍃 Łączenie z MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI!);

  await Injury.deleteMany({});
  await TransferRumor.deleteMany({});

  // Lista zawodników, dla których chcemy mieć dane medyczne NoSQL
  const injuriesData = [
    {
      firstName: 'Robert',
      lastName: 'Lewandowski',
      injury: { type: 'Przeciążenie pleców', severity: 'Lekka', days: 7, status: 'Wyleczona' },
    },
    {
      firstName: 'Lamine',
      lastName: 'Yamal',
      injury: { type: 'Uraz mięśniowy', severity: 'Średnia', days: 14, status: 'Rehabilitacja' },
    },
    {
      firstName: 'Erling',
      lastName: 'Haaland',
      injury: { type: 'Uraz stopy', severity: 'Poważna', days: 30, status: 'W trakcie leczenia' },
    },
    {
      firstName: 'Kevin',
      lastName: 'De Bruyne',
      injury: { type: 'Zerwanie ścięgna', severity: 'Krytyczna', days: 120, status: 'Wyleczona' },
    },
    {
      firstName: 'Pedri',
      lastName: '',
      injury: { type: 'Uraz uda', severity: 'Średnia', days: 21, status: 'W trakcie leczenia' },
    },
    {
      firstName: 'Bukayo',
      lastName: 'Saka',
      injury: { type: 'Naciągnięcie łydki', severity: 'Lekka', days: 10, status: 'Wyleczona' },
    },
    {
      firstName: 'Jude',
      lastName: 'Bellingham',
      injury: { type: 'Skręcenie kostki', severity: 'Średnia', days: 18, status: 'Wyleczona' },
    },
    {
      firstName: 'Virgil',
      lastName: 'van Dijk',
      injury: { type: 'Stłuczenie kolana', severity: 'Lekka', days: 6, status: 'Wyleczona' },
    },
    {
      firstName: 'Lautaro',
      lastName: 'Martínez',
      injury: { type: 'Przeciążenie mięśnia dwugłowego', severity: 'Średnia', days: 12, status: 'Rehabilitacja' },
    },
    {
      firstName: 'Gavi',
      lastName: '',
      injury: { type: 'Uraz więzadła pobocznego', severity: 'Poważna', days: 45, status: 'W trakcie leczenia' },
    },
    {
      firstName: 'Kylian',
      lastName: 'Mbappé',
      injury: { type: 'Mikrouraz dwugłowego uda', severity: 'Lekka', days: 8, status: 'Wyleczona' },
    },
  ];

  for (const data of injuriesData) {
    const player = await prisma.player.findFirst({
      where: { firstName: data.firstName, lastName: data.lastName },
    });

    if (player && data.injury) {
      console.log(`🩺 Generowanie danych medycznych dla: ${player.firstName} ${player.lastName}`);

      const start = new Date();
      start.setDate(start.getDate() - data.injury.days);

      await Injury.create({
        playerId: player.id,
        type: data.injury.type,
        severity: data.injury.severity,
        startDate: start,
        status: data.injury.status,
        description: `Automatyczny raport medyczny: ${data.injury.type}.`,
      });
    }
  }

  const clubs = await prisma.club.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  const clubIdByName = new Map(clubs.map((club) => [club.name, club.id]));

  const transferRumorsData = [
    {
      firstName: 'Kylian',
      lastName: 'Mbappé',
      toClubName: 'Liverpool',
      rumor: {
        source: 'L Equipe',
        credibility: 'High',
        status: 'Active',
        rumorType: 'Transfer',
        rumoredFee: 175000000,
        salaryExpectation: 28000000,
        contractYears: 5,
        currency: 'EUR',
        links: ['https://example.com/mbappe-liverpool'],
        notes: 'Klub sonduje możliwość wielkiego transferu przy założeniu sprzedaży kilku zawodników.',
        publishedDaysAgo: 2,
        expiresInDays: 12,
      },
    },
    {
      firstName: 'Lamine',
      lastName: 'Yamal',
      toClubName: 'Paris Saint-Germain',
      rumor: {
        source: 'Marca',
        credibility: 'Medium',
        status: 'Denied',
        rumorType: 'Transfer',
        rumoredFee: 220000000,
        salaryExpectation: 18000000,
        contractYears: 6,
        currency: 'EUR',
        links: ['https://example.com/yamal-psg'],
        notes: 'Plotka szybko zdementowana przez otoczenie zawodnika.',
        publishedDaysAgo: 10,
        expiresInDays: 3,
      },
    },
    {
      firstName: 'Erling',
      lastName: 'Haaland',
      toClubName: 'Real Madrid',
      rumor: {
        source: 'The Athletic',
        credibility: 'High',
        status: 'Confirmed',
        rumorType: 'Transfer',
        rumoredFee: 200000000,
        salaryExpectation: 30000000,
        contractYears: 5,
        currency: 'EUR',
        links: ['https://example.com/haaland-real'],
        notes: 'Temat mocno zaawansowany według kilku źródeł z rynku.',
        publishedDaysAgo: 20,
        expiresInDays: 1,
      },
    },
    {
      firstName: 'Kevin',
      lastName: 'De Bruyne',
      toClubName: 'Inter Milan',
      rumor: {
        source: 'Fabrizio Romano',
        credibility: 'Medium',
        status: 'Active',
        rumorType: 'Loan',
        rumoredLoanFee: 7000000,
        salaryExpectation: 12000000,
        contractYears: 1,
        currency: 'EUR',
        links: ['https://example.com/debruyne-inter'],
        notes: 'Wariant wypożyczenia z dużym pokryciem pensji przez obecny klub.',
        publishedDaysAgo: 4,
        expiresInDays: 20,
      },
    },
    {
      firstName: 'Robert',
      lastName: 'Lewandowski',
      toClubName: 'Arsenal',
      rumor: {
        source: 'Sky Sports',
        credibility: 'Low',
        status: 'Expired',
        rumorType: 'Swap',
        salaryExpectation: 15000000,
        contractYears: 2,
        currency: 'EUR',
        links: ['https://example.com/lewy-arsenal'],
        notes: 'Wątek wymiany nie przeszedł do etapu realnych negocjacji.',
        publishedDaysAgo: 35,
        expiresInDays: -2,
      },
    },
  ];

  for (const data of transferRumorsData) {
    const player = await prisma.player.findFirst({
      where: { firstName: data.firstName, lastName: data.lastName },
      select: { id: true, clubId: true, firstName: true, lastName: true },
    });

    if (!player) {
      continue;
    }

    const toClubId = clubIdByName.get(data.toClubName) ?? null;

    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - data.rumor.publishedDaysAgo);

    const expiresAt = new Date(publishedAt);
    expiresAt.setDate(expiresAt.getDate() + data.rumor.expiresInDays);

    console.log(`🗞️ Generowanie plotki transferowej dla: ${player.firstName} ${player.lastName}`);

    await TransferRumor.create({
      playerId: player.id,
      fromClubId: player.clubId ?? null,
      toClubId,
      source: data.rumor.source,
      credibility: data.rumor.credibility,
      status: data.rumor.status,
      rumorType: data.rumor.rumorType,
      rumoredFee: data.rumor.rumoredFee,
      rumoredLoanFee: data.rumor.rumoredLoanFee,
      salaryExpectation: data.rumor.salaryExpectation,
      contractYears: data.rumor.contractYears,
      currency: data.rumor.currency,
      links: data.rumor.links,
      notes: data.rumor.notes,
      publishedAt,
      expiresAt,
    });
  }

  console.log('✅ MongoDB Atlas zostało wypełnione danymi medycznymi i plotkami transferowymi NoSQL!');
}

seedNoSQL()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
