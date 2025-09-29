import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Card, 
  CardContent 
} from '@mui/material';

const StravaCallback: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const stateFromUrl = searchParams.get('state');
        const errorParam = searchParams.get('error');

        // Get the user ID - either from URL state or from localStorage
        let userId = stateFromUrl;
        if (!userId) {
          userId = localStorage.getItem('stridewise-user-id');
          if (!userId) {
            // Generate a new user ID if none exists
            userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('stridewise-user-id', userId);
          }
        }

        console.log('🔄 Processing Strava callback...');
        console.log('Code:', code?.substring(0, 10) + '...');
        console.log('User ID:', userId);

        if (errorParam) {
          throw new Error(`Strava authorization error: ${errorParam}`);
        }

        if (!code) {
          throw new Error('No authorization code received from Strava');
        }

        // Send the code to our backend
        console.log('📤 Sending code to backend...');
        const response = await fetch('/api/strava/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state: userId
          }),
        });

        console.log('📥 Backend response status:', response.status);
        const data = await response.json();
        console.log('📊 Backend response data:', data);

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: Failed to process callback`);
        }

        if (data.success) {
          console.log('✅ Strava connection successful!');
          setSuccess(true);
          setError(null);
          
          // Store successful connection flag
          localStorage.setItem('strava-connected-' + userId, 'true');
          
          // Wait a moment to show success message, then redirect
          setTimeout(() => {
            console.log('🔄 Redirecting to AI Coach page...');
            navigate('/ai-coach', { replace: true });
          }, 2000);
        } else {
          throw new Error(data.error || 'Failed to connect Strava account');
        }
      } catch (err) {
        console.error('❌ Callback processing failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 70%, #475569 100%)'
      }}
    >
      <Card sx={{ 
        maxWidth: 500, 
        width: '100%', 
        mx: 2,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          {loading && (
            <>
              <CircularProgress sx={{ color: '#FF6B35', mb: 3 }} />
              <Typography variant="h5" gutterBottom sx={{ color: 'white', fontWeight: 600 }}>
                Connecting to Strava...
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Please wait while we establish your connection with Strava.
              </Typography>
            </>
          )}

          {success && !loading && (
            <>
              <Box sx={{ fontSize: 60, mb: 2 }}>🎉</Box>
              <Typography variant="h5" gutterBottom sx={{ color: '#4CAF50', fontWeight: 600 }}>
                Successfully Connected!
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                Your Strava account has been connected successfully. Redirecting to your AI Coach...
              </Typography>
              <CircularProgress size={24} sx={{ color: '#4CAF50' }} />
            </>
          )}

          {error && !loading && (
            <>
              <Box sx={{ fontSize: 60, mb: 2 }}>❌</Box>
              <Typography variant="h5" gutterBottom sx={{ color: '#f44336', fontWeight: 600 }}>
                Connection Failed
              </Typography>
              <Alert 
                severity="error" 
                sx={{ 
                  mt: 2, 
                  backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  '& .MuiAlert-message': { color: 'white' }
                }}
              >
                {error}
              </Alert>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)', 
                  mt: 2,
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                onClick={() => navigate('/ai-coach')}
              >
                Click here to try again
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StravaCallback;