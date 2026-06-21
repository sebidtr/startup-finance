/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Branch, Article, LearningNode } from './types';

// Original detailed chapters
const baseBranches: { [key: string]: Branch } = {
  how_to_start_first_startup: {
    title: "1. Cum să începi primul tău startup",
    category: "Inițiere și Lansare",
    nodes: [
      {
        id: "h1",
        title: "Găsirea Problemelor Reale",
        type: "Ideation",
        xp: 25,
        desc: "Primul pas în antreprenoriat este să înțelegi că startup-urile de succes nu pornesc de la o idee 'cool', ci de la rezolvarea unei fricțiuni dureroase din viața clienților.",
        theory: {
          intel: "Pentru a începe cu succes primul tău startup, trebuie să cauți activ locurile în care clienții potențiali pierd timp, bani sau manifestă o frustrare intensă.",
          bullets: [
            "Pornește de la probleme pe care le experimentezi personal sau pe care le observi direct în jurul tău.",
            "Validează dacă oamenii încearcă deja să își rezolve problema cu soluții improvizate (foi de calcul, grupuri de Whatsapp).",
            "Fii conștient de 'Capcana Politeții': nu îi întreba pe prieteni dacă le place ideea ta, pentru că te vor minți din simpatie."
          ],
          example: "Uber a pornit de la o fricțiune personală simplă a fondatorilor: imposibilitatea de a găsi un taxi în Paris într-o seară ningândă."
        },
        question: "De unde ar trebui să pornești la drum cu primul tău startup?",
        options: [
          "O idee de produs complet teoretică și inovatoare care nu s-a mai văzut niciodată.",
          "O fricțiune clară, o problemă reală întâmpinată de oameni excitați să plătească pentru o soluție.",
          "Un împrumut masiv de la bancă înainte de a avea vreo idee sau de a cunoaște piața."
        ],
        correct: 1,
        explanation: "O problemă reală pe care oamenii vor să o rezolve este singura bază solidă pentru a asgura o cumpărare reală de la început.",
        questions: [
          {
            question: "Care este cel mai bun semnal că o problemă merită rezolvată printr-un startup?",
            options: [
              "Oamenii folosesc deja soluții improvizate (ex: Excel, grupuri WhatsApp) și se plâng activ de ineficiență.",
              "Câțiva prieteni ți-au spus din curtoazie că ideea ta sună drăguț la o cafea.",
              "Nu mai există nicio altă companie pe planetă care să fie activă în acel domeniu general."
            ],
            correct: 0,
            explanation: "Dacă oamenii cheltuie timp și inventivitate cu soluții improvizate, înseamnă că durerea este reală și există disponibilitate de plată."
          }
        ]
      },
      {
        id: "h2",
        title: "Validarea Ideilor Fără Cod",
        type: "Validation",
        xp: 25,
        desc: "Cum să testezi dacă există interes real pentru soluția ta înainte de a investi timp și bani în dezvoltarea ei software.",
        theory: {
          intel: "Validarea înseamnă colectarea de dovezi concrete (cum ar fi e-mailuri, precomenzi sau apeluri) care să demonstreze că publicul țintă dorește soluția ta.",
          bullets: [
            "Creează un Landing Page simplu în care descrii explicit problema și modul tău unic de rezolvare.",
            "Asigură un apel clar la acțiune (ex: 'Înscrie-te în lista de așteptare' sau 'Precomandă cu 50% reducere').",
            "Măsoară rata de conversie a vizitatorilor: dacă sub 5% dintre vizitatori își lasă datele, probabil propunerea ta nu rezonează."
          ],
          example: "Buffer a fost lansat inițial ca un experiment pe un Landing Page cu 3 planuri de prețuri; abia după ce oamenii au dat click pe butoanele de preț, fondatorul a programat aplicația."
        },
        question: "Care este cel mai eficient mod de a valida o idee de aplicație online înainte de a o construi?",
        options: [
          "Angajarea directă a unei firme de dezvoltare pentru a scrie varianta finală timp de 6 luni.",
          "Crearea unui Landing Page de test pentru a colecta adrese de email / precomenzi de la utilizatori interesați.",
          "Lansarea unei campanii TV scumpe bazată pe o promisiune teoretică."
        ],
        correct: 1,
        explanation: "Un site simplu îți permite să testezi cererea reală a pieței într-o singură zi cu costuri minime."
      },
      {
        id: "h3",
        title: "Ghid de No-Code MVP",
        type: "MVP",
        xp: 25,
        desc: "Cum să asamblezi un prototip funcțional simplu într-un singur weekend, folosind doar platforme gata făcute.",
        theory: {
          intel: "Un MVP (Minimum Viable Product) are un singur scop: să livreze valoarea de bază către clienți cu cel mai mic efort de programare.",
          bullets: [
            "Folosește instrumente no-code ca Notion pentru pagini de conținut sau Typeform ca formular primitiv pentru clienți.",
            "Automatizează operațiunile manual: în loc să programezi roboți complicați, poți trimite personal e-mailurile chiar tu la început (Do Things That Don't Scale).",
            "Fii rapid: un MVP lansat în 3 zile este mult mai valoros decât o schiță perfectă lansată în 3 luni."
          ],
          example: "Zappos a început fără stoc și fără logistice complicate: fondatorul făcea poze la pantofii din magazinele fizice, le urca pe un site simplu."
        },
        question: "Ce reprezintă abordarea corectă în construirea unui MVP?",
        options: [
          "Includerea tuturor opțiunilor posibile din prima zi ca să mulțumești pe toată lumea.",
          "O versiune extrem de simplă care rezolvă doar problema de bază și permite învățarea rapidă din feedback-ul utilizatorilor reali.",
          "Un plan de afaceri secret de 150 de pagini fără niciun feronerie legală."
        ],
        correct: 1,
        explanation: "Un MVP funcțional îți oferă date imediate din modul real în care interacționează consumatorii cu soluția ta preliminară."
      }
    ]
  },
  finance: {
    title: "2. Finanțe",
    category: "Sănătate Financiară",
    nodes: [
      {
        id: "f1",
        title: "Unit Economics & Profitabilitate",
        type: "Gestiune",
        xp: 25,
        desc: "Înțelegerea profundă a modului în care funcționează marjele de profit și cum asiguri sustenabilitatea startup-ului tău.",
        theory: {
          intel: "Unit Economics analizează veniturile și costurile per unitate de produs sau client individual. Un startup moare rapid dacă costul de achiziție al clientului (CAC) depășește valoarea pe viață a acestuia (LTV).",
          bullets: [
            "CAC (Customer Acquisition Cost): Cât te costă publicitatea pentru a aduce exact un client plătitor.",
            "LTV (Lifetime Value): Valoarea totală pe care un client o cheltuie în afacerea ta.",
            "Pentru un startup sănătos, raportul LTV : CAC ar trebui să fie de cel puțin 3x pe termen lung."
          ],
          example: "Dacă cheltuiești 100 RON în reclame ca să vinzi un abonament de 50 RON care durează doar 1 lună, afacerea ta pierde 50 RON la fiecare client."
        },
        question: "Ce reprezintă indicatorul LTV (Lifetime Value)?",
        options: [
          "Timpul mediu petrecut de un vizitator pe blogul tău.",
          "Valoarea financiară totală estimată pe care o generează un client pe parcursul colaborării sale.",
          "Costul legal de înregistrare a unei mărci oficiale."
        ],
        correct: 1,
        explanation: "LTV estimează cifra de afaceri brută pe care un client o lasă în portofoliul tău pe viață."
      },
      {
        id: "f2",
        title: "Dobânda Compusă și Economisirea",
        type: "Compound",
        xp: 25,
        desc: "Cum îți pui propriile economii să lucreze neîncetat pentru tine prin magia recalculării dobânzii la dobândă.",
        theory: {
          intel: "Dobânda compusă (sau 'compounding') apare atunci când dobânda generată de o sumă de bani este reinvestită, generând la rândul ei dobânzi suplimentare.",
          bullets: [
            "Timpul este cel mai de preț avantaj: cu cât începi mai devreme, cu atât efectul de multiplicare devine mai spectaculos.",
            "Regula de Aur: Reinvestește dividendele obținute pentru a înmulți bulgărele.",
            "Evită inflația lăsând banii să se devalorizeze pasiv sub saltea."
          ],
          example: "O sumă de 5.000 lei investită la o dobândă medie de 8% devine aproximativ 10.800 lei în 10 ani, dar explodează la peste 230.000 lei în 50 de ani."
        },
        question: "Care este mecanismul principal prin care funcționează dobânda compusă?",
        options: [
          "Băncile îți acordă un procent suplimentar doar dacă aduci prieteni noi.",
          "Câștigurile generate anterior sunt adăugate la suma inițială, iar noua dobândă se calculează la acest total crescut.",
          "Statul îți dublează automat capitalul strâns."
        ],
        correct: 1,
        explanation: "Dobânda cumulată se transformă în capital generator de noi venituri, creând o curbă de creștere exponențială."
      },
      {
        id: "f3",
        title: "Platforma Bugetului 50/30/20",
        type: "Personal Finance",
        xp: 25,
        desc: "Cum să-ți organizezi veniturile lunare într-un mod simplu, sănătos și fără stres mental.",
        theory: {
          intel: "Metoda 50/30/20 este cel mai popular și instinctiv ghid de planificare bugetară din lume.",
          bullets: [
            "50% se îndreaptă către NEVOI (chirie, utilități, alimente de bază).",
            "30% se alocă pentru DORINȚE (ieșiri în oraș, abonamente divertisment).",
            "20% sunt direcționați către ECONOMII și INVESTIȚII (fond de siguranță, ETF)."
          ],
          example: "La un venit de 4.000 RON: 2.000 RON sunt pentru nevoi, 1.200 RON pentru dorințe și 800 RON pentru economii."
        },
        question: "Conform regulii bugetare 50/30/20, unde ar trebui repartizați 20% din veniturile tale?",
        options: [
          "Pentru haine de modă rapidă și activități sporadice.",
          "Pentru economisire, plata datoriilor și conturi de investiții.",
          "Spre acoperirea chiriei și plata facturilor."
        ],
        correct: 1,
        explanation: "Păstrarea a 20% din venituri pentru viitor îți oferă un tampon de siguranță împotriva urgențelor."
      }
    ]
  },
  economics: {
    title: "3. Economie",
    category: "Piețe & Macro",
    nodes: [
      {
        id: "e1",
        title: "Cerere, Ofertă & Monopol",
        type: "Teorie Economică",
        xp: 25,
        desc: "Bazele economiei de piață. Cum se formează prețurile reale prin echilibrul natural al cererii și al ofertei.",
        theory: {
          intel: "Prețurile bunurilor și serviciilor sunt stabilite de interacțiunea dintre cumpărători (Cerere) și producători (Ofertă).",
          bullets: [
            "Legea Cererii: Când prețul crește, cererea scade în mod natural.",
            "Legea Ofertei: Când prețul crește, producătorii oferă mai mult.",
            "Echilibrul Pieței este prețul la care cantitatea cerută egalează cea oferită."
          ],
          example: "În timpul secetelor recolta de grâu scade (oferta scade) și prețul crește rapid pe piață."
        },
        question: "Ce se întâmplă cu prețul unui serviciu când oferta lui scade dramatic, dar cererea rămâne mare?",
        options: [
          "Prețul scade de urgență pentru a încuraja clienții.",
          "Prețul tinde să crească substanțial din cauza raritativității.",
          "Prețul este blocat direct prin ordin bancar."
        ],
        correct: 1,
        explanation: "Un deficit determină competiție ridicată între cumpărători, ceea ce ridică prețul."
      },
      {
        id: "e2",
        title: "Inflația și Rolul BNR",
        type: "Macroeconomie",
        xp: 25,
        desc: "De ce scad puterile de cumpărare ale monedelor și cum guvernează băncile naționale dobânda de politică monetară.",
        theory: {
          intel: "Inflația reprezintă creșterea generalizată a prețurilor și scăderea puterii de cumpărare. BNR o controlează prin dobânda de referință.",
          bullets: [
            "Când inflația e mare, BNR mărește dobânda de referință.",
            "Dobânzile mari descurajează creditele și consumul excesiv.",
            "Inflația poate fi provocată de tipărirea de bani sau scumpirea materiilor prime globale."
          ],
          example: "La o inflație de 10%, un coș de alimente de 100 de lei va costa 110 lei anul viitor."
        },
        question: "Care este acțiunea tipică a BNR pentru a combate o inflație ridicată?",
        options: [
          "Mărirea dobânzii de referință pentru a scumpi creditele.",
          "Tipărirea de bani suplimentari și împărțirea lor la cetățeni.",
          "Înghețarea prin forță a tuturor prețurilor autohtone."
        ],
        correct: 0,
        explanation: "Dobânzile mai mari încetinesc activitatea economică și calmează consumul, stabilizând prețurile."
      },
      {
        id: "e3",
        title: "Sistemul Rezervei Fracționare",
        type: "Banking",
        xp: 25,
        desc: "Cum creează băncile comerciale bani noi de scriptură prin creditare și cum îți sunt garantate economiile depuse.",
        theory: {
          intel: "Băncile moderne păstrează doar o mică fracțiune din deponeri sub formă de rezerve și împrumută restul în economie.",
          bullets: [
            "Rezerva Minimă Obligatorie este procentul fix stabilit de BNR.",
            "Restul depozitului este multiplicat prin acordarea de credite.",
            "În România, depozitele sunt garantate fiscal până la 100.000 EUR per deponent per bancă de către FGDB."
          ],
          example: "Depui 1.000 lei. La rezervă de 10%, banca păstrează 100 lei și împrumută 900 lei altcuiva."
        },
        question: "Cine îți garantează depozitele în caz de faliment al unei bănci în România?",
        options: [
          "Fondul de Garantare a Depozitelor Bancare (FGDB) în limita a 100.000 EUR.",
          "Asociația primăriilor sau consiliul local județean.",
          "Bursa de Valori București."
        ],
        correct: 0,
        explanation: "FGDB despăgubește automat deponenții conform normelor Uniunii Europene."
      }
    ]
  },
  startup: {
    title: "4. Startup",
    category: "Validare de Piață",
    nodes: [
      {
        id: "s1",
        title: "The Mom Test in Acțiune",
        type: "Validare",
        xp: 25,
        desc: "Cum să discuți cu potențialii clienți fără să-ți dezvălui direct ideea pentru a evita opiniile false sau politețea.",
        theory: {
          intel: "Oamenii tind să te flateze din politețe. Regulile 'The Mom Test' te învață cum să obții adevărul brut.",
          bullets: [
            "Întreabă exclusiv despre acțiuni concrete din trecutul lor.",
            "Ignoră scenariile viitoare ca 'Aș folosi/Aș cumpăra asta cândva'.",
            "Măsoară implicarea lor reală (timp, e-mail de lucru, efort)."
          ],
          example: "În loc de 'Ai cumpăra aplicația asta de fitness?', întreabă: 'De câte ori ai mers la sală luna trecută și ce instrumente ai folosit ca să te organizezi?'"
        },
        question: "Care este o întrebare validă conform stilului 'The Mom Test'?",
        options: [
          "Dacă aș face o unealtă de stocuri, ai plăti 20$ pe lună pentru ea?",
          "Cum anume ai rezolvat blocajele de inventar luna trecută și cât te-a costat asta ca timp?",
          "Crezi că această platformă e bună pentru colegii tăi?"
        ],
        correct: 1,
        explanation: "Faptele trecute sunt sigure. Intențiile viitoare sunt de obicei simple politeți."
      },
      {
        id: "s2",
        title: "Pitch Deck-ul pentru Investitori",
        type: "Funding",
        xp: 25,
        desc: "Cum să-ți expui povestea și cifrele de business într-o prezentare clară de doar 10 slide-uri.",
        theory: {
          intel: "Investitorii sunt foarte ocupați. Prezentarea ta trebuie să fie extrem de structurată și clară.",
          bullets: [
            "Pilonii indispensabili: Problema, Soluția, Piața, Tracțiunea și Echipa.",
            "Nu supraîncărca designul cu blocuri interminabile de text.",
            "Fii explicit în privința sumei solicitate și cum o vei folosi pragmatic."
          ],
          example: "Prezentarea inițială Airbnb a avut doar 10 slide-uri care au atras atenția prin simplitate comercială."
        },
        question: "Ce trebuie să arăți în slide-ul de 'Problemă' dintr-un Pitch Deck?",
        options: [
          "O listă completă de diplome ale echipei.",
          "Dificultatea reală pe care o au clienții tăi și de ce soluțiile de acum eșuează.",
          "Exemple de cod sau desene arhitecturale complicate."
        ],
        correct: 1,
        explanation: "Demonstrarea unei dureri clare în piață este fundamentul care justifică restul soluției tale."
      },
      {
        id: "s3",
        title: "Vestings & Structura Legală",
        type: "Corporate Law",
        xp: 25,
        desc: "Mecanismele juridice prin care protejezi startup-ul de plecarea prematură a unui partener.",
        theory: {
          intel: "Fără reguli juridice, un cofondator poate pleca după o săptămână păstrând 50% din firmă. Vestingul reglementează asta.",
          bullets: [
            "Vestingul reprezintă câștigarea treptată a acțiunilor pe parcursul anilor.",
            "The Cliff (Pragul de 1 an) este o perioadă de probă în care nu deții nimic legal.",
            "SHA (Acordul Acționarilor) definește clar rezolvarea blocajelor interne corporative."
          ],
          example: "Doi asociați împart firma 50-50 cu un vesting pe 4 ani. Dacă unul pleacă după 6 luni, el eliberează toate acțiunile neacumulate înapoi în firmă."
        },
        question: "Care este beneficiul principal al unui mecanism 'Vesting' asumat prin contract?",
        options: [
          "Permite asociaților să evite plata taxelor guvernamentale.",
          "Asigură că doar cei care persistă și lucrează an de an în startup dobândesc acțiuni în firmă.",
          "Garantează profituri imediate la bursă în prima lună."
        ],
        correct: 1,
        explanation: "Vesting-ul aliniază interesele cofondatorilor pe termen lung și previne pierderea de control către oameni inactivi."
      }
    ]
  },
  marketing: {
    title: "5. Marketing",
    category: "Promovare & Scalabilitate",
    nodes: [
      {
        id: "m1",
        title: "Retenție Organică și Tracțiune",
        type: "Growth",
        xp: 25,
        desc: "Ingineria promovării eficiente pe bază de conținut și crearea de mesaje extrem de convingătoare pentru public.",
        theory: {
          intel: "Pe internet, atenția este resursa rară. Ai la dispoziție doar câteva secunde (un hook excelent) să captivezi vizitatorul.",
          bullets: [
            "CLEF: Claritate, Limbaj comun, Eliminarea obiecțiilor, Fricțiune minimă la interfață.",
            "Focalizează-te explict pe dorințele și grijile clienților, nu pe gloria proprie.",
            "Creează un sentiment clar de acțiune imediată (CTA)."
          ],
          example: "Un clip care începe cu 'Greșeala uriașă de buget pe care o fac tinerii la 18 ani' are o rată de vizualizare mult mai mare decât o listă sterilă de cursuri."
        },
        question: "Ce încurajează regula 'Clarității' în comunicarea de marketing (CLEF)?",
        options: [
          "Folosirea de fraze extrem de complicate din romane celebre.",
          "Utilizarea de cuvinte clare și explicarea în max 5 secunde cu ce se ocupă produsul tău.",
          "Omiterea intenționată a prețului ca să obligi clienții să te contacteze telefonic."
        ],
        correct: 1,
        explanation: "Dacă un potențial utilizator nu înțelege instant ce valoare îi aduci, va închide pagina în secunda următoare."
      },
      {
        id: "m2",
        title: "SEO și Vizibilitate pe Google",
        type: "SEO Engine",
        xp: 25,
        desc: "Cum să configurezi un site pentru a aduce clienți calificați în mod automat de pe motoarele de căutare fără reclame.",
        theory: {
          intel: "SEO reprezintă pașii optimi prin care te asiguri că siteul tău apare pe primele poziții în Google când lumea caută informații.",
          bullets: [
            "Search Intent: Înțelege exact ce vrea de fapt să găsească utilizatorul care caută.",
            "Viteza site-ului și structurarea corectă a tagurilor tehnice (H1-H3).",
            "Backlink-uri: Link-uri primite de la alte site-uri de autoritate care acționează ca voturi de calitate."
          ],
          example: "Scrierea unui ghid excelent despre 'cum completezi declarația unică' aduce automat mii de clienți de contabilitate de pe Google."
        },
        question: "Ce reprezintă un 'Backlink' în limbajul SEO industrial?",
        options: [
          "O parolă specială folosită de echipa de asistență tehnică.",
          "Un link de pe un site extern care trimite vizitatorii către siteul tău.",
          "Vânzarea de date personale în mod complet ilegal."
        ],
        correct: 1,
        explanation: "Google măsoară aceste recomandări (link-uri externe) pentru a decide cât de util și credibil este site-ul tău în acea nișă."
      },
      {
        id: "m3",
        title: "Secretele Campaniilor Plătite",
        type: "Paid Traffic",
        xp: 25,
        desc: "Cum să utilizezi bugete mici pe Facebook, Instagram și Google pentru a achiziționa clienți profitabil.",
        theory: {
          intel: "Spre deosebire de organic, traficul plătit aduce rezultate rapide dacă știi să-ți manageriezi corect metricile fundamentale.",
          bullets: [
            "ROAS (Return on Ad Spend): Veniturile aduse împărțite direct la cheltuielile cu reclamele.",
            "CPA (Cost per Acquisition): Cât te costă în total campania pentru a obține o singură vânzare confirmată.",
            "Folosește mereu variante diferite de imagini și texte în paralel (A/B testing) ca să le oprești pe cele ineficiente."
          ],
          example: "Dacă investești 300 RON și din acele click-uri vinzi produse de 900 RON, ai un ROAS excelent de 3x."
        },
        question: "Cum te ajută un 'A/B Test' în managementul reclamelor plătite pe social media?",
        options: [
          "Blochează automat spamul de pe site-urile concurenței.",
          "Rulează versiuni diferite de reclame în paralel ca să vezi experimental care este mai performantă.",
          "Îți returnează banii cheltuiți direct din contul Meta."
        ],
        correct: 1,
        explanation: "Testarea A/B elimină presupunerile și îți permite să investești bugetul exclusiv în varianta iubită de public."
      }
    ]
  },
  investing: {
    title: "6. Investiții",
    category: "Investiții Practice",
    nodes: [
      {
        id: "i1",
        title: "Piețe de Capital și Diversificare",
        type: "Portofoliu",
        xp: 25,
        desc: "Cum să-ți construiești un portofoliu rezistent la crize folosind acțiuni diverse și titluri sigure (cum sunt cele de stat).",
        theory: {
          intel: "Nu îți expune toate economiile într-o singură acțiune sau activ speculativ. Diversificarea corectă reduce fluctuațiile violente ale averii.",
          bullets: [
            "Titluri de stat (Fidelis / Tezaur): Risc extrem de redus, titluri garantate guvernamental complet scutite de taxe de profit.",
            "Acțiuni solide: Ofertă de randamente superioare pe termen lung, dar cu volatilitate ridicată pe termen scurt.",
            "ETF-uri: Achiziția instantanee a sutelor de corporații simultan dintr-o singură tranzacție."
          ],
          example: "Alocarea banilor în titluri de stat pentru siguranță și un ETF global pentru expansiune de capital."
        },
        question: "Care este pilonul principal pe care îl realizează 'diversificarea' în portofoliu?",
        options: [
          "Să cumperi exclusiv de la un singur brand național faimos.",
          "Răspândirea economiilor pe diverse instrumente și clase de active pentru a diminua riscul financiar general.",
          "Deținerea exclusivă de bani fizici depozitați acasă."
        ],
        correct: 1,
        explanation: "Răspândirea inteligentă reduce semnificativ prăbușirea masivă a banilor tăi în cazul eșecului unei companii izolate."
      },
      {
        id: "i2",
        title: "Imobiliare vs REIT-uri pe Bursă",
        type: "Real Estate",
        xp: 25,
        desc: "Cum să obții expunere pe active imobiliare chiar și cu bugete foarte mici, fără credite pe 30 de ani.",
        theory: {
          intel: "O proprietate fizică cere mult credit, chiriași problematici și reparații. REIT-urile (fonduri imobiliare listate) elimină aceste bariere.",
          bullets: [
            "Lichiditate ridicată: Poți cumpăra sau vinde acțiunile în câteva secunde direct din telefon.",
            "Dividende regulate: REIT-urile sunt obligate legal să distribuie majoritatea profitului din chirii către acționari.",
            "Diversificare maximă: Deții simultan cote din depozite industriale, birouri și mall-uri."
          ],
          example: "În loc de 100.000 EUR pentru o garsonieră, investești 500 RON într-un REIT major ca să încasezi dividende recurente."
        },
        question: "De ce sunt REIT-urile considerate extrem de lichide față de imobiliarele clasice?",
        options: [
          "Se dizolvă automat în caz de inundații.",
          "Sunt listate la bursă și pot fi vândute ori cumpărate instantaneu în timpul orelor de tranzacționare.",
          "Sunt scutite de plata oricărui tip de impozit pe proprietate fizică."
        ],
        correct: 1,
        explanation: "O clădire se vinde în luni de zile prin agenții și notari. Acțiunile REIT se vând din aplicația mobilă în 2 secunde la prețul pieței."
      },
      {
        id: "i3",
        title: "Investiții Pasive prin Index ETF",
        type: "Passive Investing",
        xp: 25,
        desc: "Cum să învingi majoritatea managerilor profesioniști apelând la simplitatea indicilor BET și S&P 500.",
        theory: {
          intel: "Majoritatea fondurilor mutuale active eșuează să depășească indicii bursieri. Strategia optimă pentru micii investitori este acumularea pasivă recurentă unora ca S&P 500 sau BET.",
          bullets: [
            "Indicele S&P 500 cuprinde cele mai mari 500 de corporații din SUA (Apple, Nvidia, Microsoft).",
            "Indicele BET urmărește cele mai tranzacționate branduri din România (BT, Petrom, Hidroelectrica).",
            "Metoda DCA (Dollar Cost Averaging): Investești o sumă constantă lunar fără să încerci să ghicești speculativ piața."
          ],
          example: "Un elev economisește 200 lei pe lună și îi trimite automat într-un ETF ce copiază indicele BET, strângând capital exponențial."
        },
        question: "Ce presupune strategia DCA (Dollar Cost Averaging)?",
        options: [
          "Verificarea cursurilor valutare de zeci de ori pe zi pentru a cumpăra dolari.",
          "Investirea sistematică a unei sume fixe la intervale de timp regulate, minimizând emoțiile și prețurile volatile.",
          "Schimbarea completă a portofoliului de fiecare dată când scade vreo acțiune."
        ],
        correct: 1,
        explanation: "DCA te forțează să cumperi mai ieftin când piața scade și te scutește de efortul psihologic de a încerca să dibuiești momentul perfect."
      }
    ]
  },
  networking: {
    title: "7. Networking și Mentorat",
    category: "Abilități Sociale și Creștere",
    nodes: [
      {
        id: "n1",
        title: "Puterea Relațiilor de Încredere",
        type: "Networking Base",
        xp: 25,
        desc: "De ce capitalul social (cine te cunoaște și te recomandă) este un activ la fel de valoros ca resursele financiare ale unui startup.",
        theory: {
          intel: "Nu te izola! În business, ideile mari au nevoie de susținere umană. Un networking corect se bazează pe oferirea sinceră de valoare înainte de a cere vreun favor.",
          bullets: [
            "Legea reciprocității: Ajută-i pe alții cu abilitățile tale unice (design, cod, editare video) fără a aștepta o plată imediată.",
            "Dezvoltă relații, nu doar contacte de afaceri. Oamenii fac afaceri cu cei în care au încredere și pe care îi plac.",
            "Construiește o reputație de punctualitate și integritate; vorbele bune circulă extrem de repede în comunitatea de business locală."
          ],
          example: "Un tânăr fondator ajută voluntar un antreprenor local să-și configureze profilul de Notion, iar acesta îl recomandă ulterior unui investitor angel."
        },
        question: "Prin ce se definește o strategie sănătoasă de networking întrun ecosistem de startup-uri?",
        options: [
          "Trimiterea acelorași mesaje spam către sute de oameni fără adaptare personală.",
          "Oferirea sinceră și proactivă de ajutor/valoare înainte de a solicita vreun favor sau investiție.",
          "Izolarea totală și refuzul de a discuta ideea cu oricine de frică să nu fie copiată."
        ],
        correct: 1,
        explanation: "Colaborarea și spiritul de generozitate sunt fundamentele pe care se clădește încrederea trainică în business.",
        questions: [
          {
            question: "Cum poți adăuga valoare unui antreprenor ocupat când ești abia la început?",
            options: [
              "Să îi oferi feedback specific despre produsul lui sau să îl ajuți cu mici sarcini administrative pe care nu are timp să le rezolve.",
              "Să îi ceri un împrumut sau o investiție chiar din primele secunde în care îl întâlnești.",
              "Să îi explici de ce afacerea lui este total greșită fără să ai argumente practice sau experiență."
            ],
            correct: 0,
            explanation: "Să oferi feedback constructiv sau să rezolvi o mică problemă identificată arată atenție la detalii, pasiune și respect pentru timpul lui."
          }
        ]
      },
      {
        id: "n2",
        title: "LinkedIn: Cartea de Vizită a Secolului 21",
        type: "Personal Branding",
        xp: 25,
        desc: "Cum să-ți optimizezi profilul de LinkedIn pentru a atrage atenția managerilor, mentorilor și partenerilor de afaceri.",
        theory: {
          intel: "Profilul tău de LinkedIn funcționează ca o pagină de vânzări activă 24/7. Acesta trebuie să transmită clar ce competențe ai, ce proiecte dezvolți și cum poți fi util.",
          bullets: [
            "Poza de profil: O fotografie luminoasă, cu fundal curat, în care zâmbești prietenos.",
            "Headline-ul (titlul): Nu scrie doar 'Student'. Adaugă proiectele la care lucrezi (ex: 'Co-fondator [X] | Pasionat de EdTech & Marketing digital').",
            "Secțiunea 'About': Spune o poveste scurtă despre misiunea ta, tehnologiile pe care le stăpânești și ce oportunități de colaborare cauți în prezent."
          ],
          example: "Un elev de liceu își listează pe LinkedIn proiectul din cadrul unui hackathon și își descrie pasiunea, primind apoi propuneri de mentorat organic."
        },
        question: "Ce aspect este cel mai important pentru headline-ul tău de LinkedIn?",
        options: [
          "Să fie format dintr-un singur cuvânt vag precum 'Student' sau 'Elev'.",
          "Să fie clar, orientat spre descrierea proiectelor tale curente și competențele pe care vrei să le oferi lumii.",
          "Să conțină titluri inventate pompoase de tipul 'CEO of Universal Science'."
        ],
        correct: 1,
        explanation: "Headline-ul este prima informație pe care o citește o persoană când îți vizitează profilul și determină dacă îți va accepta sau nu invitația.",
        questions: [
          {
            question: "Cum poți folosi secțiunea de postări LinkedIn ca elev sau student?",
            options: [
              "Postând exclusiv meme-uri sau noutăți personale de weekend fără legătură cu business-ul.",
              "Scriind scurte jurnale de bord sau lecții învățate din învățarea ta zilnică și din dezvoltarea startup-ului.",
              "Criticând agresiv alte companii din piață pentru a părea deștept."
            ],
            correct: 1,
            explanation: "Partajarea parcursului tău autentic și a lecțiilor învățate atrage oameni dornici să te susțină și să te sfătuiască prietenos."
          }
        ]
      },
      {
        id: "n3",
        title: "Ghidul Abordării: Mentori & Investitori",
        type: "LinkedIn Outreach",
        xp: 25,
        desc: "Cum să abordezi respectos și eficient oameni de succes pe LinkedIn printr-un mesaj scurt, sincer și de impact.",
        theory: {
          intel: "Oamenii de succes vor să ajute tineri pasionați, însă timpul lor este extrem de prețios. Atunci când îi abordezi, respectă regula 'fără mesaje lungi sau vagi'. Formula perfectă pentru un mesaj privat (Outreach) are 4 elemente cheie:\n\n1. **Apreciere personalizată**: Referă-te la un articol specific pe care l-a scris sau la o realizare recentă a sa (arată că ai cercetat profilul).\n2. **Prezentare scurtă**: Spune cine ești în maxim 2 propoziții și ce proiect curajos dezvolți.\n3. **Întrebare / Solicitare ultra-specifică**: Nu cere 'să colaborăm' (este vag și cere efort). Pune o întrebare punctuală din expertiza lui sau cere un sfat concis.\n4. **Call to Action discret**: Propune o discuție online rapidă de 10-15 minute, specificând clar că nu vrei să îi răpești din timp sau că dorești doar o îndrumare pe o anumită dilemă.",
          bullets: [
            "Scrie personalizat: NICIODATĂ nu trimite mesaje identice prin copiere/lipire (Copy-Paste). Oamenii simt imediat lipsa de sinceritate.",
            "Nu cere bani direct: Scopul primei abordări pe LinkedIn nu este obținerea unei finanțări, ci stabilirea unei relații umane de încredere și ghidaj.",
            "Fii scurt și la obiect: Mesajul privat trebuie să poată fi citit integral de pe ecranul unui telefon în maxim 15 secunde (sub 120-150 de cuvinte)."
          ],
          example: "Mesaj de impact de pus în practică: 'Bună ziua [Nume], admir enorm succesul dumneavoastră cu [Companie]! Sunt [Nume], elev din București, și dezvoltăm o soluție ce optimizează reciclarea deșeurilor în școli. Ne lovim de dilema onboardingului primilor clienți b2b. Ne-ar ajuta enorm un simplu sfat de 2 rânduri sau, dacă agenda vă va permite, un scurt radar de 10 minute la o cafea zoom. Mulțumim mult pentru rolul de inspirație!'"
        },
        question: "Care este formula optimă de abordare pe LinkedIn a unui potențial mentor sau investitor ocupat?",
        options: [
          "Mesaj lung, vag în care îi ceri zeci de mii de euro finanțare fără un plan detaliat și o legătură prealabilă.",
          "Un mesaj personalizat, scurt, în care arăți că îi știi activitatea, te prezinți respectuos, pui o întrebare ultra-specifică și ceri respectos un sfat rapid.",
          "O invitație simplă fără niciun mesaj, urmată de spam de link-uri spre produsul tău."
        ],
        correct: 1,
        explanation: "Respectarea timpului și personalizarea abordării cresc rata de răspuns pozitiv cu peste 70%, deschizând uși de business de neprețuit.",
        questions: [
          {
            question: "Ce ar trebui să eviți cu desăvârșire în prima ta interacțiune text cu un investitor?",
            options: [
              "Să îi soliciți o sumă de bani (finanțare directă) înainte de a prezenta cifre solide, o validare a ideii sau de a stabili o conexiune umană.",
              "Să te prezinți respectuos cu numele și vârsta ta.",
              "Să îi mulțumești pentru materialele sau postările lui educaționale scrise gratuit online."
            ],
            correct: 0,
            explanation: "Nimeni nu investește doar pe baza unui text impersonal. Banii vin după ce ai demonstrat spirit de execuție, validare de piață și respect."
          }
        ]
      }
    ]
  }
};

