import axios from 'axios';
import https from 'https';

// Configure HTTPS agent for development (fixes SSL certificate issues)
const httpsAgent = new https.Agent({
  rejectUnauthorized: process.env.NODE_ENV === 'production' ? true : false
});

interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface StravaActivity {
  id: number;
  name: string;
  distance: number; // in meters
  moving_time: number; // in seconds
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  average_speed: number; // m/s
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  suffer_score?: number;
  kudos_count: number;
  athlete_count: number;
}

interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  created_at: string;
  updated_at: string;
}

class StravaService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl = 'https://www.strava.com/api/v3';
  private readonly authUrl = 'https://www.strava.com/oauth';

  constructor() {
    this.clientId = process.env.STRAVA_CLIENT_ID || '';
    this.clientSecret = process.env.STRAVA_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.error('Missing Strava credentials:');
      console.error('Client ID:', this.clientId || 'NOT SET');
      console.error('Client Secret:', this.clientSecret ? 'SET' : 'NOT SET');
      console.error('All env vars:', Object.keys(process.env).filter(k => k.includes('STRAVA')));
    } else {
      console.log('✓ Strava Service initialized successfully');
    }
  }

  /**
   * Generate Strava authorization URL
   */
  getAuthorizationUrl(redirectUri: string, state?: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      approval_prompt: 'force',
      scope: 'read,activity:read_all,profile:read_all'
    });

    if (state) {
      params.append('state', state);
    }

    return `${this.authUrl}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access tokens
   */
  async exchangeCodeForTokens(code: string): Promise<StravaTokens> {
    try {
      const response = await axios.post(`${this.authUrl}/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code'
      }, {
        // Fix for SSL certificate issues in development
        httpsAgent
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: response.data.expires_at
      };
    } catch (error: any) {
      console.error('Error exchanging code for tokens:', error);
      
      // Log the Strava API response details if available
      if (error.response) {
        console.error('Strava API Error Status:', error.response.status);
        console.error('Strava API Error Data:', error.response.data);
      }
      
      throw new Error('Failed to exchange authorization code');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<StravaTokens> {
    try {
      const response = await axios.post(`${this.authUrl}/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }, {
        httpsAgent
      });

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: response.data.expires_at
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Get athlete profile
   */
  async getAthlete(accessToken: string): Promise<StravaAthlete> {
    try {
      const response = await axios.get(`${this.baseUrl}/athlete`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        httpsAgent
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching athlete:', error);
      throw new Error('Failed to fetch athlete data');
    }
  }

  /**
   * Get athlete's activities
   */
  async getActivities(
    accessToken: string, 
    page = 1, 
    perPage = 30,
    after?: number,
    before?: number
  ): Promise<StravaActivity[]> {
    try {
      const params: any = {
        page,
        per_page: perPage
      };

      if (after) params.after = after;
      if (before) params.before = before;

      const response = await axios.get(`${this.baseUrl}/athlete/activities`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
        httpsAgent,
        timeout: 15000 // 15 second timeout
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      
      // If it's a timeout, return empty array instead of throwing
      if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
        console.log('⚠️ Strava API timeout, returning empty activities array');
        return [];
      }
      
      throw new Error('Failed to fetch activities');
    }
  }

  /**
   * Get detailed activity by ID
   */
  async getActivity(accessToken: string, activityId: number): Promise<StravaActivity> {
    try {
      const response = await axios.get(`${this.baseUrl}/activities/${activityId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        httpsAgent
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching activity:', error);
      throw new Error('Failed to fetch activity details');
    }
  }

  /**
   * Get athlete's stats
   */
  async getAthleteStats(accessToken: string, athleteId: number): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/athletes/${athleteId}/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        httpsAgent
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching athlete stats:', error);
      throw new Error('Failed to fetch athlete stats');
    }
  }

  /**
   * Check if access token is expired
   */
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() / 1000 > expiresAt;
  }

  /**
   * Get activities for the last N days
   */
  async getRecentActivities(
    accessToken: string, 
    days: number = 30
  ): Promise<StravaActivity[]> {
    const after = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);
    return this.getActivities(accessToken, 1, 200, after);
  }

  /**
   * Filter running activities only
   */
  filterRunningActivities(activities: StravaActivity[]): StravaActivity[] {
    return activities.filter(activity => 
      activity.type === 'Run' || activity.type === 'VirtualRun'
    );
  }
}

export default StravaService;
export { StravaTokens, StravaActivity, StravaAthlete };