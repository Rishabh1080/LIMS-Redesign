import { useEffect, useState } from 'react';
import './SampleCountStepper.scss';

export default function SampleCountStepper({
  value,
  min = 1,
  onChange,
  onDecrement,
  onIncrement,
  label = 'No. of samples:',
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

  return (
    <div className="smplfy-sample-count-stepper">
      <span className="smplfy-sample-count-label">{label}</span>
      <div className="smplfy-sample-count-control" role="group" aria-label={label}>
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
          aria-label={label}
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
