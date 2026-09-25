import fs from "node:fs/promises";
import vm from "node:vm";

const source = await fs.readFile(new URL("../dist/data/opta-stats.js", import.meta.url), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);

const leagues = sandbox.window.OPTA_STATS_DATA || {};
const playerNames = [...new Set(Object.values(leagues).flatMap((league) => (league.players || []).map((player) => player.n).filter(Boolean)))].sort();

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const sparqlLiteral = (value) => `"${String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"@en`;
const cacheUrl = new URL("./.persian-names-cache.json", import.meta.url);
let playerMap = {};
try { playerMap = JSON.parse(await fs.readFile(cacheUrl, "utf8")); } catch {}

if (process.env.SKIP_FETCH !== "1") for (let offset = 0; offset < playerNames.length; offset += 70) {
  const batch = playerNames.slice(offset, offset + 70).filter((name) => !playerMap[name]);
  if (!batch.length) continue;
  const query = `
SELECT ?en ?fa ?ar WHERE {
  VALUES ?en { ${batch.map(sparqlLiteral).join(" ")} }
  { ?item rdfs:label ?en. } UNION { ?item skos:altLabel ?en. }
  ?item wdt:P106 wd:Q937857.
  OPTIONAL { ?item rdfs:label ?fa. FILTER(LANG(?fa) = "fa") }
  OPTIONAL { ?item rdfs:label ?ar. FILTER(LANG(?ar) = "ar") }
  FILTER(BOUND(?fa) || BOUND(?ar))
}`;
  let response;
  for (let attempt = 0; attempt < 7; attempt += 1) {
    response = await fetch("https://query.wikidata.org/sparql", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
        accept: "application/sparql-results+json",
        "user-agent": "NimkatSports/1.0 (Persian football name localization)",
      },
      body: new URLSearchParams({ query, format: "json" }),
    });
    if (response.ok) break;
    if (response.status !== 429 && response.status < 500) throw new Error(`Wikidata ${response.status} at batch ${offset}`);
    await sleep(2500 * (attempt + 1));
  }
  if (!response?.ok) throw new Error(`Wikidata ${response?.status || "unavailable"} at batch ${offset}`);
  const payload = await response.json();
  const normalizeArabicLabel = (value) => String(value).replaceAll("ك", "ک").replaceAll("ي", "ی").replaceAll("ى", "ی").replaceAll("ة", "ه").replace(/[ًٌٍَُِّْـ]/g, "");
  for (const row of payload.results?.bindings || []) {
    const english = row.en?.value;
    const persian = row.fa?.value || (row.ar?.value ? normalizeArabicLabel(row.ar.value) : "");
    if (english && persian && !playerMap[english]) playerMap[english] = persian;
  }
  await fs.writeFile(cacheUrl, JSON.stringify(playerMap));
  process.stdout.write(`\rPersian labels: ${Object.keys(playerMap).length}/${playerNames.length} (${Math.min(offset + batch.length, playerNames.length)})`);
  await sleep(1200);
}

