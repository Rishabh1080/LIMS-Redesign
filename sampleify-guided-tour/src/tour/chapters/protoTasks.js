// The seven guided tasks, run on the prototype's own screens (src/proto).
// One inward travels through all of them: created, sent for review and
// approved, its test requests allocated, results added and sent for approval,
// approved, and finally its COA generated.
//
// Conventions:
// - `protoPage` is the prototype page a step lives on. Leaving it restarts the
//   task; resuming a paused task on another page starts it again too.
// - Modal steps `require` their modal to be open and fall back to the step
//   that opens it.
// - "Fill for me" only fills in data. Buttons that move the work on (New
//   Inward, Save, Send Request, Approve...) are always the visitor's click.

import { click, closeOpenMenus, emptyCombos, fillCombos, fillTextFields, typeInto, findButton, goToProtoPage, modalFor, pickFirst, protoRoot, setInputValue, tickAll } from '../protoAssists';

const proto = (state) => state.proto ?? {};
const page = (state) => proto(state).page;
const currentInward = (state) => proto(state).inwards?.find((inward) => inward.id === proto(state).currentInwardId) ?? null;
const domRoot = (root) => root?.querySelector('.sgt-proto') ?? null;
const modalOpen = (titleId) => (root) => Boolean(domRoot(root)?.querySelector(`#${titleId}`));
/** For `requires`: the modal with this title is open. */
const needsModal = (titleId) => (state, root) => modalOpen(titleId)(root);

const firstCard = 'css:.sgt-proto .smplfy-sample-card';
// The visible card (.modal-content), not .modal-dialog: that one stretches to the viewport height.
const openModal = 'css:.sgt-proto .modal-content';

/** Start a task on the page it begins on, whatever page the visitor is on. */
const startOn = (target) => (api) => goToProtoPage(api, target);

const productCard = (scope) =>
  [...(scope?.querySelectorAll('.smplfy-inward-section-title') ?? [])].find((node) => node.textContent.trim() === 'Product Details')?.closest('.smplfy-card') ?? null;

