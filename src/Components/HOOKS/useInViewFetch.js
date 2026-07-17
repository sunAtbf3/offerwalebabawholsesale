import { useEffect, useRef } from 'react';

/**
 * useInViewFetch
 * ──────────────
 * Attaches an IntersectionObserver to the returned `ref`.
 * Fires `onVisible` exactly ONCE when the element enters the (expanded) viewport.
 * After firing, the observer disconnects — zero ongoing overhead.
 *
 * React 18 Strict Mode mounts, unmounts, and remounts components in development.
 * A module-level WeakSet keyed by the DOM element prevents the same physical
 * sentinel from firing twice across that cycle.
 *
 * @param {() => void} onVisible   Callback to run when element is visible
 * @param {object}     options
 * @param {string}     options.rootMargin   How far before viewport to trigger (default '1500px')
 * @param {number}     options.threshold    0–1 intersection ratio needed (default 0)
 * @param {boolean}    options.disabled     If true, observer never attaches (e.g. data already loaded)
 *
 * @returns {{ ref: React.RefObject }}  Attach `ref` to your sentinel element
 *
 * Usage:
 *   const { ref } = useInViewFetch(() => dispatch(fetchSomething()), { disabled: alreadyLoaded });
 *   <div ref={ref} />
 */
const firedElements = new WeakSet();

const useInViewFetch = (onVisible, { rootMargin = '1500px', threshold = 0, disabled = false } = {}) => {
  const ref = useRef(null);

  // Keep the latest callback without recreating the observer.
  const callbackRef = useRef(onVisible);
  callbackRef.current = onVisible;

  useEffect(() => {
    if (disabled) return;

    const el = ref.current;
    if (!el || firedElements.has(el)) return;

    if (typeof IntersectionObserver === 'undefined') {
      firedElements.add(el);
      callbackRef.current();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedElements.has(el)) {
          firedElements.add(el);
          callbackRef.current();
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };

    // rootMargin and threshold are static configuration values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  return { ref };
};

export default useInViewFetch;