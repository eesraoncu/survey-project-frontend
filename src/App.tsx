import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Forms from './pages/Forms'
import FormBuilder from './pages/FormBuilder'
import AIFormBuilder from './pages/AIFormBuilder'
import FormResponse from './pages/FormResponse'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      {/* Login sayfası layout dışında, ilk açılış rotası */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Tüm uygulama layout'u */}
      <Route element={<Layout />}>
        {/* Ana route'u login'e yönlendir */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Eski ana sayfayı /home altına taşıdık */}
        <Route path="/home" element={<Home />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/form-builder" element={<FormBuilder />} />
        <Route path="/ai-form-builder" element={<AIFormBuilder />} />
        <Route path="/forms/new" element={<FormBuilder />} />
        <Route path="/forms/:id" element={<FormResponse />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
