import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

// TEMPORARY: mock sign-in until the backend auth API is ready.
// Replace this function with a real call in src/services (axios) later.
const DEMO_EMAIL = 'admin@nipo.gov.lk'
const DEMO_PASSWORD = 'Admin@123'

function mockSignIn({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) resolve({ email })
      else reject(new Error('Invalid email or password.'))
    }, 900)
  })
}

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [signInError, setSignInError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '' } })

  const onSubmit = async (values) => {
    setSignInError('')
    try {
      await mockSignIn(values)
      navigate('/', { replace: true })
    } catch (err) {
      setSignInError(err.message || 'Sign in failed. Please try again.')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        background: 'linear-gradient(160deg, #142b4a 0%, #234468 100%)',
      }}
    >
      <Paper
        elevation={0}
        sx={{ width: '100%', maxWidth: 420, p: { xs: 3, sm: 4 }, borderRadius: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#142b4a',
              color: 'white',
              fontWeight: 800,
              fontSize: 21,
            }}
          >
            N
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#172b46', lineHeight: 1.1 }}>
              NIPO · ITAMS
            </Typography>
            <Typography sx={{ fontSize: 10, letterSpacing: '.14em', color: '#8997a8' }}>
              ASSET MANAGEMENT
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: '#172b46' }}>
          Sign in
        </Typography>
        <Typography sx={{ color: '#8490a1', fontSize: 13, mt: 0.5, mb: 3 }}>
          Use your NIPO staff account to continue.
        </Typography>

        {signInError && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {signInError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField
            label="Email"
            type="email"
            autoComplete="username"
            fullWidth
            autoFocus
            margin="normal"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
            })}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            fullWidth
            margin="normal"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={isSubmitting}
            sx={{ mt: 2, height: 44, boxShadow: 'none', textTransform: 'none', fontWeight: 600 }}
          >
            {isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
          </Button>
        </Box>

        <Typography sx={{ color: '#a0aab6', fontSize: 11, mt: 3, textAlign: 'center' }}>
          Demo login: {DEMO_EMAIL} / {DEMO_PASSWORD}
        </Typography>
      </Paper>
    </Box>
  )
}