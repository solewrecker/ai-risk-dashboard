function toggleCategory(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector('.assessment-category__toggle');
    const isActive = content.classList.contains('assessment-category__content--active');
    if (isActive) {
        content.classList.remove('assessment-category__content--active');
        toggle.classList.remove('assessment-category__toggle--active');
        header.classList.remove('assessment-category__header--active');
    } else {
        content.classList.add('assessment-category__content--active');
        toggle.classList.add('assessment-category__toggle--active');
        header.classList.add('assessment-category__header--active');
    }
}
// Initialize with first category expanded
document.addEventListener('DOMContentLoaded', function() {
    const firstCategory = document.querySelector('.assessment-category__header');
    if (firstCategory) toggleCategory(firstCategory);
});

//# sourceMappingURL=template-base.69dc19f3.js.map
