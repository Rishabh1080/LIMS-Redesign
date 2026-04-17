import {
  IconAlertCircle,
  IconActivity,
  IconArrowUpRight,
  IconBell,
  IconBuildingWarehouse,
  IconCalendar,
  IconCheck,
  IconChecklist,
  IconChecks,
  IconClipboardList,
  IconClipboardText,
  IconCloudDataConnection,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconDatabase,
  IconDeviceFloppy,
  IconEdit,
  IconEye,
  IconDotsVertical,
  IconExternalLink,
  IconFileDescription,
  IconFileText,
  IconFilter,
  IconFlask,
  IconHome2,
  IconLayoutGrid,
  IconLogout2,
  IconMenu2,
  IconPhone,
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconSettings,
  IconSearch,
  IconSend2,
  IconTool,
  IconTrash,
  IconUser,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';

const iconMap = {
  'alert-circle': IconAlertCircle,
  activity: IconActivity,
  'arrow-up-right': IconArrowUpRight,
  bell: IconBell,
  'building-warehouse': IconBuildingWarehouse,
  calendar: IconCalendar,
  check: IconCheck,
  checklist: IconChecklist,
  checks: IconChecks,
  'clipboard-list': IconClipboardList,
  'clipboard-text': IconClipboardText,
  'cloud-data': IconCloudDataConnection,
  'chevron-down': IconChevronDown,
  'chevron-left': IconChevronLeft,
  'chevron-right': IconChevronRight,
  'chevron-up': IconChevronUp,
  close: IconX,
  database: IconDatabase,
  edit: IconEdit,
  eye: IconEye,
  'external-link': IconExternalLink,
  'file-description': IconFileDescription,
  'file-text': IconFileText,
  filter: IconFilter,
  home: IconHome2,
  menu: IconMenu2,
  more: IconDotsVertical,
  phone: IconPhone,
  plus: IconPlus,
  printer: IconPrinter,
  refresh: IconRefresh,
  settings: IconSettings,
  save: IconDeviceFloppy,
  search: IconSearch,
  send: IconSend2,
  tool: IconTool,
  trash: IconTrash,
  user: IconUser,
  'user-plus': IconUserPlus,
  workspace: IconFlask,
  'all-samples': IconLayoutGrid,
  'leave-records': IconLogout2,
  materials: IconBuildingWarehouse,
  'requests-for-me': IconClipboardList,
  'test-requests': IconClipboardText,
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
