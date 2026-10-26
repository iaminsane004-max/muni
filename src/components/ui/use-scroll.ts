import { useState, useEffect } from "react";

export function useScroll(threshold: number = 10): boolean {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = 
        window.scrollY ?? 
        window.pageYOffset ?? 
        document.documentElement.scrollTop ?? 
        document.body.scrollTop ?? 
        0;
      setScrolled(scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return scrolled;
}
