import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import './Payment.css';

const Payment = ({ amount }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showQRCode, setShowQRCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePaymentMethodChange = (e) => {
    const method = e.target.value;
    setPaymentMethod(method);
    setShowQRCode(method === 'gpay');
    setPaymentSuccess(false);
  };

  const handlePayment = () => {
    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  const generateUPIString = () => {
    const merchantUPI = 'merchant@upi';
    return `upi://pay?pa=${merchantUPI}&am=${amount}&cu=INR&tn=Hospital Payment`;
  };

  return (
    <div className="payment-section">
      <h3>Mode of Payment</h3>
      <div className="payment-options">
        <label className={paymentMethod === 'cash' ? 'selected' : ''}>
          <input
            type="radio"
            name="paymentMethod"
            value="cash"
            checked={paymentMethod === 'cash'}
            onChange={handlePaymentMethodChange}
          />
          Cash
        </label>
        <label className={paymentMethod === 'gpay' ? 'selected' : ''}>
          <input
            type="radio"
            name="paymentMethod"
            value="gpay"
            checked={paymentMethod === 'gpay'}
            onChange={handlePaymentMethodChange}
          />
          GPay
        </label>
      </div>

      {showQRCode && (
        <div className="qr-container">
          <h4>Scan QR Code to Pay</h4>
          <div className="qr-code">
            <QRCode
              value={generateUPIString()}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="upi-details">
            <p>Amount: ₹{amount}</p>
            <p>UPI ID: merchant@upi</p>
            <p>Scan the QR code using any UPI app to make the payment</p>
          </div>
        </div>
      )}

      <button 
        className="pay-button"
        onClick={handlePayment}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Complete Payment'}
      </button>

      {paymentSuccess && (
        <div className="success-message">
          Payment successful! Thank you for your payment.
        </div>
      )}
    </div>
  );
};

export default Payment; 