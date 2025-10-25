<!-- src/EventCard.vue -->
<template>
  <div class="event-card">
    <h2>{{ event.title }}</h2>
    <p>{{ event.description }}</p>
    <small>{{ event.location.city }}</small>
  </div>
</template>

<script setup>
import { ref } from "vue";

const event = ref(window.openai?.toolOutput?.event || {});
</script>