export const createInward = {
  id: 'create-inward',
  title: 'Create a new inward',
  summary: 'Log a customer’s consignment from the dashboard.',
  duration: '2 min',
  outcome: 'You logged an inward. It’s on your All inwards list, ready for review.',
  steps: [
    {
      id: 'new-inward',
      kind: 'action',
      protoPage: 'dashboard',
      onEnter: startOn('dashboard'),
      target: 'text:.sgt-proto button|New Inward',
      placement: 'left',
      title: 'A customer just dropped off samples',
      body: 'Click **New Inward** to log the sample in the system. You can also find this button on the **All inwards** page from the sidebar.',
      hint: 'Click New Inward',
      doneText: 'New Inward open.',
      advanceDelay: 450,
      done: (state) => page(state) === 'new-inward',
    },
    {
      // Lets the visitor see the new screen first, then explains it.
      id: 'page-intro',
      kind: 'info',
      protoPage: 'new-inward',
      target: 'below:.sgt-proto .smplfy-inward-page > header',
      placement: 'bottom',
      title: 'This is the New Inward page',
      body: 'Everything about the samples your lab receives is saved here. Let’s start with the most important part: who sent them.',
      nextLabel: 'Let’s start',
    },
    {
      id: 'customer',
      kind: 'action',
      protoPage: 'new-inward',
      target: 'css:.sgt-proto #inward-customer',
      placement: 'bottom',
      title: 'Who sent it?',
      body: 'Pick the **Customer**. Their billing address fills in from the customer record.',
      hint: 'Select a customer',
      doneText: 'Customer details filled in.',
      doneDom: (root) => {
        const combo = domRoot(root)?.querySelector('#inward-customer');
        return Boolean(combo && !combo.querySelector('.text-secondary'));
      },
      // Only the customer: the quotation next to it unlocks afterwards and is optional.
      assist: {
        label: 'Fill for me',
        run: async (api) => {
          const combo = protoRoot(api)?.querySelector('#inward-customer');
          if (combo) await pickFirst(api, combo);
          closeOpenMenus();
        },
      },
    },
    {
      id: 'products',
      kind: 'action',
      protoPage: 'new-inward',
      target: 'text:.sgt-proto .smplfy-inward-section-title|Product Details|.smplfy-card',
      placement: 'top',
      title: 'What came in?',
      body: 'Choose the **Category** and **Product** for each sample in the consignment. Use **+** and **−** to change how many samples there are.',
      hint: 'Fill in category and product',
      doneText: 'Samples added.',
      doneDom: (root) => {
        const card = productCard(domRoot(root));
        return Boolean(card && emptyCombos(card).length === 0);
      },
      assist: { label: 'Fill for me', run: (api) => fillCombos(api, productCard(protoRoot(api))) },
    },
    {
      id: 'testing-tab',
      kind: 'action',
      protoPage: 'new-inward',
      target: 'text:.sgt-proto button|Testing Details',
      placement: 'bottom',
      title: 'Now, the tests',
      body: 'Open the **Testing Details** tab. Each sample gets its own list of tests.',
      hint: 'Click Testing Details',
      advanceDelay: 400,
      doneDom: (root) => Boolean(findButton(domRoot(root), 'Auto-fill Parameter')),
    },
    {
      id: 'tests',
      kind: 'action',
      protoPage: 'new-inward',
      target: 'css:.sgt-proto .smplfy-inward-main',
      placement: 'top',
      title: 'Choose the tests',
      body: 'Pick a **Parameter** and **Test Method** for each sample. Every parameter becomes one test request.',
      hint: 'Pick a parameter and method for each sample',
      doneText: 'Tests booked.',
      doneDom: (root) => {
        const main = domRoot(root)?.querySelector('.smplfy-inward-main');
        return Boolean(findButton(domRoot(root), 'Auto-fill Parameter') && main && emptyCombos(main).length === 0);
      },
      assist: { label: 'Fill for me', run: (api) => fillCombos(api, protoRoot(api)?.querySelector('.smplfy-inward-main')) },
    },
    {
      id: 'save',
      kind: 'action',
      protoPage: 'new-inward',
      target: 'text:.sgt-proto button|Save',
      placement: 'bottom',
      title: 'Save the inward',
      body: 'Click **Save**. If anything is missing, the **Sample info** tab shows how many fields need attention.',
      hint: 'Click Save',
      doneText: 'Inward created.',
      done: (state, entry) => (proto(state).inwards?.length ?? 0) > (proto(entry).inwards?.length ?? 0),
    },
    {
      id: 'listed',
      kind: 'info',
      protoPage: 'all-samples',
      target: firstCard,
      placement: 'bottom',
      title: 'It’s on All inwards',
      body: 'Your new inward is at the top, with its status and a circle for every test.',
      nextLabel: 'Finish',
    },
  ],
};

