// ============================================================
// FIGO — i18n Translations
// ============================================================

export type TranslationKey =
  | 'nav.home' | 'nav.safety' | 'nav.wishlist' | 'nav.settings' | 'nav.profile'
  | 'auth.login' | 'auth.signup' | 'auth.logout' | 'auth.forgotPassword'
  | 'auth.rememberMe' | 'auth.continueWithGoogle' | 'auth.continueWithEmail'
  | 'auth.email' | 'auth.password' | 'auth.name' | 'auth.confirmPassword'
  | 'auth.noAccount' | 'auth.hasAccount'
  | 'home.hero' | 'home.subtitle' | 'home.destination' | 'home.budget'
  | 'home.travellers' | 'home.days' | 'home.travelStyle' | 'home.interests'
  | 'home.transportation' | 'home.currency' | 'home.language' | 'home.startTime'
  | 'home.generateTrip' | 'home.searchPlaceholder'
  | 'loading.findingGems' | 'loading.planningDay' | 'loading.checkingWeather'
  | 'loading.optimizingBudget' | 'loading.findingExperiences' | 'loading.almostThere'
  | 'result.summary' | 'result.timeline' | 'result.budget' | 'result.weather'
  | 'result.morning' | 'result.afternoon' | 'result.evening' | 'result.night'
  | 'result.save' | 'result.share' | 'result.regenerate' | 'result.export'
  | 'result.packingTips' | 'result.safetyTips' | 'result.etiquette'
  | 'safety.title' | 'safety.emergency' | 'safety.police' | 'safety.ambulance'
  | 'safety.fire' | 'safety.weather' | 'safety.location'
  | 'wishlist.title' | 'wishlist.empty' | 'wishlist.save' | 'wishlist.remove'
  | 'settings.title' | 'settings.darkMode' | 'settings.notifications'
  | 'settings.currency' | 'settings.language' | 'settings.privacy'
  | 'common.loading' | 'common.error' | 'common.retry' | 'common.close' | 'common.save'

type Translations = Record<TranslationKey, string>

const en: Translations = {
  'nav.home': 'Home', 'nav.safety': 'Safety', 'nav.wishlist': 'Wishlist',
  'nav.settings': 'Settings', 'nav.profile': 'Profile',
  'auth.login': 'Sign In', 'auth.signup': 'Create Account', 'auth.logout': 'Sign Out',
  'auth.forgotPassword': 'Forgot Password?', 'auth.rememberMe': 'Remember me',
  'auth.continueWithGoogle': 'Continue with Google', 'auth.continueWithEmail': 'Continue with Email',
  'auth.email': 'Email address', 'auth.password': 'Password', 'auth.name': 'Full name',
  'auth.confirmPassword': 'Confirm password', 'auth.noAccount': "Don't have an account?",
  'auth.hasAccount': 'Already have an account?',
  'home.hero': 'Every Journey Starts Here',
  'home.subtitle': 'Let AI craft the perfect itinerary based on your travel style, budget and preferences.',
  'home.destination': 'Where to?', 'home.budget': 'Budget Range', 'home.travellers': 'Travellers',
  'home.days': 'Days', 'home.travelStyle': 'Travel Style', 'home.interests': 'Interests',
  'home.transportation': 'Transportation', 'home.currency': 'Currency', 'home.language': 'Language',
  'home.startTime': 'Start Time', 'home.generateTrip': 'Generate My Trip ✨',
  'home.searchPlaceholder': 'Paris, Tokyo, Dubai...',
  'loading.findingGems': 'Finding hidden gems...', 'loading.planningDay': 'Planning your perfect day...',
  'loading.checkingWeather': 'Checking weather conditions...', 'loading.optimizingBudget': 'Optimizing your budget...',
  'loading.findingExperiences': 'Finding local experiences...', 'loading.almostThere': 'Almost there...',
  'result.summary': 'Trip Summary', 'result.timeline': 'Your Itinerary', 'result.budget': 'Budget Breakdown',
  'result.weather': 'Weather', 'result.morning': 'Morning', 'result.afternoon': 'Afternoon',
  'result.evening': 'Evening', 'result.night': 'Night', 'result.save': 'Save Trip',
  'result.share': 'Share', 'result.regenerate': 'Regenerate Day', 'result.export': 'Export PDF',
  'result.packingTips': 'Packing Tips', 'result.safetyTips': 'Safety Tips', 'result.etiquette': 'Local Etiquette',
  'safety.title': 'Travel Safety', 'safety.emergency': 'Emergency Contacts', 'safety.police': 'Police',
  'safety.ambulance': 'Ambulance', 'safety.fire': 'Fire Department', 'safety.weather': 'Live Weather',
  'safety.location': 'Your Location',
  'wishlist.title': 'My Wishlist', 'wishlist.empty': 'No saved items yet', 'wishlist.save': 'Save',
  'wishlist.remove': 'Remove',
  'settings.title': 'Settings', 'settings.darkMode': 'Dark Mode', 'settings.notifications': 'Notifications',
  'settings.currency': 'Currency', 'settings.language': 'Language', 'settings.privacy': 'Privacy & Security',
  'common.loading': 'Loading...', 'common.error': 'Something went wrong', 'common.retry': 'Try Again',
  'common.close': 'Close', 'common.save': 'Save',
}