// Programmatic configuration for chapters 4 to 10 for each of the 6 branches
const extraChaptersTemplate: { [key: string]: Array<{ id: string; title: string; type: string; desc: string; intel: string; bullets: string[]; example: string; question: string; options: string[]; correct: number; explanation: string }> } = {
  how_to_start_first_startup: [
    {
      id: "h4",
      title: "Value Proposition Canvas",
      type: "Produs",
      desc: "Cum să potrivești perfect durerea clienților cu opțiunile din produsul tău.",
      intel: "Valoarea unui soft nu stă în numărul de butoane, ci în cât de benefic este câștigul adus clienților și în rezolvarea obiecțiilor acestora.",
      bullets: [
        "Focalizează-te pe 'Jobs-to-be-done': activitățile zilnice pe care clienții vor să le bifeze.",
        "Analizează detaliat 'Pains': obstacolele pe care le întâmpină.",
        "Creează 'Gains': beneficii concrete ce fac viața clientului mult mai simplă."
      ],
      example: "Slack nu se vinde ca 'un chat comun', ci ca un înlocuitor pentru fluxul haotic al e-mailurilor colective din corporații.",
      question: "La ce se referă conceptul 'Jobs-to-be-done' în potrivirea valorii produsului?",
      options: [
        "Angajarea de contractori externi ieftini din India sau Filipine.",
        "Sarcina reală pe care clientul dorește să o rezolve folosind un anume produs sau serviciu.",
        "O regulă fiscală românească de înființare a asociațiilor de tineret."
      ],
      correct: 1,
      explanation: "Înțelegerea sarcinii clienților garantează că produsul tău e util și dorit de piața țintă."
    },
    {
      id: "h5",
      title: "Pitching & Elevator Pitch",
      type: "Comunicare",
      desc: "Cum să explici clar afacerea ta într-un discurs concentrat de exact 60 de secunde.",
      intel: "Un pitch bun respectă structura: Cârlig, Problemă concretă, Soluția ta, Tracțiune actuală și Apel clar la acțiune.",
      bullets: [
        "Elimină metaforele pompoase; folosește cuvinte simple și direct la subiect.",
        "Antrenează-ți discursul ca să fie cursiv și memorabil.",
        "Încheie mereu clar cu ceea ce soliciți acum: parteneriat, feedback sau programarea unei discuții."
      ],
      example: "Suntem Travis, un mentor digital inteligent pentru adolescenții din România care vor să înțeleagă finanțele practic, ajutând peste 5.000 de elevi activi lunar.",
      question: "Cu ce ar trebui să începi discursul tău de 60 de secunde?",
      options: [
        "O listă de mulțumiri exhaustive adresate comitetului de organizare.",
        "Un hook sau un fapt surprinzător/problemă intensă care atrage atenția imediat în primele 5 secunde.",
        "Explicarea structurii asociaților și cum împărțiți dividendele aferente."
      ],
      correct: 1,
      explanation: "Atragerea atenției timpurii este crucială în marketingul modern datorită atenției scăzute a ascultătorilor."
    },
    {
      id: "h6",
      title: "Segmentarea Nișei Inițiale",
      type: "Strategie",
      desc: "De ce pornirea pe o piață prea largă îți va distruge startup-ul și cum să începi local.",
      intel: "Nu încerca să fii totul pentru toată lumea. Un startup devine puternic concentrându-se exclusiv pe un grup specific de utilizatori disperați de o problemă.",
      bullets: [
        "Găsește nișa cea mai dornică de o rezolvare rapidă (early adopters).",
        "Oferă o soluție excelentă pentru ei ca să creezi un nucleu fidel de fani.",
        "Abia după dominarea nișei te poți extinde treptat spre audiențe largi."
      ],
      example: "Facebook a fost conceput exclusiv pentru studenții din Harvard înainte de a se deschide către toate universitățile și ulterior către toată lumea globally.",
      question: "Cine sunt 'Early Adopters' în teoria lansării de startup-uri?",
      options: [
        "Persoane sceptice care adoptă o soluție doar dacă este extrem de ieftină.",
        "Utilizatori timpurii dispuși să experimenteze produse parțiale doar pentru a-și rezolva rapid o durere persistentă.",
        "Organisme naționale de control care supraveghează piața financiară locală."
      ],
      correct: 1,
      explanation: "Early adopters acceptă bug-uri și imperfecțiuni dacă produsul tău le oferă primul ajutor valid la problema pe care o au."
    },
    {
      id: "h7",
      title: "Costul de Achiziție vs Conversie",
      type: "Metrici",
      desc: "Monitorizarea fiecărui pas de achiziție al utilizatorilor pe landing page.",
      intel: "Preluarea de clienți presupune o pâlnie (funnel). Utilizatorii intră vizitatori, devin leaduri și se convertesc în clienți plătitori.",
      bullets: [
        "Rata de conversie: Procentul din vizitatori care finalizează acțiunea propusă.",
        "Înțelege costul fiecărei etape ca să optimizezi pașii care au pierderi.",
        "Simplificarea interfeței (eliminarea butoanelor inutile) urcă rata de conversie masiv."
      ],
      example: "Dacă din 100 de vizitatori pe landing page exact 5 se înscriu în lista de email, rata ta de conversie este de 5%."
      ,question: "Ce reprezintă o pâlnie de conversie (funnel)?",
      options: [
        "O unealtă de protecție a stocurilor în depozitele din străinătate.",
        "Parcursul etapizat al utilizatorului de la descoperirea inițială a afacerii până la transformarea în client plătitor.",
        "Formularul de impozitare pe care îl depunem la final de an."
      ],
      correct: 1,
      explanation: "Pâlnia descrie pierderea naturală de utilizatori de la un pas la altul, ajutându-te să identifici unde se blochează oamenii în aplicație."
    },
    {
      id: "h8",
      title: "Iterarea pe Baza Feedback-ului",
      type: "Dezvoltare",
      desc: "Cum analizezi onest feedback-ul toxic versus feedback-ul constructiv al clienților.",
      intel: "Nu orice critică merită implementată. Ascultă doar de acțiunile repetate ale unui grup reprezentativ și nu de doleanțele excentrice ale unei singure persoane.",
      bullets: [
        "Urmărește comportamentul lor în aplicație (date colective), nu doar declarațiile scrise.",
        "Dacă utilizatorii cer o facilitate, observă dacă sunt blocați cu adevărat din utilizare fără ea.",
        "Menține simplitatea produsului tău chiar și după implementarea recurentă."
      ],
      example: "Utilizatorii pot spune că vor zeci de grafice, dar datele arată că ei folosesc doar butonul simplu de trimitere a banilor."
      ,question: "Cum prioritizezi corect facilitățile noi în produsul tău?",
      options: [
        "Implementezi tot ce îți sugerează oricine online pentru a părea receptiv.",
        "Analizezi acțiunile colective majore și construiești doar ce elimină cu adevărat blocajele și aduce plusvaloare nucleului de clienți.",
        "Aștepți ca investitorii externi să decidă designul butoanelor din aplicație."
      ],
      correct: 1,
      explanation: "Iterarea pe baza datelor reale te protejează de supraîncărcarea produsului cu facilități pe care nimeni nu le va folosi în realitate."
    },
    {
      id: "h9",
      title: "Lansarea Oficială în Comunități",
      type: "Lansare",
      desc: "Pregătirea lansării pe platforme ca Product Hunt, Facebook sau grupuri de tineri entuziaști.",
      intel: "Planificarea lansării se face minuțios. Strânge o armată mică de utilizatori de încredere gata să te susțină în primele ore pentru vizibilitate maximă.",
      bullets: [
        "Pregătește materiale explicative simple și design grafic atrăgător.",
        "Mobilizează asociații să răspundă politicos la toate întrebările timpurii.",
        "Oferă o reducere simbolică pe viață celor care te validează în ziua lansării."
      ],
      example: "O campanie pe Product Hunt unde fondatorii răspund energic la 40 de comentarii tehnice în timp util propulsează startup-ul în top."
      ,question: "Care este cel mai util lucru în ziua lansării unui startup?",
      options: [
        "Să ții platforma ascunsă până se înscriu mii de oameni aleatoriu.",
        "Să fii activ și să colectezi feedback imediat de la primii curajoși, interacționând deschis cu ei.",
        "Să oprești serverul pentru a simula o panică mare cauzată de trafic."
      ],
      correct: 1,
      explanation: "Implicarea directă în ziua 1 construiește o loialitate timpurie extrem de puternică din partea primilor adoptatori."
    },
    {
      id: "h10",
      title: "Startup: Capcanele Falimentului",
      type: "Rezistență",
      desc: "Cele mai frecvente top 3 cauze din care eșuează tinerii fondatori în primii ani.",
      intel: "Înțelegerea pericolelor îți mărește șansele de supraviețuire economică în mediul de business real din România.",
      bullets: [
        "Falta validării pieței: construirea a ceva ce de fapt piața nu își dorește deloc.",
        "Terminarea banilor disponibili: lipsa de control pe cashflow-ul lunar (burn rate).",
        "Neînțelegerile ascuțite din echipă cauzate de lipsa unui acord clar semnat din prima lună."
      ],
      example: "O echipă de ingineri perfecționează un produs 10 luni fără să vorbească deloc cu piața, doar pentru a afla că nimeni nu e dispus să folosească softul lansat.",
      question: "Care este principala cauză din care eșuează majoritatea startup-urilor la nivel global?",
      options: [
        "Un design grafic imperfect sau lipsa unui logo scump din prima zi.",
        "Construirea unui produs/serviciu pe care piața nu-l dorește și nu are nevoie de el.",
        "Folosirea unui server local prea mic în prima lună de testare."
      ],
      correct: 1,
      explanation: "Soluționarea unei probleme inexistente este cel mai costisitor mod de a eșua. Validează mereu piața înainte de a programa prima linie de cod."
    }
  ],
  finance: [
    {
      id: "f4",
      title: "Carduri de Debit vs Credit",
      type: "Personal Finance",
      desc: "Secretele băncilor și cum să folosești responsabil instrumentul de creditare fără capcane.",
      intel: "Cardul de debit folosește banii tăi reali de pe contul curent. Cardul de credit folosește banii băncii pe care te obligi să îi rambursezi lunar.",
      bullets: [
        "Perioada de grație: intervalul (ex: 45 de zile) în care poți înapoia banii folosiți complet fără dobândă.",
        "Evită dobânzile imense plătind întotdeauna suma totală extrasă, nu doar suma minimă solicitată de bancă.",
        "Folosește cardul de credit exclusiv pentru beneficiile de loialitate sau protecția suplimentară la achiziții mari."
      ],
      example: "Plata unei vacanțe pe card de credit îți asigură protecție la fraudă, dar dacă nu achiți soldul total la data scadentă, dobânda anuală poate fi de peste 20%.",
      question: "Ce reprezintă 'perioada de grație' a unui card de credit?",
      options: [
        "Un moment de iertare generală a datoriilor dacă ceri asta în scris.",
        "Intervalul fix în care poți rambursa integral suma cheltuită fără să plătești vreo dobândă băncii.",
        "Timpul maxim în care poți reține cardul expirat în portofel."
      ],
      correct: 1,
      explanation: "Rambursarea completă a datoriei în perioada de grație îți permite să utilizezi banii băncii complet gratuit."
    },
    {
      id: "f5",
      title: "Fondul de Siguranță",
      type: "Siguranță",
      desc: "Cum să construiești un nucleu de bani lichizi gata să te protejeze de orice urgență majoră.",
      intel: "Un fond de siguranță conține echivalentul a 3-6 luni de cheltuieli esențiale trăite minimalist.",
      bullets: [
        "Păstrează acești bani în instrumente foarte sigure și lichide: conturi de economii sau titluri de stat pe termen scurt.",
        "Nu atinge acești bani pentru dorințe volatile sau vacanțe de plăcere.",
        "Fondul funcționează ca o centură de siguranță mintală, ținându-te departe de împrumuturi disperate."
      ],
      example: "Dacă cheltuielile tale de viață sunt de 2.000 RON pe lună, un fond corect conține între 6.000 și 12.000 RON păstrați neatinși la adăpost.",
      question: "Cât ar trebui să conțină, din punct de vedere sanitar, un Fond de Siguranță stabil?",
      options: [
        "Exact 500 de lei pentru mărunțișuri zilnice.",
        "Echivalentul a 3-6 luni de cheltuieli de bază, accesibile rapid în caz de probleme reale.",
        "Aproximativ 90% din averea ta totală sub formă de criptomonede speculative."
      ],
      correct: 1,
      explanation: "Acest interval îți asigură flexibilitate totală și liniște în cazul în care îți pierzi temporar veniturile curente."
    },
    {
      id: "f6",
      title: "Unde Evaporează Banii Tăi?",
      type: "Expense Tracking",
      desc: "Cum să-ți asiguri atenția la cheltuielile invizibile din viața zilnică.",
      intel: "Lichidarea banilor se face prin micro-tranzacții invizibile: abonamente nefolosite, cafele scumpe și cumpărături impulsive pe internet.",
      bullets: [
        "Folosește o aplicație simplă de evidență a cheltuielilor timp de exact 30 de zile.",
        "Împarte cheltuielile în categorii clare și elimină dublurile inutile.",
        "Măsoară costurile raportat la efort (câte ore de muncă a trebuit să dai pentru acel gadget scump)."
      ],
      example: "Un abonament de divertisment de 60 lei pe lună pe care nu îl mai urmărești adună 720 lei degeaba pe care îi poți investi recurent.",
      question: "Care este cel mai bun mod de a opri deprecierea banilor pe cheltuieli nefondate?",
      options: [
        "Să nu mai cumperi niciodată mâncare în oraș.",
        "Să monitorizezi riguros toate sumele plătite timp de o lună pentru a depista clar evapoările banilor tăi.",
        "Să împrumuți masiv de la părinți pentru a compensa gaura bugetară."
      ],
      correct: 1,
      explanation: "Conștientizarea destinației fiecărui leu este singurul mod prin care poți recăpăta controlul asupra deciziilor tale financiare."
    },
    {
      id: "f7",
      title: "Taxe & Impozite pe Scurt",
      type: "Birocrație",
      desc: "Ghid practic pe înțelesul unui adolescent despre impozitul pe venit, CAS și CASS în România.",
      intel: "Venitul brut este suma totală câștigată. Venitul net este ceea ce primești fizic în buzunar după plata dărilor către Statul Român.",
      bullets: [
        "Impozit pe venit standard în România: 10% din baza impozitabilă.",
        "CAS (Contribuția la Pensii): 25% din salariul brut administrat public.",
        "CASS (Contribuția la Sănătate): 10% asigurați în caz de urgențe de tratament public."
      ],
      example: "Dacă salariul brut este de 5.000 lei, statul oprește aproximativ 43% pe taxe, lăsând un net de aproximativ 2.850 lei angajatului.",
      question: "Care este contribuția denumită CAS pe fluturasul tău salarial din România?",
      options: [
        "Taxa auto județeană plătită lunar la ANAF.",
        "Contribuția la asigurările sociale destinată sistemului public de pensii (25%).",
        "Abonamentul medical periodic oferit opțional angajatului."
      ],
      correct: 1,
      explanation: "CAS se colectează direct de stat și alimentează fondul public din care se plătesc pensiile actuale din economie."
    },
    {
      id: "f8",
      title: "Gestiunea Datoriilor Toxice",
      type: "Educație",
      desc: "Metode practice (Bulgărele de zăpadă vs Avalanșa) pentru a curăța creditul nociv de pe linia ta de viață.",
      intel: "Datoriile bune generează cashflow (ex: investit într-un utilaj de afaceri). Datoriile toxice se depreciază rapid în valori zero (credite de consum pentru concedii sau haine).",
      bullets: [
        "Metoda Avalanșei: Plătești agresiv datoria cu cea mai mare dobândă monetară din listă.",
        "Metoda Bulgărele: Plătești cea mai mică datorie simbolică prima ca să obții o victorie psihologică rapidă.",
        "Nu face niciodată credite pentru cheltuieli zilnice curente."
      ],
      example: "Finanțarea unui telefon cu o dobândă curentă masivă este cel mai toxic mod de a-ți ipoteca libertatea viitoare a veniturilor.",
      question: "Ce presupune Metoda Bulgărelui de Zăpadă (Debt Snowball)?",
      options: [
        "Să îți stochezi banii în depozite de gheață la bănci din străinătate.",
        "Plata datoriilor în ordinea crescătoare a soldului lor, obținând satisfacție rapidă din închiderea primelor conturi.",
        "Achitarea cu prioritate exclusivă a datoriilor mari prin vânzări nefondate."
      ],
      correct: 1,
      explanation: "Satisfacția mintală a eliminării rapide a datoriilor minuscule te motivează puternic să continui procesul de curățenie financiară."
    },
    {
      id: "f9",
      title: "Planificarea Financiară FIRE",
      type: "Plan",
      desc: "Ce este curentul Financial Independence, Retire Early și cum se aplică la scară locală.",
      intel: "Curentul FIRE susține economisirea extremă în tinerețe (50-70% din venituri) reinvestită în active recurente ca să poți trăi din randamente.",
      bullets: [
        "Regula celor 4%: Procentul anual pe care îl poți extrage din portofoliu fără să diminuezi averea brută pe viață.",
        "Independența financiară îți oferă libertatea de a lucra doar din pasiune, nu de nevoie.",
        "Ajustează modelul la viața din România prin stabilirea unui target rezonabil de cheltuieli lunare."
      ],
      example: "Dacă ai cheltuieli de 36.000 lei pe an, ai nevoie de un portofoliu de 900.000 lei investit solid pentru a fi liber de datoria muncii.",
      question: "Ce promovează cel mai mult pilonul central al mișcării economice FIRE?",
      options: [
        "Cumpărarea de mașini scumpe la vârste timpurii pe bază de leasing.",
        "Acumularea de active generatoare de dobânzi ca să devii independent de salariu cât mai devreme pe parcursul vieții.",
        "Refuzul complet de a mai depune dări fiscale la ANAF."
      ],
      correct: 1,
      explanation: "Focusul se mută din zona consumului rapid pe zona independenței complete și a libertății personale absolute a timpului tău."
    },
    {
      id: "f10",
      title: "Afacerile cu Prietenii: Reguli",
      type: "Relații",
      desc: "Cum să îmbină corect comunicarea, banii interni și sperarea conflictelor personale în asocieri.",
      intel: "Asocierile cu cei mai buni prieteni se distrug frecvent din cauza neînțelegerilor legate de bani. Setează reguli documentate din prima zi.",
      bullets: [
        "Pune toate acordurile financiare, procente și atribuții pe hârtie semnată.",
        "Vorbește transparent despre scenariile de eșec înainte de a porni cheltuielile majore.",
        "Separă clipele de distracție socială de discuțiile reci profesionale ale asociației."
      ],
      example: "O simplă foaie asumată prin semnătură în care precizați responsabilitatea fiecărui administrator salvează o relație veche de zeci de ani.",
      question: "Care este cel mai sănătos mod de a introduce bani sau asocieri în relațiile cu prietenii close?",
      options: [
        "Să mergi exclusiv pe încredere orală fără să precizezi procente clare în firmă.",
        "Să documentați în scris rolurile clare, procente și ieșirea din afacere ca să evitați interpretări afective viitoare.",
        "Să nu discutați niciodată despre datoriile fiecăruia ca să nu stricați vibeul."
      ],
      correct: 1,
      explanation: "Documentele clare și obiective protejează prietenia în mod proactiv, eliminând incertitudinile ce pot apărea când se nasc primele sume mari de bani."
    }
  ],
  economics: [
    {
      id: "e4",
      title: "PIB-ul și Puterea Economică",
      type: "Macroeconomie",
      desc: "Ce este Produsul Intern Brut și cum arată el bogăția acumulată într-o țară.",
      intel: "PIB-ul reprezintă valoarea monetară totală a tuturor bunurilor și serviciilor finale geproduse într-o țară pe parcursul unui an calendaristic.",
      bullets: [
        "PIB-ul se calculează ca sumă a consumului, investițiilor private, cheltuielilor guvernamentale și a exporturilor nete.",
        "PIB pe cap de locuitor (per capita) ajustează această cifră la populație pentru a ilustra corect nivelul mediu de trai.",
        "Creșterea economică semnalează sănătate publică și oportunități mai mari de angajare în companii."
      ],
      example: "România a înregistrat o creștere stabilă de PIB în ultimele decenii, propulsând nivelul de viață al reședințelor de județ din țară.",
      question: "Ce măsoară cu exactitate indicatorul PIB (Produsul Intern Brut)?",
      options: [
        "Datoria publică strânsă de băncile centrale în seifuri.",
        "Valoarea financiară finală a bunurilor și serviciilor produse în interiorul unei națiuni pe parcursul unui an.",
        "Taxa pe valoarea adăugată percepută obligatoriu la exporturile navale."
      ],
      correct: 1,
      explanation: "PIB-ul estimează dimensiunea totală a agregatului numit economie și ritmul de consum al acesteia."
    },
    {
      id: "e5",
      title: "Recesiuni & Cicluri Economice",
      type: "Istorie Economică",
      desc: "De ce economia nu crește la nesfârșit și cum te poți pregăti personal pentru vremuri aspre.",
      intel: "Economia funcționează urmând cicluri clare de Expansiune, Vârf, Contracție (Recesiune) și Minim istoric.",
      bullets: [
        "O recesiune tehnică este definită prin două trimestre consecutive de scădere a PIB-ului național.",
        "În timpul recesiunii, șomajul crește, creditele sunt mai dificil de luat, iar consumatorii devin extrem de reticenți la cumpărături.",
        "Cea mai bună protecție: lipsa datoriilor și deținerea unui cont solid pentru vremuri reci."
      ],
      example: "Criza financiară din 2008 a fost o contracție generalizată pornită din ipotecile speculative ale băncilor majore din SUA.",
      question: "Când se instalează oficial starea de 'recesiune tehnică' într-un stat?",
      options: [
        "Când inflația de depășește nivelul alert de 5% pe o perioadă de o lună.",
        "La înregistrarea a două trimestre consecutive de declin real al Produsului Intern Brut (PIB).",
        "Când bursa de valori București își oprește activitățile timp de o zi."
      ],
      correct: 1,
      explanation: "Recesiunea confirmă încetinirea fizică a producției și consumului, provocând corecții de prețuri în piață."
    },
    {
      id: "e6",
      title: "Capitalism vs Socialism",
      type: "Sisteme Economice",
      desc: "O imagine comparativă onestă despre libera inițiativă economică și intervenția statului.",
      intel: "Capitalismul prețuiește proprietatea privată și economia liberă reglementată de piață. Socialismul pretinde proprietatea colectivă de stat pe factorii de producție.",
      bullets: [
        "Capitalismul încurajează inovația, competitivitatea și recompensa pentru meritele aduse clienților.",
        "Socialismul caută egalitatea forțată, dar de multe ori suprimă inovația din cauza controlului excesiv de stat.",
        "Statele moderne îmbină o economie capitalistă cu măsuri sociale de sprijin public (sănătate, școli gratuite)."
      ],
      example: "Statele din Uniunea Europeană aplică un model de economie socială de piață care protejează libera competiție alături de ajutoare solidare.",
      question: "Care este nucleul de bază al sistemului capitalist liber?",
      options: [
        "Controlul total al prețului pâinii asigurat prin decizii de partid.",
        "Proprietatea privată, libertatea piețelor și mecanismele comericale guvernate de competiție.",
        "OBLIGATIVITATEA ca toți cetățenii să câștige exact același venit lunar."
      ],
      correct: 1,
      explanation: "Capitalismul lasă forțele pieței să determine succesul sau eșecul unei idei comerciale, stimulând direct creșterea de tehnologie."
    },
    {
      id: "e7",
      title: "TVA și Impozite Indirecte",
      type: "Finanțe Publice",
      desc: "Cum participi la cheltuielile statului de fiecare dată când cumperi o simplă ciocolată de la magazin.",
      intel: "Taxa pe Valoarea Adăugată (TVA) este un impozit indirect plătit de consumatorul final la fiecare achiziție curentă.",
      bullets: [
        "Cota standard de TVA în România este de 19% din valoarea bunurilor.",
        "Există cote reduse (ex: 9% pentru alimente de bază sau medicamente) pentru a sprijini accesibilitatea cetățenilor.",
        "Comercianții colectează TVA de la clienți și o depun periodic în conturile de stat."
      ],
      example: "Dacă cumperi o ciocolată care costă 10 lei fără TVA, tu vei plăti la casă 10,9 lei (9% tva la mâncare), plătind indirect 0,9 lei taxă de stat.",
      question: "Cine suportă în mod real costul final al Taxei pe Valoarea Adăugată (TVA)?",
      options: [
        "Producătorul străin al materiilor prime industriale.",
        "Consumatorul final care achiziționează și folosește acel bun de pe raftul magazinului.",
        "Banca Națională a României prin rezerve proprii."
      ],
      correct: 1,
      explanation: "TVA este o taxă aplicată consumului final, fiind integrată automat în prețul pe care îl vedem afișat la magazin."
    },
    {
      id: "e8",
      title: "Globalizare & Schimb Comercial",
      type: "Piețe Globale",
      desc: "De unde vin hainele tale și cum funcționează rețeaua incredibilă a schimbului internațional.",
      intel: "Țările participă la comerț urmând principiul avantajului comparativ: produc ceea ce pot face mai ieftin și importă restul bunurilor.",
      bullets: [
        "Avantajul comparativ: eficiența relativă mărită a unei națiuni pe un anume produs (ex: tech în SUA, producție în China).",
        "Bariere comerciale (taxe vamale) blochează comerțul, crescând adesea prețul plătit de cetățeni.",
        "Globalizarea unește lanțurile de aprovizionare, reducând masiv prețul gadgeturilor."
      ],
      example: "Telefonul dintr-un buzunar românesc este proiectat în America, fabricat din metale din Africa și asamblat pe linii din Asia.",
      question: "Ce încurajează principiul Avantajului Comparativ în economie?",
      options: [
        "Să produci absolut totul în interiorul propriei națiuni, indiferent de prețuri și efort.",
        "Specializarea țărilor în fabricarea acelor bunuri unde au o eficiență sporită, importând restul mai ieftin.",
        "Eliminarea totală a zborurilor aeriene din considerente ecologice globale."
      ],
      correct: 1,
      explanation: "Specializarea crește productivitatea globală aggregate și oferă consumatorilor o diversitate și un preț mult mai bun."
    },
    {
      id: "e9",
      title: "Cursul Valutar și BNR",
      type: "Valută",
      desc: "De ce crește sau scade cursul Euro în raport cu Leul românesc și cum se stabilește el zilnic.",
      intel: "Cursul de schimb valutar arată prețul unei monede raportat la alta. El reflectă direct încrederea în economia acelei țări.",
      bullets: [
        "Cursul este dictat de cererea și oferta de valută de pe piața Forex (interbancară).",
        "Dacă mulți investitori cumpără proprietăți sau titluri în România, cererea de Lei urcă și moneda se întărește.",
        "BNR realizează uneori intervenții ascunse pe piață ca să evite fluctuațiile violente ce dăunează exportatorilor și creditelor."
      ],
      example: "Dacă vrei să cumperi un joc online ce costă 50 EUR și cursul crește de la 4.90 la 5.00 lei, jocul te va costa simbolic cu 5 lei mai mult.",
      question: "Cum se formează zilnic cursul valutar dintre Leu și o monedă străină?",
      options: [
        "Este decis arbitrar de primarul capitalei într-o ședință săptămânală.",
        "Prin raportul de cerere și ofertă existent pe piețele interbancare valutare internaționale.",
        "Urmând reguli fixe stabilite de un consorțiu privat imobiliar."
      ],
      correct: 1,
      explanation: "Schimbul valutar este un preț liber determinat de tranzacțiile continue dintre bănci, firme și deponenți."
    },
    {
      id: "e10",
      title: "Economia Comportamentală",
      type: "Psihologie",
      desc: "De ce oamenii nu acționează ca niște roboți reci și logici când își organizează banii.",
      intel: "Economia clasică presupune că acționăm logic (Homo Economicus). Economia comportamentală arată că avem slăbiciuni psihologice clare.",
      bullets: [
        "Aversiune față de pierdere: te sperie dublu pierderea a 100 de lei față de satisfacția câștigării aceleiași sume.",
        "Efectul de turmă: achiziționarea de active speculative doar pentru că restul prietenilor o fac acum (FOMO).",
        "Ancorarea: tendința minții de a se baza prea mult pe prima informație recepționată (frecvent prețul umflat redus fictiv)."
      ],
      example: "Magazinele urcă artificial un preț la 300 lei doar pentru a-l stăpâni tăiat la 150 lei, ancorându-te într-o reducere imaginară excelentă.",
      question: "Ce reprezintă 'Aversiunea față de Pierdere' (Loss Aversion)?",
      options: [
        "Ura de a face împrumuturi pe termen scurt de la rude apropiate.",
        "Fenomenul psihologic în care durerea resimțită la o pierdere de bani este mult mai mare decât plăcerea obținută la un câștig similar.",
        "O afecțiune mintală ce blochează deschiderea de conturi bancare fizice."
      ],
      correct: 1,
      explanation: "Aversiunea la pierdere te poate bloca în decizii iraționale, cum ar fi refuzul de a vinde active degradate, doar de a nu asuma fiscal pierderea."
    }
  ],
  startup: [
    {
      id: "s4",
      title: "Bootstrapping vs Finanțare",
      type: "Strategie",
      desc: "Cum să decizi dacă pornești o firmă pe cont propriu sau cauți din prima zi banii altora.",
      intel: "Bootstrapping presupune finanțarea afacerii exclusiv din economiile personale și reinvestirea imediată a primelor vânzări din piață.",
      bullets: [
        "Bootstrapping-ul îți păstrează 100% din proprietate, libertate decizională și focus ascuțit pe satisfacția clienților reali.",
        "Finanțarea externă (VC/Angel) îți aduce capital mare rapid ca să prinzi oportunități mari, dar pierzi procente din companie.",
        "Nu căuta investitori doar pentru că sună elegant; caută bani externi exclusiv când ai o direcție stabilă gata să fie multiplicată."
      ],
      example: "O firmă de digital design pornește făcând siteuri pentru clienți mici, finanțându-și din profit propria platformă de creare pagini web.",
      question: "Ce înțelegem prin termenul de antreprenoriat 'Bootstrapping'?",
      options: [
        "Angajarea de asistenți speciali de securitate fizică internațională.",
        "Finanțarea și creșterea afacerii exclusiv din economii proprii și profituri generate local, fără fonduri externe.",
        "Asocierea cu fonduri guvernamentale nepuse la dispoziție legal."
      ],
      correct: 1,
      explanation: "Bootstrapping te menține stăpân complet pe direcția afacerii tale și te obligă să fii incredibil de creativ și chibzuit cu cheltuielile comerciale."
    },
    {
      id: "s5",
      title: "Găsirea unui Co-fondator",
      type: "Echipă",
      desc: "De ce ai nevoie de abilități complementare (Hacker & Hustler) ca să asiguri performanța startup-ului.",
      intel: "Este dificil să pornești la drum complet singur. Succesul combină perfect două forțe cruciale în firmă.",
      bullets: [
        "The Hacker (Tehnicianul): Geniul de tehnologie de bază care construiește platforma impecabil.",
        "The Hustler (Vânzătorul): Persoana carismatică care vorbește cu presa, clienții și asigura vânzările fizice.",
        "Evită asocierile cu oameni care au exact același set de abilități ca și tine."
      ],
      example: "Modelul faimos Apple: Steve Jobs (vânzătorul vizionar - Hustler) și Steve Wozniak (creatorul tehnic - Hacker).",
      question: "De ce este considerată valoroasă complementaritatea în formarea echipei de fondatori?",
      options: [
        "Asigură că toți membrii pot scrie cod exact în același limbaj virtual.",
        "Permite acoperirea optimă atât a asamblajului tehnic al aplicației cât și a activităților dure de promovare și vânzare.",
        "Reduce pretențiile salariale la nivel județean în prima lună."
      ],
      correct: 1,
      explanation: "Nevoile unui startup sunt mixte. O echipă cu talente complementare evită blocajele interne și execută ambele direcții de business în paralel."
    },
    {
      id: "s6",
      title: "Înființarea unui SRL in România",
      type: "Legal",
      desc: "Cum arată hățișul birocratic real de la Registrul Comerțului pe înțelesul tuturor.",
      intel: "O Societate cu Răspundere Limitată (SRL) este cea mai sigură structură juridică comercială din România.",
      bullets: [
        "Răspundere limitată: patrimoniul tău personal (casa, conturile proprii) nu este afectat de datoriile SRL-ului.",
        "Ai nevoie de rezervare de nume, stabilire de coduri CAEN conforme și deschiderea unui cont de capital.",
        "Fii pregătit să colaborezi cu un contabil autorizat CECCAR din prima lună de activitate ca să eviți amenzile aspre."
      ],
      example: "Dacă SRL-ul tău are un incident nefericit sau e în faliment, asociații pierd doar banii investiți în firmă, nu și bunurile lor de acasă.",
      question: "Ce reprezintă 'Răspunderea Limitată' specifică unui SRL?",
      options: [
        "Limitarea programului de lucru zilnic la exact 4 ore.",
        "Protejarea bunurilor personale ale asociaților, datoriile firmei putând fi urmărite doar pe conturile și activele deținute de SRL.",
        "Interzicerea angajării de tineri sub 21 de ani."
      ],
      correct: 1,
      explanation: "Răspunderea limitată îți limitează riscul în antreprenoriat exclusiv la banii pe care ai ales să îi expui în societate."
    },
    {
      id: "s7",
      title: "Contracte NDA & IP Protection",
      type: "Proprietate",
      desc: "Cum îți blochezi legal designul, ideea și codul sursă în interiorul SRL-ului.",
      intel: "Ideile nu se fură atât de des pe cât crezi, dar codul și tehnologia proprietară (Intellectual Property - IP) trebuie securizate complet.",
      bullets: [
        "Contracte NDA (Non-Disclosure Agreement): acorduri de confidențialitate pe date interne sensibile.",
        "IP Assignment: clauze exprese prin care tot codul scris de asociați sau developeri aparține exclusiv SRL-ului.",
        "Protejează-ți din timp numele brandului prin înregistrare oficială la OSIM din România."
      ],
      example: "O agenție scrie cod pentru un startup. Fără un contract de transfer de IP clar semnat, codul aparține tehnic designerilor agenției și nu firmei tale.",
      question: "La ce folosește clauza legală de 'IP Assignment' cu programatorii tăi?",
      options: [
        "Le garantează salarii duble la finalul anului.",
        "Asigură transferul legal complet al drepturilor de proprietate intelectuală pe codul dezvoltat de la persoana fizică la firma ta computerizată.",
        "Oprește temporar securitatea serverului central contra cost."
      ],
      correct: 1,
      explanation: "Proprietatea intelectuală curată este o cerință esențială pentru orice investitor sau evaluator de business."
    },
    {
      id: "s8",
      title: "Crowdfunding & Venture Capital",
      type: "Finanțare",
      desc: "Ghid de bază despre investitori Angel, fonduri de risc și campanii publice de finanțare în masă.",
      intel: "Sursele de capital extern sunt stratificate în funcție de maturitatea actuală a inovației din firmă.",
      bullets: [
        "Angel Investor: Persoană privată experimentată care oferă sume mici la început (30k-100k) oferind și know-how.",
        "Venture Capital (VC): Fonduri mari instituționale care investesc sume masive în schimbul unor procente solide de control.",
        "Crowdfunding (ex: SeedBlink): Platforme unde cetățenii de rând pot investi sume mărunte în ideea ta."
      ],
      example: "Un startup românesc caută sprijin de la 3 asociați Angel locali pentru a-și finaliza MVP-ul util vânzărilor.",
      question: "Cine este un 'Angel Investor' în ecosistemul antreprenorial?",
      options: [
        "Un angajat guvernamental însărcinat cu supervizarea corectă a comerțului fiscal.",
        "O persoană fizică ce își investește banii proprii în startup-uri în fază incipientă, ghidând fondatorii.",
        "O companie imobiliară care donează spații de colaborare tinerilor designeri."
      ],
      correct: 1,
      explanation: "Angel investorii acoperă acel vid dificil de capital dintre economiile asociaților și finanțările masive obținute de la fondurile VC."
    },
    {
      id: "s9",
      title: "Burn Rate și Runway financiar",
      type: "Planificare",
      desc: "Formula sfântă prin care calculezi de câte luni de viață mai dispune startup-ul tău în prezent.",
      intel: "Metricile financiare interne determină supraviețuirea fizică a firmei. O greșeală stupidă este neglijarea vitezei de consum.",
      bullets: [
        "Burn Rate: Suma netă pe care firma o cheltuiește (pierde) lunar peste veniturile existente (ex: 5.000 EUR/lună).",
        "Runway (Pista): Numărul de luni până când se golesc conturile complet de bani (Runway = Total bani / Burn Rate).",
        "Menține un Runway de cel puțin 6 luni ca să ai timp suficient să obții noi runde sau vânzări."
      ],
      example: "Dacă ai 40.000 EUR în conturi și afacerea are pierderi de 4.000 EUR pe lună, pista ta rămasă este de fix 10 luni.",
      question: "Cum se calculează parametrul denumit 'Runway' financiar?",
      options: [
        "Împărțirea cifrei de afaceri anuale la taxele ANAF de stat.",
        "Totalul banilor disponibili în conturi împărțit la valoarea cheltuielilor nete lunare (Burn Rate).",
        "Numărul de kilometri parcurși de fondatori în deplasări de business."
      ],
      correct: 1,
      explanation: "Runway-ul arată timpul scurs la dispoziție pentru a face afacerea profitabilă sau a asigura o nouă finanțare înainte de închiderea severă a activității."
    },
    {
      id: "s10",
      title: "Când și Cum Pivotăm Afacerea",
      type: "Adaptabilitate",
      desc: "Cum recunoști momentul în care direcția curentă eșuează și cum schimbi cursul fără frustrare.",
      intel: "Pivotarea presupune schimbarea unei părți fundamentale a modelului de afaceri, păstrând înțelegerile învățate anterior.",
      bullets: [
        "Pivotezi pe un alt segment de clienți sau muți accentul pe o singură funcționalitate mult dorită.",
        "Nu confunda pivotarea cu abandonul; este o optimizare asumată bazată pe dovezile din piață.",
        "Fii flexibil și comunică direct și onest echipei tale de asociați noile planuri."
      ],
      example: "Slack a fost inițial un joc video eșuat; fondatorii au decis să pivoteze transformând exclusiv mesageria din joc în produsul final.",
      question: "Ce înțelegem prin termenul de 'pivotare' în conduita unui startup tech?",
      options: [
        "Vânzarea completă a companiei concurenței din cauza fricii de colaps.",
        "Schimbarea strategică a produsului, audienței sau monetizării în baza datelor concrete primite din piață.",
        "Schimbarea exclusivă a numelui de domeniu web în fiecare an."
      ],
      correct: 1,
      explanation: "Pivotarea înseamnă utilizarea inteligentă a lecțiilor învățate pentru a redirecționa resursele spre o nișă mult mai probabil profitabilă."
    }
  ],
  marketing: [
    {
      id: "m4",
      title: "Marketingul cu Micro-Influenceri",
      type: "Social Media",
      desc: "De ce tinerii creatori cu comunități mici pot aduce rezultate mult mai mari decât vedetele TV.",
      intel: "Micro-influencerii (1.000 - 10.000 de fani) au rate de interacțiune superioare și bucură de un nivel de încredere intim.",
      bullets: [
        "Colaborează de preferat cu creatori care sunt nișați perfect pe specificul tău de activitate.",
        "Valorează calitatea dialogului din secțiunea de comentarii mult mai sus decât numărul sec de followers fictivi.",
        "Oferă-le coduri de reducere personalizate ca să le poți urmări eficient performanța adusă."
      ],
      example: "O firmă de stickere personalizate colaborează cu 3 elevi populari din licee, obținând sute de comenzi în prima zi de școală.",
      question: "Care este beneficiul principal al colaborării cu Micro-Influenceri în publicitate?",
      options: [
        "Costurile sunt infinit mai mari dar aduc automat interviuri la TV.",
        "Rata înaltă de interacțiune autentică (engagement) și costurile mult mai potrivite pentru tinerii fondatori.",
        "Ei pot modifica codul aplicației direct de pe TikTok."
      ],
      correct: 1,
      explanation: "Nivelul de încredere crescut din comunitățile mici transformă recomandările micro-creatorilor în decizii sigure de cumpărare."
    },
    {
      id: "m5",
      title: "Secretele Conținutului Viral",
      type: "TikTok Engine",
      desc: "Cum să configurezi videoclipul tău pe rețele mobile de la concept la designul final.",
      intel: "Algoritmul TikTok prețuiește retenția medie pe secundă și distribuirile textelor trimise din aplicație.",
      bullets: [
        "Deschide discursul cu un 'Hook text' magnetizant în primele 3 secunde.",
        "Menține un ritm dinamic și folosește subtitrări lizibile mari pentru cei fără sunet dat.",
        "Lansează dezbateri sau controverse elegante în comentarii pentru a crește discuțiile organice."
      ],
      example: "Un video simplu explicând 'cum s-a scumpit de fapt un suc în mall din cauza accizelor' adună sute de share-uri din cauza curiozității tinerilor.",
      question: "Care este cel mai determinant parametru pentru ca un video să devină viral pe TikTok?",
      options: [
        "Lungimea fizică de cel puțin 20 de minute a materialului.",
        "Timpul mediu de vizualizare (retenția) și rata de completare a videoclipului de către privitori.",
        "Rezoluția aparatului foto achiziționat exclusiv din importuri germane."
      ],
      correct: 1,
      explanation: "Dacă oamenii nu dau scroll instant și vizionează materialul tău până la final, algoritmul înțelege că e foarte util și îl livrează mai departe la mii de conturi."
    },
    {
      id: "m6",
      title: "Email Marketing de Gherilă",
      type: "Emailing",
      desc: "De ce o bază de e-mailuri colectată cinstit valorează o avere și cum trimiți newslettere bune.",
      intel: "Conturile de social media pot fi închise oricând, dar lista ta de e-mailuri este proprietatea personală neafectată de algoritmi externi.",
      bullets: [
        "Nu cumpăra liste de e-mail brute (este complet ilegal sub legea europeană GDPR).",
        "Oferă un stimulent util de descărcat gratuit (Lead Magnet) ca să stimulezi înscrierea.",
        "Scrie texte intime, scurte, prietenoase, evitând stilul rece corporatist de spam."
      ],
      example: "O listă de 500 de elevi pasionați de bursă primește săptămânal de la Travis analize succinte despre indicii BET, având o rată de deschidere de 60%.",
      question: "De ce este considerat Email Marketingul un canal excelent de promovare?",
      options: [
        "Deoarece trimiterea unui email implică taxe ANAF destul de restrictive.",
        "Este un canal de comunicare privat și direct cu audiența ta, complet independent de schimbările secrete de algoritmi de social media.",
        "Spamează mii de conturi necunoscute cu reclame stridente în fiecare noapte."
      ],
      correct: 1,
      explanation: "Interacțiunea directă din e-mail menține conversii mult mai sigure, audiența înscriindu-se benevol în lista ta."
    },
    {
      id: "m7",
      title: "Copywriting de Impact: Secrete",
      type: "Texte",
      desc: "Psihologia cuvintelor care determină deciziile de plată ale consumatorilor.",
      intel: "Un copywriting slab mizează pe laude. Unul excelent focalizează durerile clienților și prezintă transformarea fizică după utilizare.",
      bullets: [
        "Nu vinde facilitatea propriu-zisă; prezintă rezultatul final dorit (ex: nu vinde cursul, vinde siguranța financiară).",
        "Folosește verbe de acțiune și elimină cuvintele nefolositoare ce obosesc mintea.",
        "Integrează un sentiment subtil și real de raritate din timp (ex: doar 20 de locuri rămase)."
      ],
      example: "În loc de 'Suntem un soft bun de bookkeeping', folosește 'Aparatul care îți salvează 5 ore de birocrație în fiecare lună ca să te ocupi de vânzări reale.'"
      ,question: "Ce stă la baza unui Copywriting persuasiv eficient?",
      options: [
        "Laudarea excesivă a performanțelor fondatorului din trecut.",
        "Focalizarea exclusivă pe rezolvarea problemelor specifice ale cititorului și pe utilitatea transformării pe care o aduce produsul.",
        "Folosirea de fonturi colorate amestecat pe paginile web."
      ],
      correct: 1,
      explanation: "Oamenii sunt preocupați de propriile dileme. Dacă textul rezonează cu viața lor de zi cu zi, atenția și interesul lor de plată urcă imediat."
    },
    {
      id: "m8",
      title: "Marketing Afiliat: Realități",
      type: "Afiliere",
      desc: "Cum funcționează de fapt recomandările comisionate pe internet și cum să le integrezi.",
      intel: "Marketingul afiliat presupune promovarea produselor altora de pe piață în schimbul unui procent garantat din vânzarea finală generată.",
      bullets: [
        "Un partener afiliat primește un link unic cu cod de identificare (cookies stocate în browser).",
        "Nu recomanda junk; promovează doar servicii pe care le utilizezi personal și le consideri impecabile.",
        "Fii foarte deschis și declară transparent parteneriatele afiliate comunității tale."
      ],
      example: "Un pasionat de cărți financiare plasează linkuri afiliate de pe eMAG pe blogul său, strângând comisioane automat în cont la fiecare achiziție finalizată.",
      question: "Cum se realizează monetizarea în programul de Marketing Afiliat?",
      options: [
        "Primești o chirie fixă lunară indiferent dacă aduci sau nu asistență clienților.",
        "Ești comisionat cu un procent sau sumă fixă la finalizarea fiecărei vânzări venite prin linkul tău unic de recomandare.",
        "Prin manipularea cursului de schimb valutar interbancar."
      ],
      correct: 1,
      explanation: "Afilierea este un sistem de plată pur bazat pe performanță, fiind avantajos atât pentru emitenți cât și pentru micii recomandatori."
    },
    {
      id: "m9",
      title: "CPC vs CPM în Platforme Ads",
      type: "Metrici Ads",
      desc: "Înțelegerea modului în care ești taxat de platforme (Meta, TikTok, Google) în reclame.",
      intel: "Bugetele mari dispar rapid dacă nu înțelegi pe ce anume te taxează rețelele de publicitate digitală.",
      bullets: [
        "CPC (Cost per Click): Plătești exclusiv când un utilizator dă click fizic pe reclama ta de pe ecran.",
        "CPM (Cost per Mille): Ești taxat la fiecare 1.000 de afișări vizuale de reclamă, indiferent dacă se dau sau nu click-uri.",
        "Alege sistemul de CPC la început când vrei exclusiv trafic proaspăt pe pagină."
      ],
      example: "O campanie pe Facebook are un CPM de 15 lei și livrează reclama ta la 2.000 de tineri, colectând un total de 30 de lei din card.",
      question: "Ce înțelegem prin indicatorul denumit 'CPC'?",
      options: [
        "Costul fizic de cumpărare a calculatoarelor de marketing din birou.",
        "Costul pe Click (Cost per Click) - taxa luată de platformă doar când s-a realizat un click pe reclamă.",
        "Protecția consumatorului bancar garantată în județul respectiv."
      ],
      correct: 1,
      explanation: "CPC îți asigură că plătești exclusiv pentru vizitatorii care manifestă o minimă curiozitate vizitându-ți landing page-ul."
    },
    {
      id: "m10",
      title: "Analytics: Ghid de Pornire",
      type: "Date",
      desc: "Utilizarea instrumentelor ca Google Analytics pentru a monitoriza pașii vizitatorilor tăi.",
      intel: "Dacă nu măsori datele, acționezi ca un orb pe internet. Urmărește de unde vin oamenii și în ce pagini părăsesc siteul tău rapid.",
      bullets: [
        "Sursa de trafic: depistează dacă cel mai bun interes vine organic, din căutări sau din social media.",
        "Bounce Rate (Rata de respingere): procentul celor care închid pagina în primele secunde fără acțiune.",
        "Instalează codurile (Pixels / Google Tags) din prima zi ca să poți aduna statistici oneste utile vânzărilor."
      ],
      example: "Analytics îți arată că 80% din clienții tăi accesează serviciul de pe telefon mobil, motiv pentru care optimizezi imediat versiunea mobilă.",
      question: "Ce relevă o rată ridicată de tip 'Bounce Rate' pe site-ul tău?",
      options: [
        "Baza de resurse este supraîncărcată și a dat crash serverul.",
        "O mulțime de vizitatori părăsesc siteul tău rapid, fără să execute nicio interacțiune, indicând că propunerea ori designul nu e atrăgător.",
        "Precomenzile de vacanțe au fost asigurate cu succes."
      ],
      correct: 1,
      explanation: "Un bounce rate uriaș îți atrage atenția că fie plasezi reclame la persoane greșite, fie prima impresie grafică de pe site este respingătoare."
    }
  ],
  investing: [
    {
      id: "i4",
      title: "Acțiuni Individuale vs ETF-uri",
      type: "Educatie Bursa",
      desc: "Capcanele speculării pe acțiuni luate individual față de portofolii mari de indici bursieri.",
      intel: "Achiziția de acțiuni unice (ex: doar Apple sau doar Petrom) îți oferă oportunități de câștig mari dar te expune complet la falimentul lor izolat.",
      bullets: [
        "Eșecul managementului dintr-o singură firmă îți poate degrada drastic portofoliul dacă ai investit doar acolo.",
        "ETF-urile diluează acest prăbușire direct cumpărând sute de companii deodată.",
        "Păstrează 90% din bani pe indici la bursă și maxim 10% în acțiuni unice pe care le analizezi riguros."
      ],
      example: "Prăbușirea bruscă a unei bănci majore a lăsat mii de investitori unici pe zero, în timp ce posesorii de ETF au pierdut sub 0,1% din portofoliul global.",
      question: "De ce este considerată cumpărarea separată de acțiuni unice un efort asumat cu risc ridicat?",
      options: [
        "Sumele respective sunt însușite direct de stat în fiecare iarnă.",
        "Risc de corectare severă sau faliment al acelei corporații specifice (risc nesistematic), neatenuat de alte companii stabile.",
        "Bursele românești interzic deținerea de acțiuni în alt județ din țară."
      ],
      correct: 1,
      explanation: "Lipsa dispersiei riscului înmulțește drastic expunerea ta. Un index ETF atenuează eșecurile individuale prin succesele cumulate ale sutelor de giganți globali."
    },
    {
      id: "i5",
      title: "Titluri de Stat detaliat: Fidelis",
      type: "Risc Minim",
      desc: "Cum împrumuți bani Statului Român prin broker și încasezi dobânzi neimpozitabile.",
      intel: "Programele Fidelis și Tezaur permit cetățenilor să cumpere titluri sigure emise de Ministerul Finanțelor.",
      bullets: [
        "Dobânda la Fidelis este simbolic mai mare și cupoanele de bani se pot vinde direct pe bursa BVB în caz de nevoie.",
        "Principalul avantaj: zero impozit de reținut pe profit și zero obligații la pragurile CASS ANAF în România.",
        "Poți alege perioade la scadență de 1 an, 3 ani sau 5 ani atât în moneda Leu cât și în Euro."
      ],
      example: "O investiție de 10.000 de lei în titluri de stat Fidelis cu o dobândă anuală de 7% îți aduce garanția încasării perfecte a 700 de lei anual fără nicio declarație fiscală în plus.",
      question: "Care este un avantaj fiscal major al Fidelis în România?",
      options: [
        "Statul îți oferă locuri de parcare preferențiale în localitatea de domiciliu.",
        "Dobânzile încasate sunt complet neimpozitabile și nu participă la obligația de plată auto-declarată de asigurări sociale.",
        "Sumele se transformă automat în Euro la cel mai favorabil curs de pe piață."
      ],
      correct: 1,
      explanation: "Optimizarea fiscală completă oferită de titlurile de stat le transformă într-un instrument de neînlocuit pentru micii economisitori și începători."
    },
    {
      id: "i6",
      title: "Obligațiuni Corporative: Secrete",
      type: "Educatie Obligatiuni",
      desc: "Înțelegerea modului în care împrumuți companiile private în schimbul unor cupoane semestriale.",
      intel: "Obligațiunile sunt titluri de creanță. Cumperi o obligațiune emisă de o companie și devii creditorul ei pe o perioadă dată.",
      bullets: [
        "Cupoanele: dobânzile periodice plătite semestrial sau trimestrial în baza legii.",
        "Spre deosebire de stat, companiile private pot da faliment. Cu cât dobânda promisă e mai mare, cu atât riscul e mai alert.",
        "Analizează indicatorii de îndatorare ai holdingului înainte de a cumpăra obligațiunile emise."
      ],
      example: "Un dezvoltator imobiliar emite obligațiuni la 9% dobândă anuală pe 3 ani pentru a ridica blocuri noi. Dacă imobiliarele scad, firma poate intra în incapacitate de rambursare.",
      question: "Ce reprezintă o obligațiune corporativă pe bursa de capital?",
      options: [
        "O asigurare medicală obligatorie semnată cu o corporație străină.",
        "Un instrument prin care împrumuți o companie privată cu bani, deținând dreptul legal de a încasa cupoane de dobândă plus suma inițială la final.",
        "O penalizare aspră trimisă de fisc asociațiilor care au restanțe."
      ],
      correct: 1,
      explanation: "Obligațiunea oferă predictibilitate crescută a randamentului, dar cere o evaluare asumată a sănătății financiare a asociaților emitenți."
    },
    {
      id: "i7",
      title: "Criptoeducație vs Speculă",
      type: "Cripto",
      desc: "Ce este tehnologia Blockchain și cum distingem Bitcoin-ul stabil de schemele dubioase.",
      intel: "Criptomonedele folosesc registre digitale sigure descentralizate (Blockchain) pentru transfer instant global de active.",
      bullets: [
        "Bitcoin este pilonul principal (rezervă digitală descentralizată asumată cu cantitate limitată).",
        "Altcoins și jetoanele noi speculative au volatilități extreme și riscuri mari de lichidare ascunsă.",
        "Nu investi bani pe platforme cripto nereglementate de care nu a mai auzit nimeni."
      ],
      example: "Plata unor sume mari în jetoane noi lansate promite îmbogățire peste noapte, dar de cele mai multe ori finalul este o depreciere dramatică de 99%.",
      question: "Care este inovația tehnică principală adusă de tehnologia Blockchain?",
      options: [
        "Capacitatea de a dubla viteza calculatoarelor locale prin programe software.",
        "Un registru digital public, criptografat și complet descentralizat care permite transfer transparent de valoare fără intermediari de bănci.",
        "O rețea privată administrată de un singur director bancar în secret."
      ],
      correct: 1,
      explanation: "Blockchain evită necesitatea unui arbitru de încredere central, securitatea tranzacțiilor fiind întreținută colectiv de computerele din rețea."
    },
    {
      id: "i8",
      title: "Impozite pe Bursă & Declarația Unică",
      type: "Taxe și Legi",
      desc: "Cum se impozitează profiturile din acțiuni și dividende la ANAF în România în 2026.",
      intel: "Pentru profiturile realizate prin brokeri români (înregistrați ca rezidenți fiscali), impozitarea se reține la sursă automat, fiind extrem de simplu.",
      bullets: [
        "Impozit de 1%: Reținut la sursă pentru acțiunile deținute mai mult de 365 de zile.",
        "Impozit de 3%: Reținut la sursă pentru activele vândute rapid (sub 365 de zile de la cumpărare).",
        "Dividende: Sunt impozitate în prezent cu 8% în România, sumă reținută automat de companii înainte de plată."
      ],
      example: "Dacă vinzi acțiuni cu un profit net de 1.000 RON deținute de 2 ani, brokerul îți oprește automat 10 RON impozit și virează restul de 990 RON curat în cont.",
      question: "Cum se aplică impozitarea profitului pe acțiuni dacă folosești un broker rezident în România?",
      options: [
        "Trebuie să mergi personal lunar la sediul ANAF cu chitanțe tipărite.",
        "Impozitul se reține și se declară automat la sursă de către broker (1% sau 3%), fără să fii obligat să depui declarația doar pentru atât.",
        "Nu se plătește niciun impozit indiferent de sumă sau perioadă."
      ],
      correct: 1,
      explanation: "Brokerii autorizați din România se ocupă automat de reținerea la sursă, simplificând masiv viața fiscală a investitorilor tineri."
    },
    {
      id: "i9",
      title: "Evaluarea Companiilor: Multiplicatorul P/E",
      type: "Analiză Financiară",
      desc: "Cum îți dai seama dacă prețul unei acțiuni este ieftin sau scump folosind indicatorul Price-to-Earnings.",
      intel: "Indicatorul P/E (Price-to-Earnings) arată raportul dintre prețul de piață al unei acțiuni și profitul raportat pe acțiune de acea companie.",
      bullets: [
        "Un P/E de 10 înseamnă teoretic că îți recuperezi investiția în 10 ani dacă profitul firmei rămâne constant.",
        "P/E mai mic decât media sectorului poate semnala o acțiune subevaluată (ieftină).",
        "P/E foarte mare (ex: peste 50) de obicei arată că investitorii se așteaptă la o creștere masivă a profiturilor în viitor."
      ],
      example: "O companie are prețul acțiunii de 20 RON și profitul pe acțiune (EPS) de 2 RON, obținând un P/E de 10.",
      question: "Ce ne indică, în general, un indicator P/E (Price-to-Earnings) scăzut pentru o companie matură?",
      options: [
        "Compania respectivă are prea mulți angajați neproductivi.",
        "Acțiunea este potențial ieftină în raport cu profiturile sale actuale, oferind un randament teoretic bun pe termen lung.",
        "Compania se pregătește să își schimbe numele și domeniul de activitate."
      ],
      correct: 1,
      explanation: "Un P/E scăzut indică faptul că prețul plătit pentru fiecare unitate de profit este mic, însă trebuie analizat mereu alături de perspectivele de creștere ale firmei."
    },
    {
      id: "i10",
      title: " Tradeville & Primul Ordin de Cumpărare",
      type: "Ghid Practic",
      desc: "Cum arăta de fapt interfața unui broker și cum trimitem prima sumă pe bursă.",
      intel: "Pentru a tranzacționa pe Bursa de Valori București (BVB) sau internațional ai nevoie de un cont deschis la un broker autorizat de ASF (ex: Tradeville).",
      bullets: [
        "Alimentarea se face simplu prin transfer bancar gratuit din contul tău curent.",
        "Tipul de ordin 'Limita': decizi exact prețul maxim dornic de plată pe acțiune.",
        "Tipul 'La Piață': cumperi instantaneu la cele mai avantajoase cotații actuale de pe ecran."
      ],
      example: "Deschizi Tradeville, depozitezi 150 RON și plasezi un ordin de cumpărare tip Limita pe TVBETETF (indicele BET românesc), devenind oficial investitor activ.",
      question: "Care este diferența strategică dintre un ordin de cumpărare 'Limita' și unul 'La Piață'?",
      options: [
        "Ordinul Limita funcționează exclusiv după miezul nopții.",
        "Ordinul Limita execută tranzacția doar la prețul specificat de tine, în timp ce ordinul La Piață execută instant la prețurile stringente disponibile acum.",
        "Nu există nicio diferență tehnică, ambele retrag sume diferite aleatoriu."
      ],
      correct: 1,
      explanation: "Ordinul limită îți oferă un control total asumed pe prețul pe care ești dispus să-l verși în piața curentă pe active."
    }
  ],
  networking: [
    {
      id: "n4",
      title: "Cum adaugi Valoare unui Mentor",
      type: "Relationship Value",
      desc: "Secretul atragerii unui ghidaj valoros: sprijină proactiv proiectele sale fără să pretinzi recompense imediate.",
      intel: "Un mentor cu experiență are în general timp foarte puțin, dar multe idei și proiecte secundare blocate. Dacă îi oferi sprijin gratuit pe aceste aspecte, vei obține acces nelimitat la experiența lui.",
      bullets: [
        "Identifică o problemă minoră pe care o are (ex: design-ul unui slide sau formatarea unui text) și rezolvă-o înainte să i-o spui.",
        "Trimite-i un rezumat bun de idei cu resurse proaspete din domeniul lui de activitate.",
        "Arată pasiune și acțiune: cel mai bun mod de a mulțumi unui mentor este să aplici sfaturile lui și să îi arăți rezultatele practice obținute."
      ],
      example: "După o discuție cu un antreprenor, implementezi imediat feedback-ul lui pe landing page-ul tău și îi trimiți link-ul spunând: 'Am aplicat sfatul dumneavoastră! S-au înscris deja 5 utilizatori noi!'",
      question: "Care este cel mai rapid și onest mod de a menține un raport de mentorat de lungă durată?",
      options: [
        "Să nu îi trimiți niciun update până când nu ai nevoie din nou de alți bani de la el.",
        "Să aplici proactiv recomandările lui și să îi împărtășești sincer progresul tău pe baza acelor idei aplicate.",
        "Să îi verși mesaje zilnice pe telefon cu întrebări generale precum 'Ce mai faceți?'."
      ],
      correct: 1,
      explanation: "Mentorii își măsoară succesul prin evoluția practică a învățăceilor lor. Să vadă că sfaturile lor chiar sunt valorificate este cea mai mare recompensă."
    },
    {
      id: "n5",
      title: "Follow-up Inteligent și Politicos",
      type: "Outreach Strategy",
      desc: "Cum să urmărești progresul unei conversații LinkedIn fără să pari agasant, disperat sau iritant.",
      intel: "Oamenii de afaceri pot uita să răspundă la primul mesaj, nu din rea-credință, ci dintr-o agendă foarte plină. Un follow-up trimis la momentul oportun demonstrează determinare.",
      bullets: [
        "Așteaptă minim 3-5 zile lucrătoare înainte de a trimite un al doilea mesaj scurt.",
        "Fii cald și prietenos. Nu folosi reproșuri ('De ce nu mi-ați răspuns?') ori mesaje pasiv-agresive.",
        "Adaugă o mică noutate pozitivă în al doilea mesaj ('Săptămâna aceasta am validat prototipul cu 10 elevi și...')."
      ],
      example: "Trimiți un al doilea mesaj: 'Salutări [Nume], sper că aveți o săptămână productivă! Revin scurt de teamă să nu se fi pierdut mesajul meu anterior. Ne-ar fi de mare ajutor un simplu ghidaj pe ideea noastră, când programul vă va permite.'",
      question: "Cât timp este recomandat să aștepți înainte de a trimite un mesaj de follow-up pe LinkedIn?",
      options: [
        "Sub 4-6 ore dacă observi că este online pe platformă în acel moment.",
        "Minim 3-5 zile lucrătoare pentru a respecta spațiul personal și programul încărcat al interlocutorului.",
        "Nu se trimite niciodată follow-up; dacă nu a răspuns imediat, înseamnă că te urăște."
      ],
      correct: 1,
      explanation: "O fereastră de 3-5 zile oferă destul timp liber ca persoana să își gestioneze urgențele fără a simți presiunea unui mesaj ciclic de memento."
    },
    {
      id: "n6",
      title: "Pregătirea pentru primul 'Coffee Chat'",
      type: "Meeting Prep",
      desc: "Planificarea impecabilă a unei întâlniri scurte de 15 minute: de la structura discuției la întrebări de impact.",
      intel: "Dacă ai obținut acceptul pentru o întâlnire scurtă, pregătirea este secretul care face diferența. Aceasta reprezintă ocazia ta de a demonstra profesionalism timpuriu.",
      bullets: [
        "Cercetează temeinic activitatea invitatului: citește despre startup-ul lui, interviuri acordate sau postări recente.",
        "Pregătește o listă clară de maximum 3 întrebări punctuale specifice, nu generale.",
        "Controlează cu strictețe timpul: la minutul 14, spune: 'Am promis că vă răpesc doar 15 minute, așa că respect programul dumneavoastră'."
      ],
      example: "În loc să întrebi 'Cum se fac banii?', întrebi: 'Am văzut că în 2021 ați pivotat produsul de la B2C la B2B, ce criterii ați analizat în luarea deciziei?'.",
      question: "Cum ar trebui să controlezi timpul în cadrul unei coffee-chat programate pentru 15 minute?",
      options: [
        "Să continui să povestești despre viața ta timp de o oră chiar dacă interlocutorul tău se uită repetat la ceas.",
        "Să menționezi tu activ limita de timp stabilită spre finalul minutelor asumate, manifestând un respect imens pentru agenda sa.",
        "Să plângi sau să te lamentezi că nu ai primit destul ajutor din partea statului român."
      ],
      correct: 1,
      explanation: "Punctualitatea și autodisciplina timpului dovedesc că ești un adult serios, cu bune maniere de business, de încredere."
    },
    {
      id: "n7",
      title: "Evenimente de Business și Hackathoane",
      type: "In-Person Networking",
      desc: "Cum să maximizezi prezența ta fizică la competiții de startup-uri pentru tineri, evenimente OSC sau conferințe tech.",
      intel: "Socializarea față în față creează conexiuni de zeci de ori mai stabile și memorabile decât mesajele text. Hackathoanele și conferințele de antreprenoriat sunt locurile ideale pentru asta.",
      bullets: [
        "Nu petrece timpul doar cu grupul tău curent de prieteni. Fă-ți curaj și abordează oameni noi din alte echipe.",
        "Când te prezinți, utilizează formula Elevator Pitch în 30 de secunde (Cine ești + Ce problemă rezolvi + Ce cauți la eveniment).",
        "Păstrează legătura imediat: cere-le profilul de LinkedIn sau scanează codul tău QR direct din ecranul telefonului mobil."
      ],
      example: "La un Hackathon, mergi la standul juriului în pauză și spui: 'Salutare, sunt Mihai, facem o platformă educațională și am dori tare mult o scurtă părere despre cum arată schema noastră de monetizare'.",
      question: "Care este cel mai de preț mod de a menține conexiunea cu un contact valoros la un eveniment fizic?",
      options: [
        "Să îi furi pe furiș cartea de vizită din mapă fără să îi spui nimic.",
        "Să scanezi sau să adaugi pe loc conexiunea pe LinkedIn de pe telefonul tău mobil înainte de a încheia scurta conversație amicală.",
        "Să îi ceri direct numărul personal de acasă pentru apeluri în miez de noapte."
      ],
      correct: 1,
      explanation: "Scanarea instantă pe LinkedIn adaugă conexiunea imediat în agenda ta digitală profesională și te ajută să reiei dialogul de la birou de a doua zi."
    },
    {
      id: "n8",
      title: "Elevator Pitch: Povestea ta în 30 de Secunde",
      type: "Communication Skill",
      desc: "Cum să-ți expui misiunea și afacerea într-un mod succint, capabil să trezească instant curiozitatea oricărui investitor.",
      intel: "Investitorii și partenerii sunt adesea grăbiți. Să poți pitch-ui o idee pe durata unei scurte plimbări cu liftul ('Elevator Pitch') este una dintre cele mai necesare abilități de comunicare.",
      bullets: [
        "Hook (Cârligul): Pornește cu o statistică șocantă sau o întrebare din viața reală legată de durerea pe care o rezolvi.",
        "Soluția ta: Descrie clar și simplu produsul tău fără limbaj tehnologic deosebit ori exagerat.",
        "Cererea (Call to Action): Trage o linie clară despre ce anume dorești de la persoana din fața ta (ex: feedback, o recomandare, etc.)."
      ],
      example: "Hook: 'Știați că 90% din deșeurile din școli sunt aruncate greșit? Noi facem coșuri inteligente cu senzori care ajută elevii să recicleze corect, crescând rata cu 40%. Căutăm mentori pe zona de producție hardware.'",
      question: "Ce element NU ar trebui să facă parte dintr-un Elevator Pitch eficient de 30 de secunde?",
      options: [
        "Definirea precisă a problemei dureroase și descrierea facilă a soluției inovatoare.",
        "O solicitare specifică (Call to Action) adaptată momentului.",
        "Istoria completă a vieții tale și detalii matematice amănunțite despre codul din baza ta de date."
      ],
      correct: 2,
      explanation: "Mesajul trebuie să rămână curat, spumos și extrem de ușor de digerat. Detaliile masive plictisesc și distrug curiozitatea inițială."
    },
    {
      id: "n9",
      title: "Personal Branding: Scrie-ți parcursul online",
      type: "Personal Branding",
      desc: "Cum să utilizezi postările din rețelele profesionale ca pe un magnet care atrage oportunități automat din piață.",
      intel: "Nu trebuie să fii un expert consacrat pentru a scrie pe LinkedIn. Documentarea onestă a drumului tău ('Building in Public') inspiră ceilalți profesioniști și dă încredere partenerilor.",
      bullets: [
        "Scrie jurnale săptămânale: ce bug-uri ai rezolvat în aplicație, ce provocări ai avut în atragerea primilor clienți.",
        "Fii recunoscător: mulțumește-le celor care te-au ghidat sau recomandă o carte utilă citită în acea săptămână.",
        "Menține consistența: publică măcar o postare valoroasă la câteva zile pentru ca algoritmul și conexiunile tale să te rețină constant."
      ],
      example: "Postezi: 'Am avut 3 discuții grele cu profesori despre aplicația noastră de programare. Am învățat că profesorii nu vor mult cod complicat, ci vor un panou simplu în română. Iată ce modificări facem astăzi...'",
      question: "Care este pilonul central al conceptului de 'Building in Public' pe rețelele de afaceri?",
      options: [
        "Să postezi doar fotografii perfecte în care afișezi un succes fals sau bogății artificiale.",
        "Documentarea publică curajoasă și onestă a evoluției tale, a testelor realizate, dar și a greșelilor din care ai învățat activ.",
        "Să insulți alte startup-uri concurente pentru a strânge mai mulți fani."
      ],
      correct: 1,
      explanation: "Sinceritatea și auto-educarea documentată atrag un grad mare de empatie, respect tehnic și sprijin necondiționat de la oameni calificați în domeniu."
    },
    {
      id: "n10",
      title: "Cum trimiți un 'Investor Update' recurent",
      type: "Investor Relations",
      desc: "Păstrarea contactului periodic cu oamenii cheie: cum se scrie cel mai bun email lunar de informare a mentorilor și partenerilor.",
      intel: "Dacă un mentor sau investitor s-a arătat interesat de afacerea ta, menține-l informat periodic. Un email bun de actualizare trimis lunar demonstrează rigoare, responsabilitate și viteză de execuție.",
      bullets: [
        "Cele 3 secțiuni de aur: 'Ce am realizat' (Wins), 'Unde suntem blocați' (Challenges) și 'Cu ce ne puteți ajuta' (Asks).",
        "Fii extrem de cinstit și direct cu datele matematice și cifrele colectate: ascunderea eșecurilor distruge încrederea într-o clipă.",
        "Păstrează un format scurt, aerizat, cu elemente vizuale simple de tip liste."
      ],
      example: "Trimiți emailul: 'Bună [Nume], update-ul de mai pentru [Nume Startup] este gata. Luna aceasta: am urcat aplicația în magazinul Play Store, avem 50 de înscrieri active. Săptămâna viitoare încercăm să obținem feedback. O zi excelentă!'",
      question: "Care sunt cele trei rubrici fundamentale dintr-un raport periodic cinstit adresat partenerilor (Investor Update)?",
      options: [
        "Bârfe despre competiție, glume din presă și cereri mari de avans.",
        "Realizări recente, Provocări curente/Blocaje și Solicitări specifice de asistență.",
        "Planuri teoretice pe următorii 10 ani de zile fără nicio măsură curentă."
      ],
      correct: 1,
      explanation: "Acest format triplu oferă instant o imagine clară asupra vitezei de execuție și arată precis unde te pot sprijini proactiv partenerii."
    }
  ]
};

