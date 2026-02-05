/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51Sv6sIC3e9HrFTyyJqrcE47s7HWkk2iHDahcEUjpIWqVSk0t3x4SqZK07yRUkDM5a1beEk5nFSQgKLwQDSq0DvzU008Ggt9i2o',
);

export const bookTour = async (tourId) => {
  try {
    // Get checkout session from api
    const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
    console.log(session);

    // Create vceckout form and charge cc
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert('error', error);
    console.log(error);
  }
};
