/*eslint-disable */
import babel from '@babel/polyfill';
import { showAlert } from './alert';
import axios from 'axios';

// TYpe password or data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/user/update-password'
        : '/api/v1/user/update-me';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
      withCredentials: true,
    });

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (error) {
    showAlert('error', error.response.data.message);
  }
};
