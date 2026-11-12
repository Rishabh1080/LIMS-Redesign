// Last task: the dashboard, after the visitor has logged and assigned work, so
// the numbers they look at are the ones they just moved. Info steps only.

export default {
  id: 'lab-at-a-glance',
  title: 'Check your dashboard',
  summary: 'See what your work did to the numbers, and where to look each morning.',
  duration: '1 min',
  outcome: 'You know where to look to see how your lab is doing, without asking anyone.',
  steps: [
    {
      id: 'metrics',
      kind: 'info',
      page: 'dashboard',
      target: 'dash-metrics',
      placement: 'bottom',
      title: 'The numbers that matter today',
      body: (state) =>
        state.data.userAllocatedTrIds.length
          ? 'Tests to allocate dropped as you handed out work, and your new samples are counted in. Nobody had to send you an update.'
          : 'Samples received today, samples running late, tests waiting for an analyst, and results waiting for approval. They change the moment work moves.',
      why: 'This is the visibility owners and technical managers tell us they miss most.',
    },
    {
      id: 'health',
      kind: 'info',
      page: 'dashboard',
      target: 'dash-health',
      placement: 'bottom',
      title: 'Laboratory health',
      body: 'Environment readings, instrument calibration, inventory and controlled documents. Each one raises its own alert.',
      why: (state, ctx) => `These are the areas ${ctx.pack?.auditors ?? 'NABL assessors'} look at first. You see a lapse before they do.`,
    },
    {
      id: 'summary',
      kind: 'info',
      page: 'dashboard',
      target: 'dash-summary',
      placement: 'top',
      title: 'Where work piles up',
      body: 'Each bar is a product category, split into pending, under analysis and completed samples.',
      why: 'Spot a bottleneck by category and move people before turnaround slips.',
      nextLabel: 'Finish',
    },
  ],
};
