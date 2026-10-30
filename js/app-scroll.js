(() => {
    const horizontalScroller = (element) =>
        element instanceof HTMLElement &&
        element.scrollWidth > element.clientWidth &&
        getComputedStyle(element).overflowX !== "visible";

    document.addEventListener("wheel", (event) => {
        if (event.ctrlKey || event.deltaY === 0) {
            return;
        }

        const target = event.target instanceof Element
            ? event.target.closest("main, [id='gallery-carousel']")
            : null;
        const main = document.querySelector("main");
        const scroller = target && horizontalScroller(target)
            ? target
            : (main && horizontalScroller(main) ? main : null);

        if (!scroller) {
            return;
        }

        event.preventDefault();
        scroller.scrollBy({
            left: event.deltaY,
            behavior: "auto"
        });
    }, { passive: false });
})();
