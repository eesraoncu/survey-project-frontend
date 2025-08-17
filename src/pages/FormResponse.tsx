import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, BarChart3, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { surveyService, type SurveyStats } from '../services/surveyService';

const FormResponse: React.FC = () => {
  const { id } = useParams();
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSurveyStats();
    }
  }, [id]);

  const loadSurveyStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const statsData = await surveyService.getSurveyStats(id!);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading survey stats:', err);
      setError(err.message || 'Anket istatistikleri yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSurveyStats();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Anket Yanıtları</h1>
            <p className="text-gray-600">Anket ID: {id}</p>
          </div>

          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-300">{error}</span>
            </motion.div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-gray-600 text-lg">İstatistikler yükleniyor...</p>
              </div>
            </div>
          ) : stats ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Anket İstatistikleri</h2>
                <motion.button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Yenile</span>
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-purple-50 rounded-xl p-6 text-center">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{stats.totalResponses}</div>
                  <div className="text-sm text-purple-700">Toplam Yanıt</div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{stats.completionRate}%</div>
                  <div className="text-sm text-blue-700">Tamamlanma Oranı</div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{stats.totalViews}</div>
                  <div className="text-sm text-green-700">Toplam Görüntü</div>
                </div>
              </div>

              {stats.questionStats.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Soru İstatistikleri</h3>
                  {stats.questionStats.map((questionStat, index) => (
                    <div key={questionStat.questionId} className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">{questionStat.questionTitle}</h4>
                      <div className="space-y-3">
                        {questionStat.answers.map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex items-center justify-between">
                            <span className="text-gray-700">{answer.answer}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${answer.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 w-12 text-right">
                                {answer.count} ({answer.percentage}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">Bu anket için henüz yanıt bulunmuyor</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FormResponse;


