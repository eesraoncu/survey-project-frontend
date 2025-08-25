import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Calendar, 
  User, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { adminService } from '../services/adminService';

interface ActivityLog {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  resourceId: number;
  resourceType: string;
  additionalData: Record<string, string>;
  createdAt: string;
  isSuccessful: boolean;
  errorMessage: string;
  userName: string;
  userEmail: string;
}

const AdminLogs: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);

  // Admin kontrolü
  useEffect(() => {
    if (!isAdmin) {
      window.location.href = '/home';
    }
  }, [isAdmin]);

  // Logları yükle
  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 [ADMIN LOGS] Loglar yükleniyor...');
      const response = await adminService.getActivityLogs(currentPage, pageSize);
      console.log('🔍 [ADMIN LOGS] API Response:', response);
      console.log('🔍 [ADMIN LOGS] Activities count:', response.activities?.length || 0);
      console.log('🔍 [ADMIN LOGS] Total count:', response.totalCount);
      console.log('🔍 [ADMIN LOGS] Log IDs:', response.activities?.map(log => log.id) || []);
      setLogs(response.activities || []);
      setTotalCount(response.totalCount);
      console.log('✅ [ADMIN LOGS] Loglar başarıyla yüklendi');
    } catch (err: any) {
      console.error('Loglar yüklenirken hata:', err);
      setError(err.message || 'Loglar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentPage, pageSize]);

  // Log silme fonksiyonu
  const handleDeleteLog = async (logId: number) => {
    if (!confirm(`ID: ${logId} olan log kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    try {
      setDeletingLogId(logId);
      console.log('🗑️ [ADMIN LOGS] Log silme başlatılıyor:', logId);
      console.log('🗑️ [ADMIN LOGS] Mevcut loglar:', logs.map(log => ({ id: log.id, userName: log.userName })));
      
      const result = await adminService.deleteLog(logId);
      
      if (result.success) {
        console.log('🗑️ [ADMIN LOGS] Log başarıyla silindi');
        console.log('🔄 [ADMIN LOGS] Sayfa yenileniyor...');
        alert('Log başarıyla silindi!');
        // Sayfayı yenile
        window.location.reload();
      } else {
        console.error('🗑️ [ADMIN LOGS] Log silme başarısız:', result.message);
        alert(result.message || 'Log silinirken bir hata oluştu');
      }
    } catch (error: any) {
      console.error('🗑️ [ADMIN LOGS] Log silme hatası:', error);
      
      // 404 hatası için özel mesaj
      if (error.message?.includes('bulunamadı') || error.message?.includes('404')) {
        alert(`Log ID: ${logId} bulunamadı. Bu log zaten silinmiş olabilir veya mevcut değil.`);
        // Log zaten silinmiş olabilir, sayfayı yenile
        console.log('🔄 [ADMIN LOGS] 404 hatası - sayfa yenileniyor...');
        window.location.reload();
      } else {
        alert(error.message || 'Log silinirken bir hata oluştu');
      }
    } finally {
      setDeletingLogId(null);
    }
  };

  // Filtreleme fonksiyonu
  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.userName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (log.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (log.activityType?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || log.activityType === filterType;
    
    const matchesDate = !dateRange.start || !dateRange.end || 
                       (new Date(log.createdAt) >= new Date(dateRange.start) && 
                        new Date(log.createdAt) <= new Date(dateRange.end));
    
    return matchesSearch && matchesType && matchesDate;
  });

  // Aktivite türlerini al
  const activityTypes = [...new Set(logs.map(log => log.activityType).filter(Boolean))];

  // Tarih formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Aktivite türü rengi
  const getActivityColor = (type: string) => {
    if (!type) return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    
    switch (type.toLowerCase()) {
      case 'login': return 'text-green-500 bg-green-100 dark:bg-green-900/20';
      case 'logout': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'create': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
      case 'update': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'delete': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t('Loglar')}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Sistem aktivite logları
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadLogs}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Yenile</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filtreler */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Arama */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Log ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Aktivite Türü Filtresi */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Aktivite Türleri</option>
                {activityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Başlangıç Tarihi */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bitiş Tarihi */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </motion.div>

        {/* Loglar Tablosu */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600 dark:text-gray-300">Loglar yükleniyor...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="text-red-500 text-lg mb-2">Hata</div>
                <div className="text-gray-600 dark:text-gray-300">{error}</div>
                <button
                  onClick={loadLogs}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors duration-200"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                                 <thead className="bg-gray-50 dark:bg-slate-700">
                   <tr>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Kullanıcı
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Aktivite
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Açıklama
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Durum
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       IP Adresi
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       Tarih
                     </th>
                     <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       İşlemler
                     </th>
                   </tr>
                 </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                                     {filteredLogs.length === 0 ? (
                     <tr>
                       <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                         Log bulunamadı
                       </td>
                     </tr>
                   ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                                                         <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                               <span className="text-white text-sm font-semibold">
                                 {log.userName?.charAt(0)?.toUpperCase() || 'U'}
                               </span>
                             </div>
                                                         <div className="ml-3">
                               <div className="text-sm font-medium text-gray-900 dark:text-white">
                                 {log.userName || 'Bilinmeyen Kullanıcı'}
                               </div>
                               <div className="text-sm text-gray-500 dark:text-gray-400">
                                 {log.userEmail || 'E-posta yok'}
                               </div>
                             </div>
                          </div>
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivityColor(log.activityType)}`}>
                             {log.activityType || 'Bilinmeyen'}
                           </span>
                         </td>
                                                 <td className="px-6 py-4">
                           <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                             {log.description || 'Açıklama yok'}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                             log.isSuccessful 
                               ? 'text-green-500 bg-green-100 dark:bg-green-900/20' 
                               : 'text-red-500 bg-red-100 dark:bg-red-900/20'
                           }`}>
                             {log.isSuccessful ? 'Başarılı' : 'Başarısız'}
                           </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="text-sm text-gray-500 dark:text-gray-400">
                             {log.ipAddress || 'IP yok'}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap">
                           <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                             <Clock className="w-4 h-4 mr-2" />
                             {formatDate(log.createdAt)}
                           </div>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <div className="flex items-center space-x-2">
                             <button 
                               onClick={() => handleDeleteLog(log.id)}
                               disabled={deletingLogId === log.id}
                               className={`transition-colors duration-200 ${
                                 deletingLogId === log.id
                                   ? 'text-gray-400 cursor-not-allowed'
                                   : 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300'
                               }`}
                               title="Log kaydını sil"
                             >
                               <Trash2 className={`w-4 h-4 ${deletingLogId === log.id ? 'animate-pulse' : ''}`} />
                             </button>
                           </div>
                         </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* İstatistikler */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {logs.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Toplam Log
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(logs.map(log => log.userId)).size}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Aktif Kullanıcı
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activityTypes.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Aktivite Türü
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                     {logs.filter(log => {
                     const today = new Date().toDateString();
                     return new Date(log.createdAt).toDateString() === today;
                   }).length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Bugünkü Log
                </div>
              </div>
            </div>
          </div>
                 </motion.div>

         {/* Sayfalama */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6"
         >
           <div className="flex items-center justify-between">
             <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-600 dark:text-gray-300">
                 Toplam {totalCount} kayıt
               </span>
               <select
                 value={pageSize}
                 onChange={(e) => {
                   setPageSize(Number(e.target.value));
                   setCurrentPage(1);
                 }}
                 className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white"
               >
                 <option value={10}>10</option>
                 <option value={20}>20</option>
                 <option value={50}>50</option>
                 <option value={100}>100</option>
               </select>
               <span className="text-sm text-gray-600 dark:text-gray-300">
                 kayıt göster
               </span>
             </div>
             
             <div className="flex items-center space-x-2">
               <button
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
               >
                 Önceki
               </button>
               
               <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
                 Sayfa {currentPage} / {Math.ceil(totalCount / pageSize)}
               </span>
               
               <button
                 onClick={() => setCurrentPage(prev => prev + 1)}
                 disabled={currentPage >= Math.ceil(totalCount / pageSize)}
                 className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
               >
                 Sonraki
               </button>
             </div>
           </div>
         </motion.div>
       </div>
     </div>
   );
 };

export default AdminLogs;


