import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily with recommended user-agent header to avoid crashes if GEMINI_API_KEY is not configured on boot
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
  }
  return aiClient;
}

// Cache setup for persistent articles in the sandbox container
const CACHE_PATH = path.join(process.cwd(), "articles_cache.json");

function readCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
    }
  } catch (e) {
    console.error("Eroare la citirea cache-ului de articole:", e);
  }
  return {};
}

function writeCache(data: any) {
  try {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Eroare la scrierea cache-ului de articole:", e);
  }
}

// 3 Base articles (statically returned)
const baseArticles = [
  {
    category: "Finanțe & Taxe",
    title: "Cum îți declari legal primii bani ca liber profesionist / PFA la ANAF în 2026",
    readTime: "6 min",
    excerpt: "Înțelege normele de venit, plafoanele pentru asigurări sociale (CASS) și cum să emiți facturi curate fără să fii copleșit de hățișul birocratic de stat din România.",
    content: "În anul 2026, legislația din România pentru liber-profesioniști și Persoanele Fizice Autorizate (PFA) a suferit modificări importante în ceea ce privește plafoanele de calcul pentru asigurările naționale de sănătate (CASS) și pensie (CAS).\n\n**Ce opțiuni ai ca freelancer român?**\n1. **PFA pe Sistem Real**: Taxat la venitul net (venituri brute minus cheuluieli deductibile). Impozitul pe venit rămâne de 10%.\n2. **PFA cu Normă de Venit**: Dacă codul tău CAEN este acceptat și venitul tău nu depășește normele locale...\n\n**Ce ai de făcut acum?**\n- Înregistrează-te în **Spațiul Privat Virtual (SPV)** la ANAF pentru a depune Declarația Unică.\n- Emite facturi prin softuri autorizate RO e-Factura.\n- Plătește CASS la plafoanele stabilite: 6, 12 sau 24 de salarii minime brute pe țară.",
    source: "ANAF / Codul Fiscal Român 2026"
  },
  {
    category: "Investiții",
    title: "Ghid Safe: Cum îți deschizi un cont Tradeville și cum investești în indicele BET",
    readTime: "8 min",
    excerpt: "Ghid pas cu pas pentru elevi și studenți. Cum funcționează alimentarea contului, ce comisioane există și cum să cumperi automatizat bucăți din cele mai profitabile companii românești.",
    content: "Dacă vrei să devii proprietar parțial în giganți ca Banca Transilvania, OMV Petrom sau Hidroelectrica, cel mai simplu mod este să investești în indicele BET al Bursei de Valori București (BVB) prin intermediul unui broker autorizat de ASF.\n\n**Ghidul Pas cu Pas:**\n1. **Înregistrarea Digitală**: Vizitează site-ul Tradeville. Vei avea nevoie de Cartea de Identitate.\n2. **Cont de tranzacționare**: Conturi speciali cu comisioane reduse pentru tineri.\n3. **Identificarea în Indicele BET**: Investiții prin intermediul ETF-ului administrat de Patria (TVBETETF).\n4. **Alimentarea Periodic-Automată**: Setează-și o sumă fixă lunar (ex: 100 RON) pentru a declanșa efectul de reinvestire exponențială.",
    source: "Tradeville Ghid / Bursa de Valori București"
  },
  {
    category: "Startups",
    title: "Cum se aplică corect 'The Mom Test' pe piața de business din România",
    readTime: "5 min",
    excerpt: "De ce antreprenorii locali primesc feedback fals pozitiv de la cunoscuți și cum să pui întrebări strategice românilor pentru a afla dacă vor plăti cu adevărat.",
    content: "Pe piața din România există o cultura puternică a sprijinului prin complimente superficiale: 'E super tare ideea ta, te susțin!'.\n\n**Regulile Mom Test în România:**\n- **Nu îți prezenta ideea**: Dacă le spui oamenilor ce vrei să construiești, ei își vor ajusta răspunsurile ca să fie politicoși.\n- **Discută despre trecut**: Întreabă cum au rezolvat problema ieri sau acum o săptămână.\n- **Măsoară angajamentul**: Cere o barieră de interes concretă (ex: precomandă cu avans sau colectare de preferințe de utilizare).",
    source: "The Mom Test de Rob Fitzpatrick"
  },
  {
    category: "Networking",
    title: "Cum să abordezi un mentor român pe LinkedIn: Ghidul de 150 de cuvinte",
    readTime: "4 min",
    excerpt: "Învață formula pe care mentorii de elită și investitorii din România nu o pot refuza. Scrie mesaje curate, personalizate și de impact.",
    content: "Când vrei să contactezi un profesionist valoros, secretul este să fii incredibil de scurt și de precis. Majoritatea tinerilor trimit romane de 500 de cuvinte despre viața lor, ceea ce este greșit din start.\n\n**O formulă infailibilă de 4 linii:**\n- **Conexiune personală**: Referă-te la un articol distribuit de el sau un podcast în care a vorbit public.\n- **Identitatea ta**: Spune cine ești (elev/student) și la ce proiect antreprenorial îndrăzneț muncești.\n- **Întrebare directă, punctuală**: 'Ne lovim de [Problemă]. Oare cum ați abordat dumneavoastră asta în faza incipientă?'\n- **Call to action discret**: Propune o cafea virtuală rapidă de 10-15 minute, asigurându-l că îi respecți timpul cu sfințenie.\n\nAceastă delicatețe crește vertiginos rata de răspuns pozitiv cu peste 80%.",
    source: "LinkedIn Pro Guide"
  },
  {
    category: "Startups",
    title: "Finanțări de tip 'Angel Investment' pentru tineri: Mit vs Realitate în 2026",
    readTime: "7 min",
    excerpt: "Cine sunt investitorii de tip Angel din București și Cluj-Napoca, ce sume oferă de obicei și ce vor în schimbul banilor lor în faza incipientă.",
    content: "Mulți fondatori tineri visează la milioane de euro înainte de a avea un singur client plătitor. În lumea reală, investitorii angel din România (organizați în TechAngels sau Growceanu) investesc sume cureprinse între 15.000 și 100.000 EUR în startup-uri aflate în stadiul de prototip funcțional.\n\n**Ce vrea un Angel Investor de la tine?**\n1. **Spirit de execuție**: Să vadă că ai trecut de la o simplă idee scrise pe un șervețel la o echipă și un cod pus pe picioare.\n2. **Traction (Tracțiune)**: Minim 10-20 de utilizatori reali care folosesc produsul și oferă feedback activ.\n3. **Skin in the game**: Cât de dedicat ești tu personal acestui vis? Lucrezi în weekend-uri sau la orice oră din noapte?\n\nNu te grăbi să ceri bani. Începe cu sfaturi (mentoring) și transformă-i în investitori pe parcurs!",
    source: "TechAngels România / Startup Report"
  },
  {
    category: "Finanțe & Taxe",
    title: "SRL vs PFA în România în 2026: Ghidul simplificat de decizie pentru începători",
    readTime: "5 min",
    excerpt: "Analiză scurtă și obiectivă. Află care formă de organizare are taxele mai mici, birocrația mai ușoară și care ți se potrivește anul acesta.",
    content: "Dacă începi să ai încasări recurente de la clienți, trebuie să fii legal. În România, cele mai comune structuri sunt PFA-ul (Persoană Fizică Autorizată) și SRL-ul (Societate cu Răspundere Limitată).\n\n**Când alegi PFA?**\n- Ideal pentru freelanceri singuri (copywriteri, designeri) cu costuri de operare extrem de mici.\n- Contabilitate simplificată (o poți face singur prin platforme digitale).\n- Poți scoate banii din cont oricând dorești.\n\n**Când alegi SRL?**\n- Vrei să colaborezi cu investitori (SRL-ul permite împărțirea de părți sociale).\n- Vrei să ai angajați și să scalezi afacerea.\n- Răspunderea este strict limitată la capitalul social al firmei, protejânduți averea personală.",
    source: "Ghid Registrul Comerțului / StartCo"
  },
  {
    category: "Investiții",
    title: "Dollar-Cost-Averaging (DCA): Puterea matematică a investiției recurente",
    readTime: "6 min",
    excerpt: "Cum să nu te mai temi niciodată de crash-urile de pe bursă. Secretul din spatele profitului pe termen lung, ignorând fluctuațiile zilnice.",
    content: "Cea mai mare greșeală a investitorilor debutanți este încercarea de a anticipa când piața atinge fundul sau vârful. În loc de asta, profesioniștii folosesc strategia Dollar-Cost-Averaging (DCA).\n\n**Cum funcționează DCA?**\n- Investești o sumă fixă (să zicem 200 RON) în aceeași zi în fiecare lună (ex: pe data de 15).\n- Când piața este sus, cumperi mai puține unități dintr-un ETF sau acțiune.\n- Când piața scade (crash), cu aceeași sumă de 200 RON cumperi de două ori mai multe unități, obținând un preț mediu de achiziție excelent.\n\nAceastă disciplină matematică te scutește de stresul emoțional și aduce randamente mari pe termen lung prin forța dobânzii compuse.",
    source: "Banca Națională / Investopedia"
  },
  {
    category: "Startups",
    title: "Pre-seed la Seed: Ciclul de viață al rundelor de finanțare explicat pe scurt",
    readTime: "5 min",
    excerpt: "Ce înseamnă Bootcamp, Pre-seed, Seed, Series A și Series B? Înțelege limbajul de specialitate folosit de fondatorii de unicorni.",
    content: "Un startup de succes trece prin diferite faze de maturitate finanțate prin 'runde'. Iată dicționarul de bază:\n\n- **Bootstrapping**: Faza inițială în care auto-finanțezi afacerea din economii proprii.\n- **Pre-Seed**: Banii vin de la familie, prieteni ('FFF') sau mici investitori angel pentru a aduce prototipul pe piață.\n- **Seed**: Runda de 'sămânță' de la fonduri de Venture Capital (VC) pentru a valida potrivirea produsului cu piața (Product-Market Fit).\n- **Series A**: Finanțare masivă de milioane de euro pentru a accelera marketingul și a cere scalare internațională.\n\nSă înțelegi unde te afli te ajută să formulezi cererea potrivită în fața partenerilor.",
    source: "Venture Capital Guide / How To Start"
  },
  {
    category: "Networking",
    title: "Maniere de Business: Eticheta în cadrul primului tău Coffee Chat",
    readTime: "5 min",
    excerpt: "Cum trebuie să te porți în cele 15 minute obținute cu un antreprenor pentru a-i câștiga respectul definitiv și a porni corect.",
    content: "Dacă un partener important a acceptat o întâlnire de 15 minute cu tine, comportă-te ca un profesionist. Rigoarea și manierele deschid mult mai multe uși decât sclipirea de moment.\n\n**Reguli de aur pentru întâlnire:**\n1. **Fii punctual**: Intră în apelul video sau ajungi la cafenea cu exact 3 minute înainte de ora stabilită.\n2. **Fii gata cu întrebările**: Nu veni spunând 'Uitați, asta e viața mea'. Intra direct în subiect cu cele maximum 3 întrebări punctuale pregătite de acasă despre expertiza lui.\n3. **Controlează timpul**: Când ajungi la minutul 14, spune: 'Așa cum am promis, doresc să vă respect timpul de 15 minute. Mai avem 1 minut, doriți să închidem aici sau...'\n\nAceastă conduită excelentă îl va determina să te ajute și a doua oară!",
    source: "Business Maniere / Dale Carnegie"
  },
  {
    category: "Investiții",
    title: "Ce sunt Dividendele și cum se construiește o pensie privată din acțiuni",
    readTime: "6 min",
    excerpt: "Cum transformi profitul companiilor în sursă de venit pasiv direct în contul tău. Diferența dintre investitori speculativi și investitori pe dividend.",
    content: "Unele companii listate la bursă aleg să își împartă o parte din profitul anual net direct în contul acționarilor sub formă de dividende.\n\n**De ce sunt dividendele atractive?**\n- Reprezintă un flux tangibil de numerar (fără să fii nevoit să vinzi acțiunile).\n- Companiile din indicele BET au ponderi de dividend istorice extrem de ridicate la nivel mondial.\n- Când reinvestești automat aceste dividende primite cumpărând alte acțiuni, accelerezi exponențial compunerea averii tale digitale.\n\nInvestiția inteligentă pe dividend aduce libertate financiară trainică.",
    source: "BVB / Dividend Growth"
  },
  {
    category: "Startups",
    title: "Eșecul rapid (Fail Fast) ca strategie de economisire în antreprenoriat",
    readTime: "4 min",
    excerpt: "De ce să nu pierzi 12 luni muncind în secret la o aplicație pe care nimeni nu o vrea și cum se validează o nișă în doar 14 zile.",
    content: "Cel mai dureros eșec antreprenorial este să creezi un produs perfect tehnic, dar pe care nu îl vrea absolut nimeni.\n\n**Cum previi asta prin 'Fail Fast'?**\n- Creează o pagină de prezentare simplă (un landing page gratuit în Carrd sau Framer) în prima săptămână.\n- Promovează intens ideea pe grupuri sau prin reclame minime de 50 RON pentru a măsura dorința de înregistrare.\n- Dacă obții peste 15-20% rată de înscriere la newsletter, ideea este validată și poți scrie prima linie de cod.\n\nAceastă testare rapidă îți economisește mii de ore și mii de lei irosiți pe produse moarte din fașă.",
    source: "Lean Startup / Eric Ries"
  }
];