// Function to guarantee exactly 3 high-quality, contextual questions for each lesson node
function ensureThreeQuestions(node: LearningNode) {
  if (!node.questions) {
    node.questions = [];
  }
  
  // Question 1: Root question
  if (node.questions.length === 0) {
    node.questions.push({
      question: node.question,
      options: node.options,
      correct: node.correct,
      explanation: node.explanation
    });
  }
  
  const bullets = node.theory?.bullets || [
    "Focalizează-te pe execuție rapidă și pe rezolvarea nevoilor stringente ale pieței.",
    "Bazează-te pe date reale directe în loc de simple păreri sau speculații."
  ];
  const exampleText = node.theory?.example || "Orice mare idee de succes pornește de la teste simple cu bugete extrem de limitate.";
  const title = node.title || "Lecție practică";

  // Question 2: Deep-dive into technical rule or bullets
  if (node.questions.length < 2) {
    const mainBullet = bullets[0] || "Validează propunerea de valoare.";
    node.questions.push({
      question: `Care este o regulă esențială de reținut din capitolul „${title}”?`,
      options: [
        `${mainBullet}`,
        "Concentrarea pe planificare academică îndelungată timp de luni de zile fără a lansa nimic.",
        "Cheltuirea imediată a întregului capital strâns pe reclame nesustenabile din prima zi."
      ],
      correct: 0,
      explanation: `Corect! Recomandarea esențială din cadrul lecției subliniază importanța de a aplica direct: „${mainBullet}”`
    });
  }

  // Question 3: Focus on study cases / practical example
  if (node.questions.length < 3) {
    node.questions.push({
      question: `Analizând studiul de caz sau exemplul practic oferit în această secțiune (${exampleText.substring(0, 70)}...), ce concluzie business importantă putem desprinde?`,
      options: [
        "Planificarea teoretică rigidă pe termene de 5 ani este cu mult mai valoroasă decât feedbackul clienților.",
        "Designul ultra-complicat este singurul factor decizional pentru un cumpărător real.",
        "Lansarea timpurie a unui prototip de test aduce învățare practică de neatins prin simple presupuneri de birou."
      ],
      correct: 2,
      explanation: "Așa este! Experimentele mici de piață realizate din timp ne oferă date certe și elimină risipa de timp sau de bani."
    });
  }
}

