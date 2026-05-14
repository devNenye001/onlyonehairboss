
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFF1EA',
      fontFamily: 'DM Sans, sans-serif',
      gap: '16px'
    }}>
      <h1 style={{ fontFamily: 'Taprom, serif', fontSize: '6rem', margin: 0, color: '#000' }}>404</h1>
      <p style={{ fontSize: '1.1rem', color: '#333' }}>Page not found.</p>
      <Link to="/" style={{
        padding: '12px 36px',
        backgroundColor: '#995544',
        color: '#FFF1EA',
        textDecoration: 'none',
        fontSize: '0.95rem',
        fontWeight: 500
      }}>
        Back to Home
      </Link>
    </div>
  )
}

export default NotFound