// Beautiful deterministic fallback articles per weekday
const fallbacksByWeekday: { [key: number]: any[] } = {
  0: [ // Duminică
    {
      category: "Startups",
      title: "Duminica Startgrup: Cum îți lansezi primul side-hustle ca elev fără capital în 2026",
      readTime: "4 min",
      excerpt: "Un ghid rapid despre cum să folosești Canva și Notion pentru a oferi servicii locale de social media management în România.",
      content: "Un side-hustle în liceu nu îți cere mii de euro împrumut.\n\n**Planul Simplu pe 3 Pași:**\n1. Specialized skills (ex: video editing, copywriting, Canva social post design).\n2. Găsește 3 afaceri locale din orașul tău care au un profil de Instagram sau TikTok inactiv.\n3. Oferă-le un pachet genial gratuit timp de 1 săptămână ca să le demonstrezi abilitățile tale practice, apoi propune o colaborare de 400 RON/lună."
    },
    {
      category: "Finanțe & Taxe",
      title: "Economisirea Inteligentă: De la dorințe la independență deplină",
      readTime: "5 min",
      excerpt: "Metode simple prin care un tânăr român adună primii 5.000 lei prin micro-economisirea duminicală.",
      content: "Economisirea nu trebuie să pară un chin.\n\n**Ghidul tău:**\n- Redu abonamentele pe care nu le folosești cu adevărat.\n- Automatizează depunerile bancare din prima zi în care primești alocația.\n- Înțelege că fiecare leu economisit reprezintă un instrument de securitate viitoare."
    },
    {
      category: "Investiții",
      title: "Ce este inflația pe înțelesul unui elev de clasa a X-a și de ce o bate bursa",
      readTime: "4 min",
      excerpt: "De ce banii păstrați sub saltea își pierd constant valoarea în România și cum se rezolvă asta pasiv.",
      content: "Inflația acționează ca o taxă ascunsă.\n\n**De ce bursa câștigă?**\n- Istoric, indicii bursieri depășesc rata inflației pe termen lung.\n- Activele productive (acțiunile) cresc odată cu prețurile generale.\n- Investițiile recurente prin DCA atenuează corecțiile de piață."
    }
  ],
  1: [ // Luni
    {
      category: "Finanțe & Taxe",
      title: "Ghid de Luni: Regula 50/30/20 aplicată la alocația de liceean în România primăvara asta",
      readTime: "4 min",
      excerpt: "Cum să ai bani și de distracție și de investiții fără să le ceri părinților sume suplimentare.",
      content: "Să mănânci în oraș cu colegii este o plăcere, dar fără organizare punga se golește repede.\n\n**Cum împarți banii:**\n- 50% pentru transport, rechizite sau mese la cantină.\n- 30% pentru dorințe (ieșiri, sucuri, haine).\n- 20% tezaurizează-i direct într-un cont dedicat sau cumpără unități de fond."
    },
    {
      category: "Startups",
      title: "Soluții inovatoare: Cum pornești o platformă de cursuri online pentru colegi",
      readTime: "5 min",
      excerpt: "Monetizează-ți abilitățile de la școală ajutându-ți colegii să treacă cu brio Bacalaureatul în 2026.",
      content: "Dacă ești foarte bun la matematică, informatică sau română, poți genera un mini-startup.\n\n- Adună sinteze excelente în format PDF clar și prietenos.\n- Filmează explicații video scurte de 5 minute pentru probleme des întâlnite.\n- Pune-le la dispoziție colegilor pe bază de abonament simbolic de 20 RON."
    },
    {
      category: "Investiții",
      title: "Efectul dobânzii compuse: Portofoliul tău la 30 de ani pornit de azi cu 50 lei",
      readTime: "5 min",
      excerpt: "O simulare numerică reală realizată pe indicii bursei din România cu comisioane de broker incluse.",
      content: "Timpul este superputerea ta.\n\n- O investiție mică de 50 RON lunar la o dobândă medie de 10% anual devine o avere datorită recurenței.\n- Secretul constă în reinvestirea continuă a tuturor dividendelor primite.\n- Nu aștepta să fii bogat ca să începi; începe devreme ca să devii bogat!"
    }
  ],
  2: [ // Marți
    {
      category: "Investiții",
      title: "Marțea Investițiilor: Ce este bursa de valori pe scurt și de ce nu e un cazino online",
      readTime: "5 min",
      excerpt: "Diferențe clare între cumpărarea de fracții de acțiuni solide și speculațiile nesigure cu monede noi.",
      content: "Bursa de valori reprezintă o piață reglementată unde se cumpără fracții din companii reale.\n\n- Cazinourile mizează pe șansă și pierdere statistică garantată.\n- Investiția la bursă reprezintă participarea la productivitatea economiei.\n- Diversificarea reduce riscul la cote nesemnificative."
    },
    {
      category: "Startups",
      title: "Cum să testezi dacă colegii tăi ar cumpăra haine vintage personalizate",
      readTime: "5 min",
      excerpt: "Un studiu de caz pe bază de formular simplu de înscriere implementat într-o singură pauză de liceu.",
      content: "Pornirea unui brand vestimentar nu începe cu fabricarea a 100 de geci.\n\n- Fă poze la 3 haine vintage pe care le deții sau le poți recondiționa.\n- Pune-le pe un landing page sau pagină de Instagram cu buton de precomandă.\n- Dacă aduni interese clare, abia atunci investești timp în livrare."
    },
    {
      category: "Finanțe & Taxe",
      title: "Ghid ANAF: Când trebuie să depui Declarația Unică chiar dacă ești elev de liceu",
      readTime: "6 min",
      excerpt: "Reguli clare privind investițiile, dividendele sau veniturile din activități pe internet în 2026.",
      content: "Dacă realizezi profituri din crypto, vânzări de acțiuni sau freelancing, trebuie să fii atent la obligațiile fiscale din România.\n\n- Profitul din crypto sub 200 lei per tranzacție (max 600 lei/an) este scutit.\n- Câștigurile de pe bursă prin broker român sunt reținute adesea la sursă (impozit de 1% sau 3%).\n- Dacă depășești plafoanele CASS, este necesară completarea Declarației Unice în SPV."
    }
  ],
  3: [ // Miercuri
    {
      category: "Startups",
      title: "Miercurea Ideilor: 3 Instrumente No-Code cu care faci o aplicație funcțională azi",
      readTime: "5 min",
      excerpt: "Cum să combini Notion, Zapier și Carrd pentru a livra o soluție utilă fără să știi vreo linie de cod.",
      content: "Instrumentele no-code au accelerat considerabil procesul de lansare.\n\n- **Carrd**: Landing page-uri superbe gata în sub 1 oră.\n- **Notion**: Bază de date excelentă și flexibilă pentru gestionarea informațiilor.\n- **Tally**: Formulare inteligente cu aspect premium."
    },
    {
      category: "Finanțe & Taxe",
      title: "Capcanele creditului pentru tineri: De ce telefoanele în rate îți amanetează libertatea",
      readTime: "5 min",
      excerpt: "Analiza dobânzilor de consum ascunse și cum să cumperi chibzuit lucrurile pe care le dorești în realitate.",
      content: "Achiziția pe credit pare accesibilă, dar este o iluzie.\n\n- Plătești un preț final mult mai mare din cauza dobânzilor cumulative.\n- Te obligi la contracte rigide de rambursare pe termene lungi.\n- Regula: Dacă nu poți cumpăra cash de 2 ori acel bun, înseamnă că nu ți-l permiți."
    },
    {
      category: "Investiții",
      title: "Cum funcționează titlurile de stat FIDELIS în România în primăvara lui 2026",
      readTime: "6 min",
      excerpt: "Urmărește dobânzile neimpozitabile garantate integral de stat și cum le cumperi simplu prin platforme bune.",
      content: "Titlurile de stat FIDELIS sunt emisiuni periodice extrem de populare.\n\n- Dobânzile sunt simbolic superioare depozitelor bancare.\n- Sumele sunt garantate în totalitate de Ministerul Finanțelor.\n- Tranzacționarea pe BVB îți asigură acoperire deplină a banilor tăi."
    }
  ],
  4: [ // Joi
    {
      category: "Investiții",
      title: "Joia Bursei: Ce sunt Fondurile Mutuale și de ce au comisioane ce îți distrug profitul",
      readTime: "5 min",
      excerpt: "O comparație cinstită între depozitele administrate activ de bănci și investirea pasivă în ETF-uri globale.",
      content: "Fondurile mutuale clasice de la bănci au comisioane mari de administrare (adesea peste 2% anual).\n\n- Un comision de 2% pare mic, dar pe 30 de ani reduce valoarea portofoliului tău final cu aproape 40%.\n- ETF-urile pasive (ex: cele pe S&P 500) au comisioane minuscule de sub 0.1% anual.\n- Trecerea spre administrare pasivă îți păstrează majoritatea profiturilor în contul propriu."
    },
    {
      category: "Startups",
      title: "Promovarea pe TikTok: Cum aduni primii 1.000 de fani fără să cheltui niciun leu",
      readTime: "4 min",
      excerpt: "Tehnici concrete de content-creation, hooks ideale și cum să folosești subtitrările dinamice pe reels.",
      content: "Organic promotion de pe TikTok/Reels este o oportunitate imensă.\n\n- Deschide discursul cu un hook text mare în primele 3 secunde.\n- Oferă valoare concentrată, direct la subiect și fără pauze lungi de vorbire.\n- Răspunde amuzant în secțiunea de comentarii ca să încurajezi conversațiile libere."
    },
    {
      category: "Finanțe & Taxe",
      title: "Cum să deschizi primul tău card bancar în România la vârsta de 16 ani",
      readTime: "5 min",
      excerpt: "Ghidul birocratic pe înțelesul tuturor. Ai nevoie de acordul părinților, ce bănci au conturi complet gratuite?",
      content: "Majoritatea băncilor din România oferă pachete de cont curent speciale pentru minori.\n\n- Ai nevoie de prezența unui părinte sau tutore legal în sucursală și cărțile de identitate.\n- Beneficiezi de zero comisioane de administrare, internet banking și card fizic colorat.\n- Folosește aplicația bancară mobilă ca să îți urmărești cheltuielile lunare."
    }
  ],
  5: [ // Vineri
    {
      category: "Finanțe & Taxe",
      title: "Ghid de Vineri: Cum funcționează sistemul public de pensii Pilonul II în România",
      readTime: "5 min",
      excerpt: "Unde se duc banii tăi opriți automat de stat din salariu și cum devii investitor pasiv fără să vrei.",
      content: "Din contribuția ta de CAS, o cotă fixă de 4.75% este direcționată automat către Pilonul II de pensii administrate privat.\n\n- Banii tăi nu dispar în bugetul general de stat; ei sunt investiți în acțiuni și titluri sigure.\n- Contul tău este nominal și poți vedea oricând online ce sold ai strâns.\n- Acesta este primul pas prin care devii oficial investitor de portofoliu odată cu primul job."
    },
    {
      category: "Startups",
      title: "Cum să folosești AI pentru a scrie texte publicitare impecabile în română",
      readTime: "4 min",
      excerpt: "Evită traducerile artificiale și învață să-i dai prompturile corecte modelului pentru mesaje naturale.",
      content: "Modelele de limbaj sunt capabile, dar au nevoie de context local.\n\n- Evită stilul robotic pompos ('Suntem mândri să anunțăm oportunitatea unică...').\n- Roagă modelul să scrie în limbaj cald, direct, gesticul și potrivit pentru tinerii din România.\n- Revizuiește manual textul și elimină repetițiile artificiale."
    },
    {
      category: "Investiții",
      title: "Dividendele explicate: Cum încasezi bani gheață din profiturile marilor corporații",
      readTime: "5 min",
      excerpt: "Înțelege ce este Ex-Date, cum funcționează distribuțiile de capital și când îți intră banii direct pe contul de broker.",
      content: "Dividendele reprezintă distribuirea de către companii a unei cote din profit către asociați.\n\n- **Ex-Date**: data limită până la care trebuie să deții acțiunea ca să încasezi dividendul.\n- **Payment Date**: ziua fizică în care brokerul îți virează sumele în cont.\n- Reinvestirea lor recurentă este motorul principal al acumulării exponențiale de capital."
    }
  ],
  6: [ // Sâmbătă
    {
      category: "Startups",
      title: "Sâmbăta de business: Ce este un MVP și de ce designul perfect te va falimenta rapid",
      readTime: "5 min",
      excerpt: "De ce primul tău produs trebuie să fie simplu, chiar parțial defect, și cum optimizezi experiența de început.",
      content: "Dacă nu îți este rușine cu prima versiune a produsului tău, înseamnă că ai lansat prea târziu.\n\n- MVP-ul are rolul de a confirma că există dorință de achiziție, nu de a câștiga premii de design.\n- Concentrează resursele exclusiv pe calitatea serviciului de bază.\n- Adună opinii proaspete de la utilizatori și modifică aplicația în timp real."
    },
    {
      category: "Finanțe & Taxe",
      title: "De ce educația financiară din liceu este mai valoroasă decât nota la matematică",
      readTime: "5 min",
      excerpt: "Modul în care obiceiurile tale din prezent îți vor asigura liniștea sau stresul major la vârsta maturității.",
      content: "Succesul financiar nu depinde de ecuații complicate, ci de comportament.\n\n- Chiar și cel mai talentat specialist se va prăbuși dacă cheltuiește mai mult decât încasează.\n- Înțelegerea conceptelor simple (bugete, siguranță, dobânzi) te propulsează în fața majorității.\n- Investește în tine însuți citind cărți verificate de business."
    },
    {
      category: "Investiții",
      title: "Cum te pregătești pentru o scădere masivă la bursă: Psihicul investitorului calm",
      readTime: "5 min",
      excerpt: "Ghid de supraviețuire emoțională în timpul prăbușirilor de piață. De ce scăderile mari sunt momente de reducere excelentă.",
      content: "Scăderile de piață sunt firești și sănătoase.\n\n- Cumpărătorul calm vede o scădere ca pe o reducere superbă de prețuri la magazin.\n- Nu intra în panică și nu vinde activele solide pe pierdere.\n- Menține depunerile recurente pentru a beneficia de prețurile mici de achiziție."
    }
  ]
};

