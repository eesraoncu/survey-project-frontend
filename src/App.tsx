import { Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout'
import Home from './pages/Home'
import Forms from './pages/Forms'
import FormBuilder from './pages/FormBuilder'
import FormResponse from './pages/FormResponse'
import NotFound from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/forms/new" element={<FormBuilder />} />
        <Route path="/forms/:id" element={<FormResponse />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
