// Mounts the prototype screens (TutorialApp) on the tutorial's store, plus the
// tour's floating tracker. Replaces the old hand-built LIMS replica.
// Same global styles, in the same order, as the prototype's main.jsx.
import 'bootstrap/dist/css/bootstrap.min.css';
import '@proto/design-system.scss';
import '@proto/styles.scss';
import { useCallback } from 'react';
import { useLims } from '../store/LimsStore';
import { useTour } from '../tour/TourProvider';
import { FabTracker } from '../tour/ProgressTracker';
import { firstName, labNameOf } from '../lib/format';
import { TutorialApp } from './TutorialApp';
import '../styles/proto.css';

export function ProtoLims({ profile, supportPhone, trackerPlacement, onStartOver, inert = false }) {
  const { state, dispatch } = useLims();
  const tour = useTour();
  const setState = useCallback((update) => dispatch({ type: 'proto/set', payload: { update } }), [dispatch]);

  return (
    <>
      <TutorialApp
        state={state.proto}
        setState={setState}
        labName={labNameOf(profile)}
        userName={profile?.name || firstName(profile?.name) || 'You'}
        supportPhone={supportPhone}
        onRestartTour={tour.actions.restart}
        onStartOver={onStartOver}
        inert={inert}
      />
      {trackerPlacement === 'fab' && !inert ? <FabTracker /> : null}
    </>
  );
}
