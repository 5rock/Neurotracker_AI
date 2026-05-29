import { useEffect, useRef, useState } from 'react';

/**
 * Mounts children only when near the viewport — defers heavy chart/AI work off the critical path.
 */
const DeferredMount = ({ children, fallback = null, minHeight = 220, rootMargin = '120px' }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    if (visible) return undefined;

    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} style={{ minHeight }}>
      {visible ? children : fallback}
    </div>
  );
};

export default DeferredMount;
