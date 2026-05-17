import AppIcon from '../AppIcon';
import './LinkItem.scss';

const stateClassByName = {
  default: 'default',
  focussed: 'focussed',
  focused: 'focussed',
  hover: 'hover',
  onpress: 'onpress',
  pressed: 'onpress',
};

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function normalizeState(state) {
  const normalizedState = String(state ?? 'default')
    .replace(/\s+/g, '')
    .toLowerCase();

  return stateClassByName[normalizedState] ?? 'default';
}

export default function LinkItem({
  children,
  label,
  href,
  state = 'default',
  className = '',
  target,
  rel,
  type = 'button',
  ...props
}) {
  const normalizedState = normalizeState(state);
  const resolvedLabel = children ?? label;
  const classNames = joinClasses(
    'smplfy-link',
    'link-primary',
    className,
  );
  const stateProps = normalizedState === 'default' ? {} : { 'data-smplfy-state': normalizedState };

  if (href) {
    const resolvedRel = target === '_blank' ? rel ?? 'noreferrer' : rel;

    return (
      <a className={classNames} href={href} target={target} rel={resolvedRel} {...stateProps} {...props}>
        <span>{resolvedLabel}</span>
        <AppIcon name="external-link" size={16} stroke={2} aria-hidden="true" />
      </a>
    );
  }

  return (
    <button type={type} className={classNames} {...stateProps} {...props}>
      <span>{resolvedLabel}</span>
      <AppIcon name="external-link" size={16} stroke={2} aria-hidden="true" />
    </button>
  );
}
