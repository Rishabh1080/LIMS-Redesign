import { useState } from 'react';
import AppIcon from '../AppIcon';
import PrimaryButton from './PrimaryButton';

const iconOptions = [undefined, 'plus', 'save', 'send', 'check', 'close', 'printer', 'user-plus'];

const bootstrapButtonVariants = [
  { label: 'Primary', className: 'btn-primary' },
  { label: 'Outline Primary', className: 'btn-outline-primary' },
  { label: 'Neutral', className: 'btn-outline-secondary' },
  { label: 'Success', className: 'btn-success' },
  { label: 'Outline Success', className: 'btn-outline-success' },
  { label: 'Danger', className: 'btn-danger' },
  { label: 'Outline Danger', className: 'btn-outline-danger' },
];

const bootstrapSizes = [
  { label: 'Large / default', className: '' },
  { label: 'Medium', className: 'btn-sm' },
];

const bootstrapLayouts = [
  {
    label: 'Label only',
    render: (label) => <span>{label}</span>,
  },
  {
    label: 'Leading icon',
    render: (label) => (
      <>
        <AppIcon name="plus" />
        <span>{label}</span>
      </>
    ),
  },
  {
    label: 'Trailing icon',
    render: (label) => (
      <>
        <span>{label}</span>
        <AppIcon name="arrow-up-right" />
      </>
    ),
  },
  {
    label: 'Both icons',
    render: (label) => (
      <>
        <AppIcon name="save" />
        <span>{label}</span>
        <AppIcon name="check" />
      </>
    ),
  },
  {
    label: 'Icon only',
    iconOnly: true,
    render: () => <AppIcon name="plus" />,
  },
];

const meta = {
  title: 'Components/Buttons',
  component: PrimaryButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Button system built on Bootstrap-style classes. Preferred usage is `smplfy-btn btn btn-primary`, `smplfy-btn btn btn-outline-primary`, `smplfy-btn btn btn-success`, or `smplfy-btn btn btn-danger`; the React wrapper remains for existing screens.',
      },
    },
  },
  args: {
    children: 'Save',
    styleVariant: 'default',
    size: 'default',
    disabled: false,
    leftIcon: undefined,
    rightIcon: undefined,
    type: 'button',
  },
  argTypes: {
    children: {
      control: 'text',
      description: 'Visible button label. If omitted and an icon is provided, the button becomes icon-only.',
    },
    styleVariant: {
      control: 'select',
      options: ['default', 'primary', 'positive', 'success', 'destructive', 'danger', 'red'],
      description: 'Compatibility prop. Prefer Bootstrap classes such as `btn-primary`, `btn-success`, and `btn-danger`.',
    },
    size: {
      control: 'select',
      options: ['default', 'medium', 'small'],
      description: 'Compatibility prop. Prefer Bootstrap size class `btn-sm` for the medium button.',
    },
    leftIcon: {
      control: 'select',
      options: iconOptions,
      description: 'Optional leading icon name from `AppIcon`.',
    },
    rightIcon: {
      control: 'select',
      options: iconOptions,
      description: 'Optional trailing icon name from `AppIcon`.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button and removes interaction.',
    },
    label: {
      table: {
        disable: true,
      },
    },
    className: {
      table: {
        disable: true,
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler.',
    },
  },
};

export default meta;