const fr: Translations = {
  ...en,
  'nav.home': 'Accueil', 'nav.safety': 'Sécurité', 'nav.wishlist': 'Favoris', 'nav.settings': 'Paramètres',
  'auth.login': 'Se connecter', 'auth.signup': 'Créer un compte', 'auth.logout': 'Déconnexion',
  'auth.forgotPassword': 'Mot de passe oublié?', 'auth.rememberMe': 'Se souvenir de moi',
  'auth.continueWithGoogle': 'Continuer avec Google',
  'home.hero': 'Chaque voyage commence ici',
  'home.subtitle': 'Laissez l\'IA créer l\'itinéraire parfait selon votre style de voyage.',
  'home.destination': 'Où aller?', 'home.generateTrip': 'Générer mon voyage ✨',
  'home.searchPlaceholder': 'Paris, Tokyo, Dubaï...',
}

const de: Translations = {
  ...en,
  'nav.home': 'Startseite', 'nav.safety': 'Sicherheit', 'nav.wishlist': 'Wunschliste',
  'auth.login': 'Anmelden', 'auth.signup': 'Konto erstellen', 'auth.logout': 'Abmelden',
  'home.hero': 'Jede Reise beginnt hier',
  'home.subtitle': 'Lassen Sie KI das perfekte Reiseprogramm erstellen.',
  'home.destination': 'Wohin?', 'home.generateTrip': 'Meine Reise planen ✨',
  'home.searchPlaceholder': 'Paris, Tokio, Dubai...',
}

const es: Translations = {
  ...en,
  'nav.home': 'Inicio', 'nav.safety': 'Seguridad', 'nav.wishlist': 'Lista de deseos',
  'auth.login': 'Iniciar sesión', 'auth.signup': 'Crear cuenta', 'auth.logout': 'Cerrar sesión',
  'home.hero': 'Cada viaje comienza aquí',
  'home.subtitle': 'Deja que la IA cree el itinerario perfecto para ti.',
  'home.destination': '¿A dónde?', 'home.generateTrip': 'Generar mi viaje ✨',
  'home.searchPlaceholder': 'París, Tokio, Dubái...',
}

const it: Translations = {
  ...en,
  'nav.home': 'Home', 'nav.safety': 'Sicurezza', 'nav.wishlist': 'Lista desideri',
  'auth.login': 'Accedi', 'auth.signup': 'Crea account', 'auth.logout': 'Esci',
  'home.hero': 'Ogni viaggio inizia qui',
  'home.subtitle': 'Lascia che l\'IA crei l\'itinerario perfetto per te.',
  'home.destination': 'Dove vuoi andare?', 'home.generateTrip': 'Genera il mio viaggio ✨',
}

