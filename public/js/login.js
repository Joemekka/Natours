/*eslint-disable */
import babel from '@babel/polyfill';
import { showAlert } from './alert';
import axios from 'axios';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/user/login',
      data: {
        email,
        password,
      },
      withCredentials: true,
    });
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/user/logout',
    });
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    showAlert('error', 'Something went wrong! Try again');
  }
};
