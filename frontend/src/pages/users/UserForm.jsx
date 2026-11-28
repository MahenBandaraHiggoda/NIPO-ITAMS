import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, CircularProgress, MenuItem, TextField } from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { DEPARTMENTS, ROLES, addUser, getUser, getUsers, updateUser } from './mockUsers.js'

// TEMPORARY: pretend the request takes time until the backend users API is ready.
const delay = () => new Promise((resolve) => setTimeout(resolve, 800))

export default function UserForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const existing = isEdit ? getUser(id) : null
  const [saveError, setSaveError] = useState('')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: existing?.name ?? '',
      email: existing?.email ?? '',
      role: existing?.role ?? '',
      department: existing?.department ?? '',
      status: existing?.status ?? 'active',
    },
  })

  const onSubmit = async (values) => {
    setSaveError('')
    try {
      await delay()
      const data = { ...values, name: values.name.trim(), email: values.email.trim() }
      if (isEdit) updateUser(id, data)
      else addUser(data)
      navigate('/users')
    } catch {
      setSaveError('Could not save the user. Please try again.')
    }
  }

  if (isEdit && !existing) {
    return (
      <div className="table-paper">
        <div className="empty-state">
          <h6>User not found</h6>
          <p>This user does not exist or was removed.</p>
          <Button onClick={() => navigate('/users')}>Back to users</Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">USER ADMINISTRATION</span>
          <h4>{isEdit ? 'Edit user' : 'Add user'}</h4>
          <p>{isEdit ? 'Update account details, role and status.' : 'Create a new staff account.'}</p>
        </div>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/users')}>
          Back to users
        </Button>
      </div>

      <div className="table-paper" style={{ padding: 24, maxWidth: 760 }}>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {saveError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-grid">
            <TextField
              label="Full name"
              className="form-wide"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register('name', {
                required: 'Full name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' },
              })}
            />

            <TextField
              label="Email"
              type="email"
              className="form-wide"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                validate: (v) =>
                  !getUsers().some(
                    (u) => u.email.toLowerCase() === v.trim().toLowerCase() && u.id !== existing?.id,
                  ) || 'This email is already in use',
              })}
            />

            <Controller
              name="role"
              control={control}
              rules={{ required: 'Select a role' }}
              render={({ field }) => (
                <TextField
                  select
                  label="Role"
                  {...field}
                  error={Boolean(errors.role)}
                  helperText={errors.role?.message}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="department"
              control={control}
              rules={{ required: 'Select a department' }}
              render={({ field }) => (
                <TextField
                  select
                  label="Department"
                  {...field}
                  error={Boolean(errors.department)}
                  helperText={errors.department?.message}
                >
                  {DEPARTMENTS.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField select label="Status" {...field}>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              )}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ boxShadow: 'none' }}>
              {isSubmitting ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Save changes' : 'Create user'}
            </Button>
            <Button onClick={() => navigate('/users')} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}