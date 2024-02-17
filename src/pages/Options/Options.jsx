import React from 'react';
import './Options.css';
import {
  ThemeProvider,
  Input,
  Text,
  Heading,
  Flex,
  Grid,
  Button,
  Box,
  Avatar,
  Card,
  Spinner,
} from 'theme-ui';
import theme from '../Popup/theme';
import toast, { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

const Options = () => {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState({});
  useEffect(() => {
    let session = localStorage.getItem('session');
    if (session) {
      let status = localStorage.getItem('status');
      setSession(session);
      setStatus(JSON.parse(status));
    }
  }, []);
  return (
    <ThemeProvider theme={theme}>
      <Flex
        p={4}
        sx={{
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          overflowY: 'scroll',
        }}
      >
      {status != {} ?
        <Card sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '600px'}}>
          <Flex sx={{flexDirection: 'column'}}>
            <Text variant="eyebrow" sx={{fontSize: '16px!important'}} mb={0}>Friction</Text>
            <Heading as="h1" mt={0}>User Settings</Heading>
          </Flex>
          <Input placeholder='john@example.com' />
          <Input placeholder='Fiona Appleseed' />
          <Input placeholder='https://github.com/orpheus.png' />
          <Button>Update Your Profile</Button>
        </Card> : <Text variant="eyebrow" sx={{fontSize: 7}} mb={0}>Open Friction To Login</Text> }
      </Flex> 
      <Toaster />
    </ThemeProvider>
  );
};

export default Options;
