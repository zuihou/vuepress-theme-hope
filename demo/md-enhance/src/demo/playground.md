---
title: Playground
---

## Demo

### TS

::: playground#ts TS demo 1

@file input.ts

```ts
const msg = "hello world";

const speak = (msg: string) => console.log(msg);

speak(msg);
```

:::

::: playground#ts TS demo 2

@file input.ts

```ts
import { msg } from "./msg.ts";

const speak = (msg: string) => console.log(msg);

speak(msg);
```

@file msg.ts

```ts
export const msg = "hello world";
```

@settings

```json
{
  "target": "es5"
}
```

:::

### Vue

::: playground#vue Vue demo with cutomized imports

@file App.vue

```vue
<script setup>
import { ref } from "vue";

import Comp from "./Comp.vue";

const msg = ref("Hello World!");
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />
  <Comp />
</template>
```

@file Comp.vue

```vue
<template>
  <div>Comp</div>
</template>
```

@import

```json
{
  "imports": {
    "vue": "https://sfc.vuejs.org/vue.runtime.esm-browser.js"
  }
}
```

:::

::: playground#vue Vue demo with customized settings

@file App.vue

```vue
<script setup>
import { ref } from "vue";

const msg = ref("Hello Playground!");
</script>

<template>
  <h1>{{ msg }}</h1>
  <input v-model="msg" />
</template>
```

@setting

```json
{
  "dev": true,
  "ssr": true
}
```

:::