export const sendForApproval = {
  id: 'send-for-approval',
  title: 'Send the inward for approval',
  summary: 'Send it for review, then approve it.',
  duration: '2 min',
  outcome: 'The inward was reviewed and approved. Its test requests are ready to allocate.',
  steps: [
    {
      id: 'open',
      kind: 'action',
      protoPage: 'all-samples',
      onEnter: startOn('all-samples'),
      target: firstCard,
      placement: 'bottom',
      title: 'Open your inward',
      body: 'Click the inward you created to open its details.',
      hint: 'Click the inward',
      advanceDelay: 400,
      done: (state) => page(state) === 'inward-details',
    },
    {
      id: 'send',
      kind: 'action',
      protoPage: 'inward-details',
      target: 'text:.sgt-proto button|Send for Review',
      placement: 'bottom',
      title: 'Send it for review',
      body: 'New inwards are checked before testing starts. Click **Send for Review**.',
      hint: 'Click Send for Review',
      advanceDelay: 300,
      doneDom: modalOpen('review-request-title'),
    },
    {
      id: 'next-state',
      kind: 'action',
      protoPage: 'inward-details',
      target: openModal,
      placement: 'left',
      title: 'Where does it go next?',
      body: 'The current state is **Pending**. Choose the next state, **Under Allocation**, add a comment if you like, then click **Send Request**.',
      hint: 'Choose Under Allocation, then Send Request',
      doneText: 'Review requested.',
      done: (state) => Boolean(currentInward(state)?.reviewRequest),
      requires: needsModal('review-request-title'),
      backTo: 'send',
      assist: {
        label: 'Fill for me',
        run: async (api) => {
          const modal = modalFor(protoRoot(api), 'review-request-title');
          await fillCombos(api, modal);
          await fillTextFields(api, modal, 'Please review');
        },
      },
    },
    {
      id: 'activity',
      kind: 'info',
      protoPage: 'inward-details',
      target: 'css:.sgt-proto .smplfy-sample-details-activity',
      placement: 'left',
      title: 'Every step lands in the activity trail',
      body: 'Created, sent for review, and next the approval. Each entry says who did it and when.',
    },
    {
      id: 'take-action',
      kind: 'action',
      protoPage: 'inward-details',
      target: 'text:.sgt-proto button|Take action',
      placement: 'left',
      title: 'Now approve it',
      body: 'As the reviewer, you see it under **Action Required**. Click **Take action**.',
      hint: 'Click Take action',
      advanceDelay: 300,
      doneDom: modalOpen('sample-approval-action-title'),
    },
    {
      id: 'approve',
      kind: 'action',
      protoPage: 'inward-details',
      target: openModal,
      placement: 'left',
      title: 'Check and approve',
      body: 'Add a comment, tick each check, then click **Approve**. The checks make sure nothing is missing before testing starts.',
      hint: 'Comment, tick the checks, then Approve',
      doneText: 'Inward approved.',
      done: (state) => Boolean(currentInward(state)?.approved),
      requires: needsModal('sample-approval-action-title'),
      backTo: 'take-action',
      assist: {
        label: 'Fill for me',
        run: async (api) => {
          const modal = modalFor(protoRoot(api), 'sample-approval-action-title') ?? protoRoot(api);
          await fillTextFields(api, modal, 'All details checked');
          await tickAll(api, modal);
        },
      },
    },
    {
      id: 'buttons',
      kind: 'info',
      protoPage: 'inward-details',
      target: 'text:.sgt-proto button|Test Requests',
      placement: 'bottom',
      title: 'Test Requests are open',
      body: 'Approved inwards show **Test Requests** and **COA Report** here. That’s where the next tasks start.',
      nextLabel: 'Finish',
    },
  ],
};

export const allocateTests = {
  id: 'allocate-tests',
  title: 'Allocate test requests',
  summary: 'Hand a test to an analyst, with a reviewer.',
  duration: '1 min',
  outcome: 'The test request is with an analyst, and a reviewer is lined up.',
  steps: [
    {
      id: 'open-trs',
      kind: 'action',
      protoPage: 'inward-details',
      onEnter: startOn('inward-details'),
      target: 'text:.sgt-proto button|Test Requests',
      placement: 'bottom',
      title: 'Open the test requests',
      body: 'Every test parameter on the inward is one test request. Click **Test Requests**.',
      hint: 'Click Test Requests',
      advanceDelay: 400,
      done: (state) => page(state) === 'test-requests',
    },
    {
      id: 'list',
      kind: 'info',
      protoPage: 'test-requests',
      target: 'css:.sgt-proto .smplfy-tr-listing-page .smplfy-card',
      placement: 'top',
      title: 'All test requests for this inward',
      body: 'Allocate them one by one, or select several and **Create Job** to hand them out together.',
    },
    {
      id: 'allocate',
      kind: 'action',
      protoPage: 'test-requests',
      target: 'text:.sgt-proto .smplfy-tr-listing-page table button|Allocate',
      placement: 'left',
      title: 'Allocate one',
      body: 'Click **Allocate** on a test request.',
      hint: 'Click Allocate',
      advanceDelay: 300,
      doneDom: modalOpen('tr-allocation-title'),
    },
    {
      id: 'assign',
      kind: 'action',
      protoPage: 'test-requests',
      target: openModal,
      placement: 'left',
      title: 'Choose the analyst and reviewer',
      body: 'Pick who runs the test, who reviews the result, and the instrument, then click **Allocate**.',
      hint: 'Pick an analyst and reviewer, then Allocate',
      doneText: 'Allocated.',
      done: (state) => Boolean(currentInward(state)?.trs?.allocated),
      requires: (state, root) => modalOpen('tr-allocation-title')(root) || Boolean(currentInward(state)?.trs?.allocated),
      backTo: 'allocate',
      assist: { label: 'Fill for me', run: (api) => fillCombos(api, modalFor(protoRoot(api), 'tr-allocation-title')) },
    },
  ],
};

