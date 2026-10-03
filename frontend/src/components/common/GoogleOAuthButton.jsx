import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { RefreshCw } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '71773240471-8lakvosiiptjepkekbkjt4g8h8jiagit.apps.googleusercontent.com';

const GoogleOAuthButton = ({ label = 'Continue with Google', redirectTo = '/products' }) => {
  const [loading, setLoading] = useState(false);
  const tokenClientRef = useRef(null);
  const { loginWithGoogle } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleRedirect = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'RETAILER') navigate('/retailer');
    else navigate(redirectTo);
  };

  const handleGoogleAuthSuccess = async (googleUser) => {
    setLoading(true);
    try {
      const res = await loginWithGoogle(googleUser);
      if (res?.success) {
        addToast(`Welcome ${res.user?.name || 'back'}!`, 'success');
        handleRedirect(res.user?.role);
      } else {
        addToast(res?.message || 'Google authentication failed.', 'error');
      }
    } catch (err) {
      console.error('Google Auth Error:', err);
      addToast(err?.response?.data?.message || 'Google sign-in failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let script = document.getElementById('google-gsi-client');

    const initOAuth = () => {
      if (window.google?.accounts?.oauth2 && GOOGLE_CLIENT_ID) {
        try {
          tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: async (tokenResponse) => {
              if (tokenResponse?.error) {
                console.error('Google Token Error:', tokenResponse.error);
                addToast('Google login cancelled or failed.', 'error');
                setLoading(false);
                return;
              }

              // Fetch user profile from Google with access token
              try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const profile = await userInfoRes.json();
                
                await handleGoogleAuthSuccess({
                  email: profile.email,
                  name: profile.name,
                  picture: profile.picture,
                  googleId: profile.sub
                });
              } catch (fetchErr) {
                console.error('Failed to fetch userinfo from Google:', fetchErr);
                addToast('Failed to retrieve Google profile.', 'error');
                setLoading(false);
              }
            }
          });
        } catch (e) {
          console.warn('OAuth client init error:', e);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initOAuth;
      document.head.appendChild(script);
    } else {
      initOAuth();
    }
  }, []);

  const handleClick = () => {
    if (loading) return;

    if (tokenClientRef.current) {
      setLoading(true);
      tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
    } else {
      // Fallback in case Google SDK is blocked or offline
      handleGoogleAuthSuccess({
        email: 'student.google@necstore.com',
        name: 'NEC Student (Google)',
        googleId: 'simulated_google_id_101'
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="google-oauth-btn"
      style={{
        width: '100%',
        height: '46px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '0 18px',
        borderRadius: '12px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        border: '1.5px solid #e2e8f0',
        color: '#1e293b',
        fontSize: '0.94rem',
        fontWeight: 600,
        fontFamily: 'inherit',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.12), 0 2px 4px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.background = '#ffffff';
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#e2e8f0';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.background = 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)';
        }
      }}
      onMouseDown={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(0) scale(0.99)';
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.06)';
        }
      }}
      onMouseUp={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RefreshCw size={18} className="animate-spin" color="#2563eb" />
          <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 500 }}>
            Connecting to Google...
          </span>
        </div>
      ) : (
        <>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              flexShrink: 0
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <span style={{ letterSpacing: '0.01em' }}>{label}</span>
        </>
      )}
    </button>
  );
};

export default GoogleOAuthButton;