const ja: Translations = {
  ...en,
  'nav.home': 'ホーム', 'nav.safety': '安全', 'nav.wishlist': 'ウィッシュリスト',
  'auth.login': 'ログイン', 'auth.signup': 'アカウント作成', 'auth.logout': 'ログアウト',
  'home.hero': 'すべての旅はここから始まる',
  'home.subtitle': 'AIがあなたの旅のスタイルに合わせた完璧なルートを作成します。',
  'home.destination': 'どこへ?', 'home.generateTrip': '旅程を生成 ✨',
  'home.searchPlaceholder': 'パリ、東京、ドバイ...',
}

const zh: Translations = {
  ...en,
  'nav.home': '首页', 'nav.safety': '安全', 'nav.wishlist': '愿望清单',
  'auth.login': '登录', 'auth.signup': '注册', 'auth.logout': '退出',
  'home.hero': '每段旅程从这里开始',
  'home.subtitle': '让AI根据您的旅行风格和预算制定完美行程。',
  'home.destination': '去哪里?', 'home.generateTrip': '生成我的行程 ✨',
  'home.searchPlaceholder': '巴黎、东京、迪拜...',
}

const hi: Translations = {
  ...en,
  'nav.home': 'होम', 'nav.safety': 'सुरक्षा', 'nav.wishlist': 'विशलिस्ट',
  'auth.login': 'लॉग इन', 'auth.signup': 'अकाउंट बनाएं', 'auth.logout': 'लॉग आउट',
  'home.hero': 'हर यात्रा यहाँ से शुरू होती है',
  'home.subtitle': 'AI को अपनी यात्रा शैली और बजट के अनुसार परफेक्ट यात्रा कार्यक्रम बनाने दें।',
  'home.destination': 'कहाँ जाना है?', 'home.generateTrip': 'मेरी यात्रा बनाएं ✨',
  'home.searchPlaceholder': 'पेरिस, टोक्यो, दुबई...',
}

const ar: Translations = {
  ...en,
  'nav.home': 'الرئيسية', 'nav.safety': 'الأمان', 'nav.wishlist': 'قائمة الأمنيات',
  'auth.login': 'تسجيل الدخول', 'auth.signup': 'إنشاء حساب', 'auth.logout': 'تسجيل الخروج',
  'home.hero': 'كل رحلة تبدأ هنا',
  'home.subtitle': 'دع الذكاء الاصطناعي يصنع لك رحلة مثالية.',
  'home.destination': 'إلى أين؟', 'home.generateTrip': 'أنشئ رحلتي ✨',
  'home.searchPlaceholder': 'باريس، طوكيو، دبي...',
}

const ml: Translations = {
  ...en,
  'nav.home': 'ഹോം', 'nav.safety': 'സുരക്ഷ', 'nav.wishlist': 'ആഗ്രഹ പട്ടിക',
  'auth.login': 'സൈൻ ഇൻ', 'auth.signup': 'അക്കൗണ്ട് ഉണ്ടാക്കുക', 'auth.logout': 'സൈൻ ഔട്ട്',
  'home.hero': 'ഓരോ യാത്രയും ഇവിടെ നിന്ന് ആരംഭിക്കുന്നു',
  'home.subtitle': 'AI നിങ്ങളുടെ യാത്രാ ശൈലിക്കും ബജറ്റിനും അനുസരിച്ച് മികച്ച itinerary തയ്യാറാക്കട്ടെ.',
  'home.destination': 'എവിടേക്ക്?', 'home.generateTrip': 'എൻ്റെ യാത്ര ഉണ്ടാക്കൂ ✨',
  'home.searchPlaceholder': 'പാരീസ്, ടോക്കിയോ, ദുബൈ...',
}

export const translations: Record<string, Translations> = { en, fr, de, es, it, ja, zh, hi, ar, ml }

export function t(key: TranslationKey, lang: string = 'en'): string {
  return translations[lang]?.[key] ?? translations['en'][key] ?? key
}
