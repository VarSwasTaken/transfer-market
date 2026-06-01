import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import mongoose from 'mongoose';
import Injury from '../../models/Injury';
import TransferRumor from '../../models/TransferRumor';
import PlayerValuation from '../../models/PlayerValuation';
import ClubValuation from '../../models/ClubValuation';
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
  await PlayerValuation.deleteMany({});
  await ClubValuation.deleteMany({});

  // Lista zawodników, dla których chcemy mieć dane medyczne NoSQL
  const injuryTypeMap: Record<string, { pl: string; en: string }> = {
    'Przeciążenie pleców': { pl: 'Przeciążenie pleców', en: 'Back strain' },
    'Uraz mięśniowy': { pl: 'Uraz mięśniowy', en: 'Muscle strain' },
    'Uraz stopy': { pl: 'Uraz stopy', en: 'Foot injury' },
    'Zerwanie ścięgna': { pl: 'Zerwanie ścięgna', en: 'Tendon rupture' },
    'Uraz uda': { pl: 'Uraz uda', en: 'Thigh injury' },
    'Naciągnięcie łydki': { pl: 'Naciągnięcie łydki', en: 'Calf strain' },
    'Skręcenie kostki': { pl: 'Skręcenie kostki', en: 'Ankle sprain' },
    'Stłuczenie kolana': { pl: 'Stłuczenie kolana', en: 'Knee contusion' },
    'Przeciążenie mięśnia dwugłowego': { pl: 'Przeciążenie mięśnia dwugłowego', en: 'Biceps strain' },
    'Uraz więzadła pobocznego': { pl: 'Uraz więzadła pobocznego', en: 'Ligament injury' },
    'Mikrouraz dwugłowego uda': { pl: 'Mikrouraz dwugłowego uda', en: 'Hamstring micro-tear' },
  };

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

      const injuryTypeData = injuryTypeMap[data.injury.type] || { pl: data.injury.type, en: data.injury.type };

      await Injury.create({
        playerId: player.id,
        playerFirstName: player.firstName,
        playerLastName: player.lastName,
        type_PL: injuryTypeData.pl,
        type_EN: injuryTypeData.en,
        severity: data.injury.severity,
        startDate: start,
        status: data.injury.status,
        description_PL: `Automatyczny raport medyczny: ${injuryTypeData.pl}.`,
        description_EN: `Automatic medical report: ${injuryTypeData.en}.`,
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
      playerFirstName: player.firstName,
      playerLastName: player.lastName,
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
      notes_PL: data.rumor.notes,
      notes_EN: data.rumor.notes,
      publishedAt,
      expiresAt,
    });
  }

  // --- Player valuations (NoSQL) ---
  const valuationsData = [
    {
      firstName: 'Robert',
      lastName: 'Lewandowski',
      valuations: [
        { year: 2024, month: 6, value: 30000000 },
        { year: 2025, month: 1, value: 32000000 },
      ],
    },
    {
      firstName: 'Erling',
      lastName: 'Haaland',
      valuations: [
        { year: 2024, month: 8, value: 170000000 },
        { year: 2025, month: 3, value: 180000000 },
      ],
    },
    {
      firstName: 'Lamine',
      lastName: 'Yamal',
      valuations: [
        { year: 2024, month: 9, value: 45000000 },
        { year: 2025, month: 2, value: 60000000 },
      ],
    },
    {
      firstName: 'Kylian',
      lastName: 'Mbappé',
      valuations: [
        { year: 2023, month: 11, value: 160000000 },
        { year: 2024, month: 6, value: 170000000 },
        { year: 2025, month: 2, value: 175000000 },
      ],
    },
  ];

  for (const entry of valuationsData) {
    const player = await prisma.player.findFirst({
      where: { firstName: entry.firstName, lastName: entry.lastName },
      select: { id: true, firstName: true, lastName: true },
    });

    if (!player) continue;

    console.log(`💰 Generowanie historycznych wycen dla: ${player.firstName} ${player.lastName}`);

    for (const val of entry.valuations) {
      try {
        await PlayerValuation.create({
          playerId: player.id,
          playerFirstName: player.firstName,
          playerLastName: player.lastName,
          year: val.year,
          month: val.month,
          value: val.value,
          currency: 'EUR',
        });
      } catch {
        // ignorujemy duplikaty lub błędy podczas seedowania
      }
    }
  }

  // --- Club valuations (aggregate sum of player valuations per club per year) ---
  const allClubs = await prisma.club.findMany({
    select: { id: true, name: true },
  });

  for (const club of allClubs) {
    // Get all players in this club
    const clubPlayers = await prisma.player.findMany({
      where: { clubId: club.id },
      select: { id: true },
    });

    if (clubPlayers.length === 0) continue;

    const playerIds = clubPlayers.map((p) => p.id);

    // Get all years from PlayerValuation for these players
    const playerVals = await PlayerValuation.find({ playerId: { $in: playerIds } });

    // Group by year and sum
    const valuesByYear = new Map<number, number>();
    for (const pv of playerVals) {
      const current = valuesByYear.get(pv.year) || 0;
      valuesByYear.set(pv.year, current + pv.value);
    }

    // Also include current year from Prisma marketValue
    const currentYear = new Date().getFullYear();
    const clubPlayersSql = await prisma.player.findMany({
      where: { clubId: club.id },
      select: { marketValue: true },
    });
    const currentYearValue = clubPlayersSql.reduce((sum, p) => sum + (p.marketValue?.toNumber() ?? 0), 0);
    if (currentYearValue > 0) {
      valuesByYear.set(currentYear, currentYearValue);
    }

    // Create ClubValuation records
    for (const [year, value] of valuesByYear.entries()) {
      try {
        await ClubValuation.create({
          clubId: club.id,
          year,
          value,
          currency: 'EUR',
        });
      } catch {
        // ignorujemy duplikaty
      }
    }
  }

  console.log('✅ MongoDB Atlas zostało wypełnione danymi medycznymi i plotkami transferowymi NoSQL!');
}

seedNoSQL()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });
