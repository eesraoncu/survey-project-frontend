import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Users, BarChart3, Calendar } from 'lucide-react';

const FormResponse: React.FC = () => {
  const { id } = useParams();

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 rounded-xl p-6 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">24</div>
              <div className="text-sm text-purple-700">Toplam Yanıt</div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6 text-center">
              <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">85%</div>
              <div className="text-sm text-blue-700">Tamamlanma Oranı</div>
            </div>
            
            <div className="bg-green-50 rounded-xl p-6 text-center">
              <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">156</div>
              <div className="text-sm text-green-700">Toplam Görüntü</div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-500">Bu sayfa anket yanıtlarını ve istatistiklerini gösterecek</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FormResponse;


