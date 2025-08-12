import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  const linkStyle: React.CSSProperties = {
    marginRight: 12,
    textDecoration: 'none',
  }

  const activeStyle: React.CSSProperties = {
    fontWeight: 700,
  }

  return (
    <header style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 16px' }}>
      <nav style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ fontWeight: 700, fontSize: 18 }}>
          Survey App
        </Link>
        <div style={{ marginLeft: 'auto' }}>
          <NavLink to="/" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
            Anasayfa
          </NavLink>
          <NavLink to="/forms" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
            Formlar
          </NavLink>
          <NavLink to="/forms/new" style={({ isActive }) => ({ ...linkStyle, ...(isActive ? activeStyle : {}) })}>
            Yeni Form
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default Navbar