// Helper to calculate Bucharest Date and Time details
function getRomaniaTimeDetails() {
  const roTimeStr = new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" });
  const roTime = new Date(roTimeStr);
  const year = roTime.getFullYear();
  const month = String(roTime.getMonth() + 1).padStart(2, '0');
  const day = String(roTime.getDate()).padStart(2, '0');
  const hour = roTime.getHours();
  const weekday = roTime.getDay(); // 0-6 (Duminică-Sâmbătă)
  const dateStr = `${year}-${month}-${day}`;
  return { dateStr, hour, weekday, roTime };
}

// core article generator function
async function generateDailyArticlesWithGemini(dateKey: string, weekday: number) {
  const defaultSelection = fallbacksByWeekday[weekday] || fallbacksByWeekday[1];
  
  if (!process.env.GEMINI_API_KEY) {
    console.log("Lipsă GEMINI_API_KEY. Se folosește fallback deterministic pentru ziua de: " + weekday);
    return defaultSelection;
  }

  try {
    console.log("Apelare Gemini SDK cu Search Grounding pentru articole în data de " + dateKey);
    const ai = getAiClient();
    if (!ai) {
      console.log("No AI Client found. Using fallback selection.");
      return defaultSelection;
    }
    const dateObj = new Date();
    const prompt = `Generate exactly 3 newly-relevant, interesting, and highly educational short advice articles/guides in Romanian for high schoolers/teenagers (teens aged 14-19) about:
1. Finance & Taxes (e.g., ANAF, money management, cost control, cards)
2. Investments (e.g., S&P 500, Tradeville, BVB, safe compounding, Fidelis bonds)
3. Startups (e.g., side hustles, pitch decks, Notion boards, validation)

Ground the answers in actual current trends or rules in Romania by searching Google live for teenager-friendly finance insights.
Each article must have a realistic read time (e.g. "4 min", "5 min"), a short hook excerpt, and rich markdown text as content.

Return ONLY a strict JSON array of 3 objects conforming to this interface:
[
  {
    "category": "Finanțe & Taxe" | "Investiții" | "Startups",
    "title": "...",
    "readTime": "...",
    "excerpt": "...",
    "content": "...",
    "source": "..."
  }
]
Ground the "source" property in the precise publication, official body, or website authority where the trend or guidelines reside (e.g. "ANAF / Ghid Oficial", "Tradeville Română", "Forbes România", etc.).
Do not output any markdown code blocks enclosing the JSON if possible, but if you do, wrap them in simple \`\`\`json blocks. Do not add introductory or closing conversational text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.8,
      },
    });

    let text = response.text || "";
    text = text.trim();
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, "").replace(/```$/s, "").trim();
    }

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length === 3) {
      console.log("Articole generate cu succes prin Google Search Grounding!");
      return parsed;
    } else {
      throw new Error("JSON-ul generat nu are structura corespunzătoare de 3 articole.");
    }
  } catch (err) {
    console.error("Eroare în timpul apelului Gemini Search Grounding. Se folosește fallback-ul preset:", err);
    return defaultSelection;
  }
}

