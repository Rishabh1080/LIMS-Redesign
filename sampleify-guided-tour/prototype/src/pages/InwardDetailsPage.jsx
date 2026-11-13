import { useEffect, useMemo, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import NavSelector from '../components/NavSelector/NavSelector';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import StatusPill from '../components/StatusPill';
import { getInwardById } from '../data/inwardsDb';
import { getStatusPresentation } from '../status/statusRegistry';
import {
  DetailGrid,
  ProductCard,
  buildInwardDetailItems,
  splitDateTime,
} from './inwardDetailSections';
import './sample-details-page.scss';
import './product-details-page.scss';

/*
 * Inward Details.
 *
 * The inward is the consignment: one Inward Details card for the shared
 * context, then one card per product, each linking out to the sample it became.
 * No side rail here — the workflow actions live on the sample.
 */

function DetailsHeader({ inward, onBack }) {
  const { date, time } = splitDateTime(inward.createdOn);
  const status = getStatusPresentation('sample', inward.status);

  return (
    <section className="smplfy-sample-details-header bg-white border-bottom">
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <div className="d-flex align-items-start gap-3">
          <SecondaryButton
            size="medium"
            leftIcon="chevron-left"
            className="px-0 flex-shrink-0"
            aria-label="Go back"
            onClick={onBack}
          />

          <div className="d-flex flex-column">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <h1 className="h5 mb-0 fw-semibold text-dark">{inward.id}</h1>
              <StatusPill color={status.color} styleType={status.styleType}>
                {status.label}
              </StatusPill>
            </div>
            <div className="d-inline-flex gap-2 text-secondary fw-medium">
              <span>{date}</span>
              <span>{time}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/*
 * Jumps between the inward card and each product card. The active entry follows
 * the scroll position, so it doubles as a position indicator on long inwards.
 */
function SectionNav({ sections, activeId, onSelect }) {
  return (
    <nav className="smplfy-inward-section-nav" aria-label="Inward sections">
      <div className="nav nav-pills d-inline-flex align-items-center flex-wrap gap-1">
        {sections.map((section) => (
          <NavSelector
            key={section.id}
            size="medium"
            className="text-nowrap"
            active={activeId === section.id}
            aria-current={activeId === section.id ? 'true' : undefined}
            onClick={() => onSelect(section.id)}
          >
            {section.label}
          </NavSelector>
        ))}
      </div>
    </nav>
  );
}

/* Plain card, not an accordion: this is the context you always want in view. */
function InwardDetailsCard({ inward }) {
  return (
    <section
      id="inward-section-inward-details"
      className="smplfy-card card overflow-hidden smplfy-inward-section-target smplfy-sample-details-accordion is-expanded smplfy-sample-details-basic-card smplfy-product-details-sample-card"
    >
      <div className="card-header p-0" id="inward-details-heading">
        <div className="smplfy-product-details-card-header">
          <span className="card-title mb-0">Inward Details</span>
        </div>
      </div>
      <div className="card-body p-0" role="region" aria-labelledby="inward-details-heading">
        <DetailGrid items={buildInwardDetailItems(inward)} columns={4} />
      </div>
    </section>
  );
}

/* Each product is its own top-level card, wrapped so the shared ProductCard
   picks up the same "no inner ring" treatment it gets elsewhere. */
function InwardProductCard({ product, index, onGoToSample }) {
  return (
    <div
      id={`inward-section-product-${index + 1}`}
      className="smplfy-sample-details-products smplfy-inward-product-standalone smplfy-inward-section-target"
    >
      <ProductCard
        product={product}
        title={`Product ${index + 1} · ${product.name}`}
        action={(
          <PrimaryButton
            size="medium"
            rightIcon="arrow-up-right"
            onClick={() => onGoToSample?.(product)}
          >
            Go to sample
          </PrimaryButton>
        )}
      />
    </div>
  );
}

export default function InwardDetailsPage({
  inwardId,
  inward: inwardProp = null,
  onNavigate,
  onBack,
  onGoToSample,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  const inward = inwardProp ?? getInwardById(inwardId);
  const [activeSectionId, setActiveSectionId] = useState('inward-details');
  // Set while a click-driven scroll is in flight, so the observer does not
  // fight the user by highlighting sections we pass through on the way.
  const pendingSectionRef = useRef(null);

  const sections = useMemo(() => ([
    { id: 'inward-details', label: 'Inward Details' },
    ...(inward?.products ?? []).map((product, index) => ({
      id: `product-${index + 1}`,
      label: `Product ${index + 1}`,
    })),
  ]), [inward]);

  useEffect(() => {
    if (!inward) return undefined;

    const elements = sections
      .map((section) => document.getElementById(`inward-section-${section.id}`))
      .filter(Boolean);
    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        // Whichever tracked section is nearest the top of the scroller wins.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible.length) return;

        const nextId = visible[0].target.id.replace('inward-section-', '');
        if (pendingSectionRef.current && pendingSectionRef.current !== nextId) return;
        pendingSectionRef.current = null;
        setActiveSectionId(nextId);
      },
      {
        root: elements[0].closest('.lims-main-content'),
        rootMargin: '-72px 0px -55% 0px',
        threshold: 0,
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [inward, sections]);

  const handleSelectSection = (sectionId) => {
    pendingSectionRef.current = sectionId;
    setActiveSectionId(sectionId);
    document
      .getElementById(`inward-section-${sectionId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!inward) {
    return (
      <AppChrome
        activeNav="all-products"
        onNavigate={onNavigate}
        breadcrumbs={[
          { key: 'all-products', label: 'All inwards', onClick: onBack },
          { key: 'not-found', label: 'Inward not found', current: true },
        ]}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarCollapsedChange={onSidebarCollapsedChange}
        sidebarBadgeCounts={sidebarBadgeCounts}
      >
        <main className="smplfy-sample-details-page smplfy-product-details-page bg-body-tertiary p-4 min-vh-100">
          <div className="smplfy-card card">
            <div className="card-body text-secondary fw-medium">
              This inward could not be found.
            </div>
          </div>
        </main>
      </AppChrome>
    );
  }

  return (
    <AppChrome
      activeNav="all-products"
      onNavigate={onNavigate}
      breadcrumbs={[
        { key: 'all-products', label: 'All inwards', onClick: onBack },
        { key: inward.id, label: inward.id, current: true },
      ]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={(
        <>
          <DetailsHeader inward={inward} onBack={onBack} />
          {/* Lives in the page header slot rather than inside the scroll area:
              `main` is a flex item capped by min-vh-100, so a sticky child can
              only travel one viewport before scrolling away. */}
          <SectionNav
            sections={sections}
            activeId={activeSectionId}
            onSelect={handleSelectSection}
          />
        </>
      )}
    >
      <main className="smplfy-sample-details-page smplfy-product-details-page bg-body-tertiary p-4 min-vh-100">
        {/* Single column: no action rail on the inward. */}
        <div className="smplfy-inward-details-stack">
          <InwardDetailsCard inward={inward} />
          {inward.products.map((product, index) => (
            <InwardProductCard
              key={product.id}
              product={product}
              index={index}
              onGoToSample={onGoToSample}
            />
          ))}
        </div>
      </main>
    </AppChrome>
  );
}
