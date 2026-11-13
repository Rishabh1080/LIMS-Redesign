import { useEffect, useRef, useState } from 'react';

function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function DataTable({
  children,
  className = '',
  responsive = true,
  stickyActionColumn = false,
  ...props
}) {
  const responsiveRef = useRef(null);
  const [isScrollAtEnd, setIsScrollAtEnd] = useState(true);

  useEffect(() => {
    if (!responsive || !stickyActionColumn || !responsiveRef.current) {
      return undefined;
    }

    const wrapper = responsiveRef.current;
    const updateScrollState = () => {
      const maxScrollLeft = wrapper.scrollWidth - wrapper.clientWidth;
      setIsScrollAtEnd(maxScrollLeft <= 1 || wrapper.scrollLeft >= maxScrollLeft - 1);
    };

    updateScrollState();
    wrapper.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      wrapper.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [responsive, stickyActionColumn]);

  const table = (
    <table
      className={joinClasses(
        'smplfy-table',
        'table',
        'table-hover',
        'align-middle',
        'mb-0',
        stickyActionColumn && 'smplfy-table-sticky-action',
        className,
      )}
      {...props}
    >
      {children}
    </table>
  );

  if (!responsive) {
    return table;
  }

  return (
    <div
      ref={responsiveRef}
      className={joinClasses(
        'table-responsive',
        stickyActionColumn && 'smplfy-table-responsive-sticky-action',
        stickyActionColumn && isScrollAtEnd && 'is-scroll-at-end',
      )}
    >
      {table}
    </div>
  );
}
