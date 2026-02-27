import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/AdminDashboard';
import Categories from './pages/Categories';
import Products from './pages/Products';
import Stock from './pages/Stock';
import Users from './pages/Users';
import Pos from './pages/Pos';
import Receipt from './pages/Receipt';
import KasirHistory from './pages/KasirHistory';
import KasirProfile from './pages/KasirProfile';
import KasirAbsen from './pages/KasirAbsen';
import AdminTransactions from './pages/AdminTransactions';
import AdminLayout from './components/AdminLayout'; 
import KasirLayout from './components/KasirLayout';
import AdminReports from './pages/AdminReports';
import AdminShifts from './pages/AdminShifts';
import AdminEmployees from './pages/AdminEmployees';
import AdminPayroll from './pages/AdminPayroll';
import AdminAttendance from './pages/AdminAttendance';
import AdminProfile from './pages/AdminProfile';

// 1. UPDATE SATPAM: Tambahkan logika allowedRole === 'all'
const ProtectedRoute = ({ allowedRole }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  
  // Jika aksesnya 'all', biarkan masuk. Jika tidak, cek role-nya.
  if (allowedRole !== 'all' && user.role !== allowedRole) {
    return user.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/kasir/pos" replace />;
  }
  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* ZONA ADMIN */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/products" element={<Products />} />
            <Route path="/admin/stock" element={<Stock />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            <Route path="/admin/shifts" element={<AdminShifts />} />
            <Route path="/admin/employees" element={<AdminEmployees />} />

            <Route path="/admin/payrolls" element={<AdminPayroll />} />
            <Route path="/admin/attendance-history" element={<AdminAttendance />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
          
          
        </Route>

        {/* ZONA KASIR */}
        <Route element={<ProtectedRoute allowedRole="kasir" />}>
          <Route element={<KasirLayout />}>
            <Route path="/kasir/pos" element={<Pos />} />
            <Route path="/kasir/history" element={<KasirHistory />} />
            <Route path="/kasir/absen" element={<KasirAbsen />} />
            <Route path="/kasir/profile" element={<KasirProfile />} />
          </Route>
        </Route>

        {/* 2. ZONA BERSAMA: Pindahkan Receipt ke sini (Tanpa Layout) */}
        <Route element={<ProtectedRoute allowedRole="all" />}>
          <Route path="/kasir/receipt/:id" element={<Receipt />} />
        </Route>

        <Route path="*" element={<div className="flex h-screen items-center justify-center"><h1 className="text-4xl font-bold">404 - Halaman Tidak Ditemukan</h1></div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;