import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, CircularProgress, FormControlLabel, MenuItem, Paper, Switch, TextField, Typography } from '@mui/material'
import { ROLES, getUsers, updateUser } from '../users/mockUsers.js'

const TIMEOUTS = [15, 30, 60]

// Mock system settings (replace with an API call when the backend is ready)
let savedSettings = {
  emailNotifications: true,
  lockAfterFailedAttempts: true,
  sessionTimeout: 30,
}

const cardSx = { p: { xs: 2, sm: 3 }, mb: 3, maxWidth: 820 }
const buttonRowSx = { display: 'flex', justifyContent: 'flex-end' }

function useMockSave() {
  const [saving, setSaving] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const run = (action) => {
    setSaving(true)
    timer.current = setTimeout(() => {
      action()
      setSaving(false)
    }, 800)
  }
  return [saving, run]
}

function SaveButton({ saving, disabled, label }) {
  return (
    <Button
      type="submit"
      variant="contained"
      disabled={disabled || saving}
      startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
      sx={{ bgcolor: '#142b4a' }}
    >
      {saving ? 'Saving...' : label}
    </Button>
  )
}

function AccessSettings() {
  const [users, setUsers] = useState(getUsers)
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('')
  const [active, setActive] = useState(false)
  const [message, setMessage] = useState(null)
  const [saving, run] = useMockSave()

  const selected = users.find((u) => u.id === userId)
  const status = active ? 'active' : 'inactive'
  const changed = Boolean(selected) && (role !== selected.role || status !== selected.status)

  const selectUser = (id) => {
    const user = users.find((u) => u.id === id)
    setUserId(id)
    setRole(user.role)
    setActive(user.status === 'active')
    setMessage(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!changed || saving) return

    const isActiveAdmin = (u) => u.role === 'Admin' && u.status === 'active'
    const otherAdminExists = users.some((u) => u.id !== userId && isActiveAdmin(u))
    if (isActiveAdmin(selected) && !isActiveAdmin({ role, status }) && !otherAdminExists) {
      setMessage({ type: 'error', text: 'At least one active Admin is required.' })
      return
    }

    setMessage(null)
    run(() => {
      updateUser(userId, { role, status })
      setUsers(getUsers())
      setMessage({ type: 'success', text: `Access updated for ${selected.name}.` })
    })
  }

  return (
    <Paper className="table-paper" sx={cardSx}>
      <Typography variant="h6" component="h2">Role and account status</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select a user to change their role or account status.
      </Typography>

      {message && <Alert severity={message.type} sx={{ mb: 3 }}>{message.text}</Alert>}

      {users.length === 0 ? (
        <Alert severity="info">No users available.</Alert>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <TextField
              select
              label="User"
              fullWidth
              value={userId}
              disabled={saving}
              onChange={(e) => selectUser(e.target.value)}
            >
              {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </TextField>
            <TextField
              select
              label="Role"
              fullWidth
              value={role}
              disabled={!selected || saving}
              onChange={(e) => { setRole(e.target.value); setMessage(null) }}
            >
              {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>

            {selected ? (
              <Box className="form-wide">
                <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere', mb: 1 }}>
                  {selected.email} · {selected.department}
                </Typography>
                <FormControlLabel
                  label={active ? 'Account active' : 'Account inactive'}
                  control={
                    <Switch
                      checked={active}
                      disabled={saving}
                      onChange={(e) => { setActive(e.target.checked); setMessage(null) }}
                    />
                  }
                />
              </Box>
            ) : (
              <Typography className="form-wide" variant="body2" color="text.secondary">
                No user selected.
              </Typography>
            )}

            <Box className="form-wide" sx={buttonRowSx}>
              <SaveButton saving={saving} disabled={!changed} label="Save access" />
            </Box>
          </div>
        </form>
      )}
    </Paper>
  )
}

function SystemSettings() {
  const [original, setOriginal] = useState(savedSettings)
  const [values, setValues] = useState(savedSettings)
  const [saved, setSaved] = useState(false)
  const [saving, run] = useMockSave()

  const changed = Object.keys(values).some((key) => values[key] !== original[key])

  const change = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!changed || saving) return
    setSaved(false)
    run(() => {
      savedSettings = values
      setOriginal(values)
      setSaved(true)
    })
  }

  const toggle = (key, label) => (
    <FormControlLabel
      className="form-wide"
      label={label}
      control={<Switch checked={values[key]} disabled={saving} onChange={(e) => change(key, e.target.checked)} />}
    />
  )

  return (
    <Paper className="table-paper" sx={cardSx}>
      <Typography variant="h6" component="h2">System settings</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage notification and sign-in preferences.
      </Typography>

      {saved && <Alert severity="success" sx={{ mb: 3 }}>Settings saved.</Alert>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          {toggle('emailNotifications', 'Email notifications')}
          {toggle('lockAfterFailedAttempts', 'Lock account after repeated failed sign-ins')}
          <TextField
            select
            label="Session timeout"
            fullWidth
            value={values.sessionTimeout}
            disabled={saving}
            onChange={(e) => change('sessionTimeout', e.target.value)}
          >
            {TIMEOUTS.map((m) => <MenuItem key={m} value={m}>{m} minutes</MenuItem>)}
          </TextField>
          <Box className="form-wide" sx={buttonRowSx}>
            <SaveButton saving={saving} disabled={!changed} label="Save settings" />
          </Box>
        </div>
      </form>
    </Paper>
  )
}

export default function Settings() {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SYSTEM</span>
          <h1>Settings</h1>
          <p>Manage user access and system preferences.</p>
        </div>
      </div>
      <AccessSettings />
      <SystemSettings />
    </>
  )
}
