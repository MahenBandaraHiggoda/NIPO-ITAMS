import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Snackbar, TextField, Typography } from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import { useForm } from 'react-hook-form'
import { getApiError, getAssets, retireAsset, saveAsset } from '../../services/api.js'

const emptyAsset = { assetCode: '', assetName: '', category: '', type: '', brand: '', model: '', serialNumber: '', purchaseDate: '', purchaseCost: '', supplier: '', warrantyStart: '', warrantyExpiry: '', department: '', location: '', status: 'AVAILABLE', description: '' }
const statuses = ['ACTIVE', 'AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'RETIRED']

export default function AssetsPage() {
  const queryClient = useQueryClient()
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [feedback, setFeedback] = useState('')
  const form = useForm({ defaultValues: emptyAsset })
  const assets = useQuery({ queryKey: ['assets', { search, status, page }], queryFn: () => getAssets({ search, status: status || undefined, page, size: 10, sort: 'updatedAt', direction: 'DESC' }) })
  const save = useMutation({ mutationFn: (values) => saveAsset(values, editing?.id), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assets'] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); setDialogOpen(false); setFeedback(editing ? 'Asset updated.' : 'Asset added.'); form.reset(emptyAsset) } })
  const retire = useMutation({ mutationFn: retireAsset, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['assets'] }); queryClient.invalidateQueries({ queryKey: ['dashboard'] }); setFeedback('Asset retired.') } })
  useEffect(() => { if (new URLSearchParams(window.location.search).get('create') === '1') openCreate() }, [])

  function openCreate() { setEditing(null); form.reset(emptyAsset); setDialogOpen(true) }
  function openEdit(asset) {
    setEditing(asset)
    form.reset(Object.fromEntries(Object.entries({ ...emptyAsset, ...asset }).map(([key, value]) => [key, value ?? ''])))
    setDialogOpen(true)
  }
  function submit(values) {
    const normalized = { ...values, purchaseCost: values.purchaseCost === '' ? null : Number(values.purchaseCost) }
    Object.keys(normalized).forEach((key) => { if (normalized[key] === '') normalized[key] = null })
    save.mutate(normalized)
  }
  function runSearch(event) { event.preventDefault(); setPage(0); setSearch(searchInput.trim()) }

  return <>
    <div className="page-heading"><div><div className="eyebrow">MANAGEMENT / ASSETS</div><Typography variant="h4">Asset register</Typography><p>Track and manage equipment across the organisation.</p></div><Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openCreate}>Add asset</Button></div>
    {assets.isError && <Alert severity="error" sx={{ mb: 2 }}>{getApiError(assets.error)}</Alert>}
    {save.isError && <Alert severity="error" sx={{ mb: 2 }}>{getApiError(save.error)}</Alert>}
    {retire.isError && <Alert severity="error" sx={{ mb: 2 }}>{getApiError(retire.error)}</Alert>}
    <div className="toolbar"><form className="search-form" onSubmit={runSearch}><SearchRoundedIcon /><input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name, code, serial number…" aria-label="Search assets" /><button type="submit">Search</button></form><TextField select size="small" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }} className="status-filter"><MenuItem value="">All statuses</MenuItem>{statuses.map((s) => <MenuItem value={s} key={s}>{s.replaceAll('_', ' ')}</MenuItem>)}</TextField><span className="result-count">{assets.data?.totalElements ?? 0} assets</span></div>
    <div className="table-paper asset-table-paper">
      {assets.isLoading ? <div className="loading-state"><CircularProgress size={26} /></div> : assets.data?.content?.length ? <><div className="table-scroll"><table className="data-table"><thead><tr><th>ASSET</th><th>CATEGORY / TYPE</th><th>DEPARTMENT</th><th>STATUS</th><th>LOCATION</th><th></th></tr></thead><tbody>{assets.data.content.map((asset) => <tr key={asset.id}><td><strong>{asset.assetName}</strong><small>{asset.assetCode}{asset.serialNumber ? ` · ${asset.serialNumber}` : ''}</small></td><td>{asset.category || '—'}<small>{asset.type || ''}</small></td><td>{asset.department || '—'}</td><td><span className={`status-pill ${asset.status.toLowerCase()}`}>{asset.status.replaceAll('_', ' ')}</span></td><td>{asset.location || '—'}</td><td className="row-actions"><button onClick={() => openEdit(asset)}>Edit</button>{asset.status !== 'RETIRED' && <button className="retire-action" onClick={() => { if (window.confirm(`Retire ${asset.assetName}?`)) retire.mutate(asset.id) }}>Retire</button>}</td></tr>)}</tbody></table></div><div className="pagination"><span>Showing {assets.data.numberOfElements ? page * 10 + 1 : 0}–{page * 10 + (assets.data.numberOfElements || 0)} of {assets.data.totalElements}</span><div><Button size="small" disabled={page === 0 || assets.isFetching} onClick={() => setPage((v) => v - 1)}>Previous</Button><Button size="small" disabled={assets.data.last || assets.isFetching} onClick={() => setPage((v) => v + 1)}>Next</Button></div></div></> : <div className="empty-state"><div className="empty-icon"><Inventory2OutlinedIcon /></div><Typography variant="subtitle1">No assets found</Typography><p>Try a different search or add an asset to the register.</p><Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={openCreate}>Add asset</Button></div>}
    </div>
    <Dialog open={dialogOpen} onClose={() => !save.isPending && setDialogOpen(false)} fullWidth maxWidth="md"><form onSubmit={form.handleSubmit(submit)}><DialogTitle>{editing ? 'Edit asset' : 'Add an asset'}</DialogTitle><DialogContent><p className="dialog-intro">Enter the identifying details and current status for this asset.</p><div className="form-grid">
      <TextField label="Asset code *" {...form.register('assetCode', { required: 'Asset code is required', maxLength: 40 })} error={!!form.formState.errors.assetCode} helperText={form.formState.errors.assetCode?.message} />
      <TextField label="Asset name *" {...form.register('assetName', { required: 'Asset name is required', maxLength: 160 })} error={!!form.formState.errors.assetName} helperText={form.formState.errors.assetName?.message} />
      <TextField label="Category" {...form.register('category')} /><TextField label="Type" {...form.register('type')} />
      <TextField label="Brand" {...form.register('brand')} /><TextField label="Model" {...form.register('model')} />
      <TextField label="Serial number" {...form.register('serialNumber')} /><TextField label="Status" select defaultValue="AVAILABLE" {...form.register('status')}>{statuses.map((s) => <MenuItem value={s} key={s}>{s.replaceAll('_', ' ')}</MenuItem>)}</TextField>
      <TextField label="Purchase date" type="date" InputLabelProps={{ shrink: true }} {...form.register('purchaseDate')} /><TextField label="Purchase cost" type="number" inputProps={{ min: 0, step: '0.01' }} {...form.register('purchaseCost')} />
      <TextField label="Supplier" {...form.register('supplier')} /><TextField label="Department" {...form.register('department')} />
      <TextField label="Location" {...form.register('location')} /><TextField label="Warranty expiry" type="date" InputLabelProps={{ shrink: true }} {...form.register('warrantyExpiry')} />
      <TextField label="Description" multiline minRows={2} className="form-wide" {...form.register('description')} />
    </div></DialogContent><DialogActions><Button onClick={() => setDialogOpen(false)} disabled={save.isPending}>Cancel</Button><Button variant="contained" type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : editing ? 'Save changes' : 'Add asset'}</Button></DialogActions></form></Dialog>
    <Snackbar open={!!feedback} autoHideDuration={3500} onClose={() => setFeedback('')} message={feedback} />
  </>
}
