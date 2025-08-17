import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, Key, Trash2, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Settings = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('general')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    userName: user?.userName || '',
    userSurname: user?.userSurname || '',
    userEmail: user?.userEmail || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true
  })
  const [privacy, setPrivacy] = useState({
    dataAnalysis: true,
    thirdParty: true
  })
  const [appearance, setAppearance] = useState({
    theme: 'light',
    colorScheme: 'Mavi'
  })
  const [language, setLanguage] = useState({
    interface: 'tr',
    dateFormat: 'DD/MM/YYYY'
  })
  const [security, setSecurity] = useState({
    twoFactor: false
  })

  // Dil değişikliğini anında uygula
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(prev => ({ ...prev, interface: newLanguage }))
    
    // LocalStorage'a kaydet
    const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
    const updatedSettings = { ...currentSettings, language: newLanguage }
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings))
    
    // Sayfa dilini değiştir
    document.documentElement.lang = newLanguage
    
    // Tüm sistem dilini değiştir
    applyLanguageToSystem(newLanguage)
    
    // Başarı mesajı göster
    setMessage({ type: 'success', text: `Dil ${getLanguageName(newLanguage)} olarak değiştirildi!` })
    setTimeout(() => setMessage({ type: '', text: '' }), 2000)
  }

  // Dil adını döndür
  const getLanguageName = (langCode: string) => {
    const languageNames: { [key: string]: string } = {
      'tr': 'Türkçe',
      'en': 'English',
      'de': 'Deutsch',
      'fr': 'Français',
      'es': 'Español'
    }
    return languageNames[langCode] || langCode
  }

  // Sisteme dil uygula
  const applyLanguageToSystem = (language: string) => {
    // HTML lang attribute'unu güncelle
    document.documentElement.lang = language
    
    // LocalStorage'a sistem dili olarak kaydet
    localStorage.setItem('systemLanguage', language)
    
    // Tüm sayfaya dil değişikliği event'i gönder
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language } }))
    
    // Sayfa başlığını güncelle
    const titles: { [key: string]: string } = {
      'tr': 'Formlar - Ayarlar',
      'en': 'Forms - Settings',
      'de': 'Formulare - Einstellungen',
      'fr': 'Formulaires - Paramètres',
      'es': 'Formularios - Configuración'
    }
    document.title = titles[language] || 'Forms - Settings'
    
    // Tüm sayfadaki metinleri güncelle
    updatePageTexts(language)
  }

  // Sayfa metinlerini güncelle
  const updatePageTexts = (language: string) => {
    const translations: { [key: string]: { [key: string]: string } } = {
      'tr': {
        'Ayarlar': 'Ayarlar',
        'Genel': 'Genel',
        'Bildirimler': 'Bildirimler',
        'Gizlilik': 'Gizlilik',
        'Görünüm': 'Görünüm',
        'Dil': 'Dil',
        'Güvenlik': 'Güvenlik',
        'Mavi': 'Mavi',
        'Mor': 'Mor',
        'Yeşil': 'Yeşil',
        'Kırmızı': 'Kırmızı',
        'Turuncu': 'Turuncu',
        'Pembe': 'Pembe',
        'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.': 'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.',
        'İptal': 'İptal',
        'Profil Bilgileri': 'Profil Bilgileri',
        'Ad': 'Ad',
        'Soyad': 'Soyad',
        'E-posta': 'E-posta',
        'Bildirim Ayarları': 'Bildirim Ayarları',
        'E-posta Bildirimleri': 'E-posta Bildirimleri',
        'Form yanıtları ve güncellemeler için': 'Form yanıtları ve güncellemeler için',
        'Push Bildirimleri': 'Push Bildirimleri',
        'Tarayıcı bildirimleri': 'Tarayıcı bildirimleri',
        'Haftalık Raporlar': 'Haftalık Raporlar',
        'Form performans özetleri': 'Form performans özetleri',
        'Gizlilik Ayarları': 'Gizlilik Ayarları',
        'Veri Analizi': 'Veri Analizi',
        'Anonim kullanım verilerini topla': 'Anonim kullanım verilerini topla',
        'Üçüncü Taraf Entegrasyonları': 'Üçüncü Taraf Entegrasyonları',
        'Jira, Trello gibi servisler': 'Jira, Trello gibi servisler',
        'Görünüm Ayarları': 'Görünüm Ayarları',
        'Tema': 'Tema',
        'Açık': 'Açık',
        'Koyu': 'Koyu',
        'Otomatik': 'Otomatik',
        'Renk Şeması': 'Renk Şeması',
        'Dil Ayarları': 'Dil Ayarları',
        'Arayüz Dili': 'Arayüz Dili',
        'Tarih Formatı': 'Tarih Formatı',
        'Güvenlik Ayarları': 'Güvenlik Ayarları',
        'Şifre Değiştir': 'Şifre Değiştir',
        'Mevcut şifre': 'Mevcut şifre',
        'Yeni şifre': 'Yeni şifre',
        'Yeni şifre (tekrar)': 'Yeni şifre (tekrar)',
        'Şifreyi Güncelle': 'Şifreyi Güncelle',
        'İki Faktörlü Doğrulama': 'İki Faktörlü Doğrulama',
        'Ek güvenlik için SMS veya uygulama kodu': 'Ek güvenlik için SMS veya uygulama kodu',
              'Değişiklikleri Kaydet': 'Değişiklikleri Kaydet',
      'Hesabı Sil': 'Hesabı Sil',
      'Kaydediliyor...': 'Kaydediliyor...',
      // Ana sayfa metinleri
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
      '10 dk': '10 dk'
      },
      'en': {
        'Ayarlar': 'Settings',
        'Genel': 'General',
        'Bildirimler': 'Notifications',
        'Gizlilik': 'Privacy',
        'Görünüm': 'Appearance',
        'Dil': 'Language',
        'Güvenlik': 'Security',
        'Profil Bilgileri': 'Profile Information',
        'Ad': 'First Name',
        'Soyad': 'Last Name',
        'E-posta': 'Email',
        'Bildirim Ayarları': 'Notification Settings',
        'E-posta Bildirimleri': 'Email Notifications',
        'Form yanıtları ve güncellemeler için': 'For form responses and updates',
        'Push Bildirimleri': 'Push Notifications',
        'Tarayıcı bildirimleri': 'Browser notifications',
        'Haftalık Raporlar': 'Weekly Reports',
        'Form performans özetleri': 'Form performance summaries',
        'Gizlilik Ayarları': 'Privacy Settings',
        'Veri Analizi': 'Data Analytics',
        'Anonim kullanım verilerini topla': 'Collect anonymous usage data',
        'Üçüncü Taraf Entegrasyonları': 'Third Party Integrations',
        'Jira, Trello gibi servisler': 'Services like Jira, Trello',
        'Görünüm Ayarları': 'Appearance Settings',
        'Tema': 'Theme',
        'Açık': 'Light',
        'Koyu': 'Dark',
        'Otomatik': 'Auto',
        'Renk Şeması': 'Color Scheme',
        'Dil Ayarları': 'Language Settings',
        'Arayüz Dili': 'Interface Language',
        'Tarih Formatı': 'Date Format',
        'Güvenlik Ayarları': 'Security Settings',
        'Şifre Değiştir': 'Change Password',
        'Mevcut şifre': 'Current Password',
        'Yeni şifre': 'New Password',
        'Yeni şifre (tekrar)': 'New Password (repeat)',
        'Şifreyi Güncelle': 'Update Password',
        'İki Faktörlü Doğrulama': 'Two Factor Authentication',
        'Ek güvenlik için SMS veya uygulama kodu': 'SMS or app code for additional security',
              'Değişiklikleri Kaydet': 'Save Changes',
      'Hesabı Sil': 'Delete Account',
      'Kaydediliyor...': 'Saving...',
      // Ana sayfa metinleri
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
      '10 dk': '10 min'
      },
      'de': {
        'Ayarlar': 'Einstellungen',
        'Genel': 'Allgemein',
        'Bildirimler': 'Benachrichtigungen',
        'Gizlilik': 'Privatsphäre',
        'Görünüm': 'Erscheinungsbild',
        'Dil': 'Sprache',
        'Güvenlik': 'Sicherheit',
        'Profil Bilgileri': 'Profilinformationen',
        'Ad': 'Vorname',
        'Soyad': 'Nachname',
        'E-posta': 'E-Mail',
        'Bildirim Ayarları': 'Benachrichtigungseinstellungen',
        'E-posta Bildirimleri': 'E-Mail-Benachrichtigungen',
        'Form yanıtları ve güncellemeler için': 'Für Formularantworten und Updates',
        'Push Bildirimleri': 'Push-Benachrichtigungen',
        'Tarayıcı bildirimleri': 'Browser-Benachrichtigungen',
        'Haftalık Raporlar': 'Wöchentliche Berichte',
        'Form performans özetleri': 'Formular-Leistungsübersichten',
        'Gizlilik Ayarları': 'Datenschutzeinstellungen',
        'Veri Analizi': 'Datenanalyse',
        'Anonim kullanım verilerini topla': 'Anonyme Nutzungsdaten sammeln',
        'Üçüncü Taraf Entegrasyonları': 'Drittanbieter-Integrationen',
        'Jira, Trello gibi servisler': 'Services wie Jira, Trello',
        'Görünüm Ayarları': 'Erscheinungseinstellungen',
        'Tema': 'Thema',
        'Açık': 'Hell',
        'Koyu': 'Dunkel',
        'Otomatik': 'Automatisch',
        'Renk Şeması': 'Farbschema',
        'Dil Ayarları': 'Spracheinstellungen',
        'Arayüz Dili': 'Benutzeroberfläche-Sprache',
        'Tarih Formatı': 'Datumsformat',
        'Güvenlik Ayarları': 'Sicherheitseinstellungen',
        'Şifre Değiştir': 'Passwort ändern',
        'Mevcut şifre': 'Aktuelles Passwort',
        'Yeni şifre': 'Neues Passwort',
        'Yeni şifre (tekrar)': 'Neues Passwort (wiederholen)',
        'Şifreyi Güncelle': 'Passwort aktualisieren',
        'İki Faktörlü Doğrulama': 'Zwei-Faktor-Authentifizierung',
        'Ek güvenlik için SMS veya uygulama kodu': 'SMS oder App-Code für zusätzliche Sicherheit',
        'Değişiklikleri Kaydet': 'Änderungen speichern',
        'Hesabı Sil': 'Konto löschen',
        'Kaydediliyor...': 'Speichern...',
        'Mavi': 'Blau',
        'Mor': 'Lila',
        'Yeşil': 'Grün',
        'Kırmızı': 'Rot',
        'Turuncu': 'Orange',
        'Pembe': 'Rosa',
        'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.': 'Dieser Vorgang kann nicht rückgängig gemacht werden. Alle Ihre Daten werden dauerhaft gelöscht.',
        'İptal': 'Abbrechen'
      },
      'fr': {
        'Ayarlar': 'Paramètres',
        'Genel': 'Général',
        'Bildirimler': 'Notifications',
        'Gizlilik': 'Confidentialité',
        'Görünüm': 'Apparence',
        'Dil': 'Langue',
        'Güvenlik': 'Sécurité',
        'Profil Bilgileri': 'Informations de profil',
        'Ad': 'Prénom',
        'Soyad': 'Nom de famille',
        'E-posta': 'E-mail',
        'Bildirim Ayarları': 'Paramètres de notification',
        'E-posta Bildirimleri': 'Notifications par e-mail',
        'Form yanıtları ve güncellemeler için': 'Pour les réponses de formulaire et les mises à jour',
        'Push Bildirimleri': 'Notifications push',
        'Tarayıcı bildirimleri': 'Notifications du navigateur',
        'Haftalık Raporlar': 'Rapports hebdomadaires',
        'Form performans özetleri': 'Résumés de performance des formulaires',
        'Gizlilik Ayarları': 'Paramètres de confidentialité',
        'Veri Analizi': 'Analyse de données',
        'Anonim kullanım verilerini topla': 'Collecter les données d\'utilisation anonymes',
        'Üçüncü Taraf Entegrasyonları': 'Intégrations tierces',
        'Jira, Trello gibi servisler': 'Services comme Jira, Trello',
        'Görünüm Ayarları': 'Paramètres d\'apparence',
        'Tema': 'Thème',
        'Açık': 'Clair',
        'Koyu': 'Sombre',
        'Otomatik': 'Automatique',
        'Renk Şeması': 'Schéma de couleurs',
        'Dil Ayarları': 'Paramètres de langue',
        'Arayüz Dili': 'Langue de l\'interface',
        'Tarih Formatı': 'Format de date',
        'Güvenlik Ayarları': 'Paramètres de sécurité',
        'Şifre Değiştir': 'Changer le mot de passe',
        'Mevcut şifre': 'Mot de passe actuel',
        'Yeni şifre': 'Nouveau mot de passe',
        'Yeni şifre (tekrar)': 'Nouveau mot de passe (répéter)',
        'Şifreyi Güncelle': 'Mettre à jour le mot de passe',
        'İki Faktörlü Doğrulama': 'Authentification à deux facteurs',
        'Ek güvenlik için SMS veya uygulama kodu': 'SMS ou code d\'application pour une sécurité supplémentaire',
        'Değişiklikleri Kaydet': 'Enregistrer les modifications',
        'Hesabı Sil': 'Supprimer le compte',
        'Kaydediliyor...': 'Enregistrement...',
        'Mavi': 'Bleu',
        'Mor': 'Violet',
        'Yeşil': 'Vert',
        'Kırmızı': 'Rouge',
        'Turuncu': 'Orange',
        'Pembe': 'Rose',
        'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.': 'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
        'İptal': 'Annuler'
      },
      'es': {
        'Ayarlar': 'Configuración',
        'Genel': 'General',
        'Bildirimler': 'Notificaciones',
        'Gizlilik': 'Privacidad',
        'Görünüm': 'Apariencia',
        'Dil': 'Idioma',
        'Güvenlik': 'Seguridad',
        'Profil Bilgileri': 'Información del perfil',
        'Ad': 'Nombre',
        'Soyad': 'Apellido',
        'E-posta': 'Correo electrónico',
        'Bildirim Ayarları': 'Configuración de notificaciones',
        'E-posta Bildirimleri': 'Notificaciones por correo electrónico',
        'Form yanıtları ve güncellemeler için': 'Para respuestas de formularios y actualizaciones',
        'Push Bildirimleri': 'Notificaciones push',
        'Tarayıcı bildirimleri': 'Notificaciones del navegador',
        'Haftalık Raporlar': 'Informes semanales',
        'Form performans özetleri': 'Resúmenes de rendimiento de formularios',
        'Gizlilik Ayarları': 'Configuración de privacidad',
        'Veri Analizi': 'Análisis de datos',
        'Anonim kullanım verilerini topla': 'Recopilar datos de uso anónimos',
        'Üçüncü Taraf Entegrasyonları': 'Integraciones de terceros',
        'Jira, Trello gibi servisler': 'Servicios como Jira, Trello',
        'Görünüm Ayarları': 'Configuración de apariencia',
        'Tema': 'Tema',
        'Açık': 'Claro',
        'Koyu': 'Oscuro',
        'Otomatik': 'Automático',
        'Renk Şeması': 'Esquema de colores',
        'Dil Ayarları': 'Configuración de idioma',
        'Arayüz Dili': 'Idioma de la interfaz',
        'Tarih Formatı': 'Formato de fecha',
        'Güvenlik Ayarları': 'Configuración de seguridad',
        'Şifre Değiştir': 'Cambiar contraseña',
        'Mevcut şifre': 'Contraseña actual',
        'Yeni şifre': 'Nueva contraseña',
        'Yeni şifre (tekrar)': 'Nueva contraseña (repetir)',
        'Şifreyi Güncelle': 'Actualizar contraseña',
        'İki Faktörlü Doğrulama': 'Autenticación de dos factores',
        'Ek güvenlik için SMS veya uygulama kodu': 'SMS o código de aplicación para seguridad adicional',
        'Değişiklikleri Kaydet': 'Guardar cambios',
        'Hesabı Sil': 'Eliminar cuenta',
        'Kaydediliyor...': 'Guardando...',
        'Mavi': 'Azul',
        'Mor': 'Morado',
        'Yeşil': 'Verde',
        'Kırmızı': 'Rojo',
        'Turuncu': 'Naranja',
        'Pembe': 'Rosa',
        'Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.': 'Esta acción es irreversible. Todos sus datos serán eliminados permanentemente.',
        'İptal': 'Cancelar'
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
    
    // Özel placeholder güncellemeleri
    const searchInput = document.querySelector('input[placeholder*="arama"]') as HTMLInputElement
    if (searchInput) {
      if (language === 'en') {
        searchInput.placeholder = 'AI-powered search...'
      } else {
        searchInput.placeholder = 'AI destekli arama...'
      }
    }
    
    // Tüm sayfaya dil değişikliği event'i gönder
    window.dispatchEvent(new CustomEvent('languageChanged', { 
      detail: { language } 
    }))
    
    // Sayfa başlığını güncelle
    const titles: { [key: string]: string } = {
      'tr': 'Formlar - Ayarlar',
      'en': 'Forms - Settings',
      'de': 'Formulare - Einstellungen',
      'fr': 'Formulaires - Paramètres',
      'es': 'Formularios - Configuración'
    }
    document.title = titles[language] || 'Forms - Settings'
    
    // Sayfa yeniden render edilmesini tetikle
    setTimeout(() => {
      const event = new Event('resize')
      window.dispatchEvent(event)
    }, 100)
    
    // React state güncellemelerini tetikle
    setTimeout(() => {
      const reactRefreshEvent = new CustomEvent('reactRefresh')
      window.dispatchEvent(reactRefreshEvent)
    }, 200)
  }

  // Renk şeması değişikliğini anında uygula
  const handleColorSchemeChange = (newColor: string) => {
    setAppearance(prev => ({ ...prev, colorScheme: newColor }))
    
    // LocalStorage'a kaydet
    const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
    const updatedSettings = { ...currentSettings, colorScheme: newColor }
    localStorage.setItem('userSettings', JSON.stringify(updatedSettings))
    
    // Tüm sisteme renk uygula
    applyColorToSystem(newColor)
    
    // Başarı mesajı göster
    setMessage({ type: 'success', text: `Renk şeması ${newColor} olarak değiştirildi!` })
    setTimeout(() => setMessage({ type: '', text: '' }), 2000)
  }

  // Sisteme renk uygula
  const applyColorToSystem = (colorName: string) => {
    const colorValue = getColorValue(colorName)
    
    // CSS değişkenlerini güncelle
    document.documentElement.style.setProperty('--primary-color', colorValue)
    document.documentElement.style.setProperty('--primary-color-current', colorValue)
    
    // LocalStorage'a sistem rengi olarak kaydet
    localStorage.setItem('systemColor', colorName)
    localStorage.setItem('systemColorValue', colorValue)
    
    // Tüm sayfaya renk değişikliği event'i gönder
    window.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: colorName, value: colorValue } }))
    
    // Tailwind CSS sınıflarını dinamik olarak güncelle
    updateTailwindColors(colorValue)
  }

  // Tailwind renklerini güncelle
  const updateTailwindColors = (colorValue: string) => {
    // CSS custom properties ile Tailwind renklerini override et
    const style = document.createElement('style')
    style.id = 'dynamic-colors'
    style.textContent = `
      /* Ana renk sınıfları */
      .bg-primary { background-color: ${colorValue} !important; }
      .text-primary { color: ${colorValue} !important; }
      .border-primary { border-color: ${colorValue} !important; }
      .ring-primary { --tw-ring-color: ${colorValue} !important; }
      
      /* Hover durumları */
      .hover\\:bg-primary:hover { background-color: ${colorValue} !important; }
      .hover\\:text-primary:hover { color: ${colorValue} !important; }
      .hover\\:border-primary:hover { border-color: ${colorValue} !important; }
      
      /* Focus durumları */
      .focus\\:ring-primary:focus { --tw-ring-color: ${colorValue} !important; }
      .focus\\:border-primary:focus { border-color: ${colorValue} !important; }
      
      /* Özel renk sınıfları */
      .bg-blue-600 { background-color: ${colorValue} !important; }
      .bg-purple-600 { background-color: ${colorValue} !important; }
      .bg-green-600 { background-color: ${colorValue} !important; }
      .bg-red-600 { background-color: ${colorValue} !important; }
      .bg-orange-600 { background-color: ${colorValue} !important; }
      .bg-pink-600 { background-color: ${colorValue} !important; }
      
      /* Hover durumları */
      .hover\\:bg-blue-700:hover { background-color: ${colorValue} !important; }
      .hover\\:bg-purple-700:hover { background-color: ${colorValue} !important; }
      .hover\\:bg-green-700:hover { background-color: ${colorValue} !important; }
      .hover\\:bg-red-700:hover { background-color: ${colorValue} !important; }
      .hover\\:bg-orange-700:hover { background-color: ${colorValue} !important; }
      .hover\\:bg-pink-700:hover { background-color: ${colorValue} !important; }
      
      /* Focus ring renkleri */
      .focus\\:ring-blue-500:focus { --tw-ring-color: ${colorValue} !important; }
      .focus\\:ring-purple-500:focus { --tw-ring-color: ${colorValue} !important; }
      .focus\\:ring-green-500:focus { --tw-ring-color: ${colorValue} !important; }
      .focus\\:ring-red-500:focus { --tw-ring-color: ${colorValue} !important; }
      .focus\\:ring-orange-500:focus { --tw-ring-color: ${colorValue} !important; }
      .focus\\:ring-pink-500:focus { --tw-ring-color: ${colorValue} !important; }
      
      /* Border renkleri */
      .border-blue-500 { border-color: ${colorValue} !important; }
      .border-purple-500 { border-color: ${colorValue} !important; }
      .border-green-500 { border-color: ${colorValue} !important; }
      .border-red-500 { border-color: ${colorValue} !important; }
      .border-orange-500 { border-color: ${colorValue} !important; }
      .border-pink-500 { border-color: ${colorValue} !important; }
      
      /* Text renkleri */
      .text-blue-600 { color: ${colorValue} !important; }
      .text-purple-600 { color: ${colorValue} !important; }
      .text-green-600 { color: ${colorValue} !important; }
      .text-red-600 { color: ${colorValue} !important; }
      .text-orange-600 { color: ${colorValue} !important; }
      .text-pink-600 { color: ${colorValue} !important; }
    `
    
    // Eski stil varsa kaldır
    const existingStyle = document.getElementById('dynamic-colors')
    if (existingStyle) {
      existingStyle.remove()
    }
    
    // Yeni stili ekle
    document.head.appendChild(style)
    
    // Tüm sayfadaki mevcut elementleri güncelle
    updateExistingElements(colorValue)
  }

  // Mevcut elementleri güçlü şekilde güncelle
  const updateExistingElements = (colorValue: string) => {
    // Tüm sayfadaki TÜM elementleri bul ve güncelle
    const allElements = document.querySelectorAll('*')
    
    allElements.forEach(element => {
      const el = element as HTMLElement
      const classes = el.className || ''
      
      // TÜM Background renkleri - Daha kapsamlı
      if (classes.includes('bg-blue') || classes.includes('bg-purple') || 
          classes.includes('bg-green') || classes.includes('bg-red') || 
          classes.includes('bg-orange') || classes.includes('bg-pink') ||
          classes.includes('bg-primary')) {
        el.style.backgroundColor = colorValue + ' !important'
        el.style.setProperty('background-color', colorValue, 'important')
      }
      
      // TÜM Hover background renkleri
      if (classes.includes('hover:bg-blue') || classes.includes('hover:bg-purple') || 
          classes.includes('hover:bg-green') || classes.includes('hover:bg-red') || 
          classes.includes('hover:bg-orange') || classes.includes('hover:bg-pink') ||
          classes.includes('hover:bg-primary')) {
        el.addEventListener('mouseenter', () => {
          el.style.backgroundColor = colorValue + ' !important'
        })
      }
      
      // TÜM Border renkleri
      if (classes.includes('border-blue') || classes.includes('border-purple') || 
          classes.includes('border-green') || classes.includes('border-red') || 
          classes.includes('border-orange') || classes.includes('border-pink') ||
          classes.includes('border-primary')) {
        el.style.borderColor = colorValue + ' !important'
        el.style.setProperty('border-color', colorValue, 'important')
      }
      
      // TÜM Text renkleri
      if (classes.includes('text-blue') || classes.includes('text-purple') || 
          classes.includes('text-green') || classes.includes('text-red') || 
          classes.includes('text-orange') || classes.includes('text-pink') ||
          classes.includes('text-primary')) {
        el.style.color = colorValue + ' !important'
        el.style.setProperty('color', colorValue, 'important')
      }
      
      // TÜM Focus ring renkleri
      if (classes.includes('focus:ring-blue') || classes.includes('focus:ring-purple') || 
          classes.includes('focus:ring-green') || classes.includes('focus:ring-red') || 
          classes.includes('focus:ring-orange') || classes.includes('focus:ring-pink') ||
          classes.includes('focus:ring-primary')) {
        el.style.setProperty('--tw-ring-color', colorValue, 'important')
      }
    })
    
    // CSS değişkenlerini güçlü şekilde güncelle
    document.documentElement.style.setProperty('--primary-color', colorValue, 'important')
    document.documentElement.style.setProperty('--system-primary', colorValue, 'important')
    document.documentElement.style.setProperty('--tw-primary', colorValue, 'important')
    
    // Global CSS override ekle
    const globalColorStyle = document.createElement('style')
    globalColorStyle.id = 'global-color-override'
    globalColorStyle.innerHTML = `
      * {
        --primary-color: ${colorValue} !important;
        --system-primary: ${colorValue} !important;
      }
      .bg-blue-600, .bg-blue-500, .bg-blue-400,
      .bg-purple-600, .bg-purple-500, .bg-purple-400,
      .bg-green-600, .bg-green-500, .bg-green-400,
      .bg-red-600, .bg-red-500, .bg-red-400,
      .bg-orange-600, .bg-orange-500, .bg-orange-400,
      .bg-pink-600, .bg-pink-500, .bg-pink-400 {
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
    `
    
    // Eski global stil varsa kaldır
    const existingGlobalStyle = document.getElementById('global-color-override')
    if (existingGlobalStyle) {
      existingGlobalStyle.remove()
    }
    
    // Yeni global stili ekle
    document.head.appendChild(globalColorStyle)
    
    // Tüm sayfaya renk değişikliği event'i gönder
    window.dispatchEvent(new CustomEvent('colorChanged', { 
      detail: { 
        color: getColorName(colorValue), 
        value: colorValue 
      } 
    }))
    
    // Sayfa yeniden render edilmesini tetikle
    setTimeout(() => {
      const event = new Event('resize')
      window.dispatchEvent(event)
    }, 100)
  }

  // Renk değerinden renk adını döndür
  const getColorName = (colorValue: string) => {
    const colorMap: { [key: string]: string } = {
      '#3B82F6': 'Mavi',
      '#8B5CF6': 'Mor',
      '#10B981': 'Yeşil',
      '#EF4444': 'Kırmızı',
      '#F97316': 'Turuncu',
      '#EC4899': 'Pembe'
    }
    return colorMap[colorValue] || 'Mavi'
  }

  // Sisteme tema uygula
  const applyThemeToSystem = (theme: string) => {
    // LocalStorage'a sistem teması olarak kaydet
    localStorage.setItem('systemTheme', theme)
    
    // Tema değişikliğini uygula
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else if (theme === 'auto') {
      // Sistem temasını algıla
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    // Tüm sayfaya tema değişikliği event'i gönder
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }))
  }

  // Renk değerini döndür
  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      'Mavi': '#3B82F6',
      'Mor': '#8B5CF6',
      'Yeşil': '#10B981',
      'Kırmızı': '#EF4444',
      'Turuncu': '#F97316',
      'Pembe': '#EC4899'
    }
    return colorMap[colorName] || '#3B82F6'
  }
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Sayfa yüklendiğinde mevcut ayarları yükle
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (!token) return

        // Önce localStorage'dan yükle
        const localSettings = localStorage.getItem('userSettings')
        if (localSettings) {
          const parsed = JSON.parse(localSettings)
          setNotifications({
            email: parsed.emailNotifications ?? true,
            push: parsed.pushNotifications ?? false,
            weekly: parsed.weeklyReports ?? true
          })
          setPrivacy({
            dataAnalysis: parsed.dataAnalytics ?? true,
            thirdParty: parsed.thirdPartyIntegrations ?? true
          })
          setAppearance({
            theme: parsed.theme ?? 'light',
            colorScheme: parsed.colorScheme ?? 'Mavi'
          })
          setLanguage({
            interface: parsed.language ?? 'tr',
            dateFormat: parsed.dateFormat ?? 'DD/MM/YYYY'
          })
          setSecurity({
            twoFactor: parsed.twoFactorEnabled ?? false
          })

          // Mevcut temayı uygula
          if (parsed.theme) {
            applyThemeToSystem(parsed.theme)
          }

          // Mevcut renk şemasını uygula
          if (parsed.colorScheme) {
            applyColorToSystem(parsed.colorScheme)
          }

          // Mevcut dili uygula
          if (parsed.language) {
            applyLanguageToSystem(parsed.language)
          }
        }

        // Backend'den de yüklemeye çalış
        const response = await fetch('/api/usersettings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const backendSettings = await response.json()
          setNotifications({
            email: backendSettings.emailNotifications ?? true,
            push: backendSettings.pushNotifications ?? false,
            weekly: backendSettings.weeklyReports ?? true
          })
          setPrivacy({
            dataAnalysis: backendSettings.dataAnalytics ?? true,
            thirdParty: backendSettings.thirdPartyIntegrations ?? true
          })
          setAppearance({
            theme: backendSettings.theme ?? 'light',
            colorScheme: backendSettings.colorScheme ?? 'Mavi'
          })
          setLanguage({
            interface: backendSettings.language ?? 'tr',
            dateFormat: backendSettings.dateFormat ?? 'DD/MM/YYYY'
          })
          setSecurity({
            twoFactor: backendSettings.twoFactorEnabled ?? false
          })

          // LocalStorage'ı güncelle
          localStorage.setItem('userSettings', JSON.stringify(backendSettings))
        }
      } catch (error) {
        console.log('Ayarlar yüklenirken hata:', error)
        // Hata durumunda localStorage'dan yüklenen ayarlar kullanılır
      }
    }

    loadUserSettings()
  }, [])

  const handleSaveSettings = async () => {
    setIsLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Kimlik doğrulama token\'ı bulunamadı')
      }

      // Kullanıcı ayarlarını güncelle
      const settingsData = {
        profilePicture: null,
        bio: null,
        phoneNumber: null,
        website: null,
        emailNotifications: notifications.email,
        pushNotifications: notifications.push,
        weeklyReports: notifications.weekly,
        surveyReminders: true,
        dataAnalytics: privacy.dataAnalysis,
        thirdPartyIntegrations: privacy.thirdParty,
        profileVisibility: 'public',
        theme: appearance.theme,
        colorScheme: appearance.colorScheme,
        fontSize: 'medium',
        language: language.interface,
        dateFormat: language.dateFormat,
        timeFormat: '24',
        twoFactorEnabled: security.twoFactor,
        loginNotifications: true,
        sessionTimeout: 30
      }

      // Önce mevcut ayarları kontrol et
      let response = await fetch('/api/usersettings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.status === 404) {
        // Kullanıcı ayarları yoksa oluştur
        response = await fetch('/api/usersettings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(settingsData)
        })
      } else if (response.ok) {
        // Mevcut ayarları güncelle
        response = await fetch('/api/usersettings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(settingsData)
        })
      }

      if (response.ok) {
        await response.json()
        setMessage({ type: 'success', text: 'Ayarlar başarıyla kaydedildi!' })
        
        // LocalStorage'a ayarları kaydet (fallback için)
        localStorage.setItem('userSettings', JSON.stringify(settingsData))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Ayarlar kaydedilirken bir hata oluştu')
      }
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      
    } catch (error) {
      console.error('Ayarlar kaydetme hatası:', error)
      
      // Backend hatası durumunda local olarak kaydet
      try {
        const settingsData = {
          profilePicture: null,
          bio: null,
          phoneNumber: null,
          website: null,
          emailNotifications: notifications.email,
          pushNotifications: notifications.push,
          weeklyReports: notifications.weekly,
          surveyReminders: true,
          dataAnalytics: privacy.dataAnalysis,
          thirdPartyIntegrations: privacy.thirdParty,
          profileVisibility: 'public',
          theme: appearance.theme,
          colorScheme: appearance.colorScheme,
          fontSize: 'medium',
          language: language.interface,
          dateFormat: language.dateFormat,
          timeFormat: '24',
          twoFactorEnabled: security.twoFactor,
          loginNotifications: true,
          sessionTimeout: 30
        }
        
        localStorage.setItem('userSettings', JSON.stringify(settingsData))
        setMessage({ type: 'success', text: 'Ayarlar yerel olarak kaydedildi (Backend bağlantısı yok)' })
      } catch (localError) {
        setMessage({ type: 'error', text: 'Ayarlar kaydedilemedi. Lütfen tekrar deneyin.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor!' })
      return
    }
    
    setIsLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Kimlik doğrulama token\'ı bulunamadı')
      }

      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      })

      if (response.ok) {
        const result = await response.json()
        setMessage({ type: 'success', text: result.message || 'Şifre başarıyla güncellendi!' })
        
        // Şifre alanlarını temizle
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Şifre güncellenirken bir hata oluştu')
      }
      
      // 3 saniye sonra mesajı kaldır
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      
    } catch (error) {
      console.error('Şifre güncelleme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Şifre güncellenirken bir hata oluştu.'
      setMessage({ 
        type: 'error', 
        text: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)
    setMessage({ type: '', text: '' })
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Kimlik doğrulama token\'ı bulunamadı')
      }

      // Kullanıcı profilini sil
      const response = await fetch('/api/userprofile', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Hesap başarıyla silindi!' })
        setShowDeleteConfirm(false)
        
        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          // LocalStorage'ı temizle ve login sayfasına yönlendir
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }, 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Hesap silinirken bir hata oluştu')
      }
      
    } catch (error) {
      console.error('Hesap silme hatası:', error)
      const errorMessage = error instanceof Error ? error.message : 'Hesap silinirken bir hata oluştu.'
      setMessage({ type: 'error', text: errorMessage })
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Genel', icon: <User className="w-4 h-4" /> },
    { id: 'notifications', label: 'Bildirimler', icon: <Bell className="w-4 h-4" /> },
    { id: 'privacy', label: 'Gizlilik', icon: <Shield className="w-4 h-4" /> },
    { id: 'appearance', label: 'Görünüm', icon: <Palette className="w-4 h-4" /> },
    { id: 'language', label: 'Dil', icon: <Globe className="w-4 h-4" /> },
    { id: 'security', label: 'Güvenlik', icon: <Key className="w-4 h-4" /> },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Profil Bilgileri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ad
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Soyad
                  </label>
                  <input
                    type="text"
                    value={formData.userSurname}
                    onChange={(e) => setFormData({...formData, userSurname: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({...formData, userEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bildirim Ayarları</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">E-posta Bildirimleri</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Form yanıtları ve güncellemeler için</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.email}
                    onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                    notifications.email ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200 dark:bg-gray-700'
                  } peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Push Bildirimleri</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tarayıcı bildirimleri</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.push}
                    onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                    notifications.push ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200 dark:bg-gray-700'
                  } peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Haftalık Raporlar</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Form performans özetleri</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.weekly}
                    onChange={(e) => setNotifications({...notifications, weekly: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                    notifications.weekly ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200 dark:bg-gray-700'
                  } peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                </label>
              </div>
            </div>
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gizlilik Ayarları</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Veri Analizi</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Anonim kullanım verilerini topla</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={privacy.dataAnalysis}
                    onChange={(e) => setPrivacy({...privacy, dataAnalysis: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                    privacy.dataAnalysis ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200 dark:bg-gray-700'
                  } peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Üçüncü Taraf Entegrasyonları</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jira, Trello gibi servisler</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={privacy.thirdParty}
                    onChange={(e) => setPrivacy({...privacy, thirdParty: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                    privacy.thirdParty ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200 dark:bg-gray-700'
                  } peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                </label>
              </div>
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Görünüm Ayarları</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tema
                </label>
                                 <select 
                   value={appearance.theme}
                                       onChange={(e) => {
                      const newTheme = e.target.value
                      setAppearance({...appearance, theme: newTheme})
                      
                      // LocalStorage'a kaydet
                      const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
                      const updatedSettings = { ...currentSettings, theme: newTheme }
                      localStorage.setItem('userSettings', JSON.stringify(updatedSettings))
                      
                      // Tüm sisteme tema uygula
                      applyThemeToSystem(newTheme)
                      
                      // Başarı mesajı göster
                      const themeNames: { [key: string]: string } = { 'light': 'Açık', 'dark': 'Koyu', 'auto': 'Otomatik' }
                      setMessage({ type: 'success', text: `Tema ${themeNames[newTheme] || newTheme} olarak değiştirildi!` })
                      setTimeout(() => setMessage({ type: '', text: '' }), 2000)
                    }}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="light">Açık</option>
                   <option value="dark">Koyu</option>
                   <option value="auto">Otomatik</option>
                 </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Renk Şeması
                </label>
                <div className="grid grid-cols-3 gap-3">
                                     {['Mavi', 'Mor', 'Yeşil', 'Kırmızı', 'Turuncu', 'Pembe'].map((color) => (
                     <button
                       key={color}
                       onClick={() => handleColorSchemeChange(color)}
                       className={`px-3 py-2 border rounded-lg transition-colors duration-200 ${
                         appearance.colorScheme === color
                           ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                           : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                       }`}
                     >
                       {color}
                     </button>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 'language':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dil Ayarları</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Arayüz Dili
                </label>
                                 <select 
                   value={language.interface}
                   onChange={(e) => handleLanguageChange(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="tr">Türkçe</option>
                   <option value="en">English</option>
                   <option value="de">Deutsch</option>
                   <option value="fr">Français</option>
                   <option value="es">Español</option>
                 </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tarih Formatı
                </label>
                                 <select 
                   value={language.dateFormat}
                   onChange={(e) => {
                     const newDateFormat = e.target.value
                     setLanguage({...language, dateFormat: newDateFormat})
                     
                     // LocalStorage'a kaydet
                     const currentSettings = JSON.parse(localStorage.getItem('userSettings') || '{}')
                     const updatedSettings = { ...currentSettings, dateFormat: newDateFormat }
                     localStorage.setItem('userSettings', JSON.stringify(updatedSettings))
                   }}
                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                   <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                   <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                 </select>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Güvenlik Ayarları</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Şifre Değiştir</h4>
                <div className="space-y-3">
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                    placeholder="Mevcut şifre"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="Yeni şifre"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Yeni şifre (tekrar)"
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">Şifreler eşleşmiyor!</p>
                  )}
                  <button 
                    onClick={handlePasswordUpdate}
                    disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword || formData.newPassword !== formData.confirmPassword}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Şifreyi Güncelle
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">İki Faktörlü Doğrulama</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ek güvenlik için SMS veya uygulama kodu</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={security.twoFactor}
                    onChange={(e) => setSecurity({...security, twoFactor: e.target.checked})}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer transition-all ${
                    security.twoFactor ? 'bg-blue-600 peer-checked:after:translate-x-full' : 'bg-gray-200 dark:bg-gray-700'
                  } peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h1>
            </div>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 border-r border-gray-200 dark:border-gray-700">
              <nav className="p-4">
                <ul className="space-y-2">
                  {tabs.map((tab) => (
                    <li key={tab.id}>
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {/* Message Display */}
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                }`}>
                  {message.text}
                </div>
              )}
              
              {renderTabContent()}
              
              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4 inline mr-2" />
                    Hesabı Sil
                  </button>
                  <button 
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    {isLoading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Hesabı Sil</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                İptal
              </button>
                              <button 
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Hesabı Sil
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
