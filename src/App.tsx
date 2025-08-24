import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Forms from './pages/Forms'
import FormBuilder from './pages/FormBuilder'
import FormResponse from './pages/FormResponse'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import TrelloCallback from './pages/TrelloCallback'
import JiraCallback from './pages/JiraCallback'
import NotFound from './pages/NotFound'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import TestUpload from './pages/TestUpload'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  // Global renk ve dil değişiklik fonksiyonları
  const applyGlobalColorChange = (colorValue: string) => {
    // CSS değişkenlerini güçlü şekilde güncelle
    document.documentElement.style.setProperty('--primary-color', colorValue, 'important')
    document.documentElement.style.setProperty('--system-primary', colorValue, 'important')
    document.documentElement.style.setProperty('--tw-primary', colorValue, 'important')
    
    // Global CSS override ekle
    const globalColorStyle = document.createElement('style')
    globalColorStyle.id = 'app-global-color-override'
    globalColorStyle.innerHTML = `
      * {
        --primary-color: ${colorValue} !important;
        --system-primary: ${colorValue} !important;
      }
      .bg-blue-600, .bg-blue-500, .bg-blue-400, .bg-blue-700,
      .bg-purple-600, .bg-purple-500, .bg-purple-400, .bg-purple-700,
      .bg-green-600, .bg-green-500, .bg-green-400, .bg-green-700,
      .bg-red-600, .bg-red-500, .bg-red-400, .bg-red-700,
      .bg-orange-600, .bg-orange-500, .bg-orange-400, .bg-orange-700,
      .bg-pink-600, .bg-pink-500, .bg-pink-400, .bg-pink-700 {
        background-color: ${colorValue} !important;
      }
      .text-blue-600, .text-blue-500, .text-blue-400,
      .text-purple-600, .text-purple-500, .text-purple-400,
      .text-green-600, .text-green-500, .text-green-400,
      .text-red-600, .text-red-500, .text-red-400,
      .text-orange-600, .text-orange-500, .text-orange-400,
      .text-pink-600, .text-pink-500, .text-pink-400 {
        color: ${colorValue} !important;
      }
      .border-blue-600, .border-blue-500, .border-blue-400,
      .border-purple-600, .border-purple-500, .border-purple-400,
      .border-green-600, .border-green-500, .border-green-400,
      .border-red-600, .border-red-500, .border-red-400,
      .border-orange-600, .border-orange-500, .border-orange-400,
      .border-pink-600, .border-pink-500, .border-pink-400 {
        border-color: ${colorValue} !important;
      }
      .hover\\:bg-blue-600:hover, .hover\\:bg-blue-500:hover, .hover\\:bg-blue-700:hover,
      .hover\\:bg-purple-600:hover, .hover\\:bg-purple-500:hover, .hover\\:bg-purple-700:hover,
      .hover\\:bg-green-600:hover, .hover\\:bg-green-500:hover, .hover\\:bg-green-700:hover,
      .hover\\:bg-red-600:hover, .hover\\:bg-red-500:hover, .hover\\:bg-red-700:hover,
      .hover\\:bg-orange-600:hover, .hover\\:bg-orange-500:hover, .hover\\:bg-orange-700:hover,
      .hover\\:bg-pink-600:hover, .hover\\:bg-pink-500:hover, .hover\\:bg-pink-700:hover {
        background-color: ${colorValue} !important;
      }
    `
    
    // Eski global stil varsa kaldır
    const existingGlobalStyle = document.getElementById('app-global-color-override')
    if (existingGlobalStyle) {
      existingGlobalStyle.remove()
    }
    
    // Yeni global stili ekle
    document.head.appendChild(globalColorStyle)
    
    // Tüm elementleri manuel olarak güncelle
    const allElements = document.querySelectorAll('*')
    allElements.forEach(element => {
      const el = element as HTMLElement
      const classes = el.className || ''
      
      // Background renkleri
      if (classes.includes('bg-blue') || classes.includes('bg-purple') || 
          classes.includes('bg-green') || classes.includes('bg-red') || 
          classes.includes('bg-orange') || classes.includes('bg-pink')) {
        el.style.setProperty('background-color', colorValue, 'important')
      }
      
      // Text renkleri
      if (classes.includes('text-blue') || classes.includes('text-purple') || 
          classes.includes('text-green') || classes.includes('text-red') || 
          classes.includes('text-orange') || classes.includes('text-pink')) {
        el.style.setProperty('color', colorValue, 'important')
      }
      
      // Border renkleri
      if (classes.includes('border-blue') || classes.includes('border-purple') || 
          classes.includes('border-green') || classes.includes('border-red') || 
          classes.includes('border-orange') || classes.includes('border-pink')) {
        el.style.setProperty('border-color', colorValue, 'important')
      }
    })
  }

  const applyGlobalLanguageChange = (language: string) => {
    const translations: { [key: string]: { [key: string]: string } } = {
      'tr': {
        'Anketlerinizi AI ile Güçlendirin': 'Anketlerinizi AI ile Güçlendirin',
        'Yapay zeka destekli anket oluşturucu ile benzersiz sorular hazırlayın, trend analizi yapın ve daha fazla yanıt alın.': 'Yapay zeka destekli anket oluşturucu ile benzersiz sorular hazırlayın, trend analizi yapın ve daha fazla yanıt alın.',
        'Şablonlar': 'Şablonlar',
        'AI Önerileri': 'AI Önerileri',
        'Trendler': 'Trendler',
        'Yeni bir form hazırlamaya başlayın': 'Yeni bir form hazırlamaya başlayın',
        'Boş Form': 'Boş Form',
        'AI destekli sıfırdan yeni bir form oluşturun': 'AI destekli sıfırdan yeni bir form oluşturun',
        'AI Destekli': 'AI Destekli',
        'AI Destekli Oluştur': 'AI Destekli Oluştur',
        'Jira Token Test': 'Jira Token Test',
        'Şablon Galerisi': 'Şablon Galerisi',
        'İletişim Bilgileri': 'İletişim Bilgileri',
        'Etkinlik LCV Formu': 'Etkinlik LCV Formu',
        'Parti Davetiyesi': 'Parti Davetiyesi',
        'Tişört İstek Formu': 'Tişört İstek Formu',
        'Etkinlik Kayıt Formu': 'Etkinlik Kayıt Formu',
        'Kolay': 'Kolay',
        'Orta': 'Orta',
        'Zor': 'Zor',
        '2 dk': '2 dk',
        '5 dk': '5 dk',
        '10 dk': '10 dk',
        // Forms sayfası metinleri
        'Anketlerim': 'Anketlerim',
        'AI destekli anket yönetimi ve analizi': 'AI destekli anket yönetimi ve analizi',
        'Yenile': 'Yenile',
        'AI Analiz': 'AI Analiz',
        'Yeni Anket': 'Yeni Anket',
        'AI Öngörüleri': 'AI Öngörüleri',
        'Son 7 günde anketleriniz %23 daha fazla yanıt aldı': 'Son 7 günde anketleriniz %23 daha fazla yanıt aldı',
        'Yanıt Artışı': 'Yanıt Artışı',
        'AI destekli arama...': 'AI destekli arama...',
        'Tümü': 'Tümü',
        'Tüm Durumlar': 'Tüm Durumlar',
        'Aktif': 'Aktif',
        'Taslak': 'Taslak',
        'Arşivlenmiş': 'Arşivlenmiş',
        'Tarihe Göre': 'Tarihe Göre',
        'Yanıt Sayısına Göre': 'Yanıt Sayısına Göre',
        'Görüntü Sayısına Göre': 'Görüntü Sayısına Göre',
        'AI Skoruna Göre': 'AI Skoruna Göre',
        'Anketler yükleniyor...': 'Anketler yükleniyor...',
        'Henüz anket oluşturmadınız': 'Henüz anket oluşturmadınız',
        'İlk anketinizi oluşturmak için "Yeni Anket" butonuna tıklayın': 'İlk anketinizi oluşturmak için "Yeni Anket" butonuna tıklayın',
        'Yanıt': 'Yanıt',
        'Görüntü': 'Görüntü',
        'Tamamlanma': 'Tamamlanma',
        'soru': 'soru',
        'Anket': 'Anket',
        'Durum': 'Durum',
        'Kategori': 'Kategori',
        'Yanıtlar': 'Yanıtlar',
        'AI Skor': 'AI Skor',
        'Son Güncelleme': 'Son Güncelleme',
        'İşlemler': 'İşlemler',
        'Arkaplan Resmi Yükle': 'Arkaplan Resmi Yükle',
        'Resim dosyasını buraya sürükleyin veya seçin': 'Resim dosyasını buraya sürükleyin veya seçin',
        'Resim Seç': 'Resim Seç',
        'İptal': 'İptal',
        'AI Anket Analizi': 'AI Anket Analizi',
        'Genel Performans': 'Genel Performans',
        'Ortalama Tamamlanma': 'Ortalama Tamamlanma',
        'Toplam Görüntü': 'Toplam Görüntü',
        'AI Analiz Önerileri': 'AI Analiz Önerileri',
        'Müşteri deneyimi anketleriniz %40 daha fazla yanıt alıyor': 'Müşteri deneyimi anketleriniz %40 daha fazla yanıt alıyor',
        'Çalışan memnuniyet anketleri için en uygun zaman şimdi': 'Çalışan memnuniyet anketleri için en uygun zaman şimdi',
        'Ürün lansmanı anketleriniz trend olmaya başladı': 'Ürün lansmanı anketleriniz trend olmaya başladı',
        // Login/Register sayfası metinleri
        'GİRİŞ YAP': 'GİRİŞ YAP',
        'KAYIT OL': 'KAYIT OL',
        'E-posta Adresi': 'E-posta Adresi',
        'E-posta adresinizi girin': 'E-posta adresinizi girin',
        'Şifre': 'Şifre',
        'Şifrenizi girin': 'Şifrenizi girin',
        'Giriş Yapılıyor...': 'Giriş Yapılıyor...',
        'veya': 'veya',
        'GOOGLE İLE GİRİŞ YAP': 'GOOGLE İLE GİRİŞ YAP',
        'TRELLO İLE GİRİŞ YAP': 'TRELLO İLE GİRİŞ YAP',
        'JIRA İLE GİRİŞ YAP': 'JIRA İLE GİRİŞ YAP',
        'Şifremi Unuttum': 'Şifremi Unuttum',
        'Ad': 'Ad',
        'Soyad': 'Soyad',
        'Yaş': 'Yaş',
        'Şehir': 'Şehir',
        'İlçe': 'İlçe',
        'Mahalle': 'Mahalle',
        'Adres Detayları': 'Adres Detayları',
        'Şifre (Tekrar)': 'Şifre (Tekrar)',
        'Kayıt Olunuyor...': 'Kayıt Olunuyor...',
        // Ayarlar sayfası metinleri (Settings.tsx'ten ekleyelim)
        'Ayarlar': 'Ayarlar',
        'Genel': 'Genel',
        'Bildirimler': 'Bildirimler',
        'Gizlilik': 'Gizlilik',
        'Görünüm': 'Görünüm',
        'Dil': 'Dil',
        'Güvenlik': 'Güvenlik'
      },
      'en': {
        'Anketlerinizi AI ile Güçlendirin': 'Empower Your Surveys with AI',
        'Yapay zeka destekli anket oluşturucu ile benzersiz sorular hazırlayın, trend analizi yapın ve daha fazla yanıt alın.': 'Create unique questions with AI-powered survey creator, perform trend analysis, and get more responses.',
        'Şablonlar': 'Templates',
        'AI Önerileri': 'AI Suggestions',
        'Trendler': 'Trends',
        'Yeni bir form hazırlamaya başlayın': 'Start preparing a new form',
        'Boş Form': 'Empty Form',
        'AI destekli sıfırdan yeni bir form oluşturun': 'Create a new form from scratch with AI support',
        'AI Destekli': 'AI Supported',
        'AI Destekli Oluştur': 'Create with AI Support',
        'Jira Token Test': 'Jira Token Test',
        'Şablon Galerisi': 'Template Gallery',
        'İletişim Bilgileri': 'Contact Information',
        'Etkinlik LCV Formu': 'Event RSVP Form',
        'Parti Davetiyesi': 'Party Invitation',
        'Tişört İstek Formu': 'T-Shirt Request Form',
        'Etkinlik Kayıt Formu': 'Event Registration Form',
        'Kolay': 'Easy',
        'Orta': 'Medium',
        'Zor': 'Hard',
        '2 dk': '2 min',
        '5 dk': '5 min',
        '10 dk': '10 min',
        // Forms sayfası metinleri
        'Anketlerim': 'My Surveys',
        'AI destekli anket yönetimi ve analizi': 'AI-powered survey management and analysis',
        'Yenile': 'Refresh',
        'AI Analiz': 'AI Analysis',
        'Yeni Anket': 'New Survey',
        'AI Öngörüleri': 'AI Insights',
        'Son 7 günde anketleriniz %23 daha fazla yanıt aldı': 'Your surveys received 23% more responses in the last 7 days',
        'Yanıt Artışı': 'Response Increase',
        'AI destekli arama...': 'AI-powered search...',
        'Tümü': 'All',
        'Tüm Durumlar': 'All Statuses',
        'Aktif': 'Active',
        'Taslak': 'Draft',
        'Arşivlenmiş': 'Archived',
        'Tarihe Göre': 'By Date',
        'Yanıt Sayısına Göre': 'By Response Count',
        'Görüntü Sayısına Göre': 'By View Count',
        'AI Skoruna Göre': 'By AI Score',
        'Anketler yükleniyor...': 'Loading surveys...',
        'Henüz anket oluşturmadınız': 'You haven\'t created any surveys yet',
        'İlk anketinizi oluşturmak için "Yeni Anket" butonuna tıklayın': 'Click the "New Survey" button to create your first survey',
        'Yanıt': 'Responses',
        'Görüntü': 'Views',
        'Tamamlanma': 'Completion',
        'soru': 'questions',
        'Anket': 'Survey',
        'Durum': 'Status',
        'Kategori': 'Category',
        'Yanıtlar': 'Responses',
        'AI Skor': 'AI Score',
        'Son Güncelleme': 'Last Updated',
        'İşlemler': 'Actions',
        'Arkaplan Resmi Yükle': 'Upload Background Image',
        'Resim dosyasını buraya sürükleyin veya seçin': 'Drag and drop an image file here or select one',
        'Resim Seç': 'Select Image',
        'İptal': 'Cancel',
        'AI Anket Analizi': 'AI Survey Analysis',
        'Genel Performans': 'General Performance',
        'Ortalama Tamamlanma': 'Average Completion',
        'Toplam Görüntü': 'Total Views',
        'AI Analiz Önerileri': 'AI Analysis Recommendations',
        'Müşteri deneyimi anketleriniz %40 daha fazla yanıt alıyor': 'Your customer experience surveys are getting 40% more responses',
        'Çalışan memnuniyet anketleri için en uygun zaman şimdi': 'Now is the optimal time for employee satisfaction surveys',
        'Ürün lansmanı anketleriniz trend olmaya başladı': 'Your product launch surveys are starting to trend',
        // Login/Register sayfası metinleri
        'GİRİŞ YAP': 'LOGIN',
        'KAYIT OL': 'SIGN UP',
        'E-posta Adresi': 'Email Address',
        'E-posta adresinizi girin': 'Enter your email address',
        'Şifre': 'Password',
        'Şifrenizi girin': 'Enter your password',
        'Giriş Yapılıyor...': 'Logging in...',
        'veya': 'or',
        'GOOGLE İLE GİRİŞ YAP': 'LOGIN WITH GOOGLE',
        'TRELLO İLE GİRİŞ YAP': 'LOGIN WITH TRELLO',
        'JIRA İLE GİRİŞ YAP': 'LOGIN WITH JIRA',
        'Şifremi Unuttum': 'Forgot Password',
        'Ad': 'First Name',
        'Soyad': 'Last Name',
        'Yaş': 'Age',
        'Şehir': 'City',
        'İlçe': 'District',
        'Mahalle': 'Neighborhood',
        'Adres Detayları': 'Address Details',
        'Şifre (Tekrar)': 'Password (Repeat)',
        'Kayıt Olunuyor...': 'Signing up...',
        // Ayarlar sayfası metinleri
        'Ayarlar': 'Settings',
        'Genel': 'General',
        'Bildirimler': 'Notifications',
        'Gizlilik': 'Privacy',
        'Görünüm': 'Appearance',
        'Dil': 'Language',
        'Güvenlik': 'Security'
      },
      'de': {
        'Anketlerinizi AI ile Güçlendirin': 'Stärken Sie Ihre Umfragen mit KI',
        'Yapay zeka destekli anket oluşturucu ile benzersiz sorular hazırlayın, trend analizi yapın ve daha fazla yanıt alın.': 'Erstellen Sie einzigartige Fragen mit KI-gestütztem Umfrage-Builder, führen Sie Trendanalysen durch und erhalten Sie mehr Antworten.',
        'Şablonlar': 'Vorlagen',
        'AI Önerileri': 'KI-Empfehlungen',
        'Trendler': 'Trends',
        'Yeni bir form hazırlamaya başlayın': 'Beginnen Sie mit der Erstellung eines neuen Formulars',
        'Boş Form': 'Leeres Formular',
        'AI destekli sıfırdan yeni bir form oluşturun': 'Erstellen Sie ein neues Formular von Grund auf mit KI-Unterstützung',
        'AI Destekli': 'KI-Unterstützt',
        'AI Destekli Oluştur': 'Mit KI-Unterstützung erstellen',
        'Jira Token Test': 'Jira Token Test',
        'Şablon Galerisi': 'Vorlagengalerie',
        'İletişim Bilgileri': 'Kontaktinformationen',
        'Etkinlik LCV Formu': 'Event RSVP Formular',
        'Parti Davetiyesi': 'Party-Einladung',
        'Tişört İstek Formu': 'T-Shirt Anfrage Formular',
        'Etkinlik Kayıt Formu': 'Event-Registrierung Formular',
        'Kolay': 'Einfach',
        'Orta': 'Mittel',
        'Zor': 'Schwer',
        '2 dk': '2 min',
        '5 dk': '5 min',
        '10 dk': '10 min',
        // Forms sayfası metinleri
        'Anketlerim': 'Meine Umfragen',
        'AI destekli anket yönetimi ve analizi': 'KI-gestützte Umfragenverwaltung und -analyse',
        'Yenile': 'Aktualisieren',
        'AI Analiz': 'KI-Analyse',
        'Yeni Anket': 'Neue Umfrage',
        'AI Öngörüleri': 'KI-Einblicke',
        'Son 7 günde anketleriniz %23 daha fazla yanıt aldı': 'Ihre Umfragen erhielten in den letzten 7 Tagen 23% mehr Antworten',
        'Yanıt Artışı': 'Antwort-Steigerung',
        'AI destekli arama...': 'KI-gestützte Suche...',
        'Tümü': 'Alle',
        'Tüm Durumlar': 'Alle Status',
        'Aktif': 'Aktiv',
        'Taslak': 'Entwurf',
        'Arşivlenmiş': 'Archiviert',
        'Tarihe Göre': 'Nach Datum',
        'Yanıt Sayısına Göre': 'Nach Antwortanzahl',
        'Görüntü Sayısına Göre': 'Nach Ansichtsanzahl',
        'AI Skoruna Göre': 'Nach KI-Bewertung',
        'Anketler yükleniyor...': 'Umfragen werden geladen...',
        'Henüz anket oluşturmadınız': 'Sie haben noch keine Umfragen erstellt',
        'İlk anketinizi oluşturmak için "Yeni Anket" butonuna tıklayın': 'Klicken Sie auf "Neue Umfrage", um Ihre erste Umfrage zu erstellen',
        'Yanıt': 'Antworten',
        'Görüntü': 'Ansichten',
        'Tamamlanma': 'Abschluss',
        'soru': 'Fragen',
        'Anket': 'Umfrage',
        'Durum': 'Status',
        'Kategori': 'Kategorie',
        'Yanıtlar': 'Antworten',
        'AI Skor': 'KI-Bewertung',
        'Son Güncelleme': 'Zuletzt aktualisiert',
        'İşlemler': 'Aktionen',
        'Arkaplan Resmi Yükle': 'Hintergrundbild hochladen',
        'Resim dosyasını buraya sürükleyin veya seçin': 'Ziehen Sie eine Bilddatei hierher oder wählen Sie eine aus',
        'Resim Seç': 'Bild auswählen',
        'İptal': 'Abbrechen',
        'AI Anket Analizi': 'KI-Umfrageanalyse',
        'Genel Performans': 'Allgemeine Leistung',
        'Ortalama Tamamlanma': 'Durchschnittlicher Abschluss',
        'Toplam Görüntü': 'Gesamtansichten',
        'AI Analiz Önerileri': 'KI-Analyse-Empfehlungen',
        'Müşteri deneyimi anketleriniz %40 daha fazla yanıt alıyor': 'Ihre Kundenerfahrungsumfragen erhalten 40% mehr Antworten',
        'Çalışan memnuniyet anketleri için en uygun zaman şimdi': 'Jetzt ist die optimale Zeit für Mitarbeiterzufriedenheitsumfragen',
        'Ürün lansmanı anketleriniz trend olmaya başladı': 'Ihre Produkteinführungsumfragen beginnen zu trenden',
        // Login/Register sayfası metinleri
        'GİRİŞ YAP': 'ANMELDEN',
        'KAYIT OL': 'REGISTRIEREN',
        'E-posta Adresi': 'E-Mail-Adresse',
        'E-posta adresinizi girin': 'Geben Sie Ihre E-Mail-Adresse ein',
        'Şifre': 'Passwort',
        'Şifrenizi girin': 'Geben Sie Ihr Passwort ein',
        'Giriş Yapılıyor...': 'Anmeldung läuft...',
        'veya': 'oder',
        'GOOGLE İLE GİRİŞ YAP': 'MIT GOOGLE ANMELDEN',
        'TRELLO İLE GİRİŞ YAP': 'MIT TRELLO ANMELDEN',
        'JIRA İLE GİRİŞ YAP': 'MIT JIRA ANMELDEN',
        'Şifremi Unuttum': 'Passwort vergessen',
        'Ad': 'Vorname',
        'Soyad': 'Nachname',
        'Yaş': 'Alter',
        'Şehir': 'Stadt',
        'İlçe': 'Bezirk',
        'Mahalle': 'Viertel',
        'Adres Detayları': 'Adressdetails',
        'Şifre (Tekrar)': 'Passwort (Wiederholen)',
        'Kayıt Olunuyor...': 'Registrierung läuft...',
        // Ayarlar sayfası metinleri
        'Ayarlar': 'Einstellungen',
        'Genel': 'Allgemein',
        'Bildirimler': 'Benachrichtigungen',
        'Gizlilik': 'Privatsphäre',
        'Görünüm': 'Erscheinungsbild',
        'Dil': 'Sprache',
        'Güvenlik': 'Sicherheit'
      },
      'fr': {
        'Anketlerinizi AI ile Güçlendirin': 'Renforcez vos enquêtes avec l\'IA',
        'Yapay zeka destekli anket oluşturucu ile benzersiz sorular hazırlayın, trend analizi yapın ve daha fazla yanıt alın.': 'Créez des questions uniques avec le générateur d\'enquêtes alimenté par l\'IA, effectuez des analyses de tendances et obtenez plus de réponses.',
        'Şablonlar': 'Modèles',
        'AI Önerileri': 'Recommandations IA',
        'Trendler': 'Tendances',
        'Yeni bir form hazırlamaya başlayın': 'Commencez à préparer un nouveau formulaire',
        'Boş Form': 'Formulaire vide',
        'AI destekli sıfırdan yeni bir form oluşturun': 'Créez un nouveau formulaire à partir de zéro avec le support IA',
        'AI Destekli': 'Assisté par IA',
        'AI Destekli Oluştur': 'Créer avec l\'assistance IA',
        'Jira Token Test': 'Test de token Jira',
        'Şablon Galerisi': 'Galerie de modèles',
        'İletişim Bilgileri': 'Informations de contact',
        'Etkinlik LCV Formu': 'Formulaire RSVP d\'événement',
        'Parti Davetiyesi': 'Invitation de fête',
        'Tişört İstek Formu': 'Formulaire de demande de t-shirt',
        'Etkinlik Kayıt Formu': 'Formulaire d\'inscription à l\'événement',
        'Kolay': 'Facile',
        'Orta': 'Moyen',
        'Zor': 'Difficile',
        '2 dk': '2 min',
        '5 dk': '5 min',
        '10 dk': '10 min',
        // Forms sayfası metinleri
        'Anketlerim': 'Mes enquêtes',
        'AI destekli anket yönetimi ve analizi': 'Gestion et analyse d\'enquêtes assistées par IA',
        'Yenile': 'Actualiser',
        'AI Analiz': 'Analyse IA',
        'Yeni Anket': 'Nouvelle enquête',
        'AI Öngörüleri': 'Aperçus IA',
        'Son 7 günde anketleriniz %23 daha fazla yanıt aldı': 'Vos enquêtes ont reçu 23% de réponses en plus au cours des 7 derniers jours',
        'Yanıt Artışı': 'Augmentation des réponses',
        'AI destekli arama...': 'Recherche assistée par IA...',
        'Tümü': 'Tous',
        'Tüm Durumlar': 'Tous les statuts',
        'Aktif': 'Actif',
        'Taslak': 'Brouillon',
        'Arşivlenmiş': 'Archivé',
        'Tarihe Göre': 'Par date',
        'Yanıt Sayısına Göre': 'Par nombre de réponses',
        'Görüntü Sayısına Göre': 'Par nombre de vues',
        'AI Skoruna Göre': 'Par score IA',
        'Anketler yükleniyor...': 'Chargement des enquêtes...',
        'Henüz anket oluşturmadınız': 'Vous n\'avez pas encore créé d\'enquêtes',
        'İlk anketinizi oluşturmak için "Yeni Anket" butonuna tıklayın': 'Cliquez sur le bouton "Nouvelle enquête" pour créer votre première enquête',
        'Yanıt': 'Réponses',
        'Görüntü': 'Vues',
        'Tamamlanma': 'Achèvement',
        'soru': 'questions',
        'Anket': 'Enquête',
        'Durum': 'Statut',
        'Kategori': 'Catégorie',
        'Yanıtlar': 'Réponses',
        'AI Skor': 'Score IA',
        'Son Güncelleme': 'Dernière mise à jour',
        'İşlemler': 'Actions',
        'Arkaplan Resmi Yükle': 'Télécharger l\'image d\'arrière-plan',
        'Resim dosyasını buraya sürükleyin veya seçin': 'Glissez et déposez un fichier image ici ou sélectionnez-en un',
        'Resim Seç': 'Sélectionner une image',
        'İptal': 'Annuler',
        'AI Anket Analizi': 'Analyse d\'enquête IA',
        'Genel Performans': 'Performance générale',
        'Ortalama Tamamlanma': 'Achèvement moyen',
        'Toplam Görüntü': 'Vues totales',
        'AI Analiz Önerileri': 'Recommandations d\'Analyse IA',
        'Müşteri deneyimi anketleriniz %40 daha fazla yanıt alıyor': 'Vos enquêtes d\'expérience client reçoivent 40% de réponses en plus',
        'Çalışan memnuniyet anketleri için en uygun zaman şimdi': 'C\'est maintenant le moment optimal pour les enquêtes de satisfaction des employés',
        'Ürün lansmanı anketleriniz trend olmaya başladı': 'Vos enquêtes de lancement de produit commencent à faire tendance',
        // Login/Register sayfası metinleri
        'GİRİŞ YAP': 'SE CONNECTER',
        'KAYIT OL': 'S\'INSCRIRE',
        'E-posta Adresi': 'Adresse e-mail',
        'E-posta adresinizi girin': 'Entrez votre adresse e-mail',
        'Şifre': 'Mot de passe',
        'Şifrenizi girin': 'Entrez votre mot de passe',
        'Giriş Yapılıyor...': 'Connexion en cours...',
        'veya': 'ou',
        'GOOGLE İLE GİRİŞ YAP': 'SE CONNECTER AVEC GOOGLE',
        'TRELLO İLE GİRİŞ YAP': 'SE CONNECTER AVEC TRELLO',
        'JIRA İLE GİRİŞ YAP': 'SE CONNECTER AVEC JIRA',
        'Şifremi Unuttum': 'Mot de passe oublié',
        'Ad': 'Prénom',
        'Soyad': 'Nom de famille',
        'Yaş': 'Âge',
        'Şehir': 'Ville',
        'İlçe': 'District',
        'Mahalle': 'Quartier',
        'Adres Detayları': 'Détails de l\'adresse',
        'Şifre (Tekrar)': 'Mot de passe (Répéter)',
        'Kayıt Olunuyor...': 'Inscription en cours...',
        // Ayarlar sayfası metinleri
        'Ayarlar': 'Paramètres',
        'Genel': 'Général',
        'Bildirimler': 'Notifications',
        'Gizlilik': 'Confidentialité',
        'Görünüm': 'Apparence',
        'Dil': 'Langue',
        'Güvenlik': 'Sécurité'
      },
      'es': {
        'Anketlerinizi AI ile Güçlendirin': 'Potencia tus encuestas con IA',
        'Yapay zeka destekli anket oluşturucu ile benzersiz sorular hazırlayın, trend analizi yapın ve daha fazla yanıt alın.': 'Crea preguntas únicas con el generador de encuestas impulsado por IA, realiza análisis de tendencias y obtén más respuestas.',
        'Şablonlar': 'Plantillas',
        'AI Önerileri': 'Recomendaciones IA',
        'Trendler': 'Tendencias',
        'Yeni bir form hazırlamaya başlayın': 'Comienza a preparar un nuevo formulario',
        'Boş Form': 'Formulario vacío',
        'AI destekli sıfırdan yeni bir form oluşturun': 'Crea un nuevo formulario desde cero con soporte de IA',
        'AI Destekli': 'Asistido por IA',
        'AI Destekli Oluştur': 'Crear con asistencia IA',
        'Jira Token Test': 'Prueba de token Jira',
        'Şablon Galerisi': 'Galería de plantillas',
        'İletişim Bilgileri': 'Información de contacto',
        'Etkinlik LCV Formu': 'Formulario RSVP de evento',
        'Parti Davetiyesi': 'Invitación de fiesta',
        'Tişört İstek Formu': 'Formulario de solicitud de camiseta',
        'Etkinlik Kayıt Formu': 'Formulario de registro de evento',
        'Kolay': 'Fácil',
        'Orta': 'Medio',
        'Zor': 'Difícil',
        '2 dk': '2 min',
        '5 dk': '5 min',
        '10 dk': '10 min',
        // Forms sayfası metinleri
        'Anketlerim': 'Mis encuestas',
        'AI destekli anket yönetimi ve analizi': 'Gestión y análisis de encuestas asistidas por IA',
        'Yenile': 'Actualizar',
        'AI Analiz': 'Análisis IA',
        'Yeni Anket': 'Nueva encuesta',
        'AI Öngörüleri': 'Perspectivas IA',
        'Son 7 günde anketleriniz %23 daha fazla yanıt aldı': 'Tus encuestas recibieron 23% más respuestas en los últimos 7 días',
        'Yanıt Artışı': 'Aumento de respuestas',
        'AI destekli arama...': 'Búsqueda asistida por IA...',
        'Tümü': 'Todos',
        'Tüm Durumlar': 'Todos los estados',
        'Aktif': 'Activo',
        'Taslak': 'Borrador',
        'Arşivlenmiş': 'Archivado',
        'Tarihe Göre': 'Por fecha',
        'Yanıt Sayısına Göre': 'Por número de respuestas',
        'Görüntü Sayısına Göre': 'Por número de vistas',
        'AI Skoruna Göre': 'Por puntuación IA',
        'Anketler yükleniyor...': 'Cargando encuestas...',
        'Henüz anket oluşturmadınız': 'Aún no has creado ninguna encuesta',
        'İlk anketinizi oluşturmak için "Yeni Anket" butonuna tıklayın': 'Haz clic en el botón "Nueva encuesta" para crear tu primera encuesta',
        'Yanıt': 'Respuestas',
        'Görüntü': 'Vistas',
        'Tamamlanma': 'Finalización',
        'soru': 'preguntas',
        'Anket': 'Encuesta',
        'Durum': 'Estado',
        'Kategori': 'Categoría',
        'Yanıtlar': 'Respuestas',
        'AI Skor': 'Puntuación IA',
        'Son Güncelleme': 'Última actualización',
        'İşlemler': 'Acciones',
        'Arkaplan Resmi Yükle': 'Subir imagen de fondo',
        'Resim dosyasını buraya sürükleyin veya seçin': 'Arrastra y suelta un archivo de imagen aquí o selecciona uno',
        'Resim Seç': 'Seleccionar imagen',
        'İptal': 'Cancelar',
        'AI Anket Analizi': 'Análisis de encuesta IA',
        'Genel Performans': 'Rendimiento general',
        'Ortalama Tamamlanma': 'Finalización promedio',
        'Toplam Görüntü': 'Vistas totales',
        'AI Analiz Önerileri': 'Recomendaciones de Análisis IA',
        'Müşteri deneyimi anketleriniz %40 daha fazla yanıt alıyor': 'Tus encuestas de experiencia del cliente están obteniendo 40% más respuestas',
        'Çalışan memnuniyet anketleri için en uygun zaman şimdi': 'Ahora es el momento óptimo para las encuestas de satisfacción de empleados',
        'Ürün lansmanı anketleriniz trend olmaya başladı': 'Tus encuestas de lanzamiento de producto están empezando a ser tendencia',
        // Login/Register sayfası metinleri
        'GİRİŞ YAP': 'INICIAR SESIÓN',
        'KAYIT OL': 'REGISTRARSE',
        'E-posta Adresi': 'Dirección de correo electrónico',
        'E-posta adresinizi girin': 'Ingresa tu dirección de correo electrónico',
        'Şifre': 'Contraseña',
        'Şifrenizi girin': 'Ingresa tu contraseña',
        'Giriş Yapılıyor...': 'Iniciando sesión...',
        'veya': 'o',
        'GOOGLE İLE GİRİŞ YAP': 'INICIAR SESIÓN CON GOOGLE',
        'TRELLO İLE GİRİŞ YAP': 'INICIAR SESIÓN CON TRELLO',
        'JIRA İLE GİRİŞ YAP': 'INICIAR SESIÓN CON JIRA',
        'Şifremi Unuttum': 'Olvidé mi contraseña',
        'Ad': 'Nombre',
        'Soyad': 'Apellido',
        'Yaş': 'Edad',
        'Şehir': 'Ciudad',
        'İlçe': 'Distrito',
        'Mahalle': 'Barrio',
        'Adres Detayları': 'Detalles de dirección',
        'Şifre (Tekrar)': 'Contraseña (Repetir)',
        'Kayıt Olunuyor...': 'Registrándose...',
        // Ayarlar sayfası metinleri
        'Ayarlar': 'Configuración',
        'Genel': 'General',
        'Bildirimler': 'Notificaciones',
        'Gizlilik': 'Privacidad',
        'Görünüm': 'Apariencia',
        'Dil': 'Idioma',
        'Güvenlik': 'Seguridad'
      }
    }

    const currentTranslations = translations[language] || translations['tr']
    
    // GÜÇLÜ DİL GÜNCELLEMESİ - Tüm metinleri anında güncelle
    Object.keys(currentTranslations).forEach(turkishText => {
      const translatedText = currentTranslations[turkishText]
      
      // Tüm text node'ları bul ve güncelle
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      )
      
      const textNodes: Text[] = []
      let node
      while (node = walker.nextNode()) {
        textNodes.push(node as Text)
      }
      
      textNodes.forEach(textNode => {
        if (textNode.textContent?.trim() === turkishText) {
          textNode.textContent = translatedText
        }
        // Kısmi eşleşmeler için de kontrol et
        if (textNode.textContent?.includes(turkishText)) {
          textNode.textContent = textNode.textContent.replace(turkishText, translatedText)
        }
      })
      
      // Elementlerin textContent'lerini de güncelle
      const elements = document.querySelectorAll('*')
      elements.forEach(element => {
        // Sadece text içeren elementler
        if (element.children.length === 0 && element.textContent?.trim() === turkishText) {
          element.textContent = translatedText
        }
        
        // Placeholder'ları güncelle
        if (element instanceof HTMLInputElement && element.placeholder === turkishText) {
          element.placeholder = translatedText
        }
        
        // Title attribute'larını güncelle
        if (element.getAttribute('title') === turkishText) {
          element.setAttribute('title', translatedText)
        }
        
        // aria-label'ları güncelle
        if (element.getAttribute('aria-label') === turkishText) {
          element.setAttribute('aria-label', translatedText)
        }
      })
    })
    
    // HTML lang attribute'unu güncelle
    document.documentElement.lang = language
  }

  // Uygulama başladığında sistem ayarlarını yükle
  useEffect(() => {
    const loadSystemSettings = () => {
      try {
        // Sistem temasını yükle
        const systemTheme = localStorage.getItem('systemTheme')
        if (systemTheme) {
          if (systemTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else if (systemTheme === 'light') {
            document.documentElement.classList.remove('dark')
          } else if (systemTheme === 'auto') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
        }

        // Sistem rengini yükle ve uygula
        const systemColor = localStorage.getItem('systemColor')
        const systemColorValue = localStorage.getItem('systemColorValue')
        if (systemColor && systemColorValue) {
          applyGlobalColorChange(systemColorValue)
        }

        // Sistem dilini yükle ve uygula
        const systemLanguage = localStorage.getItem('systemLanguage')
        if (systemLanguage) {
          applyGlobalLanguageChange(systemLanguage)
        }
      } catch (error) {
        console.log('Sistem ayarları yüklenirken hata:', error)
      }
    }

    // Global event listener'lar ekle
    const handleColorChange = (event: CustomEvent) => {
      applyGlobalColorChange(event.detail.value)
    }

    const handleLanguageChange = (event: CustomEvent) => {
      applyGlobalLanguageChange(event.detail.language)
    }

    window.addEventListener('colorChanged', handleColorChange as EventListener)
    window.addEventListener('languageChanged', handleLanguageChange as EventListener)

    loadSystemSettings()

    // Cleanup function
    return () => {
      window.removeEventListener('colorChanged', handleColorChange as EventListener)
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener)
    }
  }, [])

  return (
    <LanguageProvider>
      <Routes>
        {/* Public routes - giriş yapmadan erişilebilir */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/trello/callback" element={<TrelloCallback />} />
        <Route path="/auth/jira/callback" element={<JiraCallback />} />
        <Route path="/test-upload" element={<TestUpload />} />

        {/* Tüm uygulama layout'u */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms"
            element={
              <ProtectedRoute>
                <Forms />
              </ProtectedRoute>
            }
          />
          <Route
            path="/form-builder"
            element={
              <ProtectedRoute>
                <FormBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/form-builder/:id"
            element={
              <ProtectedRoute>
                <FormBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/forms/new"
            element={
              <ProtectedRoute>
                <FormBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/:id"
            element={
              <ProtectedRoute>
                <FormResponse />
              </ProtectedRoute>
            }
          />
          {/* Public answering route */}
          <Route path="/survey/:id" element={<FormResponse />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </LanguageProvider>
  )
}

export default App
