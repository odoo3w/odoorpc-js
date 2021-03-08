<template>
  <div>
    <div>layout</div>
    <div>{{ fullWidth }}</div>

    <router-view />
  </div>
</template>

<script>
export default {
  name: 'Space',
  components: {},
  mixins: [],
  data() {
    return {
      fullWidth: document.documentElement.clientWidth
    }
  },

  computed: {},

  created() {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy: function() {
    window.removeEventListener('resize', this.handleResize)
  },

  methods: {
    handleResize() {
      this.fullWidth = document.documentElement.clientWidth
    }
  }
}
</script>

<style></style>
