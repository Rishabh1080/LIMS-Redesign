import { useId, useState } from 'react';
import {
  IconCheck,
  IconChecks,
  IconClock,
  IconTestPipe2,
  IconUserExclamation,
  IconX,
} from '@tabler/icons-react';
import './ParameterCircles.scss';

export const PARAMETER_STATUS_ORDER = [
  'Not allocated',
  'Under Testing',
  'Under Approval',
  'Rejected',
  'Reviewed',
  'Approved',
];

const STATUS_VISUALS = {
  'Not allocated': {
    circleColor: 'var(--smplfy-primitive-neutral-400)',
    iconColor: 'var(--smplfy-primitive-neutral-900)',
    icon: IconClock,
  },
  'Under Approval': {
    circleColor: 'var(--smplfy-primitive-yellow-250)',
    iconColor: 'var(--smplfy-primitive-yellow-800)',
    icon: IconUserExclamation,
  },
  'Under Testing': {
    circleColor: 'var(--smplfy-primitive-blue-350)',
    iconColor: 'var(--smplfy-primitive-blue-600)',
    icon: IconTestPipe2,
  },
  Rejected: {
    circleColor: 'var(--smplfy-primitive-red-400)',
    iconColor: 'var(--smplfy-primitive-neutral-100)',
    icon: IconX,
  },
  Reviewed: {
    circleColor: 'var(--smplfy-primitive-green-250)',
    iconColor: 'var(--smplfy-primitive-green-800)',
    icon: IconCheck,
  },
  Approved: {
    circleColor: 'var(--smplfy-primitive-green-600)',
    iconColor: 'var(--smplfy-primitive-neutral-100)',
    icon: IconChecks,
  },
};

const PARAMETER_NAME_PRESETS = [
  'pH value at 25°C',
  'Total Hardness as CaCO3',
  'Biological Oxygen Demand at 20°C- 5 Days',
  'Chemical Oxygen Demand',
  'Total Dissolved Solids',
  'Chloride Content',
  'Sulphate as SO4',
  'Dissolved Oxygen at 20°C',
  'Turbidity (NTU)',
  'Electrical Conductivity',
  'Residual Free Chlorine',
  'Nitrate as NO3',
];

function normalizeParameter(parameter, index) {
  if (typeof parameter === 'object' && parameter !== null) {
    const status = parameter.status ?? 'Not allocated';

    return {
      id: parameter.id ?? `${status}-${index}`,
      name: parameter.name?.trim() ?? PARAMETER_NAME_PRESETS[index % PARAMETER_NAME_PRESETS.length],
      status,
    };
  }

  const status = typeof parameter === 'string' && parameter.trim() ? parameter : 'Not allocated';

  return {
    id: `${status}-${index}`,
    name: PARAMETER_NAME_PRESETS[index % PARAMETER_NAME_PRESETS.length],
    status,
  };
}

export function sortParametersByStatus(parameters = []) {
  return parameters
    .map((parameter, index) => ({
      parameter: normalizeParameter(parameter, index),
      index,
    }))
    .sort((left, right) => {
      const leftRank = PARAMETER_STATUS_ORDER.indexOf(left.parameter.status);
      const rightRank = PARAMETER_STATUS_ORDER.indexOf(right.parameter.status);

      if (leftRank !== rightRank) {
        return (leftRank === -1 ? PARAMETER_STATUS_ORDER.length : leftRank)
          - (rightRank === -1 ? PARAMETER_STATUS_ORDER.length : rightRank);
      }

      return left.index - right.index;
    })
    .map(({ parameter }) => parameter);
}

export function getParameterSummary(parameters = []) {
  const sortedParameters = sortParametersByStatus(parameters);
  const approvedCount = sortedParameters.filter((parameter) => parameter.status === 'Approved').length;

  return {
    approvedCount,
    totalCount: sortedParameters.length,
    sortedParameters,
  };
}

export default function ParameterCircles({ parameters = [], className = '' }) {
  const tooltipId = useId();
  const [activeIndex, setActiveIndex] = useState(null);
  const sortedParameters = sortParametersByStatus(parameters);

  return (
    <div className={`parameter-circles ${className}`.trim()}>
      {sortedParameters.map((item, index) => {
        const visual = STATUS_VISUALS[item.status] ?? STATUS_VISUALS['Not allocated'];
        const Icon = visual.icon;
        const isActive = activeIndex === index;
        const label = `${item.name}, ${item.status}`;

        return (
          <button
            key={item.id}
            type="button"
            className={`parameter-circles__item ${isActive ? 'is-active' : ''}`}
            style={{
              '--parameter-circle-color': visual.circleColor,
              '--parameter-icon-color': visual.iconColor,
            }}
            aria-label={label}
            aria-describedby={isActive ? `${tooltipId}-${index}` : undefined}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex((current) => (current === index ? null : current))}
            onFocus={() => setActiveIndex(index)}
            onBlur={() => setActiveIndex((current) => (current === index ? null : current))}
          >
            <Icon
              size={16}
              stroke={1.8}
              className="parameter-circles__icon"
              aria-hidden="true"
            />
            <span
              id={`${tooltipId}-${index}`}
              className={`parameter-circles__tooltip ${isActive ? 'is-visible' : ''}`}
              role="tooltip"
            >
              <span className="parameter-circles__tooltip-name">{item.name}</span>
              <span className="parameter-circles__tooltip-status">{item.status}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
