// Glossary tooltips: tap to toggle, Escape to dismiss (WCAG 1.4.13).
const terms = document.querySelectorAll(".term");

// Shift the tooltip left if it would run past the right edge of the screen
const place = (term) => requestAnimationFrame(() => {
    const tip = term.querySelector(".term-tip");
    tip.style.translate = "";
    const { left, right } = tip.getBoundingClientRect();
    const overflow = right - (document.documentElement.clientWidth - 16);
    if (overflow > 0) tip.style.translate = `${-Math.min(overflow, left - 16)}px 0`;
});

const close = (term) => {
    term.removeAttribute("data-open");
    term.setAttribute("data-dismissed", "");
};

for (const term of terms) {
    const trigger = term.querySelector(".term-trigger");
    trigger.addEventListener("click", () => {
        const open = term.hasAttribute("data-open");
        terms.forEach(close);
        if (!open) {
            term.removeAttribute("data-dismissed");
            term.setAttribute("data-open", "");
            place(term);
        }
    });
    // Hovering or focusing again re-enables a dismissed tooltip
    term.addEventListener("pointerenter", () => {
        term.removeAttribute("data-dismissed");
        place(term);
    });
    trigger.addEventListener("focus", () => {
        term.removeAttribute("data-dismissed");
        place(term);
    });
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") terms.forEach(close);
});

document.addEventListener("click", (event) => {
    if (!event.target.closest(".term")) terms.forEach((term) => term.removeAttribute("data-open"));
});
