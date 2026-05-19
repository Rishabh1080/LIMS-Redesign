import { useEffect, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import DataTable from '../components/DataTable';
import { ToastNotification } from '../components/FormControls';
import PrimaryButton from '../components/PrimaryButton/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

const defaultInstruments = [
  { id: 'inst-001', name: 'Stabinger Viscometer', lastServiceOn: '14/04/2026', calibrated: 'Yes', nextServiceOn: '14/10/2026' },
  { id: 'inst-002', name: 'UV-Vis Spectrophotometer', lastServiceOn: '02/03/2026', calibrated: 'No', nextServiceOn: '02/09/2026' },
  { id: 'inst-003', name: 'Gas Chromatograph', lastServiceOn: '18/01/2026', calibrated: 'Yes', nextServiceOn: '18/07/2026' },
  { id: 'inst-004', name: 'Atomic Absorption Spectrometer', lastServiceOn: '05/04/2026', calibrated: 'No', nextServiceOn: '05/10/2026' },
  { id: 'inst-005', name: 'pH Meter', lastServiceOn: '22/03/2026', calibrated: 'Yes', nextServiceOn: '22/06/2026' },
];

function InstrumentsHeader({ onNewInstrument, onCalibrationSchedule }) {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center justify-content-between gx-0 gy-3">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Instrument Management</h1>
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
      <main className="bg-body-tertiary p-4 min-vh-100">
        <div className="container-fluid px-0">
          <DataTable>
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Last Service on</th>
                <th scope="col">Calibrated?</th>
                <th scope="col">Next Service on</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleInstruments.map((instrument) => (
                <tr key={instrument.id}>
                  <td>
                    <a
                      href="/"
                      className="smplfy-link link-primary p-0"
                      onClick={(e) => { e.preventDefault(); onOpenInstrument?.(instrument.id, instrument.name); }}
                    >
                      <span>{instrument.name}</span>
                    </a>
                  </td>
                  <td className="text-nowrap">
                    {instrument.lastServiceOn}
                  </td>
                  <td className="text-nowrap">
                    {instrument.calibrated}
                  </td>
                  <td className="text-nowrap">
                    {instrument.nextServiceOn}
                  </td>
                  <td className="text-nowrap">
                    <div className="d-flex align-items-center gap-2 flex-nowrap">
                      <SecondaryButton
                        size="medium"
                        leftIcon="edit"
                        onClick={() => onEditInstrument?.(instrument.id)}
                      >
                        Edit
                      </SecondaryButton>
                      <SecondaryButton
                        size="medium"
                        leftIcon="trash"
                        onClick={() => onDeleteInstrument?.(instrument.id)}
                      >
                        Delete
                      </SecondaryButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
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
