import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJiraCode } from '../services/jiraService';
import { useAuth } from '../contexts/AuthContext';

const JiraCallback: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithJira } = useAuth();

  useEffect(() => {
    const handleJiraCallback = async () => {
      try {
        // Debug için URL bilgilerini logla
        console.log('Current URL:', window.location.href);
        console.log('URL Search:', window.location.search);
        console.log('URL Hash:', window.location.hash);
        
        // URL'den authorization code'u al
        const jiraCode = getJiraCode();
        console.log('Extracted code:', jiraCode);
        
        if (!jiraCode) {
          setError('Jira authorization code bulunamadı');
          setIsLoading(false);
          return;
        }

        // Backend'e login isteği gönder
        const success = await loginWithJira(jiraCode);
        
        if (success) {
          // Başarılı giriş - ana sayfaya yönlendir
          navigate('/home');
        } else {
          setError('Jira ile giriş başarısız');
        }
      } catch (err: unknown) {
        console.error('Jira callback error:', err);
        const error = err as { message?: string }
        setError(error.message || 'Jira ile giriş yapılırken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    handleJiraCallback();
  }, [navigate, loginWithJira]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Jira ile giriş yapılıyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Giriş Başarısız</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default JiraCallback;
