import { useEffect, useState } from 'react';
import './SampleCountStepper.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function SampleCountStepper({
  value,
  min = 1,
  onChange,
  onDecrement,
  onIncrement,
  label = 'No. of samples:',
  className = '',
}) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  const commitValue = () => {
    const parsedValue = Number(draftValue);
    const nextValue = Number.isFinite(parsedValue)
      ? Math.max(min, Math.trunc(parsedValue))
      : value;

    setDraftValue(String(nextValue));
    if (nextValue !== value) onChange?.(nextValue);
  };

  const accessibleLabel = label || 'Number of samples';

  return (
    <div className={joinClasses('smplfy-sample-count-stepper', className)}>
      {label ? <span className="smplfy-sample-count-label">{label}</span> : null}
      <div className="smplfy-sample-count-control" role="group" aria-label={accessibleLabel}>
        <button
          type="button"
          className="smplfy-sample-count-button"
          aria-label="Remove one sample"
          disabled={value <= min}
          onClick={onDecrement}
        >
          −
        </button>
        <input
          className="smplfy-sample-count-value"
          type="number"
          min={min}
          step="1"
          aria-label={accessibleLabel}
          value={draftValue}
          onChange={(event) => setDraftValue(event.target.value)}
          onBlur={commitValue}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
        <button
          type="button"
          className="smplfy-sample-count-button"
          aria-label="Add one sample"
          onClick={onIncrement}
        >
          +
        </button>
      </div>
    </div>
  );
}
