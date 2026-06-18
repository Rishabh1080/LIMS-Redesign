import {
  IconAlertCircle,
  IconActivity,
  IconAdjustmentsHorizontal,
  IconAffiliate,
  IconArrowUpRight,
  IconApps,
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
  IconDatabaseCog,
  IconDeviceFloppy,
  IconEdit,
  IconEye,
  IconDotsVertical,
  IconDownload,
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
  IconSettingsCog,
  IconSearch,
  IconSend2,
  IconTool,
  IconTrash,
  IconUser,
  IconUserCog,
  IconUserPlus,
  IconUserShield,
  IconX,
} from '@tabler/icons-react';

const iconMap = {
  'alert-circle': IconAlertCircle,
  activity: IconActivity,
  'admin-configurations': IconAdjustmentsHorizontal,
  'admin-eln': IconAffiliate,
  'admin-hub': IconUserShield,
  'admin-modules': IconApps,
  'admin-personnel': IconUserCog,
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
  'master-data': IconDatabaseCog,
  edit: IconEdit,
  eye: IconEye,
  download: IconDownload,
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
  'system-settings': IconSettingsCog,
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
