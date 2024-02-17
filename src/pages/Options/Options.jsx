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
  const [state, setState] = useState();
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [image, setImage] = useState();
  useEffect(() => {
    let session = localStorage.getItem('session');
    if (session) {
      let status = localStorage.getItem('status');
      setSession(session);
      setStatus(JSON.parse(status));
      setName(JSON.parse(status).user.name)
      setEmail(JSON.parse(status).user.email)
      setImage(JSON.parse(status).user.image)
    }
  }, []);
  let handleUpdate = async (e) => {
    setState('loading');
    let status = await fetch(
      'https://treehacks-backend-xi.vercel.app/api/status',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session,
        }),
      }
    ).then((r) => r.json());
    if (status.success) {
      setStatus(status);
      setState('');
      localStorage.setItem('session', session);
      localStorage.setItem('status', JSON.stringify(status));
      setName(status.user.name)
      setEmail(status.user.email)
      setImage(status.user.image)
    } else {
      setSession('');
      setMagicCodeStatus('');
      toast.error(`Sorry, that's an invalid magic code!`, {
        position: 'bottom-center',
      });
    }
  };
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
        {status != {} ? (
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '600px',
            }}
          >
            <Flex sx={{ flexDirection: 'column' }}>
              <Text
                variant="eyebrow"
                sx={{ fontSize: '16px!important' }}
                mb={0}
              >
                Friction
              </Text>
              <Heading as="h1" mt={0}>
                User Settings
              </Heading>
            </Flex>
            <Input
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Fiona Appleseed"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="https://github.com/orpheus.png"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            <Button>Update Your Profile</Button>
          </Card>
        ) : (
          <Text variant="eyebrow" sx={{ fontSize: 7 }} mb={0}>
            Open Friction To Login
          </Text>
        )}
      </Flex>
      <Toaster />
    </ThemeProvider>
  );
};

export default Options;