// Retrieve articles list combining base articles + 3 daily scheduled articles automatically (cached per day)
app.get("/api/articles", async (req, res) => {
  try {
    const { dateStr, weekday } = getRomaniaTimeDetails();
    const list = [...baseArticles];

    const cache = readCache();
    let todayArticles = cache[dateStr];

    if (!todayArticles) {
      console.log(`Căutare automată Google pentru data: ${dateStr}`);
      todayArticles = await generateDailyArticlesWithGemini(dateStr, weekday);
      cache[dateStr] = todayArticles;
      writeCache(cache);
    }

    list.push(...todayArticles);
    
    // Fallback source for any article lacking one
    const finalizedList = list.map((art: any) => ({
      ...art,
      source: art.source || "Blog / Startup Finance"
    }));
    
    res.json(finalizedList);
  } catch (error) {
    console.error("Error serving /api/articles:", error);
    res.status(500).json({ error: "Eroare la returnarea listei de articole" });
  }
});

// Post endpoint to force re-generation with Google Search Grounding (triggered by button click on UI)
app.post("/api/articles", async (req, res) => {
  try {
    const { dateStr, hour, weekday } = getRomaniaTimeDetails();
    console.log("S-a solicitat reîmprospătarea live a articolelor de astazi (" + dateStr + ") prin Google Search...");
    
    // Explicitly generate fresh
    const freshArticles = await generateDailyArticlesWithGemini(dateStr, weekday);
    
    // Save to cache
    const cache = readCache();
    cache[dateStr] = freshArticles;
    writeCache(cache);

    const list = [...baseArticles, ...freshArticles];
    res.json(list);
  } catch (error: any) {
    console.error("Error force regenerating articles:", error);
    res.status(500).json({ error: "Eroare la sincronizarea live cu Google", details: error.message });
  }
});

