import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 980, margin: '0 auto', padding: '1.25rem' }}>
        <Outlet />
      </main>
    </>
  );
}
