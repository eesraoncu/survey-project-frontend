import React, { useState } from 'react';
import { uploadService } from '../services/uploadService';
import { apiClient } from '../services/api';

const TestUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Dosya boyutu kontrolü
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      
      // Dosya tipi kontrolü
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const fileExtension = selectedFile.name.toLowerCase().split('.').pop();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!allowedTypes.includes(selectedFile.type) || !allowedExtensions.includes(fileExtension || '')) {
        setError(`Geçersiz dosya formatı. Sadece JPG, PNG, GIF ve WebP dosyaları kabul edilir. Seçilen dosya: ${selectedFile.name}`);
        return;
      }
      
      setFile(selectedFile);
      setError('');
      setResult('');
    }
  };

  const testApiConnection = async () => {
    try {
      console.log('🔍 API bağlantısı test ediliyor...');
      console.log('🔗 Base URL:', apiClient.defaults.baseURL);
      
      const response = await apiClient.get('/');
      console.log('✅ API bağlantısı başarılı:', response.data);
      setResult('API bağlantısı başarılı: ' + JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.error('❌ API bağlantı hatası:', error);
      setError('API bağlantı hatası: ' + error.message);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Lütfen bir dosya seçin');
      return;
    }

    setIsUploading(true);
    setError('');
    setResult('');

    try {
      console.log('📤 Upload test başlıyor...');
      const imageUrl = await uploadService.uploadBackgroundImage(file);
      console.log('✅ Upload başarılı:', imageUrl);
      setResult('Upload başarılı! URL: ' + imageUrl);
    } catch (error: any) {
      console.error('❌ Upload hatası:', error);
      setError('Upload hatası: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Upload Test Sayfası</h1>
        
        <div className="space-y-6">
          {/* API Bağlantı Testi */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">API Bağlantı Testi</h2>
            <button
              onClick={testApiConnection}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              API Bağlantısını Test Et
            </button>
          </div>

          {/* Dosya Seçimi */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Dosya Seçimi</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            {file && (
              <div className="mt-4 p-4 bg-white/10 rounded-lg">
                <p className="text-white">Seçilen dosya: {file.name}</p>
                <p className="text-blue-200">Boyut: {file.size} bytes</p>
                <p className="text-blue-200">Tip: {file.type}</p>
              </div>
            )}
          </div>

          {/* Upload Testi */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Upload Testi</h2>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Yükleniyor...' : 'Upload Test Et'}
            </button>
          </div>

          {/* Sonuçlar */}
          {result && (
            <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30">
              <h3 className="text-lg font-semibold text-green-300 mb-2">Başarılı</h3>
              <pre className="text-green-200 text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 rounded-xl p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Hata</h3>
              <pre className="text-red-200 text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestUpload;
