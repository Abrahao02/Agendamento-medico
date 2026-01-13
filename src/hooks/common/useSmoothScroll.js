import { useCallback } from "react";

export default function useSmoothScroll(options = {}) {
  const {
    offset = 0,
    behavior = "smooth",
    closeMenu,
  } = options;

  const scrollTo = useCallback((id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const elementTop = element.getBoundingClientRect().top;
    const offsetPosition =
      elementTop + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior,
    });

    if (closeMenu) closeMenu(false);
  }, [offset, behavior, closeMenu]);

  return { scrollTo };
}
