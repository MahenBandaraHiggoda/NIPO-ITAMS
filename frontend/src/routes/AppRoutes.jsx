import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from '../pages/dashboard/Dashboard.jsx'
import AssetList from '../pages/assets/AssetList.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/assets" element={<AssetList />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
