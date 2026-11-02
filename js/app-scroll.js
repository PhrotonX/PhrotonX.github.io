(() => {
    if (!document.querySelector(".mobile-navigation")) {
        const navigation = document.createElement("nav");
        navigation.className = "mobile-navigation";
        navigation.setAttribute("aria-label", "Mobile navigation");
        navigation.innerHTML = `
            <a href="#" class="mobile-back" aria-label="Back"><span class="mif-arrow-left mif-2x"></span></a>
            <a href="../../index.html" class="mobile-home" aria-label="Start screen"><span class="mif-home mif-2x"></span></a>
            <a href="../../search.html" class="mobile-search" aria-label="Search"><span class="mif-search mif-2x"></span></a>`;
        document.body.appendChild(navigation);
        navigation.querySelector(".mobile-back").addEventListener("click", (event) => {
            event.preventDefault();
            window.history.back();
        });
    }

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
