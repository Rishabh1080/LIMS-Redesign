'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveConfig } from './config';
import { clearNamespace, readJSON, storageKeys, writeJSON } from './lib/storage';
import { firstName, labNameOf } from './lib/format';
import { LimsStoreProvider } from './store/LimsStore';
import { DEFAULT_DOMAIN, domainIdFor, domainIdsOf, getPack, isDomainId } from './store/domains';
import { TourProvider } from './tour/TourProvider';
import { TourOverlay } from './tour/TourOverlay';
import { chapters as defaultChapters } from './tour/chapters';
import { OnboardingFlow } from './onboarding/OnboardingFlow';
import { LabSetup } from './onboarding/LabSetup';
import { SmallScreenNotice } from './lims/LimsApp';
import { ProtoLims } from './proto/ProtoLims';
import { useViewportWidth } from './lib/hooks';
import './styles/tokens.css';
import './styles/base.css';
import './styles/onboarding.css';
import './styles/domain.css';
import './styles/lims.css';
import './styles/tour.css';
import './styles/experience.css';

/** Reads ?reset=1, ?tracker=fab|sidebar and ?domain=<lab type> once; strips ?reset from the URL. */
function consumeUrlParams(config) {
  if (!config.readUrlParams || typeof window === 'undefined') return {};
  const url = new URL(window.location.href);
  const reset = url.searchParams.get('reset') === '1';
  const tracker = url.searchParams.get('tracker');
  const domain = url.searchParams.get('domain');
  if (reset) {
    clearNamespace(`${config.storageKey}:`);
    url.searchParams.delete('reset');
    window.history.replaceState(window.history.state, '', url.toString());
  }
  return {
    reset,
    tracker: ['sidebar', 'fab'].includes(tracker) ? tracker : null,
    // One lab type, or several joined with commas: ?domain=food,water
    domain: isDomainId(domain) ? domainIdFor(domainIdsOf(domain)) : null,
  };
}

/**
 * Public entry point. Renders nothing interactive on the server; everything
 * starts after mount so it is safe inside Next.js (App Router or Pages).
 */
export function SampleifyGuidedTour({ config }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="sgt-root sgt-root--booting" aria-busy="true" />;
  return <GuidedTourApp config={config} />;
}

function GuidedTourApp({ config: userConfig }) {
  const config = useMemo(() => resolveConfig(userConfig), [userConfig]);
  const [urlParams] = useState(() => consumeUrlParams(config));
  const keys = useMemo(() => storageKeys(config.storageKey), [config.storageKey]);
  const rootRef = useRef(null);
  const configRef = useRef(config);
  configRef.current = config;

  const [profile, setProfile] = useState(() => readJSON(keys.profile));
  const [stage, setStage] = useState(() => (profile?.verifiedAt ? 'app' : 'onboarding'));
  const [session, setSession] = useState(0);
  const trackerPlacement = urlParams.tracker ?? config.trackerPlacement;
  // Visitors who onboarded before lab types existed get the general lab.
  const domain = isDomainId(profile?.domain) ? domainIdFor(domainIdsOf(profile.domain)) || profile.domain : DEFAULT_DOMAIN;
  const pack = getPack(domain);
  const viewportWidth = useViewportWidth();
  const [smallScreenAck, setSmallScreenAck] = useState(false);
  // The LIMS is desktop-first. On small screens, say so once before the tour starts.
  const showSmallScreenNotice = stage === 'app' && viewportWidth < 1024 && !smallScreenAck;

  const track = useCallback((name, props = {}) => {
    try {
      configRef.current.onEvent(name, props);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[sampleify-tour] onEvent threw', error);
    }
  }, []);

  const resetTrackedRef = useRef(false);
  useEffect(() => {
    if (!urlParams.reset || resetTrackedRef.current) return;
    resetTrackedRef.current = true;
    track('tour_reset', { source: 'url' });
  }, [urlParams.reset, track]);

  const saveProfile = useCallback(
    (next) => {
      setProfile(next);
      writeJSON(keys.profile, next);
    },
    [keys.profile],
  );

  const completeOnboarding = ({ name, labName, phone, domain: labType }) => {
    saveProfile({ name, labName, phone, domain: labType, verifiedAt: new Date().toISOString() });
    try {
      configRef.current.onLeadCaptured({
        name,
        labName,
        phone: `+91${phone}`,
        labType,
        labTypes: domainIdsOf(labType),
        labTypeLabel: getPack(labType).label,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[sampleify-tour] onLeadCaptured threw', error);
    }
    setStage('setup');
  };

  const startOver = () => {
    clearNamespace(`${config.storageKey}:`);
    track('tour_reset', { source: 'menu' });
    setProfile(null);
    setSession((value) => value + 1);
    setStage('onboarding');
  };

  const tourCtx = useMemo(
    () => ({ firstName: firstName(profile?.name ?? ''), labName: labNameOf(profile), trackerPlacement, pack }),
    [profile, trackerPlacement, pack],
  );

  return (
    <div className="sgt-root" ref={rootRef}>
      {stage === 'onboarding' ? (
        <OnboardingFlow
          key={session}
          initial={profile}
          presetDomain={urlParams.domain}
          supportPhone={config.supportPhone}
          track={track}
          onProgress={(partial) => saveProfile({ ...(profile ?? {}), ...partial, verifiedAt: null })}
          onComplete={completeOnboarding}
        />
      ) : null}

      {stage === 'setup' || stage === 'app' ? (
        <LimsStoreProvider key={`${session}-${domain}`} storageKey={keys.lims} domain={domain}>
          <TourProvider
            chapters={defaultChapters}
            storageKey={keys.tour}
            ctx={tourCtx}
            track={track}
            rootRef={rootRef}
            suspended={stage !== 'app' || showSmallScreenNotice}
          >
            <div className={stage === 'app' ? 'sgt-app-reveal' : 'sgt-app-behind'}>
              <ProtoLims
                profile={profile}
                supportPhone={config.supportPhone}
                trackerPlacement={trackerPlacement}
                onStartOver={startOver}
                inert={stage !== 'app' || showSmallScreenNotice}
              />
            </div>
            <TourOverlay ctaUrl={config.ctaUrl} ctaLabel={config.ctaLabel} />
          </TourProvider>
        </LimsStoreProvider>
      ) : null}

      {stage === 'setup' ? <LabSetup labName={labNameOf(profile)} pack={pack} onDone={() => setStage('app')} /> : null}
      {showSmallScreenNotice ? <SmallScreenNotice onContinue={() => setSmallScreenAck(true)} /> : null}
    </div>
  );
}
