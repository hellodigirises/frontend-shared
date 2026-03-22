import React, { useState } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Container,
    Alert,
    CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axiosInstance from '../../api/axios';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';
import { useNavigate } from 'react-router-dom';

const schema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const resultAction = await dispatch(loginUser({ 
              email: data.email.toLowerCase().trim(), 
              password: data.password 
            }));
            
            if (loginUser.fulfilled.match(resultAction)) {
              const user = resultAction.payload.user;
              const role = user.role?.toUpperCase();

              if (role === 'SUPERADMIN') navigate('/superadmin');
              else if (role === 'TENANT_ADMIN') navigate('/admin');
              else if (role === 'SALES_MANAGER') navigate('/manager');
              else if (role === 'AGENT') navigate('/agent');
              else if (role === 'HR') navigate('/hr');
              else if (role === 'FINANCE') navigate('/finance');
              else navigate('/dashboard');
            } else {
              setError(resultAction.payload as string || 'Login failed');
            }
        } catch (err: any) {
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
                        RealEsso Login
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Email Address"
                            autoComplete="email"
                            autoFocus
                            {...register('email')}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                        />
                        <TextField
                            margin="normal"
                            fullWidth
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            {...register('password')}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, height: 45 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;
