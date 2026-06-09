export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/record/index',
    'pages/ledger/index',
    'pages/budget/index',
    'pages/report/index',
    'pages/bill-detail/index',
    'pages/category-manage/index',
    'pages/account-manage/index',
    'pages/template-manage/index',
    'pages/share-ledger/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#10B981',
    navigationBarTitleText: '智慧记账',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F8FAFC'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#10B981',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/record/index',
        text: '记一笔'
      },
      {
        pagePath: 'pages/ledger/index',
        text: '明细'
      },
      {
        pagePath: 'pages/budget/index',
        text: '预算'
      },
      {
        pagePath: 'pages/report/index',
        text: '报表'
      }
    ]
  }
})
