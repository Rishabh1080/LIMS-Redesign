import AppIcon from '../AppIcon';
import './SearchResult.scss';

const stateClassByName = {
  default: 'default',
  hover: 'hover',
  onpress: 'pressed',
  pressed: 'pressed',
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

export default function SearchResult({
  label,
  address,
  state = 'default',
  className = '',
  type = 'button',
  ...props
}) {
  const normalizedState = normalizeState(state);

  return (
    <button
      type={type}
      className={joinClasses(
        'smplfy-list-group-item',
        'list-group-item',
        'list-group-item-action',
        'smplfy-search-result',
        normalizedState === 'pressed' && 'active',
        className,
      )}
      {...props}
    >
      <span>{label}</span>
      <span>{address}</span>
      <AppIcon name="external-link" size={20} stroke={2} aria-hidden="true" />
    </button>
  );
}
