import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, BarChart3, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { questionService, type QuestionApiModel } from '../services/questionService';
import { surveyService, type SurveyStats } from '../services/surveyService';

const FormResponse: React.FC = () => {
  const { id } = useParams();
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionApiModel[]>([]);

  useEffect(() => {
    if (id) {
      loadSurveyStats();
      loadSurveyQuestions();
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
    loadSurveyQuestions();
  };

  const loadSurveyQuestions = async () => {
    try {
      if (!id) return;
      const surveyKey = /^[0-9]+$/.test(id) ? Number(id) : id;
      console.log('[FormResponse] Loading questions for surveyId:', surveyKey, 'raw id:', id);
      const data = await questionService.getBySurveyId(surveyKey);
      console.log('[FormResponse] Questions loaded:', data);
      setQuestions(data);
    } catch (err: any) {
      console.error('[FormResponse] Error loading questions:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-300" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Anket Yanıtları</h1>
            <p className="text-blue-200">Anket ID: {id}</p>
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
                <h2 className="text-2xl font-bold text-white">Anket İstatistikleri</h2>
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
                <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20">
                  <Users className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.totalResponses}</div>
                  <div className="text-sm text-blue-200">Toplam Yanıt</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20">
                  <BarChart3 className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.completionRate}%</div>
                  <div className="text-sm text-blue-200">Tamamlanma Oranı</div>
                </div>
                
                <div className="bg-white/10 rounded-xl p-6 text-center border border-white/20">
                  <Calendar className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
                  <div className="text-sm text-blue-200">Toplam Görüntü</div>
                </div>
              </div>

              {Array.isArray(stats.questionStats) && stats.questionStats.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-white">Soru İstatistikleri</h3>
                  {stats.questionStats.map((questionStat, index) => (
                    <div key={questionStat.questionId} className="bg-white/10 rounded-xl p-6 border border-white/20">
                      <h4 className="font-semibold text-white mb-4">{questionStat.questionTitle}</h4>
                      <div className="space-y-3">
                        {(questionStat.answers || []).map((answer, answerIndex) => (
                          <div key={answerIndex} className="flex items-center justify-between">
                            <span className="text-blue-100">{answer.answer}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-32 bg-white/20 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${answer?.percentage ?? 0}%` }}
                                />
                              </div>
                              <span className="text-sm text-blue-200 w-12 text-right">
                                {answer?.count ?? 0} ({answer?.percentage ?? 0}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Backend Questions tablosu */}
              <div className="mt-10">
                <h3 className="text-xl font-semibold text-white mb-4">Anket Soruları</h3>
                {questions.length === 0 ? (
                  <p className="text-blue-200">Bu ankete ait soru bulunamadı.</p>
                ) : (
                  <div className="space-y-3">
                    {questions.map((q) => (
                      <div key={q.id} className="p-4 bg-white/10 rounded-xl border border-white/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-white">{q.questionsText}</p>
                            <p className="text-sm text-blue-200">Tür: {q.questionType}</p>
                          </div>
                          {q.choices && q.choices.length > 0 && (
                            <div className="flex flex-wrap gap-2 max-w-md justify-end">
                              {q.choices.map((c, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-100/20 text-blue-100 rounded text-xs">{c}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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


