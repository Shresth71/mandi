export type Language = 'en' | 'hi' | 'garhwali';

export type CompanionGender = 'male' | 'female';

export interface UserPreferences {
  language: Language;
  companionGender: CompanionGender;
  onboardingComplete: boolean;
  farmerName: string;
  location: string;
}

export interface CropDiagnosis {
  id: string;
  diseaseName: string;
  confidence: number;
  treatment: string[];
  imageUrl: string;
  timestamp: Date;
}

export interface MandiPrice {
  commodity: string;
  market: string;
  price: number;
  priceChange: number;
  unit: string;
  prediction: 'SELL' | 'HOLD' | 'BUY';
  history: { date: string; price: number }[];
}

export interface InsuranceClaim {
  id: string;
  type: 'weather' | 'satellite' | 'manual';
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  amount: number;
  date: Date;
  description: string;
  timeline: { date: Date; status: string; description: string }[];
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  rainfall: number;
  windSpeed: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy';
  alerts: { type: string; message: string; severity: 'low' | 'medium' | 'high' }[];
  forecast: { date: string; temp: number; condition: string }[];
  farmingInsights: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type Screen = 'splash' | 'login' | 'onboarding' | 'home' | 'cropdoctor' | 'khetsense' | 'fairmandi' | 'autoclaim' | 'weather' | 'profile' | 'marketplace';

export interface AuthState {
  isAuthenticated: boolean;
  phoneNumber: string;
  isVerified: boolean;
}

export const translations = {
  en: {
    appName: 'Kisaan Kavach',
    tagline: 'Your Farming Companion',
    welcomeBack: 'Welcome back',
    home: 'Home',
    cropDoctor: 'Crop Doctor',
    khetSense: 'KhetSense',
    fairMandi: 'FairMandi',
    autoClaim: 'AutoClaim',
    weather: 'Weather',
    profile: 'Profile',
    scanCrop: 'Scan Your Crop',
    viewPrices: 'View Prices',
    checkWeather: 'Check Weather',
    claimInsurance: 'Claim Insurance',
    selectLanguage: 'Select Language',
    selectCompanion: 'Choose Your Companion',
    continue: 'Continue',
    getStarted: 'Get Started',
    english: 'English',
    hindi: 'Hindi',
    garhwali: 'Garhwali',
    male: 'Male',
    female: 'Female',
    todaysTip: "Today's Tip",
    quickActions: 'Quick Actions',
    recentActivity: 'Recent Activity',
sell: 'SELL',
    hold: 'HOLD',
    buy: 'BUY',
    marketplace: 'Marketplace',
    listProduct: 'List Product',
    voiceAssistant: 'Voice Assistant',
    whatsappAlerts: 'WhatsApp Alerts',
    login: 'Login',
    enterPhone: 'Enter your phone number',
    sendOTP: 'Send OTP',
    verifyOTP: 'Verify OTP',
    resendOTP: 'Resend OTP',
    welcomeLogin: 'Welcome to Kisaan Kavach',
    loginSubtitle: 'Your trusted farming companion',
    phoneLabel: 'Phone Number',
    otpSent: 'OTP sent to your phone',
    invalidOTP: 'Invalid OTP, please try again',
  },
  hi: {
    appName: 'किसान कवच',
    tagline: 'आपका खेती साथी',
    welcomeBack: 'वापस स्वागत है',
    home: 'होम',
    cropDoctor: 'फसल डॉक्टर',
    khetSense: 'खेत सेंस',
    fairMandi: 'फेयर मंडी',
    autoClaim: 'ऑटो क्लेम',
    weather: 'मौसम',
    profile: 'प्रोफाइल',
    scanCrop: 'फसल स्कैन करें',
    viewPrices: 'भाव देखें',
    checkWeather: 'मौसम देखें',
    claimInsurance: 'बीमा दावा',
    selectLanguage: 'भाषा चुनें',
    selectCompanion: 'अपना साथी चुनें',
    continue: 'जारी रखें',
    getStarted: 'शुरू करें',
    english: 'अंग्रेज़ी',
    hindi: 'हिंदी',
    garhwali: 'गढ़वाली',
    male: 'पुरुष',
    female: 'महिला',
    todaysTip: 'आज की सलाह',
    quickActions: 'त्वरित कार्य',
    recentActivity: 'हाल की गतिविधि',
sell: 'बेचें',
    hold: 'रुकें',
    buy: 'खरीदें',
    marketplace: 'मंडी बाज़ार',
    listProduct: 'उत्पाद लिस्ट करें',
    voiceAssistant: 'आवाज़ सहायक',
    whatsappAlerts: 'व्हाट्सएप अलर्ट',
    login: 'लॉगिन',
    enterPhone: 'अपना फ़ोन नंबर दर्ज करें',
    sendOTP: 'OTP भेजें',
    verifyOTP: 'OTP सत्यापित करें',
    resendOTP: 'OTP पुनः भेजें',
    welcomeLogin: 'किसान कवच में आपका स्वागत है',
    loginSubtitle: 'आपका भरोसेमंद खेती साथी',
    phoneLabel: 'फ़ोन नंबर',
    otpSent: 'आपके फ़ोन पर OTP भेजा गया',
    invalidOTP: 'गलत OTP, कृपया पुनः प्रयास करें',
  },
  garhwali: {
    appName: 'किसान कवच',
    tagline: 'तुम्हर खेती सांगी',
    welcomeBack: 'फेर स्वागत छ',
    home: 'घर',
    cropDoctor: 'फसल डॉक्टर',
    khetSense: 'खेत सेंस',
    fairMandi: 'फेयर मंडी',
    autoClaim: 'ऑटो क्लेम',
    weather: 'मौसम',
    profile: 'प्रोफाइल',
    scanCrop: 'फसल स्कैन कर',
    viewPrices: 'भाव देख',
    checkWeather: 'मौसम देख',
    claimInsurance: 'बीमा दावा',
    selectLanguage: 'बोली चुण',
    selectCompanion: 'अपण साथी चुण',
    continue: 'अगाड़ि',
    getStarted: 'शुरू कर',
    english: 'अंग्रेज़ी',
    hindi: 'हिंदी',
    garhwali: 'गढ़वाली',
    male: 'मर्द',
    female: 'बियांणी',
    todaysTip: 'आज की सलाह',
    quickActions: 'जल्दी काम',
    recentActivity: 'पिछली गतिविधि',
sell: 'बेच',
    hold: 'रुक',
    buy: 'ख्रीद',
    marketplace: 'मंडी बाज़ार',
    listProduct: 'सामान लिस्ट कर',
    voiceAssistant: 'आवाज़ सहायक',
    whatsappAlerts: 'व्हाट्सएप अलर्ट',
    login: 'लॉगिन',
    enterPhone: 'अपण फ़ोन नंबर दे',
    sendOTP: 'OTP भेज',
    verifyOTP: 'OTP जाँच',
    resendOTP: 'OTP फेर भेज',
    welcomeLogin: 'किसान कवच मा स्वागत छ',
    loginSubtitle: 'तुम्हर भरोसेमंद खेती सांगी',
    phoneLabel: 'फ़ोन नंबर',
    otpSent: 'तुम्हर फ़ोन पर OTP भेजी',
    invalidOTP: 'गलत OTP, फेर कोशिश कर',
  },
};
