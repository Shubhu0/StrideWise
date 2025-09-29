import React from 'react'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material'
import { Google, Facebook } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle registration logic here
    console.log('Registration attempt:', formData)
    // For demo purposes, navigate to dashboard
    navigate('/')
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Start Your Journey
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Create your account and begin running with purpose
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
            />
          </Box>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <FormControlLabel
            control={
              <Checkbox
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
            }
            label="I agree to the Terms of Service and Privacy Policy"
            sx={{ mt: 2, mb: 2 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={!formData.agreeToTerms}
          >
            Create Account
          </Button>
        </form>

        <Divider sx={{ my: 3 }}>OR</Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Google />}
            fullWidth
            size="large"
          >
            Continue with Google
          </Button>
          <Button
            variant="outlined"
            startIcon={<Facebook />}
            fullWidth
            size="large"
          >
            Continue with Facebook
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link 
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
            >
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Register