const teamMap = {
  "Alavés":"آلاوس","Angers":"آنژه","Arsenal":"آرسنال","Aston Villa":"استون ویلا","Atalanta":"آتالانتا","Athletic Club":"اتلتیک بیلبائو","Atlético de Madrid":"اتلتیکو مادرید","Augsburg":"آگزبورگ","Auxerre":"اوسر","Barcelona":"بارسلونا","Bayer 04 Leverkusen":"بایر لورکوزن","Bayern München":"بایرن مونیخ","Bologna":"بولونیا","Borussia Dortmund":"بوروسیا دورتموند","Borussia M'gladbach":"بوروسیا مونشن‌گلادباخ","Bournemouth":"بورنموث","Brentford":"برنتفورد","Brest":"برست","Brighton & Hove Albion":"برایتون","Cagliari":"کالیاری","Celta de Vigo":"سلتاویگو","Chelsea":"چلسی","Como":"کومو","Coventry City":"کاونتری سیتی","Crystal Palace":"کریستال پالاس","Deportivo de A Coruña":"دپورتیوو لاکرونیا","Eintracht Frankfurt":"اینتراخت فرانکفورت","Elche":"الچه","Elversberg":"الفرسبرگ","Espanyol":"اسپانیول","Everton":"اورتون","Fiorentina":"فیورنتینا","Freiburg":"فرایبورگ","Frosinone":"فروزینونه","Fulham":"فولام","Genoa":"جنوا","Getafe":"ختافه","Hamburger SV":"هامبورگ","Hoffenheim":"هوفنهایم","Hull City":"هال سیتی","Internazionale":"اینتر","Ipswich Town":"ایپسویچ تاون","Juventus":"یوونتوس","Köln":"کلن","Lazio":"لاتزیو","Le Havre":"لو آور","Le Mans":"لو مان","Lecce":"لچه","Leeds United":"لیدز یونایتد","Lens":"لانس","Levante":"لوانته","Lille":"لیل","Liverpool":"لیورپول","Lorient":"لوریان","Mainz 05":"ماینتس","Manchester City":"منچستر سیتی","Manchester United":"منچستر یونایتد","Milan":"میلان","Monaco":"موناکو","Monza":"مونتزا","Málaga":"مالاگا","Napoli":"ناپولی","Newcastle United":"نیوکاسل یونایتد","Nice":"نیس","Nottingham Forest":"ناتینگام فارست","Olympique Lyonnais":"لیون","Olympique Marseille":"مارسی","Osasuna":"اوساسونا","Paderborn":"پادربورن","Paris FC":"پاریس اف‌سی","Paris Saint-Germain":"پاری سن ژرمن","Parma":"پارما","RB Leipzig":"لایپزیش","Racing de Santander":"راسینگ سانتاندر","Rayo Vallecano":"رایو وایکانو","Real Betis":"رئال بتیس","Real Madrid":"رئال مادرید","Real Sociedad":"رئال سوسیداد","Rennes":"رن","Roma":"رم","Sassuolo":"ساسولو","Schalke 04":"شالکه ۰۴","Sevilla":"سویا","Strasbourg":"استراسبورگ","Stuttgart":"اشتوتگارت","Sunderland":"ساندرلند","Torino":"تورینو","Tottenham Hotspur":"تاتنهام","Toulouse":"تولوز","Troyes":"تروا","Udinese":"اودینزه","Union Berlin":"اونیون برلین","Valencia":"والنسیا","Venezia":"ونتزیا","Villarreal":"ویارئال","Werder Bremen":"وردربرمن"
};

// Common newsroom spellings for national teams. These labels intentionally
// prefer the forms used by Iranian sports media over literal transliteration.
const nationalTeamMap = {
  "Afghanistan":"افغانستان","Albania":"آلبانی","Algeria":"الجزایر","Andorra":"آندورا","Angola":"آنگولا","Argentina":"آرژانتین","Armenia":"ارمنستان","Australia":"استرالیا","Austria":"اتریش","Azerbaijan":"جمهوری آذربایجان",
  "Bahrain":"بحرین","Belarus":"بلاروس","Belgium":"بلژیک","Bolivia":"بولیوی","Bosnia and Herzegovina":"بوسنی و هرزگوین","Botswana":"بوتسوانا","Brazil":"برزیل","Bulgaria":"بلغارستان","Burkina Faso":"بورکینافاسو",
  "Cameroon":"کامرون","Canada":"کانادا","Chile":"شیلی","China":"چین","Colombia":"کلمبیا","Congo":"کنگو","Congo DR":"جمهوری دموکراتیک کنگو","Costa Rica":"کاستاریکا","Croatia":"کرواسی","Curaçao":"کوراسائو","Cyprus":"قبرس","Czech Republic":"جمهوری چک","Czechia":"جمهوری چک",
  "Denmark":"دانمارک","Ecuador":"اکوادور","Egypt":"مصر","England":"انگلیس","Estonia":"استونی","Faroe Islands":"جزایر فارو","Finland":"فنلاند","France":"فرانسه","Georgia":"گرجستان","Germany":"آلمان","Ghana":"غنا","Gibraltar":"جبل‌الطارق","Greece":"یونان","Guinea":"گینه",
  "Hungary":"مجارستان","Iceland":"ایسلند","India":"هند","Indonesia":"اندونزی","Iran":"ایران","Iraq":"عراق","Israel":"اسرائیل","Italy":"ایتالیا","Ivory Coast":"ساحل عاج","Japan":"ژاپن","Jordan":"اردن","Kazakhstan":"قزاقستان","Kosovo":"کوزوو","Kuwait":"کویت","Kyrgyzstan":"قرقیزستان",
  "Latvia":"لتونی","Lebanon":"لبنان","Libya":"لیبی","Liechtenstein":"لیختن‌اشتاین","Lithuania":"لیتوانی","Luxembourg":"لوکزامبورگ","Malta":"مالت","Mexico":"مکزیک","Moldova":"مولداوی","Montenegro":"مونته‌نگرو","Morocco":"مراکش",
  "Netherlands":"هلند","New Zealand":"نیوزیلند","Nigeria":"نیجریه","North Macedonia":"مقدونیه شمالی","Northern Ireland":"ایرلند شمالی","Norway":"نروژ","Oman":"عمان","Palestine":"فلسطین","Panama":"پاناما","Paraguay":"پاراگوئه","Peru":"پرو","Poland":"لهستان","Portugal":"پرتغال",
  "Qatar":"قطر","Republic of Ireland":"جمهوری ایرلند","Romania":"رومانی","Russia":"روسیه","San Marino":"سان‌مارینو","Saudi Arabia":"عربستان سعودی","Scotland":"اسکاتلند","Senegal":"سنگال","Serbia":"صربستان","Slovakia":"اسلواکی","Slovenia":"اسلوونی","South Africa":"آفریقای جنوبی","South Korea":"کره جنوبی","Spain":"اسپانیا","Sweden":"سوئد","Switzerland":"سوئیس","Syria":"سوریه",
  "Tajikistan":"تاجیکستان","Tunisia":"تونس","Turkey":"ترکیه","Türkiye":"ترکیه","Turkmenistan":"ترکمنستان","Ukraine":"اوکراین","United Arab Emirates":"امارات متحده عربی","United States":"آمریکا","Uruguay":"اروگوئه","Uzbekistan":"ازبکستان","Venezuela":"ونزوئلا","Wales":"ولز","Yemen":"یمن"
};

