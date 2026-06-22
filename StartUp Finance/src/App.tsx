/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { 
  Award, 
  BookOpen, 
  Flame, 
  Gem,
  Lock, 
  Map,
  LineChart,
  Info,
  Unlock,
  ArrowRight, 
  Zap, 
  Play, 
  Home,
  GraduationCap, 
  CheckCircle, 
  Search, 
  Rocket, 
  TrendingUp, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Check, 
  X, 
  Trophy,
  Copy,
  Share2,
  AlertCircle, 
  Users, 
  MessageSquare, 
  ChevronRight, 
  HelpCircle,
  Lightbulb,
  ArrowUpRight,
  User,
  Mail,
  LockKeyhole,
  CheckCircle2,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  Send,
  Calendar,
  School,
  Heart,
  Cookie,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { branchesData, articlesData } from './data';
import { LearningNode, Article, UserProfile } from './types';
import { AnimatedCountUp } from './components/AnimatedCountUp';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc,
  collection,
  addDoc,
  deleteDoc
} from 'firebase/firestore';

// Preset default avatars for accounts
export const DEFAULT_AVATARS = [
  { id: 'avatar_gold_briefcase', emoji: '💼', name: 'Antreprenor de Aur', bg: 'from-amber-400 to-yellow-650 text-white' },
  { id: 'avatar_green_rocket', emoji: '🚀', name: 'Lansare StartUp', bg: 'from-emerald-400 to-teal-650 text-white' },
  { id: 'avatar_amber_lightning', emoji: '⚡', name: 'Inovator Tech', bg: 'from-amber-500 to-orange-650 text-white' },
  { id: 'avatar_purple_unicorn', emoji: '🦄', name: 'Unicorn de Afaceri', bg: 'from-purple-500 to-indigo-650 text-white' },
  { id: 'avatar_blue_peak', emoji: '🏔️', name: 'Vizionar Independent', bg: 'from-blue-400 to-cyan-650 text-white' },
  { id: 'avatar_pink_chart', emoji: '📈', name: 'Growth Hacker', bg: 'from-pink-500 to-rose-650 text-white' },
];

