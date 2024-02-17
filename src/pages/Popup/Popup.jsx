import React from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
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
      localStorage.setItem('session', session)
      localStorage.setItem('status', JSON.stringify(status))
    } else {
      setSession('');
      setMagicCodeStatus('')
      toast.error(`Sorry, that's an invalid magic code!`, {position: 'bottom-center',});
    }
  };
  let handleEmail = async (e) => {
    setEmailStatus('loading');
    let status = validateEmail(email) ? await fetch(
      'https://treehacks-backend-xi.vercel.app/api/login',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
        }),
      }
    ).then((r) => r.json()) : {success: false};
    if (status.success) {
      setEmailStatus('')
      setEmail('')
      toast.success(`Email sent! Check your inbox for a magic code.`, {position: 'bottom-center',})
    } else {
      setEmailStatus('')
      toast.error(`Invalid email. Try again?`, {position: 'bottom-center',})
    }
  };
  return (
    <>
      <Heading as="h1">Friction</Heading>
      <Box style={{ width: '100%' }} mb={1}>
        <Text>Need a magic code? Enter your email:</Text>
        <Flex sx={{ gap: 2 }} mt={1}>
          <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
          <Button onClick={handleEmail} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
          }}>
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
      <Box style={{ width: '100%' }} mb={1}>
        <Text>Got a magic code? Enter it here:</Text>
        <Flex sx={{ gap: 2 }} mt={1}>
          <Input value={session} onChange={e => setSession(e.target.value)} placeholder="cal1...." />
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

const  Status = ({status})=> {
  return (
    <>
      <Heading as="h1" mb={2}>{status.group.code}</Heading>
      <Grid columns={2}>
        <Card variant='sunken' sx={{ textAlign: 'center' }}>
          You've all scrolled
          <Heading as="h1" mt={2}>{status.sum}px</Heading>
        </Card>
        <Card variant='sunken' sx={{ textAlign: 'center' }}>
          Your current friction is
          <Heading as="h1" mt={2}>{Math.max(status.friction, 0)}</Heading>
        </Card>
      </Grid>
      {status.group.users.map(user => {
        return (
          <Card variant='sunken' sx={{display: 'flex', gap: 2, width: '100%', alignItems: 'center', justifyContent: 'center'}}>
            <Avatar src={user.image} size={32} />
            <Box sx={{flexGrow: 1}}>{user.name}</Box>
            <Box>{status.blame[user.id]}</Box>
          </Card>
        )
      })}
      <p style={{ wordWrap: 'break-word', display: 'none'}}>
        {JSON.stringify(status)}
      </p>
      <a href="#" onClick={() => {
        localStorage.clear()
      }}>Logout</a>
    </>
  )
}

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
      setStatus(JSON.parse(status))
    } else {
      setState('login');
    }
  }, [name]);
  const renderSwitch = (state) => {
    switch (state) {
      case 'login':
        return <Login setStatus={setStatus} setState={setState} />;
      case 'authenticated':
        return <Status status={status} />
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
          height: '100vh',
          overflowY: 'scroll',
          my: 2
        }}
      >
        {renderSwitch(state)}
      </Flex>
      <Toaster />
    </ThemeProvider>
  );
};

export default Popup;
