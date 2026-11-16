import { useQuery } from '@tanstack/react-query'
import { Alert, Box, Button, CircularProgress, Paper, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import { useNavigate } from 'react-router-dom'
import { getAssets, getDashboardSummary, getApiError } from '../../services/api.js'

export default function DashboardPage() {
  const navigate = useNavigate()
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: getDashboardSummary })
  const assets = useQuery({ queryKey: ['assets', 'recent'], queryFn: () => getAssets({ page: 0, size: 5, sort: 'updatedAt', direction: 'DESC' }) })
  const cards = [
    { title: 'Total assets', value: summary.data?.totalAssets, icon: Inventory2OutlinedIcon, tone: 'blue' },
    { title: 'Available', value: summary.data?.availableAssets, icon: CheckCircleOutlineRoundedIcon, tone: 'green' },
    { title: 'Assigned', value: summary.data?.assignedAssets, icon: AssignmentTurnedInOutlinedIcon, tone: 'violet' },
    { title: 'In maintenance', value: summary.data?.underMaintenance, icon: BuildOutlinedIcon, tone: 'amber' },
  ]
  return <>
    <div className="page-heading"><div><div className="eyebrow">{new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()).toUpperCase()}</div><Typography variant="h4">Asset overview</Typography><p>Here’s an overview of your IT asset register.</p></div><Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/assets?create=1')}>Add asset</Button></div>
    {summary.isError && <Alert severity="error" sx={{ mb: 2 }}>{getApiError(summary.error)}</Alert>}
    <div className="stat-grid">{cards.map(({ title, value, icon: Icon, tone }) => <Paper className="stat-card" key={title} elevation={0}><div className={`stat-icon ${tone}`}><Icon /></div><div><div className="stat-value">{summary.isLoading ? <CircularProgress size={22} /> : value ?? '—'}</div><div className="stat-label">{title}</div></div><span className="stat-period">LIVE</span></Paper>)}</div>
    <div className="section-heading"><div><Typography variant="h6">Recently updated assets</Typography><p>Latest records from your asset register</p></div><Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate('/assets')}>View all assets</Button></div>
    <Paper className="table-paper" elevation={0}>
      {assets.isLoading ? <div className="loading-state"><CircularProgress size={26} /></div> : assets.isError ? <Alert severity="error">{getApiError(assets.error)}</Alert> : assets.data?.content?.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>ASSET</th><th>CATEGORY</th><th>DEPARTMENT</th><th>STATUS</th><th>LOCATION</th></tr></thead><tbody>{assets.data.content.map((asset) => <tr key={asset.id} onClick={() => navigate('/assets')}><td><strong>{asset.assetName}</strong><small>{asset.assetCode}</small></td><td>{asset.category || '—'}</td><td>{asset.department || '—'}</td><td><span className={`status-pill ${asset.status?.toLowerCase()}`}>{asset.status?.replaceAll('_', ' ')}</span></td><td>{asset.location || '—'}</td></tr>)}</tbody></table></div> : <div className="empty-state"><Box className="empty-icon"><Inventory2OutlinedIcon /></Box><Typography variant="subtitle1">Your register is ready</Typography><p>Add your first asset to see it appear here.</p><Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => navigate('/assets?create=1')}>Add your first asset</Button></div>}
    </Paper>
    <div className="notice-strip"><span className="notice-dot" /><div><strong>Build in progress</strong><span>Asset register is active. Other modules are being mapped to the approved project requirements.</span></div></div>
  </>
}
