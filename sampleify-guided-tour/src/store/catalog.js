// Reference data shared by every lab type, plus lookups into the active
// domain pack (see ./domains). Every company and person is fictional.
import { getPack } from './domains';

export { getPack };

export const unitOptions = ['g', 'kg', 'ml', 'L', 'Units'];

export const sampleTypeOptions = ['Base', 'ILC Sample', 'PT Sample', 'Intralab Sample'];

export const receiptModeOptions = ['In person', 'Courier', 'By Post'];

export const receivedByOptions = ['Front Desk', 'Sample Coordinator', 'Lab Manager'];

export const TR_STATUS = {
  not_allocated: { label: 'Not allocated', tone: 'gray' },
  under_testing: { label: 'Under testing', tone: 'blue' },
  under_approval: { label: 'Under approval', tone: 'yellow' },
  approved: { label: 'Approved', tone: 'green' },
};

export function getCategory(pack, category) {
  return pack.categories.find((entry) => entry.category === category) ?? null;
}

export function getParameter(pack, category, name) {
  return getCategory(pack, category)?.parameters.find((parameter) => parameter.name === name) ?? null;
}

export function getCustomer(pack, id) {
  return pack.customers.find((customer) => customer.id === id) ?? null;
}

export function getAnalyst(pack, id) {
  return pack.analysts.find((analyst) => analyst.id === id) ?? null;
}
