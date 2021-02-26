<template>
  <div class="layout">
    <Drawer title="菜单" :closable="false" v-model="showMenu">
      <List header="" footer="" size="large">
        <ListItem
          v-for="item in menuItems"
          :key="item.name"
          @click.native="onSelectMenu(item.name)"
        >
          <a> {{ item.text }} </a>
        </ListItem>
      </List>
    </Drawer>

    <Layout>
      <Header class="layout-header">
        <div v-if="fullWidth <= 768">
          <a class="layout-logo" @click="onSelectMenu('home')">
            <img src="/logo.png" alt="" width="100%" height="100%" />
          </a>

          <a>
            <Icon
              class="layout-menu-icon"
              type="md-menu"
              @click.native="showMenu = true"
            />
          </a>
        </div>
        <div v-else>
          <Menu
            mode="horizontal"
            theme="primary"
            active-name="home"
            @on-select="onSelectMenu"
          >
            <a class="layout-logo" @click="onSelectMenu('home')">
              <img src="/logo.png" alt="" width="100%" height="100%" />
            </a>

            <div class="layout-nav">
              <MenuItem
                v-for="item in menuItems"
                :key="item.name"
                :name="item.name"
              >
                <Icon :type="item.icon"></Icon>
                <span class="layout-nav-text">{{ item.text }} </span>
              </MenuItem>
            </div>
          </Menu>
        </div>
      </Header>

      <Content
        :style="{
          margin: '88px 20px 0',
          background: '#fff',
          minHeight: '500px'
        }"
      >
        {{ fullWidth }}

        <router-view />
      </Content>
      <Footer class="layout-footer-center">2015-2020 &copy; OdooRpc-JS</Footer>
    </Layout>
  </div>
</template>

<script>
export default {
  name: 'Layout2',
  components: {},
  mixins: [],
  data() {
    return {
      fullWidth: document.documentElement.clientWidth,
      showMenu: false,

      menuItems: [
        // { name: 'home', icon: 'ios-home-outline', text: '首页' },
        { name: 'product', icon: 'ios-analytics-outline', text: '产品' },
        { name: 'solution', icon: 'ios-document-outline', text: '解决方案' },
        { name: 'download', icon: 'ios-cloud-download-outline', text: '下载' },
        { name: 'document', icon: 'ios-book-outline', text: '文档' },
        { name: 'contact', icon: 'ios-mail-outline', text: '联系我们' }
      ]
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
    },
    onSelectMenu(name) {
      const path = `/${name}`
      this.$router.push(path)
    }
  }
}
</script>
<style scoped>
.layout {
  border: 1px solid #2d8cf0;
  background: #2d8cf0;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.layout-header {
  background: #2d8cf0;
  border: none;
  position: fixed;
  width: 100%;
}

.layout-logo {
  width: 100px;
  height: 30px;
  /* background: #5b6270; */
  border-radius: 3px;
  float: left;
  position: relative;
  top: 15px;
  left: 0px;
}

.layout-menu-icon {
  /* :style="{ margin: '0 20px' }"
            size="24" */

  width: 100px;
  height: 30px;
  /* background: #5b6270; */
  border-radius: 3px;
  float: right;
  position: relative;
  top: 15px;
  font-size: 30px;
  color: #fff;
  /* left: 0px; */
}
.layout-nav {
  /* width: 520px; */
  margin: 0 auto;
  float: none;
  /* margin-left: 20px;
  margin-right: 20px; */
}

.layout-nav-text {
  font-size: 16px;
}

.layout-footer-center {
  text-align: center;
}
</style>
