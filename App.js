import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  LoginManager,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';

const Button = ({ children, ...rest }) => (
  <TouchableOpacity style={styles.button} {...rest}>
    {children}
  </TouchableOpacity>
);

const AUTH_MODE = {
  Not_Authenticated: 0,
  Google: 1,
  Facebook: 2,
};

const App = () => {
  const [user, setUser] = useState({});
  const [authMode, setAuthMode] = useState('');
  // always connect to Google Signin Service
  useEffect(() => {
    GoogleSignin.configure();
  }, []);

  const loginWithGoogle = async () => {
    try {
      console.log('inside loginWithGoogle');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('user:', user);
      setUser(userInfo.user);
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
      setUser(userData);
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

  console.log('inside logout', user, authMode);

  return (
    <View style={styles.container}>
      {user?.email ? (
        <View>
          <Button onPress={logOut}>
            <Text>Logout</Text>
          </Button>
        </View>
      ) : (
        <View>
          <Button onPress={loginWithGoogle}>
            <Text style={styles.buttonText}>Login with Google</Text>
          </Button>
          <Button onPress={loginWithFacebook}>
            <Text style={styles.buttonText}>Login with Facebook</Text>
          </Button>
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
  button: {
    width: 200,
    padding: 16,
    backgroundColor: '#e2e2e2',
    margin: 8,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  buttonText: { color: 'black' },
});

export default App;
