import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { AccountCircle } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const Navbar: React.FC = () => {
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
      }}
    >
      <Toolbar sx={{ py: 1 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            flexGrow: 1,
            '&:hover': {
              opacity: 0.8,
            },
            transition: 'opacity 0.2s ease'
          }}
          onClick={() => navigate('/')}
        >
          <img 
            src="/icon1.png" 
            alt="StrideWise Logo" 
            style={{ 
              width: 32, 
              height: 32, 
              marginRight: 16,
              borderRadius: '6px'
            }} 
          />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              color: 'white',
              fontSize: '1.5rem'
            }}
          >
            StrideWise
          </Typography>
        </Box>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          <Button 
            color="inherit" 
            onClick={() => navigate('/')}
            sx={{ 
              fontWeight: 500,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Dashboard
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/training')}
            sx={{ 
              fontWeight: 500,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Training
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/ai-coach')}
            sx={{ 
              fontWeight: 600,
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #FF6B35 20%, #4FC3F7 80%)',
              px: 3,
              mx: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #E64A19 20%, #29B6F6 80%)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            🤖 AI Coach
          </Button>
          <Button 
            color="inherit" 
            onClick={() => navigate('/progress')}
            sx={{ 
              fontWeight: 500,
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Progress
          </Button>
        </Box>

        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
            Profile
          </MenuItem>
          <MenuItem onClick={() => { handleClose(); navigate('/login'); }}>
            Login
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar