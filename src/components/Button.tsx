import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

export type ButtonVariant = 'filled' | 'outlined';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'filled',
      size = 'md',
      color = 'primary',
      icon: Icon,
      iconPosition = 'left',
      isLoading = false,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    // Icon size based on button size
    const iconSizes = {
      sm: 16,
      md: 20,
      lg: 24,
    };

    // Color classes for filled variant
    const filledColorClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800',
      success: 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 active:bg-yellow-800',
      info: 'bg-cyan-600 text-white hover:bg-cyan-700 active:bg-cyan-800',
    };

    // Color classes for outlined variant
    const outlinedColorClasses = {
      primary: 'border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
      secondary: 'border-gray-600 text-gray-600 hover:bg-gray-50 active:bg-gray-100',
      success: 'border-green-600 text-green-600 hover:bg-green-50 active:bg-green-100',
      danger: 'border-red-600 text-red-600 hover:bg-red-50 active:bg-red-100',
      warning: 'border-yellow-600 text-yellow-600 hover:bg-yellow-50 active:bg-yellow-100',
      info: 'border-cyan-600 text-cyan-600 hover:bg-cyan-50 active:bg-cyan-100',
    };

    const variantClasses =
      variant === 'filled'
        ? filledColorClasses[color]
        : `border-2 bg-white ${outlinedColorClasses[color]}`;

    const baseClasses = `
      inline-flex items-center justify-center gap-2 
      font-semibold rounded-lg transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500
      disabled:opacity-50 disabled:cursor-not-allowed
      ${sizeClasses[size]}
      ${variantClasses}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <button
        ref={ref}
        className={baseClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin"
              width={iconSizes[size]}
              height={iconSizes[size]}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} />}
            {children}
            {Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