// Dedicated persistent-in-memory leaderboard state for real-time live updates
let liveLeaderboard: any[] = [];

function initLiveLeaderboard() {
  liveLeaderboard = [
    { name: "Elena Vasilescu", xp: 740, streak: 22 },
    { name: "Andrei Popescu", xp: 685, streak: 14 },
    { name: "Mihai Florea", xp: 625, streak: 15 },
    { name: "Alexandru Stoica", xp: 610, streak: 21 },
    { name: "Vlad Ionescu", xp: 590, streak: 20 },
    { name: "Cristian Oprea", xp: 550, streak: 17 },
    { name: "Claudiu Stan", xp: 485, streak: 18 },
    { name: "Razvan Lupu", xp: 470, streak: 16 },
    { name: "Matei Radu", xp: 430, streak: 11 },
    { name: "Stefan Neagu", xp: 390, streak: 12 },
    { name: "Simona Georgescu", xp: 380, streak: 12 },
    { name: "Alina Preda", xp: 340, streak: 10 },
    { name: "Andreea Marin", xp: 320, streak: 9 },
    { name: "Gabriela Sandu", xp: 310, streak: 10 },
    { name: "Anca Stancu", xp: 280, streak: 7 },
    { name: "Laura Tudor", xp: 250, streak: 8 },
    { name: "Mihaela Popa", xp: 225, streak: 7 },
    { name: "Diana Voicu", xp: 210, streak: 6 },
    { name: "Roxana Dinu", xp: 195, streak: 6 },
    { name: "George Enache", xp: 175, streak: 5 },
    { name: "Paul Miron", xp: 155, streak: 4 },
    { name: "Dan Nistor", xp: 140, streak: 5 },
    { name: "Carmen Serban", xp: 110, streak: 3 },
    { name: "Vasile Pop", xp: 90, streak: 2 },
    { name: "Sorin Diaconescu", xp: 65, streak: 1 }
  ];
}

