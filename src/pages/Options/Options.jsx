import React from 'react';
import './Options.css';
import {
  ThemeProvider,
  Input,
  Text,
  Heading,
  Select,
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
  const [userLoading, setUserLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [image, setImage] = useState();
  const [slowdownOpt, setSlowdownOpt] = useState(false);
  const [grayscaleOpt, setGrayscaleOpt] = useState(false);
  const [blurOpt, setBlurOpt] = useState(false);
  const [start, setStart] = useState();
  const [end, setEnd] = useState();
  const [timezone, setTimezone] = useState();
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
      setTimezone(JSON.parse(status).group.tzOffset);
      setStart(JSON.parse(status).group.startBreak);
      setEnd(JSON.parse(status).group.endBreak);
    }
  }, []);
  let handleUpdateUser = async (e) => {
    setUserLoading(true);
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
      setUserLoading(false);
      localStorage.setItem('session', session);
      localStorage.setItem('status', JSON.stringify(status));
    } else {
      setSession('');
      setMagicCodeStatus('');
      setUserLoading(false);
      toast.error(`Sorry, there was an error. Try again?`, {
        position: 'bottom-center',
      });
    }
  };

  let handleUpdateGroup = async (e) => {
    setGroupLoading(true);
    let status = await fetch(
      'https://treehacks-backend-xi.vercel.app/api/group/update',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session,
          tzOffset: timezone,
          startBreak: start,
          endBreak: end,
        }),
      }
    ).then((r) => r.json());
    if (status.success) {
      setStatus(status);
      setGroupLoading(false);
      localStorage.setItem('session', session);
      localStorage.setItem('status', JSON.stringify(status));
    } else {
      setSession('');
      setGroupLoading(false);
      setMagicCodeStatus('');
      toast.error(`Sorry, there was an error. Try again?`, {
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
              disabled={userLoading}
              onClick={handleUpdateUser}
              sx={{ bg: userLoading ? 'muted' : 'blue' }}
            >
              {userLoading ? 'Loading... ' : 'Update Your Profile'}
            </Button>
            <Flex sx={{ flexDirection: 'column' }}>
              <Heading as="h1" mt={3}>
                Group Settings
              </Heading>
            </Flex>
            <Box>
              <Text variant="eyebrow" sx={{ fontSize: '12px!important' }}>
                Timezone
              </Text>
              <Select
                sx={{ bg: 'white' }}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="-12">
                  UTC-12:00 (International Date Line West)
                </option>
                <option value="-11">UTC-11:00 (Samoa Standard Time)</option>
                <option value="-10">
                  UTC-10:00 (Hawaii-Aleutian Standard Time)
                </option>
                <option value="-9.5">UTC-09:30 (Marquesas Time)</option>
                <option value="-9">UTC-09:00 (Alaska Standard Time)</option>
                <option value="-8">UTC-08:00 (Pacific Standard Time)</option>
                <option value="-7">UTC-07:00 (Mountain Standard Time)</option>
                <option value="-6">UTC-06:00 (Central Standard Time)</option>
                <option value="-5">UTC-05:00 (Eastern Standard Time)</option>
                <option value="-4.5">
                  UTC-04:30 (Venezuela Standard Time)
                </option>
                <option value="-4">UTC-04:00 (Atlantic Standard Time)</option>
                <option value="-3.5">
                  UTC-03:30 (Newfoundland Standard Time)
                </option>
                <option value="-3">UTC-03:00 (Argentina Time)</option>
                <option value="-2">
                  UTC-02:00 (Fernando de Noronha Standard Time)
                </option>
                <option value="-1">UTC-01:00 (Cape Verde Time)</option>
                <option value="0">
                  UTC±00:00 (Coordinated Universal Time)
                </option>
                <option value="1">UTC+01:00 (Central European Time)</option>
                <option value="2">UTC+02:00 (Eastern European Time)</option>
                <option value="2.50">
                  UTC+02:30 (Eastern European Time +30)
                </option>
                <option value="3">UTC+03:00 (Moscow Standard Time)</option>
                <option value="3.50">UTC+03:30 (Iran Standard Time)</option>
                <option value="4">UTC+04:00 (Gulf Standard Time)</option>
                <option value="4.50">UTC+04:30 (Afghanistan Time)</option>
                <option value="5">UTC+05:00 (Pakistan Standard Time)</option>
                <option value="5.50">UTC+05:30 (Indian Standard Time)</option>
                <option value="5.75">UTC+05:45 (Nepal Time)</option>
                <option value="6">UTC+06:00 (Bangladesh Standard Time)</option>
                <option value="6.50">UTC+06:30 (Myanmar Standard Time)</option>
                <option value="7">UTC+07:00 (Indochina Time)</option>
                <option value="7.50">UTC+07:30 (Indochina Time +30)</option>
                <option value="8">UTC+08:00 (China Standard Time)</option>
                <option value="8.75">
                  UTC+08:45 (Australia Central Western Standard Time)
                </option>
                <option value="9">UTC+09:00 (Japan Standard Time)</option>
                <option value="9.30">
                  UTC+09:30 (Australia Central Standard Time)
                </option>
                <option value="10">
                  UTC+10:00 (Australian Eastern Standard Time)
                </option>
                <option value="11">UTC+11:00 (Vanuatu Standard Time)</option>
                <option value="11:30">UTC+11:30 (Norfolk Island Time)</option>
                <option value="12">
                  UTC+12:00 (New Zealand Standard Time)
                </option>
              </Select>
            </Box>
            <Heading as="h3" mt={2}>
              Collective Break Period
            </Heading>
            <Grid columns={2}>
              <Box>
                <Text variant="eyebrow" sx={{ fontSize: '12px!important' }}>
                  Starts at
                </Text>
                <Input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </Box>
              <Box>
                <Text variant="eyebrow" sx={{ fontSize: '12px!important' }}>
                  Ends at
                </Text>
                <Input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </Box>
            </Grid>
            <Button
              disabled={groupLoading}
              onClick={handleUpdateGroup}
              sx={{ bg: groupLoading ? 'muted' : 'blue' }}
            >
              {groupLoading ? 'Loading... ' : 'Update Your Group'}
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
