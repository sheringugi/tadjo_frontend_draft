import { useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';

const TwintPayment = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const [loading, setLoading] = useState(false);

    const handleTwintPayment = async () => {
        if (!stripe) return;
        setLoading(true);

        try {
            // STEP 1: Get client_secret from backend
            const token = localStorage.getItem('access_token');
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/payments/create-intent`,
                {
                    amount: amount,
                    payment_method: "twint"
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const { client_secret } = data;

            // STEP 2: Confirm Twint payment
            // Stripe automatically opens Twint app on phone
            const { error, paymentIntent } = await stripe.confirmTwintPayment(
                client_secret,
                {
                    return_url: `${window.location.origin}/orders/confirmation`
                }
            );

            if (error) {
                onError(error.message);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id);
            }

        } catch (err) {
            onError('Twint payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                    {/* Twint Logo */}
                    <img
                        src="/twint-logo.png"
                        alt="Twint"
                        className="h-8"
                    />
                    <div>
                        <p className="font-medium">Pay with Twint</p>
                        <p className="text-sm text-gray-500">
                            You will be redirected to the Twint app
                        </p>
                    </div>
                </div>
            </div>

            <button
                onClick={handleTwintPayment}
                disabled={loading || !stripe}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
            >
                {loading ? 'Opening Twint...' : `Pay CHF ${amount} with Twint`}
            </button>
        </div>
    );
};

export default TwintPayment;