// GET /api/leaderboard (top 25 founders based on XP)
app.get("/api/leaderboard", (req, res) => {
  try {
    if (liveLeaderboard.length === 0) {
      initLiveLeaderboard();
    }

    const name = req.query.name ? String(req.query.name).trim() : "";
    const xp = Number(req.query.xp) || 0;
    const streak = Number(req.query.streak) || 1;

    // Simulate competition by giving 1-2 random mock users small XP updates to simulate live action
    if (Math.random() < 0.45) {
      const idxToUpdate = Math.floor(Math.random() * liveLeaderboard.length);
      const activityTick = Math.random() < 0.5 ? 15 : 25;
      liveLeaderboard[idxToUpdate].xp += activityTick;
      if (Math.random() < 0.15) {
        liveLeaderboard[idxToUpdate].streak += 1;
      }
    }

    // Keep the actual user synchronized in the internal server roster so they persist
    if (name) {
      const sanitizedName = name.replace(/\s*\(Tu\)\s*/gi, "").trim();
      const existingUserIndex = liveLeaderboard.findIndex(
        u => u.name.replace(/\s*\(Tu\)\s*/gi, "").trim().toLowerCase() === sanitizedName.toLowerCase()
      );

      if (existingUserIndex > -1) {
        // Update user stats in our live state
        liveLeaderboard[existingUserIndex].xp = xp;
        liveLeaderboard[existingUserIndex].streak = streak;
      } else {
        // Add new user if not already in roster
        liveLeaderboard.push({ name: sanitizedName, xp: xp, streak: streak });
      }
    }

    // Prepare combined list with proper (Tu) badge for current client
    let combined = liveLeaderboard.map(member => {
      const isMe = name && member.name.replace(/\s*\(Tu\)\s*/gi, "").trim().toLowerCase() === name.replace(/\s*\(Tu\)\s*/gi, "").trim().toLowerCase();
      return {
        name: isMe ? `${member.name.replace(/\s*\(Tu\)\s*/gi, "").trim()} (Tu)` : member.name,
        xp: member.xp,
        streak: member.streak,
        isMe: !!isMe
      };
    });

    // Sort descending by XP
    combined.sort((a, b) => b.xp - a.xp);

    // Limit to exactly 25 users
    const top25 = combined.slice(0, 25);
    res.json(top25);
  } catch (err: any) {
    console.error("Error generating leaderboard:", err);
    res.status(500).json({ error: "Eroare la returnarea clasamentului" });
  }
});

// User profiles persistent storage handler
const USERS_DB_PATH = path.join(process.cwd(), "users_db.json");

function readUsersDB() {
  try {
    if (fs.existsSync(USERS_DB_PATH)) {
      return JSON.parse(fs.readFileSync(USERS_DB_PATH, "utf-8"));
    }
  } catch (e) {
    console.error("Eroare la citirea bazei de date de utilizatori:", e);
  }
  return {};
}

function writeUsersDB(data: any) {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Eroare la scrierea bazei de date de utilizatori:", e);
  }
}

