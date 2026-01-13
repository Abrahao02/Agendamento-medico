import React from 'react';
import { useStripeCheckout } from '../../hooks/stripe/useStripeCheckout';
import Button from '../common/Button';
import { Zap } from 'lucide-react';

export default function StripeCheckoutButton({ 
  children, 
  variant = 'primary',
  className = '',
  showPaymentInfo = true,
  showIcon = true,
  ...props 
}) {
  const { handleCheckout, loading, error } = useStripeCheckout();

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={loading}
        loading={loading}
        variant={variant}
        className={className}
        leftIcon={!loading && showIcon ? <Zap size={18} /> : null}
        {...props}
      >
        {children || 'Assinar PRO'}
        {showPaymentInfo && !loading && (
          <span className="plan-payment-info">
            Cartão de crédito ou Pix
          </span>
        )}
      </Button>
      {error && (
        <p style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem' }}>
          {error}
        </p>
      )}
    </>
  );
}
