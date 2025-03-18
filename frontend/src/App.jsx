import { Route, Routes } from 'react-router-dom'
import './App.css'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import Navbar from './components/Navbar'

function App() {

  return (
    <>
      <div className='min-h-screen bg-gray-900 text-white overflow-hidden'>
        {/*
          Background gradient
        */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute inset-0'>
            <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-radial-ellipse-at-top from-[rgba(16,185,129,0.3)] via-[rgba(10,80,60,0.2)] to-[rgba(0,0,0,0.1)]'></div>
          </div>
        </div>
        <div className='relative z-50 pt-20'>
          <Navbar />
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/signup' element={<SignupPage />} />
            <Route path='/login' element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

export default App
