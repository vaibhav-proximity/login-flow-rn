import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

const SocialButton = ({ text, icon, ...rest }) => (
  <TouchableOpacity style={styles.button} {...rest}>
    <Image source={icon} style={styles.icon} />
    <Text style={styles.text}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: 150,
    padding: 16,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e2e2',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: { height: 16, width: 16, marginRight: 8 },
  text: { textTransform: 'uppercase', fontSize: 12, color: '#000' },
});

export default SocialButton;