// Spelling in this layer follows the form most commonly used by Iranian
// football desks.  It deliberately wins over literal Wikidata translations
// and machine transliteration.
const editorialPlayerNames = {
  "abdukodir khusanov":"عبدالقادر خوسانوف",
  "abdelhamid ait boudlal":"عبدالحمید آیت بودلال",
  "adam hlozek":"آدام هلوزک",
  "ademola lookman":"آدمولا لوکمن",
  "alejandro grimaldo":"آلخاندرو گریمالدو",
  "aaron wan-bissaka":"آرون ون‌بیساکا",
  "arda guler":"آردا گولر",
  "benjamin sesko":"بنجامین ششکو",
  "brian brobbey":"برایان بروبی",
  "bruno fernandes":"برونو فرناندز",
  "cesar palacios":"سزار پالاسیوس",
  "dan ndoye":"دن اندویه",
  "dominik szoboszlai":"دومینیک سوبوسلای",
  "enzo le fee":"انزو لو فی",
  "jay dasilva":"جی داسیلوا",
  "joao pedro":"ژوائو پدرو",
  "joe willock":"جو ویلوک",
  "josh king":"جاش کینگ",
  "josko gvardiol":"یوشکو گواردیول",
  "kai havertz":"کای هاورتز",
  "khvicha kvaratskhelia":"خویچا کواراتسخلیا",
  "liam delap":"لیام دلاپ",
  "malick yalcouye":"مالیک یالکویه",
  "mohamed belloumi":"محمد بلومی",
  "noah okafor":"نوآ اوکافور",
  "rayan cherki":"رایان شرکی",
  "tyrick mitchell":"تایریک میچل",
  "victor munoz":"ویکتور مونیوز"
};

