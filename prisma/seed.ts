import { PrismaClient, Position, PreferredFoot, TransferType } from '@prisma/client'
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Inicjalizacja bazy danych FIFA (211+ narodowości)...')

  const fifaNations = [
    // UEFA (Europa)
    { name: 'Albania', code: 'al' }, { name: 'Andorra', code: 'ad' }, { name: 'Armenia', code: 'am' },
    { name: 'Austria', code: 'at' }, { name: 'Azerbaijan', code: 'az' }, { name: 'Belarus', code: 'by' },
    { name: 'Belgium', code: 'be' }, { name: 'Bosnia and Herzegovina', code: 'ba' }, { name: 'Bulgaria', code: 'bg' },
    { name: 'Croatia', code: 'hr' }, { name: 'Cyprus', code: 'cy' }, { name: 'Czech Republic', code: 'cz' },
    { name: 'Denmark', code: 'dk' }, { name: 'England', code: 'gb-eng' }, { name: 'Estonia', code: 'ee' },
    { name: 'Faroe Islands', code: 'fo' }, { name: 'Finland', code: 'fi' }, { name: 'France', code: 'fr' },
    { name: 'Georgia', code: 'ge' }, { name: 'Germany', code: 'de' }, { name: 'Gibraltar', code: 'gi' },
    { name: 'Greece', code: 'gr' }, { name: 'Hungary', code: 'hu' }, { name: 'Iceland', code: 'is' },
    { name: 'Ireland', code: 'ie' }, { name: 'Israel', code: 'il' }, { name: 'Italy', code: 'it' },
    { name: 'Kazakhstan', code: 'kz' }, { name: 'Kosovo', code: 'xk' }, { name: 'Latvia', code: 'lv' },
    { name: 'Liechtenstein', code: 'li' }, { name: 'Lithuania', code: 'lt' }, { name: 'Luxembourg', code: 'lu' },
    { name: 'Malta', code: 'mt' }, { name: 'Moldova', code: 'md' }, { name: 'Montenegro', code: 'me' },
    { name: 'Netherlands', code: 'nl' }, { name: 'North Macedonia', code: 'mk' }, { name: 'Northern Ireland', code: 'gb-nir' },
    { name: 'Norway', code: 'no' }, { name: 'Poland', code: 'pl' }, { name: 'Portugal', code: 'pt' },
    { name: 'Romania', code: 'ro' }, { name: 'San Marino', code: 'sm' }, { name: 'Scotland', code: 'gb-sct' },
    { name: 'Serbia', code: 'rs' }, { name: 'Slovakia', code: 'sk' }, { name: 'Slovenia', code: 'si' },
    { name: 'Spain', code: 'es' }, { name: 'Sweden', code: 'se' }, { name: 'Switzerland', code: 'ch' },
    { name: 'Turkey', code: 'tr' }, { name: 'Ukraine', code: 'ua' }, { name: 'Wales', code: 'gb-wls' },

    // CONMEBOL (Ameryka Płd.)
    { name: 'Argentina', code: 'ar' }, { name: 'Bolivia', code: 'bo' }, { name: 'Brazil', code: 'br' },
    { name: 'Chile', code: 'cl' }, { name: 'Colombia', code: 'co' }, { name: 'Ecuador', code: 'ec' },
    { name: 'Paraguay', code: 'py' }, { name: 'Peru', code: 'pe' }, { name: 'Uruguay', code: 'uy' },
    { name: 'Venezuela', code: 've' },

    // CAF (Afryka)
    { name: 'Algeria', code: 'dz' }, { name: 'Angola', code: 'ao' }, { name: 'Benin', code: 'bj' },
    { name: 'Botswana', code: 'bw' }, { name: 'Burkina Faso', code: 'bf' }, { name: 'Burundi', code: 'bi' },
    { name: 'Cameroon', code: 'cm' }, { name: 'Cape Verde', code: 'cv' }, { name: 'Central African Republic', code: 'cf' },
    { name: 'Chad', code: 'td' }, { name: 'Comoros', code: 'km' }, { name: 'Congo', code: 'cg' },
    { name: 'DR Congo', code: 'cd' }, { name: 'Djibouti', code: 'dj' }, { name: 'Egypt', code: 'eg' },
    { name: 'Equatorial Guinea', code: 'gq' }, { name: 'Eritrea', code: 'er' }, { name: 'Eswatini', code: 'sz' },
    { name: 'Ethiopia', code: 'et' }, { name: 'Gabon', code: 'ga' }, { name: 'Gambia', code: 'gm' },
    { name: 'Ghana', code: 'gh' }, { name: 'Guinea', code: 'gn' }, { name: 'Guinea-Bissau', code: 'gw' },
    { name: 'Ivory Coast', code: 'ci' }, { name: 'Kenya', code: 'ke' }, { name: 'Lesotho', code: 'ls' },
    { name: 'Liberia', code: 'lr' }, { name: 'Libya', code: 'ly' }, { name: 'Madagascar', code: 'mg' },
    { name: 'Malawi', code: 'mw' }, { name: 'Mali', code: 'ml' }, { name: 'Mauritania', code: 'mr' },
    { name: 'Mauritius', code: 'mu' }, { name: 'Morocco', code: 'ma' }, { name: 'Mozambique', code: 'mz' },
    { name: 'Namibia', code: 'na' }, { name: 'Niger', code: 'ne' }, { name: 'Nigeria', code: 'ng' },
    { name: 'Rwanda', code: 'rw' }, { name: 'Sao Tome and Principe', code: 'st' }, { name: 'Senegal', code: 'sn' },
    { name: 'Seychelles', code: 'sc' }, { name: 'Sierra Leone', code: 'sl' }, { name: 'Somalia', code: 'so' },
    { name: 'South Africa', code: 'za' }, { name: 'South Sudan', code: 'ss' }, { name: 'Sudan', code: 'sd' },
    { name: 'Tanzania', code: 'tz' }, { name: 'Togo', code: 'tg' }, { name: 'Tunisia', code: 'tn' },
    { name: 'Uganda', code: 'ug' }, { name: 'Zambia', code: 'zm' }, { name: 'Zimbabwe', code: 'zw' },

    // AFC (Azja & Australia)
    { name: 'Afghanistan', code: 'af' }, { name: 'Australia', code: 'au' }, { name: 'Bahrain', code: 'bh' },
    { name: 'Bangladesh', code: 'bd' }, { name: 'Bhutan', code: 'bt' }, { name: 'Brunei', code: 'bn' },
    { name: 'Cambodia', code: 'kh' }, { name: 'China', code: 'cn' }, { name: 'Guam', code: 'gu' },
    { name: 'Hong Kong', code: 'hk' }, { name: 'India', code: 'in' }, { name: 'Indonesia', code: 'id' },
    { name: 'Iran', code: 'ir' }, { name: 'Iraq', code: 'iq' }, { name: 'Japan', code: 'jp' },
    { name: 'Jordan', code: 'jo' }, { name: 'Kuwait', code: 'kw' }, { name: 'Kyrgyzstan', code: 'kg' },
    { name: 'Laos', code: 'la' }, { name: 'Lebanon', code: 'lb' }, { name: 'Macau', code: 'mo' },
    { name: 'Malaysia', code: 'my' }, { name: 'Maldives', code: 'mv' }, { name: 'Mongolia', code: 'mn' },
    { name: 'Myanmar', code: 'mm' }, { name: 'Nepal', code: 'np' }, { name: 'North Korea', code: 'kp' },
    { name: 'Oman', code: 'om' }, { name: 'Pakistan', code: 'pk' }, { name: 'Palestine', code: 'ps' },
    { name: 'Philippines', code: 'ph' }, { name: 'Qatar', code: 'qa' }, { name: 'Saudi Arabia', code: 'sa' },
    { name: 'Singapore', code: 'sg' }, { name: 'South Korea', code: 'kr' }, { name: 'Sri Lanka', code: 'lk' },
    { name: 'Syria', code: 'sy' }, { name: 'Taiwan', code: 'tw' }, { name: 'Tajikistan', code: 'tj' },
    { name: 'Thailand', code: 'th' }, { name: 'Timor-Leste', code: 'tl' }, { name: 'Turkmenistan', code: 'tm' },
    { name: 'United Arab Emirates', code: 'ae' }, { name: 'Uzbekistan', code: 'uz' }, { name: 'Vietnam', code: 'vn' },
    { name: 'Yemen', code: 'ye' },

    // CONCACAF (Ameryka Płn. i Środkowa)
    { name: 'Anguilla', code: 'ai' }, { name: 'Antigua and Barbuda', code: 'ag' }, { name: 'Aruba', code: 'aw' },
    { name: 'Bahamas', code: 'bs' }, { name: 'Barbados', code: 'bb' }, { name: 'Belize', code: 'bz' },
    { name: 'Bermuda', code: 'bm' }, { name: 'British Virgin Islands', code: 'vg' }, { name: 'Canada', code: 'ca' },
    { name: 'Cayman Islands', code: 'ky' }, { name: 'Costa Rica', code: 'cr' }, { name: 'Cuba', code: 'cu' },
    { name: 'Curacao', code: 'cw' }, { name: 'Dominica', code: 'dm' }, { name: 'Dominican Republic', code: 'do' },
    { name: 'El Salvador', code: 'sv' }, { name: 'Grenada', code: 'gd' }, { name: 'Guatemala', code: 'gt' },
    { name: 'Guyana', code: 'gy' }, { name: 'Haiti', code: 'ht' }, { name: 'Honduras', code: 'hn' },
    { name: 'Jamaica', code: 'jm' }, { name: 'Mexico', code: 'mx' }, { name: 'Montserrat', code: 'ms' },
    { name: 'Nicaragua', code: 'ni' }, { name: 'Panama', code: 'pa' }, { name: 'Puerto Rico', code: 'pr' },
    { name: 'Saint Kitts and Nevis', code: 'kn' }, { name: 'Saint Lucia', code: 'lc' }, { name: 'Saint Vincent', code: 'vc' },
    { name: 'Suriname', code: 'sr' }, { name: 'Trinidad and Tobago', code: 'tt' }, { name: 'USA', code: 'us' },

    // OFC (Oceania)
    { name: 'American Samoa', code: 'as' }, { name: 'Cook Islands', code: 'ck' }, { name: 'Fiji', code: 'fj' },
    { name: 'New Caledonia', code: 'nc' }, { name: 'New Zealand', code: 'nz' }, { name: 'Papua New Guinea', code: 'pg' },
    { name: 'Samoa', code: 'ws' }, { name: 'Solomon Islands', code: 'sb' }, { name: 'Tahiti', code: 'pf' },
    { name: 'Tonga', code: 'to' }, { name: 'Vanuatu', code: 'vu' }
  ]

  console.log(`-> Przetwarzanie ${fifaNations.length} narodowości...`)
  for (const n of fifaNations) {
    await prisma.nationality.upsert({
      where: { name: n.name },
      update: {},
      create: {
        name: n.name,
        flagUrl: `https://flagcdn.com/${n.code}.svg`,
      },
    })
  }

  const nationalityCodeByName = new Map(fifaNations.map((n) => [n.name, n.code]))

  // --- Sekcja Ligi i Kluby ---
  const leagues = [
    {
      name: 'Premier League',
      countryName: 'England',
      logo: 'https://prowebjedi.com/wp-content/uploads/2023/04/Premier-League-Logo.png',
    },
    {
      name: 'La Liga',
      countryName: 'Spain',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/LaLiga_logo_2023.svg',
    },
    {
      name: 'Bundesliga',
      countryName: 'Germany',
      logo: 'https://upload.wikimedia.org/wikipedia/en/d/df/Bundesliga_logo_%282017%29.svg',
    },
    {
      name: 'Serie A',
      countryName: 'Italy',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Serie_A_logo_2022.svg',
    },
    {
      name: 'Ligue 1',
      countryName: 'France',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Ligue1_logo_2024.svg',
    },
    {
      name: 'Ekstraklasa',
      countryName: 'Poland',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Ekstraklasa_logo_2021.svg',
    },
  ]

  const clubsByLeague: Record<string, string[]> = {
    'Premier League': ['Manchester City', 'Arsenal', 'Liverpool', 'Aston Villa', 'Tottenham', 'Chelsea', 'Manchester United', 'Newcastle', 'West Ham', 'Brighton'],
    'La Liga': ['Real Madrid', 'FC Barcelona', 'Girona', 'Atletico Madrid', 'Athletic Bilbao', 'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla'],
    'Bundesliga': ['Bayer Leverkusen', 'Bayern Munich', 'VfB Stuttgart', 'RB Leipzig', 'Borussia Dortmund', 'Eintracht Frankfurt', 'Wolfsburg', 'Freiburg'],
    'Serie A': ['Inter Milan', 'AC Milan', 'Juventus', 'Atalanta', 'Bologna', 'AS Roma', 'Lazio', 'Napoli', 'Fiorentina'],
    'Ligue 1': ['Paris Saint-Germain', 'AS Monaco', 'Lille', 'Brest', 'Nice', 'Lyon', 'Marseille', 'Rennes'],
    'Ekstraklasa': ['Jagiellonia Białystok', 'Śląsk Wrocław', 'Legia Warszawa', 'Lech Poznań', 'Raków Częstochowa', 'Pogoń Szczecin'],
  }

  console.log('-> Dodawanie lig i klubów...')
  for (const l of leagues) {
    const createdLeague = await prisma.league.upsert({
      where: { name: l.name },
      update: {
        logoUrl: l.logo,
        nationality: {
          connect: { name: l.countryName },
        },
      },
      create: {
        name: l.name,
        logoUrl: l.logo,
        nationality: {
          connect: { name: l.countryName },
        },
      },
    })

    const clubs = clubsByLeague[l.name] || []
    for (const clubName of clubs) {
      await prisma.club.upsert({
        where: { name: clubName },
        update: { leagueId: createdLeague.id },
        create: {
          name: clubName,
          budget: Math.floor(Math.random() * 400000000) + 20000000,
          leagueId: createdLeague.id,
        },
      })
    }
  }

  console.log('✅ Baza danych FIFA jest kompletna!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })