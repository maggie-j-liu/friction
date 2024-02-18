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
  Switch,
  Label,
} from 'theme-ui';
import theme from '../Popup/theme';
import toast, { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

const Options = () => {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [image, setImage] = useState();
  const [slowdownOpt, setSlowdownOpt] = useState(false);
  const [grayscaleOpt, setGrayscaleOpt] = useState(false);
  const [blurOpt, setBlurOpt] = useState(false);

  useEffect(() => {
    chrome.storage.local
      .get(['videoSlowdown', 'videoGrayscale', 'videoBlur'])
      .then((res) => {
        setSlowdownOpt(res.videoSlowdown ?? true);
        setGrayscaleOpt(res.videoGrayscale ?? true);
        setBlurOpt(res.videoBlur ?? true);
      });
    let session = localStorage.getItem('session');
    if (session) {
      let status = localStorage.getItem('status');
      setSession(session);
      setStatus(JSON.parse(status));
      setName(JSON.parse(status).user.name);
      setEmail(JSON.parse(status).user.email);
      setImage(JSON.parse(status).user.image);
    }
  }, []);
  let handleUpdate = async (e) => {
    setLoading(true);
    let status = await fetch(
      'https://treehacks-backend-xi.vercel.app/api/update',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session,
          name,
          email,
          image,
        }),
      }
    ).then((r) => r.json());
    if (status.success) {
      setStatus(status);
      setLoading(false);
      localStorage.setItem('session', session);
      localStorage.setItem('status', JSON.stringify(status));
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
            <Flex
              sx={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box>
                <Switch
                  id="slowdown-switch"
                  onChange={(e) => {
                    setSlowdownOpt(e.target.checked);
                    chrome.storage.local.set({
                      videoSlowdown: e.target.checked,
                    });
                  }}
                  checked={slowdownOpt}
                />
              </Box>
              <Label
                htmlFor="slowdown-switch"
                sx={{ flex: 1, fontSize: 18, fontWeight: 'bold' }}
              >
                Video slowdown effect
              </Label>
            </Flex>
            <Flex
              sx={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box>
                <Switch
                  id="grayscale-switch"
                  onChange={(e) => {
                    setGrayscaleOpt(e.target.checked);
                    chrome.storage.local.set({
                      videoGrayscale: e.target.checked,
                    });
                  }}
                  checked={grayscaleOpt}
                />
              </Box>
              <Label
                htmlFor="grayscale-switch"
                sx={{ flex: 1, fontSize: 18, fontWeight: 'bold' }}
              >
                Grayscale effect
              </Label>
            </Flex>
            <Flex
              sx={{
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box>
                <Switch
                  id="blur-switch"
                  onChange={(e) => {
                    setBlurOpt(e.target.checked);
                    chrome.storage.local.set({
                      videoBlur: e.target.checked,
                    });
                  }}
                  checked={blurOpt}
                />
              </Box>
              <Label
                htmlFor="blur-switch"
                sx={{ flex: 1, fontSize: 18, fontWeight: 'bold' }}
              >
                Blur effect
              </Label>
            </Flex>
            <Button
              disabled={loading}
              onClick={handleUpdate}
              sx={{ bg: loading ? 'muted' : 'blue' }}
            >
              {loading ? 'Loading... ' : 'Update Your Profile'}
            </Button>
            <Flex sx={{ flexDirection: 'column' }}>
              <Heading as="h1" mt={3}>
                Group Settings
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
            <Button
              disabled={loading}
              onClick={handleUpdate}
              sx={{ bg: loading ? 'muted' : 'blue' }}
            >
              {loading ? 'Loading... ' : 'Update Your Group'}
            </Button>
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
