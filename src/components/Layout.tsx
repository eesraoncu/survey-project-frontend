import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const Layout = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20">
        <Outlet />
      </div>
    </div>
  )
}

export default Layout


