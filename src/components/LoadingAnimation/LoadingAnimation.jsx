import './LoadingAnimation.scss';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function LoadingAnimation({ title = 'Loading version', className = '' }) {
  return (
    <section className={joinClasses('smplfy-loading-screen', className)} aria-live="polite" aria-busy="true">
      <h2 className="smplfy-loading-screen__title">{title}</h2>
      <div className="smplfy-progress progress" aria-hidden="true">
        <div className="progress-bar" />
      </div>
    </section>
  );
}
