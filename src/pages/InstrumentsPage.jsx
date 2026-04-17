import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import { ToastNotification } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import './instruments-page.css';

const defaultInstruments = [
  { id: 'inst-001', name: 'Stabinger Viscometer', lastServiceOn: '14/04/2026', calibrated: 'Yes', nextServiceOn: '14/10/2026' },
  { id: 'inst-002', name: 'UV-Vis Spectrophotometer', lastServiceOn: '02/03/2026', calibrated: 'No', nextServiceOn: '02/09/2026' },
  { id: 'inst-003', name: 'Gas Chromatograph', lastServiceOn: '18/01/2026', calibrated: 'Yes', nextServiceOn: '18/07/2026' },
  { id: 'inst-004', name: 'Atomic Absorption Spectrometer', lastServiceOn: '05/04/2026', calibrated: 'No', nextServiceOn: '05/10/2026' },
  { id: 'inst-005', name: 'pH Meter', lastServiceOn: '22/03/2026', calibrated: 'Yes', nextServiceOn: '22/06/2026' },
];

function InstrumentsHeader({ onNewInstrument, onCalibrationSchedule }) {
  return (
    <section className="instruments-page-header">
      <div className="container-fluid h-100 px-0">
        <div className="row h-100 align-items-center justify-content-between gx-0">
          <div className="col-auto">
            <h1 className="instruments-page-header__title">Instrument Management</h1>
          </div>
          <div className="col-auto d-flex align-items-center gap-3">
            <SecondaryButton leftIcon="calendar" onClick={onCalibrationSchedule}>
              Calibration Schedule
            </SecondaryButton>
            <PrimaryButton leftIcon="plus" onClick={onNewInstrument}>
              New Instrument
            </PrimaryButton>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function InstrumentsPage({
  instruments = defaultInstruments,
  onNewInstrument,
  onEditInstrument,
  onDeleteInstrument,
  onCalibrationSchedule,
  onOpenInstrument,
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  initialToast = null,
}) {
  const [visibleInstruments, setVisibleInstruments] = useState(instruments);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setVisibleInstruments(instruments);
  }, [instruments]);

  useEffect(() => {
    if (!initialToast) return undefined;

    let frameId = window.requestAnimationFrame(() => {
      setToastMessage(initialToast);
      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 5000);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);  return (
    <AppChrome
      activeNav="instruments"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'instruments', label: 'Instruments', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      pageHeader={
        <InstrumentsHeader
          onNewInstrument={onNewInstrument}
          onCalibrationSchedule={onCalibrationSchedule}
        />
      }
    >
      <main className="instruments-page">
        <div className="container-fluid px-0">
          <section className="instruments-listing">
            <div className="instruments-listing__legend instruments-listing__grid">
              <div className="instruments-listing__cell instruments-listing__cell--name">Name</div>
              <div className="instruments-listing__cell instruments-listing__cell--last-service">Last Service on</div>
              <div className="instruments-listing__cell instruments-listing__cell--calibrated">Calibrated?</div>
              <div className="instruments-listing__cell instruments-listing__cell--next-service">Next Service on</div>
              <div className="instruments-listing__cell instruments-listing__cell--actions">Action</div>
            </div>

            <div className="instruments-listing__rows">
              {visibleInstruments.map((instrument) => (
                <article className="instruments-listing__row instruments-listing__grid" key={instrument.id}>
                  <div className="instruments-listing__cell instruments-listing__cell--name">
                    <a
                      href="/"
                      className="instruments-listing__link"
                      onClick={(e) => { e.preventDefault(); onOpenInstrument?.(instrument.id, instrument.name); }}
                    >
                      {instrument.name}
                    </a>
                  </div>
                  <div className="instruments-listing__cell instruments-listing__cell--last-service">
                    {instrument.lastServiceOn}
                  </div>
                  <div className="instruments-listing__cell instruments-listing__cell--calibrated">
                    {instrument.calibrated}
                  </div>
                  <div className="instruments-listing__cell instruments-listing__cell--next-service">
                    {instrument.nextServiceOn}
                  </div>
                  <div className="instruments-listing__cell instruments-listing__cell--actions instruments-listing__actions">
                    <SecondaryButton
                      size="medium"
                      leftIcon="edit"
                      className="instruments-listing__action-button"
                      onClick={() => onEditInstrument?.(instrument.id)}
                    >
                      Edit
                    </SecondaryButton>
                    <SecondaryButton
                      size="medium"
                      leftIcon="trash"
                      className="instruments-listing__action-button"
                      onClick={() => onDeleteInstrument?.(instrument.id)}
                    >
                      Delete
                    </SecondaryButton>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <ToastNotification
        state={toastVisible ? 'default' : 'gone'}
        message={toastMessage}
        onClose={() => setToastVisible(false)}
      />
    </AppChrome>
  );
}
