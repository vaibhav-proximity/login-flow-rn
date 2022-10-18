import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import auth from '@react-native-firebase/auth';
import SocialButton from './src/components/SocialButton';
import Button from './src/components/Button';
import googleIcon from './src/assets/google.png';
import facebookIcon from './src/assets/facebook.png';

const AUTH_MODE = {
  Not_Authenticated: 0,
  Google: 1,
  Facebook: 2,
};

const App = () => {
  // social login
  const [user, setUser] = useState({});
  const [authMode, setAuthMode] = useState('');

  // phone auth
  const [number, setNumber] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');

  // always connect to Google Signin Service
  useEffect(() => {
    GoogleSignin.configure();
  }, []);

  const loginWithGoogle = async () => {
    try {
      console.log('inside loginWithGoogle');
      await GoogleSignin.hasPlayServices();
      const { user } = await GoogleSignin.signIn();
      console.log('user:', user);
      setUser({
        email: user.email,
        name: user.name,
        image: user.image,
      });
      setAuthMode(AUTH_MODE.Google);
    } catch (error) {
      console.error('error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  /**
   * @description Actual Helper function to call FB Login Service
   */
  const fbLoginUtil = resCallback => {
    LoginManager.logOut();
    return LoginManager.logInWithPermissions(['email', 'public_profile']).then(
      res => {
        console.log('res>>>', res);
        if (
          res.declinedPermissions &&
          res.declinedPermissions.includes('email')
        ) {
          resCallback({ message: 'Email is required!' });
        }
        if (res.isCancelled) {
          console.error('User cancelled!!!');
        } else {
          const infoRequest = new GraphRequest(
            '/me?fields=email,name,picture',
            null,
            resCallback,
          );
          new GraphRequestManager().addRequest(infoRequest).start();
        }
      },
      err => console.error('Login Failed: ', err),
    );
  };

  /**
   * @description Callback function to pass to async call for FB Connect
   */
  const _responseInfoCallback = async (err, res) => {
    if (err) {
      console.error('err:', err);
      return;
    } else {
      const userData = res;
      console.log('fb user:', userData);
      setUser({
        email: userData.email,
        name: userData.name,
        image: userData.picture.data.url,
      });
      setAuthMode(AUTH_MODE.Facebook);
    }
  };

  const loginWithFacebook = async () => {
    console.log('inside fb login');
    try {
      await fbLoginUtil(_responseInfoCallback);
    } catch (err) {
      console.error('err:', err);
    }
  };

  const logOut = async () => {
    console.log('inside logout', user, authMode);
    if (authMode === AUTH_MODE.Google) {
      await GoogleSignin.signOut();
    } else if (authMode === AUTH_MODE.Facebook) {
      LoginManager.logOut();
    }
    setUser({});
    setAuthMode(AUTH_MODE.Not_Authenticated);
  };

  // Handle the button press
  const signInWithPhoneNumber = async () => {
    console.log('signing in with', number);
    try {
      const confirmation = await auth().signInWithPhoneNumber('+91 ' + number);
      setConfirm(confirmation);
    } catch (e) {
      console.error('signining in with phone no error...', e);
      setConfirm(null);
    }
  };

  const confirmCode = async () => {
    try {
      await confirm.confirm(code);
      console.log('logged in with phone no!!!');
      setUser({
        name: 'Numbered user',
        email: 'Mob>> +91' + number,
        image: '',
      });
    } catch (error) {
      console.log('Invalid code.');
    }
  };

  const onAuthStateChanged = cs => {
    setUser(cs);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  return (
    <View style={styles.container}>
      {user?.email ? (
        <View>
          <Image source={user.image} style={styles.user.image} />
          <Text style={styles.user.name}>Hello {user.name}!</Text>
          <Button text="Logout" onPress={logOut} />
        </View>
      ) : (
        <View>
          {confirm === null ? (
            <>
              <SocialButton
                icon={googleIcon}
                text="Google"
                onPress={loginWithGoogle}
              />
              <SocialButton
                icon={facebookIcon}
                text="Facebook"
                onPress={loginWithFacebook}
              />
              <TextInput
                value={number}
                onChangeText={setNumber}
                placeholder="phone number"
                keyboardType="number-pad"
                style={styles.input}
              />
              <Button text="Login" onPress={signInWithPhoneNumber} />
            </>
          ) : (
            <>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="enter OTP"
                keyboardType="number-pad"
                style={styles.input}
              />
              <Button text="Proceed" onPress={confirmCode} />
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  user: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    image: { height: 40, width: 40, borderRadius: 20 },
    name: { fontSize: 20 },
  },
  input: {
    borderBottomColor: 'black',
  },
});

export default App;
