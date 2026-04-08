import PrimaryButton from '../PrimaryButton/PrimaryButton';
import SecondaryButton from '../SecondaryButton';

export function ViewTestRequestButton({ iconOnly = false, className = '', ...props }) {
  return (
    <SecondaryButton
      size="small"
      className={['tr-secondary-action', className].filter(Boolean).join(' ')}
      aria-label="View request"
      leftIcon="eye"
      {...props}
    >
      {iconOnly ? null : 'View'}
    </SecondaryButton>
  );
}

export function AllocateTestRequestButton({ className = '', ...props }) {
  return (
    <PrimaryButton
      leftIcon="workspace"
      size="small"
      className={['tr-primary-action', className].filter(Boolean).join(' ')}
      {...props}
    >
      Allocate
    </PrimaryButton>
  );
}
