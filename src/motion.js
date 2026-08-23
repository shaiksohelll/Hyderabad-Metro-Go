const reduceMedia = window.matchMedia("(prefers-reduced-motion: reduce)");

export const shouldReduceMotion = () =>
  reduceMedia.matches || document.documentElement.classList.contains("reduce-motion");

const fallbackAnimate = (element, keyframes, options) => {
  if (!element?.animate || shouldReduceMotion()) return;
  element.animate(keyframes, { fill: "both", easing: "cubic-bezier(.22,1,.36,1)", ...options });
};

export const runIntroMotion = () => {
  const mapCard = document.querySelector(".map-card");
  const planner = document.querySelector(".planner-card");
  const lines = document.querySelectorAll(".network-line");

  if (shouldReduceMotion()) return;
  if (window.gsap) {
    const timeline = window.gsap.timeline({ defaults: { ease: "power3.out" } });
    timeline
      .from(mapCard, { opacity: 0, y: 20, duration: 0.7 })
      .from(planner, { opacity: 0, y: 24, duration: 0.65 }, "-=0.48")
      .from(lines, { opacity: 0, strokeDasharray: 1000, strokeDashoffset: 1000, duration: 1.1, stagger: 0.08 }, "-=0.5");
    return;
  }

  fallbackAnimate(mapCard, [{ opacity: 0, transform: "translateY(20px)" }, { opacity: 1, transform: "none" }], { duration: 700 });
  fallbackAnimate(planner, [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], { duration: 720, delay: 120 });
};

export const animateRoutePath = (path) => {
  if (!path || shouldReduceMotion()) return;
  const length = path.getTotalLength?.() || 1200;
  path.style.strokeDasharray = `${length}`;
  path.style.strokeDashoffset = `${length}`;

  if (window.gsap) {
    window.gsap.to(path, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" });
  } else {
    fallbackAnimate(path, [{ strokeDashoffset: length }, { strokeDashoffset: 0 }], { duration: 1100 });
  }
};

export const animateResult = (result) => {
  if (!result || shouldReduceMotion()) return;
  if (window.gsap) {
    window.gsap.fromTo(result, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" });
  } else {
    fallbackAnimate(result, [{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 450 });
  }
};

export const pulseStation = (element) => {
  if (!element || shouldReduceMotion()) return;
  if (window.gsap) {
    window.gsap.fromTo(element, { scale: 1 }, { scale: 1.7, transformOrigin: "center", duration: 0.22, yoyo: true, repeat: 1 });
  }
};
