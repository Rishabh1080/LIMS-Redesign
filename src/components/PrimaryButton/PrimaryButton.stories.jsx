import { useState } from 'react';
import PrimaryButton from './PrimaryButton';

const iconOptions = [undefined, 'plus', 'save', 'send', 'check', 'close', 'printer', 'user-plus'];

const meta = {
  title: 'Components/Primary Button',
  component: PrimaryButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Primary action button used for the highest-emphasis actions in the LIMS UI. Supports semantic variants, multiple sizes, optional icons on either side, disabled state, and icon-only usage.',
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
      options: ['default', 'positive', 'destructive', 'red'],
      description: 'Visual emphasis variant.',
    },
    size: {
      control: 'select',
      options: ['default', 'medium', 'small'],
      description: 'Button size.',
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
