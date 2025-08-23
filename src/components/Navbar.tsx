import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileText, Plus, BarChart3, Settings, LogIn, LogOut, User, Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useState, useRef, useEffect } from 'react'

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
        'AI destekli arama...': 'AI destekli arama...',
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
        'AI destekli arama...': 'AI-powered search...',
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
    
    // Özel placeholder güncellemeleri
    const searchInput = document.querySelector('input[placeholder*="arama"]') as HTMLInputElement
    if (searchInput) {
      if (language === 'en') {
        searchInput.placeholder = 'AI-powered search...'
      } else {
        searchInput.placeholder = 'AI destekli arama...'
      }
    }
    
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
    { path: '/home', label: 'Ana Sayfa', icon: <FileText className="w-5 h-5" /> },
    { path: '/forms', label: 'Anketlerim', icon: <BarChart3 className="w-5 h-5" /> },
    { path: '/forms/new', label: 'Yeni Anket', icon: <Plus className="w-5 h-5" /> }
  ]







  return (
    <nav className="bg-[#1A2B6B] shadow-sm border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Sol Taraf - Logo ve Navigasyon */}
          <div className="flex items-center space-x-6">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">Formlar</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'bg-white/20 text-white'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Orta - Arama Çubuğu */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Arama yapın..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-transparent text-gray-900 placeholder-gray-500 transition-colors duration-300"
              />
            </div>
          </div>
          
          {/* Sağ Taraf - Kullanıcı Menüsü ve Araçlar */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-white">
                  <User className="w-4 h-4" />
                  <span>{user?.userName} {user?.userSurname}</span>
                </div>
                
                <button
                  onClick={() => {
                    logout()
                    navigate('/login')
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Kayıt Ol</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Giriş Yap</span>
                </Link>
              </div>
            )}
            

            

            
            {/* Ayarlar Butonu */}
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-white/10 rounded-lg text-white hover:text-white transition-colors duration-200"
            >
              <Settings className="w-5 h-5" />
            </button>
            
            {/* Profil Simgesi */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
              >
                <span className="text-white font-medium">{user?.userName?.charAt(0) || 'E'}</span>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-lg">{user?.userName?.charAt(0) || 'E'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user?.userName} {user?.userSurname}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.userEmail}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <button 
                        onClick={() => {
                          // Profil görüntüleme modal'ı açılabilir
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        Profilimi Görüntüle
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/settings')
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        Profil Düzenle
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/settings')
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        Hesap Ayarları
                      </button>
                      <button 
                        onClick={() => {
                          // Yardım sayfasına yönlendirme veya modal açma
                          setShowProfileMenu(false)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                      >
                        Yardım & Destek
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>




    </nav>
  )
}

export default Navbar