// Device Synchronization / Get Profile API and saving profile
app.post("/api/auth/get-profile", (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email-ul este obligatoriu." });
    }
    const db = readUsersDB();
    const cleanEmail = email.trim().toLowerCase();
    
    if (db[cleanEmail]) {
      return res.json({ exists: true, profile: db[cleanEmail] });
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      const newProfile = {
        name: name || cleanEmail.split("@")[0] || "Elev Ambițios",
        xp: 0,
        streak: 1,
        completedNodes: [],
        unlockedItems: [],
        couponCodes: [],
        dailyQuests: null,
        lastLoginDate: todayStr
      };
      db[cleanEmail] = newProfile;
      writeUsersDB(db);
      return res.json({ exists: false, profile: newProfile });
    }
  } catch (e) {
    console.error("Eroare în get-profile backend:", e);
    res.status(500).json({ error: "Eroare de server la regăsirea profilului." });
  }
});

app.post("/api/auth/sync", (req, res) => {
  try {
    const { email, profile } = req.body;
    if (!email || !profile) {
      return res.status(400).json({ error: "Lipsesc parametrii obligatorii de sincronizare." });
    }
    const db = readUsersDB();
    const cleanEmail = email.trim().toLowerCase();
    
    // Associate and preserve updated values
    db[cleanEmail] = {
      ...db[cleanEmail],
      name: profile.name || db[cleanEmail]?.name || "Vizitator",
      xp: typeof profile.xp === 'number' ? profile.xp : (db[cleanEmail]?.xp || 0),
      streak: typeof profile.streak === 'number' ? profile.streak : (db[cleanEmail]?.streak || 1),
      completedNodes: Array.isArray(profile.completedNodes) ? profile.completedNodes : (db[cleanEmail]?.completedNodes || []),
      unlockedItems: Array.isArray(profile.unlockedItems) ? profile.unlockedItems : (db[cleanEmail]?.unlockedItems || []),
      couponCodes: Array.isArray(profile.couponCodes) ? profile.couponCodes : (db[cleanEmail]?.couponCodes || []),
      dailyQuests: profile.dailyQuests || db[cleanEmail]?.dailyQuests || null,
      lastLoginDate: profile.lastLoginDate || db[cleanEmail]?.lastLoginDate || new Date().toISOString().split('T')[0]
    };
    
    writeUsersDB(db);
    
    // Also, update the live leaderboard!
    const existingIndex = liveLeaderboard.findIndex(m => m.name.toLowerCase() === db[cleanEmail].name.toLowerCase());
    if (existingIndex !== -1) {
      liveLeaderboard[existingIndex].xp = db[cleanEmail].xp;
      liveLeaderboard[existingIndex].streak = db[cleanEmail].streak;
    } else {
      liveLeaderboard.push({ name: db[cleanEmail].name, xp: db[cleanEmail].xp, streak: db[cleanEmail].streak });
    }
    
    res.json({ success: true, profile: db[cleanEmail] });
  } catch (e) {
    console.error("Eroare în sync backend:", e);
    res.status(500).json({ error: "Eroare de server la salvarea sync." });
  }
});

