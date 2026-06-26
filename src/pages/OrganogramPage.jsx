import { useCallback, useEffect, useMemo, useRef } from 'react';
import ApexTree from 'apextree';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import './organogram-page.scss';

const ORGANOGRAM_NODE_WIDTH = 202;
const ORGANOGRAM_NODE_HEIGHT = 122;
const APEX_TREE_LICENSE_KEY = import.meta.env.VITE_APEXTREE_LICENSE_KEY;
const ORGANOGRAM_ROOT_COLOR = '#F1F8FE';
const ORGANOGRAM_BRANCH_COLORS = [
  '#F1FEF5',
  '#FCFEF1',
  '#FEF3F1',
  '#F9F1FE',
  '#F1F8FE',
];

const organogramData = {
  name: 'Aarav Mehta',
  role: 'Founder & CEO',
  children: [
    {
      name: 'Naina Kapoor',
      role: 'Head of Product',
      children: [
        { name: 'Meera Shah', role: 'Product Manager' },
        { name: 'Rishit Bansal', role: 'Product Designer' },
        { name: 'Ananya Rao', role: 'UX Researcher' },
      ],
    },
    {
      name: 'Rohan Iyer',
      role: 'Head of Engineering',
      children: [
        { name: 'Devansh Gupta', role: 'Frontend Engineer' },
        { name: 'Sneha Kulkarni', role: 'Frontend Engineer' },
        { name: 'Arjun Menon', role: 'Backend Engineer' },
        { name: 'Kavya Jain', role: 'Backend Engineer' },
        { name: 'Aditya Sharma', role: 'QA Engineer' },
        { name: 'Isha Verma', role: 'DevOps Engineer' },
      ],
    },
    {
      name: 'Priya Nair',
      role: 'Head of Sales',
      children: [
        { name: 'Vikram Singh', role: 'Account Executive' },
        { name: 'Tanvi Deshpande', role: 'Sales Development Representative' },
      ],
    },
    {
      name: 'Karan Malhotra',
      role: 'Head of Customer Success',
      children: [
        { name: 'Neeraj Chawla', role: 'Customer Success Manager' },
        { name: 'Pooja Reddy', role: 'Implementation Specialist' },
      ],
    },
    { name: 'Siddharth Joshi', role: 'Growth Marketing Manager' },
    { name: 'Bhavna Agarwal', role: 'People & Operations Manager' },
  ],
};

if (APEX_TREE_LICENSE_KEY) {
  ApexTree.setLicense(APEX_TREE_LICENSE_KEY);
}