function StoryStack({ children, align = 'center' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        alignItems: align,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

function StoryRow({ children, wrap = true }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}

function Surface({ children }) {
  return (
    <div
      style={{
        padding: '24px',
        background: '#ffffff',
        border: '1px solid #e6e8eb',
        borderRadius: '12px',
        minWidth: '320px',
      }}
    >
      {children}
    </div>
  );
}

export const Playground = {};

export const Variants = {
  render: () => (
    <Surface>
      <StoryRow>
        <PrimaryButton>Default</PrimaryButton>
        <PrimaryButton styleVariant="positive" leftIcon="check">
          Positive
        </PrimaryButton>
        <PrimaryButton styleVariant="destructive" leftIcon="close">
          Destructive
        </PrimaryButton>
        <PrimaryButton styleVariant="red" leftIcon="trash">
          Red Alias
        </PrimaryButton>
      </StoryRow>
    </Surface>
  ),
};

export const Sizes = {
  render: () => (
    <Surface>
      <StoryStack align="flex-start">
        <StoryRow>
          <PrimaryButton leftIcon="save">Default</PrimaryButton>
          <PrimaryButton size="medium" leftIcon="save">
            Medium
          </PrimaryButton>
          <PrimaryButton size="small" leftIcon="save">
            Small
          </PrimaryButton>
        </StoryRow>
        <StoryRow>
          <PrimaryButton aria-label="Save default" leftIcon="save" />
          <PrimaryButton size="medium" aria-label="Save medium" leftIcon="save" />
          <PrimaryButton size="small" aria-label="Save small" leftIcon="save" />
        </StoryRow>
      </StoryStack>
    </Surface>
  ),
};

export const IconCombinations = {
  render: () => (
    <Surface>
      <StoryRow>
        <PrimaryButton leftIcon="plus">Left Icon</PrimaryButton>
        <PrimaryButton rightIcon="arrow-up-right">Right Icon</PrimaryButton>
        <PrimaryButton leftIcon="save" rightIcon="check">
          Both Icons
        </PrimaryButton>
        <PrimaryButton aria-label="Create item" leftIcon="plus" />
      </StoryRow>
    </Surface>
  ),
};

export const DisabledStates = {
  render: () => (
    <Surface>
      <StoryRow>
        <PrimaryButton disabled leftIcon="save">
          Default Disabled
        </PrimaryButton>
        <PrimaryButton disabled styleVariant="positive" leftIcon="check">
          Positive Disabled
        </PrimaryButton>
        <PrimaryButton disabled styleVariant="destructive" leftIcon="close">
          Destructive Disabled
        </PrimaryButton>
      </StoryRow>
    </Surface>
  ),
};

function BootstrapClassButton({
  variantClass,
  sizeClass = '',
  layout,
  disabled = false,
}) {
  const classes = ['smplfy-btn', 'btn', variantClass, sizeClass].filter(Boolean).join(' ');
  const label = layout.iconOnly ? 'Action' : variantClass.replace('btn-', '');

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      aria-label={layout.iconOnly ? `${label} ${layout.label}` : undefined}
    >
      {layout.render(label)}
    </button>
  );
}

export const BootstrapClassMatrix = {
  parameters: {
    docs: {
      description: {
        story: 'The class-first API: one `smplfy-btn` alias plus standard Bootstrap base and variant classes. The same CSS covers every size, state, and icon composition.',
      },
    },
  },
  render: () => (
    <Surface>
      <StoryStack align="stretch">
        {bootstrapButtonVariants.map((variant) => (
          <div key={variant.className}>
            <div
              style={{
                color: 'var(--smplfy-semantic-color-text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              smplfy-btn btn {variant.className}
            </div>
            <StoryStack align="flex-start">
              {bootstrapSizes.map((size) => (
                <StoryRow key={`${variant.className}-${size.label}`}>
                  {bootstrapLayouts.map((layout) => (
                    <BootstrapClassButton
                      key={`${variant.className}-${size.label}-${layout.label}`}
                      variantClass={variant.className}
                      sizeClass={size.className}
                      layout={layout}
                    />
                  ))}
                </StoryRow>
              ))}
              <StoryRow>
                {bootstrapLayouts.map((layout) => (
                  <BootstrapClassButton
                    key={`${variant.className}-disabled-${layout.label}`}
                    variantClass={variant.className}
                    layout={layout}
                    disabled
                  />
                ))}
              </StoryRow>
            </StoryStack>
          </div>
        ))}
      </StoryStack>
    </Surface>
  ),
};

export const InContext = {
  render: () => (
    <div
      style={{
        padding: '24px',
        background: '#ffffff',
        border: '1px solid #e6e8eb',
        borderRadius: '16px',
        width: '420px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: 1.2,
            color: '#1c2126',
            marginBottom: '8px',
          }}
        >
          Save Material Changes
        </div>
        <div
          style={{
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#4d5561',
          }}
        >
          Primary buttons should represent the main action in a surface, with secondary actions visually de-emphasized.
        </div>
      </div>
      <StoryRow>
        <PrimaryButton leftIcon="save">Save</PrimaryButton>
        <PrimaryButton styleVariant="positive" leftIcon="check">
          Approve
        </PrimaryButton>
      </StoryRow>
    </div>
  ),
};

export const InteractiveExample = {
  parameters: {
    docs: {
      description: {
        story: 'Simple interaction example showing that the component works like a normal React button and can drive local UI state.',
      },
    },
  },
  render: function Render(args) {
    const [count, setCount] = useState(0);

    return (
      <Surface>
        <StoryStack align="flex-start">
          <div
            style={{
              fontSize: '14px',
              color: '#4d5561',
            }}
          >
            Click count: <strong style={{ color: '#1c2126' }}>{count}</strong>
          </div>
          <PrimaryButton
            {...args}
            leftIcon="plus"
            onClick={(event) => {
              setCount((current) => current + 1);
              args.onClick?.(event);
            }}
          >
            Add Item
          </PrimaryButton>
        </StoryStack>
      </Surface>
    );
  },
};
