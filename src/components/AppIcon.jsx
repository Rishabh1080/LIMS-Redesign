import {
  IconActivity,
  IconBell,
  IconCalendar,
  IconCheck,
  IconChecks,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconDotsVertical,
  IconFileText,
  IconFilter,
  IconFlask,
  IconHome2,
  IconLayoutGrid,
  IconMenu2,
  IconPhone,
  IconPlus,
  IconSearch,
  IconSend2,
  IconTrash,
  IconUser,
  IconX,
} from '@tabler/icons-react';

const iconMap = {
  activity: IconActivity,
  bell: IconBell,
  calendar: IconCalendar,
  check: IconCheck,
  checks: IconChecks,
  'chevron-down': IconChevronDown,
  'chevron-left': IconChevronLeft,
  'chevron-right': IconChevronRight,
  close: IconX,
  'file-text': IconFileText,
  filter: IconFilter,
  home: IconHome2,
  menu: IconMenu2,
  more: IconDotsVertical,
  phone: IconPhone,
  plus: IconPlus,
  save: IconDeviceFloppy,
  search: IconSearch,
  send: IconSend2,
  trash: IconTrash,
  user: IconUser,
  workspace: IconFlask,
  'all-samples': IconLayoutGrid,
};

export default function AppIcon({
  name,
  size = '1em',
  stroke = 1.8,
  className = '',
  ...props
}) {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    return null;
  }

  return (
    <IconComponent
      size={size}
      stroke={stroke}
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
      {...props}
    />
  );
}
