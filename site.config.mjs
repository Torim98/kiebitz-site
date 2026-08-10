export const site = {
  // Change only this value after the custom domain is connected.
  origin: "https://torim98.github.io/kiebitz-site",
  name: "Kiebitz",
  version: "0.8.0",
  repository: "https://github.com/Torim98/Kiebitz",
  downloadUrl: "https://github.com/Torim98/Kiebitz/releases/latest",
  playStoreUrl: "https://play.google.com/store/apps/details?id=de.torim.kiebitz",
  socialImage: "assets/og-kiebitz.png"
};

export const languages = {
  de: {
    tag: "de",
    dir: "ltr",
    ogLocale: "de_DE",
    path: "de/",
    languageLabel: "Sprache",
    contentsLabel: "Inhalt",
    notesLabel: "Hinweise"
  },
  en: {
    tag: "en",
    dir: "ltr",
    ogLocale: "en_US",
    path: "",
    languageLabel: "Language",
    contentsLabel: "Contents",
    notesLabel: "Notes"
  },
  fr: {
    tag: "fr",
    dir: "ltr",
    ogLocale: "fr_FR",
    path: "fr/",
    languageLabel: "Langue",
    contentsLabel: "Sommaire",
    notesLabel: "Notes"
  },
  es: {
    tag: "es",
    dir: "ltr",
    ogLocale: "es_ES",
    path: "es/",
    languageLabel: "Idioma",
    contentsLabel: "Contenido",
    notesLabel: "Notas"
  },
  zh: {
    tag: "zh-Hans",
    dir: "ltr",
    ogLocale: "zh_CN",
    path: "zh/",
    languageLabel: "语言",
    contentsLabel: "目录",
    notesLabel: "说明"
  },
  hi: {
    tag: "hi",
    dir: "ltr",
    ogLocale: "hi_IN",
    path: "hi/",
    languageLabel: "भाषा",
    contentsLabel: "विषय-सूची",
    notesLabel: "टिप्पणियाँ"
  },
  ar: {
    tag: "ar",
    dir: "rtl",
    ogLocale: "ar",
    path: "ar/",
    languageLabel: "اللغة",
    contentsLabel: "المحتويات",
    notesLabel: "ملاحظات"
  }
};

export const pages = {
  home: {
    source: "src/pages/index.html.template",
    route: "",
    titles: {
      de: "Kiebitz · Local-first Schachanalyse für Windows und Android",
      en: "Kiebitz · Local-first chess analysis for Windows and Android",
      fr: "Kiebitz · Analyse d’échecs local-first pour Windows et Android",
      es: "Kiebitz · Análisis de ajedrez local-first para Windows y Android",
      zh: "Kiebitz · 面向 Windows 与 Android 的本地优先国际象棋分析",
      hi: "Kiebitz · Windows और Android के लिए लोकल-फ़र्स्ट शतरंज विश्लेषण",
      ar: "Kiebitz · تحليل شطرنج محلي أولًا لنظامي Windows وAndroid"
    },
    descriptions: {
      de: "Kiebitz importiert deine chess.com- und Lichess-Partien, analysiert sie lokal mit Stockfish und zeigt dir deine echten Stärken und Schwächen – ohne Konto, Cloud oder Telemetrie.",
      en: "Kiebitz imports your chess.com and Lichess games, analyzes them locally with Stockfish, and reveals your real strengths and weaknesses—without an account, cloud, or telemetry.",
      fr: "Kiebitz importe vos parties chess.com et Lichess, les analyse localement avec Stockfish et révèle vos vrais points forts et faibles, sans compte, cloud ni télémétrie.",
      es: "Kiebitz importa tus partidas de chess.com y Lichess, las analiza localmente con Stockfish y revela tus puntos fuertes y débiles, sin cuenta, nube ni telemetría.",
      zh: "Kiebitz 导入你在 chess.com 和 Lichess 上的对局，使用 Stockfish 在本地分析并找出真正的强项与弱点；无需账号、云端或遥测。",
      hi: "Kiebitz आपकी chess.com और Lichess बाज़ियाँ आयात करता है, Stockfish से स्थानीय रूप से विश्लेषण करता है और बिना खाते, क्लाउड या टेलीमेट्री के आपकी असली खूबियाँ व कमज़ोरियाँ दिखाता है।",
      ar: "يستورد Kiebitz مبارياتك من chess.com وLichess ويحللها محليًا باستخدام Stockfish ليكشف نقاط قوتك وضعفك الحقيقية، بلا حساب أو سحابة أو قياس عن بُعد."
    }
  },
  privacy: {
    source: "src/pages/privacy/index.html.template",
    route: "privacy/",
    titles: {
      de: "Datenschutzerklärung · Kiebitz",
      en: "Privacy Policy · Kiebitz",
      fr: "Politique de confidentialité · Kiebitz",
      es: "Política de privacidad · Kiebitz",
      zh: "隐私政策 · Kiebitz",
      hi: "गोपनीयता नीति · Kiebitz",
      ar: "سياسة الخصوصية · Kiebitz"
    },
    descriptions: {
      de: "Datenschutzerklärung für Kiebitz: lokale Speicherung, Netzzugriffe, Berechtigungen, LAN-Sync und kein Tracking.",
      en: "Kiebitz privacy policy: local storage, network access, permissions, LAN sync, and no tracking.",
      fr: "Politique de confidentialité de Kiebitz : stockage local, accès réseau, autorisations, synchronisation LAN et aucun suivi.",
      es: "Política de privacidad de Kiebitz: almacenamiento local, acceso a la red, permisos, sincronización LAN y ningún seguimiento.",
      zh: "Kiebitz 隐私政策：本地存储、网络访问、权限、局域网同步以及不进行跟踪。",
      hi: "Kiebitz गोपनीयता नीति: स्थानीय संग्रहण, नेटवर्क पहुँच, अनुमतियाँ, LAN सिंक और कोई ट्रैकिंग नहीं।",
      ar: "سياسة خصوصية Kiebitz: التخزين المحلي والوصول إلى الشبكة والأذونات والمزامنة عبر الشبكة المحلية وعدم التتبع."
    }
  },
  impressum: {
    source: "src/pages/impressum/index.html.template",
    route: "impressum/",
    titles: {
      de: "Impressum · Kiebitz",
      en: "Legal Notice · Kiebitz",
      fr: "Mentions légales · Kiebitz",
      es: "Aviso legal · Kiebitz",
      zh: "法律声明 · Kiebitz",
      hi: "क़ानूनी सूचना · Kiebitz",
      ar: "بيان قانوني · Kiebitz"
    },
    descriptions: {
      de: "Impressum nach § 5 DDG für die App Kiebitz und diese Website.",
      en: "Legal notice under § 5 DDG for the Kiebitz app and this website.",
      fr: "Mentions légales selon le § 5 DDG pour l’application Kiebitz et ce site.",
      es: "Aviso legal conforme al § 5 DDG para la aplicación Kiebitz y este sitio web.",
      zh: "Kiebitz 应用及本网站依据德国《数字服务法》第 5 条提供的法律声明。",
      hi: "Kiebitz ऐप और इस वेबसाइट के लिए § 5 DDG के अनुसार क़ानूनी सूचना।",
      ar: "البيان القانوني وفق § 5 DDG لتطبيق Kiebitz وهذا الموقع."
    }
  }
};