function getInitials(name) {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getNodeOptions() {
  return {
    nodeBGColor: 'transparent',
    nodeBGColorHover: 'transparent',
    borderColor: 'transparent',
    borderColorHover: 'transparent',
    borderWidth: 0,
    nodeShadow: 'none',
    nodeShadowHover: 'none',
  };
}

function toApexTreeNode(node, id, level = 0, branchColor = ORGANOGRAM_ROOT_COLOR) {
  const color = level === 0 ? ORGANOGRAM_ROOT_COLOR : branchColor;

  return {
    id,
    name: node.name,
    data: {
      name: node.name,
      role: node.role,
      initials: getInitials(node.name),
      color,
    },
    options: getNodeOptions(),
    children: (node.children ?? []).map((child, index) => {
      const childBranchColor = level === 0
        ? ORGANOGRAM_BRANCH_COLORS[index % ORGANOGRAM_BRANCH_COLORS.length]
        : color;

      return toApexTreeNode(child, `${id}-${index}`, level + 1, childBranchColor);
    }),
  };
}

function getNodeTemplate(content) {
  const color = escapeHtml(content?.color ?? ORGANOGRAM_ROOT_COLOR);
  const initials = escapeHtml(content?.initials ?? '');
  const name = escapeHtml(content?.name ?? '');
  const role = escapeHtml(content?.role ?? '');

  return `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 12px 20px;
      gap: 12px;
      text-align: center;
      background: ${color};
      border: 1px solid #d0d5dc;
      border-radius: 8px;
    ">
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        flex: 0 0 auto;
        background: #ffffff;
        border: 1px solid #d0d5dc;
        border-radius: 99px;
        color: #000000;
        font-size: 20px;
        font-weight: 500;
        line-height: 24px;
        letter-spacing: -0.02em;
      ">${initials}</div>
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        width: 100%;
        min-width: 0;
      ">
        <div style="
          width: 162px;
          max-width: 162px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #000b13;
          font-size: 16px;
          font-weight: 600;
          line-height: 19px;
          letter-spacing: -0.04em;
        ">${name}</div>
        <div style="
          width: 162px;
          max-width: 162px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #6c737f;
          font-size: 12px;
          font-weight: 500;
          line-height: 15px;
          letter-spacing: -0.02em;
        ">${role}</div>
      </div>
    </div>
  `;
}

function OrganogramHeader() {
  return (
    <section className="bg-white border-bottom px-4 py-3">
      <div className="container-fluid px-0">
        <div className="row align-items-center gx-0">
          <div className="col-auto">
            <h1 className="h5 mb-0 fw-semibold text-dark">Organogram</h1>
          </div>
        </div>
      </div>
    </section>
  );
}

function OrganogramChart() {
  const treeContainerRef = useRef(null);
  const treeRef = useRef(null);
  const graphRef = useRef(null);
  const treeData = useMemo(() => toApexTreeNode(organogramData, 'aarav-mehta'), []);

  useEffect(() => {
    const containerNode = treeContainerRef.current;

    if (!containerNode) {
      return undefined;
    }

    containerNode.innerHTML = '';

    const tree = new ApexTree(containerNode, {
      contentKey: 'data',
      nodeTemplate: getNodeTemplate,
      width: '100%',
      height: '100%',
      viewPortWidth: 1800,
      viewPortHeight: 900,
      nodeWidth: ORGANOGRAM_NODE_WIDTH,
      nodeHeight: ORGANOGRAM_NODE_HEIGHT,
      childrenSpacing: 56,
      siblingSpacing: 32,
      paddingX: 120,
      paddingY: 64,
      direction: 'top',
      edgeStyle: 'orthogonal',
      edgeColor: '#cbd2da',
      edgeColorHover: '#9aa4b2',
      edgeWidth: 1.4,
      highlightOnHover: false,
      enableExpandCollapse: true,
      expandCollapseOnNodeClick: false,
      enableExpandCollapseZoom: true,
      enableToolbar: false,
      enableZoomPan: true,
      enableAnimation: true,
      canvasStyle: 'background: #ffffff;',
      a11y: {
        label: 'Company organogram',
      },
    });

    treeRef.current = tree;
    graphRef.current = tree.render(treeData);

    return () => {
      graphRef.current = null;
      treeRef.current?.destroy?.();
      treeRef.current = null;
      containerNode.innerHTML = '';
    };
  }, [treeData]);

  const handleZoomIn = useCallback(() => {
    graphRef.current?.zoom(0.1);
  }, []);

  const handleZoomOut = useCallback(() => {
    graphRef.current?.zoom(-0.1);
  }, []);

  const handleFit = useCallback(() => {
    graphRef.current?.fitScreen();
  }, []);

  const handleDownload = useCallback(() => {
    graphRef.current?.exportToSvg();
  }, []);

  return (
    <div className="smplfy-organogram-chart-scroll">
      <div
        className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Zoom in"
          onClick={handleZoomIn}
        >
          <AppIcon name="zoom-in" size={16} />
        </button>
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Zoom out"
          onClick={handleZoomOut}
        >
          <AppIcon name="zoom-out" size={16} />
        </button>
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Zoom to fit"
          onClick={handleFit}
        >
          <AppIcon name="arrows-maximize" size={16} />
        </button>
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Download organogram"
          onClick={handleDownload}
        >
          <AppIcon name="download" size={16} />
        </button>
      </div>
      <div ref={treeContainerRef} className="w-100 h-100" />
    </div>
  );
}

export default function OrganogramPage({
  onNavigate,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  sidebarBadgeCounts,
}) {
  return (
    <AppChrome
      activeNav="organogram"
      onNavigate={onNavigate}
      breadcrumbs={[{ key: 'organogram', label: 'Organogram', current: true }]}
      sidebarCollapsed={sidebarCollapsed}
      onSidebarCollapsedChange={onSidebarCollapsedChange}
      sidebarBadgeCounts={sidebarBadgeCounts}
      pageHeader={<OrganogramHeader />}
    >
      <main className="smplfy-organogram-page bg-white">
        <OrganogramChart />
      </main>
    </AppChrome>
  );
}
