import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function Layout() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '16px', maxWidth: 960, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout


