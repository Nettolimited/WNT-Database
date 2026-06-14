// Thailand Women's National Team — player database
// Imported from real roster CSV. Some derived stats are illustrative.

const POSITIONS = ['GK','CB','LB','RB','DM','CM','AM','LW','RW','ST'];
const POSITION_GROUPS = {
  GK: 'Goalkeeper',
  CB: 'Defender', LB: 'Defender', RB: 'Defender',
  DM: 'Midfielder', CM: 'Midfielder', AM: 'Midfielder',
  LW: 'Forward', RW: 'Forward', ST: 'Forward',
};

const CLUBS = [
  { "code": "BOA", "name": "BGC-College of Asian Scholars",     "color": "#1a8a3f", "country": "PHL" },
  { "code": "BF",  "name": "Bangkok FC",                        "color": "#e02a2a", "country": "THA" },
  { "code": "CCL", "name": "Cadiff City Ladie",                 "color": "#0066cc", "country": "GBR" },
  { "code": "CWS", "name": "Chonburi Women Sports School",      "color": "#7d2ac4", "country": "THA" },
  { "code": "CWF", "name": "Chonburi Women FC",                 "color": "#cc1010", "country": "THA" },
  { "code": "NSS", "name": "Nakhonsri Sports School",           "color": "#d4a90c", "country": "THA" },
  { "code": "AM",  "name": "Arma & Masuk",                      "color": "#0a4a99", "country": "IDN" },
  { "code": "PFC", "name": "Phranakorn Football Club Women",    "color": "#e63946", "country": "THA" },
  { "code": "KKS", "name": "Khon Kean Sports School",           "color": "#84d6f0", "country": "THA" },
  { "code": "UOC", "name": "University of Central Florida",     "color": "#ffd633", "country": "USA" },
  { "code": "WS",  "name": "Wasatch SC",                        "color": "#16a3a3", "country": "USA" },
  { "code": "NPW", "name": "Nagano Parceiro Women's",           "color": "#c45cb8", "country": "JPN" },
  { "code": "NC",  "name": "NC Courage",                        "color": "#e07a1f", "country": "USA" },
  { "code": "TBW", "name": "Taichung Blue Whale",               "color": "#3a8a5c", "country": "TPE" },
  { "code": "GPF", "name": "Guangxi Pingguo Football Club",     "color": "#9b3aa1", "country": "CHN" },
  { "code": "KB",  "name": "Kasem Bundit",                      "color": "#446e8f", "country": "THA" },
  { "code": "PT",  "name": "PTU Takhlong",                      "color": "#5e8a1b", "country": "THA" },
  { "code": "VBF", "name": "Varbergs Bols FC",                  "color": "#a13a3a", "country": "SWE" },
  { "code": "RBW", "name": "Rugby borough WFC",                 "color": "#1a8a3f", "country": "GBR" },
  { "code": "PWT", "name": "Phranakorn Women Team",             "color": "#e02a2a", "country": "THA" },
  { "code": "MBF", "name": "Mariestads Bols FF",                "color": "#0066cc", "country": "SWE" },
  { "code": "BI",  "name": "Brøndby IF",                        "color": "#7d2ac4", "country": "DNK" },
];

const TEAMS = ['Senior','U23','U20','U17','U15'];

