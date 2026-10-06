const pageSections = document.querySelectorAll('main section[id]');
const pageLinks = document.querySelectorAll('.site-nav a');

if ('IntersectionObserver' in window && pageSections.length && pageLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      pageLinks.forEach((link) => {
        link.classList.toggle('is-current', link.hash === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-25% 0px -60% 0px' });

  pageSections.forEach((section) => sectionObserver.observe(section));
}
