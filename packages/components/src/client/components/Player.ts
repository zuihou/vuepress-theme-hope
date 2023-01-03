import { defineComponent, h, onMounted, ref } from "vue";

import type { PropType, VNode } from "vue";

import "../styles/player.scss";

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Player",

  props: {
    /**
     * Type of player
     */
    type: {
      type: String as PropType<"video" | "audio" | "hls">,
      default: "video",
    },
  },

  setup(props, { attrs, slots }) {
    const loaded = ref(false);

    onMounted(() => {
      void Promise.all([
        import("@vidstack/player/define/vds-media.js"),
        props.type === "audio"
          ? import("@vidstack/player/define/vds-audio.js")
          : props.type === "hls"
          ? import("@vidstack/player/define/vds-hls.js")
          : import("@vidstack/player/define/vds-video.js"),
      ]).then(() => {
        loaded.value = true;
      });
    });

    return (): VNode =>
      loaded.value
        ? h(
            props.type,
            {
              ...attrs,
              class: ["player", attrs["class"] || ""],
            },
            slots["default"]?.()
          )
        : h("div", { class: "player-loading" }, "Loading...");
  },
});
