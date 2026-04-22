import { PrismaClient } from '@prisma/client';
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import mongoose from 'mongoose';
import ScoutingReport from '../../models/ScoutingReport';
import Injury from '../../models/Injury';
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedNoSQL() {
  console.log('🍃 Łączenie z MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI!);
  
  await ScoutingReport.deleteMany({});
  await Injury.deleteMany({});

  // Lista zawodników, dla których chcemy mieć bogate dane NoSQL
  const scoutingData = [
    { 
      firstName: 'Robert', lastName: 'Lewandowski', 
      report: { rating: 88, potential: 'High', pros: ['Wykończenie', 'Ustawianie się', 'Rzuty karne'], cons: ['Wiek'], notes: 'Klasyczna "dziewiątka". Mimo upływu lat, wciąż jeden z najlepszych na świecie.' },
      injury: { type: 'Przeciążenie pleców', severity: 'Lekka', days: 7, status: 'Wyleczona' }
    },
    { 
      firstName: 'Kylian', lastName: 'Mbappé', 
      report: { rating: 97, potential: 'World Class', pros: ['Szybkość', 'Dribbling', 'Wykończenie'], cons: ['Gra w obronie'], notes: 'Najgroźniejszy zawodnik w kontrataku na świecie. Samodzielnie wygrywa mecze.' }
    },
    { 
      firstName: 'Lamine', lastName: 'Yamal', 
      report: { rating: 85, potential: 'World Class', pros: ['Kreatywność', '1vs1', 'Pewność siebie'], cons: ['Budowa fizyczna'], notes: 'Największy talent La Masii od lat. Musi być prowadzony ostrożnie ze względu na wiek.' },
      injury: { type: 'Uraz mięśniowy', severity: 'Średnia', days: 14, status: 'Rehabilitacja' }
    },
    { 
      firstName: 'Jude', lastName: 'Bellingham', 
      report: { rating: 94, potential: 'World Class', pros: ['Mentalność', 'Box-to-box', 'Siła'], cons: ['Agresja'], notes: 'Lider środka pola. Niesamowita dojrzałość jak na ten wiek.' }
    },
    { 
      firstName: 'Erling', lastName: 'Haaland', 
      report: { rating: 95, potential: 'World Class', pros: ['Siła fizyczna', 'Instynkt', 'Szybkość'], cons: ['Rozegranie'], notes: 'Maszyna do strzelania goli. Wymaga odpowiedniego serwisu z bocznych sektorów.' },
      injury: { type: 'Uraz stopy', severity: 'Poważna', days: 30, status: 'W trakcie leczenia' }
    },
    { 
      firstName: 'Kevin', lastName: 'De Bruyne', 
      report: { rating: 91, potential: 'High', pros: ['Przegląd pola', 'Dośrodkowania', 'Strzał z dystansu'], cons: ['Podatność na kontuzje'], notes: 'Mózg drużyny. Każde podanie to potencjalna asysta.' },
      injury: { type: 'Zerwanie ścięgna', severity: 'Krytyczna', days: 120, status: 'Wyleczona' }
    },
    { 
      firstName: 'Vinícius', lastName: 'Júnior', 
      report: { rating: 93, potential: 'World Class', pros: ['Drybling', 'Szybkość', 'Balans'], cons: ['Decyzyjność'], notes: 'Potrafi ośmieszyć każdego obrońcę. Kluczowy w systemie Carlo Ancelottiego.' }
    },
    { 
      firstName: 'Pedri', lastName: '', 
      report: { rating: 89, potential: 'World Class', pros: ['Kontrola piłki', 'Inteligencja', 'Pressing'], cons: ['Kruchość fizyczna'], notes: 'Dyrygent środka pola. Czyta grę dwa kroki przed innymi.' },
      injury: { type: 'Uraz uda', severity: 'Średnia', days: 21, status: 'W trakcie leczenia' }
    }
  ];

  for (const data of scoutingData) {
    const player = await prisma.player.findFirst({
      where: { firstName: data.firstName, lastName: data.lastName }
    });

    if (player) {
      console.log(`📝 Generowanie raportów dla: ${player.firstName} ${player.lastName}`);

      // Tworzenie Raportu Skauta
      await ScoutingReport.create({
        playerId: player.id,
        scoutName: 'Marco Polo (Główny Skaut)',
        rating: data.report.rating,
        potential: data.report.potential,
        pros: data.report.pros,
        cons: data.report.cons,
        notes: data.report.notes,
        attributes: {
          pace: Math.floor(Math.random() * 30) + 70,
          shooting: Math.floor(Math.random() * 30) + 60,
          passing: Math.floor(Math.random() * 30) + 65,
          dribbling: Math.floor(Math.random() * 30) + 70,
          defending: Math.floor(Math.random() * 40) + 30,
          physical: Math.floor(Math.random() * 30) + 60
        }
      });

      // Tworzenie Kontuzji (jeśli zdefiniowano w obiekcie)
      if (data.injury) {
        const start = new Date();
        start.setDate(start.getDate() - data.injury.days);
        
        await Injury.create({
          playerId: player.id,
          type: data.injury.type,
          severity: data.injury.severity,
          startDate: start,
          status: data.injury.status,
          description: `Automatyczny raport medyczny: ${data.injury.type}.`
        });
      }
    }
  }

  console.log('✅ MongoDB Atlas zostało wypełnione danymi NoSQL!');
}

seedNoSQL()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await mongoose.disconnect();
  });