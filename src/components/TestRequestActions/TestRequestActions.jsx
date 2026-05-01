import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton';

export function ViewTestRequestButton({ iconOnly = false, className = '', size = 'medium', ...props }) {
  return (
    <SecondaryButton
      size={size}
      className={['tr-secondary-action', className].filter(Boolean).join(' ')}
      aria-label="View request"
      leftIcon="eye"
      {...props}
    >
      {iconOnly ? null : 'View'}
    </SecondaryButton>
  );
}

export function AllocateTestRequestButton({ className = '', size = 'medium', ...props }) {
  return (
    <PrimaryButton
      leftIcon="workspace"
      size={size}
      className={['tr-primary-action', className].filter(Boolean).join(' ')}
      {...props}
    >
      Allocate
    </PrimaryButton>
  );
}
