import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const Button = ({ text, ...rest }) => (
  <TouchableOpacity style={styles.button} {...rest}>
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 150,
    padding: 16,
    backgroundColor: '#0e9e38',
    margin: 8,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  text: { color: 'white', fontSize: 16 },
});

export default Button;
