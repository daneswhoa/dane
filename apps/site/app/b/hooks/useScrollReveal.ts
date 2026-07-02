import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          entry.target.querySelectorAll('.reveal-up, .reveal-scale, .reveal-fade, .node-wrapper, .svg-container, .timeline-container, .reveal-line')
            .forEach((child) => child.classList.add('active'));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-trigger, .reveal-up:not(.scroll-trigger .reveal-up), .reveal-scale:not(.scroll-trigger .reveal-scale)')
      .forEach((el) => observer.observe(el));

    const handleScroll = () => {
      const scrolled = window.scrollY;
      document.querySelectorAll<HTMLElement>('.parallax-bg').forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-speed') || '0.2');
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}
