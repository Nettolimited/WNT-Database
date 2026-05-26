import { json } from '../_shared.js';

// TheSportsDB full country name → ISO 3166-1 alpha-3 (or football federation code)
const COUNTRY_MAP = {
  'England':'ENG','Scotland':'SCO','Wales':'WAL','Northern Ireland':'NIR',
  'Republic of Ireland':'IRL','Ireland':'IRL',
  'Thailand':'THA','Japan':'JPN','South Korea':'KOR','North Korea':'PRK',
  'China':'CHN','Taiwan':'TWN','Hong Kong':'HKG',
  'USA':'USA','United States':'USA','Canada':'CAN',
  'Australia':'AUS','New Zealand':'NZL',
  'France':'FRA','Germany':'DEU','Spain':'ESP','Italy':'ITA',
  'Netherlands':'NLD','Portugal':'POR','Belgium':'BEL','Austria':'AUT',
  'Switzerland':'CHE','Poland':'POL','Czech Republic':'CZE','Czechia':'CZE',
  'Hungary':'HUN','Romania':'ROU','Croatia':'HRV','Serbia':'SRB',
  'Slovakia':'SVK','Slovenia':'SVN','Greece':'GRC','Turkey':'TUR',
  'Russia':'RUS','Ukraine':'UKR',
  'Sweden':'SWE','Norway':'NOR','Denmark':'DNK','Finland':'FIN',
  'Iceland':'ISL','Luxembourg':'LUX','Albania':'ALB',
  'North Macedonia':'MKD','Bosnia and Herzegovina':'BIH','Montenegro':'MNE',
  'Belarus':'BLR','Moldova':'MDA','Lithuania':'LTU','Latvia':'LVA',
  'Estonia':'EST','Armenia':'ARM','Azerbaijan':'AZE','Georgia':'GEO',
  'Kazakhstan':'KAZ','Uzbekistan':'UZB',
  'Philippines':'PHL','Indonesia':'IDN','Vietnam':'VNM','Malaysia':'MYS',
  'Singapore':'SGP','Myanmar':'MMR','Cambodia':'KHM','Laos':'LAO',
  'Brunei':'BRN','Timor-Leste':'TLS',
  'India':'IND','Pakistan':'PAK','Iran':'IRN','Iraq':'IRQ',
  'Saudi Arabia':'SAU','UAE':'ARE','United Arab Emirates':'ARE',
  'Qatar':'QAT','Kuwait':'KWT','Jordan':'JOR','Lebanon':'LBN',
  'Israel':'ISR',
  'Brazil':'BRA','Argentina':'ARG','Mexico':'MEX','Colombia':'COL',
  'Chile':'CHL','Peru':'PER','Uruguay':'URY','Venezuela':'VEN',
  'Ecuador':'ECU','Bolivia':'BOL','Paraguay':'PRY',
  'Nigeria':'NGA','South Africa':'ZAF','Cameroon':'CMR','Ghana':'GHA',
  "Ivory Coast":'CIV',"Côte d'Ivoire":'CIV','Morocco':'MAR',
  'Egypt':'EGY','Tunisia':'TUN','Algeria':'DZA','Senegal':'SEN',
};

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestGet({ request }) {
  const url  = new URL(request.url);
  const q    = (url.searchParams.get('q') || '').trim();
  if (!q || q.length < 2) return json({ teams: [] });

  const apiUrl = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q)}`;
  const res = await fetch(apiUrl, { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!res.ok) return json({ teams: [] });

  const data = await res.json().catch(() => ({ teams: null }));
  const teams = (data.teams || [])
    .filter(t => t.strSport === 'Soccer')
    .slice(0, 6)
    .map(t => ({
      name:    t.strTeam,
      country: COUNTRY_MAP[t.strCountry] || '',
      league:  t.strLeague || '',
      logoUrl: t.strTeamBadge || '',
    }));

  return json({ teams });
}