const PLAYERS = [
  {
    "id": "p01",
    "nick": "Ampare",
    "name": "NUTWADEE PRAMNAK",
    "thaiName": "ณัฐวดี ปร่ำนาค",
    "pos": "AM",
    "altPos": [],
    "dob": "2000-10-09",
    "foot": "R",
    "height": 159,
    "team": "Senior",
    "club": "BOA",
    "shirt": 2,
    "caps": 10,
    "intGoals": 0,
    "stats": {
      "apps": 12,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 1,
      "minutes": 960
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 700
    },
    "radar": {
      "pace": 11,
      "shooting": 10,
      "passing": 16,
      "dribbling": 11,
      "defending": 10,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p02",
    "nick": "Ann",
    "name": "SAKUNA SENABUTH",
    "thaiName": "สกุณา เสนะบุตา",
    "pos": "CB",
    "altPos": [],
    "dob": "1995-09-08",
    "foot": "R",
    "height": 160,
    "team": "Senior",
    "club": "BF",
    "shirt": 3,
    "caps": 45,
    "intGoals": 0,
    "stats": {
      "apps": 23,
      "goals": 0,
      "assists": 2,
      "yellows": 0,
      "reds": 0,
      "minutes": 1855
    },
    "intStats": {
      "apps": 31,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3150
    },
    "radar": {
      "pace": 12,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p03",
    "nick": "Anna",
    "name": "ANNALINA SEESANNGAM",
    "thaiName": "อานาลีน่า สีสันงาน",
    "pos": "GK",
    "altPos": [],
    "dob": "2006-01-01",
    "foot": "R",
    "height": 161,
    "team": "U20",
    "club": "CCL",
    "shirt": 4,
    "caps": 6,
    "intGoals": 0,
    "stats": {
      "apps": 18,
      "goals": 0,
      "assists": 1,
      "yellows": 1,
      "reds": 0,
      "minutes": 1446
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 420
    },
    "radar": {
      "pace": 15,
      "shooting": 4,
      "passing": 12,
      "dribbling": 6,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p04",
    "nick": "Aum",
    "name": "NATCHA KAEWANTA",
    "thaiName": "ณัฐชา แก้วอันตา",
    "pos": "LB",
    "altPos": [],
    "dob": "2006-12-03",
    "foot": "L",
    "height": 161,
    "team": "U20",
    "club": "BF",
    "shirt": 5,
    "caps": 6,
    "intGoals": 0,
    "stats": {
      "apps": 18,
      "goals": 0,
      "assists": 1,
      "yellows": 1,
      "reds": 0,
      "minutes": 1446
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 420
    },
    "radar": {
      "pace": 13,
      "shooting": 7,
      "passing": 15,
      "dribbling": 8,
      "defending": 14,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p05",
    "nick": "Baimaii",
    "name": "SUNISA SUKSRI",
    "thaiName": "สุนิสา สุขศรี",
    "pos": "LW",
    "altPos": [],
    "dob": "2005-01-01",
    "foot": "R",
    "height": 163,
    "team": "U23",
    "club": "BOA",
    "shirt": 6,
    "caps": 5,
    "intGoals": 0,
    "stats": {
      "apps": 17,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 1365
    },
    "intStats": {
      "apps": 3,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 350
    },
    "radar": {
      "pace": 16,
      "shooting": 11,
      "passing": 10,
      "dribbling": 15,
      "defending": 6,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p06",
    "nick": "Baimon",
    "name": "JANISTA JINANTUYA",
    "thaiName": "จณิสตา จินันทุยา",
    "pos": "LW",
    "altPos": [],
    "dob": "2003-09-09",
    "foot": "R",
    "height": 167,
    "team": "U23",
    "club": "BF",
    "shirt": 7,
    "caps": 3,
    "intGoals": 1,
    "stats": {
      "apps": 15,
      "goals": 4,
      "assists": 4,
      "yellows": 3,
      "reds": 0,
      "minutes": 1203
    },
    "intStats": {
      "apps": 2,
      "goals": 1,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 210
    },
    "radar": {
      "pace": 14,
      "shooting": 13,
      "passing": 12,
      "dribbling": 12,
      "defending": 5,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p07",
    "nick": "Beam",
    "name": "THICHANAN SODCHUEN",
    "thaiName": "ทิชานันท์ สดชื่น",
    "pos": "GK",
    "altPos": [],
    "dob": "2003-01-01",
    "foot": "R",
    "height": 170,
    "team": "U23",
    "club": "BOA",
    "shirt": 8,
    "caps": 3,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 3,
      "reds": 0,
      "minutes": 1203
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 210
    },
    "radar": {
      "pace": 12,
      "shooting": 5,
      "passing": 12,
      "dribbling": 8,
      "defending": 14,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p08",
    "nick": "Bell",
    "name": "JIDAPA PHARA",
    "thaiName": "จิดาภา พารา",
    "pos": "GK",
    "altPos": [],
    "dob": "2003-04-11",
    "foot": "L",
    "height": 166,
    "team": "U23",
    "club": "BOA",
    "shirt": 9,
    "caps": 3,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 3,
      "reds": 0,
      "minutes": 1203
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 210
    },
    "radar": {
      "pace": 12,
      "shooting": 5,
      "passing": 12,
      "dribbling": 8,
      "defending": 14,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p09",
    "nick": "Cartoon",
    "name": "PICHAYATIDA MANOWANG",
    "thaiName": "พิชญธิดา มะโนวัง",
    "pos": "CM",
    "altPos": [],
    "dob": "2006-11-17",
    "foot": "R",
    "height": 158,
    "team": "U20",
    "club": "BF",
    "shirt": 10,
    "caps": 6,
    "intGoals": 0,
    "stats": {
      "apps": 18,
      "goals": 2,
      "assists": 2,
      "yellows": 1,
      "reds": 0,
      "minutes": 1446
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 420
    },
    "radar": {
      "pace": 12,
      "shooting": 13,
      "passing": 13,
      "dribbling": 13,
      "defending": 12,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p10",
    "nick": "Choomphu",
    "name": "BENYAPA SINGSAI",
    "thaiName": "เบญญาภา สิงใส",
    "pos": "GK",
    "altPos": [],
    "dob": "2009-01-01",
    "foot": "R",
    "height": 168,
    "team": "U17",
    "club": "CWS",
    "shirt": 11,
    "caps": 9,
    "intGoals": 0,
    "stats": {
      "apps": 21,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1689
    },
    "intStats": {
      "apps": 6,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 630
    },
    "radar": {
      "pace": 9,
      "shooting": 6,
      "passing": 15,
      "dribbling": 5,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p11",
    "nick": "Choompu",
    "name": "PAWARISA HOMYAMYEN",
    "thaiName": "ปวริษา หอมยามเย็น",
    "pos": "GK",
    "altPos": [],
    "dob": "2004-01-31",
    "foot": "R",
    "height": 169,
    "team": "U23",
    "club": "CWF",
    "shirt": 12,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 13,
      "shooting": 6,
      "passing": 13,
      "dribbling": 5,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p12",
    "nick": "Dao",
    "name": "NUALANONG MUENSRI",
    "thaiName": "นวลอนงค์ หมื่นศรี",
    "pos": "CM",
    "altPos": [],
    "dob": "2004-02-28",
    "foot": "L",
    "height": 170,
    "team": "U23",
    "club": "NSS",
    "shirt": 13,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 11,
      "shooting": 11,
      "passing": 16,
      "dribbling": 11,
      "defending": 10,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p13",
    "nick": "Face",
    "name": "CHALISA PHONGOEN",
    "thaiName": "ชาลิสา ภูเงิน",
    "pos": "GK",
    "altPos": [],
    "dob": "2004-07-15",
    "foot": "R",
    "height": 171,
    "team": "U23",
    "club": "AM",
    "shirt": 14,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 13,
      "shooting": 6,
      "passing": 13,
      "dribbling": 5,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p14",
    "nick": "Fahsai",
    "name": "FASAWANG KAETKEAW",
    "thaiName": "ฟ้าสว่าง เกตุแก้ว",
    "pos": "CM",
    "altPos": [],
    "dob": "2003-09-22",
    "foot": "R",
    "height": 172,
    "team": "U23",
    "club": "CWF",
    "shirt": 15,
    "caps": 3,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 3,
      "reds": 0,
      "minutes": 1203
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 210
    },
    "radar": {
      "pace": 14,
      "shooting": 13,
      "passing": 15,
      "dribbling": 15,
      "defending": 9,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p15",
    "nick": "Faii",
    "name": "TAMONWAN RAKSAPHAKDI",
    "thaiName": "ธมลวรรณ รักษาภักดี",
    "pos": "LB",
    "altPos": [],
    "dob": "2000-01-01",
    "foot": "R",
    "height": 173,
    "team": "Senior",
    "club": "BOA",
    "shirt": 16,
    "caps": 10,
    "intGoals": 0,
    "stats": {
      "apps": 12,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 1,
      "minutes": 960
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 700
    },
    "radar": {
      "pace": 11,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p16",
    "nick": "Fern",
    "name": "Achiraya Yingsakul",
    "thaiName": "อชิรญา ยิ่งสกุล",
    "pos": "DM",
    "altPos": [],
    "dob": "2007-12-13",
    "foot": "L",
    "height": 158,
    "team": "U20",
    "club": "PFC",
    "shirt": 17,
    "caps": 7,
    "intGoals": 0,
    "stats": {
      "apps": 19,
      "goals": 0,
      "assists": 2,
      "yellows": 2,
      "reds": 0,
      "minutes": 1527
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 490
    },
    "radar": {
      "pace": 14,
      "shooting": 8,
      "passing": 11,
      "dribbling": 9,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p17",
    "nick": "Fresh",
    "name": "SUPAPRON INTARAPRASIT",
    "thaiName": "สุภาพร อินทรประสิทธิ์",
    "pos": "CB",
    "altPos": [],
    "dob": "2004-02-18",
    "foot": "R",
    "height": 171,
    "team": "U23",
    "club": "CWF",
    "shirt": 18,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 11,
      "shooting": 9,
      "passing": 13,
      "dribbling": 11,
      "defending": 17,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p18",
    "nick": "Gam",
    "name": "CHONTICHA PANYARUNG",
    "thaiName": "ชลธิชา ปัญญารุ้ง",
    "pos": "GK",
    "altPos": [],
    "dob": "2008-12-30",
    "foot": "R",
    "height": 171,
    "team": "U20",
    "club": "KKS",
    "shirt": 19,
    "caps": 8,
    "intGoals": 0,
    "stats": {
      "apps": 20,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 1608
    },
    "intStats": {
      "apps": 5,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 560
    },
    "radar": {
      "pace": 8,
      "shooting": 5,
      "passing": 14,
      "dribbling": 8,
      "defending": 15,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p19",
    "nick": "Godna",
    "name": "PREAWA NUDNABEE",
    "thaiName": "แพรวา นุดนาบี",
    "pos": "RB",
    "altPos": [
      "AM"
    ],
    "dob": "2004-06-27",
    "foot": "R",
    "height": 161,
    "team": "U23",
    "club": "BF",
    "shirt": 20,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 11,
      "shooting": 9,
      "passing": 13,
      "dribbling": 11,
      "defending": 17,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p20",
    "nick": "Grace",
    "name": "GRACE ALEXANDRA THAO",
    "thaiName": "เกรซ อเล็กซานดรา เถา",
    "pos": "CM",
    "altPos": [],
    "dob": "2005-01-01",
    "foot": "L",
    "height": 162,
    "team": "U23",
    "club": "UOC",
    "shirt": 21,
    "caps": 5,
    "intGoals": 0,
    "stats": {
      "apps": 17,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 1365
    },
    "intStats": {
      "apps": 3,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 350
    },
    "radar": {
      "pace": 11,
      "shooting": 12,
      "passing": 12,
      "dribbling": 12,
      "defending": 11,
      "physical": 11
    },
    "career": []
  },
  {
    "id": "p21",
    "nick": "Imm",
    "name": "WIRUNYA KWAENKASIKARM",
    "thaiName": "วิรัญญา แกว่นกสิกรรม",
    "pos": "ST",
    "altPos": [],
    "dob": "2005-07-07",
    "foot": "R",
    "height": 160,
    "team": "U23",
    "club": "CWF",
    "shirt": 22,
    "caps": 5,
    "intGoals": 2,
    "stats": {
      "apps": 17,
      "goals": 5,
      "assists": 3,
      "yellows": 0,
      "reds": 0,
      "minutes": 1365
    },
    "intStats": {
      "apps": 3,
      "goals": 2,
      "assists": 1,
      "yellows": 0,
      "reds": 0,
      "minutes": 350
    },
    "radar": {
      "pace": 16,
      "shooting": 13,
      "passing": 10,
      "dribbling": 15,
      "defending": 6,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p22",
    "nick": "Jame",
    "name": "KANTISA INCHAMNAN",
    "thaiName": "กันติศา อินชำนาญ",
    "pos": "LB",
    "altPos": [],
    "dob": "2005-01-01",
    "foot": "R",
    "height": 164,
    "team": "U23",
    "club": "CWF",
    "shirt": 23,
    "caps": 5,
    "intGoals": 0,
    "stats": {
      "apps": 17,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 1365
    },
    "intStats": {
      "apps": 3,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 350
    },
    "radar": {
      "pace": 12,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p23",
    "nick": "Juleliee",
    "name": "JULIE GROENNING",
    "thaiName": "จูลลี่ กวานนืง",
    "pos": "AM",
    "altPos": [],
    "dob": "2007-01-01",
    "foot": "R",
    "height": 165,
    "team": "U20",
    "club": "WS",
    "shirt": 24,
    "caps": 7,
    "intGoals": 0,
    "stats": {
      "apps": 19,
      "goals": 0,
      "assists": 2,
      "yellows": 2,
      "reds": 0,
      "minutes": 1527
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 490
    },
    "radar": {
      "pace": 13,
      "shooting": 14,
      "passing": 14,
      "dribbling": 14,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p24",
    "nick": "Kaka",
    "name": "PLUEMJAI SONTISAWAT",
    "thaiName": "ปลื้มใจ สนธิสวัสดิ์",
    "pos": "CM",
    "altPos": [],
    "dob": "2003-07-20",
    "foot": "L",
    "height": 167,
    "team": "U23",
    "club": "CWF",
    "shirt": 25,
    "caps": 3,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 3,
      "reds": 0,
      "minutes": 1203
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 210
    },
    "radar": {
      "pace": 14,
      "shooting": 13,
      "passing": 15,
      "dribbling": 15,
      "defending": 9,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p25",
    "nick": "Kat",
    "name": "SARUDA KONFAY",
    "thaiName": "ศรุดา ก้อนฝ้าย",
    "pos": "CB",
    "altPos": [],
    "dob": "1999-01-09",
    "foot": "R",
    "height": 167,
    "team": "Senior",
    "club": "BF",
    "shirt": 26,
    "caps": 59,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 4,
      "reds": 1,
      "minutes": 1219
    },
    "intStats": {
      "apps": 41,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 4130
    },
    "radar": {
      "pace": 11,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p26",
    "nick": "Kate",
    "name": "KURISARA LIMPAWANICH",
    "thaiName": "กุลิสรา ลิ้มปวะนิช",
    "pos": "ST",
    "altPos": [],
    "dob": "2009-01-01",
    "foot": "R",
    "height": 168,
    "team": "U17",
    "club": "BOA",
    "shirt": 27,
    "caps": 9,
    "intGoals": 0,
    "stats": {
      "apps": 21,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1689
    },
    "intStats": {
      "apps": 6,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 630
    },
    "radar": {
      "pace": 16,
      "shooting": 11,
      "passing": 13,
      "dribbling": 14,
      "defending": 6,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p27",
    "nick": "Looktan",
    "name": "RASITA TAOBAO",
    "thaiName": "ลสิตา แถวเบา",
    "pos": "LW",
    "altPos": [],
    "dob": "2007-01-01",
    "foot": "R",
    "height": 169,
    "team": "U20",
    "club": "CWF",
    "shirt": 28,
    "caps": 7,
    "intGoals": 0,
    "stats": {
      "apps": 19,
      "goals": 0,
      "assists": 2,
      "yellows": 2,
      "reds": 0,
      "minutes": 1527
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 490
    },
    "radar": {
      "pace": 13,
      "shooting": 11,
      "passing": 11,
      "dribbling": 12,
      "defending": 8,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p28",
    "nick": "Mai",
    "name": "TANEEKARN DANGDA",
    "thaiName": "ธนีกานต์ แดงดา",
    "pos": "ST",
    "altPos": [],
    "dob": "1992-01-01",
    "foot": "L",
    "height": 170,
    "team": "Senior",
    "club": "NPW",
    "shirt": 29,
    "caps": 42,
    "intGoals": 0,
    "stats": {
      "apps": 20,
      "goals": 0,
      "assists": 0,
      "yellows": 2,
      "reds": 0,
      "minutes": 1612
    },
    "intStats": {
      "apps": 29,
      "goals": 0,
      "assists": 0,
      "yellows": 2,
      "reds": 0,
      "minutes": 2940
    },
    "radar": {
      "pace": 13,
      "shooting": 11,
      "passing": 11,
      "dribbling": 16,
      "defending": 8,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p29",
    "nick": "May",
    "name": "MADISON JADE CASTEEN",
    "thaiName": "แมดดิสัน เจตน์ แคสทีน",
    "pos": "RW",
    "altPos": [],
    "dob": "2007-01-01",
    "foot": "R",
    "height": 171,
    "team": "U20",
    "club": "NC",
    "shirt": 30,
    "caps": 7,
    "intGoals": 1,
    "stats": {
      "apps": 19,
      "goals": 3,
      "assists": 3,
      "yellows": 2,
      "reds": 0,
      "minutes": 1527
    },
    "intStats": {
      "apps": 4,
      "goals": 1,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 490
    },
    "radar": {
      "pace": 13,
      "shooting": 12,
      "passing": 11,
      "dribbling": 12,
      "defending": 8,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p30",
    "nick": "Meow",
    "name": "NIPAWAN PANYOSUK",
    "thaiName": "นิภาวรรณ ปัญโญสุข",
    "pos": "DM",
    "altPos": [],
    "dob": "1995-03-15",
    "foot": "R",
    "height": 172,
    "team": "Senior",
    "club": "CWF",
    "shirt": 1,
    "caps": 45,
    "intGoals": 0,
    "stats": {
      "apps": 23,
      "goals": 0,
      "assists": 2,
      "yellows": 0,
      "reds": 0,
      "minutes": 1855
    },
    "intStats": {
      "apps": 31,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3150
    },
    "radar": {
      "pace": 12,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p31",
    "nick": "Ming",
    "name": "ORAWAN KEEREESUWANNAKUL",
    "thaiName": "อรวรรณ คีรีสุวรรณกุล",
    "pos": "RB",
    "altPos": [],
    "dob": "1997-06-30",
    "foot": "R",
    "height": 173,
    "team": "Senior",
    "club": "CWF",
    "shirt": 2,
    "caps": 47,
    "intGoals": 0,
    "stats": {
      "apps": 13,
      "goals": 0,
      "assists": 0,
      "yellows": 2,
      "reds": 0,
      "minutes": 1057
    },
    "intStats": {
      "apps": 32,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3290
    },
    "radar": {
      "pace": 14,
      "shooting": 8,
      "passing": 11,
      "dribbling": 9,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p32",
    "nick": "Mint",
    "name": "KANYANAT CHETTHABUTR",
    "thaiName": "กัญญาณัฐ เชษฐบุตร",
    "pos": "ST",
    "altPos": [],
    "dob": "1999-09-24",
    "foot": "L",
    "height": 158,
    "team": "Senior",
    "club": "BOA",
    "shirt": 3,
    "caps": 59,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 4,
      "reds": 1,
      "minutes": 1219
    },
    "intStats": {
      "apps": 41,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 4130
    },
    "radar": {
      "pace": 16,
      "shooting": 11,
      "passing": 13,
      "dribbling": 14,
      "defending": 6,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p33",
    "nick": "Miw",
    "name": "SILAWAN INTAMEE",
    "thaiName": "ศิลาวรรณ อินต๊ะมี",
    "pos": "LW",
    "altPos": [],
    "dob": "1994-01-21",
    "foot": "R",
    "height": 159,
    "team": "Senior",
    "club": "TBW",
    "shirt": 4,
    "caps": 44,
    "intGoals": 0,
    "stats": {
      "apps": 22,
      "goals": 0,
      "assists": 1,
      "yellows": 4,
      "reds": 0,
      "minutes": 1774
    },
    "intStats": {
      "apps": 30,
      "goals": 0,
      "assists": 0,
      "yellows": 2,
      "reds": 0,
      "minutes": 3080
    },
    "radar": {
      "pace": 15,
      "shooting": 11,
      "passing": 13,
      "dribbling": 13,
      "defending": 5,
      "physical": 11
    },
    "career": []
  },
  {
    "id": "p34",
    "nick": "Mo",
    "name": "TIPKRITTA ONSAMAI",
    "thaiName": "ทิพกฤตา อ่อนสมัย",
    "pos": "CB",
    "altPos": [],
    "dob": "2000-06-17",
    "foot": "R",
    "height": 160,
    "team": "Senior",
    "club": "BOA",
    "shirt": 5,
    "caps": 10,
    "intGoals": 0,
    "stats": {
      "apps": 12,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 1,
      "minutes": 960
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 700
    },
    "radar": {
      "pace": 11,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p35",
    "nick": "Mook",
    "name": "CHATCHAWAN RODTHONG",
    "thaiName": "ชัชวัลย์ รอดทอง",
    "pos": "LB",
    "altPos": [
      "CM",
      "DM"
    ],
    "dob": "2002-06-22",
    "foot": "R",
    "height": 165,
    "team": "Senior",
    "club": "BF",
    "shirt": 6,
    "caps": 12,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 2,
      "assists": 2,
      "yellows": 2,
      "reds": 0,
      "minutes": 1122
    },
    "intStats": {
      "apps": 8,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 840
    },
    "radar": {
      "pace": 14,
      "shooting": 7,
      "passing": 11,
      "dribbling": 9,
      "defending": 15,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p36",
    "nick": "Muay",
    "name": "PANITTHA JEERATANAPAVIBUL",
    "thaiName": "ปณิฏฐา จีรัตนะภวิบูล",
    "pos": "CB",
    "altPos": [],
    "dob": "2001-11-15",
    "foot": "L",
    "height": 162,
    "team": "Senior",
    "club": "GPF",
    "shirt": 7,
    "caps": 11,
    "intGoals": 0,
    "stats": {
      "apps": 13,
      "goals": 1,
      "assists": 0,
      "yellows": 1,
      "reds": 0,
      "minutes": 1041
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 770
    },
    "radar": {
      "pace": 12,
      "shooting": 6,
      "passing": 15,
      "dribbling": 8,
      "defending": 14,
      "physical": 14
    },
    "career": []
  },
  {
    "id": "p37",
    "nick": "Nan",
    "name": "PAWARISA KERAM",
    "thaiName": "ปวริศา เกรัมย์",
    "pos": "LB",
    "altPos": [],
    "dob": "2006-02-06",
    "foot": "R",
    "height": 163,
    "team": "U20",
    "club": "KB",
    "shirt": 8,
    "caps": 6,
    "intGoals": 0,
    "stats": {
      "apps": 18,
      "goals": 0,
      "assists": 1,
      "yellows": 1,
      "reds": 0,
      "minutes": 1446
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 420
    },
    "radar": {
      "pace": 13,
      "shooting": 7,
      "passing": 15,
      "dribbling": 8,
      "defending": 14,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p38",
    "nick": "Nancy",
    "name": "Nancy",
    "thaiName": "",
    "pos": "LB",
    "altPos": [],
    "dob": "2000-01-01",
    "foot": "R",
    "height": 164,
    "team": "Senior",
    "club": "FREE",
    "shirt": 9,
    "caps": 10,
    "intGoals": 0,
    "stats": {
      "apps": 12,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 1,
      "minutes": 960
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 700
    },
    "radar": {
      "pace": 11,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p39",
    "nick": "Natalie",
    "name": "NATALIE NGO-SUWAN",
    "thaiName": "นาตาลี หงอสุวรรณ",
    "pos": "ST",
    "altPos": [],
    "dob": "2000-01-01",
    "foot": "R",
    "height": 165,
    "team": "Senior",
    "club": "FREE",
    "shirt": 10,
    "caps": 10,
    "intGoals": 0,
    "stats": {
      "apps": 12,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 1,
      "minutes": 960
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 700
    },
    "radar": {
      "pace": 16,
      "shooting": 11,
      "passing": 13,
      "dribbling": 14,
      "defending": 6,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p40",
    "nick": "Ned",
    "name": "Ned",
    "thaiName": "",
    "pos": "RB",
    "altPos": [
      "RW"
    ],
    "dob": "2000-01-01",
    "foot": "L",
    "height": 166,
    "team": "Senior",
    "club": "BF",
    "shirt": 11,
    "caps": 10,
    "intGoals": 0,
    "stats": {
      "apps": 12,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 1,
      "minutes": 960
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 700
    },
    "radar": {
      "pace": 11,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p41",
    "nick": "Noey",
    "name": "PATTARANAN AUPACHAI",
    "thaiName": "ภัทรนันท์ อุปชัย",
    "pos": "RW",
    "altPos": [],
    "dob": "2002-07-09",
    "foot": "R",
    "height": 161,
    "team": "Senior",
    "club": "CWF",
    "shirt": 12,
    "caps": 12,
    "intGoals": 1,
    "stats": {
      "apps": 14,
      "goals": 3,
      "assists": 2,
      "yellows": 2,
      "reds": 0,
      "minutes": 1122
    },
    "intStats": {
      "apps": 8,
      "goals": 1,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 840
    },
    "radar": {
      "pace": 13,
      "shooting": 12,
      "passing": 11,
      "dribbling": 16,
      "defending": 8,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p42",
    "nick": "Nong",
    "name": "KARNJANATHAT PHOMSRI",
    "thaiName": "กาญจนธัช พุ่มศรี",
    "pos": "RW",
    "altPos": [],
    "dob": "2003-01-01",
    "foot": "R",
    "height": 165,
    "team": "U23",
    "club": "KB",
    "shirt": 13,
    "caps": 3,
    "intGoals": 3,
    "stats": {
      "apps": 15,
      "goals": 9,
      "assists": 7,
      "yellows": 3,
      "reds": 0,
      "minutes": 1203
    },
    "intStats": {
      "apps": 2,
      "goals": 3,
      "assists": 1,
      "yellows": 0,
      "reds": 0,
      "minutes": 210
    },
    "radar": {
      "pace": 14,
      "shooting": 15,
      "passing": 12,
      "dribbling": 12,
      "defending": 5,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p43",
    "nick": "Nong",
    "name": "PANITA PHOMRAT",
    "thaiName": "พนิตา พรมรัต",
    "pos": "GK",
    "altPos": [],
    "dob": "2000-01-01",
    "foot": "R",
    "height": 171,
    "team": "Senior",
    "club": "BGC",
    "shirt": 14,
    "caps": 10,
    "intGoals": 0,
    "stats": {
      "apps": 12,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 1,
      "minutes": 960
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 700
    },
    "radar": {
      "pace": 9,
      "shooting": 6,
      "passing": 15,
      "dribbling": 5,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p44",
    "nick": "Noon",
    "name": "NUENGRUTHAI SORAHONG",
    "thaiName": "หนึ่งฤทัย สรหงษ์",
    "pos": "GK",
    "altPos": [],
    "dob": "2001-01-01",
    "foot": "L",
    "height": 170,
    "team": "Senior",
    "club": "BF",
    "shirt": 15,
    "caps": 11,
    "intGoals": 0,
    "stats": {
      "apps": 13,
      "goals": 0,
      "assists": 0,
      "yellows": 1,
      "reds": 0,
      "minutes": 1041
    },
    "intStats": {
      "apps": 7,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 770
    },
    "radar": {
      "pace": 10,
      "shooting": 7,
      "passing": 10,
      "dribbling": 6,
      "defending": 17,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p45",
    "nick": "Nut",
    "name": "CHATTAYA PRATHUMKUN",
    "thaiName": "ฉัตรญา ประทุมกุล",
    "pos": "ST",
    "altPos": [],
    "dob": "2004-06-22",
    "foot": "R",
    "height": 171,
    "team": "U23",
    "club": "PFC",
    "shirt": 16,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 15,
      "shooting": 11,
      "passing": 13,
      "dribbling": 13,
      "defending": 5,
      "physical": 11
    },
    "career": []
  },
  {
    "id": "p46",
    "nick": "Pa",
    "name": "ALISA RUKPINIJ",
    "thaiName": "อลิษา รักพินิจ",
    "pos": "ST",
    "altPos": [],
    "dob": "1995-02-02",
    "foot": "R",
    "height": 172,
    "team": "Senior",
    "club": "PT",
    "shirt": 17,
    "caps": 45,
    "intGoals": 0,
    "stats": {
      "apps": 23,
      "goals": 0,
      "assists": 2,
      "yellows": 0,
      "reds": 0,
      "minutes": 1855
    },
    "intStats": {
      "apps": 31,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3150
    },
    "radar": {
      "pace": 16,
      "shooting": 11,
      "passing": 10,
      "dribbling": 15,
      "defending": 6,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p47",
    "nick": "Pae",
    "name": "THANAKON PHONKHAM",
    "thaiName": "ธนกร พลคำ",
    "pos": "DM",
    "altPos": [],
    "dob": "2002-02-18",
    "foot": "R",
    "height": 173,
    "team": "Senior",
    "club": "CWF",
    "shirt": 18,
    "caps": 12,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 0,
      "assists": 1,
      "yellows": 2,
      "reds": 0,
      "minutes": 1122
    },
    "intStats": {
      "apps": 8,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 840
    },
    "radar": {
      "pace": 14,
      "shooting": 7,
      "passing": 11,
      "dribbling": 9,
      "defending": 15,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p48",
    "nick": "Pailin",
    "name": "MATILDA PAILIN",
    "thaiName": "มาทิลดา โมร์เตนส์สัน",
    "pos": "CB",
    "altPos": [],
    "dob": "2005-01-01",
    "foot": "L",
    "height": 158,
    "team": "U23",
    "club": "VBF",
    "shirt": 19,
    "caps": 5,
    "intGoals": 0,
    "stats": {
      "apps": 17,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 1365
    },
    "intStats": {
      "apps": 3,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 350
    },
    "radar": {
      "pace": 12,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p49",
    "nick": "Pecky",
    "name": "U-RAIPORN YONGKUL",
    "thaiName": "อุไรพร ยงกุล",
    "pos": "RB",
    "altPos": [],
    "dob": "1998-01-01",
    "foot": "R",
    "height": 157,
    "team": "Senior",
    "club": "BOA",
    "shirt": 20,
    "caps": 48,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 0,
      "assists": 1,
      "yellows": 3,
      "reds": 0,
      "minutes": 1138
    },
    "intStats": {
      "apps": 33,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3360
    },
    "radar": {
      "pace": 15,
      "shooting": 9,
      "passing": 12,
      "dribbling": 11,
      "defending": 17,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p50",
    "nick": "Peem",
    "name": "THANCHANOK JANSRI",
    "thaiName": "ธัญชนก จั่นศรี",
    "pos": "CM",
    "altPos": [],
    "dob": "2004-12-24",
    "foot": "R",
    "height": 160,
    "team": "U23",
    "club": "CWF",
    "shirt": 21,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 11,
      "shooting": 11,
      "passing": 16,
      "dribbling": 11,
      "defending": 10,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p51",
    "nick": "Pin",
    "name": "PIKUL KHUEANPET",
    "thaiName": "พิกุล เขื่อนเพ็ชร",
    "pos": "DM",
    "altPos": [],
    "dob": "1988-09-20",
    "foot": "R",
    "height": 161,
    "team": "Senior",
    "club": "BOA",
    "shirt": 22,
    "caps": 38,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 1,
      "minutes": 1288
    },
    "intStats": {
      "apps": 26,
      "goals": 0,
      "assists": 0,
      "yellows": 2,
      "reds": 0,
      "minutes": 2660
    },
    "radar": {
      "pace": 14,
      "shooting": 8,
      "passing": 11,
      "dribbling": 9,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p52",
    "nick": "Plam",
    "name": "SARANYA LAMEE",
    "thaiName": "ศรัญญา ลามี",
    "pos": "CB",
    "altPos": [],
    "dob": "2004-01-01",
    "foot": "L",
    "height": 162,
    "team": "U23",
    "club": "BOA",
    "shirt": 23,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 11,
      "shooting": 9,
      "passing": 13,
      "dribbling": 11,
      "defending": 17,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p53",
    "nick": "Pleng",
    "name": "PINYAPHAT KLINKLAI",
    "thaiName": "ภิญญาพัชญ์ กลิ่นคล้าย",
    "pos": "CB",
    "altPos": [],
    "dob": "2008-01-26",
    "foot": "R",
    "height": 170,
    "team": "U20",
    "club": "NSS",
    "shirt": 24,
    "caps": 8,
    "intGoals": 0,
    "stats": {
      "apps": 20,
      "goals": 1,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 1608
    },
    "intStats": {
      "apps": 5,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 560
    },
    "radar": {
      "pace": 15,
      "shooting": 9,
      "passing": 12,
      "dribbling": 11,
      "defending": 17,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p54",
    "nick": "Pleng",
    "name": "ANAPHON AMANPONG",
    "thaiName": "อนาพร อามันพงษ์",
    "pos": "LW",
    "altPos": [],
    "dob": "2005-01-20",
    "foot": "R",
    "height": 164,
    "team": "U23",
    "club": "CWF",
    "shirt": 25,
    "caps": 5,
    "intGoals": 0,
    "stats": {
      "apps": 17,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 1365
    },
    "intStats": {
      "apps": 3,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 350
    },
    "radar": {
      "pace": 16,
      "shooting": 11,
      "passing": 10,
      "dribbling": 15,
      "defending": 6,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p55",
    "nick": "Pleng",
    "name": "PARICHAT THONGRONG",
    "thaiName": "ปาริชาต ทองรอง",
    "pos": "LB",
    "altPos": [],
    "dob": "2006-05-14",
    "foot": "R",
    "height": 165,
    "team": "U20",
    "club": "KB",
    "shirt": 26,
    "caps": 6,
    "intGoals": 0,
    "stats": {
      "apps": 18,
      "goals": 0,
      "assists": 1,
      "yellows": 1,
      "reds": 0,
      "minutes": 1446
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 420
    },
    "radar": {
      "pace": 13,
      "shooting": 7,
      "passing": 15,
      "dribbling": 8,
      "defending": 14,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p56",
    "nick": "Ploy",
    "name": "PLOYCHOMPOO SOMNUEK",
    "thaiName": "พลอยชมพู สมนึก",
    "pos": "LW",
    "altPos": [],
    "dob": "2002-12-26",
    "foot": "L",
    "height": 166,
    "team": "Senior",
    "club": "BF",
    "shirt": 27,
    "caps": 12,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 2,
      "assists": 2,
      "yellows": 2,
      "reds": 0,
      "minutes": 1122
    },
    "intStats": {
      "apps": 8,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 840
    },
    "radar": {
      "pace": 13,
      "shooting": 12,
      "passing": 11,
      "dribbling": 16,
      "defending": 8,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p57",
    "nick": "Praw",
    "name": "SIRIKAN PHAYAKNET",
    "thaiName": "ศิริกาญจน์ พยัคเนตร",
    "pos": "DM",
    "altPos": [],
    "dob": "1998-06-11",
    "foot": "R",
    "height": 167,
    "team": "Senior",
    "club": "BF",
    "shirt": 28,
    "caps": 48,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 0,
      "assists": 1,
      "yellows": 3,
      "reds": 0,
      "minutes": 1138
    },
    "intStats": {
      "apps": 33,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3360
    },
    "radar": {
      "pace": 15,
      "shooting": 9,
      "passing": 12,
      "dribbling": 11,
      "defending": 17,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p58",
    "nick": "Pui",
    "name": "PITSAMAI SORNSAI",
    "thaiName": "พิสมัย สอนไสย์",
    "pos": "ST",
    "altPos": [
      "CB"
    ],
    "dob": "1989-01-19",
    "foot": "R",
    "height": 172,
    "team": "Senior",
    "club": "TBW",
    "shirt": 29,
    "caps": 39,
    "intGoals": 0,
    "stats": {
      "apps": 17,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1369
    },
    "intStats": {
      "apps": 27,
      "goals": 0,
      "assists": 0,
      "yellows": 2,
      "reds": 0,
      "minutes": 2730
    },
    "radar": {
      "pace": 15,
      "shooting": 11,
      "passing": 12,
      "dribbling": 13,
      "defending": 5,
      "physical": 11
    },
    "career": []
  },
  {
    "id": "p59",
    "nick": "Rooney",
    "name": "JIRAPORN MONGKOLDEE",
    "thaiName": "จิราภรณ์ มงคลดี",
    "pos": "ST",
    "altPos": [],
    "dob": "1998-08-13",
    "foot": "R",
    "height": 169,
    "team": "Senior",
    "club": "GPF",
    "shirt": 30,
    "caps": 48,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 2,
      "assists": 2,
      "yellows": 3,
      "reds": 0,
      "minutes": 1138
    },
    "intStats": {
      "apps": 33,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3360
    },
    "radar": {
      "pace": 15,
      "shooting": 12,
      "passing": 12,
      "dribbling": 13,
      "defending": 5,
      "physical": 11
    },
    "career": []
  },
  {
    "id": "p60",
    "nick": "Rush",
    "name": "Rhianne Rush",
    "thaiName": "รีแอนท์ รัช",
    "pos": "CM",
    "altPos": [],
    "dob": "2003-01-01",
    "foot": "L",
    "height": 170,
    "team": "U23",
    "club": "RBW",
    "shirt": 1,
    "caps": 3,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 3,
      "reds": 0,
      "minutes": 1203
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 210
    },
    "radar": {
      "pace": 14,
      "shooting": 13,
      "passing": 15,
      "dribbling": 15,
      "defending": 9,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p61",
    "nick": "Sakura",
    "name": "PRIMA OWAKI NIKORNNARONG",
    "thaiName": "พริมา โอวากิ นิกรณรงค์",
    "pos": "GK",
    "altPos": [],
    "dob": "2006-05-24",
    "foot": "R",
    "height": 171,
    "team": "U20",
    "club": "PWT",
    "shirt": 2,
    "caps": 6,
    "intGoals": 0,
    "stats": {
      "apps": 18,
      "goals": 0,
      "assists": 1,
      "yellows": 1,
      "reds": 0,
      "minutes": 1446
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 420
    },
    "radar": {
      "pace": 15,
      "shooting": 4,
      "passing": 12,
      "dribbling": 6,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p62",
    "nick": "Salah",
    "name": "ORAPIN WAENNGOEN",
    "thaiName": "อรพินท์ แหวนเงิน",
    "pos": "LW",
    "altPos": [
      "AM"
    ],
    "dob": "1995-10-07",
    "foot": "R",
    "height": 172,
    "team": "Senior",
    "club": "BOA",
    "shirt": 3,
    "caps": 45,
    "intGoals": 0,
    "stats": {
      "apps": 23,
      "goals": 0,
      "assists": 2,
      "yellows": 0,
      "reds": 0,
      "minutes": 1855
    },
    "intStats": {
      "apps": 31,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3150
    },
    "radar": {
      "pace": 16,
      "shooting": 11,
      "passing": 10,
      "dribbling": 15,
      "defending": 6,
      "physical": 12
    },
    "career": []
  },
  {
    "id": "p63",
    "nick": "Sangjun",
    "name": "SANGJUN MAI HORNEWER",
    "thaiName": "แสงจันทร์ ฮอร์นูเวอร์",
    "pos": "CM",
    "altPos": [],
    "dob": "1998-01-01",
    "foot": "R",
    "height": 173,
    "team": "Senior",
    "club": "MBF",
    "shirt": 4,
    "caps": 48,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 0,
      "assists": 1,
      "yellows": 3,
      "reds": 0,
      "minutes": 1138
    },
    "intStats": {
      "apps": 33,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3360
    },
    "radar": {
      "pace": 14,
      "shooting": 9,
      "passing": 15,
      "dribbling": 15,
      "defending": 9,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p64",
    "nick": "Siri",
    "name": "ARICHA SIRICHANG",
    "thaiName": "อริชา ศิริช่าง",
    "pos": "RW",
    "altPos": [],
    "dob": "2004-01-01",
    "foot": "L",
    "height": 158,
    "team": "U23",
    "club": "MBF",
    "shirt": 5,
    "caps": 4,
    "intGoals": 0,
    "stats": {
      "apps": 16,
      "goals": 0,
      "assists": 0,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 15,
      "shooting": 11,
      "passing": 13,
      "dribbling": 13,
      "defending": 5,
      "physical": 11
    },
    "career": []
  },
  {
    "id": "p65",
    "nick": "Som-O",
    "name": "YADA SENGYONG",
    "thaiName": "ญาดา เซ่งย่อง",
    "pos": "GK",
    "altPos": [],
    "dob": "1993-09-10",
    "foot": "R",
    "height": 159,
    "team": "Senior",
    "club": "NSS",
    "shirt": 6,
    "caps": 43,
    "intGoals": 0,
    "stats": {
      "apps": 21,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 1693
    },
    "intStats": {
      "apps": 30,
      "goals": 0,
      "assists": 0,
      "yellows": 2,
      "reds": 0,
      "minutes": 3010
    },
    "radar": {
      "pace": 12,
      "shooting": 5,
      "passing": 12,
      "dribbling": 8,
      "defending": 14,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p66",
    "nick": "Team",
    "name": "KANJANAPORN SAENKHUN",
    "thaiName": "กาญจนาพร แสนคุณ",
    "pos": "CB",
    "altPos": [],
    "dob": "1996-07-18",
    "foot": "R",
    "height": 160,
    "team": "Senior",
    "club": "BOA",
    "shirt": 7,
    "caps": 46,
    "intGoals": 0,
    "stats": {
      "apps": 12,
      "goals": 0,
      "assists": 0,
      "yellows": 1,
      "reds": 0,
      "minutes": 976
    },
    "intStats": {
      "apps": 32,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3220
    },
    "radar": {
      "pace": 13,
      "shooting": 7,
      "passing": 15,
      "dribbling": 8,
      "defending": 14,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p67",
    "nick": "Tee",
    "name": "SAKUNKAN Chompooseang",
    "thaiName": "สกุลการต์ ชุมภูแสง",
    "pos": "CB",
    "altPos": [],
    "dob": "2005-06-06",
    "foot": "R",
    "height": 161,
    "team": "U23",
    "club": "KB",
    "shirt": 8,
    "caps": 5,
    "intGoals": 0,
    "stats": {
      "apps": 17,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 1365
    },
    "intStats": {
      "apps": 3,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 350
    },
    "radar": {
      "pace": 12,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p68",
    "nick": "Tiff",
    "name": "Tiffany Darunee Sornpao",
    "thaiName": "ทิฟฟานี่ ดารุณี สอนเผ่า",
    "pos": "GK",
    "altPos": [],
    "dob": "1998-05-22",
    "foot": "L",
    "height": 162,
    "team": "Senior",
    "club": "BI",
    "shirt": 9,
    "caps": 48,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 0,
      "assists": 1,
      "yellows": 3,
      "reds": 0,
      "minutes": 1138
    },
    "intStats": {
      "apps": 33,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 3360
    },
    "radar": {
      "pace": 8,
      "shooting": 5,
      "passing": 14,
      "dribbling": 8,
      "defending": 15,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p69",
    "nick": "Toey",
    "name": "THANCHANOK CHEUNAROM",
    "thaiName": "ธัญชนก ชื่นอารมณ์",
    "pos": "CB",
    "altPos": [],
    "dob": "2006-06-30",
    "foot": "R",
    "height": 163,
    "team": "U20",
    "club": "CWF",
    "shirt": 10,
    "caps": 6,
    "intGoals": 0,
    "stats": {
      "apps": 18,
      "goals": 2,
      "assists": 2,
      "yellows": 1,
      "reds": 0,
      "minutes": 1446
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 420
    },
    "radar": {
      "pace": 13,
      "shooting": 7,
      "passing": 15,
      "dribbling": 8,
      "defending": 14,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p70",
    "nick": "Tongar",
    "name": "THAWANRAT PROMTHONGMEE",
    "thaiName": "ธวันรัตน์ พรมทองมี",
    "pos": "AM",
    "altPos": [],
    "dob": "2004-11-29",
    "foot": "R",
    "height": 158,
    "team": "U23",
    "club": "CWF",
    "shirt": 11,
    "caps": 4,
    "intGoals": 2,
    "stats": {
      "apps": 16,
      "goals": 5,
      "assists": 2,
      "yellows": 4,
      "reds": 0,
      "minutes": 1284
    },
    "intStats": {
      "apps": 2,
      "goals": 2,
      "assists": 1,
      "yellows": 0,
      "reds": 0,
      "minutes": 280
    },
    "radar": {
      "pace": 11,
      "shooting": 11,
      "passing": 16,
      "dribbling": 11,
      "defending": 10,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p71",
    "nick": "Tonnam",
    "name": "JULAIPORN JAIMULWONG",
    "thaiName": "จุไรพร ใจมูลวงศ์",
    "pos": "LB",
    "altPos": [],
    "dob": "2007-01-01",
    "foot": "R",
    "height": 165,
    "team": "U20",
    "club": "CWF",
    "shirt": 12,
    "caps": 7,
    "intGoals": 0,
    "stats": {
      "apps": 19,
      "goals": 0,
      "assists": 2,
      "yellows": 2,
      "reds": 0,
      "minutes": 1527
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 490
    },
    "radar": {
      "pace": 14,
      "shooting": 8,
      "passing": 11,
      "dribbling": 9,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p72",
    "nick": "VIEW",
    "name": "PHONPHIRUN PHILAWAN",
    "thaiName": "พรพิรุณ พิลาวัน",
    "pos": "RB",
    "altPos": [],
    "dob": "1999-04-08",
    "foot": "L",
    "height": 166,
    "team": "Senior",
    "club": "BOA",
    "shirt": 13,
    "caps": 59,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 4,
      "reds": 1,
      "minutes": 1219
    },
    "intStats": {
      "apps": 41,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 4130
    },
    "radar": {
      "pace": 11,
      "shooting": 6,
      "passing": 14,
      "dribbling": 12,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p73",
    "nick": "View",
    "name": "CHOTMANEE THONGMONGKOL",
    "thaiName": "โชติมณี ทองมงคล",
    "pos": "GK",
    "altPos": [],
    "dob": "1999-01-12",
    "foot": "R",
    "height": 167,
    "team": "Senior",
    "club": "BF",
    "shirt": 14,
    "caps": 59,
    "intGoals": 0,
    "stats": {
      "apps": 15,
      "goals": 0,
      "assists": 2,
      "yellows": 4,
      "reds": 1,
      "minutes": 1219
    },
    "intStats": {
      "apps": 41,
      "goals": 0,
      "assists": 0,
      "yellows": 3,
      "reds": 0,
      "minutes": 4130
    },
    "radar": {
      "pace": 9,
      "shooting": 6,
      "passing": 15,
      "dribbling": 5,
      "defending": 16,
      "physical": 16
    },
    "career": []
  },
  {
    "id": "p74",
    "nick": "Waew",
    "name": "CHADANUCH TANTIPATHON",
    "thaiName": "ชฎานุช ตันติภาธร",
    "pos": "ST",
    "altPos": [
      "LW"
    ],
    "dob": "2002-01-01",
    "foot": "R",
    "height": 168,
    "team": "Senior",
    "club": "KB",
    "shirt": 15,
    "caps": 12,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 0,
      "assists": 1,
      "yellows": 2,
      "reds": 0,
      "minutes": 1122
    },
    "intStats": {
      "apps": 8,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 840
    },
    "radar": {
      "pace": 13,
      "shooting": 11,
      "passing": 11,
      "dribbling": 16,
      "defending": 8,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p75",
    "nick": "Yee",
    "name": "SAOWALAK PENGNGAM",
    "thaiName": "เสาวลักษณ์ เพ็งงาม",
    "pos": "ST",
    "altPos": [],
    "dob": "1996-11-30",
    "foot": "R",
    "height": 167,
    "team": "Senior",
    "club": "TBW",
    "shirt": 16,
    "caps": 46,
    "intGoals": 2,
    "stats": {
      "apps": 12,
      "goals": 5,
      "assists": 2,
      "yellows": 1,
      "reds": 0,
      "minutes": 976
    },
    "intStats": {
      "apps": 32,
      "goals": 2,
      "assists": 1,
      "yellows": 3,
      "reds": 0,
      "minutes": 3220
    },
    "radar": {
      "pace": 12,
      "shooting": 13,
      "passing": 10,
      "dribbling": 16,
      "defending": 7,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p76",
    "nick": "Yim",
    "name": "Rinyaphat Moondong",
    "thaiName": "ริญญาภัทร์ มูลดง",
    "pos": "AM",
    "altPos": [],
    "dob": "2007-06-19",
    "foot": "L",
    "height": 170,
    "team": "U20",
    "club": "CWF",
    "shirt": 17,
    "caps": 7,
    "intGoals": 0,
    "stats": {
      "apps": 19,
      "goals": 0,
      "assists": 2,
      "yellows": 2,
      "reds": 0,
      "minutes": 1527
    },
    "intStats": {
      "apps": 4,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 490
    },
    "radar": {
      "pace": 13,
      "shooting": 14,
      "passing": 14,
      "dribbling": 14,
      "defending": 13,
      "physical": 13
    },
    "career": []
  },
  {
    "id": "p77",
    "nick": "Yumi",
    "name": "KANYARAT AIKAWA",
    "thaiName": "กัญญารัตน์ อาอิกว่า",
    "pos": "RB",
    "altPos": [],
    "dob": "2002-01-01",
    "foot": "R",
    "height": 171,
    "team": "Senior",
    "club": "PFC",
    "shirt": 18,
    "caps": 12,
    "intGoals": 0,
    "stats": {
      "apps": 14,
      "goals": 0,
      "assists": 1,
      "yellows": 2,
      "reds": 0,
      "minutes": 1122
    },
    "intStats": {
      "apps": 8,
      "goals": 0,
      "assists": 0,
      "yellows": 0,
      "reds": 0,
      "minutes": 840
    },
    "radar": {
      "pace": 14,
      "shooting": 7,
      "passing": 11,
      "dribbling": 9,
      "defending": 15,
      "physical": 15
    },
    "career": []
  },
  {
    "id": "p101",
    "nick": "Preechakorn",
    "name": "PREECHAKORN KRUECHUENCHOM",
    "thaiName": "ปรีชากรณ์ เครือชื่นชม",
    "pos": "CM",
    "altPos": [],
    "dob": "2000-01-01",
    "foot": "R",
    "height": 165,
    "team": "Senior",
    "club": "FREE",
    "shirt": 0,
    "radar": {
      "pace": 10,
      "shooting": 10,
      "passing": 10,
      "dribbling": 10,
      "defending": 10,
      "physical": 10
    },
    "career": []
  },
  {
    "id": "p102",
    "nick": "Kwanjira",
    "name": "KWANJIRA NGOK-WONG",
    "thaiName": "ขวัญจิรา งอกวงค์",
    "pos": "CM",
    "altPos": [],
    "dob": "2000-01-01",
    "foot": "R",
    "height": 165,
    "team": "Senior",
    "club": "FREE",
    "shirt": 0,
    "radar": {
      "pace": 10,
      "shooting": 10,
      "passing": 10,
      "dribbling": 10,
      "defending": 10,
      "physical": 10
    },
    "career": []
  }
];

window.TWNT_DATA = { PLAYERS, CLUBS, POSITIONS, POSITION_GROUPS, TEAMS };
