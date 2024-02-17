import React from 'react';
import logo from '../../assets/img/logo.svg';
import Greetings from '../../containers/Greetings/Greetings';
import {
  ThemeProvider,
  Input,
  Text,
  Heading,
  Flex,
  Button,
  Box,
  Spinner,
} from 'theme-ui';
import theme from './theme';
import './Popup.css';
import { useState, useEffect } from 'react';

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
    } else {
      setSession('');
      setMagicCodeStatus('')
      console.log('bad!');
    }
  };
  let handleEmail = async (e) => {
    setEmailStatus('loading');
    let status = await fetch(
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
    ).then((r) => r.json());
    if (status.success) {
      setEmailStatus('')
      console.log('sent!');
    } else {
      setSession('');
      setMagicCodeStatus('')
      console.log('bad!');
    }
  };
  return (
    <>
      <Heading as="h1">Friction</Heading>
      <Box style={{ width: '100%' }} mb={1}>
        <Text>Need a magic code? Enter your email:</Text>
        <Flex sx={{ gap: 2 }} mt={1}>
          <Input onChange={e => setEmail(e.target.value)} placeholder="email@example.com" />
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
          <Input onChange={e => setSession(e.target.value)} placeholder="cal1...." />
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
    <Box>
      <pre>
        {JSON.stringify(status)}
      </pre>
    </Box>
  )
}

const Popup = () => {
  const [state, setState] = useState('loading');
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState({});
  useEffect(() => {
    let session = localStorage.getItem('session');
    if (session) {
      setState('authenticated');
      setSession(session);
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
        }}
      >
        {renderSwitch(state)}
      </Flex>
    </ThemeProvider>
  );
};

export default Popup;
