import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Avatar, Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material'

// Mock current user (replace with an API call when the backend is ready)
let currentUser = {
  name: 'System Administrator',
  phone: '0771234567',
  email: 'admin@nipo.gov.lk',
  role: 'Administrator',
  department: 'IT',
}

const readOnlyProps = {
  slotProps: { input: { readOnly: true } },
  InputProps: { readOnly: true },
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export default function Profile() {
  const [user, setUser] = useState(currentUser)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const timer = useRef(null)
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues: { name: user.name, phone: user.phone },
  })

  useEffect(() => () => clearTimeout(timer.current), [])

  const onSubmit = (values) => {
    setSaving(true)
    setSaved(false)
    timer.current = setTimeout(() => {
      currentUser = { ...currentUser, name: values.name.trim(), phone: values.phone }
      setUser(currentUser)
      reset({ name: currentUser.name, phone: currentUser.phone })
      setSaving(false)
      setSaved(true)
    }, 800)
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT</span>
          <h1>My profile</h1>
          <p>View your account details and update your contact information.</p>
        </div>
      </div>

      <Paper className="table-paper" sx={{ p: { xs: 2, sm: 3 }, maxWidth: 820 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar aria-hidden="true" sx={{ width: 64, height: 64, bgcolor: '#142b4a' }}>
            {getInitials(user.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2" sx={{ overflowWrap: 'anywhere' }}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.role} · {user.department}</Typography>
          </Box>
        </Box>

        {saved && !isDirty && <Alert severity="success" sx={{ mb: 3 }}>Profile updated.</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <TextField
              label="Full name"
              fullWidth
              required
              autoComplete="name"
              {...register('name', {
                validate: (value) => value.trim() !== '' || 'Full name is required',
              })}
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
            />
            <TextField
              label="Phone number"
              type="tel"
              fullWidth
              required
              autoComplete="tel"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^0\d{9}$/, message: 'Enter 10 digits starting with 0' },
              })}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message}
            />
            <TextField label="Email" value={user.email} fullWidth helperText="Read-only" {...readOnlyProps} />
            <TextField label="Role" value={user.role} fullWidth helperText="Read-only" {...readOnlyProps} />
            <TextField label="Department" value={user.department} fullWidth helperText="Read-only" {...readOnlyProps} />
            <Box className="form-wide" sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={!isDirty || saving}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{ bgcolor: '#142b4a' }}
              >
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </Box>
          </div>
        </form>
      </Paper>
    </>
  )
}