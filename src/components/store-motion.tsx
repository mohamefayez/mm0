"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Progressive enhancement: all content remains visible without JavaScript. */
export function StoreMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (/\/(checkout|cart|admin)(\/|$)/.test(pathname)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose = () => {};
    const start = () => {
      dispose();
      if (preference.matches) return;
      const scene = document.querySelector<HTMLElement>(".signature-scene");
      const animations: Animation[] = [];
      scene?.querySelectorAll<HTMLElement>(".hero-intro, h1, .hero-copy > p, .hero-actions, .signature-art").forEach((element, index) => {
        animations.push(element.animate([
          { opacity: 0, translate: "0 48px" },
          { opacity: 1, translate: "0 0" },
        ], { duration: 1100, delay: index * 110, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }));
      });
      const visibility = new IntersectionObserver(([entry]) => {
        scene?.classList.toggle("scene-active", entry.isIntersecting);
      });
      if (scene) visibility.observe(scene);
      const elements = new Map<HTMLElement, number>();
      const register = () => {
        document.querySelectorAll<HTMLElement>(
          ".editorial-art, .quiz-banner, .category-card, .section-heading, .product-card, .note-card",
        ).forEach((element) => {
          if (!elements.has(element)) {
            elements.set(element, 0);
            element.classList.add("scroll-reveal");
          }
        });
        for (const element of elements.keys()) {
          if (!element.isConnected) elements.delete(element);
        }
      };
      register();
      let frame = 0;
      const sceneTop = scene ? scene.getBoundingClientRect().top + window.scrollY : 0;
      const paint = () => {
        frame = 0;
        if (scene) {
          const rect = scene.getBoundingClientRect();
          const progress = Math.min(1, Math.max(0, (sceneTop - rect.top) / rect.height));
          scene.style.setProperty("--scene-shift", `${progress * 160}px`);
          scene.style.setProperty("--scene-turn", `${progress * 55}deg`);
        }
        // Subtract our previous translation so motion never feeds back into measurement.
        // Read positions together before writing styles to avoid repeated layout work.
        const positions = Array.from(elements, ([element, shift]) => ({
          element, top: element.getBoundingClientRect().top - shift,
        }));
        for (const { element, top } of positions) {
          const progress = element.contains(document.activeElement) ? 1 :
            Math.min(1, Math.max(0, (window.innerHeight * .96 - top) / (window.innerHeight * .42)));
          const shift = (1 - progress) * 80;
          element.style.setProperty("--reveal-y", `${shift}px`);
          element.style.setProperty("--reveal-opacity", `${.15 + progress * .85}`);
          elements.set(element, shift);
        }
      };
      const scroll = () => { if (!frame) frame = requestAnimationFrame(paint); };
      const focus = (event: FocusEvent) => {
        if (event.target instanceof Element) {
          scroll();
        }
      };
      paint();
      window.addEventListener("scroll", scroll, { passive: true });
      window.addEventListener("resize", scroll);
      document.addEventListener("focusin", focus);
      // Register products added after streaming, filtering, or recently-viewed hydration.
      const mutations = new MutationObserver(() => { register(); scroll(); });
      const main = document.getElementById("main");
      if (main) mutations.observe(main, { childList: true, subtree: true });
      dispose = () => {
        mutations.disconnect();
        visibility.disconnect();
        animations.forEach((animation) => animation.cancel());
        scene?.classList.remove("scene-active");
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", scroll);
        window.removeEventListener("resize", scroll);
        document.removeEventListener("focusin", focus);
        elements.forEach((_, element) => {
          element.classList.remove("scroll-reveal");
          element.style.removeProperty("--reveal-y");
          element.style.removeProperty("--reveal-opacity");
        });
        scene?.style.removeProperty("--scene-shift");
        scene?.style.removeProperty("--scene-turn");
      };
    };
    start();
    preference.addEventListener("change", start);
    return () => { dispose(); preference.removeEventListener("change", start); };
  }, [pathname]);

  return null;
}
