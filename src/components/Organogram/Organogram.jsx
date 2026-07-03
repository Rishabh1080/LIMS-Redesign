import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import AppIcon from '../AppIcon';
import './Organogram.scss';

const DEFAULT_NODE_WIDTH = 202;
const DEFAULT_NODE_HEIGHT = 122;
const DEFAULT_SIBLING_SPACING = 32;
const DEFAULT_LEVEL_SPACING = 56;
const DEFAULT_PADDING_X = 120;
const DEFAULT_PADDING_Y = 64;
const DEFAULT_ROOT_COLOR = '#F1F8FE';
const DEFAULT_BRANCH_COLORS = ['#F1FEF5', '#FCFEF1', '#FEF3F1', '#F9F1FE', '#F1F8FE'];
const MIN_SCALE = 0.1;
const MAX_SCALE = 2.5;

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getInitials(name) {
  return String(name ?? '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function normalizeNode(node, path, level, inheritedColor, rootColor, branchColors) {
  const color = node.color ?? (level === 0 ? rootColor : inheritedColor);
  const id = String(node.id ?? path);

  return {
    ...node,
    id,
    level,
    color,
    initials: node.initials ?? getInitials(node.name),
    children: (node.children ?? []).map((child, index) => {
      const childColor = level === 0
        ? branchColors[index % branchColors.length] ?? rootColor
        : color;

      return normalizeNode(child, `${id}-${index}`, level + 1, childColor, rootColor, branchColors);
    }),
  };
}

function getChildrenWidth(children, measurements, siblingSpacing) {
  if (!children.length) {
    return 0;
  }

  return children.reduce((total, child) => total + measurements.get(child.id).width, 0)
    + siblingSpacing * (children.length - 1);
}

function calculateLayout(root, collapsedIds, options) {
  const {
    nodeWidth,
    nodeHeight,
    siblingSpacing,
    levelSpacing,
    paddingX,
    paddingY,
  } = options;
  const measurements = new Map();

  function measure(node) {
    const visibleChildren = collapsedIds.has(node.id) ? [] : node.children;

    visibleChildren.forEach(measure);

    const childrenWidth = getChildrenWidth(visibleChildren, measurements, siblingSpacing);
    const width = Math.max(nodeWidth, childrenWidth);

    measurements.set(node.id, { visibleChildren, childrenWidth, width });
    return width;
  }

  const contentWidth = measure(root);
  const nodes = [];
  const edges = [];
  const positions = new Map();
  let maximumDepth = 0;

  function place(node, subtreeLeft, depth, parentId = null) {
    const measurement = measurements.get(node.id);
    const x = paddingX + subtreeLeft + (measurement.width - nodeWidth) / 2;
    const y = paddingY + depth * (nodeHeight + levelSpacing);
    const positionedNode = {
      ...node,
      x,
      y,
      depth,
      parentId,
      hasChildren: node.children.length > 0,
      isCollapsed: collapsedIds.has(node.id),
    };

    nodes.push(positionedNode);
    positions.set(node.id, positionedNode);
    maximumDepth = Math.max(maximumDepth, depth);

    if (!measurement.visibleChildren.length) {
      return positionedNode;
    }

    let childLeft = subtreeLeft + (measurement.width - measurement.childrenWidth) / 2;

    measurement.visibleChildren.forEach((child) => {
      const childPosition = place(child, childLeft, depth + 1, node.id);

      edges.push({
        id: `${node.id}-${child.id}`,
        parentId: node.id,
        childId: child.id,
        parent: positionedNode,
        child: childPosition,
      });
      childLeft += measurements.get(child.id).width + siblingSpacing;
    });

    return positionedNode;
  }

  place(root, 0, 0);

  return {
    nodes,
    edges,
    positions,
    width: contentWidth + paddingX * 2,
    height: paddingY * 2 + nodeHeight + maximumDepth * (nodeHeight + levelSpacing),
  };
}

function getEdgePath(edge, nodeWidth, nodeHeight) {
  const startX = edge.parent.x + nodeWidth / 2;
  const startY = edge.parent.y + nodeHeight;
  const endX = edge.child.x + nodeWidth / 2;
  const endY = edge.child.y;
  const middleY = startY + (endY - startY) / 2;

  return `M ${startX} ${startY} V ${middleY} H ${endX} V ${endY}`;
}

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function truncateLabel(value, maximumLength) {
  const label = String(value ?? '');

  if (label.length <= maximumLength) {
    return label;
  }

  return `${label.slice(0, Math.max(0, maximumLength - 1))}…`;
}

function createSvg(layout, options) {
  const { nodeWidth, nodeHeight, ariaLabel } = options;
  const edgeMarkup = layout.edges
    .map((edge) => `<path d="${getEdgePath(edge, nodeWidth, nodeHeight)}" fill="none" stroke="#cbd2da" stroke-width="1.4"/>`)
    .join('');
  const nodeMarkup = layout.nodes
    .map((node) => {
      const centerX = node.x + nodeWidth / 2;
      const avatarCenterY = node.y + 36;
      const toggleCenterY = node.y + nodeHeight;
      const toggleVerticalLine = node.isCollapsed
        ? ` M ${centerX} ${toggleCenterY - 3} V ${toggleCenterY + 3}`
        : '';
      const toggleMarkup = node.hasChildren
        ? `
          <circle cx="${centerX}" cy="${toggleCenterY}" r="8" fill="#ffffff" stroke="#cbd2da" stroke-width="1"/>
          <path d="M ${centerX - 3} ${toggleCenterY} H ${centerX + 3}${toggleVerticalLine}" fill="none" stroke="#6c737f" stroke-width="1.4" stroke-linecap="round"/>
        `
        : '';

      return `
        <g>
          <rect x="${node.x}" y="${node.y}" width="${nodeWidth}" height="${nodeHeight}" rx="8" fill="${escapeXml(node.color)}" stroke="#d0d5dc" stroke-width="1"/>
          <circle cx="${centerX}" cy="${avatarCenterY}" r="24" fill="#ffffff" stroke="#d0d5dc" stroke-width="1"/>
          <text x="${centerX}" y="${avatarCenterY + 7}" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" font-weight="500" letter-spacing="-0.4" fill="#000000">${escapeXml(node.initials)}</text>
          <text x="${centerX}" y="${node.y + 84}" text-anchor="middle" font-family="Inter, sans-serif" font-size="16" font-weight="600" letter-spacing="-0.64" fill="#000b13">${escapeXml(truncateLabel(node.name, 22))}</text>
          <text x="${centerX}" y="${node.y + 105}" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" font-weight="500" letter-spacing="-0.24" fill="#6c737f">${escapeXml(truncateLabel(node.role, 29))}</text>
          ${toggleMarkup}
        </g>
      `;
    })
    .join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}" role="img" aria-label="${escapeXml(ariaLabel)}">
      <rect width="100%" height="100%" fill="#ffffff"/>
      ${edgeMarkup}
      ${nodeMarkup}
    </svg>
  `;
}

const SmplfyOrganogram = forwardRef(function SmplfyOrganogram({
  data,
  className = '',
  ariaLabel = 'Company organogram',
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodeHeight = DEFAULT_NODE_HEIGHT,
  siblingSpacing = DEFAULT_SIBLING_SPACING,
  levelSpacing = DEFAULT_LEVEL_SPACING,
  paddingX = DEFAULT_PADDING_X,
  paddingY = DEFAULT_PADDING_Y,
  rootColor = DEFAULT_ROOT_COLOR,
  branchColors = DEFAULT_BRANCH_COLORS,
}, ref) {
  const viewportRef = useRef(null);
  const layoutRef = useRef(null);
  const panSessionRef = useRef(null);
  const animationTimerRef = useRef(0);
  const hasFittedRef = useRef(false);
  const [collapsedIds, setCollapsedIds] = useState(() => new Set());
  const [viewportTransform, setViewportTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isTransformAnimating, setIsTransformAnimating] = useState(false);
  const normalizedTree = useMemo(
    () => normalizeNode(data, 'smplfy-organogram-node-0', 0, rootColor, rootColor, branchColors),
    [branchColors, data, rootColor],
  );
  const layout = useMemo(
    () => calculateLayout(normalizedTree, collapsedIds, {
      nodeWidth,
      nodeHeight,
      siblingSpacing,
      levelSpacing,
      paddingX,
      paddingY,
    }),
    [collapsedIds, levelSpacing, nodeHeight, nodeWidth, normalizedTree, paddingX, paddingY, siblingSpacing],
  );

  layoutRef.current = layout;

  const enableTransformAnimation = useCallback(() => {
    window.clearTimeout(animationTimerRef.current);
    setIsTransformAnimating(true);
    animationTimerRef.current = window.setTimeout(() => setIsTransformAnimating(false), 300);
  }, []);

  const fitScreen = useCallback(({ animate = true } = {}) => {
    const viewport = viewportRef.current;
    const currentLayout = layoutRef.current;

    if (!viewport || !currentLayout || !viewport.clientWidth || !viewport.clientHeight) {
      return;
    }

    const viewportInset = 32;
    const availableWidth = Math.max(1, viewport.clientWidth - viewportInset * 2);
    const availableHeight = Math.max(1, viewport.clientHeight - viewportInset * 2);
    const scale = clamp(
      Math.min(availableWidth / currentLayout.width, availableHeight / currentLayout.height),
      MIN_SCALE,
      1,
    );
    const x = (viewport.clientWidth - currentLayout.width * scale) / 2;
    const y = (viewport.clientHeight - currentLayout.height * scale) / 2;

    if (animate) {
      enableTransformAnimation();
    } else {
      setIsTransformAnimating(false);
    }

    setViewportTransform({ x, y, scale });
  }, [enableTransformAnimation]);

  const zoomAtPoint = useCallback((nextScaleValue, clientX, clientY) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    const localX = clientX - bounds.left;
    const localY = clientY - bounds.top;

    setIsTransformAnimating(false);
    setViewportTransform((current) => {
      const nextScale = clamp(nextScaleValue, MIN_SCALE, MAX_SCALE);
      const worldX = (localX - current.x) / current.scale;
      const worldY = (localY - current.y) / current.scale;

      return {
        x: localX - worldX * nextScale,
        y: localY - worldY * nextScale,
        scale: nextScale,
      };
    });
  }, []);

  const zoom = useCallback((delta) => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const bounds = viewport.getBoundingClientRect();

    setIsTransformAnimating(false);
    setViewportTransform((current) => {
      const nextScale = clamp(current.scale + delta, MIN_SCALE, MAX_SCALE);
      const localX = bounds.width / 2;
      const localY = bounds.height / 2;
      const worldX = (localX - current.x) / current.scale;
      const worldY = (localY - current.y) / current.scale;

      return {
        x: localX - worldX * nextScale,
        y: localY - worldY * nextScale,
        scale: nextScale,
      };
    });
  }, []);

  const download = useCallback(() => {
    const svg = createSvg(layoutRef.current, { nodeWidth, nodeHeight, ariaLabel });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `organogram-${Date.now()}.svg`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [ariaLabel, nodeHeight, nodeWidth]);

  useImperativeHandle(ref, () => ({
    zoom,
    zoomIn: () => zoom(0.1),
    zoomOut: () => zoom(-0.1),
    fitScreen: () => fitScreen({ animate: true }),
    download,
    exportToSvg: download,
  }), [download, fitScreen, zoom]);

  useLayoutEffect(() => {
    fitScreen({ animate: hasFittedRef.current });
    hasFittedRef.current = true;
  }, [fitScreen, layout.height, layout.width]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(() => fitScreen({ animate: false }));

    observer.observe(viewport);
    return () => observer.disconnect();
  }, [fitScreen]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const handleWheel = (event) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();
      const nextScale = viewportTransform.scale * (1 - clamp(event.deltaY * 0.0025, -0.12, 0.12));
      zoomAtPoint(nextScale, event.clientX, event.clientY);
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [viewportTransform.scale, zoomAtPoint]);

  useEffect(() => () => window.clearTimeout(animationTimerRef.current), []);

  const handlePointerDown = (event) => {
    if (event.button !== 0 || event.target.closest('[data-smplfy-organogram-action]')) {
      return;
    }

    panSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: viewportTransform.x,
      startY: viewportTransform.y,
      dragging: false,
    };
    setIsTransformAnimating(false);
  };

  const handlePointerMove = (event) => {
    const session = panSessionRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - session.startClientX;
    const deltaY = event.clientY - session.startClientY;

    if (!session.dragging && Math.hypot(deltaX, deltaY) < 4) {
      return;
    }

    if (!session.dragging) {
      session.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsPanning(true);
    }

    setViewportTransform((current) => ({
      ...current,
      x: session.startX + deltaX,
      y: session.startY + deltaY,
    }));
  };

  const finishPointerInteraction = (event) => {
    const session = panSessionRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    if (session.dragging && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    panSessionRef.current = null;
    setIsPanning(false);
  };

  const toggleNode = (nodeId) => {
    setCollapsedIds((current) => {
      const next = new Set(current);

      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }

      return next;
    });
  };

  return (
    <div
      ref={viewportRef}
      className={joinClasses(
        'smplfy-organogram',
        isPanning && 'smplfy-organogram-panning',
        className,
      )}
      role="tree"
      aria-label={ariaLabel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPointerInteraction}
      onPointerCancel={finishPointerInteraction}
    >
      <div
        className={joinClasses(
          'smplfy-organogram-canvas',
          isTransformAnimating && 'smplfy-organogram-canvas-animated',
        )}
        style={{
          width: `${layout.width}px`,
          height: `${layout.height}px`,
          transform: `translate3d(${viewportTransform.x}px, ${viewportTransform.y}px, 0) scale(${viewportTransform.scale})`,
          '--smplfy-organogram-node-width': `${nodeWidth}px`,
          '--smplfy-organogram-node-height': `${nodeHeight}px`,
        }}
      >
        <svg
          className="smplfy-organogram-edges"
          width={layout.width}
          height={layout.height}
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          aria-hidden="true"
        >
          {layout.edges.map((edge) => (
            <path
              key={edge.id}
              className="smplfy-organogram-edge"
              d={getEdgePath(edge, nodeWidth, nodeHeight)}
            />
          ))}
        </svg>

        {layout.nodes.map((node) => (
          <div
            key={node.id}
            className="smplfy-organogram-node-shell"
            role="treeitem"
            aria-level={node.depth + 1}
            aria-expanded={node.hasChildren ? !node.isCollapsed : undefined}
            style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
          >
            <div
              className="smplfy-organogram-node"
              style={{ '--smplfy-organogram-node-bg': node.color }}
            >
              <div className="smplfy-organogram-node-avatar">{node.initials}</div>
              <div className="smplfy-organogram-node-content">
                <div className="smplfy-organogram-node-name" title={node.name}>{node.name}</div>
                <div className="smplfy-organogram-node-role" title={node.role}>{node.role}</div>
              </div>
            </div>

            {node.hasChildren ? (
              <button
                type="button"
                className="smplfy-organogram-node-toggle"
                aria-label={`${node.isCollapsed ? 'Expand' : 'Collapse'} ${node.name}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => toggleNode(node.id)}
                data-smplfy-organogram-action
              >
                <AppIcon name={node.isCollapsed ? 'plus' : 'minus'} size={10} stroke={1.8} />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
});

export default SmplfyOrganogram;