// Programmatic expansion of nodes to 10 chapters for each course
export const branchesData: { [key: string]: Branch } = (() => {
  const result = { ...baseBranches };
  Object.keys(result).forEach((key) => {
    const list = result[key].nodes;
    const template = extraChaptersTemplate[key];
    if (template) {
      template.forEach((item) => {
        const hydratedNode: LearningNode = {
          id: item.id,
          title: item.title,
          type: item.type,
          xp: 25,
          desc: item.desc,
          theory: {
            intel: item.intel,
            bullets: item.bullets,
            example: item.example
          },
          question: item.question,
          options: item.options,
          correct: item.correct,
          explanation: item.explanation,
          questions: [
            {
              question: item.question,
              options: item.options,
              correct: item.correct,
              explanation: item.explanation
            }
          ]
        };
        list.push(hydratedNode);
      });
    }
    
    // Now guarantee exactly 3 questions for ALL nodes of ALL branches
    list.forEach((node) => {
      ensureThreeQuestions(node);
    });
  });
  return result;
})();

export const articlesData: Article[] = [
  {
    category: "Finanțe & Taxe",
    title: "Cum îți declari legal primii bani ca liber profesionist / PFA la ANAF în 2026",
    readTime: "6 min",
    excerpt: "Înțelege normele de venit, plafoanele pentru asigurări sociale (CASS) și cum să emiți facturi curate fără să fii copleșit de hățișul birocratic de stat din România.",
    content: "În anul 2026, legislația din România pentru liber-profesioniști și Persoanele Fizice Autorizate (PFA) a suferit modificări importante în ceea ce privește plafoanele de calcul pentru asigurările naționale de sănătate (CASS) și pensie (CAS).\n\n**Ce opțiuni ai ca freelancer român?**\n1. **PFA pe Sistem Real**: Taxat la venitul net (venituri brute minus cheltuieli deductibile). Impozitul pe venit rămâne de 10%.\n2. **PFA cu Normă de Venit**: Dacă codul tău CAEN este acceptat și venitul tău nu depășește plafonul anual de 25.000 EUR, vei plăti taxe raportate la norma locală fixă stabilită de primărie, indiferent de cât câștigi în mod real.\n\n**What to do now?**\n- Înregistrează-te în **Spațiul Privat Virtual (SPV)** la ANAF pentru a depune Declarația Unică.\n- Emite facturi prin softuri autorizate RO e-Factura.\n- Plătește CASS la plafoanele stabilite: 6, 12 sau 24 de salarii minime brute pe țară.",
    source: "ANAF / Codul Fiscal Român"
  },
  {
    category: "Investiții",
    title: "Ghid Safe: Cum îți deschizi un cont Tradeville și cum investești în indicele BET",
    readTime: "8 min",
    excerpt: "Ghid pas cu pas pentru elevi și studenți. Cum funcționează alimentarea contului, ce comisioane există și cum să cumperi automatizat bucăți din cele mai profitabile companii românești.",
    content: "Dacă vrei să devii proprietar parțial în giganți ca Banca Transilvania, OMV Petrom sau Hidroelectrica, cel mai simplu mod este să investești în indicele BET al Bursei de Valori București (BVB) prin intermediul unui broker autorizat de ASF.\n\n**Ghidul Pas cu Pas:**\n1. **Înregistrarea Digitală**: Vizitează site-ul Tradeville. Vei avea nevoie de Cartea de Identitate.\n2. **Cont special pentru Elevi**: Comisioane extrem de reduse speciale pentru tineri.\n3. **Identificarea în Indicele BET**: Investiții prin intermediul ETF-ului administrat de Patria (TVBETETF).\n4. **Alimentarea Periodic-Automata**: Setează-și o sumă fixă lunar (ex: 100 RON) pentru efectul compounding.",
    source: "Tradeville Ghid / Bursa de Valori București"
  },
  {
    category: "Startups",
    title: "Cum se aplică corect 'The Mom Test' pe piața de business din România",
    readTime: "5 min",
    excerpt: "De ce antreprenorii locali primesc feedback fals pozitiv de la cunoscuți și cum să pui întrebări strategice românilor pentru a afla dacă vor plăti cu adevărat.",
    content: "Pe piața din România există o cultură puternică a sprijinului prin complimente superficiale: 'E super tare ideea ta, te susțin!'.\n\n**Regulile Mom Test în România:**\n- **Nu îți prezenta ideea**: Dacă le spui oamenilor ce vrei să construiești, ei își vor ajusta răspunsurile ca să fie politicoși.\n- **Discută despre trecut**: Întreabă cum au rezolvat problema ieri sau acum o săptămână.\n- **Măsoară angajamentul**: Cere o barieră de interes concretă (ex: precomandă cu avans sau colectare de preferințe de utilizare).",
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
    content: "Dacă începi să ai încasări recurente de la clienți, trebuie să fii legal. În România, cele mai comune structuri sunt PFA-ul (Persoană Fizică Autorizată) și SRL-ul (Societate cu Răspundere Limitată).\n\n**Când alegi PFA?**\n- Ideal pentru freelanceri singuri (copywriteri, designeri) cu costuri de operare extrem de mici.\n- Contabilitate simplificată (o poți face singur prin platforme digitale).\n- Poți scoate banii din cont oricând dorești.\n\n**Când alegi SRL?**\n- Vrei să colaborezi cu investitori (SRL-ul permite împărțirea de părți sociale).\n- Vrei să ai angajați și să scalezi afacerea.\n- Răspunderea este strict limitată la capitalul social al firmei, protejându-ți averea personală.",
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

const duplicateArticlesData = [
  {
    category: "Finanțe & Taxe",
    title: "Cum îți declari legal primii bani ca liber profesionist / PFA la ANAF în 2026",
    readTime: "6 min",
    excerpt: "Înțelege normele de venit, plafoanele pentru asigurări sociale (CASS) și cum să emiți facturi curate fără să fii copleșit de hățișul birocratic de stat din România.",
    content: "În anul 2026, legislația din România pentru liber-profesioniști și Persoanele Fizice Autorizate (PFA) a suferit modificări importante în ceea ce privește plafoanele de calcul pentru asigurările naționale de sănătate (CASS) și pensie (CAS).\n\n**Ce opțiuni ai ca freelancer român?**\n1. **PFA pe Sistem Real**: Taxat la venitul net (venituri brute minus cheltuieli deductibile). Impozitul pe venit rămâne de 10%.\n2. **PFA cu Normă de Venit**: Dacă codul tău CAEN este acceptat și venitul tău nu depășește plafonul anual de 25.000 EUR, vei plăti taxe raportate la norma locală fixă stabilită de primărie, indiferent de cât câștigi în mod real.\n\n**What to do now?**\n- Înregistrează-te în **Spațiul Privat Virtual (SPV)** la ANAF pentru a depune Declarația Unică.\n- Emite facturi prin softuri autorizate RO e-Factura.\n- Plătește CASS la plafoanele stabilite: 6, 12 sau 24 de salarii minime brute pe țară."
  },
  {
    category: "Investiții",
    title: "Ghid Safe: Cum îți deschizi un cont Tradeville și cum investești în indicele BET",
    readTime: "8 min",
    excerpt: "Ghid pas cu pas pentru elevi și studenți. Cum funcționează alimentarea contului, ce comisioane există și cum să cumperi automatizat bucăți din cele mai profitabile companii românești.",
    content: "Dacă vrei să devii proprietar parțial în giganți ca Banca Transilvania, OMV Petrom sau Hidroelectrica, cel mai simplu mod este să investești în indicele BET al Bursei de Valori București (BVB) prin intermediul unui broker autorizat de ASF.\n\n**Ghidul Pas cu Pas:**\n1. **Înregistrarea Digitală**: Vizitează site-ul Tradeville. Vei avea nevoie de Cartea de Identitate.\n2. **Cont special pentru Elevi**: Comisioane extrem de reduse speciale pentru tineri.\n3. **Identificarea în Indicele BET**: Investiții prin intermediul ETF-ului administrat de Patria (TVBETETF).\n4. **Alimentarea Periodic-Automata**: Setează-ți o sumă fixă lunar (ex: 100 RON) pentru efectul compounding."
  },
  {
    category: "Startups",
    title: "Cum se aplică corect 'The Mom Test' pe piața de business din România",
    readTime: "5 min",
    excerpt: "De ce antreprenorii locali primesc feedback fals pozitiv de la cunoscuți și cum să pui întrebări strategice românilor pentru a afla dacă vor plăti cu adevărat.",
    content: "Pe piața din România există o cultură puternică a sprijinului prin complimente superficiale: 'E super tare ideea ta, te susțin!'.\n\n**Regulile Mom Test în România:**\n- **Nu îți prezenta ideea**: Dacă le spui oamenilor ce vrei să construiești, ei își vor ajusta răspunsurile ca să fie politicoși.\n- **Discută despre trecut**: Întreabă cum au rezolvat problema ieri sau acum o săptămână.\n- **Măsoară angajamentul**: Cere o barieră de interes concretă (ex: precomandă cu avans sau colectare de preferințe de utilizare)."
  }
];
