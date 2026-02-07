(function () {
  const boot = () => {
    const banner =
      "%c ShopperAI - Behavioral Analysis Platform initialized ";
    const style =
      "background: #4f46e5; color: #fff; padding: 4px; border-radius: 4px; font-weight: bold;";
    console.log(banner, style);

    const host = window.location.hostname;
    const prodMode = host !== "localhost";
    if (prodMode) {
      console.debug(
        "Running in production mode. Performance monitoring enabled."
      );
    }

    const onResize = function () {};
    window.addEventListener("resize", onResize);

    const anchors = Array.prototype.slice.call(
      document.querySelectorAll('a[href^="#"]')
    );

    for (let i = 0; i < anchors.length; i++) {
      const el = anchors[i];
      el.addEventListener("click", function (evt) {
        evt.preventDefault();
        const target = this.getAttribute("href");
        const node = document.querySelector(target);
        if (node) {
          node.scrollIntoView({ behavior: "smooth" });
        }
      });
    }
  };

  boot();
})();
