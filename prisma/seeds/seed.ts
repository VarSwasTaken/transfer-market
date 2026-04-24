import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 Inicjalizacja bazy danych FIFA (211+ narodowości)...');

  const fifaNations = [
    // UEFA (Europa)
    { name: 'Albania', name_PL: 'Albania', code: 'al' },
    { name: 'Andorra', name_PL: 'Andora', code: 'ad' },
    { name: 'Armenia', name_PL: 'Armenia', code: 'am' },
    { name: 'Austria', name_PL: 'Austria', code: 'at' },
    { name: 'Azerbaijan', name_PL: 'Azerbejdżan', code: 'az' },
    { name: 'Belarus', name_PL: 'Białoruś', code: 'by' },
    { name: 'Belgium', name_PL: 'Belgia', code: 'be' },
    { name: 'Bosnia and Herzegovina', name_PL: 'Bośnia i Hercegowina', code: 'ba' },
    { name: 'Bulgaria', name_PL: 'Bułgaria', code: 'bg' },
    { name: 'Croatia', name_PL: 'Chorwacja', code: 'hr' },
    { name: 'Cyprus', name_PL: 'Cypr', code: 'cy' },
    { name: 'Czech Republic', name_PL: 'Czechy', code: 'cz' },
    { name: 'Denmark', name_PL: 'Dania', code: 'dk' },
    { name: 'England', name_PL: 'Anglia', code: 'gb-eng' },
    { name: 'Estonia', name_PL: 'Estonia', code: 'ee' },
    { name: 'Faroe Islands', name_PL: 'Wyspy Owcze', code: 'fo' },
    { name: 'Finland', name_PL: 'Finlandia', code: 'fi' },
    { name: 'France', name_PL: 'Francja', code: 'fr' },
    { name: 'Georgia', name_PL: 'Gruzja', code: 'ge' },
    { name: 'Germany', name_PL: 'Niemcy', code: 'de' },
    { name: 'Gibraltar', name_PL: 'Gibraltar', code: 'gi' },
    { name: 'Greece', name_PL: 'Grecja', code: 'gr' },
    { name: 'Hungary', name_PL: 'Węgry', code: 'hu' },
    { name: 'Iceland', name_PL: 'Islandia', code: 'is' },
    { name: 'Ireland', name_PL: 'Irlandia', code: 'ie' },
    { name: 'Israel', name_PL: 'Izrael', code: 'il' },
    { name: 'Italy', name_PL: 'Włochy', code: 'it' },
    { name: 'Kazakhstan', name_PL: 'Kazachstan', code: 'kz' },
    { name: 'Kosovo', name_PL: 'Kosowo', code: 'xk' },
    { name: 'Latvia', name_PL: 'Lotwa', code: 'lv' },
    { name: 'Liechtenstein', name_PL: 'Liechtenstein', code: 'li' },
    { name: 'Lithuania', name_PL: 'Litwa', code: 'lt' },
    { name: 'Luxembourg', name_PL: 'Luksemburg', code: 'lu' },
    { name: 'Malta', name_PL: 'Malta', code: 'mt' },
    { name: 'Moldova', name_PL: 'Mołdawia', code: 'md' },
    { name: 'Montenegro', name_PL: 'Czarnogóra', code: 'me' },
    { name: 'Netherlands', name_PL: 'Holandia', code: 'nl' },
    { name: 'North Macedonia', name_PL: 'Macedonia Północna', code: 'mk' },
    { name: 'Northern Ireland', name_PL: 'Irlandia Północna', code: 'gb-nir' },
    { name: 'Norway', name_PL: 'Norwegia', code: 'no' },
    { name: 'Poland', name_PL: 'Polska', code: 'pl' },
    { name: 'Portugal', name_PL: 'Portugalia', code: 'pt' },
    { name: 'Romania', name_PL: 'Rumunia', code: 'ro' },
    { name: 'San Marino', name_PL: 'San Marino', code: 'sm' },
    { name: 'Scotland', name_PL: 'Szkocja', code: 'gb-sct' },
    { name: 'Serbia', name_PL: 'Serbia', code: 'rs' },
    { name: 'Slovakia', name_PL: 'Slowacja', code: 'sk' },
    { name: 'Slovenia', name_PL: 'Slowenia', code: 'si' },
    { name: 'Spain', name_PL: 'Hiszpania', code: 'es' },
    { name: 'Sweden', name_PL: 'Szwecja', code: 'se' },
    { name: 'Switzerland', name_PL: 'Szwajcaria', code: 'ch' },
    { name: 'Turkey', name_PL: 'Turcja', code: 'tr' },
    { name: 'Ukraine', name_PL: 'Ukraina', code: 'ua' },
    { name: 'Wales', name_PL: 'Walia', code: 'gb-wls' },

    // CONMEBOL (Ameryka Płd.)
    { name: 'Argentina', name_PL: 'Argentyna', code: 'ar' },
    { name: 'Bolivia', name_PL: 'Boliwia', code: 'bo' },
    { name: 'Brazil', name_PL: 'Brazylia', code: 'br' },
    { name: 'Chile', name_PL: 'Chile', code: 'cl' },
    { name: 'Colombia', name_PL: 'Kolumbia', code: 'co' },
    { name: 'Ecuador', name_PL: 'Ekwador', code: 'ec' },
    { name: 'Paraguay', name_PL: 'Paragwaj', code: 'py' },
    { name: 'Peru', name_PL: 'Peru', code: 'pe' },
    { name: 'Uruguay', name_PL: 'Urugwaj', code: 'uy' },
    { name: 'Venezuela', name_PL: 'Wenezuela', code: 've' },

    // CAF (Afryka)
    { name: 'Algeria', name_PL: 'Algieria', code: 'dz' },
    { name: 'Angola', name_PL: 'Angola', code: 'ao' },
    { name: 'Benin', name_PL: 'Benin', code: 'bj' },
    { name: 'Botswana', name_PL: 'Botswana', code: 'bw' },
    { name: 'Burkina Faso', name_PL: 'Burkina Faso', code: 'bf' },
    { name: 'Burundi', name_PL: 'Burundi', code: 'bi' },
    { name: 'Cameroon', name_PL: 'Kamerun', code: 'cm' },
    { name: 'Cape Verde', name_PL: 'Republika Zielonego Przylądka', code: 'cv' },
    { name: 'Central African Republic', name_PL: 'Republika Środkowoafrykańska', code: 'cf' },
    { name: 'Chad', name_PL: 'Czad', code: 'td' },
    { name: 'Comoros', name_PL: 'Komory', code: 'km' },
    { name: 'Congo', name_PL: 'Kongo', code: 'cg' },
    { name: 'DR Congo', name_PL: 'Demokratyczna Republika Konga', code: 'cd' },
    { name: 'Djibouti', name_PL: 'Dżibuti', code: 'dj' },
    { name: 'Egypt', name_PL: 'Egipt', code: 'eg' },
    { name: 'Equatorial Guinea', name_PL: 'Gwinea Równikowa', code: 'gq' },
    { name: 'Eritrea', name_PL: 'Erytrea', code: 'er' },
    { name: 'Eswatini', name_PL: 'Eswatini', code: 'sz' },
    { name: 'Ethiopia', name_PL: 'Etiopia', code: 'et' },
    { name: 'Gabon', name_PL: 'Gabon', code: 'ga' },
    { name: 'Gambia', name_PL: 'Gambia', code: 'gm' },
    { name: 'Ghana', name_PL: 'Ghana', code: 'gh' },
    { name: 'Guinea', name_PL: 'Gwinea', code: 'gn' },
    { name: 'Guinea-Bissau', name_PL: 'Gwinea Bissau', code: 'gw' },
    { name: 'Ivory Coast', name_PL: 'Wybrzeże Kości Słoniowej', code: 'ci' },
    { name: 'Kenya', name_PL: 'Kenia', code: 'ke' },
    { name: 'Lesotho', name_PL: 'Lesotho', code: 'ls' },
    { name: 'Liberia', name_PL: 'Liberia', code: 'lr' },
    { name: 'Libya', name_PL: 'Libia', code: 'ly' },
    { name: 'Madagascar', name_PL: 'Madagaskar', code: 'mg' },
    { name: 'Malawi', name_PL: 'Malawi', code: 'mw' },
    { name: 'Mali', name_PL: 'Mali', code: 'ml' },
    { name: 'Mauritania', name_PL: 'Mauretania', code: 'mr' },
    { name: 'Mauritius', name_PL: 'Mauritius', code: 'mu' },
    { name: 'Morocco', name_PL: 'Maroko', code: 'ma' },
    { name: 'Mozambique', name_PL: 'Mozambik', code: 'mz' },
    { name: 'Namibia', name_PL: 'Namibia', code: 'na' },
    { name: 'Niger', name_PL: 'Niger', code: 'ne' },
    { name: 'Nigeria', name_PL: 'Nigeria', code: 'ng' },
    { name: 'Rwanda', name_PL: 'Rwanda', code: 'rw' },
    { name: 'Sao Tome and Principe', name_PL: 'Wyspy Świętego Tomasza i Książęca', code: 'st' },
    { name: 'Senegal', name_PL: 'Senegal', code: 'sn' },
    { name: 'Seychelles', name_PL: 'Seszele', code: 'sc' },
    { name: 'Sierra Leone', name_PL: 'Sierra Leone', code: 'sl' },
    { name: 'Somalia', name_PL: 'Somalia', code: 'so' },
    { name: 'South Africa', name_PL: 'Republika Południowej Afryki', code: 'za' },
    { name: 'South Sudan', name_PL: 'Sudan Południowy', code: 'ss' },
    { name: 'Sudan', name_PL: 'Sudan', code: 'sd' },
    { name: 'Tanzania', name_PL: 'Tanzania', code: 'tz' },
    { name: 'Togo', name_PL: 'Togo', code: 'tg' },
    { name: 'Tunisia', name_PL: 'Tunezja', code: 'tn' },
    { name: 'Uganda', name_PL: 'Uganda', code: 'ug' },
    { name: 'Zambia', name_PL: 'Zambia', code: 'zm' },
    { name: 'Zimbabwe', name_PL: 'Zimbabwe', code: 'zw' },

    // AFC (Azja & Australia)
    { name: 'Afghanistan', name_PL: 'Afganistan', code: 'af' },
    { name: 'Australia', name_PL: 'Australia', code: 'au' },
    { name: 'Bahrain', name_PL: 'Bahrajn', code: 'bh' },
    { name: 'Bangladesh', name_PL: 'Bangladesz', code: 'bd' },
    { name: 'Bhutan', name_PL: 'Bhutan', code: 'bt' },
    { name: 'Brunei', name_PL: 'Brunei', code: 'bn' },
    { name: 'Cambodia', name_PL: 'Kambodża', code: 'kh' },
    { name: 'China', name_PL: 'Chiny', code: 'cn' },
    { name: 'Guam', name_PL: 'Guam', code: 'gu' },
    { name: 'Hong Kong', name_PL: 'Hongkong', code: 'hk' },
    { name: 'India', name_PL: 'Indie', code: 'in' },
    { name: 'Indonesia', name_PL: 'Indonezja', code: 'id' },
    { name: 'Iran', name_PL: 'Iran', code: 'ir' },
    { name: 'Iraq', name_PL: 'Irak', code: 'iq' },
    { name: 'Japan', name_PL: 'Japonia', code: 'jp' },
    { name: 'Jordan', name_PL: 'Jordania', code: 'jo' },
    { name: 'Kuwait', name_PL: 'Kuwejt', code: 'kw' },
    { name: 'Kyrgyzstan', name_PL: 'Kirgistan', code: 'kg' },
    { name: 'Laos', name_PL: 'Laos', code: 'la' },
    { name: 'Lebanon', name_PL: 'Liban', code: 'lb' },
    { name: 'Macau', name_PL: 'Makau', code: 'mo' },
    { name: 'Malaysia', name_PL: 'Malezja', code: 'my' },
    { name: 'Maldives', name_PL: 'Malediwy', code: 'mv' },
    { name: 'Mongolia', name_PL: 'Mongolia', code: 'mn' },
    { name: 'Myanmar', name_PL: 'Mjanma', code: 'mm' },
    { name: 'Nepal', name_PL: 'Nepal', code: 'np' },
    { name: 'North Korea', name_PL: 'Korea Północna', code: 'kp' },
    { name: 'Oman', name_PL: 'Oman', code: 'om' },
    { name: 'Pakistan', name_PL: 'Pakistan', code: 'pk' },
    { name: 'Palestine', name_PL: 'Palestyna', code: 'ps' },
    { name: 'Philippines', name_PL: 'Filipiny', code: 'ph' },
    { name: 'Qatar', name_PL: 'Katar', code: 'qa' },
    { name: 'Saudi Arabia', name_PL: 'Arabia Saudyjska', code: 'sa' },
    { name: 'Singapore', name_PL: 'Singapur', code: 'sg' },
    { name: 'South Korea', name_PL: 'Korea Południowa', code: 'kr' },
    { name: 'Sri Lanka', name_PL: 'Sri Lanka', code: 'lk' },
    { name: 'Syria', name_PL: 'Syria', code: 'sy' },
    { name: 'Taiwan', name_PL: 'Tajwan', code: 'tw' },
    { name: 'Tajikistan', name_PL: 'Tadżykistan', code: 'tj' },
    { name: 'Thailand', name_PL: 'Tajlandia', code: 'th' },
    { name: 'Timor-Leste', name_PL: 'Timor Wschodni', code: 'tl' },
    { name: 'Turkmenistan', name_PL: 'Turkmenistan', code: 'tm' },
    { name: 'United Arab Emirates', name_PL: 'Zjednoczone Emiraty Arabskie', code: 'ae' },
    { name: 'Uzbekistan', name_PL: 'Uzbekistan', code: 'uz' },
    { name: 'Vietnam', name_PL: 'Wietnam', code: 'vn' },
    { name: 'Yemen', name_PL: 'Jemen', code: 'ye' },

    // CONCACAF (Ameryka Płn. i Środkowa)
    { name: 'Anguilla', name_PL: 'Anguilla', code: 'ai' },
    { name: 'Antigua and Barbuda', name_PL: 'Antigua i Barbuda', code: 'ag' },
    { name: 'Aruba', name_PL: 'Aruba', code: 'aw' },
    { name: 'Bahamas', name_PL: 'Bahamy', code: 'bs' },
    { name: 'Barbados', name_PL: 'Barbados', code: 'bb' },
    { name: 'Belize', name_PL: 'Belize', code: 'bz' },
    { name: 'Bermuda', name_PL: 'Bermudy', code: 'bm' },
    { name: 'British Virgin Islands', name_PL: 'Brytyjskie Wyspy Dziewicze', code: 'vg' },
    { name: 'Canada', name_PL: 'Kanada', code: 'ca' },
    { name: 'Cayman Islands', name_PL: 'Kajmany', code: 'ky' },
    { name: 'Costa Rica', name_PL: 'Kostaryka', code: 'cr' },
    { name: 'Cuba', name_PL: 'Kuba', code: 'cu' },
    { name: 'Curacao', name_PL: 'Curacao', code: 'cw' },
    { name: 'Dominica', name_PL: 'Dominika', code: 'dm' },
    { name: 'Dominican Republic', name_PL: 'Dominikana', code: 'do' },
    { name: 'El Salvador', name_PL: 'Salwador', code: 'sv' },
    { name: 'Grenada', name_PL: 'Grenada', code: 'gd' },
    { name: 'Guatemala', name_PL: 'Gwatemala', code: 'gt' },
    { name: 'Guyana', name_PL: 'Gujana', code: 'gy' },
    { name: 'Haiti', name_PL: 'Haiti', code: 'ht' },
    { name: 'Honduras', name_PL: 'Honduras', code: 'hn' },
    { name: 'Jamaica', name_PL: 'Jamajka', code: 'jm' },
    { name: 'Mexico', name_PL: 'Meksyk', code: 'mx' },
    { name: 'Montserrat', name_PL: 'Montserrat', code: 'ms' },
    { name: 'Nicaragua', name_PL: 'Nikaragua', code: 'ni' },
    { name: 'Panama', name_PL: 'Panama', code: 'pa' },
    { name: 'Puerto Rico', name_PL: 'Portoryko', code: 'pr' },
    { name: 'Saint Kitts and Nevis', name_PL: 'Saint Kitts i Nevis', code: 'kn' },
    { name: 'Saint Lucia', name_PL: 'Saint Lucia', code: 'lc' },
    { name: 'Saint Vincent', name_PL: 'Saint Vincent i Grenadyny', code: 'vc' },
    { name: 'Suriname', name_PL: 'Surinam', code: 'sr' },
    { name: 'Trinidad and Tobago', name_PL: 'Trynidad i Tobago', code: 'tt' },
    { name: 'USA', name_PL: 'USA', code: 'us' },

    // OFC (Oceania)
    { name: 'American Samoa', name_PL: 'Samoa Amerykańskie', code: 'as' },
    { name: 'Cook Islands', name_PL: 'Wyspy Cooka', code: 'ck' },
    { name: 'Fiji', name_PL: 'Fidżi', code: 'fj' },
    { name: 'New Caledonia', name_PL: 'Nowa Kaledonia', code: 'nc' },
    { name: 'New Zealand', name_PL: 'Nowa Zelandia', code: 'nz' },
    { name: 'Papua New Guinea', name_PL: 'Papua-Nowa Gwinea', code: 'pg' },
    { name: 'Samoa', name_PL: 'Samoa', code: 'ws' },
    { name: 'Solomon Islands', name_PL: 'Wyspy Salomona', code: 'sb' },
    { name: 'Tahiti', name_PL: 'Tahiti', code: 'pf' },
    { name: 'Tonga', name_PL: 'Tonga', code: 'to' },
    { name: 'Vanuatu', name_PL: 'Vanuatu', code: 'vu' },
  ];

  console.log(`-> Przetwarzanie ${fifaNations.length} narodowości...`);
  for (const n of fifaNations) {
    await prisma.nationality.upsert({
      where: { name: n.name },
      update: {
        name_PL: n.name_PL,
      },
      create: {
        name: n.name,
        name_PL: n.name_PL,
        flagUrl: `https://flagcdn.com/${n.code}.svg`,
      },
    });
  }

  // --- Sekcja Ligi i Kluby ---
  const leagues = [
    {
      name: 'Premier League',
      countryName: 'England',
      logo: 'https://upload.wikimedia.org/wikipedia/en/f/f2/Premier_League_Logo.svg',
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
  ];

  const clubsByLeague: Record<string, string[]> = {
    'Premier League': ['Manchester City', 'Arsenal', 'Liverpool', 'Aston Villa', 'Tottenham', 'Chelsea', 'Manchester United', 'Newcastle', 'West Ham', 'Brighton'],
    'La Liga': ['Real Madrid', 'FC Barcelona', 'Girona', 'Atletico Madrid', 'Athletic Bilbao', 'Real Sociedad', 'Villarreal', 'Real Betis', 'Sevilla'],
    Bundesliga: ['Bayer Leverkusen', 'Bayern Munich', 'VfB Stuttgart', 'RB Leipzig', 'Borussia Dortmund', 'Eintracht Frankfurt', 'Wolfsburg', 'Freiburg'],
    'Serie A': ['Inter Milan', 'AC Milan', 'Juventus', 'Atalanta', 'Bologna', 'AS Roma', 'Lazio', 'Napoli', 'Fiorentina'],
    'Ligue 1': ['Paris Saint-Germain', 'AS Monaco', 'Lille', 'Brest', 'Nice', 'Lyon', 'Marseille', 'Rennes'],
    Ekstraklasa: ['Jagiellonia Białystok', 'Śląsk Wrocław', 'Legia Warszawa', 'Lech Poznań', 'Raków Częstochowa', 'Pogoń Szczecin'],
  };

  console.log('-> Dodawanie lig i klubów...');
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
    });

    const clubs = clubsByLeague[l.name] || [];
    for (const clubName of clubs) {
      await prisma.club.upsert({
        where: { name: clubName },
        update: { leagueId: createdLeague.id },
        create: {
          name: clubName,
          budget: Math.floor(Math.random() * 400000000) + 20000000,
          leagueId: createdLeague.id,
        },
      });
    }
  }

  // --- 3. AGENCI (Słynni agenci piłkarscy) ---
  console.log('💼 Dodaję agentów...');
  const agentsData = [
    { name: 'Jorge Mendes', agency: 'Gestifute' },
    { name: 'Rafaela Pimenta', agency: 'Pimenta Agency' },
    { name: 'Pini Zahavi', agency: 'Gol International' },
    { name: 'Kia Joorabchian', agency: 'Sports Investments' },
  ];

  for (const a of agentsData) {
    const existingAgent = await prisma.agent.findFirst({
      where: { name: a.name },
      orderBy: { id: 'asc' },
    });

    if (existingAgent) {
      await prisma.agent.update({
        where: { id: existingAgent.id },
        data: { agency: a.agency },
      });
    } else {
      await prisma.agent.create({
        data: { name: a.name, agency: a.agency },
      });
    }
  }

  // --- 4. ZAWODNICY I KONTRAKTY ---
  console.log('⚽ Rozpoczynam rekrutację topowych zawodników...');

  const playersData = [
    // Real Madryt
    { firstName: 'Kylian', lastName: 'Mbappé', club: 'Real Madrid', nation: 'France', pos: 'FORWARD', value: 180000000, birth: '1998-12-20', shirtNumber: 9, height: 178, weight: 75, preferredFoot: 'RIGHT' },
    { firstName: 'Jude', lastName: 'Bellingham', club: 'Real Madrid', nation: 'England', pos: 'MIDFIELDER', value: 180000000, birth: '2003-06-29', shirtNumber: 5, height: 186, weight: 75, preferredFoot: 'RIGHT' },
    { firstName: 'Vinícius', lastName: 'Júnior', club: 'Real Madrid', nation: 'Brazil', pos: 'FORWARD', value: 180000000, birth: '2000-07-12', shirtNumber: 7, height: 176, weight: 73, preferredFoot: 'RIGHT' },
    { firstName: 'Federico', lastName: 'Valverde', club: 'Real Madrid', nation: 'Uruguay', pos: 'MIDFIELDER', value: 130000000, birth: '1998-07-22', shirtNumber: 8, height: 182, weight: 78, preferredFoot: 'RIGHT' },

    // Manchester City
    { firstName: 'Erling', lastName: 'Haaland', club: 'Manchester City', nation: 'Norway', pos: 'FORWARD', value: 180000000, birth: '2000-07-21', shirtNumber: 9, height: 194, weight: 88, preferredFoot: 'LEFT' },
    { firstName: 'Kevin', lastName: 'De Bruyne', club: 'Manchester City', nation: 'Belgium', pos: 'MIDFIELDER', value: 60000000, birth: '1991-06-28', shirtNumber: 17, height: 181, weight: 70, preferredFoot: 'RIGHT' },
    { firstName: 'Rodri', lastName: '', club: 'Manchester City', nation: 'Spain', pos: 'MIDFIELDER', value: 130000000, birth: '1996-06-22', shirtNumber: 16, height: 191, weight: 82, preferredFoot: 'RIGHT' },
    { firstName: 'Phil', lastName: 'Foden', club: 'Manchester City', nation: 'England', pos: 'MIDFIELDER', value: 150000000, birth: '2000-05-28', shirtNumber: 47, height: 171, weight: 70, preferredFoot: 'LEFT' },

    // FC Barcelona
    { firstName: 'Robert', lastName: 'Lewandowski', club: 'FC Barcelona', nation: 'Poland', pos: 'FORWARD', value: 15000000, birth: '1988-08-21', shirtNumber: 9, height: 185, weight: 80, preferredFoot: 'RIGHT' },
    { firstName: 'Lamine', lastName: 'Yamal', club: 'FC Barcelona', nation: 'Spain', pos: 'FORWARD', value: 120000000, birth: '2007-07-13', shirtNumber: 27, height: 180, weight: 70, preferredFoot: 'LEFT' },
    { firstName: 'Pedri', lastName: '', club: 'FC Barcelona', nation: 'Spain', pos: 'MIDFIELDER', value: 80000000, birth: '2002-11-25', shirtNumber: 8, height: 174, weight: 60, preferredFoot: 'RIGHT' },
    { firstName: 'Gavi', lastName: '', club: 'FC Barcelona', nation: 'Spain', pos: 'MIDFIELDER', value: 90000000, birth: '2004-08-05', shirtNumber: 6, height: 173, weight: 68, preferredFoot: 'RIGHT' },

    // Bayern Monachium
    { firstName: 'Harry', lastName: 'Kane', club: 'Bayern Munich', nation: 'England', pos: 'FORWARD', value: 100000000, birth: '1993-07-28', shirtNumber: 9, height: 188, weight: 86, preferredFoot: 'RIGHT' },
    { firstName: 'Jamal', lastName: 'Musiala', club: 'Bayern Munich', nation: 'Germany', pos: 'MIDFIELDER', value: 130000000, birth: '2003-02-26', shirtNumber: 42, height: 184, weight: 72, preferredFoot: 'RIGHT' },
    { firstName: 'Manuel', lastName: 'Neuer', club: 'Bayern Munich', nation: 'Germany', pos: 'GOALKEEPER', value: 5000000, birth: '1986-03-27', shirtNumber: 1, height: 193, weight: 93, preferredFoot: 'RIGHT' },

    // Liverpool
    { firstName: 'Mohamed', lastName: 'Salah', club: 'Liverpool', nation: 'Egypt', pos: 'FORWARD', value: 65000000, birth: '1992-06-15', shirtNumber: 11, height: 175, weight: 71, preferredFoot: 'LEFT' },
    { firstName: 'Virgil', lastName: 'van Dijk', club: 'Liverpool', nation: 'Netherlands', pos: 'DEFENDER', value: 30000000, birth: '1991-07-08', shirtNumber: 4, height: 195, weight: 92, preferredFoot: 'RIGHT' },
    { firstName: 'Alisson', lastName: 'Becker', club: 'Liverpool', nation: 'Brazil', pos: 'GOALKEEPER', value: 28000000, birth: '1992-10-02', shirtNumber: 1, height: 193, weight: 91, preferredFoot: 'RIGHT' },

    // Inter Mediolan
    { firstName: 'Lautaro', lastName: 'Martínez', club: 'Inter Milan', nation: 'Argentina', pos: 'FORWARD', value: 110000000, birth: '1997-08-22', shirtNumber: 10, height: 174, weight: 72, preferredFoot: 'RIGHT' },
    { firstName: 'Hakan', lastName: 'Çalhanoğlu', club: 'Inter Milan', nation: 'Turkey', pos: 'MIDFIELDER', value: 40000000, birth: '1994-02-08', shirtNumber: 20, height: 178, weight: 76, preferredFoot: 'RIGHT' },

    // Arsenal
    { firstName: 'Bukayo', lastName: 'Saka', club: 'Arsenal', nation: 'England', pos: 'FORWARD', value: 140000000, birth: '2001-09-05', shirtNumber: 7, height: 178, weight: 72, preferredFoot: 'LEFT' },
    { firstName: 'Martin', lastName: 'Ødegaard', club: 'Arsenal', nation: 'Norway', pos: 'MIDFIELDER', value: 110000000, birth: '1998-12-17', shirtNumber: 8, height: 178, weight: 68, preferredFoot: 'LEFT' },
    { firstName: 'Declan', lastName: 'Rice', club: 'Arsenal', nation: 'England', pos: 'MIDFIELDER', value: 120000000, birth: '1999-01-14', shirtNumber: 41, height: 188, weight: 80, preferredFoot: 'RIGHT' },

    // PSG
    { firstName: 'Ousmane', lastName: 'Dembélé', club: 'Paris Saint-Germain', nation: 'France', pos: 'FORWARD', value: 60000000, birth: '1997-05-15', shirtNumber: 10, height: 178, weight: 67, preferredFoot: 'BOTH' },
    { firstName: 'Gianluigi', lastName: 'Donnarumma', club: 'Paris Saint-Germain', nation: 'Italy', pos: 'GOALKEEPER', value: 45000000, birth: '1999-02-25', shirtNumber: 1, height: 196, weight: 90, preferredFoot: 'RIGHT' },

    // Legia Warszawa (akcent polski!)
    { firstName: 'Josué', lastName: '', club: 'Legia Warszawa', nation: 'Portugal', pos: 'MIDFIELDER', value: 1000000, birth: '1990-08-16', shirtNumber: 27, height: 174, weight: 72, preferredFoot: 'RIGHT' },
    { firstName: 'Kacper', lastName: 'Tobiasz', club: 'Legia Warszawa', nation: 'Poland', pos: 'GOALKEEPER', value: 2500000, birth: '2002-11-04', shirtNumber: 1, height: 191, weight: 83, preferredFoot: 'RIGHT' },
  ];

  // Mapowanie zawodników do agentów
  const playerToAgent: Record<string, string> = {
    'Kylian Mbappé': 'Rafaela Pimenta',
    'Jude Bellingham': 'Jorge Mendes',
    'Vinícius Júnior': 'Jorge Mendes',
    'Erling Haaland': 'Rafaela Pimenta',
    'Kevin De Bruyne': 'Kia Joorabchian',
    Rodri: 'Kia Joorabchian',
    'Robert Lewandowski': 'Pini Zahavi',
    'Lamine Yamal': 'Kia Joorabchian',
    Pedri: 'Rafaela Pimenta',
    'Harry Kane': 'Rafaela Pimenta',
    'Jamal Musiala': 'Kia Joorabchian',
    'Mohamed Salah': 'Jorge Mendes',
    'Virgil van Dijk': 'Jorge Mendes',
    'Lautaro Martínez': 'Jorge Mendes',
    'Bukayo Saka': 'Kia Joorabchian',
    'Martin Ødegaard': 'Rafaela Pimenta',
    'Ousmane Dembélé': 'Kia Joorabchian',
    Josué: 'Pini Zahavi',
    'Federico Valverde': 'Jorge Mendes',
    'Phil Foden': 'Kia Joorabchian',
    Gavi: 'Rafaela Pimenta',
    'Manuel Neuer': 'Pini Zahavi',
    'Alisson Becker': 'Jorge Mendes',
    'Hakan Çalhanoğlu': 'Pini Zahavi',
    'Declan Rice': 'Rafaela Pimenta',
    'Gianluigi Donnarumma': 'Jorge Mendes',
    'Kacper Tobiasz': 'Kia Joorabchian',
  };

  for (const p of playersData) {
    const club = await prisma.club.findUnique({ where: { name: p.club } });
    const nation = await prisma.nationality.findUnique({ where: { name: p.nation } });
    const fullName = `${p.firstName} ${p.lastName}`.trim();
    const agentName = playerToAgent[fullName];
    const agent = agentName ? await prisma.agent.findFirst({ where: { name: agentName } }) : null;

    if (club && nation) {
      const birthDate = new Date(p.birth);
      const existingPlayer = await prisma.player.findFirst({
        where: {
          firstName: p.firstName,
          lastName: p.lastName,
          birthDate,
        },
        orderBy: { id: 'asc' },
      });

      const player = existingPlayer
        ? await prisma.player.update({
            where: { id: existingPlayer.id },
            data: {
              position: p.pos as any,
              marketValue: p.value,
              shirtNumber: p.shirtNumber,
              height: p.height,
              weight: p.weight,
              preferredFoot: p.preferredFoot as any,
              nationalityId: nation.id,
              clubId: club.id,
              agentId: agent?.id || null,
            },
          })
        : await prisma.player.create({
            data: {
              firstName: p.firstName,
              lastName: p.lastName,
              birthDate,
              shirtNumber: p.shirtNumber,
              height: p.height,
              weight: p.weight,
              position: p.pos as any,
              preferredFoot: p.preferredFoot as any,
              marketValue: p.value,
              nationalityId: nation.id,
              clubId: club.id,
              agentId: agent?.id || null,
            },
          });

      const contractStartDate = new Date('2024-07-01');
      const contractEndDate = new Date('2028-06-30');
      const existingContract = await prisma.contract.findFirst({
        where: {
          playerId: player.id,
          startDate: contractStartDate,
          endDate: contractEndDate,
        },
      });

      if (!existingContract) {
        await prisma.contract.create({
          data: {
            playerId: player.id,
            startDate: contractStartDate,
            endDate: contractEndDate,
            salary: Math.floor(Math.random() * 20000000) + 1000000,
          },
        });
      }

      const agentInfo = agent ? ` (Agent: ${agentName})` : '';
      const operation = existingPlayer ? '🔁 Zaktualizowano' : '✅ Zrekrutowano';
      console.log(`${operation}: ${p.firstName} ${p.lastName} (${p.club})${agentInfo}`);
    } else {
      console.log(`⚠️ Pominąłem ${p.firstName} ${p.lastName} - nie znaleziono klubu lub kraju.`);
    }
  }

  // --- 5. TRANSFERY (Historia ostatnich hitów) ---
  console.log('💸 Rejestruję historię transferów...');

  const transfersToRecord = [
    { playerName: 'Mbappé', from: 'Paris Saint-Germain', to: 'Real Madrid', fee: 0, type: 'FREE', date: '2024-07-01' },
    { playerName: 'Haaland', from: 'Borussia Dortmund', to: 'Manchester City', fee: 60000000, type: 'PERMANENT', date: '2022-07-01' },
    { playerName: 'Bellingham', from: 'Borussia Dortmund', to: 'Real Madrid', fee: 103000000, type: 'PERMANENT', date: '2023-07-01' },
    { playerName: 'Lewandowski', from: 'Bayern Munich', to: 'FC Barcelona', fee: 45000000, type: 'PERMANENT', date: '2022-07-19' },
    { playerName: 'Kane', from: 'Tottenham', to: 'Bayern Munich', fee: 95000000, type: 'PERMANENT', date: '2023-08-12' },
    { playerName: 'Declan', from: 'West Ham', to: 'Arsenal', fee: 116000000, type: 'PERMANENT', date: '2023-07-15' },
    { playerName: 'Dembélé', from: 'FC Barcelona', to: 'Paris Saint-Germain', fee: 50000000, type: 'PERMANENT', date: '2023-08-12' },
    { playerName: 'Lautaro', from: 'Racing Club', to: 'Inter Milan', fee: 25000000, type: 'PERMANENT', date: '2018-07-04' },
    { playerName: 'Salah', from: 'AS Roma', to: 'Liverpool', fee: 42000000, type: 'PERMANENT', date: '2017-07-01' },
    { playerName: 'Rodri', from: 'Atletico Madrid', to: 'Manchester City', fee: 70000000, type: 'PERMANENT', date: '2019-07-03' },
    { playerName: 'Pedri', from: 'Las Palmas', to: 'FC Barcelona', fee: 23000000, type: 'PERMANENT', date: '2020-09-02' },
    { playerName: 'Valverde', from: 'Peñarol', to: 'Real Madrid', fee: 5000000, type: 'PERMANENT', date: '2016-07-22' },
    { playerName: 'Rice', from: 'Chelsea Youth', to: 'West Ham', fee: 0, type: 'FREE', date: '2014-07-01' },
  ];

  for (const t of transfersToRecord) {
    const player = await prisma.player.findFirst({
      where: {
        OR: [{ lastName: { contains: t.playerName } }, { firstName: { contains: t.playerName } }],
      },
      orderBy: { id: 'asc' },
    });
    const fromClub = await prisma.club.findUnique({ where: { name: t.from } });
    const toClub = await prisma.club.findUnique({ where: { name: t.to } });

    if (player && toClub) {
      // Sprawdzić czy transfer już istnieje
      const existingTransfer = await prisma.transfer.findFirst({
        where: {
          playerId: player.id,
          toClubId: toClub.id,
          date: new Date(t.date),
        },
      });

      if (!existingTransfer) {
        await prisma.transfer.create({
          data: {
            playerId: player.id,
            fromClubId: fromClub?.id || null,
            toClubId: toClub.id,
            fee: t.fee,
            transferType: t.type as any,
            date: new Date(t.date),
          },
        });
        console.log(`✅ Transfer: ${t.playerName} -> ${t.to} (${t.fee.toLocaleString()} €)`);
      } else {
        console.log(`⏭️ Transfer już istnieje: ${t.playerName} -> ${t.to}`);
      }
    } else {
      console.log(`⚠️ Pominąłem transfer ${t.playerName} -> ${t.to} (brak zawodnika lub klubu docelowego)`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
