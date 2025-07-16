import React, { forwardRef, useState } from 'react';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

// Skip Links Component
export const SkipLinks = ({ sections = [], isVisible }) => {
  return (
    <div 
      className={`skip-links ${isVisible ? 'visible' : ''}`}
      style={{
        position: 'absolute',
        top: '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease, top 0.3s ease'
      }}
    >
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            margin: '4px',
            background: '#000',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500'
          }}
          onFocus={(e) => {
            e.target.style.top = '10px';
          }}
          onBlur={(e) => {
            e.target.style.top = '-100px';
          }}
        >
          {section.label}
        </a>
      ))}
    </div>
  );
};

// Button accessibile con tutti gli attributi ARIA
export const AccessibleButton = forwardRef(({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  ariaLabel,
  ariaDescribedBy,
  ariaExpanded,
  ariaPressed,
  ariaHasPopup,
  className = '',
  style = {},
  type = 'button',
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const baseStyle = {
    position: 'relative',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    fontWeight: '500',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style
  };

  const sizeStyles = {
    small: { padding: '6px 12px', fontSize: '14px' },
    medium: { padding: '10px 16px', fontSize: '16px' },
    large: { padding: '14px 20px', fontSize: '18px' }
  };

  const variantStyles = {
    primary: {
      background: disabled ? '#ccc' : '#007bff',
      color: '#fff',
      boxShadow: isFocused ? '0 0 0 3px rgba(0, 123, 255, 0.25)' : 'none'
    },
    secondary: {
      background: disabled ? '#f8f9fa' : '#6c757d',
      color: disabled ? '#999' : '#fff',
      boxShadow: isFocused ? '0 0 0 3px rgba(108, 117, 125, 0.25)' : 'none'
    },
    success: {
      background: disabled ? '#ccc' : '#28a745',
      color: '#fff',
      boxShadow: isFocused ? '0 0 0 3px rgba(40, 167, 69, 0.25)' : 'none'
    },
    warning: {
      background: disabled ? '#ccc' : '#ffc107',
      color: '#000',
      boxShadow: isFocused ? '0 0 0 3px rgba(255, 193, 7, 0.25)' : 'none'
    },
    danger: {
      background: disabled ? '#ccc' : '#dc3545',
      color: '#fff',
      boxShadow: isFocused ? '0 0 0 3px rgba(220, 53, 69, 0.25)' : 'none'
    }
  };

  const buttonStyle = {
    ...baseStyle,
    ...sizeStyles[size],
    ...variantStyles[variant],
    opacity: disabled || loading ? 0.6 : 1,
    transform: isPressed ? 'translateY(1px)' : 'translateY(0)'
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-haspopup={ariaHasPopup}
      aria-busy={loading}
      className={className}
      style={buttonStyle}
      onClick={onClick}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

// Input accessibile con label e validazione
export const AccessibleInput = forwardRef(({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error,
  helpText,
  ariaDescribedBy,
  className = '',
  style = {},
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  const describedBy = [ariaDescribedBy, errorId, helpId].filter(Boolean).join(' ');

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `2px solid ${error ? '#dc3545' : isFocused ? '#007bff' : '#ced4da'}`,
    borderRadius: '6px',
    fontSize: '16px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: isFocused ? `0 0 0 3px ${error ? 'rgba(220, 53, 69, 0.25)' : 'rgba(0, 123, 255, 0.25)'}` : 'none',
    ...style
  };

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '6px',
            fontWeight: '500',
            color: error ? '#dc3545' : '#333'
          }}
        >
          {label}
          {required && <span aria-label="richiesto" style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : 'false'}
        style={inputStyle}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          style={{
            marginTop: '4px',
            fontSize: '14px',
            color: '#dc3545',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AlertTriangle size={16} aria-hidden="true" />
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div
          id={helpId}
          style={{
            marginTop: '4px',
            fontSize: '14px',
            color: '#6c757d'
          }}
        >
          {helpText}
        </div>
      )}
    </div>
  );
});

AccessibleInput.displayName = 'AccessibleInput';

// Modal accessibile con focus trap
export const AccessibleModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnEscape = true,
  closeOnOverlay = true,
  className = '',
  style = {}
}) => {
  const modalRef = React.useRef(null);
  const [previousFocus, setPreviousFocus] = useState(null);

  const sizeStyles = {
    small: { maxWidth: '400px' },
    medium: { maxWidth: '600px' },
    large: { maxWidth: '800px' },
    fullscreen: { maxWidth: '95vw', maxHeight: '95vh' }
  };

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      setPreviousFocus(document.activeElement);
      
      // Focus sul modal quando si apre
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 100);
    } else if (previousFocus) {
      previousFocus.focus();
    }
  }, [isOpen, previousFocus]);

  // Keyboard handling
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }

      // Focus trap
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        ref={modalRef}
        className={className}
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          ...sizeStyles[size],
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          ...style
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 id="modal-title" style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
              {title}
            </h2>
            <AccessibleButton
              onClick={onClose}
              variant="secondary"
              size="small"
              ariaLabel="Chiudi modal"
              style={{ padding: '8px' }}
            >
              <X size={20} />
            </AccessibleButton>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

// Alert accessibile
export const AccessibleAlert = ({
  type = 'info',
  title,
  children,
  onDismiss,
  dismissible = true,
  className = '',
  style = {}
}) => {
  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    danger: <AlertTriangle size={20} />
  };

  const colors = {
    info: { bg: '#d1ecf1', border: '#b8daff', text: '#0c5460' },
    success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
    warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404' },
    danger: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' }
  };

  const alertStyle = {
    padding: '16px',
    borderRadius: '8px',
    border: `1px solid ${colors[type].border}`,
    backgroundColor: colors[type].bg,
    color: colors[type].text,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    ...style
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={className}
      style={alertStyle}
    >
      <div aria-hidden="true" style={{ flexShrink: 0, marginTop: '2px' }}>
        {icons[type]}
      </div>
      
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {title}
          </div>
        )}
        <div>{children}</div>
      </div>
      
      {dismissible && (
        <AccessibleButton
          onClick={onDismiss}
          size="small"
          variant="secondary"
          ariaLabel="Chiudi avviso"
          style={{
            padding: '4px',
            background: 'transparent',
            color: 'inherit',
            border: 'none',
            flexShrink: 0
          }}
        >
          <X size={16} />
        </AccessibleButton>
      )}
    </div>
  );
};

// CSS per animazioni e focus styles
export const AccessibilityStyles = () => (
  <style jsx global>{`
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .skip-links.visible {
      top: 10px !important;
    }
    
    /* High contrast mode support */
    @media (prefers-contrast: high) {
      button, input, select, textarea {
        border-width: 2px !important;
      }
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* Focus indicators */
    :focus-visible {
      outline: 2px solid #007bff !important;
      outline-offset: 2px !important;
    }
    
    /* Screen reader only content */
    .sr-only {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
  `}</style>
);