export const addResults = {
  id: 'add-results',
  title: 'Add results to a test request',
  summary: 'Open a test request and record its results.',
  duration: '1 min',
  outcome: 'Results are on the test request’s datasheet.',
  steps: [
    {
      id: 'open-tr',
      kind: 'action',
      protoPage: 'test-requests',
      onEnter: startOn('test-requests'),
      target: 'css:.sgt-proto .smplfy-tr-listing-page table tbody tr a.smplfy-link',
      placement: 'right',
      title: 'Open a test request',
      body: 'Click a test request ID to open it.',
      hint: 'Click a test request',
      advanceDelay: 400,
      done: (state) => page(state) === 'tr-details',
    },
    {
      id: 'template',
      kind: 'info',
      protoPage: 'tr-details',
      target: 'css:.sgt-proto .sgt-tpl',
      placement: 'top',
      title: 'The results worksheet',
      body: 'Each test request comes with a worksheet: **Parameters**, **Specification** and **Test Methods followed**. The **Results** column is empty until you add results.',
    },
    {
      id: 'add-results',
      kind: 'action',
      protoPage: 'tr-details',
      target: 'text:.sgt-proto button|Add Results',
      placement: 'bottom',
      title: 'Add results',
      body: 'Click **Add Results** to open the same worksheet for editing.',
      hint: 'Click Add Results',
      advanceDelay: 400,
      done: (state) => page(state) === 'datasheet',
    },
    {
      id: 'enter-result',
      kind: 'action',
      protoPage: 'datasheet',
      target: 'css:.sgt-proto input[data-result]',
      placement: 'top',
      title: 'Enter a result',
      body: 'Analysts type readings straight from their testing in the **Results** column. With smart integration, this data is fetched from your instruments automatically.',
      hint: 'Enter a result',
      advanceDelay: 1800,
      doneDom: (root) => {
        const input = domRoot(root)?.querySelector('input[data-result]');
        return Boolean(input && input.value.trim() !== '' && !Number.isNaN(Number(input.value)));
      },
      assist: {
        label: 'Fill for me',
        run: async (api) => {
          const scope = protoRoot(api);
          const dates = scope?.querySelectorAll('input[type="date"]') ?? [];
          const day = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
          await setInputValue(api, dates[0], day(0));
          await setInputValue(api, dates[1], day(0));
          await typeInto(api, scope?.querySelector('input[data-result]'), '0.21');
        },
      },
    },
    {
      id: 'done',
      kind: 'action',
      protoPage: 'datasheet',
      target: 'text:.sgt-proto button|Done',
      placement: 'bottom',
      title: 'Save the results',
      body: 'Click **Done** to save the results to the test request.',
      hint: 'Click Done',
      advanceDelay: 300,
      done: (state) => page(state) === 'tr-details',
    },
    {
      id: 'results-in',
      kind: 'info',
      protoPage: 'tr-details',
      target: 'css:.sgt-proto .sgt-tpl',
      placement: 'top',
      title: 'Results are in',
      body: 'The worksheet now shows your result. **Send for Review** appears at the top.',
      nextLabel: 'Finish',
    },
  ],
};

export const requestApproval = {
  id: 'request-approval',
  title: 'Request approval for results',
  summary: 'Send the results to a reviewer.',
  duration: '1 min',
  outcome: 'The results are waiting for the reviewer’s approval.',
  steps: [
    {
      id: 'send',
      kind: 'action',
      protoPage: 'tr-details',
      onEnter: startOn('tr-details'),
      target: 'text:.sgt-proto button|Send for Review',
      placement: 'bottom',
      title: 'Send the results for review',
      body: 'Click **Send for Review** to send these results to a reviewer.',
      hint: 'Click Send for Review',
      advanceDelay: 300,
      doneDom: modalOpen('remnant-modal-title'),
    },
    {
      id: 'remnant',
      kind: 'action',
      protoPage: 'tr-details',
      target: openModal,
      placement: 'left',
      title: 'Is any sample left?',
      body: 'Say whether a remnant of the sample is left for retention. That sends the results for approval.',
      hint: 'Choose an answer',
      doneText: 'Sent for approval.',
      done: (state) => proto(state).tr?.workflowStage === 'submitted',
      requires: (state, root) => modalOpen('remnant-modal-title')(root) || proto(state).tr?.workflowStage === 'submitted',
      backTo: 'send',
      nextLabel: 'Finish',
    },
  ],
};

