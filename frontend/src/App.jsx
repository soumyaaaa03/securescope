import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import History from './pages/History'

export default function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar page={page} setPage={setPage} />
      {page === 'home' ? <Home /> : <History />}
    </div>
  )
}