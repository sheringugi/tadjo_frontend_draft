import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const CardPayment = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleCardPayment = async () => {
        if (!stripe || !elements) return;
        setLoading(true);

        try {
            // STEP 1: Get client_secret from backend
            // Like getting CheckoutRequestID from M-Pesa
            const token = localStorage.getItem('access_token');
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/payments/create-intent`,
                {
                    amount: amount,
                    payment_method: "card"
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const { client_secret } = data;

            // STEP 2: Confirm payment with card details
            // Like customer entering M-Pesa PIN
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                client_secret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement)
                    }
                }
            );

            if (error) {
                onError(error.message);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                // STEP 3: Payment confirmed
                // Like receiving M-Pesa ResultCode: 0
                onSuccess(paymentIntent.id);
            }

        } catch (err) {
            onError('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Stripe renders the card input securely */}
            <div className="border rounded-lg p-4 mb-4 bg-white">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                fontFamily: 'Inter, sans-serif',
                                '::placeholder': {
                                    color: '#aab7c4'
                                }
                            },
                            invalid: {
                                color: '#e53e3e'
                            }
                        },
                        hidePostalCode: true
                    }}
                />
            </div>

            <button
                onClick={handleCardPayment}
                disabled={loading || !stripe}
                className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
                {loading ? 'Processing...' : `Pay CHF ${amount}`}
            </button>
        </div>
    );
};

export default CardPayment;