import React from 'react';
import logo from '../../assets/img/logo.svg';
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
import theme from './theme';
import './Popup.css';
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const Login = ({ setState, setStatus }) => {
  const [email, setEmail] = useState('');
  const [session, setSession] = useState('');
  const [magicCodeStatus, setMagicCodeStatus] = useState('');
  const [emailStatus, setEmailStatus] = useState('');
  let handleMagicCode = async (e) => {
    setMagicCodeStatus('loading');
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
      setState('authenticated');
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
  let handleEmail = async (e) => {
    setEmailStatus('loading');
    let status = validateEmail(email)
      ? await fetch('https://treehacks-backend-xi.vercel.app/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        }).then((r) => r.json())
      : { success: false };
    if (status.success) {
      setEmailStatus('');
      setEmail('');
      toast.success(`Email sent! Check your inbox for a magic code.`, {
        position: 'bottom-center',
      });
    } else {
      setEmailStatus('');
      toast.error(`Invalid email. Try again?`, { position: 'bottom-center' });
    }
  };
  return (
    <>
      <Heading as="h1" sx={{color: 'white'}}>Friction</Heading>
      <Box style={{ width: '100%', color: 'white' }} mb={1}>
        <Text>Need a magic code? Enter your email:</Text>
        <Flex sx={{ gap: 2 }} mt={1}>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            sx={{color: 'white'}}
          />
          <Button
            onClick={handleEmail}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
            }}
          >
            {emailStatus == 'loading' ? (
              <Spinner
                color="white"
                size={16}
                sx={{
                  marginLeft: '0px!important',
                  marginRight: '0px!important',
                }}
              />
            ) : (
              '➜'
            )}
          </Button>
        </Flex>
      </Box>
      <Box style={{ width: '100%', color: 'white' }} mb={1}>
        <Text>Got a magic code? Enter it here:</Text>
        <Flex sx={{ gap: 2 }} mt={1}>
          <Input
            value={session}
            onChange={(e) => setSession(e.target.value)}
            placeholder="cal1...."
            sx={{color: 'white'}}
          />
          <Button
            onClick={handleMagicCode}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
            }}
          >
            {magicCodeStatus == 'loading' ? (
              <Spinner
                color="white"
                size={16}
                sx={{
                  marginLeft: '0px!important',
                  marginRight: '0px!important',
                }}
              />
            ) : (
              '➜'
            )}
          </Button>
        </Flex>
      </Box>
    </>
  );
};

const Status = ({ status, setState }) => {
  return (
    <>
      <Heading as="h1" mb={2} mt={3} sx={{ textAlign: 'center' }}>
        <Text
          as="kbd"
          sx={{
            background: 'snow',
            py: 1,
            px: 2,
            borderRadius: 8,
            fontSize: 3,
          }}
        >
          {status.group.code}
        </Text>
      </Heading>
      <img
        src="https://cloud-fhko3ollg-hack-club-bot.vercel.app/0group_1__2_.png"
        style={{
          position: 'absolute',
          top: '12px',
          right: '18px',
          height: '48px',
          transform: 'rotate(5deg)',
          filter: 'invert(1)'
        }}
      />
      <Grid columns={2}>
        <Card variant="sunken" sx={{ textAlign: 'center' }}>
          You've all scrolled
          <Heading as="h1" mt={2}>
            {status.sum}px
          </Heading>
        </Card>
        <Card variant="sunken" sx={{ textAlign: 'center' }}>
          Your current friction is
          <Heading as="h1" mt={2}>
            {Math.max(status.friction, 0)}
          </Heading>
        </Card>
      </Grid>
      {status.group.users.map((user) => {
        return (
          <Card
            variant="sunken"
            sx={{
              display: 'flex',
              gap: 2,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar src={user.image} size={32} />
            <Box sx={{ flexGrow: 1 }}>{user.name}</Box>
            <Box sx={{ fontWeight: 800 }}>{status.blame[user.id] || 0}px</Box>
          </Card>
        );
      })}
      <p style={{ wordWrap: 'break-word', display: 'none' }}>
        {JSON.stringify(status)}
      </p>
      <Flex sx={{ gap: 2 }}>
        <Button
          sx={{ bg: 'green' }}
          onClick={() => {
            setState('group');
          }}
        >
          Change Group
        </Button>
        <Button
          onClick={() => {
            localStorage.clear();
            setState('login');
          }}
        >
          Logout
        </Button>
      </Flex>
    </>
  );
};

const Group = ({ setStatus, setState, session }) => {
  const [code, setCode] = useState('');
  let handleJoin = async (e) => {
    setState('loading');
    let status = await fetch(
      'https://treehacks-backend-xi.vercel.app/api/group/join',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session,
          code,
        }),
      }
    ).then((r) => r.json());
    if (status.success) {
      setStatus(status);
      setState('authenticated');
      localStorage.setItem('session', session);
      localStorage.setItem('status', JSON.stringify(status));
    } else {
      setStatus('group');
      toast.error(`Sorry, there was an error. Try again?`, {
        position: 'bottom-center',
      });
    }
  };
  let handleCreate = async (e) => {
    setState('loading');
    let status = await fetch(
      'https://treehacks-backend-xi.vercel.app/api/group/create',
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
      setState('authenticated');
      localStorage.setItem('session', session);
      localStorage.setItem('status', JSON.stringify(status));
    } else {
      setStatus('group');
      toast.error(`Sorry, there was an error. Try again?`, {
        position: 'bottom-center',
      });
    }
  };
  return (
    <>
      <Heading sx={{ color: 'white'}}>Join a Group</Heading>
      <Box sx={{ textAlign: 'center', color: 'white' }}>
        Every group has a unique three word code; with it, you can join the
        group.
      </Box>
      <Input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="random-three-words"
        sx={{ color: 'white'}}
      />
      <Button sx={{ width: '100%' }} onClick={handleJoin}>
        Join this Group
      </Button>
      <Button sx={{ width: '100%', bg: 'green' }} onClick={handleCreate}>
        Or, click here to create a group!
      </Button>
    </>
  );
};

const Popup = () => {
  const [state, setState] = useState('loading');
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState({});
  useEffect(() => {
    let session = localStorage.getItem('session');
    if (session) {
      let status = localStorage.getItem('status');
      setState('authenticated');
      setSession(session);
      setStatus(JSON.parse(status));
    } else {
      setState('login');
    }
  }, []);
  const renderSwitch = (state) => {
    switch (state) {
      case 'login':
        return <Login setStatus={setStatus} setState={setState} />;
      case 'authenticated':
        return <Status status={status} setState={setState} />;
      case 'group':
        return (
          <Group setState={setState} setStatus={setStatus} session={session} />
        );
      default:
        return <Spinner />;
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
        {renderSwitch(state)}
      </Flex>
      <Toaster />
    </ThemeProvider>
  );
};

export default Popup;
