// Helpers shared by every domain pack. A pack describes one kind of lab:
// its customers, product categories, test methods, instruments, analysts,
// seeded history and the presets "Fill for me" uses.

const DAY_MS = 86400000;
const isoDaysAgo = (days) => new Date(Date.now() - days * DAY_MS).toISOString();

/** Shorthand for a test parameter. */
export function p(name, method, spec, discipline, price, tatDays) {
  return { name, method, spec, discipline, price, tatDays };
}

/** Shorthand for a customer record. */
export function c(id, name, city, contactPerson, gst, billingAddress, phoneSuffix) {
  return { id, name, city, contactPerson, gst, billingAddress, phone: `+91 90000 0${phoneSuffix}` };
}

export function instrument(id, name, status, calibratedDaysAgo) {
  return { id, name, status, lastCalibrated: isoDaysAgo(calibratedDaysAgo) };
}

export function material(id, name, status, available) {
  return { id, name, status, available };
}

/**
 * The same six people in every lab, so the allocation lesson always works:
 * a senior who covers the main discipline, a specialist for the second one,
 * an all-rounder, someone on leave, a trainee who isn't authorised yet, and
 * the technical manager who reviews.
 */
export function makeAnalysts([primary, secondary], roles) {
  return [
    { id: 'an-priya', name: 'Priya Nair', role: roles.senior, certifiedFor: [primary], canReview: true, onLeave: false, baseLoad: 3, lastTrainedOn: isoDaysAgo(77) },
    { id: 'an-arjun', name: 'Arjun Rao', role: roles.specialist, certifiedFor: [secondary], canReview: false, onLeave: false, baseLoad: 2, lastTrainedOn: isoDaysAgo(117) },
    { id: 'an-sneha', name: 'Sneha Kulkarni', role: roles.analyst, certifiedFor: [primary, secondary], canReview: true, onLeave: false, baseLoad: 5, lastTrainedOn: isoDaysAgo(38) },
    { id: 'an-imran', name: 'Imran Sheikh', role: roles.analyst, certifiedFor: [primary], canReview: false, onLeave: true, baseLoad: 0, lastTrainedOn: isoDaysAgo(163) },
    { id: 'an-rahul', name: 'Rahul Verma', role: roles.trainee, certifiedFor: [], canReview: false, onLeave: false, baseLoad: 1, lastTrainedOn: null },
    { id: 'an-kavita', name: 'Kavita Menon', role: roles.manager, certifiedFor: [primary, secondary], canReview: true, onLeave: false, baseLoad: 1, lastTrainedOn: isoDaysAgo(26) },
  ];
}

/** One history entry: an inward from customer `customerId` with its samples. */
export function h(customerId, ref, samples) {
  return { customerId, ref, samples };
}

/** One sample in a history entry. `tests` are parameter names from its category. */
export function s(category, product, quantity, unit, batch, tests) {
  return { category, product, quantity, unit, batch, tests };
}

/** Product row preset for "Fill for me". */
export function row(category, product, quantity, batch) {
  return { category, product, quantity, batch };
}
