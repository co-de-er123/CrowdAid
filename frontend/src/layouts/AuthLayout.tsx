import React from 'react';
import { Box, Container, CssBaseline, ThemeProvider, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';
import theme from '../theme';

const AuthLayout = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: (theme) => theme.palette.grey[100],
        }}
      >
        <CssBaseline />
        <Container
          component="main"
          maxWidth="xs"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            py: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <Typography
              component="h1"
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                mb: 1,
              }}
            >
              CrowdAid
            </Typography>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              align="center"
              sx={{ maxWidth: 400 }}
            >
              Emergency response platform connecting those in need with volunteers
            </Typography>
          </Box>
          
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
              p: 4,
              width: '100%',
            }}
          >
            <Outlet />
          </Box>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} CrowdAid. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AuthLayout;