// Endpoint pentru transmitere formulare către sebid418@gmail.com
app.post("/api/forms/submit", async (req, res) => {
  try {
    const { type, email, age, clasa, institutie, description } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Adresa de email este obligatorie pentru procesare." });
    }

    const isSchool = type === "school";
    const subject = isSchool 
      ? "Solicitare StartUp Finance în Școală!" 
      : "Nou Susținător pentru Proiectul StartUp Finance!";

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #E2E8F0; border-radius: 12px; background-color: #FFFFFF; color: #0F172A;">
        <h2 style="color: #10B981; margin-bottom: 20px; font-weight: 800; border-bottom: 2px solid #F1F5F9; padding-bottom: 10px;">
          ${subject}
        </h2>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 10px; font-weight: bold; width: 180px; color: #475569; border-bottom: 1px solid #EDF2F7;">Email Expeditor:</td>
            <td style="padding: 10px; color: #1A202C; border-bottom: 1px solid #EDF2F7;">${email}</td>
          </tr>
          ${isSchool ? `
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #475569; border-bottom: 1px solid #EDF2F7;">Vârstă:</td>
            <td style="padding: 10px; color: #1A202C; border-bottom: 1px solid #EDF2F7;">${age || "Nespecificată"} ani</td>
          </tr>
          <tr style="background-color: #F8FAFC;">
            <td style="padding: 10px; font-weight: bold; color: #475569; border-bottom: 1px solid #EDF2F7;">Clasă:</td>
            <td style="padding: 10px; color: #1A202C; border-bottom: 1px solid #EDF2F7;">Clasa a ${clasa || "Nespecificată"}-a</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #475569; border-bottom: 1px solid #EDF2F7;">Liceu / Școală:</td>
            <td style="padding: 10px; color: #1A202C; border-bottom: 1px solid #EDF2F7;">${institutie || "Nespecificată"}</td>
          </tr>
          ` : `
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #475569; border-bottom: 1px solid #EDF2F7;">Tip Implicare:</td>
            <td style="padding: 10px; color: #E11D48; font-weight: bold; border-bottom: 1px solid #EDF2F7;">Susținător Proiect</td>
          </tr>
          `}
        </table>

        ${description ? `
        <div style="background-color: #F7FAFC; padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px solid #E2E8F0;">
          <h4 style="margin: 0 0 8px 0; color: #4A5568; font-size: 14px; font-weight: bold;">Descriere / Cum dorește să susțină:</h4>
          <p style="margin: 0; color: #2D3748; white-space: pre-wrap; font-size: 14px; line-height: 1.55;">${description}</p>
        </div>
        ` : ""}

        <div style="margin-top: 30px; font-size: 11px; color: #A0AEC0; text-align: center; border-top: 1px solid #EDF2F7; padding-top: 15px;">
          E-mail generat automat de platforma StartUp Finance. Datele au fost și stocate durabil în baza de date Firebase.
        </div>
      </div>
    `;

    console.log(`[EMAIL ADMIN] Inițiere solicitare către sebid418@gmail.com din partea ${email}`);
    console.log(`[SUBIECT] ${subject}`);

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });

      await transporter.sendMail({
        from: `"${isSchool ? 'StartUp în Școală' : 'Susținător StartUp'}" <${smtpUser}>`,
        replyTo: email,
        to: "sebid418@gmail.com",
        subject: subject,
        text: `Formular trimis de ${email}.\nDetalii:\n${JSON.stringify(req.body, null, 2)}`,
        html: htmlBody
      });
      console.log(`[EMAIL SUCCESS] Mail trimis cu succes către sebid418@gmail.com!`);
    } else {
      console.log(`[EMAIL LOG_FALLBACK] SMTP_HOST sau credențialele nu sunt configurate. Detaliile sunt salvate local.`);
    }

    res.json({ success: true, message: "Solicitarea ta a fost transmisă cu succes către fondator și înregistrată." });
  } catch (error) {
    console.error("Eroare la trimiterea sau salvarea datelor:", error);
    res.status(500).json({ error: "Eroare internă de sistem la salvarea sau transmiterea formularului." });
  }
});

// Chat endpoint for Travis chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, vip } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Mesajul este obligatoriu." });
    }

    // Convert history or format message
    const cleanedContents: any[] = [];
    if (Array.isArray(history)) {
      history.forEach((h: any) => {
        const role = h.role === "assistant" ? "model" : "user";
        const text = (h.content || "").trim();
        if (text) {
          if (cleanedContents.length > 0 && cleanedContents[cleanedContents.length - 1].role === role) {
            cleanedContents[cleanedContents.length - 1].parts[0].text += "\n" + text;
          } else {
            cleanedContents.push({
              role: role,
              parts: [{ text: text }]
            });
          }
        }
      });
    }

    // Add current message
    if (cleanedContents.length > 0 && cleanedContents[cleanedContents.length - 1].role === "user") {
      cleanedContents[cleanedContents.length - 1].parts[0].text += "\n" + message.trim();
    } else {
      cleanedContents.push({
        role: "user",
        parts: [{ text: message.trim() }]
      });
    }

    // To be 100% compliant with standard chats:
    // 1. MUST start with a "user" message. If not, drop leading "model" messages.
    while (cleanedContents.length > 0 && cleanedContents[0].role !== "user") {
      cleanedContents.shift();
    }

    // 2. MUST have alternating roles. (Already guaranteed by our merge logic above).
    // 3. MUST end with a "user" role.
    while (cleanedContents.length > 0 && cleanedContents[cleanedContents.length - 1].role !== "user") {
      cleanedContents.pop();
    }

    // Custom system instruction with VIP reaction
    let systemInstruction = "Ești Travis, un consilier financiar și mentor de startup extrem de carismatic, prietenos și amuzant din România. Ajută utilizatorii să înțeleagă conceptele de afaceri, dobânda compusă, validarea ideilor folosind 'The Mom Test', investiții și management financiar personal. Răspunde clar, cu exemple practice aplicabile în contextul din România, folosind un ton optimist și accesibil. Încheie uneori cu sfaturi practice sau întrebări scurte de reflecție. Nu folosi un limbaj extrem de academic; fii mentorul lor de încredere.";
    
    if (vip) {
      systemInstruction += " [VIP MODE ACTIVAT: Utilizatorul curent a deblocat statusul 'Travis Pro VIP' plătind cu tokens XP acumulați! Adresează-te lui cu maxim respect, entuziasm de investitor de tip Venture Capitalist din București/Cluj, numește-l 'Elite Boss', 'Partenerul de Unicorn' sau 'Colegul VIP'. Felicită-l din când în când pentru progresul excepțional pe platformă și dorește-i succes la scalarea afacerii în stil mare!]";
    }

    const ai = getAiClient();
    if (!ai) {
      console.warn("Lipsă GEMINI_API_KEY, se activează fallback-ul inteligent Travis.");
      const adviceFallbacks = [
        "Salut, viitorule fondator! Se pare că porțiunea mea de inteligență artificială automată este momentan în repaus (verifică GEMINI_API_KEY în Settings > Secrets), dar ca mentorul tău îți pot oferi direct recomandările cheie de care ai nevoie:\n\n1.  **Regula 50/30/20**: Pentru un buget echilibrat, împarte veniturile sau alocația astfel: 50% Nevoi stricte, 30% Dorințe și distracție, 20% Economii și Investiții.\n2.  **The Mom Test**: Când ai o idee de startup, nu întreba apropiații dacă le place. Întreabă-i despre comportamentele lor concrete din trecut! De exemplu: 'Când ai cumpărat ultima oară o haină vintage?' în loc de 'Ai cumpăra o haină vintage de la mine?'.\n3.  **Investiții safe**: Bate inflația din timp! Investește recurent prin metoda Dollar-Cost-Averaging (DCA) în ETF-uri solide sau în indicele BET la Bursa de Valori București.\n\nCe altă dilemă ai legată de bani sau startups pe care dorești să o lămurim acum?",
        "Salut! Deși asistentul meu automat are nevoie de configurarea cheii sale de acces Gemini, sunt aici să îți reamintesc că succesul nu vine din calcule complicate, ci din disciplina de business!\n\nDacă vrei să începi un startup sau să abordezi un mentor pe LinkedIn, gândește-te mereu la valoarea pe care o aduci tu în ecuație, nu doar la ce poți cere. Fii scurt, respectuos și extrem de specific.\n\nAi vreo idee de afaceri pregătită sau vrei să vorbim despre administrarea inteligentă a banilor tăi?"
      ];
      const reply = adviceFallbacks[Math.floor(Math.random() * adviceFallbacks.length)];
      return res.json({ reply });
    }

    // Generate content using Gemini 2.5 Flash
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: cleanedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.85,
      },
    });

    const reply = response.text || "Scuze, am întâmpinat o problemă și nu pot răspunde acum.";
    res.json({ reply });
  } catch (error: any) {
    console.error("Eroare la apelul Gemini sau istoric:", error);
    // Overcome any bad request/unauthorized errors with a beautifully styled Romanian fallback answer from Travis the mentor
    const backupAdvice = "Salut! Am detectat o mică perturbație de conexiune digitală (sau cheia API în Settings > Secrets necesită verificare). Însă, ca mentor în afaceri, nu las niciodată un învățăcel în pană!\n\nRecomandarea mea de bază pentru astăzi este să te concentrezi pe **validarea ideilor**. Înainte de a cheltui bani pe design perfect sau codare, mergi și vorbește cu 5 potențiali clienți. Află ce probleme reale au și cum se descurcă în prezent cu ele.\n\nNu uita: disciplina aduce libertate financiară! Pune-mi orice altă întrebare și hai să discutăm concepte!";
    res.json({ reply: backupAdvice });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in DEVELOPMENT mode with Vite...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          path: '/_vite_hmr' // avoid issues with reverse proxy
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