const normalizeKey = (value) => String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("ß", "ss").replaceAll("ø", "o").replaceAll("Ø", "O").replaceAll("æ", "ae").replaceAll("Æ", "Ae").replaceAll("œ", "oe").replaceAll("Œ", "Oe").replaceAll("ł", "l").replaceAll("Ł", "L").replaceAll("ð", "d").replaceAll("Ð", "D").replaceAll("þ", "th").replaceAll("Þ", "Th").toLowerCase().replace(/[.’']/g, "").replace(/\s+/g, " ").trim();
const cleanReferenceLabel = (value) => String(value || "").replace(/\s*[\(（][^\)）]*[\)）]\s*$/, "").trim();
const partVotes = new Map();
for (const [english, persian] of Object.entries(playerMap)) {
  const latin = normalizeKey(english).split(/\s+/), fa = String(persian).trim().split(/\s+/);
  if (latin.length !== fa.length) continue;
  latin.forEach((part, index) => {
    if (!partVotes.has(part)) partVotes.set(part, new Map());
    const votes = partVotes.get(part), value = fa[index];
    votes.set(value, (votes.get(value) || 0) + 1);
  });
}
const partDictionary = Object.fromEntries([...partVotes].map(([part, votes]) => [part, [...votes].sort((a, b) => b[1] - a[1])[0][0]]));
const phoneticPart = (input) => {
  let value = normalizeKey(input);
  if (!value) return "";
  if (partDictionary[value]) return partDictionary[value];
  if (value.includes("-")) return value.split("-").map(phoneticPart).join("‌");
  const starts = [["aa","آ"],["ae","ای"],["ai","آی"],["ay","ای"],["au","او"],["ea","ای"],["ee","ای"],["ei","ای"],["eu","او"],["ie","ای"],["io","ایو"],["oa","او"],["oe","او"],["oi","اوی"],["oo","او"],["ou","او"],["a","آ"],["e","ا"],["i","ای"],["o","او"],["u","او"]];
  for (const [from, to] of starts) if (value.startsWith(from)) { value = to + value.slice(from.length); break; }
  const pairs = [["tch","چ"],["tsch","چ"],["sch","ش"],["dge","ج"],["sh","ش"],["ch","چ"],["kh","خ"],["gh","غ"],["ph","ف"],["th","ت"],["zh","ژ"],["qu","کو"],["ck","ک"],["ll","ل"],["rr","ر"],["ss","س"],["tt","ت"],["pp","پ"],["nn","ن"],["mm","م"],["bb","ب"],["dd","د"],["ff","ف"],["gg","گ"],["ea","ی"],["ee","ی"],["ie","ی"],["ei","ای"],["ai","ای"],["ay","ای"],["ey","ی"],["oo","و"],["ou","و"],["au","او"],["ow","او"]];
  for (const [from, to] of pairs) value = value.replaceAll(from, to);
  value = value.replace(/c(?=[ei])/g, "س").replace(/g(?=[ei])/g, "ج");
  const letters = {a:"ا",b:"ب",c:"ک",d:"د",e:"",f:"ف",g:"گ",h:"ه",i:"ی",j:"ژ",k:"ک",l:"ل",m:"م",n:"ن",o:"و",p:"پ",q:"ق",r:"ر",s:"س",t:"ت",u:"و",v:"و",w:"و",x:"کس",y:"ی",z:"ز"};
  return [...value].map((letter) => letters[letter] ?? letter).join("").replace(/اا+/g, "ا").replace(/وو+/g, "و").replace(/یی+/g, "ی");
};
const generatedPlayers = Object.fromEntries(playerNames.map((english) => {
  const key = normalizeKey(english), direct = Object.entries(playerMap).find(([source]) => normalizeKey(source) === key)?.[1];
  return [key, cleanReferenceLabel(direct) || key.split(/\s+/).map(phoneticPart).join(" ")];
}));
const normalizedPlayers = { ...generatedPlayers, ...editorialPlayerNames };
const normalizedTeams = Object.fromEntries(Object.entries({ ...teamMap, ...nationalTeamMap }).map(([english, persian]) => [normalizeKey(english), persian]));

const output = `window.NIMKAT_PLAYER_NAMES_FA=${JSON.stringify(normalizedPlayers)};\nwindow.NIMKAT_TEAM_NAMES_FA=${JSON.stringify(normalizedTeams)};\nwindow.NIMKAT_PERSIAN_NAMES_META=${JSON.stringify({ generatedAt: new Date().toISOString(), totalPlayers: playerNames.length, referenceLabels: Object.keys(playerMap).length, generatedLabels: playerNames.length - Object.keys(playerMap).length, totalTeams: Object.keys(normalizedTeams).length, source: "Wikidata Persian/Arabic labels with Nimkat editorial normalization and phonetic fallback" })};\n`;
await fs.writeFile(new URL("../dist/data/persian-names.js", import.meta.url), output);
await fs.writeFile(new URL("../dist/data/persian-names.json", import.meta.url), JSON.stringify({ players: normalizedPlayers, teams: normalizedTeams }));
console.log(`\nWrote ${Object.keys(normalizedPlayers).length} player labels (${Object.keys(playerMap).length} references) and ${Object.keys(normalizedTeams).length} team labels.`);
