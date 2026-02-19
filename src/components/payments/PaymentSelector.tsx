import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../utils/stripe';
import CardPayment from './CardPayment';
import TwintPayment from './TwintPayment';

const PaymentSelector = ({ amount, onSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [error, setError] = useState(null);

    return (
        <Elements stripe={stripePromise}>
            <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-4">
                    Select Payment Method
                </h3>

                {/* Payment Method Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setSelectedMethod('card')}
                        className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                            selectedMethod === 'card'
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-gray-700 border-gray-300'
                        }`}
                    >
                        💳 Bank Card
                    </button>

                    <button
                        onClick={() => setSelectedMethod('twint')}
                        className={`flex-1 py-3 rounded-lg border font-medium transition-all ${
                            selectedMethod === 'twint'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300'
                        }`}
                    >
                        📱 Twint
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Payment Form */}
                {selectedMethod === 'card' ? (
                    <CardPayment
                        amount={amount}
                        onSuccess={onSuccess}
                        onError={setError}
                    />
                ) : (
                    <TwintPayment
                        amount={amount}
                        onSuccess={onSuccess}
                        onError={setError}
                    />
                )}

                {/* Security Badge */}
                <p className="text-xs text-gray-400 text-center mt-4">
                    🔒 Secured by Stripe • PCI DSS Compliant
                </p>
            </div>
        </Elements>
    );
};

export default PaymentSelector;