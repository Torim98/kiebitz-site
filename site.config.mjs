export const site = {
  // Change only this value after the custom domain is connected.
  origin: "https://kiebitz.dev",
  name: "Kiebitz",
  repository: "https://github.com/Torim98/Kiebitz",
  downloadUrl: "https://github.com/Torim98/Kiebitz/releases",
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
      de: "Kiebitz · Local-first Schachanalyse für Desktop und Android",
      en: "Kiebitz · Local-first chess analysis for desktop and Android",
      fr: "Kiebitz · Analyse d’échecs local-first pour ordinateur et Android",
      es: "Kiebitz · Análisis de ajedrez local-first para escritorio y Android",
      zh: "Kiebitz · 面向桌面端与 Android 的本地优先国际象棋分析",
      hi: "Kiebitz · डेस्कटॉप और Android के लिए लोकल-फ़र्स्ट शतरंज विश्लेषण",
      ar: "Kiebitz · تحليل شطرنج محلي أولًا لسطح المكتب وAndroid"
    },
    descriptions: {
      de: "Kiebitz importiert deine chess.com- und Lichess-Partien, analysiert sie lokal mit Stockfish und zeigt deine echten Stärken und Schwächen. Deine Schachdaten und Analysen bleiben auf deinen Geräten.",
      en: "Kiebitz imports your chess.com and Lichess games, analyzes them locally with Stockfish, and reveals your real strengths and weaknesses. Your chess data and analyses stay on your devices.",
      fr: "Kiebitz importe vos parties chess.com et Lichess, les analyse localement avec Stockfish et révèle vos vrais points forts et faibles. Vos données d’échecs et analyses restent sur vos appareils.",
      es: "Kiebitz importa tus partidas de chess.com y Lichess, las analiza localmente con Stockfish y revela tus puntos fuertes y débiles. Tus datos de ajedrez y análisis permanecen en tus dispositivos.",
      zh: "Kiebitz 导入你在 chess.com 和 Lichess 上的对局，使用 Stockfish 在本地分析并找出真正的强项与弱点。棋局数据和分析保留在你的设备上。",
      hi: "Kiebitz आपकी chess.com और Lichess बाज़ियाँ आयात करता है, Stockfish से स्थानीय रूप से विश्लेषण करता है और आपकी असली खूबियाँ व कमज़ोरियाँ दिखाता है। शतरंज डेटा और विश्लेषण आपके उपकरणों पर रहते हैं।",
      ar: "يستورد Kiebitz مبارياتك من chess.com وLichess ويحللها محليًا باستخدام Stockfish ليكشف نقاط قوتك وضعفك الحقيقية. تبقى بيانات الشطرنج والتحليلات على أجهزتك."
    }
  },
  plus: {
    source: "src/pages/plus/index.html.template",
    route: "plus/",
    titles: {
      de: "Kiebitz Plus · Anmelden und freischalten",
      en: "Kiebitz Plus · Sign in and unlock",
      fr: "Kiebitz Plus · Se connecter et débloquer",
      es: "Kiebitz Plus · Iniciar sesión y desbloquear",
      zh: "Kiebitz Plus · 登录并解锁",
      hi: "Kiebitz Plus · साइन इन और अनलॉक",
      ar: "Kiebitz Plus · تسجيل الدخول والتفعيل"
    },
    descriptions: {
      de: "Kiebitz Plus: 7 Tage kostenlos testen, danach 1,99 € pro Monat, jederzeit kündbar. Anmeldung ohne Passwort, Freischaltung für Desktop und Android.",
      en: "Kiebitz Plus: try free for 7 days, then €1.99 per month, cancel any time. Passwordless sign-in, unlocked on desktop and Android.",
      fr: "Kiebitz Plus : 7 jours gratuits, puis 1,99 € par mois, résiliable à tout moment. Connexion sans mot de passe, débloqué sur ordinateur et Android.",
      es: "Kiebitz Plus: 7 días gratis, después 1,99 € al mes, cancelable en cualquier momento. Acceso sin contraseña, desbloqueado en escritorio y Android.",
      zh: "Kiebitz Plus：免费试用 7 天，之后每月 1,99 €，随时可取消。无需密码登录，桌面端与 Android 一并解锁。",
      hi: "Kiebitz Plus: 7 दिन मुफ़्त, उसके बाद 1,99 € प्रति माह, कभी भी रद्द करें। बिना पासवर्ड साइन-इन, डेस्कटॉप और Android दोनों पर।",
      ar: "‏Kiebitz Plus: سبعة أيام مجانًا ثم 1,99 € شهريًا مع إمكانية الإلغاء في أي وقت. تسجيل دخول بلا كلمة مرور، وتفعيل على سطح المكتب وAndroid."
    }
  },
  plusAccount: {
    noindex: true,
    source: "src/pages/plus/account/index.html.template",
    route: "plus/account/",
    titles: {
      de: "Konto · Kiebitz Plus",
      en: "Account · Kiebitz Plus",
      fr: "Compte · Kiebitz Plus",
      es: "Cuenta · Kiebitz Plus",
      zh: "账号 · Kiebitz Plus",
      hi: "खाता · Kiebitz Plus",
      ar: "الحساب · Kiebitz Plus"
    },
    descriptions: {
      de: "Kiebitz-Konto: Status ansehen, Kiebitz Plus buchen, Abonnement verwalten, abmelden und Konto löschen.",
      en: "Kiebitz account: check your status, subscribe to Kiebitz Plus, manage billing, sign out and delete the account.",
      fr: "Compte Kiebitz : consulter le statut, souscrire à Kiebitz Plus, gérer l’abonnement, se déconnecter et supprimer le compte.",
      es: "Cuenta de Kiebitz: consultar el estado, contratar Kiebitz Plus, gestionar la suscripción, cerrar sesión y borrar la cuenta.",
      zh: "Kiebitz 账号：查看状态、订阅 Kiebitz Plus、管理订阅、退出登录以及删除账号。",
      hi: "Kiebitz खाता: स्थिति देखें, Kiebitz Plus लें, सदस्यता प्रबंधित करें, साइन आउट करें और खाता मिटाएँ।",
      ar: "حساب Kiebitz: عرض الحالة والاشتراك في Kiebitz Plus وإدارة الاشتراك وتسجيل الخروج وحذف الحساب."
    }
  },
  plusSuccess: {
    noindex: true,
    source: "src/pages/plus/success/index.html.template",
    route: "plus/success/",
    titles: {
      de: "Kauf bestätigt · Kiebitz Plus",
      en: "Purchase confirmed · Kiebitz Plus",
      fr: "Achat confirmé · Kiebitz Plus",
      es: "Compra confirmada · Kiebitz Plus",
      zh: "购买已确认 · Kiebitz Plus",
      hi: "ख़रीद की पुष्टि · Kiebitz Plus",
      ar: "تأكيد الشراء · Kiebitz Plus"
    },
    descriptions: {
      de: "Rückkehr aus dem Stripe-Checkout: Kiebitz Plus wird bestätigt und in der App freigeschaltet.",
      en: "Returning from Stripe checkout: Kiebitz Plus is confirmed and unlocked in the app.",
      fr: "Retour du paiement Stripe : Kiebitz Plus est confirmé et débloqué dans l’application.",
      es: "Vuelta desde el pago en Stripe: Kiebitz Plus queda confirmado y desbloqueado en la app.",
      zh: "从 Stripe 结账返回：Kiebitz Plus 已确认并在应用中解锁。",
      hi: "Stripe चेकआउट से वापसी: Kiebitz Plus की पुष्टि होकर ऐप में अनलॉक हो जाता है।",
      ar: "العودة من الدفع عبر Stripe: يتأكّد Kiebitz Plus ويُفعَّل في التطبيق."
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
      de: "Datenschutzerklärung für Kiebitz: lokale Schachdaten, Netzzugriffe, Berechtigungen, LAN-Sync und Drittanbieter.",
      en: "Kiebitz privacy policy: local chess data, network access, permissions, LAN sync, and third-party services.",
      fr: "Politique de confidentialité de Kiebitz : données d’échecs locales, accès réseau, autorisations, synchronisation LAN et services tiers.",
      es: "Política de privacidad de Kiebitz: datos de ajedrez locales, acceso a la red, permisos, sincronización LAN y servicios de terceros.",
      zh: "Kiebitz 隐私政策：本地棋局数据、网络访问、权限、局域网同步及第三方服务。",
      hi: "Kiebitz गोपनीयता नीति: स्थानीय शतरंज डेटा, नेटवर्क पहुँच, अनुमतियाँ, LAN सिंक और तृतीय-पक्ष सेवाएँ।",
      ar: "سياسة خصوصية Kiebitz: بيانات الشطرنج المحلية والوصول إلى الشبكة والأذونات والمزامنة عبر الشبكة المحلية وخدمات الأطراف الثالثة."
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
