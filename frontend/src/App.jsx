import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'
import Navbar from './components/Navbar'
import { Toaster } from 'react-hot-toast'
import useUserStore from './stores/useUserStore'
import { useEffect } from 'react'
import LoadingSpinner from './components/LoadingSpinner'
import CategoryPage from './pages/CategoryPage'
import CartPage from './pages/CartPage'
import { useCartStore } from './stores/useCartStore'
import PurchaseSuccess from './pages/PurchaseSuccess'
import PurchaseCancel from './pages/PurchaseCancel'

function App() {
  const {user, checkAuth, checkingAuth} = useUserStore();
  const {getCartItems} = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    getCartItems();
  }, [getCartItems])

  if(checkingAuth) return <LoadingSpinner />;
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
            <Route path='/signup' element={user ? <Navigate to={'/'}/> : <SignupPage />} />
            <Route path='/login' element={user ? <Navigate to={'/'}/> : <LoginPage />} />
            <Route path='/secret-dashboard' element={true ? <AdminPage /> : <Navigate to={'/'}/>} /> //TODO:: add admin check
            <Route path='/category/:category' element={<CategoryPage />} />
            <Route path='/cart' element={user ? <CartPage /> : <Navigate to={'/login'} />} />
            <Route path='/success' element={user ? <PurchaseSuccess /> : <Navigate to={'/login'} />} />
            <Route path='/purchase-cancel' element={user ? <PurchaseCancel /> : <Navigate to={'/login'} />} />
          </Routes>
        </div>
        <Toaster />
      </div>
    </>
  )
}

export default App
