function joinClasses(...values) {
  return values.filter(Boolean).join(' ');
}

export default function DataTable({
  children,
  className = '',
  responsive = true,
  ...props
}) {
  const table = (
    <table
      className={joinClasses('smplfy-table', 'table', 'table-hover', 'align-middle', 'mb-0', className)}
      {...props}
    >
      {children}
    </table>
  );

  if (!responsive) {
    return table;
  }

  return <div className="table-responsive">{table}</div>;
}
