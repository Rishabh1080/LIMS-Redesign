// The seven guided tasks, run on the prototype's own screens (src/proto).
// One inward travels through all of them: created, sent for review and
// approved, its test requests allocated, results added and sent for approval,
// approved, and finally its COA generated.

import {
  click,
  clickButton,
  emptyCombos,
  fillCombos,
  fillTextFields,
  findButton,
  goToProtoPage,
  modalFor,
  protoRoot,
  tickAll,
} from '../protoAssists';

const proto = (state) => state.proto ?? {};
const page = (state) => proto(state).page;
const currentInward = (state) => proto(state).inwards?.find((inward) => inward.id === proto(state).currentInwardId) ?? null;
const domRoot = (root) => root?.querySelector('.sgt-proto') ?? null;
const modalOpen = (titleId) => (root) => Boolean(domRoot(root)?.querySelector(`#${titleId}`));
const noInward = (state) => !currentInward(state);

const firstCard = 'css:.sgt-proto .smplfy-sample-card';

/** Start a task on the page it begins on, whatever page the visitor is on. */
const startOn = (target) => (api) => goToProtoPage(api, target);

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
      onEnter: startOn('dashboard'),
      target: 'text:.sgt-proto button|New Inward',
      placement: 'left',
      title: 'A customer just dropped off samples',
      body: 'Click New Inward in Quick Actions.',
      hint: 'Click New Inward',
      doneText: 'New Inward open.',
      advanceDelay: 450,
      done: (state) => page(state) === 'new-inward',
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'New Inward') },
    },
    {
      id: 'customer',
      kind: 'action',
      target: 'css:.sgt-proto #inward-customer',
      placement: 'bottom',
      title: 'Who sent it?',
      body: 'Pick the customer. Their billing address fills in from the customer record.',
      hint: 'Select a customer',
      doneText: 'Customer details filled in.',
      doneDom: (root) => {
        const combo = domRoot(root)?.querySelector('#inward-customer');
        return Boolean(combo && !combo.querySelector('.text-secondary'));
      },
      assist: { label: 'Fill for me', run: (api) => fillCombos(api, protoRoot(api)?.querySelector('#inward-customer')?.closest('.smplfy-card') ?? protoRoot(api)) },
    },
    {
      id: 'products',
      kind: 'action',
      target: 'text:.sgt-proto .smplfy-inward-section-title|Product Details|.smplfy-card',
      placement: 'top',
      title: 'What came in?',
      body: 'Choose the category and product for each sample in the consignment. Use + and − to change how many samples there are.',
      hint: 'Fill in category and product',
      doneText: 'Samples added.',
      doneDom: (root) => {
        const card = [...(domRoot(root)?.querySelectorAll('.smplfy-inward-section-title') ?? [])].find((node) => node.textContent.trim() === 'Product Details')?.closest('.smplfy-card');
        return Boolean(card && emptyCombos(card).length === 0);
      },
      assist: {
        label: 'Fill for me',
        run: (api) => fillCombos(api, [...(protoRoot(api)?.querySelectorAll('.smplfy-inward-section-title') ?? [])].find((node) => node.textContent.trim() === 'Product Details')?.closest('.smplfy-card')),
      },
    },
    {
      id: 'testing-tab',
      kind: 'action',
      target: 'text:.sgt-proto button|Testing Details',
      placement: 'bottom',
      title: 'Now, the tests',
      body: 'Open the Testing Details tab. Each sample gets its own list of tests.',
      hint: 'Click Testing Details',
      advanceDelay: 400,
      doneDom: (root) => Boolean(findButton(domRoot(root), 'Auto-fill Parameter')),
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Testing Details') },
    },
    {
      id: 'tests',
      kind: 'action',
      target: 'css:.sgt-proto .smplfy-inward-main',
      placement: 'top',
      title: 'Choose the tests',
      body: 'Pick a parameter and test method for each sample. Every parameter becomes one test request.',
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
      target: 'text:.sgt-proto button|Save',
      placement: 'bottom',
      title: 'Save the inward',
      body: 'Click Save. If anything is missing, the Sample info tab shows how many fields need attention.',
      hint: 'Click Save',
      doneText: 'Inward created.',
      done: (state, entry) => (proto(state).inwards?.length ?? 0) > (proto(entry).inwards?.length ?? 0),
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Save') },
    },
    {
      id: 'listed',
      kind: 'info',
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
      onEnter: startOn('all-samples'),
      skipIf: (state) => page(state) === 'inward-details' && Boolean(currentInward(state)),
      target: firstCard,
      placement: 'bottom',
      title: 'Open your inward',
      body: 'Click the inward you created.',
      hint: 'Click the inward',
      advanceDelay: 400,
      done: (state) => page(state) === 'inward-details',
      assist: {
        label: 'Do it for me',
        run: async (api) => {
          const card = protoRoot(api)?.querySelector('.smplfy-sample-card');
          const link = card?.querySelector('a, button.smplfy-link, .smplfy-link') ?? card;
          await click(api, link);
        },
      },
    },
    {
      id: 'send',
      kind: 'action',
      target: 'text:.sgt-proto button|Send for Review',
      placement: 'bottom',
      title: 'Send it for review',
      body: 'New inwards are checked before testing starts. Click Send for Review.',
      hint: 'Click Send for Review',
      advanceDelay: 300,
      doneDom: modalOpen('review-request-title'),
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Send for Review') },
    },
    {
      id: 'next-state',
      kind: 'action',
      target: 'css:.sgt-proto .modal-dialog, .sgt-proto .smplfy-modal-dialog',
      placement: 'left',
      title: 'Where does it go next?',
      body: 'The current state is Pending. Choose the next state, Under Allocation, add a comment if you like, and send.',
      hint: 'Choose Under Allocation, then Send Request',
      doneText: 'Review requested.',
      done: (state) => Boolean(currentInward(state)?.reviewRequest),
      requires: (state) => Boolean(currentInward(state)),
      assist: {
        label: 'Do it for me',
        run: async (api) => {
          const modal = modalFor(protoRoot(api), 'review-request-title');
          await fillCombos(api, modal);
          await fillTextFields(api, modal, 'Please review');
          await clickButton(api, 'Send Request', modal ?? protoRoot(api));
        },
      },
    },
    {
      id: 'activity',
      kind: 'info',
      target: 'css:.sgt-proto .smplfy-sample-details-activity',
      placement: 'left',
      title: 'Every step lands in the activity trail',
      body: 'Created, sent for review, and next the approval. Each entry says who did it and when.',
    },
    {
      id: 'take-action',
      kind: 'action',
      target: 'text:.sgt-proto button|Take action',
      placement: 'left',
      title: 'Now approve it',
      body: 'As the reviewer, you see it under Action Required. Click Take action.',
      hint: 'Click Take action',
      advanceDelay: 300,
      doneDom: modalOpen('sample-approval-action-title'),
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Take action') },
    },
    {
      id: 'approve',
      kind: 'action',
      target: 'css:.sgt-proto .modal-dialog, .sgt-proto .smplfy-modal-dialog',
      placement: 'left',
      title: 'Check and approve',
      body: 'Add a comment, tick each check, then Approve. The checks make sure nothing is missing before testing starts.',
      hint: 'Comment, tick the checks, Approve',
      doneText: 'Inward approved.',
      done: (state) => Boolean(currentInward(state)?.approved),
      assist: {
        label: 'Do it for me',
        run: async (api) => {
          const modal = modalFor(protoRoot(api), 'sample-approval-action-title') ?? protoRoot(api);
          await fillTextFields(api, modal, 'All details checked');
          await tickAll(api, modal);
          await clickButton(api, 'Approve', modal);
        },
      },
    },
    {
      id: 'buttons',
      kind: 'info',
      target: 'text:.sgt-proto button|Test Requests',
      placement: 'bottom',
      title: 'Test Requests are open',
      body: 'Approved inwards show Test Requests and COA Report here. That’s where the next tasks start.',
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
      onEnter: startOn('inward-details'),
      skipIf: (state) => page(state) === 'test-requests',
      target: 'text:.sgt-proto button|Test Requests',
      placement: 'bottom',
      title: 'Open the test requests',
      body: 'Every test parameter on the inward is one test request. Click Test Requests.',
      hint: 'Click Test Requests',
      advanceDelay: 400,
      done: (state) => page(state) === 'test-requests',
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Test Requests') },
    },
    {
      id: 'list',
      kind: 'info',
      target: 'css:.sgt-proto .smplfy-tr-listing-page .smplfy-card',
      placement: 'top',
      title: 'All test requests for this inward',
      body: 'Allocate them one by one, or select several and Create Job to hand them out together.',
    },
    {
      id: 'allocate',
      kind: 'action',
      target: 'text:.sgt-proto .smplfy-tr-listing-page table button|Allocate',
      placement: 'left',
      title: 'Allocate one',
      body: 'Click Allocate on a test request.',
      hint: 'Click Allocate',
      advanceDelay: 300,
      doneDom: modalOpen('tr-allocation-title'),
      assist: { label: 'Do it for me', run: (api) => click(api, findButton(protoRoot(api)?.querySelector('.smplfy-tr-listing-page table'), 'Allocate')) },
    },
    {
      id: 'assign',
      kind: 'action',
      target: 'css:.sgt-proto .modal-dialog, .sgt-proto .smplfy-modal-dialog',
      placement: 'left',
      title: 'Choose the analyst and reviewer',
      body: 'Pick who runs the test, who reviews the result, and the instrument, then Allocate.',
      hint: 'Pick an analyst and reviewer, then Allocate',
      doneText: 'Allocated.',
      done: (state) => Boolean(currentInward(state)?.trs?.allocated),
      assist: {
        label: 'Do it for me',
        run: async (api) => {
          const modal = modalFor(protoRoot(api), 'tr-allocation-title') ?? protoRoot(api);
          await fillCombos(api, modal);
          const buttons = [...modal.querySelectorAll('.modal-footer button, button')].filter((button) => /Allocate/.test(button.textContent));
          await click(api, buttons[buttons.length - 1]);
        },
      },
      nextLabel: 'Finish',
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
      onEnter: startOn('test-requests'),
      skipIf: (state) => ['tr-details', 'datasheet'].includes(page(state)),
      target: 'css:.sgt-proto .smplfy-tr-listing-page table tbody tr a.smplfy-link',
      placement: 'right',
      title: 'Open a test request',
      body: 'Click a test request ID.',
      hint: 'Click a test request',
      advanceDelay: 400,
      done: (state) => page(state) === 'tr-details',
      assist: { label: 'Do it for me', run: (api) => click(api, protoRoot(api)?.querySelector('.smplfy-tr-listing-page table tbody tr a.smplfy-link')) },
    },
    {
      id: 'add-results',
      kind: 'action',
      target: 'text:.sgt-proto button|Add Results',
      placement: 'bottom',
      title: 'Add results',
      body: 'Results go into the method’s datasheet. Click Add Results.',
      hint: 'Click Add Results',
      advanceDelay: 400,
      done: (state) => page(state) === 'datasheet',
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Add Results') },
    },
    {
      id: 'save',
      kind: 'action',
      target: 'text:.sgt-proto button|Save',
      placement: 'bottom',
      title: 'Record and save',
      body: 'Enter the readings in the datasheet, then Save.',
      hint: 'Click Save',
      doneText: 'Results saved.',
      done: (state) => proto(state).tr?.workflowStage === 'in-progress' || proto(state).tr?.workflowStage === 'submitted',
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Save') },
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
      onEnter: startOn('tr-details'),
      target: 'text:.sgt-proto button|Send for Review',
      placement: 'bottom',
      title: 'Send the results for review',
      body: 'Click Send for Review.',
      hint: 'Click Send for Review',
      advanceDelay: 300,
      doneDom: modalOpen('remnant-modal-title'),
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Send for Review') },
    },
    {
      id: 'remnant',
      kind: 'action',
      target: 'css:.sgt-proto .modal-dialog, .sgt-proto .smplfy-modal-dialog',
      placement: 'left',
      title: 'Is any sample left?',
      body: 'Say whether a remnant of the sample is left for retention. That sends the results for approval.',
      hint: 'Choose an answer',
      doneText: 'Sent for approval.',
      done: (state) => proto(state).tr?.workflowStage === 'submitted',
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Yes, Available') },
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
      onEnter: startOn('tr-details'),
      target: 'text:.sgt-proto button|Take action',
      placement: 'left',
      title: 'Review the results',
      body: 'The reviewer sees this request under Review Pending. Click Take action.',
      hint: 'Click Take action',
      advanceDelay: 300,
      doneDom: modalOpen('test-request-approval-action-title'),
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Take action') },
    },
    {
      id: 'approve',
      kind: 'action',
      target: 'css:.sgt-proto .modal-dialog, .sgt-proto .smplfy-modal-dialog',
      placement: 'left',
      title: 'Approve',
      body: 'Add a comment and approve the results.',
      hint: 'Comment, then Review',
      doneText: 'Results approved.',
      done: (state) => Boolean(currentInward(state)?.trs?.approved),
      assist: {
        label: 'Do it for me',
        run: async (api) => {
          const modal = modalFor(protoRoot(api), 'test-request-approval-action-title') ?? protoRoot(api);
          await fillTextFields(api, modal, 'Results checked');
          const confirm = [...modal.querySelectorAll('button')].filter((button) => ['Review', 'Approve'].includes(button.textContent.trim()));
          await click(api, confirm[confirm.length - 1]);
        },
      },
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
      onEnter: startOn('inward-details'),
      skipIf: noInward,
      target: 'text:.sgt-proto button|COA Report',
      placement: 'bottom',
      title: 'Open the COA report',
      body: 'Back on the inward, click COA Report.',
      hint: 'Click COA Report',
      advanceDelay: 400,
      done: (state) => page(state) === 'coa-report-selection',
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'COA Report') },
    },
    {
      id: 'choose',
      kind: 'action',
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
        label: 'Do it for me',
        run: async (api) => {
          const main = protoRoot(api)?.querySelector('main');
          const choice = main?.querySelector('.col-lg-4 button, .col-lg-4 [role="radio"], .col-lg-4 label');
          await click(api, choice);
          await api.sleep(250);
          await fillCombos(api, main);
        },
      },
    },
    {
      id: 'generate',
      kind: 'action',
      target: 'text:.sgt-proto button|Generate',
      placement: 'bottom',
      title: 'Generate it',
      body: 'Click Generate.',
      hint: 'Click Generate',
      doneText: 'COA generated.',
      done: (state) => page(state) === 'finalised-report',
      assist: { label: 'Do it for me', run: (api) => clickButton(api, 'Generate') },
    },
    {
      id: 'report',
      kind: 'info',
      target: 'css:.sgt-proto main',
      placement: 'top',
      title: 'Your finalised report',
      body: 'This is the report your customer receives. The inward is now Completed.',
      nextLabel: 'Finish',
    },
  ],
};
