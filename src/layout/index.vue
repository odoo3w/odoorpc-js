<template>
  <div class="o_action_manager">
    <Layout>
      <Header class="layout-header-bar">Header</Header>
      <Layout>
        <Sider hide-trigger class="layout-sider">
          <Menu width="auto" accordion @on-select="selectMenu">
            <MenuItem name="home">
              <Icon type="ios-home" />
              <span>首页</span>
            </MenuItem>

            <MenuItem name="action_orders">
              <span>销售订单</span>
            </MenuItem>

            <Submenu
              v-for="submenu in menus"
              :key="submenu.name"
              :name="submenu.name"
            >
              <template slot="title">
                <Icon :type="submenu.icon" /> <span> {{ submenu.title }} </span>
              </template>
              <MenuItem
                v-for="item in submenu.items"
                :key="item.name"
                :name="item.name"
                >{{ item.title }}</MenuItem
              >
            </Submenu>
          </Menu>
        </Sider>
        <Content class="o_action o_view_ccontroller">
          <router-view class="o_content" />
        </Content>
      </Layout>
      <Footer>Footer</Footer>
    </Layout>

    <!-- <div>------layout</div>
    <div>{{ fullWidth }}</div> -->
  </div>
</template>

<script>
const WEB_PATH = '/web'

const HOME_PATH = '/'

export default {
  name: 'Base',
  components: {},
  mixins: [],
  data() {
    return {
      currentMenu: '',
      fullWidth: document.documentElement.clientWidth
    }
  },

  computed: {
    actions() {
      const actions_test = {
        saleOrder: {
          action_ref: 'sale.action_quotations_with_onboarding'
        },
        resPartner: {
          action_ref: 'contacts.action_contacts'
        }
      }

      return { ...actions_test }
    },

    menus() {
      const subMenus = [
        { name: 'sale', title: '销售', icon: 'ios-pricetags' }
        // { name: 'purchase', title: '采购', icon: 'md-cart' }
        // { name: 'stock', title: '库存', icon: 'ios-cube' }
        // { name: 'accountCash', title: '出纳', icon: 'ios-cash' },
        // { name: 'accountBase', title: '财务处理', icon: 'ios-settings' },
        // { name: 'accountAccounting', title: '财务查询', icon: 'md-card' },
        // { name: 'accountReport', title: '财务报表', icon: 'ios-stats' }
        // { name: 'hr', title: 'HR', icon: 'ios-contacts' },
        // { name: 'hrExpense', title: '费用报销', icon: 'ios-briefcase' }
      ]

      const menuItems = {
        sale: [
          { name: 'saleOrder', title: '销售订单' },
          { name: 'resPartner', title: '客户' },
          { name: 'productTemplate', title: '产品' }
          // { name: 'sale-team', title: '销售团队' },
        ]

        //   purchase: [
        //     { name: 'purchaseOrder', title: '采购订单' },
        //     { name: 'resPartnerCompany', title: '供应商' },
        //     { name: 'productTemplate', title: '产品' }
        //   ],

        //   stock: [
        //     { name: 'stockPicking', title: '入库单' },
        //     { name: 'productTemplate', title: '产品' }
        //   ],
        //   accountCash: [
        //     { name: 'accountPaymentCustomerIn', title: '收款' },
        //     { name: 'accountPaymentSupplierOut', title: '付款' },
        //     { name: 'accountPaymentTransfer', title: '内部转账' }
        //   ],

        //   accountBase: [
        //     { name: 'accountMoveInvoiceOut', title: '销售账单' },
        //     { name: 'accountMoveInvoiceIn', title: '采购账单' },
        //     { name: 'accountMoveEntry', title: '凭证录入' },
        //     { name: 'accountMoveOpening', title: '期初设置' }
        //     // { name: 'accountAnalyticAccount', title: '核算项目' },
        //     // { name: 'accountJournal', title: '凭证类型' }
        //   ],
        //   accountAccounting: [
        //     { name: 'accountMove', title: '凭证' },
        //     { name: 'accountMoveLinePosted', title: '分录' },
        //     { name: 'accountAccount', title: '科目' }
        //   ],

        //   accountReport: [
        //     { name: 'accountBalanceReport', title: '试算平衡' },
        //     { name: 'accountReportGeneralLedger', title: '总账' },
        //     { name: 'accountReportPartnerLedger', title: '应收应付' },
        //     // { name: 'accountReportPartnerLedgerCustomer', title: '应收账' },
        //     // { name: 'accountReportPartnerLedgerSupplier', title: '应付账' },
        //     { name: 'accountingReportBalancesheet', title: '余额表' },
        //     { name: 'accountingReportProfitandloss', title: '损益表' }
        //   ],
        //   hr: [
        //     { name: 'hrEmployee', title: '员工' },
        //     { name: 'hrDepartment', title: '部门' },
        //     { name: 'hrJob', title: '职位' }
        //   ],

        //   hrExpense: [
        //     { name: 'hrExpense', title: '费用明细' },
        //     { name: 'hrExpenseSheet', title: '费用报表' },
        //     { name: 'productProductExpense', title: '费用项目' }
        //   ]
      }

      const menus = subMenus.map(sub => {
        return { ...sub, items: menuItems[sub.name] }
      })

      // console.log('menus', menus)

      return menus
    }
  },

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

    selectMenu(name) {
      console.log('selectMenu.  , ', this.currentMenu, name)
      // const path = `/test/list`
      const query = this.$route.query
      const view_type = query.view_type

      if (
        this.currentMenu === name &&
        (view_type === 'tree' || view_type === 'kanban')
      ) {
        return
      }

      this.currentMenu = name

      if (name === 'home') {
        this.$router.push({ path: HOME_PATH })
      } else {
        const action = this.actions[name]

        // const action = {
        //   model: 'sale.order',
        //   tree_view_ref: 'sale.view_order_tree',
        //   form_view_ref: 'sale.view_order_form'
        // }

        this.$router.push({
          path: WEB_PATH,
          query: { ...action, view_type: 'tree' }
        })
      }

      // if (this.screenIsSmall) {
      //   this.isCollapsed = true
      // }
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
