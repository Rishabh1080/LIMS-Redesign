// Task 1: the visitor logs an inward end to end, starting from Quick Actions > New Inward.

import { draftParametersComplete, draftProductsComplete, getInwardView } from '../../store/selectors';
import { fillCustomer, fillParameters, fillPaperwork, fillProducts, goToPage, saveInward } from '../assists';
import { pluralize } from '../../lib/format';

function firstProductWithoutTests(state) {
  return state.draft.products.findIndex((product) => !product.parameters.length);
}

export default {
  id: 'create-inward',
  title: 'Create a sample',
  summary: 'Log a consignment and watch sample IDs and tests set themselves up.',
  duration: '3 min',
  outcome: 'You logged an inward. Sample IDs, test requests and a realistic due date were created for you.',
  steps: [
    {
      // Starts where the product does: Quick Actions > New Inward on the dashboard.
      id: 'new-inward',
      kind: 'action',
      page: 'dashboard',
      autoNavigate: true,
      target: 'dash-new-inward',
      placement: 'left',
      title: 'A customer just dropped off samples',
      body: 'Let’s log them. Click New Inward in Quick Actions.',
      hint: 'Click New Inward',
      advanceDelay: 400,
      doneText: 'New inward form open.',
      done: (state) => state.nav.page === 'new-inward',
      assist: { label: 'Do it for me', run: (api) => goToPage(api, 'dash-new-inward', 'new-inward') },
    },
    {
      id: 'customer',
      kind: 'action',
      page: 'new-inward',
      target: 'ni-customer',
      placement: 'bottom',
      title: 'Who sent it?',
      body: 'Pick the customer. Billing address, contact person and GST fill in from the customer record.',
      why: 'Typed once, reused on every report and invoice. No copy-paste errors.',
      hint: 'Select a customer',
      doneText: 'Customer details filled in from the record.',
      done: (state) => Boolean(state.draft.customerId),
      assist: { label: 'Fill for me', run: fillCustomer },
    },
    {
      id: 'products',
      kind: 'action',
      page: 'new-inward',
      target: 'ni-products',
      placement: 'top',
      title: 'What came in?',
      body: (state, ctx) =>
        `Choose a category and product for each sample, and note its ${ctx.pack?.batchLabel ?? 'batch'}. Use + to add a row for every extra sample in the consignment.`,
      hint: 'Fill in category and product',
      doneText: 'Samples added.',
      done: (state) => draftProductsComplete(state.draft),
      advanceDelay: 900,
      assist: { label: 'Fill for me', run: fillProducts },
    },
    {
      id: 'tests',
      kind: 'action',
      page: 'new-inward',
      target: (state) => {
        if (state.ui.paramDrawer) return 'ni-param-drawer';
        const index = firstProductWithoutTests(state);
        return `ni-testing-${Math.max(index, 0)}`;
      },
      placement: 'left',
      title: (state) => (state.ui.paramDrawer ? 'Pick the tests' : 'Choose the tests'),
      body: (state) => {
        if (state.ui.paramDrawer) {
          return 'Every test carries its method, specification, charge and turnaround time. Tick what the customer asked for, then Save tests.';
        }
        const index = firstProductWithoutTests(state);
        return index >= 0
          ? `Open Testing Details for Product ${index + 1} and pick what the customer asked for.`
          : 'All samples have their tests.';
      },
      why: (state) => (state.ui.paramDrawer ? 'Methods come from your approved scope, so the front desk cannot book a test you are not accredited for.' : null),
      hint: (state) => (state.ui.paramDrawer ? 'Tick a few tests, then Save tests' : 'Click Add tests'),
      doneText: 'Tests booked for every sample.',
      done: (state) => draftParametersComplete(state.draft) && !state.ui.paramDrawer,
      advanceDelay: 500,
      assist: { label: 'Fill for me', run: fillParameters },
    },
    {
      id: 'paperwork',
      kind: 'info',
      interactive: true,
      page: 'new-inward',
      target: 'ni-basic',
      placement: 'top',
      title: 'Paperwork, and a date you can keep',
      body: 'Note how the samples arrived and the customer’s reference. The reporting date fills itself from the longest test turnaround.',
      why: 'The front desk only promises dates the lab can meet. Fewer missed turnarounds.',
      assist: { label: 'Fill for me', run: fillPaperwork },
    },
    {
      id: 'save',
      kind: 'action',
      page: 'new-inward',
      target: 'ni-save',
      placement: 'bottom',
      title: 'Save the inward',
      body: 'Click Save inward and watch what the system does next.',
      hint: 'Click Save inward',
      doneText: 'Saved. See what the system did.',
      done: (state, entry) => state.data.userInwardIds.length > entry.data.userInwardIds.length,
      advanceDelay: 450,
      assist: { label: 'Save for me', run: saveInward },
    },
    {
      id: 'created',
      kind: 'info',
      page: 'inward-details',
      autoNavigate: false,
      target: 'inward-samples',
      placement: 'top',
      title: 'Samples and tests, created for you',
      body: (state) => {
        const inward = state.nav.page === 'inward-details' ? getInwardView(state.data, state.nav.params?.inwardId) : null;
        if (!inward) return 'Each sample got its own ID, and every test became a test request, ready to assign.';
        return `${pluralize(inward.samples.length, 'sample')} got their own IDs and ${pluralize(inward.trs.length, 'test request')} were created, ready to assign.`;
      },
      why: 'Chain of custody starts at the front desk. Every result traces back to this moment.',
    },
    {
      id: 'register',
      kind: 'info',
      page: 'inwards',
      target: 'inwards-first-card',
      placement: 'bottom',
      title: 'It’s in your inward register',
      body: 'Your new inward is at the top. Each card shows who sent it, how it arrived, when it’s due, and the live status of every test (the circles).',
      why: 'This replaces the paper inward register, and every entry is searchable.',
      nextLabel: 'Finish',
    },
  ],
};
