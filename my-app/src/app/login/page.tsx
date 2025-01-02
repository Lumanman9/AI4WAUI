'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Avatar,
    Box,
    Button,
    Container,
    CssBaseline,
    TextField,
    Typography,
    Link,
    Paper,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    LockOutlined as LockOutlinedIcon,
    Visibility,
    VisibilityOff,
    Person as PersonIcon
} from '@mui/icons-material';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Step 1: Get JWT token from Django
            const loginUrl = process.env.NEXT_PUBLIC_API_URL + '/api/token/';
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Invalid credentials');
            }

            const tokens = await response.json();

            // Store tokens
            localStorage.setItem('accessToken', tokens.access);
            localStorage.setItem('refreshToken', tokens.refresh);

            // Step 2: Test Hasura connection with the new token
            const hasuraEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
            const testQuery = {
                query: `
                    query TestQuery {
                        __typename
                    }
                `
            };

            const hasuraResponse = await fetch(hasuraEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokens.access}`
                },
                body: JSON.stringify(testQuery)
            });

            if (!hasuraResponse.ok) {
                throw new Error('Failed to connect to Hasura');
            }

            // Step 3: Initialize Apollo Client with the new token
            // This assumes you have a function to update Apollo Client's auth header
            if (typeof window !== 'undefined') {
                // Optional: Trigger Apollo Client reset/update if needed
                // await client.resetStore();
            }

            // Redirect to dashboard
            router.push('/');
        } catch (err) {
            console.error('Login error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockOutlinedIcon color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                            disabled={loading}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                            <Link href="/register" variant="body2">
                                Do not have an account? Sign Up
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}