export const approveResults = {
  id: 'approve-results',
  title: 'Approve test requests',
  summary: 'Review the results as the approver.',
  duration: '1 min',
  outcome: 'The results are approved and ready for the report.',
  steps: [
    {
      id: 'take-action',
      kind: 'action',
      protoPage: 'tr-details',
      onEnter: startOn('tr-details'),
      target: 'text:.sgt-proto button|Take action',
      placement: 'left',
      title: 'Review the results',
      body: 'The reviewer sees this request under **Review Pending**. Click **Take action**.',
      hint: 'Click Take action',
      advanceDelay: 300,
      doneDom: modalOpen('test-request-approval-action-title'),
    },
    {
      id: 'approve',
      kind: 'action',
      protoPage: 'tr-details',
      target: openModal,
      placement: 'left',
      title: 'Approve',
      body: 'Add a comment, such as “All results are fine”, then click **Review**.',
      hint: 'Comment, then Review',
      doneText: 'Results approved.',
      done: (state) => Boolean(currentInward(state)?.trs?.approved),
      requires: (state, root) => modalOpen('test-request-approval-action-title')(root) || Boolean(currentInward(state)?.trs?.approved),
      backTo: 'take-action',
      assist: { label: 'Fill for me', run: (api) => fillTextFields(api, modalFor(protoRoot(api), 'test-request-approval-action-title'), 'All results are fine') },
      nextLabel: 'Finish',
    },
  ],
};

export const generateCoa = {
  id: 'generate-coa',
  title: 'Generate the COA report',
  summary: 'Turn approved results into the certificate.',
  duration: '1 min',
  outcome: 'The COA is generated. Your inward is complete.',
  steps: [
    {
      id: 'coa-button',
      kind: 'action',
      protoPage: 'inward-details',
      onEnter: startOn('inward-details'),
      target: 'text:.sgt-proto button|COA Report',
      placement: 'bottom',
      title: 'Open the COA report',
      body: 'Back on the inward, click **COA Report**.',
      hint: 'Click COA Report',
      advanceDelay: 400,
      done: (state) => page(state) === 'coa-report-selection',
    },
    {
      id: 'choose',
      kind: 'action',
      protoPage: 'coa-report-selection',
      target: 'css:.sgt-proto main',
      placement: 'top',
      title: 'Choose how to report',
      body: 'One COA for each product, for each parameter, or one for everything. Pick one, then its templates.',
      hint: 'Pick a report type and templates',
      advanceDelay: 400,
      doneDom: (root) => {
        const generate = findButton(domRoot(root), 'Generate');
        return Boolean(generate && !generate.disabled);
      },
      assist: {
        label: 'Fill for me',
        run: async (api) => {
          const main = protoRoot(api)?.querySelector('main');
          await click(api, main?.querySelector('.col-lg-4 button, .col-lg-4 [role="radio"], .col-lg-4 label'));
          await api.sleep(250);
          await fillCombos(api, main);
        },
      },
    },
    {
      id: 'generate',
      kind: 'action',
      protoPage: 'coa-report-selection',
      target: 'text:.sgt-proto button|Generate',
      placement: 'bottom',
      title: 'Generate it',
      body: 'Click **Generate** to create the certificate.',
      hint: 'Click Generate',
      doneText: 'COA generated.',
      done: (state) => page(state) === 'finalised-report',
    },
    {
      id: 'report',
      kind: 'info',
      protoPage: 'finalised-report',
      target: 'css:.sgt-proto main',
      placement: 'top',
      title: 'Your finalised report',
      body: 'This is the report your customer receives. The inward is now **Completed**.',
      nextLabel: 'Finish',
    },
  ],
};
