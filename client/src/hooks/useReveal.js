import { useEffect } from 'react';

const useReveal = () => {
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -150px 0px', // Delayed trigger: element must be 150px above the bottom
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);
};

export default useReveal;
