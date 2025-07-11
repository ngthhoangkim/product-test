'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to products page
    router.push('/products');
  }, [router]);

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="body1" color="text.secondary">
        Đang chuyển hướng đến trang quản lý sản phẩm...
      </Typography>
    </Box>
  );
}
