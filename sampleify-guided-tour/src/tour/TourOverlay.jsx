import { useTour } from './TourProvider';
import { StepSpotlight } from './StepSpotlight';
import { ChapterComplete, TourIntro, WrapUp } from './TourDialogs';
import { GhostCursor } from './GhostCursor';

/** Renders whatever the tour needs on top of the LIMS right now. */
export function TourOverlay({ ctaUrl, ctaLabel }) {
  const { tour, step, suspended } = useTour();

  if (suspended) return null;
  if (tour.status === 'intro') return <TourIntro />;
  if (tour.status === 'celebrating') return <ChapterComplete />;
  if (tour.status === 'completed' && !tour.wrapUpDismissed) return <WrapUp ctaUrl={ctaUrl} ctaLabel={ctaLabel} />;
  if (tour.status === 'running' && step) {
    return (
      <>
        <StepSpotlight />
        <GhostCursor />
      </>
    );
  }
  return null;
}
