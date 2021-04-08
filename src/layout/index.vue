<template>
  <div>
    <router-view />

    <!-- <Layout>
      <Header class="layout-header-bar">Header</Header>
      <Layout>
        <Sider hide-trigger class="layout-sider">
          <Menu width="auto" accordion>
            <MenuItem name="home">
              <Icon type="ios-home" />
              <span>首页</span>
            </MenuItem>
            <MenuItem name="home">
              <Icon type="ios-home" />
              <span>首页</span>
            </MenuItem>
          </Menu>
        </Sider>
        <Content><router-view /></Content>
      </Layout>
      <Footer>Footer</Footer>
    </Layout> -->

    <!-- <div>------layout</div>
    <div>{{ fullWidth }}</div> -->
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

<style scoped>
.layout {
  border: 1px solid #d7dde4;
  background: #f5f7f9;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  min-width: 1200px;
}

.layout-sider {
  height: 82vh;
  background: #fff;
  background: #2d8cf0;
}

.layout-header-bar {
  height: 10vh;
  background: #fff;
  color: #fff;
  background: #2d8cf0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.menu-item span {
  display: inline-block;
  overflow: hidden;
  width: 69px;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  transition: width 0.2s ease 0.2s;
}
</style>
