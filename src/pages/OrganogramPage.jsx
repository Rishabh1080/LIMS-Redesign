import { useCallback, useEffect, useRef, useState } from 'react';
import AppChrome from '../components/AppChrome/AppChrome';
import AppIcon from '../components/AppIcon';
import './organogram-page.scss';

const ORGANOGRAM_CARD_WIDTH = 202;
const ORGANOGRAM_CARD_HEIGHT = 122;
const ORGANOGRAM_HORIZONTAL_GAP = 32;
const ORGANOGRAM_LEVEL_GAP = 56;
const ORGANOGRAM_LAYOUT_SIDE_PADDING = 260;
const ORGANOGRAM_LAYOUT_VERTICAL_PADDING = 48;
const ORGANOGRAM_MIN_ZOOM = 0.34;
const ORGANOGRAM_MAX_ZOOM = 1.2;
const ORGANOGRAM_DEFAULT_ZOOM = 1;
const ORGANOGRAM_EXPORT_FILE_NAME = 'organogram-landscape.svg';
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

function getCardRowWidth(count) {
  if (!count) {
    return 0;
  }

  return count * ORGANOGRAM_CARD_WIDTH + (count - 1) * ORGANOGRAM_HORIZONTAL_GAP;
}

function getOrganogramLayout(data) {
  const directReports = data.children ?? [];
  const groups = directReports.map((report, index) => {
    const children = report.children ?? [];
    const width = children.length ? getCardRowWidth(children.length) : ORGANOGRAM_CARD_WIDTH;

    return {
      report,
      reportId: `report-${index}`,
      children,
      width,
    };
  });
  const contentWidth = groups.reduce((totalWidth, group, index) => (
    totalWidth + group.width + (index > 0 ? ORGANOGRAM_HORIZONTAL_GAP : 0)
  ), 0);
  const canvasWidth = Math.max(ORGANOGRAM_CARD_WIDTH, contentWidth) + ORGANOGRAM_LAYOUT_SIDE_PADDING * 2;
  const rootY = ORGANOGRAM_LAYOUT_VERTICAL_PADDING;
  const directReportsY = rootY + ORGANOGRAM_CARD_HEIGHT + ORGANOGRAM_LEVEL_GAP;
  const leafY = directReportsY + ORGANOGRAM_CARD_HEIGHT + ORGANOGRAM_LEVEL_GAP;
  let groupStartX = (canvasWidth - contentWidth) / 2;
  let contentBottomY = directReportsY + ORGANOGRAM_CARD_HEIGHT;
  const nodes = [];
  const nodesById = {};
  const connections = [];

  const addNode = (id, node, x, y) => {
    const nextNode = {
      id,
      name: node.name,
      role: node.role,
      x,
      y,
      color: node.color ?? ORGANOGRAM_ROOT_COLOR,
    };

    nodes.push(nextNode);
    nodesById[id] = nextNode;
    return nextNode;
  };

  addNode('root', data, (canvasWidth - ORGANOGRAM_CARD_WIDTH) / 2, rootY);

  const directReportIds = [];

  groups.forEach((group) => {
    const reportX = groupStartX + (group.width - ORGANOGRAM_CARD_WIDTH) / 2;
    const branchColor = ORGANOGRAM_BRANCH_COLORS[directReportIds.length % ORGANOGRAM_BRANCH_COLORS.length];

    addNode(group.reportId, { ...group.report, color: branchColor }, reportX, directReportsY);
    directReportIds.push(group.reportId);

    if (group.children.length) {
      const childIds = [];

      group.children.forEach((child, childIndex) => {
        const id = `${group.reportId}-member-${childIndex}`;
        const childX = groupStartX + childIndex * (ORGANOGRAM_CARD_WIDTH + ORGANOGRAM_HORIZONTAL_GAP);

        addNode(id, { ...child, color: branchColor }, childX, leafY);
        childIds.push(id);
      });

      connections.push({
        parentId: group.reportId,
        childIds,
      });
      contentBottomY = Math.max(contentBottomY, leafY + ORGANOGRAM_CARD_HEIGHT);
    }

    groupStartX += group.width + ORGANOGRAM_HORIZONTAL_GAP;
  });

  if (directReportIds.length) {
    connections.unshift({
      parentId: 'root',
      childIds: directReportIds,
    });
  }

  return {
    nodes,
    nodesById,
    connections,
    width: canvasWidth,
    height: contentBottomY + ORGANOGRAM_LAYOUT_VERTICAL_PADDING,
  };
}

