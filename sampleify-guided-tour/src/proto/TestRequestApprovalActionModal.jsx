// Wraps the prototype's TestRequestApprovalActionModal (aliased in vite.config.js)
// so the tutorial hears about an approval. Rendering is the prototype's.
import Original from '@proto/components/TestRequestApprovalActionModal.jsx';

export default function TestRequestApprovalActionModal(props) {
  return (
    <Original
      {...props}
      onSubmit={(...args) => {
        window.dispatchEvent(new CustomEvent('sgt:tr-reviewed', { detail: args[0] ?? null }));
        props.onSubmit?.(...args);
      }}
    />
  );
}
