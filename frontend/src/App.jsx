import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded'
import BuildRoundedIcon from '@mui/icons-material/BuildRounded'
import AppsRoundedIcon from '@mui/icons-material/AppsRounded'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardPage from './features/dashboard/DashboardPage.jsx'
import AssetsPage from './features/assets/AssetsPage.jsx'
import Login from './pages/auth/Login.jsx' // ADDED

const drawerWidth = 264
const navigation = [
  { label: 'Overview', path: '/', icon: DashboardRoundedIcon, group: 'WORKSPACE' },
  { label: 'Asset register', path: '/assets', icon: Inventory2RoundedIcon, group: 'MANAGEMENT' },
  { label: 'Computers & hardware', icon: DevicesRoundedIcon, group: 'MANAGEMENT' },
  { label: 'Employees & departments', icon: GroupsRoundedIcon, group: 'MANAGEMENT' },
  { label: 'Assignments & transfers', icon: AssignmentIndRoundedIcon, group: 'MANAGEMENT' },
  { label: 'Maintenance', icon: BuildRoundedIcon, group: 'MANAGEMENT' },
  { label: 'Software & licenses', icon: AppsRoundedIcon, group: 'MANAGEMENT' },
  { label: 'Reports', icon: AssessmentRoundedIcon, group: 'INSIGHTS' },
  { label: 'Settings', icon: SettingsRoundedIcon, group: 'SYSTEM' },
]

export default function App() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  if (location.pathname === '/login') return <Login /> // ADDED
  return <Box className="app-shell">
    <Drawer variant="permanent" className="sidebar desktop-sidebar" sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}>
      <Brand /> <Navigation location={location} navigate={navigate} />
      <Box className="sidebar-footer"><span className="online-dot" /> Development workspace <small>IT ASSET MANAGEMENT</small></Box>
    </Drawer>
    <Drawer open={open} onClose={() => setOpen(false)} className="mobile-sidebar" sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}>
      <Brand /><Navigation location={location} navigate={navigate} onSelect={() => setOpen(false)} />
    </Drawer>
    <Box component="main" className="main-area" sx={{ ml: { md: `${drawerWidth}px` } }}>
      <header className="topbar"><Toolbar disableGutters>
        <IconButton onClick={() => setOpen(true)} className="mobile-menu" aria-label="Open navigation"><MenuRoundedIcon /></IconButton>
        <div className="crumb"><span>Workspace</span><b>/</b>{location.pathname === '/assets' ? 'Asset register' : 'Overview'}</div>
        <div className="topbar-right"><span className="topbar-label">National Intellectual Property Office</span><div className="user-avatar">IT</div></div>
      </Toolbar></header>
      <Box className="page-content"><Routes><Route path="/" element={<DashboardPage />} /><Route path="/assets" element={<AssetsPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></Box>
    </Box>
  </Box>
}

function Brand() { return <Box className="brand"><div className="brand-mark">N</div><div><Typography className="brand-name">NIPO<span>·</span>ITAMS</Typography><Typography className="brand-caption">ASSET MANAGEMENT</Typography></div></Box> }

function Navigation({ location, navigate, onSelect }) {
  let lastGroup = ''
  return <List className="nav-list">{navigation.map((item) => {
    const Icon = item.icon
    const header = item.group !== lastGroup
    lastGroup = item.group
    return <Box key={item.label}>{header && <Typography className="nav-group">{item.group}</Typography>}
      <ListItemButton selected={item.path === location.pathname} onClick={() => { if (item.path) navigate(item.path); onSelect?.() }} className={!item.path ? 'nav-disabled' : ''}>
        <ListItemIcon><Icon fontSize="small" /></ListItemIcon><ListItemText primary={item.label} />
        {!item.path && <span className="soon-tag">SOON</span>}
      </ListItemButton>
    </Box>
  })}</List>
}