// Helper to generate a unique random account code
export function generateAccountCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'SF-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Reusable profile photo / avatar renderer
export function renderProfilePhoto(photoUrl: string | undefined, initials: string, sizeClass: string = "w-10 h-10", zoomVal?: number) {
  const matchingPreset = DEFAULT_AVATARS.find(av => av.id === photoUrl);
  const zoomScale = zoomVal ? zoomVal / 100 : 1.0;
  
  if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('data:'))) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden border-2 border-[#10B981] shadow-sm shrink-0 flex items-center justify-center bg-[#151D2F] relative`}>
        <img 
          src={photoUrl} 
          alt="Profile" 
          referrerPolicy="no-referrer"
          style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center' }}
          className="w-full h-full object-cover transition-transform duration-100"
          onError={(e) => {
            // If image fails to load, draw placeholder initials
            const parent = (e.target as HTMLElement).parentElement;
            if (parent) {
              parent.innerHTML = `<span class="font-extrabold text-sm text-white">${initials.slice(0, 2).toUpperCase()}</span>`;
            }
          }}
        />
      </div>
    );
  }
  
  if (matchingPreset) {
    return (
      <div className={`${sizeClass} rounded-2xl bg-gradient-to-tr ${matchingPreset.bg} flex items-center justify-center text-lg select-none border border-[#10B981]/30 shadow-sm shrink-0 font-sans overflow-hidden`}>
        <span style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center', display: 'inline-block' }} className="transition-transform duration-100">
          {matchingPreset.emoji}
        </span>
      </div>
    );
  }
  
  return (
    <div className={`${sizeClass} rounded-2xl bg-gradient-to-tr from-[#10B981] to-teal-400 text-black font-extrabold flex items-center justify-center text-sm tracking-tighter select-none border border-[#10B981]/40 shadow-sm shrink-0 overflow-hidden`}>
      <span style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center', display: 'inline-block' }} className="transition-transform duration-100">
        {initials.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}

// Client-side image compression and resizing module using HTML5 Canvas
export const INITIAL_STOCK_DATA: Record<string, { name: string; price: number; currency: 'USD' | 'RON' | 'EUR'; type: 'BVB' | 'US' | 'EU'; history: number[] }> = {
  TLV: { name: "Banca Transilvania (BVB)", price: 28.5, currency: 'RON', type: 'BVB', history: [26.2, 27.0, 27.4, 28.1, 27.9, 28.5] },
  SNP: { name: "OMV Petrom (BVB)", price: 0.74, currency: 'RON', type: 'BVB', history: [0.70, 0.71, 0.73, 0.75, 0.72, 0.74] },
  H2O: { name: "Hidroelectrica (BVB)", price: 124.0, currency: 'RON', type: 'BVB', history: [118.0, 120.5, 121.0, 122.5, 123.8, 124.0] },
  AAPL: { name: "Apple Inc. (US)", price: 185.0, currency: 'USD', type: 'US', history: [178.0, 180.2, 182.1, 184.0, 183.5, 185.0] },
  TSLA: { name: "Tesla Inc. (US)", price: 178.5, currency: 'USD', type: 'US', history: [195.0, 190.0, 182.0, 175.5, 181.0, 178.5] },
  NVDA: { name: "Nvidia Corp. (US)", price: 875.0, currency: 'USD', type: 'US', history: [820.0, 840.0, 835.0, 850.0, 868.0, 875.0] },
  ASML: { name: "ASML Holding (EU)", price: 920.0, currency: 'EUR', type: 'EU', history: [890.0, 905.0, 900.0, 912.0, 915.0, 920.0] },
  MC: { name: "LVMH Group (EU)", price: 780.0, currency: 'EUR', type: 'EU', history: [805.0, 795.0, 788.0, 782.0, 785.0, 780.0] }
};

export const compressAndResizeImage = (
  base64Str: string,
  maxWidth = 256,
  maxHeight = 256,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions preserving aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw white backup background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

// Helper to calculate Bucharest Date and Time details
export const getBucharestDateStr = () => {
  const roTimeStr = new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" });
  const roTime = new Date(roTimeStr);
  const year = roTime.getFullYear();
  const month = String(roTime.getMonth() + 1).padStart(2, '0');
  const day = String(roTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getBucharestWeekday = () => {
  const roTimeStr = new Date().toLocaleString("en-US", { timeZone: "Europe/Bucharest" });
  return new Date(roTimeStr).getDay(); // 0-6 (Sunday-Saturday)
};

export const dailyDilemmas = [
  {
    day: 0, // Duminică
    title: "Dilemă Duminică: Evaluarea Clienților",
    question: "Aplică „The Mom Test” de Rob Fitzpatrick. Un client spune că ideea ta de startup e „absolut fantastică”. Ce răspuns reprezintă validare reală?",
    optionA: "A) Îi mulțumești bucuros și întrebi: „Ai încheia un parteneriat pe 12 luni când ieșim din beta?”",
    optionB: "B) Îl întrebi cum își rezolvă în prezent problema respectivă și ce unelte a cumpărat deja ieri.",
    correctOption: 1, // B
    explanation: "Perfect! Fitzpatrick te sfătuiește să nu ceri păreri pe ideea ta, ci să cercetezi comportamentul și istoricul de plată obiectiv în trecut.",
    tip: "Opiniile viitoare ipotetice sunt slabe. Oamenii mint ca să fie politicoși, dar acțiunile trecute nu mint niciodată de regulă. Recomandarea este B."
  },
  {
    day: 1, // Luni
    title: "Dilemă Luni: SRL sau PFA pentru prima afacere?",
    question: "Ești un designer liber-profesionist de 17 ani. Ai primele încasări recurente de la un studio din Cluj. Vrei contabilitate cât mai simplă și acces direct la bani. Ce alegi?",
    optionA: "A) Un SRL cu asociat unic, profitul urmând să fie scos sub formă de dividende trimestriale.",
    optionB: "B) PFA în sistem real (sau normă), pentru că poți folosi banii direct din contul de business și contabilitatea e redusă.",
    correctOption: 1, // B
    explanation: "Corect! Pentru tinerii liber-profesioniști cu minime cheltuieli de operare, un PFA oferă acces instantaneu la încasări fără declarări complexe de dividende și proceduri rigide.",
    tip: "SRL-ul este perfect când vrei asociați sau investitori, dar PFA-ul e imbatabil pentru freelancing curat d.p.d.v administrativ."
  },
  {
    day: 2, // Marți
    title: "Dilemă Marți: Dobânda Compusă pe Termen Lung",
    question: "Ai 100 RON de economisit lunar. Care abordare îți va genera cel mai mare randament datorită dobânzii compuse pe o durată de 10 ani?",
    optionA: "A) Un depozit clasic la termen cu dobândă fixă garantată de 6% pe an la o mare bancă din România.",
    optionB: "B) Un ETF pasiv (cum ar fi TVBETETF) care urmărește indicele BET al Bursei de Valori București, reinvestind dividendele automat.",
    correctOption: 1, // B
    explanation: "Excelent! Din punct de vedere istoric, indicii bursieri depășesc considerabil dobânzile bancare, iar reinvestirea dividendelor declanșează forța dobânzii compuse exponențiale.",
    tip: "Depozitele sunt bune pentru fondul de urgență pe termen scurt (1-6 luni), dar pentru perioade lungi (ani/decenii) bursa este un vehicul superior de multiplicare."
  },
  {
    day: 3, // Miercuri
    title: "Dilemă Miercuri: Marketing cu Buget Zero",
    question: "Lansezi un side-hustle de haine recondiționate și ai un buget de marketing de 0 RON. Unde ar trebui să-ți concentrezi eforturile în primele 14 zile?",
    optionA: "A) Să rulezi reclame cu credit oferit gratuit la deschiderea unui cont nou pe Google Ads.",
    optionB: "B) Să creezi 2-3 clipuri pe zi pe TikTok și Reels demonstrând procesul real/cinstit de selecție și design (UGC).",
    correctOption: 1, // B
    explanation: "Exact! Conținutul organic (User-Generated Content - UGC) pe TikTok/Shorts aduce vizibilitate uriașă fără niciun ban plătit celor de la Facebook/Google.",
    tip: "Reclamele plătite cer un flux validat de clienți. Conținutul organic autentic construiește comunitate sinceră de la zero."
  },
  {
    day: 4, // Joi
    title: "Dilemă Joi: Distribuirea Profitului - 50/30/20",
    question: "Tocmai ai încasat 1000 RON din primul tău proiect de copywriting. Cum ar fi cel mai chibzuit și sustenabil mod de a repartiza această sumă conform regulii 50/30/20?",
    optionA: "A) 500 RON pentru necesități/laptop/cursuri, 300 RON pentru dorințe/ieșit cu colegii, 200 RON puși la bursa sau cont de economii.",
    optionB: "B) 800 RON de reinvestit direct în echipamente și reclame noi, păstrând doar 200 RON pentru cheltuieli și recompense personale.",
    correctOption: 0, // A
    explanation: "Absolut! Regula de aur 50/30/20 aduce echilibru pe termen lung: îți susține activele de învățare, îți onorează stilul de viață și îți clădește independența.",
    tip: "Marele secret este constanța. Să fii obsedat doar de reinvestire te poate duce la burnout, iar să cheltui totul te ține vulnerabil."
  },
  {
    day: 5, // Vineri
    title: "Dilemă Vineri: Angel Partners vs. Bootstrapping",
    question: "Ideea ta de platformă web pentru elevi e la nivel de desen pe hârtie. Un investitor local îți oferă 15.000 EUR pentru 40% din startup-ul tău. Ce faci?",
    optionA: "A) Accepți bucuros! Banii îți permit să contractezi o agenție profesionistă de developeri din Cluj ca să scrie codul rapid.",
    optionB: "B) Refuzi politicos. Construiești un MVP simplu No-Code ca să demonstrezi tracțiune înainte de a ceda o treime uriașă din controlul viitor.",
    correctOption: 1, // B
    explanation: "Perfect! Să vinzi 40% din companie la nivel de idee te lasă cu puține pârghii de control. Validează întâi cu efort minim (Bootstrapping).",
    tip: "Capitalul Angel este util când au un produs în piață care are nevoie de benzină pentru accelerare, nu în faza în care doar desenezi pe șervețele."
  },
  {
    day: 6, // Sâmbătă
    title: "Dilemă Sâmbătă: Management în Criză de Clienți",
    question: "Ai lansat un magazin online de accesorii pentru gaming de o lună, dar ai zero vizitatori. Ai 300 RON rămași pentru a remedia situația. Ce decizie iei?",
    optionA: "A) Colaborezi cu 2-3 micro-influenceri locali pasionați de gaming, oferindu-le un mic cod de reducere de 15% pentru fanii lor și produse bonus.",
    optionB: "B) Angajezi un freelancer ieftin de pe Fiverr care promite să aducă '10.000 de vizitatori robotici/boți' pe magazinul tău într-o săptămână.",
    correctOption: 0, // A
    explanation: "Exact! Traficul robotic artificial nu cumpără niciodată componente reale. Micro-influencerii au încrederea sinceră a publicului lor de nișă.",
    tip: "Calitatea vizitelor este mult mai importantă decât numărul afișat în panou. Investește în parteneri nișați și fani reali."
  }
];

export default function App() {
  // State machine requirements
  const [activePage, setActivePage] = useState<'home' | 'invatare' | 'articole' | 'evenimente' | 'auth' | 'termeni' | 'politica' | 'despre' | 'club' | 'account'>('home');
  const [loggedInEmail, setLoggedInEmail] = useState<string>(() => {
    return localStorage.getItem('sf_logged_in_email') || "";
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('sf_logged_in');
    return saved === 'true';
  });
  const [isProfileLoadedFromServer, setIsProfileLoadedFromServer] = useState<boolean>(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('sf_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('sf_theme', theme);
    const body = document.body;
    if (theme === 'light') {
      body.classList.add('light-mode');
    } else {
      body.classList.remove('light-mode');
    }
  }, [theme]);

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setArticles(data);
        }
      })
      .catch(err => console.error("Eroare la încarcarea inițială a articolelor:", err));
  }, []);

  // Listen to Firebase Authentication state changes and sync profile from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const email = firebaseUser.email || "";
        setLoggedInEmail(email);
        setIsLoggedIn(true);

        // Fetch userProfile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            let updated = false;
            if (!data.accountCode) {
              data.accountCode = generateAccountCode();
              updated = true;
            }
            if (!data.profilePhotoUrl) {
              data.profilePhotoUrl = "avatar_green_rocket";
              updated = true;
            }
            if (updated) {
              setDoc(userDocRef, data, { merge: true }).catch(err => console.warn("Eroare migrare profil date:", err));
            }
            console.log("Sincronizare cu Firestore finalizata pentru:", email, data.xp, "XP");
            setUserProfile(data);
          } else {
            // Profile does not exist yet. Write the current userProfile (to preserve progress if they earned XP before registering!)
            setUserProfile(prevProfile => {
              const baseProfile = {
                name: firebaseUser.displayName || prevProfile.name || email.split('@')[0] || "Elev Ambițios",
                xp: prevProfile.xp ?? 0,
                streak: prevProfile.streak ?? 1,
                completedNodes: prevProfile.completedNodes ?? [],
                lastLoginDate: prevProfile.lastLoginDate || new Date().toISOString().split('T')[0],
                unlockedItems: prevProfile.unlockedItems ?? [],
                dailyQuests: prevProfile.dailyQuests ?? null,
                accountCode: prevProfile.accountCode || generateAccountCode(),
                profilePhotoUrl: prevProfile.profilePhotoUrl || "avatar_green_rocket"
              };
              setDoc(userDocRef, baseProfile)
                .then(() => console.log("Profil nou creat în Firestore cu succes."))
                .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`));
              return baseProfile;
            });
          }
          setIsProfileLoadedFromServer(true);
        } catch (err: any) {
          console.warn("Eroare la preluarea profilului din Firestore (se continuă în mod offline/local):", err?.message || err);
          setIsProfileLoadedFromServer(true); // Proceed anyway as fallback
        }
      } else {
        // Logged out or session expired
        setIsProfileLoadedFromServer(true);
      }
    });

    return () => unsubscribe();
  }, []);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('sf_user_profile');
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (e) {
        // Fallback
      }
    }
    return {
      name: "Vizitator",
      xp: 0,
      streak: 0,
      completedNodes: [],
      accountCode: "SF-VISITOR",
      profilePhotoUrl: "avatar_green_rocket"
    };
  });

  const [activeModalNode, setActiveModalNode] = useState<LearningNode | null>(null);
  const [modalStep, setModalStep] = useState<'theory' | 'quiz'>('theory');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [quizFeedback, setQuizFeedback] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: "" });
  const [checkedTheoryBullets, setCheckedTheoryBullets] = useState<boolean[]>([]);

  const [articles, setArticles] = useState<Article[]>(articlesData);
  const [articleFilter, setArticleFilter] = useState<string>("Toate");
  const [articleSearchQuery, setArticleSearchQuery] = useState<string>("");
  const [activeArticleReader, setActiveArticleReader] = useState<Article | null>(null);

  // Authentication inputs state
  const [authForm, setAuthForm] = useState({
    name: "Alexandru",
    email: "",
    password: ""
  });
  const [authError, setAuthError] = useState<string>("");

  // Google Forms Integration & Modal States
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);
  const [showQuizCelebration, setShowQuizCelebration] = useState<{ nodeTitle: string; xpEarned: number } | null>(null);

  // Stable memoized confetti configuration triggered on quiz feedback success celebration
  const confettiParticles = useMemo(() => {
    if (!showQuizCelebration) return [];
    return Array.from({ length: 65 }).map((_, i) => {
      const isCircle = i % 3 === 0;
      const isTriangle = i % 3 === 1;
      const size = Math.random() * 8 + 6; // 6px to 14px
      const colors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#06B6D4", "#10B981", "#059669"];
      const color = colors[i % colors.length];
      return {
        id: i,
        color,
        size,
        isCircle,
        isTriangle,
        initialX: Math.random() * 100,
        delay: Math.random() * 2.2,
        duration: Math.random() * 2.5 + 2.8, // 2.8s to 5.3s
        xOffset: Math.random() * 160 - 80,
        rotateDirection: Math.random() > 0.5 ? 360 : -360
      };
    });
  }, [showQuizCelebration]);
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string>("");
  const [tempPhotoZoom, setTempPhotoZoom] = useState<number>(100);
  const [formModalType, setFormModalType] = useState<'school' | 'support'>('school');
  const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // School Form values
  const [schoolForm, setSchoolForm] = useState({
    email: "",
    age: "",
    clasa: "",
    institutie: ""
  });

  // Support Form values
  const [supportForm, setSupportForm] = useState({
    email: "",
    description: ""
  });

  // Google Single Sign-On simulation states
  const [showGoogleAuthSim, setShowGoogleAuthSim] = useState<boolean>(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState<string>("");
  const [googleCustomName, setGoogleCustomName] = useState<string>("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Mobile navigation drawer state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // FAQ accordion states
  const [isFaqSectionExpanded, setIsFaqSectionExpanded] = useState<boolean>(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Cookie Consent state
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(() => {
    return localStorage.getItem('cookies-consent') === null;
  });

  // XP Club specific states & sub-apps
  const [activeClubTab, setActiveClubTab] = useState<'quests' | 'leaderboard' | 'shop'>('quests');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);

  // States for the interactive daily business dilemma scenario
  const [dailyScenarioAnswered, setDailyScenarioAnswered] = useState<boolean>(() => {
    return localStorage.getItem('sf_daily_scenario_answered') === 'true';
  });
  const [selectedScenarioOption, setSelectedScenarioOption] = useState<number | null>(() => {
    const saved = localStorage.getItem('sf_daily_scenario_selected');
    return saved ? parseInt(saved, 10) : null;
  });

  const fetchLeaderboard = (quiet: boolean = false) => {
    if (!quiet) {
      setIsLeaderboardLoading(true);
    }
    const url = `/api/leaderboard?name=${encodeURIComponent(userProfile.name)}&xp=${userProfile.xp}&streak=${userProfile.streak || 1}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeaderboard(data);
        }
      })
      .catch(err => {
        console.error("Eroare la incarcarea clasamentului din backend:", err);
      })
      .finally(() => {
        if (!quiet) {
          setIsLeaderboardLoading(false);
        }
      });
  };

  // Synchronize state with real-time backend leaderboard silently whenever userProfile changes and user is logged in
  useEffect(() => {
    if (isLoggedIn && userProfile.name && userProfile.name !== "Vizitator") {
      const url = `/api/leaderboard?name=${encodeURIComponent(userProfile.name)}&xp=${userProfile.xp}&streak=${userProfile.streak || 1}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setLeaderboard(data);
          }
        })
        .catch(err => console.warn("Eroare la sincronizarea silentioasa:", err));
    }
  }, [isLoggedIn, userProfile.name, userProfile.xp, userProfile.streak]);

  // Periodic polling for multiplayer feeling when on the leaderboard view page
  useEffect(() => {
    if (activePage === 'club' && activeClubTab === 'leaderboard') {
      fetchLeaderboard(false);
      const interval = setInterval(() => {
        fetchLeaderboard(true);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [activePage, activeClubTab]);

  const [openedPremiumResource, setOpenedPremiumResource] = useState<string | null>(null);
  const [shopItemToUnlock, setShopItemToUnlock] = useState<{ id: string; title: string; cost: number; badge: string } | null>(null);
  const [pfaGuideStep, setPfaGuideStep] = useState<number>(1);
  const [onePagePlan, setOnePagePlan] = useState<{ prob: string; prop: string; can: string; prom: string; cost: string }>(() => {
    try {
      const saved = localStorage.getItem("sf_premium_onepageplan");
      return saved ? JSON.parse(saved) : { prob: "", prop: "", can: "", prom: "", cost: "" };
    } catch {
      return { prob: "", prop: "", can: "", prom: "", cost: "" };
    }
  });
  const [validationInput, setValidationInput] = useState("");
  const [validationFeedback, setValidationFeedback] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'success' | 'warn' | null>(null);

  // Interactive Brokerage Demo Platform / Investment Simulator States
  const [invatareTab, setInvatareTab] = useState<'harta' | 'broker'>('harta');
  const [showInvestmentUnlockCelebration, setShowInvestmentUnlockCelebration] = useState<boolean>(false);
  const [brokerBalanceUsd, setBrokerBalanceUsd] = useState<number>(() => {
    const saved = localStorage.getItem('sf_broker_balance_usd');
    return saved ? parseFloat(saved) : 10000;
  });
  const [brokerBalanceRon, setBrokerBalanceRon] = useState<number>(() => {
    const saved = localStorage.getItem('sf_broker_balance_ron');
    return saved ? parseFloat(saved) : 50000;
  });
  const [brokerShares, setBrokerShares] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('sf_broker_shares');
    return saved ? JSON.parse(saved) : {};
  });
  const [brokerStocks, setBrokerStocks] = useState<Record<string, { name: string; price: number; currency: 'USD' | 'RON' | 'EUR'; type: 'BVB' | 'US' | 'EU'; history: number[] }>>(() => {
    const saved = localStorage.getItem('sf_broker_stocks_v2');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_DATA;
  });
  const [selectedStock, setSelectedStock] = useState<string>("TLV");
  const [brokerStep, setBrokerStep] = useState<number>(0);
  const [brokerAmountInput, setBrokerAmountInput] = useState<string>("10");

  useEffect(() => {
    localStorage.setItem('sf_broker_balance_usd', brokerBalanceUsd.toString());
  }, [brokerBalanceUsd]);

  useEffect(() => {
    localStorage.setItem('sf_broker_balance_ron', brokerBalanceRon.toString());
  }, [brokerBalanceRon]);

  useEffect(() => {
    localStorage.setItem('sf_broker_shares', JSON.stringify(brokerShares));
  }, [brokerShares]);

  useEffect(() => {
    localStorage.setItem('sf_broker_stocks_v2', JSON.stringify(brokerStocks));
  }, [brokerStocks]);

  const handleSimulateNextDay = () => {
    const updated = { ...brokerStocks };
    Object.keys(updated).forEach(symbol => {
      const stock = { ...updated[symbol] };
      const changePercent = (Math.random() * 10.5 - 5) / 100; // -5% to +5.5%
      const newPrice = Math.max(1.0, parseFloat((stock.price * (1 + changePercent)).toFixed(stock.currency === 'RON' ? 2 : 1)));
      const nextHistory = [...stock.history, newPrice];
      if (nextHistory.length > 15) {
        nextHistory.shift();
      }
      stock.price = newPrice;
      stock.history = nextHistory;
      updated[symbol] = stock;
    });
    setBrokerStocks(updated);
    setSuccessToast("Prețurile pieței BVB și Internaționale au fost actualizate pentru ziua următoare! 📈");
  };

  const handleBuyStock = () => {
    const qty = parseInt(brokerAmountInput, 10);
    if (!qty || qty <= 0) {
      setErrorToast("Te rugăm să introduci o cantitate validă mai mare decât 0.");
      return;
    }
    const stock = brokerStocks[selectedStock];
    if (!stock) return;

    const totalCost = stock.price * qty;

    if (stock.type === 'BVB') {
      if (brokerBalanceRon < totalCost) {
        setErrorToast(`Fonduri insuficiente în RON! Ai nevoie de ${totalCost.toLocaleString('ro-RO')} RON.`);
        return;
      }
      setBrokerBalanceRon(prev => prev - totalCost);
    } else if (stock.type === 'US') {
      if (brokerBalanceUsd < totalCost) {
        setErrorToast(`Fonduri insuficiente în USD! Ai nevoie de $${totalCost.toLocaleString('en-US')} USD.`);
        return;
      }
      setBrokerBalanceUsd(prev => prev - totalCost);
    } else if (stock.type === 'EU') {
      // Decontat in RON la 4.97 rate as specified
      const costInRon = totalCost * 4.97;
      if (brokerBalanceRon < costInRon) {
        setErrorToast(`Fonduri insuficiente în RON pentru achiziție EUR! Ai nevoie de ${Math.round(costInRon).toLocaleString('ro-RO')} RON.`);
        return;
      }
      setBrokerBalanceRon(prev => prev - costInRon);
    }

    setBrokerShares(prev => {
      const current = prev[selectedStock] || 0;
      return {
        ...prev,
        [selectedStock]: current + qty
      };
    });
    setSuccessToast(`Tranzacție reușită! Ai cumpărat ${qty} acțiuni ${selectedStock} cu succes. 🎉`);
  };

  const handleSellStock = () => {
    const qty = parseInt(brokerAmountInput, 10);
    if (!qty || qty <= 0) {
      setErrorToast("Te rugăm să introduci o cantitate validă mai mare decât 0.");
      return;
    }
    
    const owned = brokerShares[selectedStock] || 0;
    if (owned < qty) {
      setErrorToast(`Nu deții suficiente acțiuni pentru vânzare! Cantitate deținută: ${owned}`);
      return;
    }

    const stock = brokerStocks[selectedStock];
    if (!stock) return;

    const totalValue = stock.price * qty;

    if (stock.type === 'BVB') {
      setBrokerBalanceRon(prev => prev + totalValue);
    } else if (stock.type === 'US') {
      setBrokerBalanceUsd(prev => prev + totalValue);
    } else if (stock.type === 'EU') {
      const valInRon = totalValue * 4.97;
      setBrokerBalanceRon(prev => prev + valInRon);
    }

    setBrokerShares(prev => {
      const next = { ...prev };
      const current = next[selectedStock] || 0;
      const updated = current - qty;
      if (updated <= 0) {
        delete next[selectedStock];
      } else {
        next[selectedStock] = updated;
      }
      return next;
    });
    setSuccessToast(`Ai vândut ${qty} acțiuni ${selectedStock} cu succes! 💰`);
  };

  const handleOpenShopTab = () => {
    setActiveClubTab('shop');
    
    // Trigger Daily Quest 6 (Vizitează Magazin Premii)
    setUserProfile(prev => {
      const todayStr = getBucharestDateStr();
      const quests = prev.dailyQuests || { 
        chatAsked: false, 
        nodeCompleted: false, 
        articleRead: false, 
        scenarioAnswered: false, 
        selectedScenarioOption: null,
        budgetCreated: false, 
        shopVisited: false, 
        lastResetDate: todayStr 
      };
      if (quests.shopVisited || !isLoggedIn) return prev; // Already completed today or not logged in

      const updatedQuests = { ...quests, shopVisited: true };
      setTimeout(() => {
        setSuccessToast("Misiune deblocată! +5 XP pentru vizitarea Magazinului de Premii! 🎟️💸");
      }, 50);
      return {
        ...prev,
        xp: prev.xp + 5,
        dailyQuests: updatedQuests
      };
    });
  };

  const handlePlanFieldChange = (field: string, value: string) => {
    setOnePagePlan(prev => ({ ...prev, [field]: value }));
  };

  // Helper to calculate community XP dynamically
  const getCommunityXPValue = (now: Date) => {
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Reset daily at 12 AM (midnight to 4 AM is 0)
    if (hours < 4) {
      return 0;
    }
    
    // Total seconds elapsed since 4:00 AM
    const elapsedSeconds = (hours - 4) * 3600 + minutes * 60 + seconds;
    // Total seconds in the 4:00 AM to 12:00 AM window (20 hours)
    const totalSecondsInWindow = 20 * 3600; 
    
    const progress = elapsedSeconds / totalSecondsInWindow;
    
    // Create a pseudo-random seed based on the date
    const dateSeed = now.getFullYear() * 1000 + (now.getMonth() + 1) * 30 + now.getDate();
    const seededRandom = Math.abs(Math.sin(dateSeed) * 10000 % 1);
    
    // Max daily target between 35,000 and 75,000 XP based on seed
    const dailyTarget = 35000 + Math.floor(seededRandom * 40000);
    
    // Unregulated growth curve: combine multiple frequencies of sine waves
    const wave1 = Math.sin(progress * Math.PI * 3.5) * 0.07;
    const wave2 = Math.cos(progress * Math.PI * 7.5) * 0.04;
    const nonLinearProgress = Math.pow(progress, 1.22);
    
    const adjustedProgress = Math.min(1.0, Math.max(0.0, nonLinearProgress + wave1 + wave2));
    
    return Math.floor(dailyTarget * adjustedProgress);
  };

  const [communityXP, setCommunityXP] = useState<number>(0);
  const [xpSessionOffset, setXpSessionOffset] = useState<number>(0);

  useEffect(() => {
    const updateXP = () => {
      const now = new Date();
      const base = getCommunityXPValue(now);
      if (now.getHours() < 4) {
        setXpSessionOffset(0);
        setCommunityXP(0);
      } else {
        setCommunityXP(base + xpSessionOffset);
      }
    };

    updateXP();
    const interval = setInterval(updateXP, 1000);
    return () => clearInterval(interval);
  }, [xpSessionOffset]);

  useEffect(() => {
    let timerId: ReturnType<typeof setTimeout>;
    const handleTicker = () => {
      const now = new Date();
      if (now.getHours() >= 4) {
        const increment = Math.floor(Math.random() * 15) + 4;
        setXpSessionOffset(prev => prev + increment);
      } else {
        setXpSessionOffset(0);
      }
      
      const randomDelay = Math.random() * 3000 + 1000;
      timerId = setTimeout(handleTicker, randomDelay);
    };

    timerId = setTimeout(handleTicker, 2000);
    return () => clearTimeout(timerId);
  }, []);

  // Auto-clear success toast helper
  useEffect(() => {
    if (successToast) {
      const t = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successToast]);

  // Auto-clear error toast helper
  useEffect(() => {
    if (errorToast) {
      const t = setTimeout(() => setErrorToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [errorToast]);

  // Save state updates
  useEffect(() => {
    localStorage.setItem('sf_logged_in', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('sf_logged_in_email', loggedInEmail);
    // If logged in and has email, and we have successfully retrieved the server profile first, trigger a silent sync!
    if (isLoggedIn && loggedInEmail && isProfileLoadedFromServer) {
      // 1. Sync to local backend-leaderboard
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loggedInEmail, profile: userProfile })
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          console.log("Profil sincronizat automat în cloud.");
        }
      })
      .catch(err => console.error("Eroare la sincronizarea automată:", err));

      // 2. Sync to Firestore in real-time
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        setDoc(userDocRef, userProfile, { merge: true })
          .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${auth.currentUser?.uid}`));
      }
    }
  }, [loggedInEmail, isLoggedIn, userProfile, isProfileLoadedFromServer]);

  useEffect(() => {
    localStorage.setItem('sf_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("sf_premium_onepageplan", JSON.stringify(onePagePlan));
  }, [onePagePlan]);

  // Check if all three core chapters (finance, economics, investing) are fully completed
  useEffect(() => {
    if (!isLoggedIn || !userProfile || !userProfile.completedNodes || userProfile.completedNodes.length === 0) return;

    const financeNodes = branchesData.finance?.nodes || [];
    const economicsNodes = branchesData.economics?.nodes || [];
    const investingNodes = branchesData.investing?.nodes || [];

    if (financeNodes.length === 0 || economicsNodes.length === 0 || investingNodes.length === 0) return;

    const isFinanceFinished = financeNodes.every(node => userProfile.completedNodes.includes(node.id));
    const isEconomicsFinished = economicsNodes.every(node => userProfile.completedNodes.includes(node.id));
    const isInvestingFinished = investingNodes.every(node => userProfile.completedNodes.includes(node.id));

    if (isFinanceFinished && isEconomicsFinished && isInvestingFinished) {
      const shownKey = `sf_investment_demo_unlocked_shown_v6_${userProfile.accountCode || 'anon'}`;
      const hasShown = localStorage.getItem(shownKey) === 'true';
      if (!hasShown) {
        localStorage.setItem(shownKey, 'true');
        // Trigger the celebration!
        setShowInvestmentUnlockCelebration(true);
      }
    }
  }, [userProfile?.completedNodes, isLoggedIn]);

  // Daily login streak checker on boot/activity using Romanian local time
  useEffect(() => {
    const todayStr = getBucharestDateStr();
    
    setUserProfile(prev => {
      // Ensure dailyQuests exists and resets if calendar day changed
      const quests = prev.dailyQuests || { 
        chatAsked: false, 
        nodeCompleted: false, 
        articleRead: false, 
        scenarioAnswered: false, 
        selectedScenarioOption: null,
        budgetCreated: false, 
        shopVisited: false, 
        lastResetDate: "" 
      };
      let updatedQuests = { ...quests };
      if (quests.lastResetDate !== todayStr) {
        updatedQuests = {
          chatAsked: false,
          nodeCompleted: false,
          articleRead: false,
          scenarioAnswered: false,
          selectedScenarioOption: null,
          budgetCreated: false,
          shopVisited: false,
          lastResetDate: todayStr
        };
      }

      if (!prev.lastLoginDate) {
        return {
          ...prev,
          lastLoginDate: todayStr,
          streak: prev.streak || 1,
          dailyQuests: updatedQuests
        };
      }
      
      if (prev.lastLoginDate === todayStr) {
        return {
          ...prev,
          dailyQuests: updatedQuests
        };
      }
      
      const lastDate = new Date(prev.lastLoginDate);
      const todayDate = new Date(todayStr);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      let newStreak = prev.streak;
      let bonusXP = 0;
      let msg = "";
      
      if (diffDays === 1) {
        // Consecutive daily login
        newStreak = (prev.streak || 0) + 1;
        const MILESTONES: Record<number, number> = {
          3: 50, 10: 150, 20: 300, 50: 600, 75: 1000, 100: 1500, 150: 2000, 200: 3000
        };
        bonusXP = MILESTONES[newStreak] || 0;
        if (bonusXP > 0) {
          msg = `Streak de învățare activ! Ziua ${newStreak} consecutivă. Ai deblocat un BONUS de milestone de +${bonusXP} XP! 🔥🏆`;
        } else {
          msg = `Streak de învățare activat! Ziua ${newStreak} consecutivă. 🔥`;
        }
      } else if (diffDays > 1) {
        // Missed days, streak resets to 1
        newStreak = 1;
        msg = `Streak-ul s-a resetat pentru că au trecut mai multe zile de la ultima ta logare. Începe un streak proaspăt! 💪`;
      } else {
        return prev;
      }
      
      if (msg) {
        setTimeout(() => setSuccessToast(msg), 600);
      }
      
      return {
        ...prev,
        streak: newStreak,
        xp: prev.xp + bonusXP,
        lastLoginDate: todayStr,
        dailyQuests: updatedQuests
      };
    });
  }, [isLoggedIn]);

  // Simulation controls to test consecutive login rewards & resets
  const triggerSimulationCheck = (daysOffset: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    setUserProfile(prev => {
      let newStreak = prev.streak;
      let bonusXP = 0;
      let msg = "";
      
      if (daysOffset === 1) {
        newStreak = (prev.streak || 0) + 1;
        const MILESTONES: Record<number, number> = {
          3: 50, 10: 150, 20: 300, 50: 600, 75: 1000, 100: 1500, 150: 2000, 200: 3000
        };
        bonusXP = MILESTONES[newStreak] || 0;
        if (bonusXP > 0) {
          msg = `[TEST] Simulare: Streak crescut la ${newStreak} de zile! Milestone atins! Ai primit un bonus de +${bonusXP} XP! ⚡🏆`;
        } else {
          msg = `[TEST] Simulare: Te-ai conectat a doua zi! Streak crescut la ${newStreak} de zile. 🔥`;
        }
      } else if (daysOffset > 1) {
        newStreak = 1;
        msg = `[TEST] Simulare: Pentru că ai lipsit mai mult de o zi, streak-ul s-a resetat la 1! ❄`;
      }
      
      if (msg) {
        setSuccessToast(msg);
      }
      
      return {
        ...prev,
        streak: newStreak,
        xp: prev.xp + bonusXP,
        lastLoginDate: todayStr
      };
    });
  };

  // Compute dynamic rank titles
  const rankTitle = userProfile.xp < 50 ? "Pre-Seed Explorer" : userProfile.xp < 120 ? "Bootstrapper" : "Series-A Visionary";

  // Simplified Linear learning roadmap order
  const getOrderedNodes = (sectionKey?: string | null): LearningNode[] => {
    if (sectionKey) {
      return branchesData[sectionKey]?.nodes || [];
    }
    return [
      ...(branchesData.how_to_start_first_startup?.nodes || []),
      ...(branchesData.finance?.nodes || []),
      ...(branchesData.economics?.nodes || []),
      ...(branchesData.startup?.nodes || []),
      ...(branchesData.marketing?.nodes || []),
      ...(branchesData.investing?.nodes || []),
      ...(branchesData.networking?.nodes || [])
    ];
  };

  // Check if a node is unlocked under the simplified linear flow
  const isNodeUnlockedLinear = (nodeId: string, sectionKey?: string | null): boolean => {
    const list = getOrderedNodes(sectionKey);
    const idx = list.findIndex(n => n.id === nodeId);
    if (idx <= 0) return true; // first node is always unlocked
    // must have completed the previous node
    return userProfile.completedNodes.includes(list[idx - 1].id);
  };

  // Handle option click behavior inside the Quiz
  const handleAnswerSelection = (optionIndex: number) => {
    if (quizFeedback.status !== null) return; // Answer already locked
    setSelectedAnswer(optionIndex);
  };

  // Handle verification behavior
  const verifyAnswer = () => {
    if (activeModalNode === null || selectedAnswer === null) return;

    const currentQuestionIdx = activeQuestionIdx;
    const hasMultipleQuestions = activeModalNode.questions && activeModalNode.questions.length > 0;
    const activeQuestionObj = hasMultipleQuestions && activeModalNode.questions 
      ? activeModalNode.questions[currentQuestionIdx]
      : {
          question: activeModalNode.question,
          options: activeModalNode.options,
          correct: activeModalNode.correct,
          explanation: activeModalNode.explanation
        };

    if (selectedAnswer === activeQuestionObj.correct) {
      // Is this the last question?
      const isLastQuestion = !hasMultipleQuestions || currentQuestionIdx === (activeModalNode.questions!.length - 1);

      if (isLastQuestion) {
        // Correct choice and finished
        const isAlreadyCompleted = userProfile.completedNodes.includes(activeModalNode.id);
        const earnedXP = isAlreadyCompleted ? 0 : activeModalNode.xp;
        
        setQuizFeedback({
          status: 'success',
          message: activeQuestionObj.explanation || "Excelent! Răspunsul tău este corect și ai finalizat toate testele!"
        });

        // Update user metrics cleanly
        const isBoosterActiveNow = userProfile.xpBoosterActiveUntil && new Date() < new Date(userProfile.xpBoosterActiveUntil);
        const xpMultiplier = isBoosterActiveNow ? 2 : 1;
        const finalEarnedXp = earnedXP * xpMultiplier;

        setUserProfile(prev => {
          const updatedCompleted = prev.completedNodes.includes(activeModalNode.id)
            ? prev.completedNodes
            : [...prev.completedNodes, activeModalNode.id];
            
          const isQuestCompletedAlready = prev.dailyQuests?.nodeCompleted;
          let extraQuestXP = 0;
          let quests = prev.dailyQuests || { chatAsked: false, nodeCompleted: false, articleRead: false, lastResetDate: new Date().toISOString().split('T')[0] };
          
          if (!isQuestCompletedAlready) {
            quests = { ...quests, nodeCompleted: true };
            extraQuestXP = 15;
            setTimeout(() => {
              setSuccessToast("Misiune deblocată! +15 XP pentru finalizarea unui modul de curs! 🎓⚡");
            }, 1000);
          }

          const pMultiplier = (prev.xpBoosterActiveUntil && new Date() < new Date(prev.xpBoosterActiveUntil)) ? 2 : 1;
          const userFinalEarnedXp = earnedXP * pMultiplier;
          const userFinalQuestXp = extraQuestXP * pMultiplier;

          // Gems rewards
          const hasBeenCompleted = prev.completedNodes.includes(activeModalNode.id);
          let gemsEarned = 0;
          if (!hasBeenCompleted) {
            gemsEarned += 2; // 2 gems per lesson finished
          }

          // Entire course completed check (+30 gems)
          let finishedAnotherCourse = false;
          let finishedCourseName = "";
          Object.entries(branchesData).forEach(([key, branch]) => {
            const nodes = branch.nodes || [];
            if (nodes.length > 0 && nodes.some(n => n.id === activeModalNode.id)) {
              const wasCompletedBefore = nodes.every(n => prev.completedNodes.includes(n.id));
              const isCompletedNow = nodes.every(n => updatedCompleted.includes(n.id));
              if (!wasCompletedBefore && isCompletedNow) {
                finishedAnotherCourse = true;
                finishedCourseName = branch.title;
              }
            }
          });

          if (finishedAnotherCourse) {
            gemsEarned += 30; // 30 gems for finishing a whole course
            setTimeout(() => {
              setSuccessToast(`Felicitări extreme! Ai finalizat cursul selectat "${finishedCourseName}"! +30 Gemuri adăugate! 💎🏆`);
            }, 1600);
          }
            
          return {
            ...prev,
            xp: prev.xp + userFinalEarnedXp + userFinalQuestXp,
            gems: (prev.gems ?? 0) + gemsEarned,
            completedNodes: updatedCompleted,
            dailyQuests: quests
          };
        });

        // Trigger gorgeous framer motion modal with 750ms delayed timing
        setTimeout(() => {
          setShowQuizCelebration({
            nodeTitle: activeModalNode.title,
            xpEarned: finalEarnedXp
          });
        }, 750);
      } else {
        // Correct choice, but more questions remaining!
        setQuizFeedback({
          status: 'success',
          message: `Excelent! Răspunsul este corect. ${activeQuestionObj.explanation}`
        });
      }
    } else {
      // Incorrect choice
      setQuizFeedback({
        status: 'error',
        message: `Răspuns incorect. Explicație: ${activeQuestionObj.explanation}`
      });
    }
  };

  // Complete Login flow - Restore or initialize cloud profile progress using real Firebase Auth!
  const handleAuthSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup' && !authForm.name.trim()) {
      setAuthError("Te rugăm să introduci numele tău real.");
      return;
    }
    if (!authForm.email.includes("@") || authForm.email.length < 5) {
      setAuthError("Te rugăm să introduci o adresă de email validă.");
      return;
    }
    if (authForm.password.length < 6) {
      setAuthError("Parola trebuie să aibă minimum 6 caractere.");
      return;
    }

    setAuthError("");
    const cleanEmail = authForm.email.trim().toLowerCase();

    if (authMode === 'signup') {
      createUserWithEmailAndPassword(auth, cleanEmail, authForm.password)
        .then((userCredential) => {
          const user = userCredential.user;
          const dbProfile: UserProfile = {
            name: authForm.name.trim() || cleanEmail.split('@')[0],
            xp: userProfile.xp ?? 0,
            streak: userProfile.streak ?? 1,
            completedNodes: userProfile.completedNodes ?? [],
            lastLoginDate: new Date().toISOString().split('T')[0],
            unlockedItems: userProfile.unlockedItems ?? [],
            dailyQuests: userProfile.dailyQuests ?? null,
            accountCode: userProfile.accountCode || generateAccountCode(),
            profilePhotoUrl: userProfile.profilePhotoUrl || "avatar_green_rocket"
          };
          
          // Save profile to Firestore
          const userDocRef = doc(db, 'users', user.uid);
          setDoc(userDocRef, dbProfile)
            .then(() => {
              setLoggedInEmail(cleanEmail);
              setIsLoggedIn(true);
              setUserProfile(dbProfile);
              setIsProfileLoadedFromServer(true);
              setSuccessToast("Contul tău nou a fost creat și sincronizat pe server!");
              setActivePage('invatare');
            })
            .catch((err) => {
              handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
            });
        })
        .catch((err) => {
          console.error(err);
          setAuthError(err instanceof Error ? err.message : "Eroare la crearea contului.");
        });
    } else {
      signInWithEmailAndPassword(auth, cleanEmail, authForm.password)
        .then((userCredential) => {
          const user = userCredential.user;
          const userDocRef = doc(db, 'users', user.uid);
          getDoc(userDocRef)
            .then((userSnap) => {
              if (userSnap.exists()) {
                const dbProfile = userSnap.data() as UserProfile;
                setLoggedInEmail(cleanEmail);
                setIsLoggedIn(true);
                setUserProfile(dbProfile);
                setIsProfileLoadedFromServer(true);
                setSuccessToast(`Te-ai reconectat! Progresul tău (${dbProfile.xp} XP) a fost sincronizat.`);
              } else {
                setLoggedInEmail(cleanEmail);
                setIsLoggedIn(true);
                setIsProfileLoadedFromServer(true);
                setSuccessToast("Conectat cu succes.");
              }
              setActivePage('invatare');
            })
            .catch((err) => {
              console.warn("Eroare la regăsirea profilului:", err);
              setAuthError("Eroare la regăsirea profilului securizat.");
            });
        })
        .catch((err: any) => {
          console.warn("Eroare la încercare email login:", err);
          if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
            setAuthError("Email sau parolă incorectă.");
          } else {
            setAuthError("Eroare la autentificare: " + (err?.message || "Eroare de conexiune"));
          }
        });
    }
  };

  // Real Google Sign-In with popup redirection protection
  const handleGoogleLogin = () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/forms.body');
    provider.addScope('https://www.googleapis.com/auth/drive.file');

    signInWithPopup(auth, provider)
      .then((result) => {
        // Salvează tokenul de acces Google pentru crearea de formulare
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          setGoogleAccessToken(credential.accessToken);
        }

        const user = result.user;
        const cleanEmail = (user.email || "").trim().toLowerCase();
        const userDocRef = doc(db, 'users', user.uid);

        getDoc(userDocRef)
          .then((userSnap) => {
            if (userSnap.exists()) {
              const dbProfile = userSnap.data() as UserProfile;
              setLoggedInEmail(cleanEmail);
              setIsLoggedIn(true);
              setUserProfile(dbProfile);
              setIsProfileLoadedFromServer(true);
              setSuccessToast(`Conectat securizat prin Google! Progresul tău (${dbProfile.xp} XP) a fost sincronizat.`);
            } else {
              const dbProfile: UserProfile = {
                name: user.displayName || cleanEmail.split('@')[0] || "Elev Ambițios",
                xp: userProfile.xp ?? 0,
                streak: userProfile.streak ?? 1,
                completedNodes: userProfile.completedNodes ?? [],
                lastLoginDate: new Date().toISOString().split('T')[0],
                unlockedItems: userProfile.unlockedItems ?? [],
                dailyQuests: userProfile.dailyQuests ?? null,
                accountCode: userProfile.accountCode || generateAccountCode(),
                profilePhotoUrl: userProfile.profilePhotoUrl || "avatar_green_rocket"
              };
              
              setDoc(userDocRef, dbProfile)
                .then(() => {
                  setLoggedInEmail(cleanEmail);
                  setIsLoggedIn(true);
                  setUserProfile(dbProfile);
                  setIsProfileLoadedFromServer(true);
                  setSuccessToast(`Cont nou creat prin Google cu: ${cleanEmail}.`);
                })
                .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
            }
            setActivePage('invatare');
          })
          .catch((err) => {
            console.warn("Eroare regăsire profil Google Sign in:", err);
            // Fallback profile load
            setLoggedInEmail(cleanEmail);
            setIsLoggedIn(true);
            setIsProfileLoadedFromServer(true);
            setActivePage('invatare');
          });
      })
      .catch((err) => {
        console.warn("Eroare Google sign in:", err);
        setAuthError("Eroare la autentificarea cu Google: " + (err?.message || "Eroare de popup"));
      });
  };

  // Local Guest Session (Bypass for whitelisting / network blocks)
  const handleLocalLogin = () => {
    setIsLoggedIn(true);
    setLoggedInEmail("local_guest@startupfinance.local");
    setIsProfileLoadedFromServer(true);
    
    const saved = localStorage.getItem('sf_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserProfile(parsed);
        setSuccessToast("Sesiune Oaspete Locală reluată! Progresul tău este în siguranță. 💾");
      } catch (e) {
        setSuccessToast("Sesiune Oaspete Locală activată! Toate datele se salvează în browser. 💾");
      }
    } else {
      setUserProfile(prev => ({
        ...prev,
        name: prev.name === "Vizitator" ? "Pionier Financiar" : prev.name,
        gems: prev.gems ?? 15, // start guest session with 15 gems to test booster
      }));
      setSuccessToast("Sesiune Oaspete Locală activată! Toate datele se salvează în browser. 💾");
    }
    setActivePage('invatare');
  };

  // Legacy fallback simulated Google helper for compatibility
  const handleGoogleSimLogin = (selectedName: string, selectedEmail: string) => {
    const cleanEmail = selectedEmail.trim().toLowerCase();
    setLoggedInEmail(cleanEmail);
    setIsLoggedIn(true);
    setShowGoogleAuthSim(false);
    setActivePage('invatare');
    setSuccessToast(`Conectat cu succes în sandbox ca ${selectedName}.`);
  };

  // Reset profile action helper (designed for clean, clear preferences reset)
  const resetAllProgress = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setUserProfile({
      name: isLoggedIn ? userProfile.name : "Vizitator",
      xp: 0,
      streak: 1,
      completedNodes: [],
      lastLoginDate: todayStr
    });
    setQuizFeedback({ status: null, message: "" });
    setSelectedAnswer(null);
    setActiveModalNode(null);
    setSuccessToast("Progresul și portofelul tău au fost șterse complet.");
  };

  // Open Forms modal
  const openFormModal = (type: 'school' | 'support') => {
    setFormModalType(type);
    setFormErrors({});
    
    // Auto-populate email if logged in
    if (type === 'school') {
      setSchoolForm({
        email: loggedInEmail || "",
        age: "",
        clasa: "",
        institutie: ""
      });
    } else {
      setSupportForm({
        email: loggedInEmail || "",
        description: ""
      });
    }
    
    setIsFormModalOpen(true);
  };

  // Google Forms API Integration logic
  const handleCreateGoogleForm = async () => {
    // If not authenticated, we handle login
    if (!googleAccessToken) {
      alert("Pentru a crea în siguranță un Google Form pe Drive-ul personal, te rugăm să te conectezi întâi cu Google.");
      handleGoogleLogin();
      return;
    }

    try {
      setIsSubmittingForm(true);
      const isSchool = formModalType === 'school';
      
      const formTitle = isSchool ? "StartUp Finance în Școala Mea" : "Susținere Proiect StartUp Finance";
      const formDesc = isSchool 
        ? "Formular de solicitare pentru a aduce programul gratuit de educație financiară StartUp Finance în liceul tău."
        : "Vreau să susțin proiectul StartUp Finance - Detalii implicare.";

      // 1. Create a blank form via Google Forms API
      const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            title: formTitle,
            description: formDesc
          }
        })
      });

      if (!createRes.ok) {
        throw new Error("Eroare la crearea formularului prin Google Forms API.");
      }

      const formResult = await createRes.json();
      const formId = formResult.formId;
      const responderUri = formResult.responderUri;

      // 2. Add questions using batchUpdate on Google Forms API
      const reqs = isSchool ? [
        {
          createItem: {
            item: {
              title: "Adresa ta de Email",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {}
                }
              }
            },
            location: { index: 0 }
          }
        },
        {
          createItem: {
            item: {
              title: "Câți ani ai? (Vârsta)",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {}
                }
              }
            },
            location: { index: 1 }
          }
        },
        {
          createItem: {
            item: {
              title: "În ce clasă ești?",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {}
                }
              }
            },
            location: { index: 2 }
          }
        },
        {
          createItem: {
            item: {
              title: "Instituția de învățământ (Școala/Liceul tău)",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {}
                }
              }
            },
            location: { index: 3 }
          }
        }
      ] : [
        {
          createItem: {
            item: {
              title: "Cine ești și care este background-ul tău?",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: true }
                }
              }
            },
            location: { index: 0 }
          }
        },
        {
          createItem: {
            item: {
              title: "Cum vrei să susții proiectul StartUp Finance?",
              questionItem: {
                question: {
                  required: true,
                  textQuestion: { paragraph: true }
                }
              }
            },
            location: { index: 1 }
          }
        }
      ];

      const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requests: reqs
        })
      });

      if (!updateRes.ok) {
        throw new Error("Eroare la configurarea întrebărilor în Google Form.");
      }

      setSuccessToast(`Excelent! Google Form-ul tău a fost creat cu succes în Drive!`);
      
      // Submit a shadow backup entry to Firestore
      const backupBody = isSchool ? {
        type: 'school',
        email: schoolForm.email || 'google-auth-user@gmail.com',
        age: schoolForm.age || 'Drive-created',
        clasa: schoolForm.clasa || 'Drive-created',
        institutie: schoolForm.institutie || 'Drive-created',
        description: `Formular creat direct în Google Drive-ul utilizatorului. ID Formular: ${formId}. Link complet de completare: ${responderUri}`
      } : {
        type: 'support',
        email: supportForm.email || 'google-auth-user@gmail.com',
        description: `Formular creat în Drive-ul utilizatorului. ID Formular: ${formId}. Link complet de completare: ${responderUri}`
      };

      try {
        await addDoc(collection(db, 'form_submissions'), {
          ...backupBody,
          createdAt: new Date().toISOString()
        });
      } catch (fError) {
        console.error("Eroare salvare shadow backup:", fError);
      }

      // Open Forms URL in a new window/tab safely within sandbox constraints
      window.open(responderUri, '_blank');
      setIsFormModalOpen(false);

    } catch (googleErr: any) {
      console.error(googleErr);
      alert("A apărut o eroare la conexiunea cu Google Forms API: " + googleErr.message);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Safe client-side submission wrapper
  const handleInAppFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setIsSubmittingForm(true);

    const isSchool = formModalType === 'school';
    const emailToValidate = isSchool ? schoolForm.email : supportForm.email;

    // Check email syntax standard
    if (!emailToValidate || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate)) {
      setFormErrors({ email: "Introdu o adresă de e-mail corectă." });
      setIsSubmittingForm(false);
      return;
    }

    if (isSchool) {
      if (!schoolForm.age) {
        setFormErrors(prev => ({ ...prev, age: "Vârsta este obligatorie." }));
        setIsSubmittingForm(false);
        return;
      }
      if (!schoolForm.clasa) {
        setFormErrors(prev => ({ ...prev, clasa: "Specificația clasei este obligatorie." }));
        setIsSubmittingForm(false);
        return;
      }
      if (!schoolForm.institutie) {
        setFormErrors(prev => ({ ...prev, institutie: "Numele instituției de învățământ dorește să fie completat." }));
        setIsSubmittingForm(false);
        return;
      }
    } else {
      if (!supportForm.description || supportForm.description.trim().length < 10) {
        setFormErrors({ description: "Descrierea ta este mult prea scurtă. Completează minim 10 caractere." });
        setIsSubmittingForm(false);
        return;
      }
    }

    try {
      const payload = isSchool ? {
        type: 'school',
        email: schoolForm.email,
        age: schoolForm.age,
        clasa: schoolForm.clasa,
        institutie: schoolForm.institutie,
        description: "Formular rapid înregistrat local în interfața aplicației."
      } : {
        type: 'support',
        email: supportForm.email,
        description: supportForm.description
      };

      // 1. Submit to Firestore db (DURABLE persistence in cloud)
      await addDoc(collection(db, 'form_submissions'), {
        ...payload,
        createdAt: new Date().toISOString()
      });

      // 2. Submit to backend mail endpoint
      const apiRes = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const apiResult = await apiRes.json();
      if (!apiRes.ok) {
        throw new Error(apiResult.error || "Eroare la procesarea server.");
      }

      setSuccessToast(isSchool 
        ? "Formular trimis! Solicitarea ta a fost sigilată în Firebase și trimisă la sebid418@gmail.com."
        : "Mulțumim! Propunerea ta de susținere a fost securizată și trimisă fondatorului."
      );
      
      setIsFormModalOpen(false);

    } catch (err: any) {
      console.error(err);
      setFormErrors({ form: "Eroare la transmitere formular: " + err.message });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Permanently delete user account document from Firestore and clear local storage
  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ ATENȚIE: Această acțiune este permanentă și ireversibilă!\n\nEști sigur că dorești să îți ștergi definitiv contul, tot progresul tău educațional (XP, module curs parcurse) și toate datele tale stocate în Cloud? Toate datele tale locale din local storage vor fi de asemenea eliminate.")) {
      return;
    }

    const confirmAgain = confirm("Confirmi din nou ștergerea definitivă a contului? Această acțiune nu poate fi revocată.");
    if (!confirmAgain) return;

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // 1. Delete user profile document from Firestore using the user's UID
        const userDocRef = doc(db, 'users', currentUser.uid);
        await deleteDoc(userDocRef);
        console.log("Documentul utilizatorului a fost șters din Firestore cu succes.");

        // 2. Try to delete the Firebase Auth user account directly
        try {
          await deleteUser(currentUser);
          console.log("Contul utilizatorului a fost șters din Firebase Auth.");
        } catch (authErr) {
          console.warn("Nu s-a putut șterge direct contul din Firebase Auth (necesită o autentificare recentă). Se va continua cu deconectarea standard.", authErr);
        }
      }
    } catch (err: any) {
      console.error("Eroare la ștergerea contului din server:", err);
      alert("A apărut o problemă la ștergerea documentului de pe server: " + (err?.message || err) + ". Se continuă cu curățarea locală și deconectarea.");
    }

    // 3. Clear local storage entirely
    localStorage.clear();
    console.log("Stocarea locală a fost curățată.");

    // 4. Force standard signOut to clean up residual authentication state
    try {
      await signOut(auth);
    } catch (signOutErr) {
      console.warn("Eroare la curățarea sesiunii de autentificare:", signOutErr);
    }

    // 5. Reset local state variables
    setIsLoggedIn(false);
    setLoggedInEmail("");
    setUserProfile({
      name: "Vizitator",
      xp: 0,
      streak: 0,
      completedNodes: [],
      accountCode: "SF-VISITOR",
      profilePhotoUrl: "avatar_green_rocket"
    });

    // 6. Redirect to Home & Toast success message
    setActivePage('home');
    setSuccessToast("Contul tău și toate datele asociate au fost șterse definitiv din sistem.");
  };

  // Filter articles based on search query and category pill
  const filteredArticles = articles.filter(art => {
    const matchesCategory = articleFilter === "Toate" || art.category === articleFilter;
    const matchesSearch = art.title.toLowerCase().includes(articleSearchQuery.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(articleSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Custom animated theme toggle button
  const ThemeToggle = () => (
    <button
      type="button"
      onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
      className="p-2 rounded-xl bg-[#0F1322] border border-[#1F293D] text-[#10B981] hover:text-[#10B981]/80 hover:bg-[#1E2538] transition-all relative overflow-hidden flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
      title={theme === 'light' ? "Mod întunecat pentru ochi protejați" : "Mod luminos pentru zi"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'light' ? 0 : 360, scale: theme === 'light' ? 1 : 0.95 }}
        transition={{ type: 'spring', stiffness: 220, damping: 15 }}
        className="w-5 h-5 flex items-center justify-center"
      >
        {theme === 'light' ? (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-500" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400" />
        )}
      </motion.div>
    </button>
  );

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-[#10B981] selection:text-[#050811] transition-colors duration-350 ${
      theme === 'light' ? 'light-mode bg-[#F4F6FB] text-[#0F172A]' : 'bg-[#050811] text-[#F8FAFC]'
    }`}>
      
      {/* GLOWING AMBIENT DECK */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* VIEW DECK NAVIGATION CONTAINER (FULL-WIDTH ON DESKTOP & MOBILE) */}
      <div className="flex-1 w-full max-w-full overflow-x-hidden flex flex-col min-h-screen">

      {/* STICKY MAIN HEADER NAVIGATION - VISIBLE ON ALL SCREENS */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-205 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-sm'
          : 'bg-[#090D1A]/95 border-[#1F293D] text-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-4">
          
          {/* Brand header with logo */}
          <div 
            onClick={() => {
              setActivePage('home');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <img 
              src="https://www.image2url.com/r2/default/images/1781969419655-34354dda-41bf-4e66-836f-2b0db367bd3f.png" 
              alt="Logo"
              referrerPolicy="no-referrer"
              className="aspect-square w-10 h-10 md:w-11 h-11 rounded-lg md:rounded-xl object-contain group-hover:scale-110 group-hover:rotate-3 active:scale-90 transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] bg-transparent outline-none border-none animate-pulse-slow object-cover"
            />
            <span className={`font-display font-black text-base md:text-lg tracking-tight transition-colors ${
              theme === 'light' ? 'text-slate-800' : 'text-white'
            } group-hover:text-[#10B981]`}>
              StartUp <span className="text-[#10B981]">Finance</span>
            </span>
          </div>


          {/* User Metrics & Theme Controls */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {isLoggedIn && (
              <div className="hidden md:flex items-center gap-2">
                <div className={`flex items-center gap-1 border px-2.5 py-1.5 rounded-xl shrink-0 transition-colors ${
                  theme === 'light' ? 'bg-slate-50 border-slate-250 text-slate-800' : 'bg-[#0F1322] border-[#1F293D]'
                }`}>
                  <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-slate-800' : 'text-[#F59E0B]'}`}>{userProfile.streak} Zile</span>
                </div>

                <div className={`flex items-center gap-1 border px-2.5 py-1.5 rounded-xl shrink-0 transition-colors ${
                  theme === 'light' ? 'bg-slate-50 border-slate-250 text-slate-800' : 'bg-[#0F1322] border-[#1F293D]'
                }`}>
                  <Zap className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    <AnimatedCountUp value={userProfile.xp} /> XP
                  </span>
                </div>

                <div className={`flex items-center gap-1 border px-2.5 py-1.5 rounded-xl shrink-0 transition-colors ${
                  theme === 'light' ? 'bg-slate-50 border-slate-250 text-slate-800' : 'bg-[#0F1322] border-[#1F293D]'
                }`}>
                  <Gem className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className={`text-xs font-mono font-bold ${theme === 'light' ? 'text-slate-800' : 'text-[#10B981]'}`}>
                    <AnimatedCountUp value={userProfile.gems || 0} /> 💎
                  </span>
                </div>

                {userProfile.xpBoosterActiveUntil && new Date() < new Date(userProfile.xpBoosterActiveUntil) && (
                  <div className="flex items-center gap-1 border border-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-xl shrink-0 text-[#10B981] font-bold font-mono text-[10px] animate-pulse" title="2x XP Multiplier Activ!">
                    🚀 2x XP
                  </div>
                )}
              </div>
            )}

            {/* Always-visible Theme Toggle Button in Header */}
            <ThemeToggle />

            {/* Menu icon button in the header (opens side menu from the right) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center h-10 w-10 shrink-0 border ${
                theme === 'light' 
                  ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                  : 'bg-[#0F1322] border-[#1F293D] text-white hover:bg-[#1E2538]'
              }`}
              aria-label="Meniu Navigare"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#10B981]" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* Side Lateral Menu Drawer (Opens from right on all screens) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
            />
            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className={`fixed inset-y-0 right-0 z-50 w-72 h-full max-w-full shadow-2xl overflow-y-auto ${
                theme === 'light' 
                  ? 'bg-white border-l border-slate-250 text-slate-900' 
                  : 'bg-[#0B0F19] border-l border-[#1F293D] text-[#F8FAFC]'
              } p-6 flex flex-col justify-between`}
            >
              <div className="space-y-6">
                {/* Header with Closes button */}
                <div className="flex items-center justify-between pb-4 border-b border-dashed border-[#1F293D]/20">
                  <span className={`font-display font-extrabold text-sm uppercase tracking-wider ${
                    theme === 'light' ? 'text-slate-800' : 'text-slate-200'
                  }`}>
                    Meniu Navigare
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                      theme === 'light' 
                        ? 'bg-slate-100 hover:bg-slate-200 border-slate-250 text-slate-700' 
                        : 'bg-[#151D2F] hover:bg-[#1E2538] border-[#1F293D] text-slate-400'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main pages selector */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold font-mono text-[#64748B] tracking-wider uppercase block">SECȚIUNI PLATFORMĂ</span>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { id: 'home', label: 'Acasă', icon: Home },
                      { id: 'invatare', label: 'Învățare / Curs', icon: GraduationCap },
                      { id: 'articole', label: 'Articole / Blog', icon: BookOpen },
                      { id: 'evenimente', label: 'Evenimente (🚧)', icon: Calendar },
                      { id: 'club', label: 'Clubul XP', icon: Trophy },
                      { id: 'despre', label: 'Despre noi', icon: Users },
                    ].map((item) => {
                      const IconComp = item.icon;
                      const isActive = activePage === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActivePage(item.id as any);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                            isActive 
                              ? 'bg-[#10B981] text-white shadow-md shadow-[#10B981]/20' 
                              : theme === 'light' 
                                ? 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                : 'bg-[#151D2F]/60 border border-[#1F293D]/20 text-slate-300 hover:bg-[#151D2F] hover:text-white'
                          }`}
                        >
                          <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.id === 'club' ? 'text-amber-500' : item.id === 'despre' ? 'text-[#10B981]' : item.id === 'evenimente' ? 'text-amber-500' : 'text-[#64748B]'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Account details and action block */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold font-mono text-[#64748B] tracking-wider uppercase block">CONTUL TĂU</span>
                  {isLoggedIn ? (
                    <div 
                      onClick={() => {
                        setActivePage('account');
                        setIsMobileMenuOpen(false);
                      }}
                      className={`p-4 rounded-xl border space-y-3 cursor-pointer hover:border-[#10B981]/50 transition-all group/acc ${
                        theme === 'light' 
                          ? 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-800' 
                          : 'bg-[#121824] hover:bg-[#1E2638] border-[#1F293D] text-white'
                      }`}
                      title="Vizualizează și editează contul tău"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {renderProfilePhoto(userProfile.profilePhotoUrl, userProfile.name, "w-8 h-8", userProfile.profilePhotoZoom)}
                          <div className="min-w-0">
                            <span className="text-xs font-bold block group-hover/acc:text-[#10B981] transition-colors truncate">{userProfile.name}</span>
                            <span className="text-[9px] font-mono font-bold text-[#64748B] block mt-0.5 truncate">{rankTitle}</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-[#10B981] font-bold group-hover/acc:translate-x-0.5 transition-transform flex items-center gap-0.5 shrink-0 bg-[#10B981]/15 px-1.5 py-0.5 rounded-md">
                          Profil <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                      
                      <div className="flex gap-2 flex-wrap">
                        <div className="flex items-center gap-1 bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-[#10B981]">
                          <Zap className="w-3.5 h-3.5" /> <AnimatedCountUp value={userProfile.xp} /> XP
                        </div>
                        <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-amber-500">
                          <Flame className="w-3.5 h-3.5 fill-current" /> {userProfile.streak || 1} Z
                        </div>
                        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-[#10B981]">
                          <Gem className="w-3 h-3 text-emerald-400" /> {userProfile.gems || 0} 💎
                        </div>
                        {userProfile.xpBoosterActiveUntil && new Date() < new Date(userProfile.xpBoosterActiveUntil) && (
                          <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold text-[#10B981] animate-pulse">
                            🚀 2x XP
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid triggering redirection on log out button
                          signOut(auth).then(() => {
                            setIsLoggedIn(false);
                            setLoggedInEmail("");
                            setActivePage('home');
                            setSuccessToast("Te-ai deconectat cu succes.");
                            setIsMobileMenuOpen(false);
                          }).catch(err => {
                            console.error("Eroare la delogare:", err);
                          });
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 border border-rose-500/20 hover:border-rose-500/40 text-rose-500 hover:bg-rose-500/10 bg-transparent rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <LogOut className="w-3 h-3" /> Deconectare
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setAuthMode('signin');
                          setActivePage('auth');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                          theme === 'light' 
                            ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' 
                            : 'bg-[#151D2F] border-[#1F293D] text-slate-300 hover:text-white'
                        }`}
                      >
                        Conectare
                      </button>
                      <button
                        onClick={() => {
                          setAuthMode('signup');
                          setActivePage('auth');
                          setIsMobileMenuOpen(false);
                        }}
                        className="py-2.5 rounded-xl text-xs font-bold bg-[#10B981] text-white hover:bg-[#10B981]/90 shadow-sm text-center cursor-pointer"
                      >
                        Înscriere
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Version note */}
              <div className="pt-6 border-t border-dashed border-[#1F293D]/10 text-center">
                <span className="text-[9px] font-mono text-[#64748B]">StartUp Finance RO • 2026</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* VIEW DECK NAVIGATION CONTAINER */}
      <main className="pb-24">
        <AnimatePresence mode="wait">
          
          {/* HOME SCREEN */}
          {activePage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto px-4 pt-12 md:pt-20 space-y-20"
            >
              
              {/* CENTRAL HERO UNIT */}
              <div className="text-center space-y-6 max-w-4xl mx-auto">
                
                {/* Official builder community pill badge */}
                <div className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full shadow-inner transition-colors duration-300 border ${
                  theme === 'light' 
                    ? 'bg-emerald-50/60 border-[#10B981]/30' 
                    : 'bg-[#0F1322] border-[#1F293D]'
                }`}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
                  </span>
                  <span className={`text-[11px] md:text-xs font-mono font-bold tracking-tight transition-colors duration-300 ${
                    theme === 'light' ? 'text-emerald-700' : 'text-[#10B981]'
                  }`}>
                    COMUNITATEA DE EDUCAȚIE FINANCIARĂ A TINERILOR DIN ROMÂNIA
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  Școala nu te învață cum funcționează banii. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669] inline-block transition-all duration-300 hover:scale-105 cursor-pointer drop-shadow-[0_0_10px_rgba(16,185,129,0.55)]">
                    Noi da.
                  </span>
                </h1>

                <p className="font-sans text-base md:text-xl text-[#64748B] font-medium leading-relaxed max-w-3xl mx-auto">
                  Ecosistemul tău de învățare și networking. Lansează startup-uri, stăpânește marketingul strategic și înțelege investițiile inteligente prin sprinturi interactive de 5 minute.
                </p>

                {/* Call to action element buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-7">
                  <div className="relative w-full sm:w-auto">
                    <button 
                      onClick={() => setActivePage('invatare')}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#10B981]/95 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-sm px-8 py-4 rounded-xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.25)] hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] group`}
                    >
                      Începe Să Înveți 
                      <ArrowForwardIcon />
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      if (isLoggedIn) {
                        setActivePage('invatare');
                      } else {
                        setAuthMode('signup');
                        setActivePage('auth');
                      }
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0F172A] font-bold text-sm px-8 py-4 rounded-xl border-2 border-[#94A3B8] transition-all"
                  >
                    Cont Nou
                  </button>
                </div>

              </div>

              {/* BRAND PARTNERSHIP / GOOGLE FORMS INTEGRATION BOX */}
              <motion.div 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6 }}
                className={`p-5 md:p-10 rounded-3xl border transition-all duration-300 shadow-md max-w-4xl mx-auto ${
                  theme === 'light' 
                    ? 'bg-white border-slate-200 text-slate-800 shadow-slate-100' 
                    : 'bg-[#0F1322] border-[#1F293D] text-[#F8FAFC]'
                }`}
              >
                <div className="max-w-2xl mx-auto text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#10B981]/15 text-[#10B981] mx-auto">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Parteneriate &amp; Educație</span>
                  </div>
                  
                  <h2 className={`font-display text-xl md:text-2xl font-black tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    Adu StartUp Finance în Școala Ta!
                  </h2>
                  
                  <p className={`text-xs md:text-sm leading-relaxed ${
                    theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'
                  }`}>
                    Dorești să le oferi colegilor tăi acces gratuit la educație financiară premium direct în unitatea ta școlară sau vrei să te implici strategic/financiar ca sponsor? Alege o opțiune:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-center items-stretch">
                    <button
                      onClick={() => openFormModal('school')}
                      className={`relative flex items-center justify-center gap-2 font-bold text-[11px] sm:text-xs px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl transition-all active:scale-95 duration-150 cursor-pointer shadow-sm ${
                        theme === 'light'
                          ? 'bg-[#10B981] hover:bg-[#10B981]/90 text-white shadow-[#10B981]/20'
                          : 'bg-[#10B981] hover:bg-[#10B981]/90 text-black shadow-[#10B981]/15'
                      }`}
                    >
                      <School className="w-3.5 h-3.5 shrink-0" />
                      <span>Vreau StartUp Finance în școala mea</span>
                    </button>

                    <button
                      onClick={() => openFormModal('support')}
                      className={`relative flex items-center justify-center gap-2 font-bold text-[11px] sm:text-xs px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl transition-all active:scale-95 duration-150 cursor-pointer border ${
                        theme === 'light'
                          ? 'bg-transparent border-slate-300 hover:bg-slate-50 text-slate-700'
                          : 'bg-transparent border-[#1F293D] hover:bg-[#151c2f] text-[#E2E8F0]'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                      <span>Vreau să susțin proiectul</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* SOCIAL PROOF LIVE METRIC CARDS GRID */}
              <motion.div 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 max-w-4xl mx-auto"
              >
                
                <div className={`p-6 rounded-2xl relative overflow-hidden group transition-all border ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm shadow-slate-100 hover:border-[#10B981]/40'
                    : 'bg-[#0F1322] border-[#1F293D] hover:border-[#10B981]/30'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <div className={`font-display text-2xl md:text-3xl font-black ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>760+</div>
                      <div className={`text-xs md:text-sm font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>Tineri Activi din România</div>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl relative overflow-hidden group transition-all border ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm shadow-slate-100 hover:border-[#10B981]/40'
                    : 'bg-[#0F1322] border-[#1F293D] hover:border-[#10B981]/30'
                }`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <div className={`font-display text-2xl md:text-3xl font-black ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{communityXP.toLocaleString('en-US')} XP</div>
                      <div className={`text-xs md:text-sm font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>Adunat Azi de Comunitate</div>
                    </div>
                  </div>
                </div>

              </motion.div>

              {/* BOX ADVERT FOR LEARNING PAGE */}
              <motion.div 
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.6 }}
                className={`p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-2xl transition-all duration-300 border ${
                  theme === 'light'
                    ? 'bg-white border-slate-200 text-slate-800 shadow-slate-100 hover:border-[#10B981]/40'
                    : 'bg-[#0F1322] border-[#1F293D] text-[#F8FAFC]/90 hover:border-[#10B981]/30'
                }`}
              >
                <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#10B981]/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-gradient-to-tr from-[#10B981]/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                  
                    {/* Left Column: Visual copy & details */}
                    <div className="space-y-6 max-w-2xl text-left">
                      
                      <h3 className={`font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      Harta Interactivă <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#059669]">
                        a Educației Financiare
                      </span>
                    </h3>
                    
                    <p className={`font-sans text-sm md:text-base font-medium leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-[#64748B]'}`}>
                      Spre deosebire de manualele rigide și plictisitoare, platforma noastră îți oferă un parcurs complet bazat pe <strong className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>sprinturi distractive de 5 minute</strong>. Dobândește abilități antreprenoriale practice, înțelege corect dobânda compusă și explorează strategii reale de investiții concepute special pentru generația ta.
                    </p>
                    
                    {/* Perks list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981] shrink-0 border border-[#10B981]/20">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className={`text-xs md:text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>6 Capitole</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981] shrink-0 border border-[#10B981]/20">
                          <Zap className="w-4 h-4" />
                        </div>
                        <span className={`text-xs md:text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>Primul Start-Up</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981] shrink-0 border border-[#10B981]/20">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className={`text-xs md:text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>Ghid Investiții</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center text-[#10B981] shrink-0 border border-[#10B981]/20">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <span className={`text-xs md:text-sm font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-gray-300'}`}>Activități &amp; Quizuri</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column: Visual CTA Box / Card */}
                  <div className="w-full lg:w-auto shrink-0 self-stretch flex items-center">
                    <div className={`w-full lg:w-[320px] p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group/box border ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-[#050811] border-[#1F293D] text-[#F8FAFC]'
                    }`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-full blur-2xl pointer-events-none group-hover/box:scale-150 transition-all duration-300"></div>
                      
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold font-mono tracking-wider text-[#10B981] uppercase block">Pășește în viitor</span>
                        <h4 className={`text-base font-bold tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Vrei să testezi modulul următor?</h4>
                        <p className={`text-xs font-semibold leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                          Fiecare capitol finalizat îți aduce XP și un status mai ridicat. Deblochează acum nivelul 1 gratuit!
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <button 
                          onClick={() => setActivePage('invatare')}
                          className={`w-full flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#10B981]/95 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-xs py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98] cursor-pointer`}
                        >
                          Explorează (Complet Gratuit)
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        
                        <div className="text-center">
                          <span className="text-[10px] text-gray-500 font-mono font-medium">Acces instant, fără costuri ascunse</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* GATED COMMUNITY ACCESS BLOCK */}
              <div className={`mt-10 border rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all duration-300 ${
                theme === 'light' 
                  ? 'bg-white border-slate-200 text-slate-800 shadow-md shadow-slate-100' 
                  : 'bg-[#0F1322] border-[#1F293D] text-[#F8FAFC]'
              }`}>
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/5 rounded-full blur-3xl"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  
                  <div className="space-y-3 max-w-2xl text-left">
                    <span className="bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 px-3 py-1.5 rounded-full text-xs font-mono font-extrabold tracking-tight uppercase inline-block relative -top-1">
                      👑 GRUP DE NETWORKING PRIVAT
                    </span>
                    <h3 className={`font-display text-xl md:text-3xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      Comunitatea Ambițioasă StartUp Finance
                    </h3>
                    <p className={`${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'} text-xs md:text-sm leading-relaxed font-semibold`}>
                      Interacționează direct cu mentori, investitori angel români, co-fondatori dornici să valideze proiecte și sute de elevi și studenți ambițioși înscriși pe serverele noastre de accelerare.
                    </p>
                  </div>

                  <div className="w-full lg:w-auto shrink-0">
                    {isLoggedIn ? (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <a 
                          href="https://whatsapp.com" 
                          target="_blank" 
                          rel="noreferrer"
                          className={`flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#10B981]/90 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-xs md:text-sm px-5 py-3.5 rounded-xl transition-all shadow-[0_4px_15px_rgba(16,185,129,0.2)]`}
                        >
                          <MessageSquare className="w-4 h-4" /> Alătură-te WhatsApp (+ Feed privat)
                        </a>
                        <a 
                          href="https://discord.com" 
                          target="_blank" 
                          rel="noreferrer"
                          className={`flex items-center justify-center gap-2 bg-transparent font-bold text-xs md:text-sm px-5 py-3.5 rounded-xl border transition-colors ${
                            theme === 'light' 
                              ? 'text-slate-700 border-slate-200 hover:bg-slate-50' 
                              : 'text-white border-[#1F293D] hover:bg-[#1E2538]'
                          }`}
                        >
                          <MessageSquare className="w-4 h-4 text-[#10B981]" /> Server Discord Național
                        </a>
                      </div>
                    ) : (
                      <div className={`border p-5 rounded-2xl space-y-4 shadow-xl ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050811] border-[#1F293D]/70'
                      }`}>
                        <div className={`flex items-center gap-2 font-semibold text-xs md:text-sm select-none ${
                          theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'
                        }`}>
                          <Lock className="w-4 h-4 text-[#F59E0B]" />
                          <span>🔒 Autentifică-te pentru a debloca link-ul de acces WhatsApp &amp; Discord</span>
                        </div>
                        <button 
                          onClick={() => {
                            setAuthMode('signin');
                            setActivePage('auth');
                          }}
                          className={`w-full text-center bg-[#10B981] hover:bg-[#10B981]/90 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95`}
                        >
                          Conectează-te Acum ↗
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* ÎNVĂȚARE & ARTICOLE SCREEN */}
          {activePage === 'invatare' && (
            !isLoggedIn ? (
              <motion.div
                key="invatare-locked"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-md mx-auto px-4 pt-12 text-center space-y-8"
              >
                {/* Visual Locked Banner */}
                <div className="bg-[#0F1322] border border-[#1F293D] p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#10B981]/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="w-16 h-16 bg-[#10B981]/15 border border-[#10B981]/30 rounded-2xl flex items-center justify-center mx-auto text-[#10B981] shadow-inner">
                    <Lock className="w-8 h-8 animate-pulse" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-[#10B981] uppercase bg-[#10B981]/10 px-2.5 py-1 rounded-full border border-[#10B981]/25">
                      Zonă Securizată
                    </span>
                    <h2 className="font-display text-2xl font-black text-white tracking-tight pt-1">
                      Deblochează Harta Învățării
                    </h2>
                    <p className="text-xs md:text-sm text-gray-400 font-semibold leading-relaxed">
                      Creează-ți un cont gratuit sau autentifică-te pentru a accesa cele 6 capitole interactive din Harta Învățării și a aduna tokens XP.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* CTA Register */}
                    <button
                      onClick={() => {
                        setAuthMode('signup');
                        setActivePage('auth');
                      }}
                      className={`w-full bg-[#10B981] hover:bg-[#10B981]/90 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-xs md:text-sm py-3.5 px-4 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)] active:scale-95 cursor-pointer`}
                    >
                      Creează un Cont Gratuit ✨
                    </button>

                    {/* CTA Login with Google */}
                    <button
                      onClick={handleGoogleLogin}
                      className="w-full bg-[#1E2538] hover:bg-[#1E2538]/85 border border-[#1F293D] text-white font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                    >
                      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5.04c1.67 0 3.19.58 4.38 1.69l3.27-3.27C17.67 1.54 14.99 1 12 1 7.35 1 3.32 3.68 1.48 7.57l3.76 2.92c.9-2.7 3.41-4.45 6.76-4.45z"/>
                        <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.44c-.28 1.47-1.11 2.71-2.36 3.56v2.95h3.81c2.23-2.05 3.6-5.07 3.6-8.61z"/>
                        <path fill="#FBBC05" d="M5.24 10.49c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.48 3.01C.54 4.88 0 6.98 0 9.2s.54 4.32 1.48 6.19l3.76-2.9z"/>
                        <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.9l-3.81-2.95c-1.06.71-2.42 1.13-4.15 1.13-3.35 0-5.86-1.75-6.76-4.45L1.48 16.7C3.32 20.32 7.35 23 12 23z"/>
                      </svg>
                      Autentificare rapidă Google
                    </button>

                    <div className="pt-2">
                      <span className="h-[1px] grow bg-[#1F293D] block my-3"></span>
                      <p className="text-[10px] text-[#64748B] text-center leading-relaxed mb-3">
                        ⚠️ Probleme de conexiune pe Netlify/GitHub? Adaugă domeniul tău în Firebase Console &gt; Authorized Domains. Sau pornește instant modul local offline:
                      </p>
                      
                      <button
                        onClick={handleLocalLogin}
                        className="w-full bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[#10B981] font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        ⚡ Continuă ca Oaspete (Salvare Locală)
                      </button>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        setAuthMode('signin');
                        setActivePage('auth');
                      }}
                      className="text-xs font-bold text-[#64748B] hover:text-[#10B981] transition-colors cursor-pointer"
                    >
                      Ai deja un cont? Conectează-te ↗
                    </button>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-normal">
                    Traseul include: Validare de Idei • Educație Fiscală • Marketing Viral
                  </span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="invatare-page"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="max-w-6xl mx-auto px-4 pt-8 space-y-12"
              >
                
                {/* TOP METRICS STRIP HEADER */}
                <div className="bg-[#0F1322] border border-[#1F293D] p-5 md:p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 bg-[#10B981] h-full"></div>
                  
                  <div className="flex items-center gap-3.5 pl-2">
                    {renderProfilePhoto(userProfile.profilePhotoUrl, userProfile.name, "w-12 h-12", userProfile.profilePhotoZoom)}
                    <div className="space-y-1">
                      <div className="text-xs text-[#64748B] font-mono tracking-wider font-bold">PROFIL CONSTRUCTOR</div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl md:text-2xl font-black text-white">{userProfile.name}</h2>
                        <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 rounded-full text-[10px] md:text-xs font-mono font-bold">
                          {rankTitle}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] max-w-md font-medium">
                        Progresul tău actual reflectă dorința de calibrare și rafinare antreprenorială locală.
                      </p>
                    </div>
                  </div>

                  {/* Statistics panel metrics */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="bg-[#1E2538] border border-[#1F293D] px-4 py-2.5 rounded-xl flex items-center gap-3">
                      <Flame className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                      <div>
                        <div className="text-[10px] text-[#64748B] font-mono font-bold leading-none">STREAK</div>
                        <div className="text-sm font-bold font-mono text-[#F59E0B]">{userProfile.streak} ZILE</div>
                      </div>
                    </div>

                    <div className="bg-[#1E2538] border border-[#1F293D] px-4 py-2.5 rounded-xl flex items-center gap-3">
                      <Zap className="w-5 h-5 text-[#10B981]" />
                      <div>
                        <div className="text-[10px] text-[#64748B] font-mono font-bold leading-none">TOTAL XP</div>
                        <div className="text-sm font-bold font-mono text-[#10B981]"><AnimatedCountUp value={userProfile.xp} /> tokens</div>
                      </div>
                    </div>

                    <div className="bg-[#1E2538] border border-[#1F293D] px-4 py-2.5 rounded-xl flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div className="text-[10px] text-[#64748B] font-mono font-bold leading-none">COMPLETATE</div>
                        <div className="text-sm font-bold font-mono text-white">
                          {userProfile.completedNodes.length} / {getOrderedNodes().length} module
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAGE SUB-TABS SELECTOR */}
                {selectedSection === null && (
                  <div className={`flex border-b pb-px mb-4 transition-colors ${
                    theme === 'light' ? 'border-slate-200' : 'border-[#1F293D]/70'
                  }`}>
                    <button
                      onClick={() => setInvatareTab('harta')}
                      className={`px-5 py-3 font-semibold text-xs md:text-sm transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                        invatareTab === 'harta'
                          ? "border-[#10B981] text-[#10B981] font-bold"
                          : theme === 'light'
                            ? "border-transparent text-slate-500 hover:text-slate-800"
                            : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
                      }`}
                    >
                      <Map className="w-4 h-4" />
                      Hartă Învățare
                    </button>
                    <button
                      onClick={() => setInvatareTab('broker')}
                      className={`px-5 py-3 font-semibold text-xs md:text-sm transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${
                        invatareTab === 'broker'
                          ? "border-[#10B981] text-[#10B981] font-bold"
                          : theme === 'light'
                            ? "border-transparent text-slate-500 hover:text-slate-800"
                            : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
                      }`}
                    >
                      <LineChart className="w-4 h-4" />
                      Demo Broker Internațional (BVB, US, EU)
                      {!(
                        branchesData.finance?.nodes?.every(node => userProfile.completedNodes.includes(node.id)) &&
                        branchesData.economics?.nodes?.every(node => userProfile.completedNodes.includes(node.id)) &&
                        branchesData.investing?.nodes?.every(node => userProfile.completedNodes.includes(node.id))
                      ) ? (
                        <span className={`ml-1.5 px-1.5 py-0.5 text-[9px] font-bold rounded flex items-center gap-1 ${
                          theme === 'light' ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-slate-800 text-[#64748B]'
                        }`}>
                          <Lock className="w-2.5 h-2.5" /> Blocat
                        </span>
                      ) : (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-[#10B981]/15 text-[9px] text-[#10B981] font-bold rounded animate-pulse">
                          Deblocat 🔓
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* CORE LEARNING BRANCHES GRAPH TREE MAP */}
                <div className="space-y-6">
                  {selectedSection === null ? (
                    invatareTab === 'harta' ? (
                      // Section Choice Grid
                      <div className="space-y-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="text-center md:text-left space-y-1">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                            🎓 alege ceea ce vrei să înveți
                          </div>
                          <h3 className="font-display text-xl md:text-3xl font-black text-white tracking-tight text-left">
                            Capitolele Educației Tale Financiare
                          </h3>
                          <p className="text-[#64748B] text-xs md:text-sm font-semibold max-w-2xl leading-relaxed text-left">
                            Alege oricare dintre cele 6 secțiuni interactive. Fiecare conține o serie de cursuri distractive (complet gratuite) concepute special pentru a-ți asigura succesul practic.
                          </p>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(() => {
                          return Object.entries(branchesData).map(([sectionKey, branch]) => {
                            const sectionNodes = branch.nodes || [];
                            const completedCount = sectionNodes.filter(n => userProfile.completedNodes.includes(n.id)).length;
                            const totalCount = sectionNodes.length;
                            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                            const isFinished = totalCount > 0 && completedCount === totalCount;

                            // Dynamic assign preselected icons
                            let IconComp = Rocket;
                            let themeColor = "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/25 hover:border-[#10B981]/40";
                            let badgeBg = "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20";
                            
                            if (sectionKey === 'how_to_start_first_startup') {
                              IconComp = Rocket;
                              themeColor = "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/25 hover:border-[#10B981]/40";
                            } else if (sectionKey === 'finance') {
                              IconComp = Zap;
                              themeColor = "text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/25 hover:border-[#F59E0B]/40";
                              badgeBg = "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20";
                            } else if (sectionKey === 'economics') {
                              IconComp = BookOpen;
                              themeColor = "text-[#4285F4] bg-[#4285F4]/15 border-[#4285F4]/25 hover:border-[#4285F4]/40";
                              badgeBg = "bg-[#4285F4]/10 text-[#4285F4] border-[#4285F4]/20";
                            } else if (sectionKey === 'startup') {
                              IconComp = Award;
                              themeColor = "text-emerald-400 bg-emerald-400/15 border-emerald-400/25 hover:border-emerald-400/40";
                              badgeBg = "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
                            } else if (sectionKey === 'marketing') {
                              IconComp = TrendingUp;
                              themeColor = "text-fuchsia-400 bg-fuchsia-400/15 border-fuchsia-400/25 hover:border-fuchsia-400/40";
                              badgeBg = "bg-fuchsia-400/10 text-fuchsia-400 border-fuchsia-400/20";
                            } else if (sectionKey === 'investing') {
                              IconComp = Sparkles;
                              themeColor = "text-[#10C9C1] bg-[#10C9C1]/15 border-[#10C9C1]/25 hover:border-[#10C9C1]/40";
                              badgeBg = "bg-[#10C9C1]/10 text-[#10C9C1] border-[#10C9C1]/20";
                            } else if (sectionKey === 'networking') {
                              IconComp = Users;
                              themeColor = "text-sky-400 bg-sky-400/15 border-sky-400/25 hover:border-sky-400/40";
                              badgeBg = "bg-sky-400/10 text-sky-400 border-sky-400/20";
                            }

                            return (
                              <div
                                key={sectionKey}
                                onClick={() => {
                                  setSelectedSection(sectionKey);
                                }}
                                className="bg-[#0F1322] border border-[#1F293D] hover:border-[#10B981]/50 cursor-pointer hover:-translate-y-1 active:scale-98 group p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-300 shadow-lg"
                              >
                                <div className="space-y-4">
                                  <div className="flex justify-between items-start">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${themeColor.split(' ')[0]} ${themeColor.split(' ')[1]} ${themeColor.split(' ')[2]}`}>
                                      <IconComp className="w-6 h-6" />
                                    </div>
                                    <span className={`text-[10px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-full border ${badgeBg}`}>
                                      {completedCount}/{totalCount} finalizate
                                    </span>
                                  </div>

                                  <div className="space-y-1.5 text-left">
                                    <h4 className="font-display font-black text-base text-white group-hover:text-[#10B981] transition-colors leading-tight">
                                      {branch.title.replace(/^\d+\.\s*/, '')}
                                    </h4>
                                    <p className="text-xs text-[#64748B] font-semibold leading-relaxed line-clamp-3">
                                      {branch.category} • {sectionNodes[0]?.desc}
                                    </p>
                                  </div>
                                </div>

                                {/* Progress bar info for section */}
                                <div className="space-y-2 text-left pt-2">
                                  <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                                    <span className="text-[#64748B]">PROGRES</span>
                                    <span className={isFinished ? "text-[#10B981]" : "text-white"}>{progressPercent}%</span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#1E2538] rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        isFinished ? "bg-[#10B981]" : "bg-[#10B981]/70"
                                      } ${progressPercent > 50 ? "animate-flicker-pulse" : ""}`}
                                      style={{ width: `${progressPercent}%` }}
                                    ></div>
                                  </div>

                                  <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#10B981]">
                                    <span>{isFinished ? "Revizuiește modulul ✓" : "Începe studiul ⚡"}</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  ) : (
                    // ==========================================
                    // DYNAMIC BROKER PLATFORM SANDBOX INTERACTIVE
                    // ==========================================
                    <div className={`space-y-8 p-6 md:p-8 rounded-3xl border transition-all ${
                      theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-100'
                        : 'bg-[#0B0F1C] border-[#1F293D] text-zinc-100 shadow-2xl'
                    }`}>
                      
                      {/* Sub tab info / locked screen check */}
                      {!(
                        branchesData.finance?.nodes?.every(node => userProfile.completedNodes.includes(node.id)) &&
                        branchesData.economics?.nodes?.every(node => userProfile.completedNodes.includes(node.id)) &&
                        branchesData.investing?.nodes?.every(node => userProfile.completedNodes.includes(node.id))
                      ) ? (
                        /* LOCKED STATE UI */
                        <div className="py-12 px-6 text-center max-w-xl mx-auto space-y-6">
                          <div className="w-20 h-20 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-bounce">
                            <Lock className="w-10 h-10 text-amber-500" />
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className={`text-xl md:text-2xl font-black ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                              Demo Broker Blocat 🔒
                            </h4>
                            <p className="text-xs md:text-sm text-[#64748B] leading-relaxed font-semibold">
                              Pentru a debloca simulatorul complet de broker internațional (tranzacționare în timp real BVB, SUA, Europa), trebuie să finalizezi complet cele 3 cursuri fundamentale:
                            </p>
                          </div>

                          {/* Requirements Indicators list */}
                          <div className={`p-4 rounded-2xl border text-left space-y-3.5 ${
                            theme === 'light' ? 'bg-slate-50 border-slate-200 shadow-xs' : 'bg-[#060913] border-[#1f293d]/50'
                          }`}>
                            {[
                              { 
                                name: "1. Finanțe Personale", 
                                nodes: branchesData.finance?.nodes || [], 
                                key: 'finance',
                                color: "text-[#F59E0B]"
                              },
                              { 
                                name: "2. Economie Macro & Micro", 
                                nodes: branchesData.economics?.nodes || [], 
                                key: 'economics',
                                color: "text-[#4285F4]"
                              },
                              { 
                                name: "3. Investiții Fundamentale", 
                                nodes: branchesData.investing?.nodes || [], 
                                key: 'investing',
                                color: "text-[#10C9C1]"
                              }
                            ].map((reqItem) => {
                              const done = reqItem.nodes.every(node => userProfile.completedNodes.includes(node.id));
                              const completedSteps = reqItem.nodes.filter(node => userProfile.completedNodes.includes(node.id)).length;
                              const totalSteps = reqItem.nodes.length;
                              return (
                                <div key={reqItem.key} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-700' : 'text-zinc-200'}`}>
                                      {reqItem.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
                                    <span className={theme === 'light' ? 'text-slate-600' : 'text-neutral-400'}>
                                      ({completedSteps}/{totalSteps})
                                    </span>
                                    {done ? (
                                      <span className="text-emerald-500">Deblocat ✓</span>
                                    ) : (
                                      <span className="text-amber-500 flex items-center gap-1">🔒 În lucru</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-center pt-2">
                            <button
                              onClick={() => setInvatareTab('harta')}
                              className="px-6 py-2.5 bg-[#10B981] hover:bg-emerald-500 text-black font-extrabold text-xs rounded-xl cursor-pointer shadow-md shadow-emerald-500/10 uppercase tracking-wider"
                            >
                              Mergi la Hartă și Studiază ⚡
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* UNLOCKED FULL SYSTEM INTEGRATED BROKER SANDBOX */
                        <div className="space-y-6">
                          
                          {/* HEADER INTRO */}
                          <div className="border-b border-[#1F293D]/50 pb-4 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <div className="inline-flex items-center gap-1 text-[9px] font-mono font-bold uppercase text-[#10B981] bg-[#10B981]/15 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                                <Sparkles className="w-3 h-3 text-[#10B981]" /> PREMIUM BROKER SIMULATOR ACTIVE 🔓
                              </div>
                              <h3 className={`font-display text-2xl font-black mt-1 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                                Broker Demo Internațional &amp; BVB
                              </h3>
                              <p className="text-xs text-[#64748B] font-semibold">
                                Antrenează-te pe date simulate. Deține fracțiuni, analizează graficele și asimilează regulile pieței libere!
                              </p>
                            </div>
                            
                            <div className="shrink-0 flex items-center gap-3">
                              <button
                                onClick={handleSimulateNextDay}
                                className="px-4 py-2.5 bg-[#10B981] text-black font-extrabold rounded-xl text-xs flex items-center gap-2 hover:bg-emerald-500 cursor-pointer shadow-lg shadow-emerald-500/15"
                              >
                                <RefreshCw className="w-4 h-4 animate-spin-hover" /> Actualizează Prețuri (Bursa Următoarea Zi)
                              </button>
                            </div>
                          </div>

                          {/* INTERACTIVE GUIDE CAROUSEL / DIALOG STEP */}
                          {brokerStep <= 3 && (
                            <div className={`p-4 md:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden ${
                              theme === 'light' ? 'bg-emerald-50/40 border-emerald-100 shadow-md shadow-emerald-500/5' : 'bg-[#0E1B26]/30 border-cyan-900/30'
                            }`}>
                              <div className="absolute top-0 left-0 w-1 bg-emerald-505 h-full"></div>
                              <div className="space-y-1.5 pl-3 text-left max-w-2xl">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-emerald-500 text-black text-[10px] font-bold rounded-md flex items-center justify-center font-mono">
                                    {brokerStep + 1}
                                  </span>
                                  <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">
                                    {brokerStep === 0 && "Pasul 1: Prețurile și Tickerii de Acțiuni"}
                                    {brokerStep === 1 && "Pasul 2: Istoric & Analiză Grafică"}
                                    {brokerStep === 2 && "Pasul 3: Executarea Ordinelor Market"}
                                    {brokerStep === 3 && "Pasul 4: Management de Portofoliu"}
                                  </span>
                                </div>
                                <h4 className={`text-sm md:text-base font-bold leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-neutral-100'}`}>
                                  {brokerStep === 0 && "Înțelege simbolurile bursiere reprezentând piețele internaționale și BVB"}
                                  {brokerStep === 1 && "Trasează cursul și fluctuația istorică sau generează noi evoluții (Random Walk)"}
                                  {brokerStep === 2 && "Efectuează tranzacții imediate folosind cele două monede virtuale"}
                                  {brokerStep === 3 && "Evaluează indicatorul P&L pentru a înțelege randamentul investițiilor brute"}
                                </h4>
                                <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
                                  {brokerStep === 0 && "Pentru tranzacționarea din România (BVB) folosim contul tău în RON, iar pentru giganții americani sau companiile europene precum ASML decontăm automat în USD/EUR cu curs demonstrativ instant!"}
                                  {brokerStep === 1 && "Click pe orice rând din gama de active de mai jos pentru a actualiza graficul de piață interactiv și a vizualiza un nou istoric de zece ticks."}
                                  {brokerStep === 2 && "Specifică suma de acțiuni în panoul din dreapta, selectează Buy sau Sell și bifează-ți primul plasament de succes!"}
                                  {brokerStep === 3 && "Pe măsură ce actualizezi prețurile generale de bursa, activele deținute de tine își vor schimba valoarea netă, arătându-ți profitul virtual exact."}
                                </p>
                              </div>

                              <div className="shrink-0 flex md:flex-col items-end gap-3 justify-end pt-2 md:pt-0 pr-2">
                                <span className="text-[10px] font-mono text-[#64748B] font-black uppercase">Ghid Broker pas-cu-pas</span>
                                <div className="flex items-center gap-1.5">
                                  {brokerStep > 0 && (
                                    <button
                                      onClick={() => setBrokerStep(prev => prev - 1)}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border cursor-pointer ${
                                        theme === 'light' ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-800 border-slate-700 text-white'
                                      }`}
                                    >
                                      Înapoi
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setBrokerStep(prev => prev + 1)}
                                    className="px-3.5 py-1.5 bg-emerald-500 text-black font-extrabold text-[10px] rounded-lg cursor-pointer"
                                  >
                                    Înainte
                                  </button>
                                  <button
                                    onClick={() => setBrokerStep(4)}
                                    className="px-2 py-1 bg-transparent hover:underline text-[10px] text-[#64748B] font-bold"
                                  >
                                    Ocolește
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* BALANCES PANEL */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                            <div className={`p-4 rounded-2xl border text-left flex items-center justify-between ${
                              theme === 'light' ? 'bg-slate-50/50 border-slate-250 shadow-xs' : 'bg-[#101424] border-[#1F293D]'
                            }`}>
                              <div>
                                <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase">Balanță Virtuală RON (BVB)</span>
                                <div className="text-lg md:text-xl font-bold font-mono text-[#10B981] mt-0.5">
                                  {brokerBalanceRon.toLocaleString('ro-RO')} <span className="text-[10px] font-bold">RON</span>
                                </div>
                              </div>
                              <span className="text-2xl pt-1">🇷🇴</span>
                            </div>

                            <div className={`p-4 rounded-2xl border text-left flex items-center justify-between ${
                              theme === 'light' ? 'bg-slate-50/50 border-slate-250 shadow-xs' : 'bg-[#101424] border-[#1F293D]'
                            }`}>
                              <div>
                                <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase">Balanță Virtuală USD (SUA)</span>
                                <div className="text-lg md:text-xl font-bold font-mono text-[#10B981] mt-0.5">
                                  ${brokerBalanceUsd.toLocaleString('en-US')} <span className="text-[10px] font-bold">USD</span>
                                </div>
                              </div>
                              <span className="text-2xl pt-1">🇺🇸</span>
                            </div>

                            <div className={`p-4 rounded-2xl border text-left flex items-center justify-between ${
                              theme === 'light' ? 'bg-slate-50/50 border-slate-250 shadow-xs' : 'bg-[#101424] border-[#1F293D]'
                            }`}>
                              <div>
                                <span className="text-[9px] font-mono font-bold text-[#64748B] uppercase">Valoare Totală Portofoliu</span>
                                <div className={`text-lg md:text-xl font-bold font-mono mt-0.5 ${theme === 'light' ? 'text-slate-800' : 'text-zinc-100'}`}>
                                  {(() => {
                                    let totalInRon = brokerBalanceRon;
                                    totalInRon += brokerBalanceUsd * 4.60; // conversion rate for presentation
                                    
                                    // Add stock current value
                                    Object.entries(brokerShares).forEach(([sym, qty]) => {
                                      const stock = brokerStocks[sym] as { name: string; price: number; currency: 'USD' | 'RON' | 'EUR'; type: 'BVB' | 'US' | 'EU'; history: number[] } | undefined;
                                      if (stock) {
                                        let assetVal = stock.price * (qty as number);
                                        if (stock.currency === 'USD') {
                                          assetVal *= 4.60;
                                        } else if (stock.currency === 'EUR') {
                                          assetVal *= 4.97;
                                        }
                                        totalInRon += assetVal;
                                      }
                                    });
                                    return `${Math.round(totalInRon).toLocaleString('ro-RO')} RON`;
                                  })()}
                                </div>
                              </div>
                              <span className="text-2xl pt-1">📊</span>
                            </div>
                          </div>

                          {/* GRID LAYOUT: LEFT SIDE MARKET LIST, RIGHT SIDE CHART & FORM */}
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* ACTIVE TICKERS GRID (Col Span 5) */}
                            <div className={`lg:col-span-5 rounded-2xl border p-4 space-y-3.5 text-left ${
                              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0E1322] border-[#1F293D]'
                            }`}>
                              <div className="flex items-center justify-between border-b pb-2 sm:pb-3 border-[#1f293d]/50">
                                <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>
                                  Active Disponibile BVB / INT
                                </h4>
                                <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">LIVE</span>
                              </div>

                              <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
                                {Object.entries(brokerStocks).map(([symbol, rawStock]) => {
                                  const stock = rawStock as { name: string; price: number; currency: 'USD' | 'RON' | 'EUR'; type: 'BVB' | 'US' | 'EU'; history: number[] };
                                  // compute simulated trend change
                                  const trendPercent = stock.history.length > 1 
                                    ? ((stock.price - stock.history[stock.history.length - 2]) / stock.history[stock.history.length - 2]) * 100
                                    : 0;

                                  const isSelected = selectedStock === symbol;
                                  
                                  return (
                                    <div
                                      key={symbol}
                                      onClick={() => setSelectedStock(symbol)}
                                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                        isSelected 
                                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-400"
                                          : theme === 'light'
                                            ? "bg-slate-50 hover:bg-slate-100 border-slate-150 text-slate-800"
                                            : "bg-[#0A0D18] hover:bg-[#11172A] border-[#1F293D] text-zinc-300"
                                      }`}
                                    >
                                      <div className="text-left space-y-0.5">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-mono font-black text-xs px-1.5 py-0.5 bg-slate-800 rounded text-slate-100 border border-slate-750">
                                            {symbol}
                                          </span>
                                          <span className="text-[10px] font-mono text-[#64748B] font-bold">
                                            {stock.type === 'BVB' ? "🇷🇴 BVB" : stock.type === 'US' ? "🇺🇸 SUA" : "🇪🇺 EU"}
                                          </span>
                                        </div>
                                        <div className="text-[10px] truncate max-w-[125px] font-semibold text-[#64748B] mt-0.5">
                                          {stock.name.split(' (')[0]}
                                        </div>
                                      </div>

                                      <div className="text-right font-mono space-y-0.5">
                                        <div className="text-xs font-bold font-mono">
                                          {stock.price.toLocaleString()} {stock.currency}
                                        </div>
                                        <div className={`text-[10px] font-bold flex items-center gap-0.5 justify-end ${
                                          trendPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                          {trendPercent >= 0 ? "▲" : "▼"}{Math.abs(trendPercent).toFixed(1)}%
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* CHART & ORDER SUB-PANEL (Col Span 7) */}
                            <div className="lg:col-span-7 space-y-6 text-left">
                              {/* CHART BLOCK */}
                              <div className={`rounded-2xl border p-4 text-left space-y-4 ${
                                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0E1322] border-[#1F293D]'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="text-[9px] font-mono text-[#64748B] font-bold uppercase">Grafic de Evoluție Ticks</span>
                                    <h4 className={`text-sm font-black flex items-center gap-2 mt-0.5 ${
                                      theme === 'light' ? 'text-slate-800' : 'text-zinc-100'
                                    }`}>
                                      {brokerStocks[selectedStock]?.name} ({selectedStock})
                                    </h4>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className="text-xs font-bold text-emerald-500">
                                      {brokerStocks[selectedStock]?.price} {brokerStocks[selectedStock]?.currency}
                                    </span>
                                  </div>
                                </div>

                                {/* Custom premium SVG simulated Line Chart */}
                                {(() => {
                                  const stock = brokerStocks[selectedStock];
                                  if (!stock) return null;
                                  const history = stock.history;
                                  
                                  const width = 500;
                                  const height = 220;
                                  const padding = 30;
                                  
                                  const minVal = Math.min(...history) * 0.98;
                                  const maxVal = Math.max(...history) * 1.02;
                                  const valRange = maxVal - minVal;
                                  
                                  // map data points to coordinates
                                  const points = history.map((price, idx) => {
                                    const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
                                    const y = height - padding - ((price - minVal) / valRange) * (height - padding * 2);
                                    return { x, y, price };
                                  });
                                  
                                  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                                  const areaData = `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
                                  
                                  return (
                                    <div className="relative">
                                      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
                                        <defs>
                                          <linearGradient id="chartGradientBroker" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                                          </linearGradient>
                                        </defs>
                                        
                                        {/* Draw horizontal gridlines & prices */}
                                        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                                          const val = maxVal - ratio * valRange;
                                          const y = padding + ratio * (height - padding * 2);
                                          return (
                                            <g key={i} className="opacity-40">
                                              <line 
                                                x1={padding} 
                                                y1={y} 
                                                x2={width - padding} 
                                                y2={y} 
                                                stroke={theme === 'light' ? '#CBD5E1' : '#1F293D'} 
                                                strokeDasharray="4 4" 
                                              />
                                              <text 
                                                x={width - padding + 5} 
                                                y={y + 4} 
                                                fill="#64748B" 
                                                className="text-[9px] font-mono font-bold"
                                              >
                                                {val.toFixed(stock.currency === 'USD' || stock.currency === 'EUR' ? 1 : 2)} {stock.currency}
                                              </text>
                                            </g>
                                          );
                                        })}
                                        
                                        {/* Area under line */}
                                        <path d={areaData} fill="url(#chartGradientBroker)" />
                                        
                                        {/* Main Line */}
                                        <path d={pathData} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                        
                                        {/* Data points */}
                                        {points.map((p, i) => (
                                          <g key={i} className="group">
                                            <circle 
                                              cx={p.x} 
                                              cy={p.y} 
                                              r={i === points.length - 1 ? 5 : 3.5} 
                                              fill={i === points.length - 1 ? '#10B981' : (theme === 'light' ? '#FFFFFF' : '#0F1322')} 
                                              stroke="#10B981" 
                                              strokeWidth="2" 
                                            />
                                          </g>
                                        ))}
                                      </svg>
                                      {/* Footer timeframe tags */}
                                      <div className="flex justify-between px-6 text-[10px] font-mono text-[#64748B] font-bold">
                                        <span>Ziua {history.length - 14}</span>
                                        <span>Evoluție Portofoliu</span>
                                        <span>Preț Curent Ticks</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* ORDER EXECUTION FORM PANEL */}
                              <div className={`rounded-2xl border p-5 text-left space-y-4 ${
                                theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0E1322] border-[#1F293D]'
                              }`}>
                                <h4 className={`text-xs font-black uppercase tracking-wider border-b pb-2 ${
                                  theme === 'light' ? 'text-slate-700 border-slate-100' : 'text-zinc-300 border-[#1f293d]/50'
                                }`}>
                                  Execuție Mandat Instant (Market Order Form)
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-1.5 text-left">
                                    <label className={`text-xs font-bold ${theme === 'light' ? 'text-slate-600' : 'text-neutral-400'}`}>
                                      Cantitate Acțiuni:
                                    </label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={brokerAmountInput}
                                      onChange={(e) => setBrokerAmountInput(e.target.value)}
                                      className={`w-full font-mono font-bold rounded-xl p-2.5 text-xs border focus:outline-none focus:border-[#10B981]/50 ${
                                        theme === 'light' 
                                          ? 'bg-slate-50 border-slate-200 text-slate-800' 
                                          : 'bg-[#090D1A] border-[#1F293D] text-white'
                                      }`}
                                    />
                                    <span className="text-[10px] text-[#64748B] font-semibold block mt-1">
                                      Deții: {brokerShares[selectedStock] || 0} unități din {selectedStock}
                                    </span>
                                  </div>

                                  <div className="space-y-1.5 text-left flex flex-col justify-end">
                                    <div className="text-xs font-bold flex justify-between p-1">
                                      <span className={theme === 'light' ? 'text-slate-600' : 'text-neutral-400'}>Cost Total Ordin:</span>
                                      <span className={theme === 'light' ? 'text-slate-800 font-extrabold font-mono' : 'text-zinc-200 font-extrabold font-mono'}>
                                        {(() => {
                                          const stock = brokerStocks[selectedStock];
                                          const qty = parseInt(brokerAmountInput, 10) || 0;
                                          return stock ? `${(stock.price * qty).toFixed(2)} ${stock.currency}` : '0.00';
                                        })()}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-[#10B981] font-semibold text-right p-1 leading-normal">
                                      {brokerStocks[selectedStock]?.currency === 'EUR' && "*EUR decontat instant în RON la curs 4.97"}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3.5 pt-1">
                                  <button
                                    onClick={handleBuyStock}
                                    className="py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                                  >
                                    <Check className="w-4 h-4" /> CUMPĂRĂ (Buy)
                                  </button>
                                  <button
                                    onClick={handleSellStock}
                                    className={`py-3 font-extrabold rounded-xl text-xs uppercase tracking-wider cursor-pointer border flex items-center justify-center gap-1.5 ${
                                      theme === 'light' 
                                        ? 'bg-white border-slate-350 text-slate-700 hover:bg-slate-50 shadow-xs' 
                                        : 'bg-transparent border-[#1F293D] text-white hover:bg-slate-800'
                                    }`}
                                  >
                                    <X className="w-4 h-4" /> VINDE (Sell)
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* OWNED PORTFOLIO LEDGER LIST */}
                          <div className={`rounded-2xl border p-5 text-left space-y-4 ${
                            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0E1322] border-[#1F293D]'
                          }`}>
                            <div className="flex items-center justify-between border-b pb-2 sm:pb-3 border-[#1f293d]/50">
                              <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-slate-700' : 'text-zinc-300'}`}>
                                Portofoliul tău curent de sandbox
                              </h4>
                              <span className="text-[10px] font-mono text-[#64748B] font-bold">
                                {Object.keys(brokerShares).length} Active Deținute
                              </span>
                            </div>

                            {Object.keys(brokerShares).length === 0 ? (
                              <div className="p-8 text-center text-[#64748B] text-xs font-semibold leading-relaxed">
                                Nu ai achiziționat nicio acțiune în simulator momentan. Tranzacționează activele de mai sus pentru a genera profit!
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs font-semibold">
                                  <thead>
                                    <tr className={`text-[10px] font-mono uppercase border-b text-[#64748B] font-bold ${
                                      theme === 'light' ? 'border-slate-100' : 'border-[#1f293d]/50'
                                    }`}>
                                      <th className="pb-2.5">Simbol</th>
                                      <th className="pb-2.5">Companie / Piață</th>
                                      <th className="pb-2.5">Cantitate</th>
                                      <th className="pb-2.5">Preț Ticks</th>
                                      <th className="pb-2.5">Valoare Totală</th>
                                      <th className="pb-2.5">Tranzacție</th>
                                    </tr>
                                  </thead>
                                  <tbody className={`divide-y font-mono ${
                                    theme === 'light' ? 'divide-slate-100' : 'divide-[#1f293d]/50'
                                  }`}>
                                    {Object.entries(brokerShares).map(([sym, qty]) => {
                                      const stock = brokerStocks[sym] as { name: string; price: number; currency: 'USD' | 'RON' | 'EUR'; type: 'BVB' | 'US' | 'EU'; history: number[] } | undefined;
                                      if (!stock) return null;
                                      
                                      const totalValRaw = stock.price * (qty as number);
                                      
                                      return (
                                        <tr key={sym} className={theme === 'light' ? 'text-slate-800' : 'text-neutral-200'}>
                                          <td className="py-3 font-black text-emerald-500">{sym}</td>
                                          <td className="py-3 text-left font-semibold text-[#64748B]">{stock.name}</td>
                                          <td className="py-3 font-bold">{qty} unități</td>
                                          <td className="py-3 font-bold">{stock.price} {stock.currency}</td>
                                          <td className="py-3 font-black text-[#10B981]">
                                            {totalValRaw.toLocaleString()} {stock.currency}
                                          </td>
                                          <td className="py-3">
                                            <button
                                              onClick={() => {
                                                setSelectedStock(sym);
                                                setBrokerAmountInput(qty.toString());
                                              }}
                                              className="text-[10px] text-[#10B981] hover:underline font-extrabold cursor-pointer uppercase"
                                            >
                                              Ridică în ordin ↗
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                          
                        </div>
                      )}
                    </div>
                  )) : (
                    // Section-Specific Roadmap (The Timeline)
                    <div className="space-y-8">
                      {/* Sub-Header bar for the course */}
                      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b ${
                        theme === 'light' ? 'border-slate-200' : 'border-[#1F293D]'
                      }`}>
                        <div className="space-y-1 text-left">
                          <button
                            onClick={() => setSelectedSection(null)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold font-mono transition-all mb-2 cursor-pointer px-3 py-1.5 rounded-lg border ${
                              theme === 'light'
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-[#10B981] border-slate-250 shadow-sm"
                                : "bg-[#1E2538]/50 text-[#64748B] hover:text-[#10B981] border-[#1F293D]"
                            }`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Toate capitolele
                          </button>
                          <h3 className={`font-display text-xl md:text-2xl font-black tracking-tight ${
                            theme === 'light' ? 'text-slate-800' : 'text-white'
                          }`}>
                            {branchesData[selectedSection].title}
                          </h3>
                          <p className={`text-xs font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                            {branchesData[selectedSection].category} • Finalizează fiecare lecție pentru a-ți debloca drumul complet.
                          </p>
                        </div>
                        <div className="bg-[#10B981]/15 border border-[#10B981]/20 px-4 py-2 rounded-xl flex items-center gap-2">
                          <span className="text-[10px] bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded-full font-mono font-bold uppercase">Gratuit</span>
                          <span className={`text-xs font-bold font-mono ${theme === 'light' ? 'text-slate-700' : 'text-white'}`}>
                            {branchesData[selectedSection].nodes.filter(n => userProfile.completedNodes.includes(n.id)).length} / {branchesData[selectedSection].nodes.length} Complete
                          </span>
                        </div>
                      </div>

                      <div className="relative max-w-3xl mx-auto py-8 px-2 text-left">
                        {/* Timeline tree mapping */}
                        <div className="flex flex-col">
                          {getOrderedNodes(selectedSection).map((node, index) => {
                            const isCompleted = userProfile.completedNodes.includes(node.id);
                            const isUnlocked = isNodeUnlockedLinear(node.id, selectedSection);
                            const isActive = isUnlocked && !isCompleted;
                            const isLast = index === getOrderedNodes(selectedSection).length - 1;

                            return (
                              <div 
                                key={node.id} 
                                className={`relative flex items-start gap-4 md:gap-6 group transition-all duration-300 ${
                                  isLast ? 'pb-0' : 'pb-12'
                                } ${
                                  isUnlocked ? 'opacity-100' : 'opacity-45'
                                }`}
                              >
                                {/* Left Column: holds Circle and Connector line */}
                                <div className="relative flex flex-col items-center shrink-0 w-[48px] md:w-[58px]">
                                  {/* Circular Stepping Stone Badge */}
                                  <div 
                                    onClick={() => {
                                      if (isUnlocked) {
                                        setSelectedAnswer(null);
                                        setQuizFeedback({ status: null, message: "" });
                                        setModalStep('theory');
                                        setActiveQuestionIdx(0);
                                        setActiveModalNode(node);
                                        setCheckedTheoryBullets(new Array(node.theory?.bullets?.length || 0).fill(false));
                                      }
                                    }}
                                    className={`w-[48px] h-[48px] md:w-[58px] md:h-[58px] rounded-full flex items-center justify-center font-mono font-bold text-sm border-2 transition-all cursor-pointer select-none relative z-10 ${
                                      isCompleted 
                                        ? `bg-[#10B981] border-[#10B981] ${theme === 'light' ? 'text-white' : 'text-black'} shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105`
                                        : isActive
                                          ? theme === 'light'
                                            ? 'bg-white border-[#10B981] text-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:scale-105 animate-pulse'
                                            : 'bg-[#1E2538] border-[#10B981] text-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-105 animate-pulse'
                                          : theme === 'light'
                                            ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                                            : 'bg-[#050811] border-[#1F293D] text-[#64748B] cursor-not-allowed'
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <Check className="w-5 h-5 stroke-[3]" />
                                    ) : isActive ? (
                                      <Play className="w-4 h-4 fill-[#10B981] ml-0.5" />
                                    ) : (
                                      <Lock className="w-4 h-4" />
                                    )}
                                  </div>

                                  {/* Centered connector line down to next item */}
                                  {!isLast && (
                                    <div className="absolute top-[48px] md:top-[58px] bottom-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-b from-[#10B981] via-[#10B981]/40 to-[#1F293D] rounded-full pointer-events-none z-0"></div>
                                  )}
                                </div>

                                {/* Detail Card Block */}
                                <div 
                                  onClick={() => {
                                    if (isUnlocked) {
                                      setSelectedAnswer(null);
                                      setQuizFeedback({ status: null, message: "" });
                                      setModalStep('theory');
                                      setActiveQuestionIdx(0);
                                      setActiveModalNode(node);
                                    }
                                  }}
                                  className={`grow border rounded-2xl p-5 transition-all duration-300 overflow-hidden relative ${
                                    isCompleted 
                                      ? theme === 'light'
                                        ? 'bg-emerald-50/40 border-emerald-200 hover:bg-emerald-50/70 cursor-pointer'
                                        : 'bg-[#10B981]/5 border-[#10B981]/35 hover:bg-[#10B981]/10 cursor-pointer'
                                      : isActive
                                        ? theme === 'light'
                                          ? 'bg-white border-slate-200 hover:border-[#10B981]/50 shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5'
                                          : 'bg-[#0F1322] border-[#1F293D] hover:border-[#10B981]/50 shadow-lg cursor-pointer transform hover:-translate-y-0.5'
                                        : theme === 'light'
                                          ? 'bg-slate-50/20 border-dashed border-slate-200 text-slate-400 cursor-not-allowed'
                                          : 'bg-[#050811]/30 border-dashed border-[#1F293D] text-[#64748B] cursor-not-allowed'
                                  }`}
                                >
                                  {isCompleted && (
                                    <span className="absolute top-0 right-0 bg-[#10B981]/15 text-[#10B981] text-[9px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-bl-xl border-l border-b border-[#10B981]/30 uppercase">
                                      finalizat
                                    </span>
                                  )}
                                  {isActive && (
                                    <span className="absolute top-0 right-0 bg-amber-500/10 text-amber-500 text-[9px] font-bold font-mono tracking-wider px-2.5 py-1 rounded-bl-xl border-l border-b border-amber-500/20 uppercase">
                                      activ
                                    </span>
                                  )}

                                  <div className="space-y-1.5 pr-10 text-left">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono tracking-wider text-[#64748B] uppercase">
                                      <span>Nivel {index + 1}</span>
                                      <span>•</span>
                                      <span className="text-[#10B981]">{node.type}</span>
                                      <span>•</span>
                                      <span className="text-amber-500">+{node.xp} XP</span>
                                    </div>

                                    <h4 className={`font-display font-bold text-sm md:text-base ${
                                      theme === 'light' ? 'text-slate-800' : 'text-white'
                                    }`}>
                                      {node.title}
                                    </h4>

                                    <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
                                      {node.desc}
                                    </p>

                                    {isActive && (
                                      <div className="pt-3 flex items-center justify-between text-[11px] font-bold text-[#10B981] uppercase tracking-wider">
                                        <span className="inline-flex items-center gap-1">
                                          <Lightbulb className="w-3.5 h-3.5" /> Începe instruirea
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-[#10B981]" />
                                      </div>
                                    )}
                                    {isCompleted && (
                                      <div className="pt-2 text-[10px] font-bold text-emerald-400/85">
                                        ✓ Conținut asimilat. Revizuiește oricând!
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

            </motion.div>
          ))}

          {/* DEDICATED ARTICLES SCREEN */}
          {activePage === 'articole' && (
            <motion.div
              key="articole-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto px-4 pt-8 space-y-12"
            >
              
              {/* HEADING HERO BANNER */}
              <div className="bg-[#0F1322] border border-[#1F293D] p-6 md:p-10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 max-w-3xl space-y-4">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-[#10B981] uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" /> Resurse educaționale verificate
                  </div>
                  <h2 className="font-display text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                    Ghiduri Practice pentru Economie &amp; Business
                  </h2>
                  <p className="text-sm text-[#64748B] font-medium leading-relaxed">
                    Sursa ta oficială de analize legislative și strategice actualizate pentru contextul fiscal din România. Înțelege cum să îți declari veniturile, cum funcționează bursele sau cum să folosești strategii globale de marketing local.
                  </p>
                </div>
              </div>

              {/* SEARCH & FILTERS CONTROLLER */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1F293D] pb-6">
                  <div>
                    <h3 className="font-display text-lg md:text-xl font-bold text-white tracking-tight">
                      Toate Ghidurile Disponibile
                    </h3>
                    <p className="text-xs text-[#64748B] font-medium">
                      Selectează o categorie sau caută termeni specifici precum PFA, ANAF, Tradeville, companii sau TikTok.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                      <input 
                        type="text"
                        placeholder="Caută în ghiduri..."
                        value={articleSearchQuery}
                        onChange={(e) => setArticleSearchQuery(e.target.value)}
                        className="w-full sm:w-64 bg-[#0F1322] border border-[#1F293D] focus:border-[#10B981] rounded-xl px-9 py-2 text-xs md:text-sm outline-none text-white transition-colors"
                      />
                      {articleSearchQuery && (
                        <button 
                          onClick={() => setArticleSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category selectors Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  {["Toate", "Finanțe & Taxe", "Investiții", "Startups"].map((category) => (
                    <button
                      key={category}
                      onClick={() => setArticleFilter(category)}
                      className={`text-xs px-4 py-2 rounded-full font-semibold transition-all cursor-pointer ${
                        articleFilter === category
                          ? "bg-[#10B981] text-white font-black shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
                          : theme === 'light'
                            ? 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                            : 'bg-[#0F1322] border border-[#1F293D]/50 text-[#64748B] hover:text-[#F8FAFC]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Articles Card list rendering */}
                {filteredArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredArticles.map((article, i) => (
                      <div 
                        key={i}
                        className={`hover:-translate-y-1 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between border ${
                          theme === 'light'
                            ? 'bg-white border-slate-200 shadow-sm hover:border-[#10B981]/60'
                            : 'bg-[#0F1322] border-[#1F293D] hover:border-[#10B981]/25'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                            <span className="text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">{article.category}</span>
                            <span className="text-[#64748B] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> {article.readTime} lectură
                            </span>
                          </div>

                          <h4 className={`font-display font-bold text-base md:text-lg tracking-tight leading-snug line-clamp-2 ${
                            theme === 'light' ? 'text-slate-800' : 'text-white'
                          }`}>
                            {article.title}
                          </h4>

                          <p className={`text-xs font-medium leading-relaxed line-clamp-3 ${
                            theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'
                          }`}>
                            {article.excerpt}
                          </p>
                        </div>

                        <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
                          theme === 'light' ? 'border-slate-100' : 'border-[#1F293D]'
                        }`}>
                          <button 
                            onClick={() => {
                              setActiveArticleReader(article);
                              setUserProfile(prev => {
                                const quests = prev.dailyQuests || { chatAsked: false, nodeCompleted: false, articleRead: false, lastResetDate: new Date().toISOString().split('T')[0] };
                                if (quests.articleRead) return prev;

                                const updatedQuests = { ...quests, articleRead: true };
                                setTimeout(() => {
                                  setSuccessToast("Misiune deblocată! +10 XP pentru lectura unui ghid de business! 📰⚡");
                                }, 600);

                                return {
                                  ...prev,
                                  xp: prev.xp + 10,
                                  dailyQuests: updatedQuests
                                };
                              });
                            }}
                            className={`text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              theme === 'light' ? 'text-slate-700 hover:text-[#10B981]' : 'text-white hover:text-[#10B981]'
                            }`}
                          >
                            Citește articolul <ChevronRight className="w-4 h-4" />
                          </button>
                          {article.source && (
                            <span className="text-[10px] text-[#64748B] font-mono italic shrink-0 max-w-[140px] truncate" title={article.source}>
                              Sursa: {article.source}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-12 border rounded-2xl space-y-3 ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
                  }`}>
                    <HelpCircle className="w-12 h-12 text-[#64748B] mx-auto animate-bounce" />
                    <h4 className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Niciun ghid identificat</h4>
                    <p className={`text-xs max-w-md mx-auto ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                      Nu s-au găsit rezultate potrivite filtrelor selectate. Încearcă o altă căutare sau alege categoria implicită "Toate".
                    </p>
                  </div>
                )}

              </div>

              {/* HANDS-ON KNOWLEDGE HIGHLIGHT FOR USER-READINESS */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border rounded-2xl transition-all ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#050811] border-[#1F293D]'
              }`}>
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B]">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Declararea veniturilor la ANAF în 2026</h4>
                  <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-[#64748B]'}`}>
                    Dacă depășești plafoanele de 6, 12 sau 24 salarii minime brute pe țară din activități de freelancing, este obligatoriu să depui Declarația Unică în Spațiul Privat Virtual (SPV). Folosirea e-Factura acoperă majoritatea B2B în România.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h4 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Cum funcționează investițiile la BVB</h4>
                  <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-[#64748B]'}`}>
                    Prin TVBETETF poți investi instant și complet diversificat în cele mai bune companii din România direct pe Bursa de Valori București (BVB), reducând riscurile asociate activelor unice. Reinvestirea dividendelor multiplică randamentul pe termen lung.
                  </p>
                </div>
              </div>

            </motion.div>
          )}

          {/* CLUBUL XP VIEW ARCHITECTURE */}
          {activePage === 'club' && (
            <motion.div
              key="club-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className={`max-w-6xl mx-auto px-4 pt-8 space-y-8 ${theme === 'light' ? 'bg-transparent text-slate-800' : 'text-white'}`}
            >
              
              {/* HEADER CONTAINER */}
              <div className={`border p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl transition-all ${
                theme === 'light' 
                  ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-100 shadow-slate-100/60' 
                  : 'bg-gradient-to-r from-[#0F172A] to-[#1E293B] border-[#1F293D] shadow-xl'
              }`}>
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      <Trophy className="w-4 h-4 text-amber-500" /> Clubul Elitist al Fondatorilor
                    </div>
                    <h2 className={`font-display text-2xl md:text-4xl font-extrabold tracking-tight transition-colors ${
                      theme === 'light' ? 'text-slate-800' : 'text-white'
                    }`}>
                      Monetizează Învățarea cu XP
                    </h2>
                    <p className={`text-xs md:text-sm font-medium leading-relaxed max-w-2xl transition-colors ${
                      theme === 'light' ? 'text-slate-600' : 'text-[#64748B]'
                    }`}>
                      Fiecare chestionar finalizat, fiecare ghid parcurs și fiecare decizie înțeleaptă în startup îți aduc puncte XP. Acumulează puncte pentru a urca în clasamentul republican și deblochează unelte practice premium de antreprenoriat!
                    </p>
                  </div>
 
                  {/* USER STATS COUNTER */}
                  <div className="grid grid-cols-2 md:flex items-center gap-4 shrink-0">
                    <div className={`border rounded-2xl p-4 text-center space-y-1 transition-all ${
                      theme === 'light' ? 'bg-white border-slate-200 shadow-sm shadow-slate-100' : 'bg-[#090D1A] border-[#1F293D]'
                    }`}>
                      <p className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase font-mono">XP Total</p>
                      <div className="flex items-center justify-center gap-1.5 text-amber-500 font-extrabold text-2xl">
                        <Zap className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                        <span><AnimatedCountUp value={userProfile.xp} /> XP</span>
                      </div>
                    </div>
                    <div className={`border rounded-2xl p-4 text-center space-y-1 transition-all ${
                      theme === 'light' ? 'bg-white border-slate-200 shadow-sm shadow-slate-100' : 'bg-[#090D1A] border-[#1F293D]'
                    }`}>
                      <p className="text-[10px] font-bold text-[#64748B] tracking-wider uppercase font-mono">Streak Curent</p>
                      <div className="flex items-center justify-center gap-1.5 text-rose-500 font-extrabold text-2xl">
                        <Flame className="w-5 h-5 text-rose-500 fill-rose-500 animate-bounce" />
                        <span>{userProfile.streak || 1} Zile</span>
                      </div>
                    </div>
                  </div>
                </div>
 
                {/* VISUAL LEVEL PROGRESS BAR */}
                <div className={`mt-8 pt-6 border-t space-y-2 transition-all ${
                  theme === 'light' ? 'border-slate-150' : 'border-[#1F293D]'
                }`}>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`font-bold ${theme === 'light' ? 'text-slate-700' : 'text-white'}`}>Nivelul {Math.floor(userProfile.xp / 100) + 1}</span>
                    <span className={theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}>
                      {userProfile.xp} / {(Math.floor(userProfile.xp / 100) + 1) * 100} XP până la următorul nivel
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden border transition-all ${
                    theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-[#090D1A] border-[#1F293D]'
                  }`}>
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (userProfile.xp / ((Math.floor(userProfile.xp / 100) + 1) * 100)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
 
              {/* TABS SELECTOR */}
              <div className={`flex p-1.5 rounded-2xl max-w-lg mx-auto md:mx-0 border transition-all ${
                theme === 'light' 
                  ? 'bg-slate-100 border-slate-200/80 shadow-xs' 
                  : 'bg-[#0F1322] border-[#1F293D]'
              }`}>
                <button
                  onClick={() => setActiveClubTab('quests')}
                  className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    activeClubTab === 'quests'
                      ? theme === 'light'
                        ? 'bg-[#10B981]/15 text-[#059669] shadow-inner border border-[#10B981]/30 font-extrabold'
                        : 'bg-[#1E293B] text-[#10B981] shadow-md border border-[#334155]'
                      : theme === 'light' 
                        ? 'text-slate-600 hover:text-slate-800 hover:bg-white/40' 
                        : 'text-[#64748B] hover:text-white hover:bg-white/5'
                  }`}
                >
                  Misiuni Zilnice
                </button>
                <button
                  onClick={() => {
                    setActiveClubTab('leaderboard');
                    fetchLeaderboard();
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    activeClubTab === 'leaderboard'
                      ? theme === 'light'
                        ? 'bg-[#10B981]/15 text-[#059669] shadow-inner border border-[#10B981]/30 font-extrabold'
                        : 'bg-[#1E293B] text-[#10B981] shadow-md border border-[#334155]'
                      : theme === 'light' 
                        ? 'text-slate-600 hover:text-slate-800 hover:bg-white/40' 
                        : 'text-[#64748B] hover:text-white hover:bg-white/5'
                  }`}
                >
                  Clasament Jucători
                </button>
                <button
                  onClick={() => setActiveClubTab('shop')}
                  className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                    activeClubTab === 'shop'
                      ? theme === 'light'
                        ? 'bg-[#10B981]/15 text-[#059669] shadow-inner border border-[#10B981]/30 font-extrabold'
                        : 'bg-[#1E293B] text-[#10B981] shadow-md border border-[#334155]'
                      : theme === 'light' 
                        ? 'text-slate-600 hover:text-slate-850 hover:bg-white/40' 
                        : 'text-[#64748B] hover:text-white hover:bg-white/5'
                  }`}
                >
                  Magazin Premii XP
                </button>
              </div>

              {/* QUESTS SUB-VIEW */}
              {activeClubTab === 'quests' && (
                <div className="space-y-6">
                  {(() => {
                    const currentWeekday = getBucharestWeekday();
                    const currentDilemma = dailyDilemmas[currentWeekday] || dailyDilemmas[0];
                    const dailyScenarioAnswered = !!userProfile.dailyQuests?.scenarioAnswered;
                    const selectedScenarioOption = userProfile.dailyQuests?.selectedScenarioOption !== undefined && userProfile.dailyQuests?.selectedScenarioOption !== null ? userProfile.dailyQuests?.selectedScenarioOption : null;

                      return (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* QUEST 1: DYNAMIC WEEKDAY DILEMMA */}
                            <div className={`border p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                              theme === 'light' 
                                ? 'bg-white border-slate-200 shadow-sm shadow-slate-100/50' 
                                : 'bg-[#090D1A] border-[#1F293D]'
                            }`}>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                                    <Lightbulb className="w-5 h-5" />
                                  </span>
                                  <span className="text-xs font-mono font-bold text-teal-600 bg-teal-500/10 px-2.5 py-0.5 rounded-md">
                                    +15 XP
                                  </span>
                                </div>
                                <h4 className={`font-bold text-base ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                                  {currentDilemma.title}
                                </h4>
                                <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                                  {currentDilemma.question}
                                </p>
                              </div>

                              {!dailyScenarioAnswered ? (
                                <div className="space-y-2 pt-2">
                                  <button
                                    onClick={() => {
                                      const isCorrect = currentDilemma.correctOption === 0;
                                      setUserProfile(prev => {
                                        const todayStr = getBucharestDateStr();
                                        const quests = prev.dailyQuests || { 
                                          chatAsked: false, 
                                          nodeCompleted: false, 
                                          articleRead: false, 
                                          scenarioAnswered: false, 
                                          selectedScenarioOption: null, 
                                          budgetCreated: false, 
                                          shopVisited: false, 
                                          lastResetDate: todayStr 
                                        };
                                        const updatedQuests = { 
                                          ...quests, 
                                          scenarioAnswered: true, 
                                          selectedScenarioOption: 0 
                                        };
                                        return {
                                          ...prev,
                                          xp: prev.xp + (isCorrect ? 15 : 0),
                                          dailyQuests: updatedQuests
                                        };
                                      });
                                      if (isCorrect) {
                                        setSuccessToast("Excelent! Corect! Ai primit +15 XP cu dilemma zilei! 🏆🎉");
                                      } else {
                                        setSuccessToast("Răspuns ales. Citește explicația de mai jos! 💡");
                                      }
                                    }}
                                    className={`w-full text-left p-3 rounded-xl text-xs transition-all border font-medium cursor-pointer ${
                                      theme === 'light' 
                                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' 
                                        : 'bg-[#121824] hover:bg-[#1C2638] border-[#1F293D] text-slate-300'
                                    }`}
                                  >
                                    {currentDilemma.optionA}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const isCorrect = currentDilemma.correctOption === 1;
                                      setUserProfile(prev => {
                                        const todayStr = getBucharestDateStr();
                                        const quests = prev.dailyQuests || { 
                                          chatAsked: false, 
                                          nodeCompleted: false, 
                                          articleRead: false, 
                                          scenarioAnswered: false, 
                                          selectedScenarioOption: null, 
                                          budgetCreated: false, 
                                          shopVisited: false, 
                                          lastResetDate: todayStr 
                                        };
                                        const updatedQuests = { 
                                          ...quests, 
                                          scenarioAnswered: true, 
                                          selectedScenarioOption: 1 
                                        };
                                        return {
                                          ...prev,
                                          xp: prev.xp + (isCorrect ? 15 : 0),
                                          dailyQuests: updatedQuests
                                        };
                                      });
                                      if (isCorrect) {
                                        setSuccessToast("Excelent! Corect! Ai primit +15 XP cu dilemma zilei! 🏆🎉");
                                      } else {
                                        setSuccessToast("Răspuns ales. Citește explicația de mai jos! 💡");
                                      }
                                    }}
                                    className={`w-full text-left p-3 rounded-xl text-xs transition-all border font-medium cursor-pointer ${
                                      theme === 'light' 
                                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' 
                                        : 'bg-[#121824] hover:bg-[#1C2638] border-[#1F293D] text-[#818CF8]'
                                    }`}
                                  >
                                    {currentDilemma.optionB}
                                  </button>
                                </div>
                              ) : (
                                <div className="pt-2 space-y-2">
                                  {selectedScenarioOption === currentDilemma.correctOption ? (
                                    <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl text-xs text-[#10B981] space-y-1">
                                      <div className="font-extrabold flex items-center gap-1">
                                        <span>✓ Corect! Răspunsul tău ({selectedScenarioOption === 0 ? 'A' : 'B'})</span>
                                      </div>
                                      <p className="leading-relaxed text-[11px] text-[#10B981]/90">
                                        {currentDilemma.explanation}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-500 space-y-1">
                                      <div className="font-extrabold text-[11px]">🚨 Recomandare: Opțiunea aleasă ({selectedScenarioOption === 0 ? 'A' : 'B'}) este o capcană</div>
                                      <p className="leading-relaxed text-[11px] text-rose-500/90">
                                        {currentDilemma.tip}
                                      </p>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5 p-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-xl justify-center text-xs font-bold font-mono">
                                    <CheckCircle className="w-4 h-4" /> Dilemă Rezolvată Azi
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* QUEST 2: MODULE MASTER CURS */}
                            <div className={`border p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                              theme === 'light' 
                                ? 'bg-white border-slate-200 shadow-sm shadow-slate-100/50' 
                                : 'bg-[#090D1A] border-[#1F293D]'
                            }`}>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="p-2 rounded-xl bg-violet-500/15 text-violet-400 font-mono">
                                    <BookOpen className="w-5 h-5" />
                                  </span>
                                  <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md">
                                    +15 XP
                                  </span>
                                </div>
                                <h4 className={`font-bold text-base ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Module Master Curs</h4>
                                <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                                  Finalizează oricare dintre quiz-urile sau lecțiile active din arborele interactiv de învățare StartUp Finance pentru a-ți valida performanța academică.
                                </p>
                              </div>
                              
                              {userProfile.dailyQuests?.nodeCompleted ? (
                                <div className="flex items-center gap-1.5 p-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-xl justify-center text-xs font-bold">
                                  <CheckCircle className="w-4 h-4" /> Finalizat Azi
                                </div>
                              ) : (
                                <button
                                  onClick={() => setActivePage('invatare')}
                                  className={`w-full py-2 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center border ${
                                    theme === 'light' 
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' 
                                      : 'bg-[#1E293B] hover:bg-slate-800 text-white border-[#334155]'
                                  }`}
                                >
                                  Mergi la Învățare ↗
                                </button>
                              )}
                            </div>

                            {/* QUEST 3: LECTURĂ GHID ECONOMIC */}
                            <div className={`border p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                              theme === 'light' 
                                ? 'bg-white border-slate-200 shadow-sm shadow-slate-100/50' 
                                : 'bg-[#090D1A] border-[#1F293D]'
                            }`}>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="p-2 rounded-xl bg-amber-500/15 text-amber-500">
                                    <TrendingUp className="w-5 h-5" />
                                  </span>
                                  <span className="text-xs font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                                    +10 XP
                                  </span>
                                </div>
                                <h4 className={`font-bold text-base ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Lectură Ghid Economic</h4>
                                <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                                  Deschide și parcurge oricare dintre articolele legislative, de bursa sau marketing din blocul de Resurse practice pentru a rămâne informat în afaceri.
                                </p>
                              </div>
                              
                              {userProfile.dailyQuests?.articleRead ? (
                                <div className="flex items-center gap-1.5 p-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-xl justify-center text-xs font-bold">
                                  <CheckCircle className="w-4 h-4" /> Finalizat Azi
                                </div>
                              ) : (
                                <button
                                  onClick={() => setActivePage('articole')}
                                  className={`w-full py-2 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center border ${
                                    theme === 'light' 
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' 
                                      : 'bg-[#1E293B] hover:bg-slate-800 text-white border-[#334155]'
                                  }`}
                                >
                                  Alege un Articol ↗
                                </button>
                              )}
                            </div>

                            {/* QUEST 4: ASIMILARE CONCEPTE */}
                            <div className={`border p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                              theme === 'light' 
                                ? 'bg-white border-slate-200 shadow-sm shadow-slate-100/50' 
                                : 'bg-[#090D1A] border-[#1F293D]'
                            }`}>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="p-2 rounded-xl bg-purple-500/15 text-purple-400 font-mono">
                                    <BookOpen className="w-5 h-5" />
                                  </span>
                                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                                    +10 XP
                                  </span>
                                </div>
                                <h4 className={`font-bold text-base ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Asimilare Activă</h4>
                                <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                                  Deschide harta de învățare, selectează orice temă teoretică și bifează toate obiectivele-cheie din checklist pentru a-ți asigura asimilarea activă.
                                </p>
                              </div>
                              
                              {userProfile.dailyQuests?.chatAsked ? (
                                <div className="flex items-center gap-1.5 p-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-xl justify-center text-xs font-bold">
                                  <CheckCircle className="w-4 h-4" /> Finalizat Azi
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActivePage('invatare');
                                  }}
                                  className={`w-full py-2 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center border ${
                                    theme === 'light' 
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' 
                                      : 'bg-[#1E293B] hover:bg-slate-800 text-white border-[#334155]'
                                  }`}
                                >
                                  Deschide Harta de Învățare ↗
                                </button>
                              )}
                            </div>

                            {/* QUEST 6: VIZITĂ LA MAGAZINUL DE PREMII */}
                            <div className={`border p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all ${
                              theme === 'light' 
                                ? 'bg-white border-slate-200 shadow-sm shadow-slate-100/50' 
                                : 'bg-[#090D1A] border-[#1F293D]'
                            }`}>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="p-2 rounded-xl bg-amber-400/15 text-amber-500 font-mono">
                                    <Sparkles className="w-5 h-5" />
                                  </span>
                                  <span className="text-xs font-mono font-bold text-amber-500 bg-amber-400/10 px-2 py-0.5 rounded-md">
                                    +5 XP
                                  </span>
                                </div>
                                <h4 className={`font-bold text-base ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Vizitator VIP Shop</h4>
                                <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                                  Deschide fila Magazinului de Premii XP de mai sus pentru a explora cupoanele active de mentorat sau discount-uri reale de business.
                                </p>
                              </div>
                              
                              {userProfile.dailyQuests?.shopVisited ? (
                                <div className="flex items-center gap-1.5 p-2 bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 rounded-xl justify-center text-xs font-bold">
                                  <CheckCircle className="w-4 h-4" /> Finalizat Azi
                                </div>
                              ) : (
                                <button
                                  onClick={handleOpenShopTab}
                                  className={`w-full py-2 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center border ${
                                    theme === 'light' 
                                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200' 
                                      : 'bg-[#1E293B] hover:bg-slate-800 text-white border-[#334155]'
                                  }`}
                                >
                                  Vizitează Magazinul ↗
                                </button>
                              )}
                            </div>

                          </div>

                          {/* BONUS SUMMARY STATS */}
                          <div className={`border p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono transition-colors ${
                            theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0B0F19] border-[#1F293D] text-[#64748B]'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-teal-400" />
                              <span>Misiunile zilnice se resetează automat la 12:00 AM (Ora României).</span>
                            </div>
                            <div className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                              Progres Misiuni Azi: {
                                [
                                  dailyScenarioAnswered, 
                                  userProfile.dailyQuests?.nodeCompleted, 
                                  userProfile.dailyQuests?.articleRead,
                                  userProfile.dailyQuests?.chatAsked,
                                  userProfile.dailyQuests?.budgetCreated,
                                  userProfile.dailyQuests?.shopVisited
                                ].filter(Boolean).length
                              }/6 Finalizate
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

              {/* SUBVIEW 2: LEADERBOARD / CLASAMENT */}
              {activeClubTab === 'leaderboard' && (
                <div className={`border rounded-3xl overflow-hidden shadow-lg transition-all ${
                  theme === 'light' ? 'bg-white border-slate-200 shadow-slate-100/50' : 'bg-[#090D1A] border-[#1F293D]'
                }`}>
                  <div className={`p-5 border-b transition-colors ${
                    theme === 'light' ? 'border-slate-150 bg-slate-50/50' : 'border-[#1F293D] bg-[#0E1322]'
                  }`}>
                    <h3 className={`font-bold text-lg ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      Clasament Republican: Top 25 Viitori Fondatori
                    </h3>
                    <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                      Sincronizat live cu serverul StartUp Finance. Clasamentul reflectă progresul consolidat al asiduilor noștri tineri antreprenori români.
                    </p>
                  </div>
 
                  {isLeaderboardLoading && leaderboard.length === 0 ? (
                    <div className="p-12 text-center space-y-4">
                      <RefreshCw className="w-8 h-8 text-[#10B981] animate-spin mx-auto" />
                      <p className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                        Se preia clasamentul de top din baza de date republicană...
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs md:text-sm">
                        <thead>
                          <tr className={`border-b font-mono uppercase text-[10px] tracking-wider transition-colors ${
                            theme === 'light' 
                              ? 'border-slate-150 bg-slate-100/75 text-slate-500' 
                              : 'border-[#1F293D] bg-[#060A13] text-[#64748B]'
                          }`}>
                            <th className="p-4 w-16 text-center">Loc</th>
                            <th className="p-4">Antreprenor / Fondator</th>
                            <th className="p-4">Streak Conectare</th>
                            <th className="p-4 text-center">XP Total</th>
                            <th className="p-4 w-28">Statut Profil</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y transition-colors ${
                          theme === 'light' ? 'divide-slate-100' : 'divide-[#1F293D]/30'
                        }`}>
                          {leaderboard.map((player, idx) => {
                            const rank = idx + 1;
                            const isTop3 = rank <= 3;
                            
                            const rowBg = player.isMe 
                              ? theme === 'light' 
                                ? "bg-emerald-55/65 text-emerald-950 font-bold" 
                                : "bg-[#10B981]/5 text-white" 
                              : theme === 'light' 
                                ? "text-slate-700 hover:bg-slate-50/50" 
                                : "text-[#94A3B8] hover:bg-[#111827]/10";
 
                            let badge = "Novice";
                            if (player.xp >= 600) badge = "Elitist Unicorn 🦄";
                            else if (player.xp >= 400) badge = "Senior CEO 👑";
                            else if (player.xp >= 250) badge = "Manager Pro";
                            else if (player.xp >= 100) badge = "Startup-ist";
 
                            return (
                              <tr key={idx} className={`transition-colors h-14 ${rowBg}`}>
                                <td className="p-2 text-center font-bold font-mono">
                                  {rank === 1 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-mono">🥇</span>
                                  ) : rank === 2 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400/20 text-slate-600 border border-slate-300 text-xs font-mono">🥈</span>
                                  ) : rank === 3 ? (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-700 border border-amber-800/20 text-xs font-mono">🥉</span>
                                  ) : (
                                    <span className={theme === 'light' ? "text-slate-400" : "text-slate-500"}>#{rank}</span>
                                  )}
                                </td>
                                <td className="p-4 font-semibold">
                                  <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                                      player.isMe 
                                        ? 'bg-[#10B981] text-white' 
                                        : theme === 'light' 
                                          ? 'bg-slate-200 text-slate-700' 
                                          : 'bg-slate-800 text-slate-200 border border-[#1F293D]'
                                    }`}>
                                      {player.name.substring(0, 2)}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className={`${
                                          player.isMe 
                                            ? "font-extrabold text-[#10B981]" 
                                            : theme === 'light' 
                                              ? "text-slate-800" 
                                              : "text-white"
                                        }`}>
                                          {player.name}
                                        </span>
                                        {isTop3 && (
                                          <span className="text-[11px] select-none" title="Top 3 Fondator Elit">🏆</span>
                                        )}
                                        {player.isMe && (
                                          <span className="text-[9px] bg-[#10B981]/15 text-[#10B981] px-1.5 py-0.5 rounded font-extrabold">Tu</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 font-mono font-bold text-rose-500">
                                  🔥 {player.streak || 1} zile
                                </td>
                                <td className={`p-4 font-extrabold font-mono text-center ${
                                  theme === 'light' ? 'text-slate-800' : 'text-[#F1F5F9]'
                                }`}>
                                  {player.xp} XP
                                </td>
                                <td className="p-4">
                                  <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${
                                    player.xp >= 600 ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                    : player.xp >= 400 ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    : player.xp >= 250 ? "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20"
                                    : "bg-slate-500/10 text-[#64748B]"
                                  }`}>
                                    {badge}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUBVIEW 3: XP SHOP */}
              {activeClubTab === 'shop' && (
                <div className="space-y-6">
                  
                  {/* SHOP GENERAL INFO */}
                  <div className={`border p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
                    theme === 'light' ? 'bg-white border-slate-200 shadow-sm shadow-slate-100' : 'bg-[#0C0F19] border-[#1F293D]'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#10B981] animate-pulse">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <h4 className={`font-bold text-sm ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Magazinul Oficial de Recompense 💎</h4>
                        <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                          Cheltuiește-ți gemurile câștigate în mod inteligent pentru a-ți accelera educația financiară!
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>Balanța ta:</span>
                      <p className="text-lg font-extrabold text-[#10B981] font-mono"><AnimatedCountUp value={userProfile.gems || 0} /> Gemuri 💎</p>
                    </div>
                  </div>
 
                  {/* SHOP GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(() => {
                      const unlockedItems = userProfile.unlockedItems || [];
                      
                      const items = [
                        {
                          id: "xp_booster",
                          title: "XP Booster (Instant 2x XP)",
                          description: "Îți dublează orice XP pe care îl primești din teste și misiuni zilnice timp de 20 de minute. Excelent pentru a urca rapid în clasament! Cooldown: 1h.",
                          cost: 15,
                          badge: "Booster Activ"
                        },
                        {
                          id: "secret_investments",
                          title: "Ghid Premium: Investiții Secrete & AI",
                          description: "Scurtături folosite de marii investitori, strategii nespuse de arbitraj financiar și analiză de active realizată de roboti AI exclusivi.",
                          cost: 45,
                          badge: "Secrete VIP"
                        },
                        {
                          id: "billionaire_secrets",
                          title: "Acces la Cursul Ascuns: Secretele Miliardarilor",
                          description: "Investigații interactive, tactici de negociere extremă și template-ul exact de Pitch Deck folosit de unicorni pentru a ridica miliarde!",
                          cost: 70,
                          badge: "Curs Ultra-VIP"
                        },
                        {
                          id: "travis_vip",
                          title: "Membru de Elită VIP Status",
                          description: "Deblochează statutul legendar de Elite Antreprenor. Te ridică la rangul de investitor de top în ecosistemul StartUp Finance, oferindu-ți credentialul VIP exclusiv!",
                          cost: 100,
                          badge: "Statut Elite"
                        }
                      ];
 
                      return items.map((item) => {
                        const isUnlocked = unlockedItems.includes(item.id);
                        const userGems = userProfile.gems ?? 0;
                        const canAfford = userGems >= item.cost;

                        // Booster states
                        const now = new Date();
                        const activeUntil = userProfile.xpBoosterActiveUntil ? new Date(userProfile.xpBoosterActiveUntil) : null;
                        const nextBuy = userProfile.xpBoosterNextBuyAvailable ? new Date(userProfile.xpBoosterNextBuyAvailable) : null;
                        const isBoosterActive = item.id === 'xp_booster' && activeUntil && now < activeUntil;
                        const isBoosterInCooldown = item.id === 'xp_booster' && nextBuy && now < nextBuy;
                        
                        const boosterActiveRemMin = activeUntil ? Math.max(0, Math.ceil((activeUntil.getTime() - now.getTime()) / 60000)) : 0;
                        const boosterCooldownRemMin = nextBuy ? Math.max(0, Math.ceil((nextBuy.getTime() - now.getTime()) / 60000)) : 0;

                        return (
                          <div 
                            key={item.id} 
                            className={`border rounded-2xl p-6 flex flex-col justify-between space-y-4 transition-all relative overflow-hidden ${
                              isBoosterActive
                                ? "border-emerald-500 bg-[#090D1A] shadow-xl shadow-emerald-500/10"
                                : (item.id !== 'xp_booster' && isUnlocked)
                                  ? theme === 'light'
                                    ? "border-[#10B981]/60 bg-white shadow-md shadow-[#10B981]/10"
                                    : "border-[#10B981]/50 bg-[#090D1A] shadow-lg shadow-[#10B981]/5"
                                  : theme === 'light'
                                    ? "border-slate-200 bg-white hover:border-slate-350 shadow-xs"
                                    : "border-[#1F293D] bg-[#090D1A] hover:border-zinc-700"
                            }`}
                          >
                            {/* Unlocked marker */}
                            {isBoosterActive && (
                              <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-sm animate-pulse">
                                Activ (2x XP) 🔥
                              </div>
                            )}
                            {item.id === 'xp_booster' && isBoosterInCooldown && !isBoosterActive && (
                              <div className="absolute top-0 right-0 bg-[#334155] text-[#94A3B8] text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-sm">
                                Cooldown ⏳
                              </div>
                            )}
                            {item.id !== 'xp_booster' && isUnlocked && (
                              <div className="absolute top-0 right-0 bg-[#10B981] text-black text-[9px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-sm">
                                Deblocat ✓
                              </div>
                            )}
 
                            <div className="space-y-3 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/25">
                                  {item.id === 'xp_booster' && isBoosterActive 
                                    ? `XP Booster Activ` 
                                    : item.id === 'xp_booster' && isBoosterInCooldown 
                                      ? `In Cooldown` 
                                      : item.badge}
                                </span>
                                
                                {item.id === 'xp_booster' ? (
                                  isBoosterActive ? (
                                    <span className="text-xs font-mono font-extrabold text-[#10B981]">
                                      {boosterActiveRemMin} min rămase
                                    </span>
                                  ) : isBoosterInCooldown ? (
                                    <span className="text-xs font-mono font-bold text-amber-500">
                                      {boosterCooldownRemMin} min cooldown
                                    </span>
                                  ) : (
                                    <span className="text-xs font-mono font-extrabold text-[#10B981]">
                                      15 Gemuri
                                    </span>
                                  )
                                ) : (
                                  !isUnlocked && (
                                    <span className="text-xs font-mono font-extrabold text-[#10B981]">
                                      {item.cost} Gemuri
                                    </span>
                                  )
                                )}
                              </div>
                              <h4 className={`font-bold text-base md:text-lg ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{item.title}</h4>
                              <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>{item.description}</p>
                            </div>

                            <div className="pt-2">
                              {item.id === 'xp_booster' ? (
                                isBoosterActive ? (
                                  <button
                                    disabled
                                    className={`w-full py-2.5 font-extrabold rounded-xl text-xs text-center flex items-center justify-center gap-1.5 border cursor-not-allowed ${
                                      theme === 'light'
                                        ? "bg-emerald-50 text-emerald-600 border-emerald-250"
                                        : "bg-emerald-500/20 text-[#10B981] border-emerald-500/30"
                                    }`}
                                  >
                                    <Zap className="w-4 h-4 animate-bounce" /> Dual XP Multiplier Rulează ({boosterActiveRemMin}m)
                                  </button>
                                ) : isBoosterInCooldown ? (
                                  <button
                                    disabled
                                    className={`w-full py-2.5 font-bold rounded-xl text-xs text-center flex items-center justify-center gap-1.5 border cursor-not-allowed ${
                                      theme === 'light'
                                        ? "bg-slate-100 text-slate-400 border-slate-200"
                                        : "bg-[#1E293B]/60 text-zinc-500 border-[#334155]/30"
                                    }`}
                                  >
                                    <Clock className="w-4 h-4" /> Cooldown Activ (Mai sunt {boosterCooldownRemMin}m)
                                  </button>
                                ) : (
                                  <button
                                    disabled={!canAfford}
                                    onClick={() => setShopItemToUnlock(item)}
                                    className={`w-full py-2.5 rounded-xl text-xs font-black transition-all text-center flex items-center justify-center gap-1.5 border ${
                                      canAfford
                                        ? theme === 'light'
                                          ? "bg-emerald-50 hover:bg-emerald-100 border-emerald-250 text-emerald-700 cursor-pointer shadow-xs"
                                          : "bg-slate-900 border-[#10B981]/40 text-[#10B981] hover:bg-[#10B981] hover:text-black cursor-pointer shadow-md"
                                        : theme === 'light'
                                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                          : "bg-[#0B0F19] text-zinc-650 border-[#1F293D] cursor-not-allowed"
                                    }`}
                                  >
                                    <Zap className="w-4 h-4" /> Activează Booster (15 Gemuri)
                                  </button>
                                )
                              ) : isUnlocked ? (
                                <button
                                  onClick={() => setOpenedPremiumResource(item.id)}
                                  className={`w-full py-2.5 font-extrabold rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-sm border ${
                                    theme === 'light'
                                      ? "bg-white hover:bg-slate-50 text-slate-800 border-slate-250"
                                      : "bg-[#1E293B] hover:bg-slate-800 text-[#10B981] border-[#334155]"
                                  }`}
                                >
                                  <Unlock className="w-4 h-4" /> Deschide Resursa de Afaceri
                                </button>
                              ) : (
                                <button
                                  disabled={!canAfford}
                                  onClick={() => setShopItemToUnlock(item)}
                                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 border ${
                                    canAfford
                                      ? theme === 'light'
                                        ? "bg-slate-150 text-slate-800 hover:bg-slate-200 border-slate-200 cursor-pointer"
                                        : "bg-[#1E293B] hover:bg-slate-800 text-[#10B981] border-[#334155] cursor-pointer shadow-md"
                                      : theme === 'light'
                                        ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
                                        : "bg-[#0B0F19] text-zinc-600 border-[#1F293D] cursor-not-allowed"
                                  }`}
                                >
                                  <Lock className="w-4 h-4" /> 
                                  {canAfford ? `Deblochează pentru ${item.cost} Gemuri` : `Gemuri Insuficiente (Necesar: ${item.cost})`}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* MODALS / FLOATING WORKSPACES FOR UNLOCKED PREMIUM RESOURCES */}
              <AnimatePresence>
                {openedPremiumResource !== null && (
                  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 30 }}
                      className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 space-y-6 relative shadow-2xl border transition-all ${
                        theme === 'light'
                          ? 'bg-white border-slate-250 text-slate-800 shadow-slate-300'
                          : 'bg-[#090D1A] border-[#1F293D] text-white'
                      }`}
                    >
                      {/* Close button */}
                      <button
                        onClick={() => {
                          setOpenedPremiumResource(null);
                          setValidationFeedback(null);
                          setValidationStatus(null);
                          setValidationInput("");
                        }}
                        className={`absolute top-4 right-4 transition-colors p-2 rounded-lg cursor-pointer border ${
                          theme === 'light' 
                            ? 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-250' 
                            : 'text-[#64748B] hover:text-white bg-slate-900 border-slate-800'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* PREMIUM RESOURCE CONTENT WRAPPERS */}
                      
                      {/* RESOURCE 1: PFA GUIDE TOOLKIT */}
                      {openedPremiumResource === "pfa_guide" && (
                        <div className="space-y-6">
                          <div className="space-y-2 border-b border-[#1F293D] pb-4">
                            <span className="text-[10px] font-mono font-bold uppercase text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">Ghid Executiv Unlocked 🔓</span>
                            <h3 className="font-display text-xl md:text-2xl font-bold text-white">Ghid Fiscal PFA 2026: Înființare Pas-cu-Pas</h3>
                            <p className="text-xs text-[#64748B]">Instrucțiuni riguroase conforme cu Codul Fiscal actualizat din România pentru anul 2026.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Step lists */}
                            <div className="space-y-2 md:col-span-1 border-r border-[#1F293D]/50 pr-4">
                              {[
                                { step: 1, label: "Alegere Coduri CAEN" },
                                { step: 2, label: "Stabilire Sediul Profesional" },
                                { step: 3, label: "Dosarul ONRC (Acte & Studiu)" },
                                { step: 4, label: "Noul portal online ONRC" },
                                { step: 5, label: "Fisc: Declarația Unică & ANAF" },
                              ].map((s) => (
                                <button
                                  key={s.step}
                                  onClick={() => setPfaGuideStep(s.step)}
                                  className={`w-full text-left p-3 rounded-xl block text-xs font-bold transition-all border ${
                                    pfaGuideStep === s.step
                                      ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 text-emerald-400"
                                      : "bg-[#050811] border-[#1F293D] text-[#64748B] hover:text-[#94A3B8]"
                                  }`}
                                >
                                  {s.step}. {s.label}
                                </button>
                              ))}
                            </div>

                            {/* Active guide step text */}
                            <div className="md:col-span-2 space-y-4">
                              {pfaGuideStep === 1 && (
                                <div className="space-y-3">
                                  <h4 className="font-bold text-white text-base">Pasul 1: Alegerea Codurilor CAEN (Max 5)</h4>
                                  <p className="text-xs text-[#64748B] leading-relaxed">
                                    Conform noilor legi, un PFA în România poate avea acum selectate maximum **5 coduri CAEN** active. Codul CAEN principal dictează activitatea ta de bază.
                                  </p>
                                  <div className="p-3 bg-zinc-900 border border-[#1F293D] rounded-xl space-y-2">
                                    <span className="text-[10px] font-mono font-bold text-amber-500">EXEMPLU CAEN POPULARE:</span>
                                    <ul className="text-xs text-zinc-300 list-disc list-inside space-y-1">
                                      <li>**6202**: Activități de consultanță în tehnologia informației</li>
                                      <li>**6201**: Activități de realizare a software-ului la comandă</li>
                                      <li>**7022**: Activități de consultanță pentru afaceri și management</li>
                                      <li>**7410**: Activități de design specializat</li>
                                    </ul>
                                  </div>
                                  <p className="text-xs font-medium text-[#10B981]">
                                    💡 Sfat: Asigură-te că deții o diplomă de studii sau calificare în strânsă legătură cu fiecare CAEN ales. ONRC respinge dosarul fără dovedirea pregătirii profesionale!
                                  </p>
                                </div>
                              )}

                              {pfaGuideStep === 2 && (
                                <div className="space-y-3">
                                  <h4 className="font-bold text-white text-base">Pasul 2: Stabilirea Sediului Profesional (Găzduire)</h4>
                                  <p className="text-xs text-[#64748B] leading-relaxed">
                                    Fiecare PFA necesită o adresă fizică pentru sediul social profesional. Poți alege casa părintească, un apartament personal, sau contracte de găzduire sediu (serviciu oferit de avocați).
                                  </p>
                                  <div className="p-3 bg-zinc-900 border border-[#1F293D] rounded-xl space-y-2">
                                    <span className="text-[10px] font-mono font-bold text-[#10B981]">Dacă sediul este la bloc (proprietate personală):</span>
                                    <p className="text-xs text-zinc-300">
                                      Ai nevoie de acordul asociației de proprietari și al vecinilor direct afectați (stânga, dreapta, sus, jos). Dacă nu desfășori activitate fizică la sediu (doar birou fără public), obținerea acordului este mult simplificată.
                                    </p>
                                  </div>
                                </div>
                              )}

                              {pfaGuideStep === 3 && (
                                <div className="space-y-3">
                                  <h4 className="font-bold text-white text-base">Pasul 3: Pregătirea Dosarului (Acte Necesare)</h4>
                                  <p className="text-xs text-[#64748B] leading-relaxed">
                                    Iată documentele pe care trebuie să le scanezi și să le salvezi în format PDF (maxim 2MB fiecare) pentru înmatriculare:
                                  </p>
                                  <div className="grid grid-cols-2 gap-3 text-[11px] text-[#A1A1AA]">
                                    <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800">
                                      <span className="text-white font-bold block mb-1">Doc de Identitate (C.I.)</span>
                                      Să fie valid, scanat color.
                                    </div>
                                    <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800">
                                      <span className="text-white font-bold block mb-1">Dovada de Sediul Social</span>
                                      Contract comodat, închiriere sau găzduire.
                                    </div>
                                    <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800">
                                      <span className="text-white font-bold block mb-1">Diploma de calificare</span>
                                      Atestat, facultate sau curs acreditat pe domeniu.
                                    </div>
                                    <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800">
                                      <span className="text-white font-bold block mb-1">Cerere de Înregistrare</span>
                                      Formulare standard generate de portalul ONRC.
                                    </div>
                                  </div>
                                </div>
                              )}

                              {pfaGuideStep === 4 && (
                                <div className="space-y-3">
                                  <h4 className="font-bold text-white text-base">Pasul 4: Depunerea Simplificată prin portalul ONRC</h4>
                                  <p className="text-xs text-[#64748B] leading-relaxed">
                                    Înființarea se face complet online pe noul portal oficial securizat al Oficiului Național al Registrului Comerțului (myportal.onrc.ro).
                                  </p>
                                  <ol className="text-xs text-zinc-300 list-decimal list-inside space-y-1.5 leading-relaxed">
                                    <li>Creează un cont pe portalul ONRC și validează-ți identitatea.</li>
                                    <li>Accesează opțiunea „Înregistrare persoană fizică autorizată”.</li>
                                    <li>Completează formularele direct în browser folosind asistentul interactiv.</li>
                                    <li>Încarcă PDF-urile semnate electronic (ONRC suportă de asemenea semnarea fizică dublată de o declarație pe proprie răspundere).</li>
                                    <li>Așteaptă rezoluția (de regulă durează 3 zile lucrătoare). Rezoluția vine prin e-mail împreună cu Certificatul de Înregistrare (CUI).</li>
                                  </ol>
                                </div>
                              )}

                              {pfaGuideStep === 5 && (
                                <div className="space-y-3">
                                  <h4 className="font-bold text-white text-base">Pasul 5: Conectarea cu ANAF, Declarația Unică &amp; e-Factura</h4>
                                  <p className="text-xs text-[#64748B] leading-relaxed">
                                    După înființare, ești oficial antreprenor! În termen de **30 de zile** trebuie depusă Declarația Unică de estimare venit la ANAF.
                                  </p>
                                  <div className="p-4 bg-zinc-950 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                                    <p className="text-white font-bold text-sm">💡 Reguli de Impozitare PFA în Curent:</p>
                                    <ul className="list-disc list-inside text-zinc-300 space-y-1">
                                      <li>**Impozit pe venit**: 10% din profitul net (încasări minus cheltuieli deductibile).</li>
                                      <li>**CAS (Pensie)**: Cota de 25% calculată la un plafon ales (de 12 sau 24 salarii minime), dacă depășești pragul de 12 salarii minime nete.</li>
                                      <li>**CASS (Sănătate)**: Cota de 10% calculată la venitul net realizat, cu plafoane de 6, 60 sau maximum 12 salarii minime brute pe țară.</li>
                                      <li>**Sistemul e-Factura**: Orice factură B2B în România se încarcă în maxim 5 zile pe portalul SPV al ANAF sub sancțiunea amenzilor.</li>
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-end pt-4 border-t border-[#1F293D]">
                            <button
                              onClick={() => {
                                setOpenedPremiumResource(null);
                                setSuccessToast("Ghid închis cu succes!");
                              }}
                              className="px-5 py-2 bg-zinc-800 text-white font-bold rounded-xl text-xs hover:bg-zinc-700 transition"
                            >
                              Am înțeles, mulțumesc!
                            </button>
                          </div>
                        </div>
                      )}

                      {/* RESOURCE 2: ONE PAGE BUSINESS PLAN BUILDER */}
                      {openedPremiumResource === "one_page_plan" && (
                        <div className="space-y-6">
                          <div className="space-y-2 border-b border-[#1F293D] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <span className="text-[10px] font-mono font-bold uppercase text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">Util Workspace Unlocked 🔓</span>
                              <h3 className="font-display text-xl md:text-2xl font-bold text-white">One-Page Business Plan Generator</h3>
                              <p className="text-xs text-[#64748B]">Activează-ți gândirea strategică. Completează planul de afaceri, restul se salvează automat.</p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const textVal = `
# PLAN DE AFACERI ONE-PAGE (EXPORT)
Generat prin StartUp Finance

### 1. PROBLEMA & SEGMENTUL DE CLIENȚI
${onePagePlan.prob || "Nespecificat în plan."}

### 2. PROPUNEREA DE VALOARE EXCLUSIVĂ
${onePagePlan.prop || "Nespecificat în plan."}

### 3. CANALE DE MONETIZARE & DISTRIBUȚIE
${onePagePlan.can || "Nespecificat în plan."}

### 4. STRATEGIA DE PROMOVARE & ACHIZIȚIE
${onePagePlan.prom || "Nespecificat în plan."}

### 5. COSTURI & ECONOMIA UNITĂȚII
${onePagePlan.cost || "Nespecificat în plan."}
`;
                                  navigator.clipboard.writeText(textVal.trim());
                                  setSuccessToast("Plan exportat de succes în clipboard sub formă de text Markdown! 📋🚀");
                                }}
                                className="px-4 py-2 bg-[#10B981] text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 hover:bg-emerald-500 cursor-pointer"
                              >
                                <Copy className="w-4 h-4" /> Copiază Plan (Markdown)
                              </button>
                            </div>
                          </div>

                          {/* INTERACTIVE FORM CELLS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-[#EF4444]/15 text-[#EF4444] inline-flex items-center justify-center font-mono font-bold text-[10px]">1</span>
                                Problema &amp; Segmentul de Clienți
                              </label>
                              <textarea
                                value={onePagePlan.prob}
                                onChange={(e) => handlePlanFieldChange('prob', e.target.value)}
                                placeholder="Ex: Livrarea legumelor bio direct de la micii fermieri din regiune pentru familiile tinere care nu au acces ușor la piețe de încredere..."
                                className="w-full h-32 bg-[#090D1A] border border-[#1F293D] rounded-xl p-3 text-xs text-white leading-relaxed focus:border-[#10B981]/60 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-[#3B82F6]/15 text-[#3B82F6] inline-flex items-center justify-center font-mono font-bold text-[10px]">2</span>
                                Propunerea de Valoare Exclusivă (UVP)
                              </label>
                              <textarea
                                value={onePagePlan.prop}
                                onChange={(e) => handlePlanFieldChange('prop', e.target.value)}
                                placeholder="Ex: Abonament cu livrare la ușa casei în sub 2 ore. Legume proaspete recoltate în aceeași dimineață, garantat bio printr-un cod QR..."
                                className="w-full h-32 bg-[#090D1A] border border-[#1F293D] rounded-xl p-3 text-xs text-white leading-relaxed focus:border-[#10B981]/60 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-[#10B981]/15 text-[#10B981] inline-flex items-center justify-center font-mono font-bold text-[10px]">3</span>
                                Canale de Monetizare &amp; Distribuție
                              </label>
                              <textarea
                                value={onePagePlan.can}
                                onChange={(e) => handlePlanFieldChange('can', e.target.value)}
                                placeholder="Ex: Livrare directă către consumator (D2C) prin aplicație proprie. Monetizare prin abonament lunar recurent (180 RON/lună) sau comandă unică..."
                                className="w-full h-32 bg-[#090D1A] border border-[#1F293D] rounded-xl p-3 text-xs text-white leading-relaxed focus:border-[#10B981]/60 focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-[#F59E0B]/15 text-[#F59E0B] inline-flex items-center justify-center font-mono font-bold text-[10px]">4</span>
                                Strategia de Promovare
                              </label>
                              <textarea
                                value={onePagePlan.prom}
                                onChange={(e) => handlePlanFieldChange('prom', e.target.value)}
                                placeholder="Ex: Marketing de conținut pe Instagram și Facebook, parteneriate locale cu influenceri axați pe viață sănătoasă și campanii de retargeting..."
                                className="w-full h-32 bg-[#090D1A] border border-[#1F293D] rounded-xl p-3 text-xs text-white leading-relaxed focus:border-[#10B981]/60 focus:outline-none"
                              />
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-md bg-[#8B5CF6]/15 text-[#8B5CF6] inline-flex items-center justify-center font-mono font-bold text-[10px]">5</span>
                                Economia Unității / Structura de Costuri &amp; Prețuri
                              </label>
                              <textarea
                                value={onePagePlan.cost}
                                onChange={(e) => handlePlanFieldChange('cost', e.target.value)}
                                placeholder="Ex: Marja brută este de 60%. Cost achiziție client estimat la 20 RON. Preț coș mediu de 75 RON. Un curier livrează 10 cutii pe tură cu combustibil auto..."
                                className="w-full h-24 bg-[#090D1A] border border-[#1F293D] rounded-xl p-3 text-xs text-white leading-relaxed focus:border-[#10B981]/60 focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="bg-[#111827]/60 p-4 border border-[#1F293D] rounded-2xl flex items-center gap-2.5 text-xs text-[#64748B]">
                            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                            <span>Planul tău se salvează automat în siguranță pe dispozitiv! Poți oricând folosi butonul din colț pentru a-l copia rapid și a-l expune investitorilor.</span>
                          </div>
                        </div>
                      )}

                      {/* RESOURCE 3: THE MOM TEST SIMULATOR */}
                      {openedPremiumResource === "mom_test_cheat" && (
                        <div className="space-y-6">
                          <div className="space-y-2 border-b border-[#1F293D] pb-4">
                            <span className="text-[10px] font-mono font-bold uppercase text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">Evaluator Unlocked 🔓</span>
                            <h3 className="font-display text-xl md:text-2xl font-bold text-white">The Mom Test Question Simulator</h3>
                            <p className="text-xs text-[#64748B]">Scrie întrebările pe care intenționezi să le adresezi clienților la interviu ca să le validăm în raport cu Teoria Fitzpatrick.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Simulator Sandbox */}
                            <div className="space-y-4 bg-zinc-950/70 p-5 rounded-2xl border border-zinc-850">
                              <h4 className="font-bold text-white text-sm">Verificator Interactiv</h4>
                              <p className="text-xs text-[#64748B]">Alege una din întrebările propuse sau introdu-o pe a ta:</p>
                              
                              {/* Quick selector options */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {[
                                  "Ți-ar plăcea o aplicație de bugete?",
                                  "Câți bani ai cheltuit luna trecută pe cursuri online?",
                                  "Crezi că ai folosi o platformă locală de livrare?",
                                  "Cum ai trecut peste problema asta ultima oară?"
                                ].map((opt, id) => (
                                  <button
                                    key={id}
                                    onClick={() => setValidationInput(opt)}
                                    className="p-1 px-2.5 bg-slate-900 border border-slate-800 text-zinc-300 text-[10px] rounded-lg hover:border-[#10B981] transition cursor-pointer"
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>

                              <div className="space-y-2 pt-2">
                                <input
                                  type="text"
                                  value={validationInput}
                                  onChange={(e) => setValidationInput(e.target.value)}
                                  placeholder="Scrie o întrebare de interviu..."
                                  className="w-full bg-[#090D1A] border border-[#1F293D] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#10B981]"
                                />
                                <button
                                  onClick={() => {
                                    const txt = validationInput.toLowerCase();
                                    if (!txt.trim()) return;

                                    if (txt.includes("place") && txt.includes("ideea")) {
                                      setValidationStatus("warn");
                                      setValidationFeedback("Eroare fatală în 'The Mom Test'! Oamenii te vor minți din politețe („Sigur că da, pare minunat!”). Niciodată nu întreba dacă le place ideea. Întreabă în schimb cum își rezolvă problema ACUM.");
                                    } else if (txt.includes("crezi") || txt.includes("folosi") || txt.includes("ai cumpara") || txt.includes("vrea")) {
                                      setValidationStatus("warn");
                                      setValidationFeedback("Întrebare speculativă despre viitor. Opiniile despre ce ar face în viitor sunt complet inutile. Oamenii sunt extrem de optimiști privind viitorul, dar faptele lor din trecut sunt singurul indicator de încredere.");
                                    } else if (txt.includes("cum a") || txt.includes("ultima") || txt.includes("cât") || txt.includes("când")) {
                                      setValidationStatus("success");
                                      setValidationFeedback("Întrebare excelentă! Te concentrezi pe fapte istorice clare și pe viața reală a interlocutorului („Când ai făcut asta ultima oară?”, „Cum ai eșuat?”), nu pe promisiuni imaginare.");
                                    } else {
                                      setValidationStatus("success");
                                      setValidationFeedback("Rezultatele indică o întrebare destul de neutră. Pentru eficiență maximă în 'The Mom Test', asigură-te întotdeauna că vizezi comportamentul din trecut și procesele concrete aplicate, evitând opinii de complezență.");
                                    }
                                  }}
                                  className="w-full py-2.5 bg-[#10B981] hover:bg-emerald-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer"
                                >
                                  Verifică Întrebarea
                                </button>
                              </div>

                              {/* Simulation result */}
                              {validationFeedback !== null && (
                                <div className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                                  validationStatus === "success"
                                    ? "bg-[#10B981]/15 border-[#10B981]/30 text-emerald-400"
                                    : "bg-[#EF4444]/15 border-[#EF4444]/30 text-rose-400"
                                }`}>
                                  <div className="font-bold mb-1">
                                    {validationStatus === "success" ? "✓ Întrebare Validă (Conform Mom Test)" : "✗ Regulă Încălcată (Greșeală de interviu)"}
                                  </div>
                                  {validationFeedback}
                                </div>
                              )}
                            </div>

                            {/* Cheat sheet text */}
                            <div className="space-y-4">
                              <h4 className="font-bold text-white text-sm">Ghidul Rapid „The Mom Test”</h4>
                              <p className="text-xs text-[#64748B] leading-relaxed">
                                Rob Fitzpatrick explică clar în cartea sa cel mai important principiu: **Nu îi întreba pe oameni dacă cred că produsul tău e bun. Ei te vor minți dintr-o politețe care îți va ucide startup-ul.**
                              </p>

                              <div className="space-y-3.5 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono font-bold text-rose-500 uppercase">Întrebări Dezastruoase:</span>
                                  <ul className="text-xs text-zinc-400 list-disc list-inside space-y-0.5">
                                    <li>„Ți-ar plăcea un aparat care face asta?”</li>
                                    <li>„Ai cumpăra acest software la 10$/lună?”</li>
                                    <li>„Crezi că este o idee utilă?”</li>
                                  </ul>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Întrebări Excepționale:</span>
                                  <ul className="text-xs text-zinc-400 list-disc list-inside space-y-0.5">
                                    <li>„Cum rezolvi această sarcină în prezent?”</li>
                                    <li>„Cât te-a costat să repari asta ultima oară?”</li>
                                    <li>„Când a fost ultima oară când ai încercat să repari asta?”</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* RESOURCE 4: TRAVIS VIP */}
                      {openedPremiumResource === "travis_vip" && (
                        <div className="text-center py-8 space-y-4 max-w-md mx-auto">
                          <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">Elite Antreprenor Activat 👑</span>
                          <h3 className="font-display text-2xl font-black text-white">Card Elite VIP Upgrade</h3>
                          <p className="text-xs text-[#64748B] leading-relaxed">
                            Felicitări, Colegu Antreprenor! Statutul de Elită VIP a fost cu succes legat de amprenta ta digitală pe StartUp Finance.
                          </p>
                          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200">
                            „Ai deblocat oficial credentialul de investitor de elită în ecosistemul antreprenorial StartUp Finance România! Pregătește-te pentru cele mai mari oportunități de scalare!”
                            <span className="block text-[10px] mt-2 text-[#64748B] font-mono font-bold">Resursă de Elită Sincronizată</span>
                          </div>
                          <button
                            onClick={() => {
                              setOpenedPremiumResource(null);
                              setSuccessToast("Credentialul VIP complet activat! Sunteți recunoscut ca investitor de elită! 💎🚀");
                            }}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs transition cursor-pointer"
                          >
                            Revendică Cardul Elită VIP
                          </button>
                        </div>
                      )}

                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* MODAL DE CONFIRMARE PENTRU CUMPĂRAREA DIN MAGAZIN CU GEMURI */}
              <AnimatePresence>
                {shopItemToUnlock !== null && (
                  <div className="fixed inset-0 z-55 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 30 }}
                      className={`w-full max-w-md rounded-3xl p-6 md:p-8 space-y-6 relative shadow-2xl border text-center transition-all ${
                        theme === 'light'
                          ? 'bg-white border-slate-200 text-slate-800'
                          : 'bg-[#0E1322] border-[#222E49] text-white'
                      }`}
                    >
                      <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center text-[#10B981] mb-2">
                        <Lock className="w-5 h-5 animate-pulse" />
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold uppercase text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded border border-[#10B981]/25">
                          {shopItemToUnlock.badge}
                        </span>
                        <h3 className="font-display text-lg font-bold tracking-tight">
                          Confirmare Achiziție
                        </h3>
                        <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                          Ești sigur că dorești să deblochezi <span className="font-bold text-[#10B981]">"{shopItemToUnlock.title}"</span> pentru <span className="font-extrabold text-[#10B981] font-mono">{shopItemToUnlock.cost} Gemuri 💎</span>?
                        </p>
                      </div>

                      <div className={`p-4 rounded-xl flex justify-between items-center text-xs font-mono border ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-200 text-slate-600'
                          : 'bg-[#060913] border-[#1F293D] text-[#64748B]'
                      }`}>
                        <span>Balanța ta actuală:</span>
                        <span className="font-bold text-[#10B981]"><AnimatedCountUp value={userProfile.gems || 0} /> Gemuri 💎</span>
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => setShopItemToUnlock(null)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            theme === 'light'
                              ? 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-transparent hover:bg-white/5 text-[#64748B] border-[#1F293D]'
                          }`}
                        >
                          Anulează
                        </button>
                        <button
                          onClick={() => {
                            const userGems = userProfile.gems ?? 0;
                            if (userGems >= shopItemToUnlock.cost) {
                              if (shopItemToUnlock.id === 'xp_booster') {
                                const now = new Date();
                                const nextBuy = userProfile.xpBoosterNextBuyAvailable ? new Date(userProfile.xpBoosterNextBuyAvailable) : null;
                                if (nextBuy && now < nextBuy) {
                                  setErrorToast("Acest booster este încă în cooldown!");
                                  setShopItemToUnlock(null);
                                  return;
                                }

                                setUserProfile(prev => ({
                                  ...prev,
                                  gems: (prev.gems ?? 0) - 15,
                                  xpBoosterActiveUntil: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
                                  xpBoosterNextBuyAvailable: new Date(Date.now() + 60 * 60 * 1000).toISOString()
                                }));
                                setSuccessToast("Booster de XP pornit pentru 20 de minute! Progresul tău este acum accelerat! 🚀⚡");
                              } else {
                                setUserProfile(prev => ({
                                  ...prev,
                                  gems: (prev.gems ?? 0) - shopItemToUnlock.cost,
                                  unlockedItems: [...(prev.unlockedItems || []), shopItemToUnlock.id]
                                }));
                                setSuccessToast(`Super! Resursa fiscală '${shopItemToUnlock.title}' a fost deblocată! 🛍️🎉`);
                                setOpenedPremiumResource(shopItemToUnlock.id);
                              }
                            } else {
                              setErrorToast(`Fonduri de gemuri insuficiente! Ai nevoie de încă ${shopItemToUnlock.cost - userGems} gemuri.`);
                            }
                            setShopItemToUnlock(null);
                          }}
                          className="flex-1 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md shadow-[#10B981]/15"
                        >
                          Confirmă
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* SIGNIN / SIGNUP FRAME COMPONENT VIEW */}
          {activePage === 'auth' && (
            <motion.div
              key="auth-page"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-w-md mx-auto px-4 pt-12 md:pt-20"
            >
              <div className="bg-[#0F1322] border border-[#1F293D] p-6 md:p-8 rounded-3xl space-y-6 relative overflow-hidden shadow-2xl">
                
                {/* Form header */}
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mx-auto mb-2">
                    {authMode === 'signup' ? <UserPlus className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold text-white">
                    {authMode === 'signup' ? "Creează un cont nou" : "Bine ai revenit în rețea"}
                  </h3>
                  <p className="text-xs text-[#64748B]">
                    {authMode === 'signup' 
                      ? "Deplasează-te spre dobândirea independenței economice complete." 
                      : "Continuă să construiești proiectele tale preferate azi."}
                  </p>
                </div>

                {/* Error feedback label */}
                {authError && (
                  <div className="bg-[#F43F5E]/10 border border-[#F43F5E]/30 p-3.5 rounded-xl text-[#F43F5E] text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Form Elements */}
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  
                  {authMode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold font-mono tracking-wide text-[#64748B] uppercase block">
                        Nume Complet
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                        <input 
                          type="text" 
                          required
                          value={authForm.name}
                          onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Alexandru Popescu"
                          className="w-full bg-[#050811] border border-[#1F293D] focus:border-[#10B981] text-sm rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#64748B] outline-none transition-colors"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold font-mono tracking-wide text-[#64748B] uppercase block">
                      Adresă Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                      <input 
                        type="email" 
                        required
                        value={authForm.email}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="nume@licentiat.ro"
                        className="w-full bg-[#050811] border border-[#1F293D] focus:border-[#10B981] text-sm rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#64748B] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold font-mono tracking-wide text-[#64748B] uppercase block">
                      Parolă Securizată
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                      <input 
                        type="password" 
                        required
                        value={authForm.password}
                        onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="••••••••"
                        className="w-full bg-[#050811] border border-[#1F293D] focus:border-[#10B981] text-sm rounded-xl py-3 pl-10 pr-4 text-white placeholder-[#64748B] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full bg-[#10B981] hover:bg-[#10B981]/90 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-sm py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95`}
                  >
                    Continuă cu Email
                  </button>

                  <div className="flex items-center gap-2.5 my-4">
                    <span className="h-[1px] grow bg-[#1F293D]"></span>
                    <span className="text-[10px] font-bold font-mono text-[#64748B] uppercase tracking-wider">sau</span>
                    <span className="h-[1px] grow bg-[#1F293D]"></span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full bg-[#1E2538] hover:bg-[#1E2538]/85 border border-[#1F293D] text-white font-bold text-xs md:text-sm py-3.5 grid grid-cols-[auto_1fr] items-center gap-1.5 px-4 rounded-xl transition-all active:scale-98"
                  >
                    <svg className="w-4 h-4 shrink-0 mx-auto" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.67 0 3.19.58 4.38 1.69l3.27-3.27C17.67 1.54 14.99 1 12 1 7.35 1 3.32 3.68 1.48 7.57l3.76 2.92c.9-2.7 3.41-4.45 6.76-4.45z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.44c-.28 1.47-1.11 2.71-2.36 3.56v2.95h3.81c2.23-2.05 3.6-5.07 3.6-8.61z"/>
                      <path fill="#FBBC05" d="M5.24 10.49c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.48 3.01C.54 4.88 0 6.98 0 9.2s.54 4.32 1.48 6.19l3.76-2.9z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.9l-3.81-2.95c-1.06.71-2.42 1.13-4.15 1.13-3.35 0-5.86-1.75-6.76-4.45L1.48 16.7C3.32 20.32 7.35 23 12 23z"/>
                    </svg>
                    <span className="text-center font-bold">Continuă cu Google</span>
                  </button>

                  <div className="pt-3 border-t border-[#1F293D]/50 mt-4">
                    <p className="text-[10px] text-[#64748B] text-center leading-relaxed mb-3">
                      ⚠️ Întâmpini erori la conectare pe Netlify/GitHub? Aceasta se datorează neautorizării domeniului tău în Firebase. Poți trece instant în:
                    </p>
                    <button
                      type="button"
                      onClick={handleLocalLogin}
                      className="w-full bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[#10B981] font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      ⚡ Conectează în Mod Local (Salvare Browser)
                    </button>
                  </div>

                </form>

                {/* Split trigger mode switcher */}
                <div className="text-center pt-2">
                  <span className="text-xs text-[#64748B] font-medium">
                    {authMode === 'signup' ? "Ai deja un cont?" : "Nu ai un profil înregistrat?"}
                  </span>{" "}
                  <button
                    onClick={() => {
                      setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
                    }}
                    className="text-xs font-bold text-[#10B981] hover:underline"
                  >
                    {authMode === 'signup' ? "Conectează-te" : "Creează cont acum"}
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* DEDICATED ACCOUNT PAGE VIEW */}
          {activePage === 'account' && (
            <motion.div
              key="account-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto px-4 py-12 space-y-8"
            >
              {/* Header card/section */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#1F293D]/30">
                <div className="space-y-1 text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#10B981]/15 text-[#10B981]">
                    <User className="w-3.5 h-3.5" />
                    <span>PROFIL UTILIZATOR</span>
                  </div>
                  <h1 className={`font-display text-3xl md:text-4xl font-extrabold tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    Contul tău <span className="text-[#10B981]">StartUp Finance</span>
                  </h1>
                </div>
                
                <button
                  onClick={() => setActivePage('home')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    theme === 'light' 
                      ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200' 
                      : 'bg-[#151D2F] border border-[#1F293D] text-slate-300 hover:bg-[#1E2538]'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" /> Înapoi la Acasă
                </button>
              </div>

              {!isLoggedIn ? (
                /* Unauthenticated fallback state */
                <div className={`p-8 md:p-12 border rounded-3xl relative overflow-hidden max-w-lg mx-auto shadow-xl space-y-6 text-center ${
                  theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
                }`}>
                  <div className="w-16 h-16 bg-[#10B981]/10 text-[#10B981] rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                    🔒
                  </div>
                  <div className="space-y-2">
                    <h3 className={`font-display text-xl md:text-2xl font-black ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      Profil securizat
                    </h3>
                    <p className={`text-xs md:text-sm font-semibold max-w-sm mx-auto ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                      Trebuie să fii conectat(ă) pentru a-ți putea gestiona caracterul, personaliza pseudonimul, vizualiza trofeele XP acumulate și pentru a-ți urmări statisticile de progres zilnic!
                    </p>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => {
                        setAuthMode('signin');
                        setActivePage('auth');
                      }}
                      className="px-6 py-3 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-[#10B981]/25"
                    >
                      Conectează-te acum ↗
                    </button>
                  </div>
                </div>
              ) : (
                /* Beautiful Rich Authenticated Profile Dashboard */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Avatar & Quick Info & Name Editor */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className={`p-6 border rounded-3xl relative overflow-hidden text-center space-y-5 shadow-lg ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
                    }`}>
                      {/* Rich profile photo display */}
                      <div className="relative w-24 h-24 mx-auto group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981] to-emerald-400 rounded-3xl rotate-6 opacity-20 blur-xs transition-transform group-hover:rotate-12 duration-300"></div>
                        <div className="relative shadow-lg rounded-3xl overflow-hidden aspect-square h-full w-full bg-[#151D2F]">
                          {renderProfilePhoto(userProfile.profilePhotoUrl, userProfile.name, "w-full h-full text-3xl", userProfile.profilePhotoZoom)}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h3 className={`font-display text-lg md:text-xl font-bold truncate ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                          {userProfile.name}
                        </h3>
                        <p className={`text-[10px] font-mono tracking-wider font-semibold uppercase ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                          CO-FOUNDER RANK: <span className="text-[#10B981] font-bold">{rankTitle}</span>
                        </p>
                      </div>

                      {/* Special account code Section */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono font-bold ${
                        theme === 'light' ? 'bg-white border-slate-150 text-slate-700' : 'bg-[#070A13] border-[#1F293D]/65 text-slate-300'
                      }`}>
                        <div className="text-left">
                          <span className="text-[9px] text-[#64748B] block uppercase tracking-wide font-bold">Cod Unic Urmărire Update</span>
                          <span className="text-[#10B981] whitespace-nowrap">{userProfile.accountCode || "SF-GENERATING..."}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (userProfile.accountCode) {
                              navigator.clipboard.writeText(userProfile.accountCode);
                              setSuccessToast("Copiat în clipboard! 📋 Folosește acest cod pentru actualizări ulterioare.");
                            }
                          }}
                          className={`p-1.5 rounded-lg border hover:scale-105 transition-all cursor-pointer ${
                            theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100' : 'bg-[#151D2F] border-[#1F293D] text-slate-300 hover:bg-[#1C2437]'
                          }`}
                          title="Copiază codul de urmărire"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Display level based on cumulative XP */}
                      <div className={`p-3 rounded-2xl border ${
                        theme === 'light' ? 'bg-white border-slate-100/80' : 'bg-[#151D2F]/50 border-[#1F293D]/40'
                      }`}>
                        <div className="flex justify-between text-[10px] font-bold font-mono text-[#64748B] mb-1.5 uppercase">
                          <span>Nivel {Math.floor(userProfile.xp / 100) + 1}</span>
                          <span>{userProfile.xp} / {(Math.floor(userProfile.xp / 100) + 1) * 100} XP</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#10B981] to-teal-400 rounded-full"
                            style={{ width: `${Math.min(100, (userProfile.xp / ((Math.floor(userProfile.xp / 100) + 1) * 100)) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Edit Profile Pseudonim form */}
                      <div className="pt-2 text-left space-y-2 border-t border-[#1F293D]/15 pt-3">
                        <label className="text-[10px] font-bold font-mono text-[#64748B] uppercase tracking-wider block">
                          Nume Utilizator (Companie / Fondator)
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            id="edit-profile-name-input-rich"
                            defaultValue={userProfile.name}
                            maxLength={25}
                            placeholder="Introdu pseudonim..."
                            className={`flex-1 text-xs px-3 py-2 border rounded-xl outline-none focus:border-[#10B981] transition-colors ${
                              theme === 'light' 
                                ? 'bg-white border-slate-200 text-slate-800' 
                                : 'bg-[#070A13] border-[#1F293D] text-white'
                            }`}
                          />
                          <button
                            onClick={() => {
                              const inputEl = document.getElementById('edit-profile-name-input-rich') as HTMLInputElement;
                              if (inputEl && inputEl.value.trim()) {
                                const newName = inputEl.value.trim();
                                if (newName.length < 3) {
                                  setSuccessToast("Numele trebuie să aibă minim 3 caractere.");
                                  return;
                                }
                                setUserProfile(prev => ({ ...prev, name: newName }));
                                setSuccessToast("Numele de profil a fost salvat și actualizat cu succes! 🌟");
                              }
                            }}
                            title="Salvează"
                            className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 text-[#050811] rounded-xl transition-colors select-none cursor-pointer border-none flex items-center justify-center shrink-0"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </div>

                      {/* Separated Profile Picture Config place Button */}
                      <div className="pt-2 text-left space-y-2 border-t border-[#1F293D]/15 pt-3">
                        <label className="text-[10px] font-bold font-mono text-[#64748B] uppercase tracking-wider block">
                          Poză de Profil (Preseturi & Personalizare)
                        </label>
                        <button
                          onClick={() => {
                            setTempPhotoUrl(userProfile.profilePhotoUrl || "avatar_green_rocket");
                            setTempPhotoZoom(userProfile.profilePhotoZoom || 100);
                            setIsAvatarModalOpen(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#10B981]/10 hover:bg-[#10B981]/15 border border-[#10B981]/30 hover:border-[#10B981]/60 text-[#10B981] rounded-xl text-xs font-bold transition-all cursor-pointer select-none"
                        >
                          🖼️ Personalizează Poză și Zoom
                        </button>
                      </div>

                    </div>

                    {/* Email Details Card */}
                    <div className={`p-4 border rounded-2xl relative overflow-hidden shadow-md flex items-center gap-3 ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
                    }`}>
                      <div className="w-8 h-8 rounded-lg bg-[#64748B]/10 text-[#64748B] flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="text-[10px] font-bold font-mono text-[#64748B] block">EMAIL LOGAT</span>
                        <span className="text-xs font-semibold truncate block max-w-[180px] text-slate-700 dark:text-slate-300">
                          {loggedInEmail || "fără_email@startup.com"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Stats & Achievements */}
                  <div className="lg:col-span-2 space-y-6 text-left">
                    
                    {/* Stats Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      
                      <div className={`p-4 border rounded-2xl space-y-1.5 ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
                      }`}>
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-bold">
                          <Zap className="w-4 h-4 text-[#10B981]" />
                          <span>Total XP</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-display font-extrabold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                            {userProfile.xp}
                          </span>
                          <span className="text-[10px] font-mono text-[#10B981] font-bold">XP</span>
                        </div>
                      </div>

                      <div className={`p-4 border rounded-2xl space-y-1.5 ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
                      }`}>
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-bold">
                          <Flame className="w-4 h-4 text-[#F59E0B]" />
                          <span>Zile consecutive</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-display font-extrabold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                            {userProfile.streak || 1}
                          </span>
                          <span className="text-[10px] font-mono text-[#F59E0B] font-bold">ZILE</span>
                        </div>
                      </div>

                      <div className={`p-4 border rounded-2xl space-y-1.5 col-span-2 md:col-span-1 ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
                      }`}>
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-bold">
                          <GraduationCap className="w-4 h-4 text-emerald-400" />
                          <span>Module finalizate</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-2xl font-display font-extrabold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                            {userProfile.completedNodes?.length || 0}
                          </span>
                          <span className="text-[10px] font-mono text-[#64748B] font-bold">/ {getOrderedNodes().length} Lecții</span>
                        </div>
                      </div>

                    </div>

                    {/* Shop Unlocked Items list */}
                    <div className={`p-6 border rounded-3xl space-y-4 shadow-md ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold font-mono text-[#10B981] tracking-wider uppercase block">INVENTAR COMPANIA TA</span>
                          <h4 className={`font-display text-base font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                            Active și Îmbunătățiri deblocate în Shop
                          </h4>
                        </div>
                        <button
                          onClick={() => setActivePage('club')}
                          className="text-[11px] text-[#10B981] hover:underline font-bold bg-transparent border-none cursor-pointer"
                        >
                          Vizitează Shop-ul XP ↗
                        </button>
                      </div>

                      {(userProfile.unlockedItems && userProfile.unlockedItems.length > 0) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                          {userProfile.unlockedItems.map((itemId) => {
                            const itemDetails = [
                              { id: 'marketing', name: 'Canale de Marketing Optimizate', desc: 'Generează o prezență constantă prin social media, organic SEO și reclame targetate de la prima zi.', badge: '⚡ RECLAME LIVE' },
                              { id: 'avocat', name: 'Mentorat Legal / Juridic Co-Fondator', desc: 'Redactează clauze de vesting, acționariat, NDA-uri și forme de constituire fără efort penalizator.', badge: '📜 LEGAL OK' },
                              { id: 'pitch', name: 'Deck de Prezentare Series Pre-Seed', desc: 'Format perfect pentru Pitch-uri Angel românești și fonduri micro-VC acreditate la nivel regional.', badge: '🏆 INVESTITOR DECK' },
                              { id: 'audit', name: 'Consultant Audit Cash-Flow', desc: 'Asigură o vizibilitate precisă în rulajul lunar și previne depășirile de cheltuieli neaщееtate.', badge: '📊 FINANCIAL RADAR' },
                              { id: 'vip', name: 'Insignă Discord VIP Pioneer', desc: 'Afișează statutul tău de fondator dornic să schimbe piața românească pe serverele noastre oficiale.', badge: '✨ VIP BADGE' }
                            ].find(it => it.id === itemId);

                            if (!itemDetails) return null;

                            return (
                              <div 
                                key={itemId}
                                className={`p-3 border rounded-xl flex items-start gap-2.5 transition-all ${
                                  theme === 'light' ? 'bg-white border-slate-100' : 'bg-[#151D2F]/50 border-[#1F293D]/40'
                                }`}
                              >
                                <div className="p-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] mt-0.5 shadow-sm">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                                <div className="space-y-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-xs font-bold truncate ${theme === 'light' ? 'text-slate-700' : 'text-white'}`}>{itemDetails.name}</span>
                                    <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] tracking-wide shrink-0">
                                      {itemDetails.badge}
                                    </span>
                                  </div>
                                  <p className={`text-[10px] leading-relaxed truncate ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                                    {itemDetails.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-8 border border-dashed rounded-xl text-center space-y-2">
                          <p className="text-xs text-[#64748B] font-semibold">
                            Nu ai achiziționat încă îmbunătățiri de afaceri în runda curentă!
                          </p>
                          <p className="text-[10px] text-[#64748B] italic max-w-sm mx-auto font-medium">
                            Răspunde corect la scenariile practice zilnice, deblochează modulele educaționale din lecții și folosește XP-ul acumulat în "Clubul XP" de la meniu pentru a-ți dota compania!
                          </p>
                        </div>
                      )}

                    </div>

                    <div className={`p-6 border border-rose-500/10 rounded-3xl space-y-4 shadow-md ${
                      theme === 'light' ? 'bg-red-50/20' : 'bg-[#130E14]'
                    }`}>
                      <div className="space-y-1">
                        <h4 className={`font-display text-base font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                          Administrare Profil și Certificare Date
                        </h4>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => {
                            signOut(auth).then(() => {
                              setIsLoggedIn(false);
                              setLoggedInEmail("");
                              setActivePage('home');
                              setSuccessToast("Te-ai delogat cu succes.");
                            }).catch(err => {
                              console.error("Eroare la eliminare sesiune:", err);
                            });
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            theme === 'light' 
                              ? 'bg-white border-slate-350 hover:bg-slate-50 text-slate-700' 
                              : 'bg-[#151D2F] border-[#1F293D] hover:border-[#F59E0B]/50 hover:bg-[#1E2538] text-white'
                          }`}
                        >
                          <LogOut className="w-4 h-4 text-rose-500" /> Șterge sesiune / Deconectează-te
                        </button>

                        <button
                          onClick={() => {
                            if (confirm("Ești sigur că vrei să resetezi datele tale de învățare din cursul StartUp Finance? Această acțiune va reseta XP-ul la 0 și va șterge modulele deblocate permanent.")) {
                              setUserProfile({
                                name: userProfile.name,
                                xp: 0,
                                streak: 1,
                                completedNodes: [],
                                unlockedItems: [],
                                dailyQuests: null
                              });
                              setSuccessToast("Toate datele tale educaționale au fost resetate cu succes! O zi ambițioasă în continuare.");
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" /> Resetează Progresul Cursului
                        </button>
                      </div>

                      <div id="section-delete-account" className="pt-4 border-t border-rose-500/10 space-y-2">
                        <p id="desc-delete-account" className={`text-[11px] leading-relaxed ${
                          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                        }`}>
                          Sectiune administrativă GDPR și stocare: șterge definitiv documentul tău de profil din serverele Cloud Firestore și șterge în totalitate stocarea locală a browserului (`localStorage`).
                        </p>
                        <button
                          id="btn-delete-user-account"
                          type="button"
                          onClick={handleDeleteAccount}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" /> Șterge Contul Definitiv (GDPR / Ștergere Date)
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              )}

            </motion.div>
          )}

          {/* DESPRE NOI (ABOUT US) VIEW */}
          {activePage === 'despre' && (
            <motion.div
              key="despre-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl mx-auto px-4 py-12 space-y-16"
            >
              <div className="text-center space-y-4 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-full text-xs font-bold text-[#10B981]">
                  <Users className="w-3.5 h-3.5" />
                  Misiunea Noastră
                </div>
                <h1 className={`font-display text-3xl md:text-5xl font-extrabold tracking-tight leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  Democratizăm Educația <br />
                  <span className="text-[#10B981]">Antreprenorială și Financiară</span>
                </h1>
                <p className="text-sm md:text-base text-[#64748B] font-medium leading-relaxed">
                  StartUp Finance este o platformă creată din pasiune pură, din dorința de a oferi tinerilor din România resursele, deprinderile și claritatea de care au nevoie pentru a-și lansa propriile inițiative și de a fi independenți.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
                {/* Profile Card & Planuri de Viitor */}
                <div className="lg:col-span-5 flex flex-col items-center select-none">
                  <div className="relative group w-full max-w-sm">
                    <div className="absolute inset-0 bg-[#10B981]/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all opacity-70"></div>
                    <div className={`relative p-3 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border ${
                      theme === 'light' 
                        ? 'bg-white border-slate-200 text-slate-800' 
                        : 'bg-[#0F1322] border-[#1F293D] text-white'
                    } group-hover:border-[#10B981]/50`}>
                      <img 
                        src="https://www.image2url.com/r2/default/images/1781688766593-89a2dd10-92a9-41fb-af38-cbbc29b0d082.jpg" 
                        alt="Sebastian Dumitru" 
                        referrerPolicy="no-referrer"
                        className="w-full h-auto aspect-[3/4] object-cover rounded-2xl transition-all duration-500"
                      />
                      <div className="mt-4 p-2 text-center">
                        <h3 className={`font-display text-lg font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Sebastian Dumitru</h3>
                        <p className="text-[#10B981] text-xs font-mono font-bold uppercase tracking-wider mt-0.5">Fondator și CEO</p>
                        <p className="text-[#64748B] text-xs font-semibold mt-1">StartUp Finance</p>
                      </div>
                    </div>
                  </div>

                  {/* Planuri de viitor Box */}
                  <div className="w-full max-w-sm mt-6">
                    <div className={`border p-6 rounded-3xl relative overflow-hidden shadow-xl space-y-4 ${
                      theme === 'light' 
                        ? 'bg-slate-50 border-slate-200/80 text-slate-800' 
                        : 'bg-[#0F1322] border-[#1F293D]'
                    }`}>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-bl-full pointer-events-none"></div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#10B981] uppercase tracking-wider font-mono">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse pulse-bullet"></span>
                        Planuri de Viitor
                      </div>
                      <h4 className={`font-display text-sm md:text-base font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Ce urmează pentru StartUp Finance?</h4>
                      <ul className="space-y-3 pt-1">
                        {[
                          { title: "Aplicație de Mobil Dedicată", desc: "Dezvoltarea unei aplicaţii native primitoare pentru iOS şi Android pentru a oferi acces rapid offline şi notificări utile." },
                          { title: "Parteneriate cu Licee", desc: "Posibilitatea ca profesorii să creeze conturi unde pot urmări simplu progresul şi punctele de XP ale elevilor lor în mod direct." },
                          { title: "Simulări Practice Avansate", desc: "Integrarea unui micro-motor demonstrativ conectat la evoluții reale din piață pentru tranzacționare virtuală." }
                        ].map((plan, idx) => (
                          <li key={idx} className="space-y-0.5">
                            <span className={`text-xs font-extrabold flex items-center gap-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-200'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse pulse-bullet shrink-0"></span> {plan.title}
                            </span>
                            <p className="text-[11px] text-[#64748B] leading-relaxed font-semibold pl-3">{plan.desc}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Story */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-4 text-sm md:text-base text-[#64748B] leading-relaxed">
                    <h2 className={`font-display text-xl md:text-2xl font-bold tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      Povestea din Spatele StartUp Finance
                    </h2>
                    
                    <p>
                      Salut! Sunt <strong className={`${theme === 'light' ? 'text-slate-800' : 'text-white'} font-semibold`}>Sebastian Dumitru</strong>, fondatorul acestui proiect. În calitate de antreprenor la rândul meu, de-a lungul timpului m-am ciocnit extrem de des de exact aceleași dileme birocratice, financiare și strategice pe care probabil le ai și tu sau partenerii tăi chiar în această clipă.
                    </p>
                    
                    <p>
                      În parcursul meu, am petrecut zeci de ore pierdut prin ghiduri birocratice confuze, analizând singur cum se deschide un PFA sau o companie, ce declară un SRL la ANAF, cum se validează cu adevărat ideile inovatoare prin faimosul <em className={`${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>„The Mom Test”</em>, cum se negociază o primă rundă de finanțare sau cum pot fi realizate primele investiții sigure pe Bursă. A trebuit mereu să fac cercetare de unul singur, să greșesc, să pierd săptămâni întregi și să sap după informații dispersate.
                    </p>
                    
                    <p>
                      Pentru mine, lucrul la start-upuri și tehnologie reprezintă o <strong className={`${theme === 'light' ? 'text-slate-800' : 'text-white'} font-semibold`}>pasiune absolută</strong>, este modul prin care cred că putem lăsa o amprentă durabilă și valoroasă asupra lumii, transformând conceepte teoretice în realități practice.
                    </p>
                    
                    <p className="border-l-3 border-[#10B981] pl-4 italic text-[#10B981]/90 bg-[#10B981]/5 py-2.5 rounded-r-xl">
                      „Am decis să construiesc această soluție interactivă tocmai pentru a-i ajuta pe tinerii din România să ocolească complet acele căutări interminabile pe cont propriu care adesea descurajează cele mai geniale proiecte înainte să apuce să fie lansate în viața reală.”
                    </p>
                    
                    <p>
                      De aceea, platforma StartUp Finance este și va rămâne <strong className="text-[#10B981] font-bold uppercase">complet gratuită</strong>. Singurul nostru scop este să aducem un val mare de plus-valoare în educația antreprenorială și financiară românească. Vrem ca <span className={`${theme === 'light' ? 'text-slate-800' : 'text-white'} font-bold`}>absolut</span> toți tinerii, indiferent de posibilitățile lor, să aibă oricând acces complet liber la aceste ghiduri complete, instrumente moderne de simulare, exerciții gamificate și module de asimilare activă, fără a fi constrânși vreodată să plătească cursuri de mii de euro promovate online sau consultanțe inaccesibile.
                    </p>
                  </div>

                  {/* Core values */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div className={`border p-4 rounded-2xl relative overflow-hidden group ${
                      theme === 'light' 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-[#0F1322] border-[#1F293D]'
                    }`}>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#10B981]/5 rounded-bl-full transition-all group-hover:scale-110"></div>
                      <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-2.5 font-bold font-mono">01</div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>100% Gratuit</h4>
                      <p className="text-[11px] text-[#64748B] leading-normal font-semibold">Toate modulele, exercițiile practice și chatul sunt oferite absolut gratuit pentru toți.</p>
                    </div>
                    <div className={`border p-4 rounded-2xl relative overflow-hidden group ${
                      theme === 'light' 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-[#0F1322] border-[#1F293D]'
                    }`}>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#10B981]/5 rounded-bl-full transition-all group-hover:scale-110"></div>
                      <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-2.5 font-bold font-mono">02</div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Educație Pură</h4>
                      <p className="text-[11px] text-[#64748B] leading-normal font-semibold">Materiale de înaltă calitate create de tineri adaptate nevoilor economice curente.</p>
                    </div>
                    <div className={`border p-4 rounded-2xl relative overflow-hidden group ${
                      theme === 'light' 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-[#0F1322] border-[#1F293D]'
                    }`}>
                      <div className="absolute top-0 right-0 w-16 h-16 bg-[#10B981]/5 rounded-bl-full transition-all group-hover:scale-110"></div>
                      <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-2.5 font-bold font-mono">03</div>
                      <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Focus Execuție</h4>
                      <p className="text-[11px] text-[#64748B] leading-normal font-semibold">Instrucțiuni scurte cu chestionare gamificate, XP-uri și exemple concrete.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* EVENIMENTE (EVENTS) VIEW */}
          {activePage === 'evenimente' && (
            <motion.div
              key="evenimente-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto px-4 py-16 text-center space-y-10"
            >
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-500">
                  <Calendar className="w-3.5 h-3.5" />
                  Secțiune Nouă
                </div>
                <h1 className={`font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  Evenimente StartUp &amp; <span className="text-[#10B981]">Webinarii Financiare</span>
                </h1>
                <p className="text-sm md:text-base text-[#64748B] font-medium leading-relaxed font-semibold">
                  Pregătim webinarii live, sesiuni interactive de Q&amp;A cu antreprenori de succes din ecosistemul românesc și sesiuni pitch pentru ideile comunității noastre.
                </p>
              </div>

              {/* Status card with requested text */}
              <div className={`p-8 md:p-12 border rounded-3xl relative overflow-hidden max-w-lg mx-auto shadow-xl space-y-6 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0F1322] border-[#1F293D]'
              }`}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-amber-500 rounded-b-full"></div>
                <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-xl font-bold">
                  🚧
                </div>
                <div className="space-y-2">
                  <h3 className={`font-display text-2xl font-black ${theme === 'light' ? 'text-slate-850' : 'text-white'}`}>Work in Progress</h3>
                  <p className="text-sm text-amber-500 font-mono font-bold uppercase tracking-widest">Coming soon</p>
                </div>
                <p className="text-xs text-[#64748B] leading-relaxed max-w-xs mx-auto font-semibold">
                  Abonații platformei vor primi notificare pe e-mail când lansăm calendarul oficial al primelor ateliere practice de investiții și pitch de afaceri.
                </p>
                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setSuccessToast("Te-ai înscris în lista de așteptare pentru evenimente! 🚀");
                    }}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Anunță-mă când se lansează
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TERMENI SI CONDITII VIEW */}
          {activePage === 'termeni' && (
            <motion.div
              key="termeni-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto px-4 py-12 space-y-8"
            >
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-full text-xs font-bold text-[#10B981]">
                  <Award className="w-3.5 h-3.5" />
                  Legal & Transparență
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Termeni și Condiții de Utilizare
                </h1>
                <p className="text-xs text-[#64748B] font-mono tracking-wider">
                  ULTIMA ACTUALIZARE: 17 IUNIE 2026
                </p>
              </div>

              <div className="bg-[#0F1322] border border-[#1F293D] rounded-3xl p-6 md:p-10 space-y-8 text-sm md:text-base text-[#64748B] leading-relaxed">
                
                <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-5 space-y-2 text-[#10B981]">
                  <h4 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Disclaimer Educational Foarte Important
                  </h4>
                  <p className="text-xs leading-relaxed font-semibold">
                    Conținutul integrat de StartUp Finance, incluzând chestionarele noastre, modulele teoretice, sfaturile interactive desprinse din resursele noastre sau articolele stocate, au un caracter STRICT EDUCAȚIONAL și INFORMATIV. Noi nu suntem brokeri autorizați, nu oferim consultanță fiscală oficială, planuri oficiale de investiții, brokeraj bursier sau consultanță de specialitate ANAF/juridică. Orice decizie de a începe un proiect, de a depune acte sau a investi pe bursa reală aparține în exclusivitate voinței tale asumate. Îndemnăm utilizatorii să consulte profesioniști acreditați înainte de a plasa bani reali pe piață.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">1. Acceptarea Acordului</h3>
                  <p>
                    Prin parcurgerea și utilizarea platformei StartUp Finance, îți exprimi acceptul total și necondiționat de a respecta regulile descrise în prezenta secțiune. Dacă nu validezi acești termeni, te rugăm să întrerupi accesarea platformei.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">2. Servicii Educaționale oferite</h3>
                  <p>
                    StartUp Finance oferă resurse digitale interactive gratuite concepute exclusiv pentru pregătirea tinerilor și încurajarea educației antreprenoriale și financiare din România (informații SRL/PFA, structuri contabile de bază, dinamica bursei de valori de tip educațional și exemple gamificate).
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">3. Proprietatea Asupra Conținutului</h3>
                  <p>
                    Textele originale, ilustrațiile, quiz-urile, schemele, arhitectura platformei, designul modulului gamificat și mecanicile interactive sunt sub proprietatea exclusivă a StartUp Finance, aparținând echipei și fondatorului Sebastian Dumitru. Copierea integrală sau revânzarea/exploatarea în regim comercial a ghidurilor noastre gratuite fără permisiunea scrisă preliminară este strict interzisă.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">4. Limitarea Clauzei de Răspundere</h3>
                  <p>
                    StartUp Finance nu are nicio responsabilitate legală sau materială pentru erorile de calcul din dosarele fiscale sau modificările de taxe, sau pierderile bursa reale rezultate din exploatarea eronată a teoriilor predate. Educația din aplicație este menită exclusiv să deschidă apetitul tinerilor pentru antreprenoriat organizat în România.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">5. Utilizarea Corectă a Platformei</h3>
                  <p>
                    Te angajezi să folosești platforma și modulele ei interactive exclusiv în scopul asimilării didactice. Generarea de limbaj ofensator, tentative de atac sau atacuri dăunătoare aduse serverelor noastre constituie o încălcare directă și va atrage blocarea imediată a accesului tău pe platformă.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* POLITICA DE CONFIDENTIALITATE VIEW */}
          {activePage === 'politica' && (
            <motion.div
              key="politica-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto px-4 py-12 space-y-8"
            >
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/20 px-3 py-1 rounded-full text-xs font-bold text-[#10B981]">
                  <Lock className="w-3.5 h-3.5" />
                  GDPR & Confidențialitate
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Politica de Confidențialitate
                </h1>
                <p className="text-xs text-[#64748B] font-mono tracking-wider">
                  ULTIMA ACTUALIZARE: 17 IUNIE 2026
                </p>
              </div>

              <div className="bg-[#0F1322] border border-[#1F293D] rounded-3xl p-6 md:p-10 space-y-8 text-sm md:text-base text-[#64748B] leading-relaxed">
                
                <p>
                  Protejarea deplină a intimității tale și securitatea datelor tale cu caracter personal reprezintă baza pe care clădim încrederea în proiectul StartUp Finance. Prezenta Politică de Confidențialitate explică corect și transparent, în conformitate cu regulamentul european <strong className="text-white">GDPR (Regulamentul UE 679/2016)</strong>, felul în care utilizăm datele tale.
                </p>

                <div className="space-y-3">
                  <h3 className="font-display text-lg font-bold text-white">1. Informațiile pe care le Colectăm</h3>
                  <p>Pentru a livra o experiență calitativă și a-ți stoca deprinderile gamificate, înregistrăm strict datele absolut necesare:</p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm">
                    <li><strong className="text-white">Date Personale:</strong> Adresa ta de e-mail, numele complet oferit la înrolare sau prin contul securizat simulat Google;</li>
                    <li><strong className="text-white">Indicatori Didactici:</strong> Modulele de curs parcurse, scorul general de XP obținut în exerciții, streak-ul zilnic de performanță memorat;</li>
                    <li><strong className="text-white">Sesiunile de Evaluare:</strong> Răspunsurile tale la chestionare și obiectivele bifate în cadrul checklist-ului teoretic pentru calcularea scorului și oferirea de feedback adaptat;</li>
                    <li><strong className="text-white">Configurație Tehnică:</strong> IP-ul tău, sistemul de operare și folosirea de stocare locală tip `localStorage` pentru a memora starea selectată de contrast a temei (Light/Dark mode).</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">2. Scopul Procesării</h3>
                  <p>
                    Colectăm și stocăm aceste informații eminamente din rațiuni funcționale:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs md:text-sm">
                    <li>Memorarea progresului tău, scorului general de XP și rangului tău în timp;</li>
                    <li>Operarea fără cusur a simulărilor pentru ca mecanismele interactive să îți poată asigura performanțe adaptate;</li>
                    <li>Menținerea stabilității tehnice și prevenirea atacurilor rău intenționate.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">3. Confidențialitatea Informațiilor</h3>
                  <p>
                    Nu vindem, nu cedăm în scop publicitar și nu exploatăm comercial datele tale. Nu cooperăm cu rețele de telemarketing sau brokeri externi. Toate transferurile de date (cum ar fi transmisiile API securizate server-to-server către modelul lingvistic Gemini de la Google) se execută în regim securizat criptat și nu sunt folosite cu intenții de publicitate.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">4. Drepturile Tale GDPR</h3>
                  <p>
                    Ai drepturi totale asupra datelor tale de e-learning active pe care le poți folosi în orice secundă:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs md:text-sm">
                    <li><strong className="text-white">Dreptul de a vizualiza și edita</strong> propriile tale date direct din meniul de profil;</li>
                    <li><strong className="text-white">Dreptul de a cere Ștergerea totală</strong> a contului și a tot istoricului de XP din sistemele noastre;</li>
                    <li><strong className="text-white">Dreptul de a te opune prelucrării</strong> prin ștergerea locală a istoricului browserului.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-white">5. Adresa de Contact Suport</h3>
                  <p>
                    Proprietarul și unicul controlor de date al platformei este Sebastian Dumitru. Pentru orice fel de solicitări de date, nelămuriri or drepturi suplimentare solicitate, ne poți scrie la e-mailul direct: <strong className="text-white">sebid418@gmail.com</strong>.
                  </p>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className={`border-t transition-colors duration-200 mt-auto ${
        theme === 'light' ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-[#090D1A] border-[#1F293D] text-white'
      }`}>
        {/* Compact Collapsible FAQ Band */}
        <div className={`border-b transition-colors ${
          theme === 'light' ? 'border-slate-200 bg-white' : 'border-[#1F293D]/30 bg-[#070b14]'
        }`}>
          <button 
            onClick={() => setIsFaqSectionExpanded(!isFaqSectionExpanded)}
            className="w-full py-4 px-4 flex items-center justify-between hover:bg-black/5 transition-all text-left"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse pulse-bullet"></span>
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider font-mono text-[#10B981]">
                Întrebări Frecvente (FAQ)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChevronDown className={`w-4 h-4 text-[#10B981] transition-transform ${isFaqSectionExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Expanded FAQ content container */}
          <AnimatePresence>
            {isFaqSectionExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="max-w-4xl mx-auto px-4 pb-8 pt-4 space-y-3">
                  {[
                    {
                      q: "1. Cât costă utilizarea platformei?",
                      a: "Platforma StartUp Finance este 100% gratuită. Misiunea noastră este să oferim acces democratic la educație antreprenorială și financiară românească de top pentru absolut toți tinerii."
                    },
                    {
                      q: "2. Ce reprezintă punctele de XP și cum funcționează magazinul?",
                      a: "Parcurgând lecțiile teoretice și răspunzând corect la chestionare, acumulezi puncte de XP. Aceste puncte pot fi cheltuite în 'Clubul XP' pentru a debloca recompense gamificate și beneficii practice."
                    },
                    {
                      q: "3. Cum mă ajută asimilarea activă prin checklist teoretic?",
                      a: "Sistemul nostru de checklist-uri interactive te ajută să reții activ termenii esențiali ai fiecărei teme înainte de a rula chestionarul final. Acest proces consolidează deprinderi de business de lungă durată și îți acordă XP suplimentar!"
                    },
                    {
                      q: "4. Progresul meu se salvează automat între dispozitive?",
                      a: "Da! Atunci când te autentifici utilizând e-mailul tău sau folosești conectarea rapidă securizată cu Google, întregul tău progres, inclusiv XP-urile acumulate și streak-ul zilnic, se sincronizează automat în siguranță pe server."
                    }
                  ].map((faq, index) => {
                    const isOpen = expandedFaqIndex === index;
                    return (
                      <div 
                        key={index} 
                        className={`border rounded-2xl overflow-hidden transition-colors ${
                          theme === 'light' 
                            ? 'bg-[#F8FAFC] border-slate-200' 
                            : 'bg-[#050811]/40 border-[#1F293D]/40'
                        }`}
                      >
                        <button
                          onClick={() => setExpandedFaqIndex(isOpen ? null : index)}
                          className="w-full text-left p-4 flex items-center justify-between hover:bg-black/5 transition-colors"
                        >
                          <span className={`text-xs md:text-sm font-bold uppercase tracking-wide ${
                            theme === 'light' ? 'text-slate-800' : 'text-zinc-200'
                          }`}>
                            {faq.q}
                          </span>
                          <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-400'}`}>
                            <ChevronDown className="w-5 h-5" />
                          </span>
                        </button>
                        
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className={`p-4 pt-1 text-xs md:text-sm border-t leading-relaxed font-semibold pl-6 ${
                                theme === 'light' 
                                  ? 'border-slate-150 text-slate-600 bg-white/70' 
                                  : 'border-[#1F293D]/20 text-[#64748B] bg-black/10'
                              }`}>
                                {faq.a}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <img 
                src="https://www.image2url.com/r2/default/images/1781969419655-34354dda-41bf-4e66-836f-2b0db367bd3f.png" 
                alt="Logo"
                referrerPolicy="no-referrer"
                className="aspect-square w-6 h-6 rounded-md object-cover shadow-[0_0_8px_rgba(16,185,129,0.25)]"
              />
              <span className={`font-display font-black tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                StartUp <span className="text-[#10B981]">Finance</span>
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-semibold">
              Educație adaptată economiei secolului 21. Fără cursuri interminabile, axată pur pe execuție.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-[#64748B] font-semibold">
            <span 
              onClick={() => {
                setActivePage('despre');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className={`hover:text-[#10B981] cursor-pointer transition-colors ${
                activePage === 'despre' ? 'text-[#10B981] font-bold' : theme === 'light' ? 'text-slate-600' : 'text-[#64748B]'
              }`}
            >
              Despre noi
            </span>
            <span 
              onClick={() => {
                setActivePage('termeni');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className={`hover:text-[#10B981] cursor-pointer transition-colors ${
                activePage === 'termeni' ? 'text-[#10B981] font-bold' : theme === 'light' ? 'text-slate-600' : 'text-[#64748B]'
              }`}
            >
              Termeni și Condiții
            </span>
            <span 
              onClick={() => {
                setActivePage('politica');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className={`hover:text-[#10B981] cursor-pointer transition-colors ${
                activePage === 'politica' ? 'text-[#10B981] font-bold' : theme === 'light' ? 'text-slate-600' : 'text-[#64748B]'
              }`}
            >
              Politica de Confidențialitate
            </span>
            <span className="text-[#10B981]">© 2026 StartUp Finance România</span>
          </div>
        </div>
      </footer>
      </div>

      {/* LIGHTBOX QUIZ OVERLAY MODAL */}
      <AnimatePresence>
        {activeModalNode !== null && (
          <div className="fixed inset-0 z-50 overflow-y-auto block">
            
            {/* Dark glass backdrop layout */}
            <div 
              className={`fixed inset-0 backdrop-blur-md transition-colors ${
                theme === 'light' ? 'bg-slate-900/40' : 'bg-[#050811]/95'
              }`}
              onClick={() => {
                setActiveModalNode(null);
                setModalStep('theory');
                setSelectedAnswer(null);
                setQuizFeedback({ status: null, message: "" });
                setActiveQuestionIdx(0);
              }}
            ></div>
 
            {/* Modal Body Container */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className={`relative w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 overflow-hidden border ${
                  theme === 'light'
                    ? "bg-white border-slate-200 text-slate-800"
                    : "bg-[#0F1322] border-[#1F293D] text-white"
                }`}
              >
                
                {/* Header title */}
                <div className={`flex items-start justify-between gap-4 border-b pb-4 ${
                  theme === 'light' ? 'border-slate-150' : 'border-[#1F293D]/60'
                }`}>
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono font-bold tracking-widest text-[#10B981] uppercase flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4" />
                      <span>Sprint formativ</span>
                    </div>
                    <h3 className={`font-display text-xl md:text-2xl font-black leading-tight ${
                      theme === 'light' ? 'text-slate-800' : 'text-white'
                    }`}>
                      {activeModalNode.title}
                    </h3>
                  </div>
 
                  {/* Close trigger button */}
                  <button 
                    onClick={() => {
                      setActiveModalNode(null);
                      setModalStep('theory');
                      setSelectedAnswer(null);
                      setQuizFeedback({ status: null, message: "" });
                      setActiveQuestionIdx(0);
                    }}
                    className={`p-1.5 transition-colors shrink-0 cursor-pointer rounded-xl border ${
                      theme === 'light'
                        ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 border-slate-200'
                        : 'text-[#64748B] hover:text-white hover:bg-[#1E2538] border-[#1F293D]/75'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Timeline Stepper */}
                <div className="flex items-center justify-between pb-6 border-b border-dashed border-[#10B981]/25">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      modalStep === 'theory' 
                        ? 'bg-[#10B981] text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                        : 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    }`}>
                      1
                    </div>
                    <div>
                      <p className={`text-[11px] font-bold uppercase tracking-wider font-mono leading-none ${modalStep === 'theory' ? 'text-[#10B981]' : 'text-slate-500'}`}>Teorie</p>
                      <p className="text-[9px] text-slate-400 font-semibold">Studiu activ (checklist)</p>
                    </div>
                  </div>
                  
                  <div className="flex-grow mx-4 h-[2px] bg-slate-800 rounded-full relative overflow-hidden">
                    <div className={`absolute left-0 top-0 h-full bg-gradient-to-r from-[#10B981] to-[#10B981]/40 transition-all duration-500`} style={{ width: modalStep === 'theory' ? '30%' : '100%' }}></div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      modalStep === 'quiz' 
                        ? 'bg-[#10B981] text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                        : 'bg-[#1F293D] text-slate-400 border border-[#1F293D]'
                    }`}>
                      2
                    </div>
                    <div>
                      <p className={`text-[11px] font-bold uppercase tracking-wider font-mono leading-none ${modalStep === 'quiz' ? 'text-[#10B981]' : 'text-slate-400'}`}>Evaluare</p>
                      <p className="text-[9px] text-slate-400 font-semibold font-sans">Verificare practică</p>
                    </div>
                  </div>
                </div>

                {/* TWO-STEP CONTENT RENDERING */}
                {modalStep === 'theory' ? (
                  // STAGE 1: STUDY PHASE (taught before being tested)
                  <div className="space-y-6">
                    {/* Base concept highlight */}
                    <div className={`p-4 md:p-5 rounded-2xl border transition-all ${
                      theme === 'light' 
                        ? 'bg-emerald-50/45 border-emerald-500/10' 
                        : 'bg-[#10B981]/5 border-[#10B981]/10'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-[#10B981]/15 rounded-xl shrink-0 border border-[#10B981]/25 text-[#10B981]">
                          <Lightbulb className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-black text-[#10B981] tracking-widest uppercase block">
                            Conceptul esențial
                          </span>
                          <p className={`text-sm md:text-base leading-relaxed font-bold ${
                            theme === 'light' ? 'text-slate-800' : 'text-slate-100'
                          }`}>
                            {activeModalNode.theory?.intel || activeModalNode.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Checklist Points */}
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black text-[#64748B] uppercase font-mono tracking-widest">
                          Bifează ca înțeles (Apasă pe carduri):
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-0.5 rounded-full border border-[#10B981]/20 select-none">
                          {checkedTheoryBullets.filter(Boolean).length} / {activeModalNode.theory?.bullets?.length || 0} bifate
                        </span>
                      </div>

                      <div className="grid gap-2.5">
                        {activeModalNode.theory?.bullets ? (
                          activeModalNode.theory.bullets.map((bullet, k) => {
                            const isChecked = checkedTheoryBullets[k] || false;
                            return (
                              <motion.div 
                                key={k}
                                whileHover={{ scale: 1.006 }}
                                whileTap={{ scale: 0.994 }}
                                onClick={() => {
                                  let updated = [...checkedTheoryBullets];
                                  if (updated.length === 0) {
                                    updated = new Array(activeModalNode.theory?.bullets?.length || 0).fill(false);
                                  }
                                  updated[k] = !updated[k];
                                  setCheckedTheoryBullets(updated);
                                  
                                  // Quest completion check
                                  const allChecked = updated.every(Boolean) && updated.length === (activeModalNode.theory?.bullets?.length || 0);
                                  if (allChecked && !userProfile.dailyQuests?.chatAsked) {
                                    setUserProfile(p => {
                                      const quests = p.dailyQuests || { chatAsked: false, nodeCompleted: false, articleRead: false, lastResetDate: new Date().toISOString().split('T')[0] };
                                      if (quests.chatAsked) return p;
                                      const updatedQuests = { ...quests, chatAsked: true };
                                      setTimeout(() => {
                                        setSuccessToast("Misiune deblocată! +10 XP pentru asimilarea activă și bifarea elementelor-cheie din lecție! 📚💡");
                                      }, 500);
                                      return {
                                        ...p,
                                        xp: p.xp + 10,
                                        dailyQuests: updatedQuests
                                      };
                                    });
                                  }
                                }}
                                className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 relative overflow-hidden group select-none ${
                                  isChecked
                                    ? theme === 'light'
                                      ? 'bg-emerald-50/60 border-emerald-500/40 shadow-sm'
                                      : 'bg-[#10B981]/10 border-[#10B981]/80 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : theme === 'light'
                                      ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                      : 'bg-[#13192B] border-[#1F293D] hover:border-[#3b4c6e] hover:bg-[#1A233A]'
                                }`}
                              >
                                <div className="flex items-start gap-3.5 pr-2 grow">
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 text-[10px] font-mono font-bold transition-all ${
                                    isChecked
                                      ? 'bg-[#10B981] border-[#10B981] text-black'
                                      : theme === 'light'
                                        ? 'bg-slate-50 border-slate-300 text-slate-500'
                                        : 'bg-slate-900 border-[#1F293D] text-[#64748B]'
                                  }`}>
                                    {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3.5] text-black" /> : k + 1}
                                  </span>
                                  <span className={`text-xs md:text-sm leading-relaxed font-semibold transition-all ${
                                    isChecked 
                                      ? theme === 'light' ? 'text-emerald-900 line-through opacity-75 font-medium' : 'text-slate-400 line-through opacity-70'
                                      : theme === 'light' ? 'text-slate-700' : 'text-slate-200'
                                  }`}>
                                    {bullet}
                                  </span>
                                </div>
                                <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-xl transition-colors group-hover:bg-[#10B981]"></div>
                              </motion.div>
                            );
                          })
                        ) : (
                          <div className="text-xs text-[#64748B] italic">Informații teoretice în curs de asimilare...</div>
                        )}
                      </div>
                    </div>

                    {/* Styled Case Study block */}
                    <div className={`p-4 md:p-5 rounded-2xl border-l-[4px] shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all ${
                      theme === 'light' 
                        ? 'bg-amber-50/40 border-amber-500/70 border-y-slate-200 border-r-slate-200 border' 
                        : 'bg-amber-500/5 border-amber-500 border-[#2C241B] border'
                    }`}>
                      <div className="flex items-center gap-2 text-amber-500">
                        <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black font-mono uppercase tracking-widest leading-none">
                          Exemplu practic (România)
                        </span>
                      </div>
                      <p className={`text-xs md:text-sm leading-relaxed font-semibold ${
                        theme === 'light' ? 'text-slate-700' : 'text-slate-300'
                      }`}>
                        {activeModalNode.theory?.example || "Oportunitate locală de afaceri calibrată direct pe piața din România din prezent."}
                      </p>
                    </div>

                    {/* Bottom stage trigger */}
                    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 border-t ${
                      theme === 'light' ? 'border-slate-150' : 'border-[#1F293D]/60'
                    }`}>
                      <span className="text-[11px] text-[#64748B] font-bold text-center sm:text-left leading-tight flex items-center gap-1.5 pointer-events-none">
                        {checkedTheoryBullets.every(Boolean) ? (
                          <span className="text-[#10B981] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Toate conceptele au fost asimilate!
                          </span>
                        ) : (
                          "Sfat: Bifează checklist-ul de mai sus înainte de test."
                        )}
                      </span>
                      <button
                        onClick={() => {
                          // Bypass checkout safety: auto-complete checklist state
                          if (!checkedTheoryBullets.every(Boolean)) {
                            setCheckedTheoryBullets(new Array(activeModalNode.theory?.bullets?.length || 0).fill(true));
                            if (!userProfile.dailyQuests?.chatAsked) {
                              setUserProfile(p => {
                                const quests = p.dailyQuests || { chatAsked: false, nodeCompleted: false, articleRead: false, lastResetDate: new Date().toISOString().split('T')[0] };
                                if (quests.chatAsked) return p;
                                const updatedQuests = { ...quests, chatAsked: true };
                                return {
                                  ...p,
                                  xp: p.xp + 10,
                                  dailyQuests: updatedQuests
                                };
                              });
                            }
                          }
                          setModalStep('quiz');
                        }}
                        className={`w-full sm:w-auto bg-[#10B981] hover:bg-[#10B981]/90 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95 cursor-pointer text-center`}
                      >
                        Treci la testul practic →
                      </button>
                    </div>
                  </div>
                ) : (
                  // STAGE 2: ACTION EVALUATION (quiz challenge)
                  (() => {
                    const hasMultipleQuestions = activeModalNode.questions && activeModalNode.questions.length > 0;
                    const activeQuestionObj = hasMultipleQuestions && activeModalNode.questions
                      ? activeModalNode.questions[activeQuestionIdx]
                      : {
                          question: activeModalNode.question,
                          options: activeModalNode.options,
                          correct: activeModalNode.correct,
                          explanation: activeModalNode.explanation
                        };

                    return (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-widest block">
                                Întrebare de Calibrare:
                              </span>
                              {hasMultipleQuestions && (
                                <span className="text-[10px] font-bold font-mono text-amber-500 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 whitespace-nowrap">
                                  Întrebarea {activeQuestionIdx + 1} din {activeModalNode.questions!.length}
                                </span>
                              )}
                            </div>
                            <h4 className={`text-sm md:text-base font-bold leading-relaxed ${
                              theme === 'light' ? 'text-slate-800' : 'text-white'
                            }`}>
                              {activeQuestionObj.question}
                            </h4>
                          </div>

                          {/* MCQ Options vertical list */}
                          <div className="grid gap-2.5">
                            {activeQuestionObj.options.map((option, idx) => {
                              const isSelected = selectedAnswer === idx;
                              let optionStyle = "";
                              let letterBadgeStyle = "";
                              
                              if (isSelected) {
                                if (quizFeedback.status === 'success') {
                                  optionStyle = "border-[#10B981] bg-[#10B981]/15 text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                                  letterBadgeStyle = "bg-[#10B981] text-black border-[#10B981]";
                                } else if (quizFeedback.status === 'error') {
                                  optionStyle = "border-[#F43F5E] bg-[#F43F5E]/15 text-[#F43F5E] shadow-[0_0_15px_rgba(244,63,94,0.15)]";
                                  letterBadgeStyle = "bg-[#F43F5E] text-white border-[#F43F5E]";
                                } else {
                                  optionStyle = theme === 'light'
                                    ? "border-[#10B981] bg-[#10B981]/5 text-[#10B981] scale-[1.01]"
                                    : "border-slate-300 bg-white/5 text-slate-100 scale-[1.01]";
                                  letterBadgeStyle = theme === 'light' ? "bg-[#10B981] text-white border-[#10B981]" : "bg-white text-black border-white";
                                }
                              } else {
                                optionStyle = theme === 'light'
                                  ? "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 text-slate-700"
                                  : "border-[#1F293D] bg-[#13192B] hover:bg-[#1E2538] hover:border-[#334155] text-slate-300";
                                letterBadgeStyle = theme === 'light' ? "text-slate-500 border-slate-300 bg-white" : "text-[#64748B] border-[#1F293D] bg-[#050811]";
                              }

                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleAnswerSelection(idx)}
                                  disabled={quizFeedback.status === 'success'}
                                  className={`w-full text-left p-4 rounded-xl border-2 text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-3.5 cursor-pointer leading-relaxed ${optionStyle}`}
                                >
                                  <span className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center border text-xs font-mono font-bold transition-all ${letterBadgeStyle}`}>
                                    {String.fromCharCode(idx + 65)}
                                  </span>
                                  <span className="grow leading-snug">{option}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Feedback dynamic diagnostics panel */}
                        {quizFeedback.status !== null && (
                          <div className={`p-4 rounded-xl border-2 text-xs md:text-sm font-semibold leading-relaxed flex items-start gap-3 transition-all ${
                            quizFeedback.status === 'success'
                              ? theme === 'light'
                                ? 'bg-emerald-50 border-emerald-500/20 text-emerald-950 shadow-sm shadow-[#10B981]/5'
                                : 'bg-[#10B981]/10 border-[#10B981]/20 text-emerald-300'
                              : theme === 'light'
                                ? 'bg-rose-50 border-rose-500/20 text-rose-950 shadow-sm shadow-[#F43F5E]/5'
                                : 'bg-[#F43F5E]/10 border-[#F43F5E]/20 text-rose-300'
                          }`}>
                            {quizFeedback.status === 'success' 
                              ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#10B981]" /> 
                              : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#F43F5E]" />
                            }
                            <div className="space-y-1">
                              <div className={`font-bold uppercase tracking-wide text-[10px] font-mono leading-none ${
                                quizFeedback.status === 'success' ? 'text-[#10B981]' : 'text-[#F43F5E]'
                              }`}>
                                {quizFeedback.status === 'success' ? "Foarte bine! Răspuns Corect" : "Mai încearcă!"}
                              </div>
                              <p className={`text-xs leading-relaxed font-semibold ${
                                theme === 'light' ? 'text-slate-600' : 'text-slate-300'
                              }`}>
                                {quizFeedback.message}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Bottom action controllers */}
                        <div className="flex items-center justify-between gap-3 pt-5 border-t border-[#1F293D]/60 w-full">
                          <button 
                            onClick={() => {
                              setModalStep('theory');
                              setSelectedAnswer(null);
                              setQuizFeedback({ status: null, message: "" });
                              setActiveQuestionIdx(0);
                            }}
                            className="text-xs font-bold text-[#64748B] hover:text-white transition-colors cursor-pointer"
                          >
                            ← Înapoi la teorie
                          </button>

                          <div className="flex items-center gap-2">
                            {quizFeedback.status !== 'success' ? (
                              <>
                                {quizFeedback.status === 'error' && (
                                  <button 
                                    onClick={() => {
                                      setSelectedAnswer(null);
                                      setQuizFeedback({ status: null, message: "" });
                                    }}
                                    className="text-xs font-bold text-amber-500 hover:text-amber-400 px-3 py-2 transition-colors cursor-pointer"
                                  >
                                    Reîncearcă
                                  </button>
                                )}
                                <button 
                                  onClick={verifyAnswer}
                                  disabled={selectedAnswer === null}
                                  className={`text-xs font-bold px-5 py-3 rounded-xl transition-all cursor-pointer ${
                                    selectedAnswer !== null
                                      ? `bg-[#10B981] hover:bg-[#10B981]/90 ${theme === 'light' ? 'text-white' : 'text-black'} shadow-[0_4px_12px_rgba(16,185,129,0.3)]`
                                      : 'bg-[#1E2538] text-[#64748B] cursor-not-allowed border border-[#1f293d]'
                                  }`}
                                >
                                  Verifică Răspunsul
                                </button>
                              </>
                            ) : (
                              (() => {
                                const isLastQuestion = !hasMultipleQuestions || activeQuestionIdx === (activeModalNode.questions!.length - 1);
                                if (isLastQuestion) {
                                  return (
                                    <button 
                                      onClick={() => {
                                        setActiveModalNode(null);
                                        setModalStep('theory');
                                        setActiveQuestionIdx(0);
                                      }}
                                      className={`bg-[#10B981] hover:bg-[#10B981]/95 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-xs px-5 py-3 rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)] cursor-pointer`}
                                    >
                                      Continuă pe hartă →
                                    </button>
                                  );
                                } else {
                                  return (
                                    <button 
                                      onClick={() => {
                                        setActiveQuestionIdx(prev => prev + 1);
                                        setSelectedAnswer(null);
                                        setQuizFeedback({ status: null, message: "" });
                                      }}
                                      className={`bg-[#10B981] hover:bg-[#10B981]/95 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-xs px-5 py-3 rounded-xl shadow-[0_4px_12px_rgba(16,185,129,0.3)] cursor-pointer`}
                                    >
                                      Următoarea Întrebare ({activeQuestionIdx + 2}/{activeModalNode.questions!.length}) →
                                    </button>
                                  );
                                }
                              })()
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
 
              </motion.div>
            </div>
            
          </div>
        )}
      </AnimatePresence>

      {/* INVESTMENT DEMO UNLOCKED CELEBRATION MODAL */}
      <AnimatePresence>
        {showInvestmentUnlockCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => setShowInvestmentUnlockCelebration(false)}
            ></div>

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 20 }}
              className={`relative w-full max-w-lg rounded-3xl p-6 md:p-8 text-center space-y-6 shadow-2xl z-10 border transition-all ${
                theme === 'light'
                  ? 'bg-white border-slate-205 text-slate-800 shadow-slate-300'
                  : 'bg-[#0B0F1C] border-[#1F293D] text-zinc-100 shadow-black'
              }`}
            >
              {/* Confetti elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                {[...Array(12)].map((_, i) => {
                  const colors = ['bg-amber-400', 'bg-emerald-400', 'bg-sky-400', 'bg-fuchsia-400'];
                  const color = colors[i % colors.length];
                  const left = `${Math.random() * 100}%`;
                  const delay = `${Math.random() * 2}s`;
                  return (
                    <span 
                      key={i} 
                      className={`absolute w-2 h-2 rounded-full opacity-60 animate-bounce ${color}`}
                      style={{ top: `${Math.random() * 80}%`, left, animationDelay: delay }}
                    />
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Capitol Finalizat COMPLET 🎉
                  </span>
                  <h3 className={`font-display text-xl md:text-2xl font-black ${
                    theme === 'light' ? 'text-slate-800' : 'text-white'
                  }`}>
                    Felicitări! Ai deblocat contul Broker Demo!
                  </h3>
                  <p className="text-xs md:text-sm text-[#64748B] font-semibold leading-relaxed">
                    Prin finalizarea completă a modulelor de **Finanțe**, **Economie** și **Investiții**, ți-ai consolidat noțiunile teoretice. Acum ești gata să aplici practica pe piața reală simulată!
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={() => {
                    setShowInvestmentUnlockCelebration(false);
                    setActivePage('invatare');
                    setInvatareTab('broker');
                    setSuccessToast("Bun venit în Demo Broker! 📈 Tranzacționează Inteligent!");
                  }}
                  className="w-full py-3 bg-[#10B981] hover:bg-emerald-500 text-black font-extrabold text-xs rounded-xl cursor-pointer shadow-lg shadow-emerald-500/15 uppercase tracking-wider"
                >
                  Accesează Demo Broker Acum 📈
                </button>
                <button
                  onClick={() => setShowInvestmentUnlockCelebration(false)}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl cursor-pointer border ${
                    theme === 'light' 
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                      : 'bg-slate-800 hover:bg-slate-700 border-slate-750 text-white'
                  }`}
                >
                  Închide Pop-up
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED ARTICLE VIEWER MODAL */}
      <AnimatePresence>
        {activeArticleReader !== null && (
          <div className="fixed inset-0 z-50 overflow-y-auto block">
            
            {/* Backdrop screen */}
            <div 
              className="fixed inset-0 bg-[#050811]/95 backdrop-blur-md"
              onClick={() => setActiveArticleReader(null)}
            ></div>

            {/* Modal Box */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="relative bg-[#0F1322] border border-[#1F293D] w-full max-w-2xl rounded-3xl shadow-2xl p-8 md:p-10 space-y-6"
              >
                
                {/* Meta details */}
                <div className="flex items-center justify-between text-xs font-mono font-bold border-b border-[#1F293D]/60 pb-3">
                  <span className="text-[#10B981]">{activeArticleReader.category}</span>
                  <span className="text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {activeArticleReader.readTime} lectură
                  </span>
                </div>

                {/* Headline banner */}
                <div className="space-y-2">
                  <h3 className="font-display text-xl md:text-3xl font-black text-white leading-tight">
                    {activeArticleReader.title}
                  </h3>
                  <p className="text-sm text-[#64748B] font-semibold italic">
                    {activeArticleReader.excerpt}
                  </p>
                </div>

                {/* Article body content formatted */}
                <div className="text-sm md:text-base text-slate-200 leading-relaxed font-semibold space-y-4 whitespace-pre-line">
                  {activeArticleReader.content}
                </div>

                {activeArticleReader.source && (
                  <div className="text-right">
                    <span className="text-[11px] text-[#64748B] font-mono italic">
                      Sursa conținutului: {activeArticleReader.source}
                    </span>
                  </div>
                )}

                {/* Foot indicators and closing buttons */}
                <div className="border-t border-[#1F293D]/60 pt-6 flex items-center justify-between">
                  <div className="text-[10px] text-[#64748B] font-mono font-bold tracking-tight uppercase flex items-center gap-1">
                    <Rocket className="w-3.5 h-3.5 text-[#10B981]" /> conținut validat de startupfinance
                  </div>
                  <button 
                    onClick={() => setActiveArticleReader(null)}
                    className={`bg-[#10B981] hover:bg-[#10B981]/90 ${theme === 'light' ? 'text-white' : 'text-black'} font-bold text-xs py-3.5 px-6 rounded-xl transition-all cursor-pointer`}
                  >
                    Închide articolul
                  </button>
                </div>

              </motion.div>
            </div>
            
          </div>
        )}
      </AnimatePresence>

      {/* FORMULARE PARTENERIATE / GOOGLE FORMS SCHEMES */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto block pr-0">
            {/* Backdrop cover overlay */}
            <div 
              className="fixed inset-0 bg-[#050811]/90 backdrop-blur-md"
              onClick={() => setIsFormModalOpen(false)}
            ></div>

            {/* Modal Body container positioning */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                className={`relative w-full max-w-xl rounded-3xl border shadow-2xl p-6 md:p-8 space-y-6 ${
                  theme === 'light' 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-[#0F1322] border-[#1F293D] text-[#F8FAFC]'
                }`}
              >
                {/* Header title */}
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#10B981]/15 text-[#10B981]">
                    {formModalType === 'school' ? <School className="w-3.5 h-3.5" /> : <Heart className="w-3.5 h-3.5" />}
                    <span>{formModalType === 'school' ? "EDUCAȚIE ÎN ȘCOLI" : "ALĂTURĂ-TE NOUĂ"}</span>
                  </div>

                  <h3 className={`font-display text-xl md:text-2xl font-black tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {formModalType === 'school' 
                      ? "Adu StartUp Finance în Școala Ta" 
                      : "Susține Proiectul StartUp Finance"}
                  </h3>
                  
                  <p className={`text-xs md:text-sm leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                    {formModalType === 'school'
                      ? "Fiecare liceu înscris are șansa de a beneficia de cursuri gratuite, kit-uri fizice de învățare și prelegeri din partea comunității de mentori."
                      : "Împreună accelerăm alfabetizarea financiară. Completează formularul pentru a intra în contact cu coordonatorul național."}
                  </p>
                </div>

                {/* Main submit form */}
                <form onSubmit={handleInAppFormSubmit} className="space-y-4">
                  
                  {formErrors.form && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-500 font-bold">
                      {formErrors.form}
                    </div>
                  )}

                  {/* Common Email field */}
                  <div className="space-y-1.5">
                    <label className={`block text-xs font-bold uppercase ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      Adresa de email de contact *
                    </label>
                    <input 
                      type="email"
                      required
                      placeholder="nume@exemplu.ro"
                      value={formModalType === 'school' ? schoolForm.email : supportForm.email}
                      onChange={(e) => {
                        if (formModalType === 'school') {
                          setSchoolForm({ ...schoolForm, email: e.target.value });
                        } else {
                          setSupportForm({ ...supportForm, email: e.target.value });
                        }
                      }}
                      className={`w-full text-xs font-semibold p-3.5 rounded-xl border outline-none transition-all ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-[#10B981] text-slate-800'
                          : 'bg-[#050811] border-[#1F293D] focus:border-[#10B981] text-white'
                      }`}
                    />
                    {formErrors.email && <span className="text-[10px] text-rose-500 font-bold">{formErrors.email}</span>}
                  </div>

                  {/* School Fields conditional rendering */}
                  {formModalType === 'school' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Vârstă */}
                      <div className="space-y-1.5">
                        <label className={`block text-xs font-bold uppercase ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                          Câți ani ai? (Vârsta) *
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: 17"
                          value={schoolForm.age}
                          onChange={(e) => setSchoolForm({ ...schoolForm, age: e.target.value })}
                          className={`w-full text-xs font-semibold p-3.5 rounded-xl border outline-none transition-all ${
                            theme === 'light'
                              ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-[#10B981] text-slate-800'
                              : 'bg-[#050811] border-[#1F293D] focus:border-[#10B981] text-white'
                          }`}
                        />
                        {formErrors.age && <span className="text-[10px] text-rose-500 font-bold">{formErrors.age}</span>}
                      </div>

                      {/* Clasa */}
                      <div className="space-y-1.5">
                        <label className={`block text-xs font-bold uppercase ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                          În ce clasă ești? *
                        </label>
                        <select
                          value={schoolForm.clasa}
                          onChange={(e) => setSchoolForm({ ...schoolForm, clasa: e.target.value })}
                          className={`w-full text-xs font-bold p-3.5 rounded-xl border outline-none transition-all appearance-none ${
                            theme === 'light'
                              ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-[#10B981] text-slate-800'
                              : 'bg-[#050811] border-[#1F293D] focus:border-[#10B981] text-white'
                          }`}
                        >
                          <option value="">Alege clasa...</option>
                          <option value="9">Clasa a IX-a</option>
                          <option value="10">Clasa a X-a</option>
                          <option value="11">Clasa a XI-a</option>
                          <option value="12">Clasa a XII-a</option>
                          <option value="Alta">Alta / Profesor</option>
                        </select>
                        {formErrors.clasa && <span className="text-[10px] text-rose-500 font-bold">{formErrors.clasa}</span>}
                      </div>

                      {/* Institutie */}
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className={`block text-xs font-bold uppercase ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                          Instituția de învățământ (Liceu / Localitate) *
                        </label>
                        <input 
                          type="text"
                          required
                          placeholder="Ex: Colegiul Național „Mihai Eminescu”, Constanța"
                          value={schoolForm.institutie}
                          onChange={(e) => setSchoolForm({ ...schoolForm, institutie: e.target.value })}
                          className={`w-full text-xs font-semibold p-3.5 rounded-xl border outline-none transition-all ${
                            theme === 'light'
                              ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-[#10B981] text-slate-800'
                              : 'bg-[#050811] border-[#1F293D] focus:border-[#10B981] text-white'
                          }`}
                        />
                        {formErrors.institutie && <span className="text-[10px] text-rose-500 font-bold">{formErrors.institutie}</span>}
                      </div>

                    </div>
                  ) : (
                    /* Support Fields conditional rendering */
                    <div className="space-y-1.5">
                      <label className={`block text-xs font-bold uppercase ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        Cum vrei să te implici? (Descriere) *
                      </label>
                      <textarea
                        required
                        rows={4}
                        placeholder="Menționează cu ce te ocupi și pe ce direcție dorești să contribui (ex: parteneriat media, sponsorizare directă, găzduire cursuri fizice, mentorat online)."
                        value={supportForm.description}
                        onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })}
                        className={`w-full text-xs font-semibold p-3.5 rounded-xl border outline-none transition-all ${
                          theme === 'light'
                            ? 'bg-slate-50 border-slate-300 focus:bg-white focus:border-[#10B981] text-slate-800'
                            : 'bg-[#050811] border-[#1F293D] focus:border-[#10B981] text-white'
                        }`}
                      ></textarea>
                      {formErrors.description && <span className="text-[10px] text-rose-500 font-bold">{formErrors.description}</span>}
                    </div>
                  )}

                  {/* Submission and Action Buttons bar */}
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmittingForm}
                      className={`flex-1 flex items-center justify-center gap-2 font-bold text-xs py-3.5 px-6 rounded-xl transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 ${
                        theme === 'light'
                          ? 'bg-[#10B981] hover:bg-[#0f2]/80 text-white shadow-md shadow-[#10B981]/25'
                          : 'bg-[#10B981] hover:bg-[#10B981]/90 text-black shadow-md shadow-[#10B981]/15'
                      }`}
                    >
                      {isSubmittingForm ? "Se trimite..." : "Trimite Solicitarea Acum 🚀"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsFormModalOpen(false)}
                      className={`font-bold text-xs py-3.5 px-6 rounded-xl border transition-all active:scale-[0.98] cursor-pointer ${
                        theme === 'light'
                          ? 'border-slate-300 hover:bg-slate-50 text-slate-700 bg-white'
                          : 'border-[#1F293D] hover:bg-[#151c2f] text-[#E2E8F0] bg-transparent'
                      }`}
                    >
                      Anulează
                    </button>
                  </div>
                </form>

                {/* Google Workspace API Advanced Forms Integration Section */}
                {!isLoggedIn && (
                  <div className={`p-4 rounded-2xl border ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#090C16] border-[#1F293D]/60'
                  } space-y-3`}>
                    <div className="flex items-center gap-1.5">
                      <div className="text-[10px] font-bold text-[#10B981] uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#10B981]/10">
                        Integrare Avansată
                      </div>
                    </div>
                    
                    <p className={`text-[11px] leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'}`}>
                      <strong>Opțional:</strong> Reușește mai multe prin Google Workspace! Te poți conecta cu Google pentru a crea un formular duplicat autonom, stocat complet securizat în Google Drive-ul tău personal! Astfel vei putea strânge feedback în mod direct de la proprii tăi elevi ori parteneri.
                    </p>

                    <button
                      type="button"
                      onClick={handleCreateGoogleForm}
                      disabled={isSubmittingForm}
                      className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 rounded-xl border transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                          : 'bg-[#0F1322] border-[#2E3C55] hover:border-[#10B981] text-white hover:text-[#10B981]'
                      }`}
                    >
                      {googleAccessToken ? (
                        <>
                          <Rocket className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Creează Formularul pe Google Drive-ul Meu 🚀</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          <span>Conectează-te cu Google pentru a crea Formularul</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SEPARATED PROFILE PICTURE MODAL SETUP PLACE */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto block pr-0">
            {/* Backdrop cover overlay */}
            <div 
              className="fixed inset-0 bg-[#050811]/90 backdrop-blur-md"
              onClick={() => setIsAvatarModalOpen(false)}
            ></div>

            {/* Modal Body container positioning */}
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ type: 'spring', damping: 26, stiffness: 360 }}
                className={`relative w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-6 ${
                  theme === 'light' 
                    ? 'bg-white border-slate-200 text-slate-800' 
                    : 'bg-[#0F1322] border-[#1F293D] text-[#F8FAFC]'
                }`}
              >
                {/* Header title */}
                <div className="flex justify-between items-center pb-2 border-b border-[#1F293D]/15">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold font-mono text-[#10B981] uppercase tracking-wider block">
                      PERSONALIZARE AVATAR
                    </span>
                    <h3 className={`font-display text-lg font-black tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      Setări Poză de Profil
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAvatarModalOpen(false)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      theme === 'light' 
                        ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-500' 
                        : 'bg-[#151D2F] hover:bg-[#1E293B] border-[#1F293D] text-slate-400'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* ZOOMABLE PREVIEW IN THE CENTER */}
                <div className="text-center space-y-4">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981] to-emerald-400 rounded-full rotate-6 opacity-20 blur-xs"></div>
                    <div className="relative shadow-lg rounded-full overflow-hidden aspect-square h-full w-full bg-[#151D2F] flex items-center justify-center border-2 border-[#10B981]">
                      {renderProfilePhoto(tempPhotoUrl, userProfile.name, "w-full h-full text-4xl", tempPhotoZoom)}
                    </div>
                  </div>
                  
                  {/* Slider controls with numeric representation */}
                  <div className="space-y-1.5 max-w-xs mx-auto">
                    <div className="flex justify-between items-center text-xs font-mono font-semibold">
                      <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Zoom Imagine</span>
                      <span className="text-[#10B981] font-bold">{tempPhotoZoom}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          const nextZoom = Math.max(100, tempPhotoZoom - 10);
                          setTempPhotoZoom(nextZoom);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer select-none border transition-colors ${
                          theme === 'light' 
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                            : 'bg-[#1E2538] hover:bg-[#2A344D] border-[#1F293D] text-white'
                        }`}
                        title="Micșorează zoom"
                      >
                        -
                      </button>
                      
                      <input 
                        type="range"
                        min="100"
                        max="250"
                        step="5"
                        value={tempPhotoZoom}
                        onChange={(e) => {
                          const value = parseInt(e.target.value, 10);
                          setTempPhotoZoom(value);
                        }}
                        className="flex-1 accent-[#10B981] h-1.5 bg-slate-200/50 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />

                      <button 
                        type="button"
                        onClick={() => {
                          const nextZoom = Math.min(250, tempPhotoZoom + 10);
                          setTempPhotoZoom(nextZoom);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm cursor-pointer select-none border transition-colors ${
                          theme === 'light' 
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' 
                            : 'bg-[#1E2538] hover:bg-[#2A344D] border-[#1F293D] text-white'
                        }`}
                        title="Mărește zoom"
                      >
                        +
                      </button>
                    </div>
                    <p className={`text-[10px] font-medium leading-normal ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                      Reglează glisorul sau folosește butoanele pentru a decupa sau apropia imaginea.
                    </p>
                  </div>
                </div>

                {/* CHOOSE PRESETS */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold font-mono text-[#64748B] uppercase tracking-wider block">
                      Alege un Avatar Predefinit
                    </label>
                    <span className="text-[9px] text-amber-500 font-bold font-mono">Presetat</span>
                  </div>
                  
                  <div className="grid grid-cols-6 gap-2">
                    {DEFAULT_AVATARS.map((av) => {
                      const isSelected = tempPhotoUrl === av.id;
                      return (
                        <button
                          key={av.id}
                          onClick={() => {
                            setTempPhotoUrl(av.id);
                            setSuccessToast(`Avatar implicit selectat: ${av.name}! 🎨`);
                          }}
                          title={av.name}
                          className={`aspect-square rounded-xl bg-[#151D2F] flex items-center justify-center text-lg transition-transform active:scale-95 hover:scale-105 relative cursor-pointer border ${
                            isSelected 
                              ? 'border-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.35)] ' + av.bg 
                              : 'border-[#1F293D] hover:border-[#64748B]/40'
                          }`}
                        >
                          {av.emoji}
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#10B981] rounded-full flex items-center justify-center text-[8px] text-black font-black shadow-sm">
                              ✓
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CUSTOM URL & FILE UPLOAD */}
                <div className="space-y-3 pt-3 border-t border-[#1F293D]/15 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold font-mono text-[#64748B] uppercase tracking-wider block">
                      Adaugă Poză Personalizată
                    </label>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id="modal-profile-photo-url-input"
                        placeholder="Inserează URL imagine (https://...)"
                        value={tempPhotoUrl.startsWith('http') ? tempPhotoUrl : ""}
                        onChange={(e) => setTempPhotoUrl(e.target.value.trim())}
                        className={`flex-1 text-[11px] px-3 py-2 border rounded-xl outline-none focus:border-[#10B981] transition-colors ${
                          theme === 'light' 
                            ? 'bg-white border-slate-200 text-slate-800' 
                            : 'bg-[#070A13] border-[#1F293D] text-white'
                        }`}
                      />
                      <button
                        onClick={() => {
                          const inputEl = document.getElementById('modal-profile-photo-url-input') as HTMLInputElement;
                          if (inputEl && inputEl.value.trim()) {
                            const inputUrl = inputEl.value.trim();
                            if (!inputUrl.startsWith('http')) {
                              setSuccessToast("Introdu un URL valid securizat începând cu http:// sau https://");
                              return;
                            }
                            setTempPhotoUrl(inputUrl);
                            setSuccessToast("Imaginea prin URL a fost selectată! 📸");
                          }
                        }}
                        className="px-3 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-black border border-[#10B981]/40 rounded-xl text-xs font-black transition-all cursor-pointer"
                      >
                        Aplică
                      </button>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <input 
                      type="file" 
                      id="modal-profile-photo-file-input"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 15 * 1024 * 1024) {
                            setSuccessToast("Imaginea depășește limita extinsă de 15 MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === 'string') {
                              // Compress this Base64 image using our high-end canvas module
                              compressAndResizeImage(reader.result as string, 256, 256, 0.75).then((compressedBase64) => {
                                setTempPhotoUrl(compressedBase64);
                                setSuccessToast("Imaginea a fost procesată și optimizată! 🎨⚡");
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        document.getElementById('modal-profile-photo-file-input')?.click();
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 border border-dashed rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                        theme === 'light' 
                          ? 'border-slate-300 hover:bg-slate-50 text-slate-650' 
                          : 'border-[#1F293D] hover:bg-[#151D2F] text-slate-400'
                      }`}
                    >
                      📁 Selectează Fișier (Până la 15 MB)
                    </button>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setUserProfile(prev => ({ 
                        ...prev, 
                        profilePhotoUrl: tempPhotoUrl, 
                        profilePhotoZoom: tempPhotoZoom 
                      }));
                      setIsAvatarModalOpen(false);
                      setSuccessToast("Avatar salvat cu succes! 🌟");
                    }}
                    className="w-full py-2.5 bg-[#10B981] hover:bg-emerald-600 text-black font-black rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Confirmă și Închide
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST ALERTS */}
      <AnimatePresence>
        {successToast !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1E2538] border border-[#10B981] p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-sm"
          >
            <div className="w-6 h-6 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center font-bold text-sm">
              ✓
            </div>
            <p className="text-xs text-white font-semibold leading-normal">
              {successToast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ERROR TOAST ALERTS */}
      <AnimatePresence>
        {errorToast !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-[#1E2538] border border-rose-500 p-4 rounded-xl shadow-xl flex items-center gap-3 max-w-sm"
          >
            <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold text-sm">
              ✕
            </div>
            <p className="text-xs text-white font-semibold leading-normal">
              {errorToast}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HIGH-FIDELITY MODULE UNLOCKED CELEBRATION MODAL */}
      <AnimatePresence>
        {showQuizCelebration && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowQuizCelebration(null);
                setActiveModalNode(null);
              }}
              className="fixed inset-0 bg-[#050811]/92 backdrop-blur-xl cursor-pointer"
            />

            {/* Ambient background decorative glow */}
            <div className="fixed w-96 h-96 bg-[#10B981]/10 rounded-full blur-[120px] pointer-events-none z-10" />

            {/* STABLE RANDOMIZED FALLING CONFETTI PARTICLES */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-[60]">
              {confettiParticles.map((p) => (
                <motion.div
                  key={p.id}
                  style={{
                    position: 'absolute',
                    left: `${p.initialX}%`,
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    borderRadius: p.isCircle ? '50%' : undefined,
                    clipPath: p.isTriangle ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                  }}
                  initial={{ y: -50, x: 0, opacity: 0, rotate: 0 }}
                  animate={{
                    y: ['0vh', '110vh'],
                    x: [0, p.xOffset],
                    opacity: [0, 1, 1, 0],
                    rotate: [0, p.rotateDirection],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: 'easeOut',
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

            {/* Modal card content container wrapper */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`relative w-full max-w-md rounded-3xl border-2 shadow-2xl p-8 text-center space-y-6 z-20 overflow-hidden ${
                theme === 'light'
                  ? 'bg-white border-[#10B981]/30 text-slate-800'
                  : 'bg-[#0F1322] border-[#10B981]/40 text-[#F8FAFC]'
              }`}
            >
              {/* Star-burst effect lines or pulsing lock decoration */}
              <div className="relative flex items-center justify-center w-24 h-24 mx-auto mb-2 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <motion.div
                  initial={{ rotate: -180, scale: 0.5 }}
                  animate={{ rotate: 0, scale: [0.5, 1.3, 1] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Unlock className="w-10 h-10 text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </motion.div>
                
                {/* Visual pulsating decorative boundaries */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], rotate: 360, opacity: [0.3, 0.05, 0.3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset--3 border border-dashed border-[#10B981]/30 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1.1, 1.6, 1.1], rotate: -360, opacity: [0.2, 0.02, 0.2] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  className="absolute inset--6 border border-dotted border-[#10B981]/15 rounded-full"
                />
              </div>

              {/* Congratulations message block */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  Capitol Completat cu Succes! 🏆
                </span>
                
                <h3 className={`font-display text-2xl font-black tracking-tight leading-snug ${
                  theme === 'light' ? 'text-slate-800' : 'text-white'
                }`}>
                  Modul de Curs Deblocat!
                </h3>
                
                <p className={`text-xs font-bold max-w-sm mx-auto ${
                  theme === 'light' ? 'text-slate-650' : 'text-emerald-400'
                }`}>
                  {showQuizCelebration.nodeTitle}
                </p>
              </div>

              {/* Custom XP score showcase cards */}
              <div className={`p-4 rounded-2xl flex items-center justify-between border text-left gap-4 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#151D2F] border-[#1F293D]/70'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#10B981]" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold font-mono text-[#64748B] uppercase tracking-wider">RECOMPENSĂ XP</div>
                    <div className="text-base font-bold flex items-center gap-1.5 font-mono leading-none">
                      <span className="text-[#10B981] font-black">+{showQuizCelebration.xpEarned || activeModalNode?.xp || 25} XP</span>
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[10px] font-mono font-bold text-[#10B981]">
                  SECȚIUNE VALIDĂ
                </div>
              </div>

              {/* Informative description encouraging teen success stories */}
              <p className={`text-xs leading-relaxed max-w-sm mx-auto ${
                theme === 'light' ? 'text-slate-500' : 'text-[#64748B]'
              }`}>
                Felicitări! Ai înțeles perfect conceptele și ai răspuns corect la toate întrebările din grila de testare. Continuă să explorezi harta pentru a-ți dezvolta abilitățile din StartUp Finance! 🚀
              </p>

              {/* Close and return button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowQuizCelebration(null);
                    setActiveModalNode(null);
                  }}
                  className="w-full py-3 bg-[#10B981] hover:bg-emerald-600 hover:shadow-[0_4px_18px_rgba(16,185,129,0.45)] text-slate-900 border-none font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-95 cursor-pointer text-center block shadow-[0_4px_12px_rgba(16,185,129,0.25)] select-none"
                >
                  Spre Următorul Capitol 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIMULATED GOOGLE AUTH SELECTOR POPUP */}
      <AnimatePresence>
        {showGoogleAuthSim && (
          <div className="fixed inset-0 z-50 overflow-y-auto block">
            {/* Backdrop glass screen */}
            <div 
              className="fixed inset-0 bg-[#050811]/95 backdrop-blur-md"
              onClick={() => setShowGoogleAuthSim(false)}
            ></div>

            {/* Simulated OAuth popup dialogue */}
            <div className="flex min-h-full items-center justify-center p-4 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.98 }}
                className="relative bg-white border border-[#E2E8F0] w-full max-w-sm rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 text-[#1A202C]"
              >
                {/* Google logo design layout */}
                <div className="text-center space-y-2">
                  <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.67 0 3.19.58 4.38 1.69l3.27-3.27C17.67 1.54 14.99 1 12 1 7.35 1 3.32 3.68 1.48 7.57l3.76 2.92c.9-2.7 3.41-4.45 6.76-4.45z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.46h6.44c-.28 1.47-1.11 2.71-2.36 3.56v2.95h3.81c2.23-2.05 3.6-5.07 3.6-8.61z"/>
                    <path fill="#FBBC05" d="M5.24 10.49c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.48 3.01C.54 4.88 0 6.98 0 9.2s.54 4.32 1.48 6.19l3.76-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.9l-3.81-2.95c-1.06.71-2.42 1.13-4.15 1.13-3.35 0-5.86-1.75-6.76-4.45L1.48 16.7C3.32 20.32 7.35 23 12 23z"/>
                  </svg>
                  <h3 className="font-sans text-lg font-bold text-gray-900">Alege un cont</h3>
                  <p className="text-xs text-gray-500 font-medium">
                    pentru a continua spre <span className="font-semibold text-gray-800">StartUp Finance România</span>
                  </p>
                </div>

                {/* Predefined suggestion accounts */}
                <div className="space-y-2.5">
                  <div 
                    onClick={() => handleGoogleSimLogin("Sebastian Dan", "sebid418@gmail.com")}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold font-sans text-sm">
                      S
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-850">Sebastian Dan</div>
                      <div className="text-[10px] text-gray-500 font-mono">sebid418@gmail.com</div>
                    </div>
                  </div>

                  <div 
                    onClick={() => handleGoogleSimLogin("Andreea Ionescu", "andreea.ionescu@gmail.com")}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold font-sans text-sm">
                      A
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-850">Andreea Ionescu</div>
                      <div className="text-[10px] text-gray-500 font-mono">andreea.ionescu@gmail.com</div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">sau conectează-te cu un alt cont</span>
                </div>

                {/* Custom input fields */}
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Nume complet cont Google nou</label>
                    <input 
                      type="text"
                      placeholder="Ex: Popescu Ionuț"
                      value={googleCustomName}
                      onChange={(e) => setGoogleCustomName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 placeholder-gray-400 text-xs py-2 px-3 rounded-lg outline-none text-gray-800 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Adresă email Google (@gmail.com)</label>
                    <input 
                      type="email"
                      placeholder="Ex: ionut.popescu@gmail.com"
                      value={googleCustomEmail}
                      onChange={(e) => setGoogleCustomEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 focus:border-blue-500 placeholder-gray-400 text-xs py-2 px-3 rounded-lg outline-none text-gray-800 font-semibold"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      if (!googleCustomName.trim() || !googleCustomEmail.trim() || !googleCustomEmail.includes("@")) {
                        setSuccessToast("Numele sau email-ul introdus este invalid.");
                        return;
                      }
                      handleGoogleSimLogin(googleCustomName.trim(), googleCustomEmail.trim());
                    }}
                    className="w-full bg-[#1A73E8] hover:bg-[#1557B0] text-white font-sans font-bold text-xs py-2.5 rounded-lg transition-colors"
                  >
                    Înregistrare rapidă cu Google
                  </button>
                </div>

                {/* Close/Cancel row */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[11px] font-semibold text-gray-500">
                  <span>Securitizat de Google Identity</span>
                  <button 
                    onClick={() => setShowGoogleAuthSim(false)}
                    className="text-gray-700 hover:text-red-500 transition-colors uppercase font-bold"
                  >
                    Anulează
                  </button>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>



      {/* COOKIE CONSENT BANNER */}
      <AnimatePresence>
        {showCookieBanner && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 260 }}
            className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 p-5 rounded-2xl border shadow-2xl space-y-4 backdrop-blur-md ${
              theme === 'light'
                ? 'bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50'
                : 'bg-[#0F1322]/95 border-[#1F293D] text-[#F8FAFC] shadow-[#000000]/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 border border-[#10B981]/20">
                <Cookie className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold tracking-wider uppercase text-[#10B981] font-mono">
                  Politică de Cookie-uri
                </h4>
                <p className={`text-[11px] leading-relaxed font-semibold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Folosim cookie-uri tehnice esențiale pentru a-ți securiza contul (autentificare Firebase), a memora în siguranță setările de temă alese și a-ți stoca punctele de XP și calea parcursă pe hartă.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('cookies-consent', 'declined');
                  setShowCookieBanner(false);
                }}
                className={`text-[10px] font-extrabold px-3 py-2 rounded-lg transition-all active:scale-[0.97] cursor-pointer ${
                  theme === 'light'
                    ? 'hover:bg-slate-100 text-slate-500 bg-transparent'
                    : 'hover:bg-white/5 text-slate-400 bg-transparent'
                }`}
              >
                Refuză opționalele
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('cookies-consent', 'accepted');
                  setShowCookieBanner(false);
                  setSuccessToast("Preferințele tale de confidențialitate au fost înregistrate cu succes! 🍪");
                  setTimeout(() => setSuccessToast(null), 3000);
                }}
                className={`text-[10px] font-extrabold px-4.5 py-2.5 rounded-lg active:scale-[0.97] transition-all cursor-pointer shadow-md ${
                  theme === 'light'
                    ? 'bg-[#10B981] hover:bg-[#10B981]/90 text-white shadow-[#10B981]/20'
                    : 'bg-[#10B981] hover:bg-[#10B981]/90 text-black shadow-[#10B981]/15'
                }`}
              >
                Acceptă tot
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Simple icons placeholders inside layout for fast flawless packaging if missing in lucide
function ArrowForwardIcon() {
  return (
    <svg 
      className="w-4 h-4 text-inherit group-hover:translate-x-1 transition-transform" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

