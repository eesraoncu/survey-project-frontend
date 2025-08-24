import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileText, Plus, BarChart3, Settings, LogIn, LogOut, User, Globe, Menu, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useEffect, useState } from 'react'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Sistem değişikliklerini dinle
  useEffect(() => {
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('Dil değişti:', event.detail.language)
      updateNavbarLanguage(event.detail.language)
    }

    const handleColorChange = (event: CustomEvent) => {
      console.log('Renk değişti:', event.detail.color, event.detail.value)
      updateNavbarColors(event.detail.value)
    }

    const handleThemeChange = (event: CustomEvent) => {
      console.log('Tema değişti:', event.detail.theme)
      // Tema değişikliği otomatik olarak CSS ile uygulanır
    }

    window.addEventListener('languageChanged', handleLanguageChange as EventListener)
    window.addEventListener('colorChanged', handleColorChange as EventListener)
    window.addEventListener('themeChanged', handleThemeChange as EventListener)

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener)
      window.removeEventListener('colorChanged', handleColorChange as EventListener)
      window.removeEventListener('themeChanged', handleThemeChange as EventListener)
    }
  }, [])

  // Navbar dilini güncelle
  const updateNavbarLanguage = (language: string) => {
    const translations: { [key: string]: { [key: string]: string } } = {
      'tr': {
        'Ana Sayfa': 'Ana Sayfa',
        'Anketlerim': 'Anketlerim',
        'Yeni Anket': 'Yeni Anket',

        'Çıkış Yap': 'Çıkış Yap',
        'Kayıt Ol': 'Kayıt Ol',
        'Giriş Yap': 'Giriş Yap',
        'Formlar': 'Formlar',
        'Takvim': 'Takvim',
        'Bugün': 'Bugün',
        'Yarın': 'Yarın',
        'Henüz etkinlik yok': 'Henüz etkinlik yok',
        'Yeni Etkinlik Ekle': 'Yeni Etkinlik Ekle',
        'Etkinlik Adı': 'Etkinlik Adı',
        'Etkinlik adını girin': 'Etkinlik adını girin',
        'Tarih': 'Tarih',
        'Başlangıç Saati': 'Başlangıç Saati',
        'Bitiş Saati': 'Bitiş Saati',
        'Açıklama': 'Açıklama',
        'Etkinlik açıklaması': 'Etkinlik açıklaması',
        'İptal': 'İptal',
        'Etkinlik Ekle': 'Etkinlik Ekle',
        'Profilimi Görüntüle': 'Profilimi Görüntüle',
        'Profil Düzenle': 'Profil Düzenle',
        'Hesap Ayarları': 'Hesap Ayarları',
        'Yardım & Destek': 'Yardım & Destek'
      },
      'en': {
        'Ana Sayfa': 'Home',
        'Anketlerim': 'My Forms',
        'Yeni Anket': 'New Form',

        'Çıkış Yap': 'Logout',
        'Kayıt Ol': 'Register',
        'Giriş Yap': 'Login',
        'Formlar': 'Forms',
        'Takvim': 'Calendar',
        'Bugün': 'Today',
        'Yarın': 'Tomorrow',
        'Henüz etkinlik yok': 'No events yet',
        'Yeni Etkinlik Ekle': 'Add New Event',
        'Etkinlik Adı': 'Event Name',
        'Etkinlik adını girin': 'Enter event name',
        'Tarih': 'Date',
        'Başlangıç Saati': 'Start Time',
        'Bitiş Saati': 'End Time',
        'Açıklama': 'Description',
        'Etkinlik açıklaması': 'Event description',
        'İptal': 'Cancel',
        'Etkinlik Ekle': 'Add Event',
        'Profilimi Görüntüle': 'View Profile',
        'Profil Düzenle': 'Edit Profile',
        'Hesap Ayarları': 'Account Settings',
        'Yardım & Destek': 'Help & Support'
      },
      'de': {
        'Ana Sayfa': 'Startseite',
        'Ayarlar': 'Einstellungen',
        'Çıkış Yap': 'Abmelden',
        'Kayıt Ol': 'Registrieren',
        'Giriş Yap': 'Anmelden',
        'Formlar': 'Formulare',
        'Takvim': 'Kalender',
        'Bugün': 'Heute',
        'Yarın': 'Morgen',
        'Henüz etkinlik yok': 'Noch keine Ereignisse',
        'Yeni Etkinlik Ekle': 'Neues Ereignis hinzufügen',
        'Etkinlik Adı': 'Ereignisname',
        'Etkinlik adını girin': 'Ereignisname eingeben',
        'Tarih': 'Datum',
        'Başlangıç Saati': 'Startzeit',
        'Bitiş Saati': 'Endzeit',
        'Açıklama': 'Beschreibung',
        'Etkinlik açıklaması': 'Ereignisbeschreibung',
        'İptal': 'Abbrechen',
        'Etkinlik Ekle': 'Ereignis hinzufügen',
        'Profilimi Görüntüle': 'Profil anzeigen',
        'Profil Düzenle': 'Profil bearbeiten',
        'Hesap Ayarları': 'Kontoeinstellungen',
        'Yardım & Destek': 'Hilfe & Support'
      },
      'fr': {
        'Ana Sayfa': 'Accueil',
        'Ayarlar': 'Paramètres',
        'Çıkış Yap': 'Se déconnecter',
        'Kayıt Ol': 'S\'inscrire',
        'Giriş Yap': 'Se connecter',
        'Formlar': 'Formulaires',
        'Takvim': 'Calendrier',
        'Bugün': 'Aujourd\'hui',
        'Yarın': 'Demain',
        'Henüz etkinlik yok': 'Aucun événement pour le moment',
        'Yeni Etkinlik Ekle': 'Ajouter un nouvel événement',
        'Etkinlik Adı': 'Nom de l\'événement',
        'Etkinlik adını girin': 'Entrez le nom de l\'événement',
        'Tarih': 'Date',
        'Başlangıç Saati': 'Heure de début',
        'Bitiş Saati': 'Heure de fin',
        'Açıklama': 'Description',
        'Etkinlik açıklaması': 'Description de l\'événement',
        'İptal': 'Annuler',
        'Etkinlik Ekle': 'Ajouter l\'événement',
        'Profilimi Görüntüle': 'Voir le profil',
        'Profil Düzenle': 'Modifier le profil',
        'Hesap Ayarları': 'Paramètres du compte',
        'Yardım & Destek': 'Aide & Support'
      },
      'es': {
        'Ana Sayfa': 'Inicio',
        'Ayarlar': 'Configuración',
        'Çıkış Yap': 'Cerrar sesión',
        'Kayıt Ol': 'Registrarse',
        'Giriş Yap': 'Iniciar sesión',
        'Formlar': 'Formularios',
        'Takvim': 'Calendario',
        'Bugün': 'Hoy',
        'Yarın': 'Mañana',
        'Henüz etkinlik yok': 'Aún no hay eventos',
        'Yeni Etkinlik Ekle': 'Agregar nuevo evento',
        'Etkinlik Adı': 'Nombre del evento',
        'Etkinlik adını girin': 'Ingrese el nombre del evento',
        'Tarih': 'Fecha',
        'Başlangıç Saati': 'Hora de inicio',
        'Bitiş Saati': 'Hora de fin',
        'Açıklama': 'Descripción',
        'Etkinlik açıklaması': 'Descripción del evento',
        'İptal': 'Cancelar',
        'Etkinlik Ekle': 'Agregar evento',
        'Profilimi Görüntüle': 'Ver perfil',
        'Profil Düzenle': 'Editar perfil',
        'Hesap Ayarları': 'Configuración de cuenta',
        'Yardım & Destek': 'Ayuda y soporte'
      }
    }

    const currentTranslations = translations[language] || translations['tr']
    
    // GÜÇLÜ Navbar metinlerini güncelle
    Object.keys(currentTranslations).forEach(turkishText => {
      const translatedText = currentTranslations[turkishText]
      
      // Tüm text node'ları bul ve güncelle (navbar için özellikle)
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
        
        // Navbar özel elementleri
        if (element.classList.contains('nav-item') || element.closest('nav')) {
          if (element.textContent?.trim() === turkishText) {
            element.textContent = translatedText
          }
        }
        
        // Placeholder'ları güncelle
        if (element instanceof HTMLInputElement && element.placeholder === turkishText) {
          element.placeholder = translatedText
        }
      })
    })
    

    
    // Tüm sayfayı yeniden render etmeyi tetikle
    setTimeout(() => {
      const event = new Event('resize')
      window.dispatchEvent(event)
    }, 50)
  }

  // GÜÇLÜ Navbar renklerini güncelle
  const updateNavbarColors = (colorValue: string) => {
    // Tüm sayfadaki TÜM elementleri bul ve güçlü şekilde güncelle
    const allElements = document.querySelectorAll('*')
    
    allElements.forEach(element => {
      const el = element as HTMLElement
      const classes = el.className || ''
      
      // TÜM Background renkleri - GÜÇLÜ güncelleme
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
          classes.includes('hover:bg-orange') || classes.includes('hover:bg-pink')) {
        el.addEventListener('mouseenter', () => {
          el.style.backgroundColor = colorValue + ' !important'
        })
      }
      
      // TÜM Border renkleri
      if (classes.includes('border-blue') || classes.includes('border-purple') || 
          classes.includes('border-green') || classes.includes('border-red') || 
          classes.includes('border-orange') || classes.includes('border-pink')) {
        el.style.borderColor = colorValue + ' !important'
        el.style.setProperty('border-color', colorValue, 'important')
      }
      
      // TÜM Text renkleri
      if (classes.includes('text-blue') || classes.includes('text-purple') || 
          classes.includes('text-green') || classes.includes('text-red') || 
          classes.includes('text-orange') || classes.includes('text-pink')) {
        el.style.color = colorValue + ' !important'
        el.style.setProperty('color', colorValue, 'important')
      }
      
      // TÜM Focus ring renkleri
      if (classes.includes('focus:ring-blue') || classes.includes('focus:ring-purple') || 
          classes.includes('focus:ring-green') || classes.includes('focus:ring-red') || 
          classes.includes('focus:ring-orange') || classes.includes('focus:ring-pink')) {
        el.style.setProperty('--tw-ring-color', colorValue, 'important')
      }
    })
    
    // CSS değişkenlerini GÜÇLÜ şekilde güncelle
    document.documentElement.style.setProperty('--primary-color', colorValue, 'important')
    document.documentElement.style.setProperty('--system-primary', colorValue, 'important')
    document.documentElement.style.setProperty('--tw-primary', colorValue, 'important')
    
    // Global CSS override ekle (Navbar için de)
    const navbarColorStyle = document.createElement('style')
    navbarColorStyle.id = 'navbar-color-override'
    navbarColorStyle.innerHTML = `
      nav *, header *, .navbar * {
        --primary-color: ${colorValue} !important;
      }
      nav .bg-blue-600, nav .bg-blue-500, nav .bg-blue-400,
      nav .bg-purple-600, nav .bg-purple-500, nav .bg-purple-400,
      nav .bg-green-600, nav .bg-green-500, nav .bg-green-400,
      nav .bg-red-600, nav .bg-red-500, nav .bg-red-400,
      nav .bg-orange-600, nav .bg-orange-500, nav .bg-orange-400,
      nav .bg-pink-600, nav .bg-pink-500, nav .bg-pink-400 {
        background-color: ${colorValue} !important;
      }
    `
    
    // Eski navbar stil varsa kaldır
    const existingNavbarStyle = document.getElementById('navbar-color-override')
    if (existingNavbarStyle) {
      existingNavbarStyle.remove()
    }
    
    // Yeni navbar stili ekle
    document.head.appendChild(navbarColorStyle)
  }

  const navItems = [
    { path: '/home', label: language === 'en' ? 'Home' : 'Ana Sayfa', icon: <FileText className="w-4 h-4" /> },
    { path: '/forms', label: language === 'en' ? 'My Forms' : 'Anketlerim', icon: <BarChart3 className="w-4 h-4" /> },
    { path: '/form-builder', label: language === 'en' ? 'New Form' : 'Yeni Anket', icon: <Plus className="w-4 h-4" /> }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700/60 shadow-lg shadow-slate-900/30 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Sol Taraf - Logo ve Navigasyon */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link to="/home" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-white via-blue-300 to-indigo-400 bg-clip-text text-transparent">
                  {language === 'en' ? 'FormFlow' : 'Formlar'}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {language === 'en' ? 'Survey Platform' : 'Anket Platformu'}
                </span>
              </div>
            </Link>
            
            {/* Ana navigasyon linkleri - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'text-blue-300 bg-blue-900/20 shadow-sm'
                      : 'text-slate-300 hover:text-blue-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {location.pathname === item.path && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full shadow-sm"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Sağ Taraf - Kullanıcı Menüsü ve Araçlar */}
          <div className="flex items-center space-x-3">
            {/* Dil Değiştirme Butonu */}
            <button
              onClick={() => setLanguage(language === 'tr' ? 'en' : 'tr')}
              title={language === 'tr' ? 'Switch to English' : 'Türkçeye geç'}
              className="relative p-2.5 hover:bg-slate-800/50 rounded-xl text-slate-300 hover:text-blue-300 transition-all duration-200 group"
            >
              <Globe className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                {language === 'tr' ? 'EN' : 'TR'}
              </span>
            </button>

            {/* Ayarlar Butonu */}
            <button 
              onClick={() => navigate('/settings')}
              className="p-2.5 hover:bg-slate-800/50 rounded-xl text-slate-300 hover:text-blue-300 transition-all duration-200 group"
            >
              <Settings className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </button>

            {isAuthenticated ? (
              <>
                {/* Kullanıcı Bilgisi */}
                <div className="hidden sm:flex items-center space-x-3 px-4 py-2.5 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-700/50 transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold text-sm">{user?.userName?.charAt(0) || 'U'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">
                      {user?.userName} {user?.userSurname}
                    </span>
                    <span className="text-xs text-slate-400">
                      {language === 'en' ? 'Online' : 'Çevrimiçi'}
                    </span>
                  </div>
                </div>
                
                {/* Çıkış Butonu */}
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 group"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Logout' : 'Çıkış Yap'}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Kayıt Ol Butonu */}
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 group"
                >
                  <User className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Register' : 'Kayıt Ol'}</span>
                </Link>
                
                {/* Giriş Yap Butonu */}
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 group"
                >
                  <LogIn className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Login' : 'Giriş Yap'}</span>
                </Link>
              </div>
            )}

            {/* Mobil Menü Butonu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 hover:bg-slate-800/50 rounded-xl text-slate-300 hover:text-blue-300 transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobil Menü */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-blue-300 bg-blue-900/20 shadow-sm'
                      : 'text-slate-300 hover:text-blue-300 hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar


