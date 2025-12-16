'use client';

import Link from 'next/link';
import { Box, Typography, Button, Paper } from '@mui/material';

export default function Home() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 4,
        backgroundColor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 600 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          SaaSimulator
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          A CEO simulation game where you manage product development, hiring, funding, and finances.
        </Typography>
        <Button
          component={Link}
          href="/game"
          variant="contained"
          size="large"
          sx={{ px: 4, py: 1.5 }}
        >
          Start Game
        </Button>
      </Paper>
    </Box>
  );
}