const ORGANOGRAM_LAYOUT = getOrganogramLayout(organogramData);

const ORGANOGRAM_CANVAS = {
  width: ORGANOGRAM_LAYOUT.width,
  height: ORGANOGRAM_LAYOUT.height,
  minZoom: ORGANOGRAM_MIN_ZOOM,
  maxZoom: ORGANOGRAM_MAX_ZOOM,
  defaultZoom: ORGANOGRAM_DEFAULT_ZOOM,
};

let organogramCanvasView = {
  zoom: ORGANOGRAM_CANVAS.defaultZoom,
  offset: null,
};

function getInitials(name) {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function escapeSvgText(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function truncateSvgText(value, maxLength) {
  const text = String(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1)}…`;
}

function getOrganogramConnectorSegments(parent, children) {
  const parentCenterX = parent.x + ORGANOGRAM_CARD_WIDTH / 2;
  const parentBottomY = parent.y + ORGANOGRAM_CARD_HEIGHT;
  const childTopY = children[0].y;
  const forkY = parentBottomY + (childTopY - parentBottomY) / 2;
  const childCenters = children.map((child) => child.x + ORGANOGRAM_CARD_WIDTH / 2);

  if (children.length === 1) {
    return [{
      id: `${parent.id}-${children[0].id}`,
      x1: parentCenterX,
      y1: parentBottomY,
      x2: childCenters[0],
      y2: childTopY,
    }];
  }

  return [
    {
      id: `${parent.id}-stem`,
      x1: parentCenterX,
      y1: parentBottomY,
      x2: parentCenterX,
      y2: forkY,
    },
    {
      id: `${parent.id}-fork`,
      x1: Math.min(parentCenterX, ...childCenters),
      y1: forkY,
      x2: Math.max(parentCenterX, ...childCenters),
      y2: forkY,
    },
    ...children.map((child) => {
      const childCenterX = child.x + ORGANOGRAM_CARD_WIDTH / 2;

      return {
        id: `${parent.id}-${child.id}`,
        x1: childCenterX,
        y1: forkY,
        x2: childCenterX,
        y2: childTopY,
      };
    }),
  ];
}

function getOrganogramExportSvg() {
  const connectorLines = ORGANOGRAM_LAYOUT.connections
    .flatMap((connection) => getOrganogramConnectorSegments(
      ORGANOGRAM_LAYOUT.nodesById[connection.parentId],
      connection.childIds.map((childId) => ORGANOGRAM_LAYOUT.nodesById[childId]),
    ))
    .map((line) => (
      `<line x1="${line.x1}" y1="${line.y1}" x2="${line.x2}" y2="${line.y2}" class="connector" />`
    ))
    .join('');
  const cards = ORGANOGRAM_LAYOUT.nodes.map((node) => {
    const centerX = node.x + ORGANOGRAM_CARD_WIDTH / 2;
    const avatarCenterY = node.y + 36;
    const name = escapeSvgText(truncateSvgText(node.name, 24));
    const role = escapeSvgText(truncateSvgText(node.role, 31));

    return `
      <g>
        <rect x="${node.x}" y="${node.y}" width="${ORGANOGRAM_CARD_WIDTH}" height="${ORGANOGRAM_CARD_HEIGHT}" rx="8" class="card" fill="${escapeSvgText(node.color)}" />
        <circle cx="${centerX}" cy="${avatarCenterY}" r="24" class="avatar" />
        <text x="${centerX}" y="${avatarCenterY}" class="initials" dominant-baseline="middle" text-anchor="middle">${escapeSvgText(getInitials(node.name))}</text>
        <text x="${centerX}" y="${node.y + 81.5}" class="name" dominant-baseline="middle" text-anchor="middle">${name}</text>
        <text x="${centerX}" y="${node.y + 102.5}" class="role" dominant-baseline="middle" text-anchor="middle">${role}</text>
      </g>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${ORGANOGRAM_CANVAS.width}" height="${ORGANOGRAM_CANVAS.height}" viewBox="0 0 ${ORGANOGRAM_CANVAS.width} ${ORGANOGRAM_CANVAS.height}" role="img" aria-label="Company organogram">
  <style>
    .page { fill: #ffffff; }
    .connector { stroke: #aeb7c1; stroke-width: 1.4; fill: none; }
    .card { stroke: #d0d5dc; stroke-width: 1; }
    .avatar { fill: #ffffff; stroke: #d0d5dc; stroke-width: 1; }
    .initials { fill: #000000; font-family: Inter, Arial, sans-serif; font-size: 20px; font-weight: 500; letter-spacing: -0.02em; }
    .name { fill: #000b13; font-family: Inter, Arial, sans-serif; font-size: 16px; font-weight: 600; letter-spacing: -0.04em; }
    .role { fill: #6c737f; font-family: Inter, Arial, sans-serif; font-size: 12px; font-weight: 500; letter-spacing: -0.02em; }
  </style>
  <rect class="page" width="100%" height="100%" />
  ${connectorLines}
  ${cards}
</svg>`;
}

function downloadOrganogramLandscape() {
  const svg = getOrganogramExportSvg();
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = ORGANOGRAM_EXPORT_FILE_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getClampedOffset(offset, zoom, viewportSize) {
  const scaledWidth = ORGANOGRAM_CANVAS.width * zoom;
  const scaledHeight = ORGANOGRAM_CANVAS.height * zoom;
  const centeredX = (viewportSize.width - scaledWidth) / 2;
  const centeredY = (viewportSize.height - scaledHeight) / 2;

  const minX = scaledWidth > viewportSize.width ? viewportSize.width - scaledWidth : centeredX;
  const maxX = scaledWidth > viewportSize.width ? 0 : centeredX;
  const minY = scaledHeight > viewportSize.height ? viewportSize.height - scaledHeight : centeredY;
  const maxY = scaledHeight > viewportSize.height ? 0 : centeredY;

  return {
    x: clamp(offset.x, minX, maxX),
    y: clamp(offset.y, minY, maxY),
  };
}

function getDefaultOffset(zoom, viewportSize) {
  return getClampedOffset({
    x: (viewportSize.width - ORGANOGRAM_CANVAS.width * zoom) / 2,
    y: 24,
  }, zoom, viewportSize);
}

function getFitView(viewportSize) {
  const zoom = clamp(
    Math.min(
      (viewportSize.width - 48) / ORGANOGRAM_CANVAS.width,
      (viewportSize.height - 48) / ORGANOGRAM_CANVAS.height,
    ),
    ORGANOGRAM_CANVAS.minZoom,
    ORGANOGRAM_CANVAS.maxZoom,
  );

  return {
    zoom,
    offset: getClampedOffset({
      x: (viewportSize.width - ORGANOGRAM_CANVAS.width * zoom) / 2,
      y: (viewportSize.height - ORGANOGRAM_CANVAS.height * zoom) / 2,
    }, zoom, viewportSize),
  };
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

function OrganogramConnector({ parent, children }) {
  return (
    <g>
      {getOrganogramConnectorSegments(parent, children).map((line) => (
        <line
          key={line.id}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          className="smplfy-organogram-connector"
        />
      ))}
    </g>
  );
}

function OrganogramUserCard({ node }) {
  return (
    <article
      className="smplfy-organogram-user-card position-absolute d-flex flex-column align-items-center justify-content-center text-center"
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        backgroundColor: node.color,
      }}
      title={`${node.name} - ${node.role}`}
    >
      <div className="smplfy-organogram-user-avatar d-inline-flex align-items-center justify-content-center">
        {getInitials(node.name)}
      </div>
      <div className="d-flex flex-column align-items-center gap-1 w-100">
        <div className="smplfy-organogram-user-name text-truncate">{node.name}</div>
        <div className="smplfy-organogram-user-role text-truncate">{node.role}</div>
      </div>
    </article>
  );
}

function OrganogramChart() {
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const initializedRef = useRef(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [view, setView] = useState({
    zoom: organogramCanvasView.zoom,
    offset: organogramCanvasView.offset ?? { x: 0, y: 0 },
  });

  const commitView = useCallback((updater) => {
    setView((currentView) => {
      const nextView = typeof updater === 'function' ? updater(currentView) : updater;
      organogramCanvasView = nextView;
      return nextView;
    });
  }, []);

  useEffect(() => {
    const viewportNode = viewportRef.current;

    if (!viewportNode) {
      return undefined;
    }

    const updateViewportSize = () => {
      const rect = viewportNode.getBoundingClientRect();
      const nextViewportSize = {
        width: rect.width,
        height: rect.height,
      };

      setViewportSize(nextViewportSize);
      commitView((currentView) => {
        const baseOffset = initializedRef.current || organogramCanvasView.offset
          ? currentView.offset
          : getDefaultOffset(currentView.zoom, nextViewportSize);

        initializedRef.current = true;

        return {
          zoom: currentView.zoom,
          offset: getClampedOffset(baseOffset, currentView.zoom, nextViewportSize),
        };
      });
    };

    updateViewportSize();

    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(updateViewportSize);
      resizeObserver.observe(viewportNode);

      return () => resizeObserver.disconnect();
    }

    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, [commitView]);

  const updateZoom = useCallback((zoomFactor, origin) => {
    if (!viewportSize.width || !viewportSize.height) {
      return;
    }

    const focalPoint = origin ?? {
      x: viewportSize.width / 2,
      y: viewportSize.height / 2,
    };

    commitView((currentView) => {
      const nextZoom = clamp(
        currentView.zoom * zoomFactor,
        ORGANOGRAM_CANVAS.minZoom,
        ORGANOGRAM_CANVAS.maxZoom,
      );
      const contentPoint = {
        x: (focalPoint.x - currentView.offset.x) / currentView.zoom,
        y: (focalPoint.y - currentView.offset.y) / currentView.zoom,
      };

      return {
        zoom: nextZoom,
        offset: getClampedOffset({
          x: focalPoint.x - contentPoint.x * nextZoom,
          y: focalPoint.y - contentPoint.y * nextZoom,
        }, nextZoom, viewportSize),
      };
    });
  }, [commitView, viewportSize]);

  const handleFit = useCallback(() => {
    if (!viewportSize.width || !viewportSize.height) {
      return;
    }

    commitView(getFitView(viewportSize));
  }, [commitView, viewportSize]);

  const handlePointerDown = useCallback((event) => {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setIsDragging(true);
    event.preventDefault();
  }, []);

  const handlePointerMove = useCallback((event) => {
    const dragState = dragRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const dx = event.clientX - dragState.x;
    const dy = event.clientY - dragState.y;
    dragRef.current = {
      ...dragState,
      x: event.clientX,
      y: event.clientY,
    };

    commitView((currentView) => ({
      zoom: currentView.zoom,
      offset: getClampedOffset({
        x: currentView.offset.x + dx,
        y: currentView.offset.y + dy,
      }, currentView.zoom, viewportSize),
    }));
  }, [commitView, viewportSize]);

  const handlePointerUp = useCallback((event) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setIsDragging(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const handleWheel = useCallback((event) => {
    if (!viewportRef.current) {
      return;
    }

    event.preventDefault();
    const rect = viewportRef.current.getBoundingClientRect();
    const zoomFactor = event.deltaY < 0 ? 1.08 : 0.92;

    updateZoom(zoomFactor, {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  }, [updateZoom]);

  return (
    <div
      ref={viewportRef}
      className="smplfy-organogram-chart-scroll"
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      <div
        className="position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Zoom in"
          onClick={() => updateZoom(1.12)}
        >
          <AppIcon name="zoom-in" size={16} />
        </button>
        <button
          type="button"
          className="smplfy-btn btn btn-outline-secondary btn-sm p-0 d-inline-flex align-items-center justify-content-center smplfy-organogram-control-btn"
          aria-label="Zoom out"
          onClick={() => updateZoom(0.88)}
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
          onClick={downloadOrganogramLandscape}
        >
          <AppIcon name="download" size={16} />
        </button>
      </div>
      <div
        className="smplfy-organogram-chart"
        style={{
          '--smplfy-organogram-canvas-width': `${ORGANOGRAM_CANVAS.width}px`,
          '--smplfy-organogram-canvas-height': `${ORGANOGRAM_CANVAS.height}px`,
          transform: `translate3d(${view.offset.x}px, ${view.offset.y}px, 0) scale(${view.zoom})`,
        }}
        aria-label="Company organogram chart"
      >
        <svg
          className="smplfy-organogram-connectors position-absolute top-0 start-0"
          width={ORGANOGRAM_CANVAS.width}
          height={ORGANOGRAM_CANVAS.height}
          viewBox={`0 0 ${ORGANOGRAM_CANVAS.width} ${ORGANOGRAM_CANVAS.height}`}
          aria-hidden="true"
        >
          {ORGANOGRAM_LAYOUT.connections.map((connection) => (
            <OrganogramConnector
              key={connection.parentId}
              parent={ORGANOGRAM_LAYOUT.nodesById[connection.parentId]}
              children={connection.childIds.map((childId) => ORGANOGRAM_LAYOUT.nodesById[childId])}
            />
          ))}
        </svg>
        {ORGANOGRAM_LAYOUT.nodes.map((node) => (
          <OrganogramUserCard key={node.id} node={node} />
        ))}
      </div>
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
