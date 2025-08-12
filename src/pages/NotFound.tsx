import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section>
      <h2>Sayfa Bulunamadı</h2>
      <p>
        Anasayfaya dönmek için <Link to="/">tıklayın</Link>.
      </p>
    </section>
  )
}

export default NotFound


