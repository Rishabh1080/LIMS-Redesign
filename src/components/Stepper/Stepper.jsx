import './Stepper.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function StepperItem({ label, state, position }) {
  return (
    <li
      className={joinClasses(
        'smplfy-stepper-item',
        `smplfy-stepper-item--${state}`,
        `smplfy-stepper-item--${position}`,
      )}
    >
      {position !== 'first' ? (
        <span className="smplfy-stepper-item__connector smplfy-stepper-item__connector--before" />
      ) : null}
      {position !== 'last' ? (
        <span className="smplfy-stepper-item__connector smplfy-stepper-item__connector--after" />
      ) : null}
      <span className="smplfy-stepper-item__indicator" />
      <span className="smplfy-stepper-item__label">{label}</span>
    </li>
  );
}

export default function Stepper({ items }) {
  return (
    <ol className="smplfy-stepper">
      {items.map((item, index) => {
        let position = 'middle';
        if (index === 0) position = 'first';
        if (index === items.length - 1) position = 'last';

        return (
          <StepperItem
            key={`${item.label}-${index}`}
            label={item.label}
            state={item.state}
            position={position}
          />
        );
      })}
    </ol>
  );
}
