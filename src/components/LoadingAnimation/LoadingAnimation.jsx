import './LoadingAnimation.css';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function LoadingAnimation({ title = 'Loading version', className = '' }) {
  return (
    <section className={joinClasses('smplfy-loading-screen', className)} aria-live="polite" aria-busy="true">
      <h2 className="smplfy-loading-screen__title">{title}</h2>
      <div className="smplfy-loading-animation" aria-hidden="true">
        <div className="smplfy-loading-animation__track">
          <div className="smplfy-loading-animation__fill" />
        </div>
      </div>
    </section>
  );
}
