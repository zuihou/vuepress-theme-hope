import Reveal from "reveal.js/dist/reveal.esm.js";

export const revealMermaid = async (): Promise<
  typeof import("reveal.js/dist/reveal.esm.js")
> => {
  const { default: mermaid } = await import(
    /* webpackChunkName: "mermaid" */ "@mermaid"
  );

  return (() => ({
    id: "mermaid",

    init: (reveal: Reveal): Promise<void[]> => {
      mermaid.initialize({
        // The node size will be calculated incorrectly if set `startOnLoad: start`,
        // so we need to manually render.
        startOnLoad: false,
        ...(reveal.getConfig()["mermaid"] ?? {}),
      });

      const mermaidElements = reveal
        .getRevealElement()
        .querySelectorAll(".mermaid");

      return Promise.all(
        Array.from(mermaidElements).map(async (element) => {
          const mermaidCode = element.textContent?.trim() || "";

          try {
            const { svg } = await mermaid.render(
              `mermaid-${Math.random().toString(36).substring(2)}`,
              mermaidCode
            );

            element.innerHTML = svg;
          } catch (err) {
            element.innerHTML = (<Error>err).message;
          }
        })
      );
    },
  })) as unknown as typeof import("reveal.js/dist/reveal.esm.js");
};
