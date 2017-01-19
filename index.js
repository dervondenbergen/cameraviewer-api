const serverRouter = require('server-router')
const http = require('http')

const { brands } = require('./data')

const info = `
/ => information
/brands => list of brands
/brands/:name => list of product types of brand
/brands/:name/:product => list of products of product type of brand
`

let j = (json) =>  {
  return JSON.stringify(json)
}

let b = () => {
  return {
    brands: Object.keys(brands),
    type: 'brands',
  }
}

let bN = (n) => {
  let name = brands[ n ].name
  let pro = brands[ n ].products
  let productTypes = []
  Object.keys(pro).forEach(p => {
    productTypes.push({
      name: p,
      count: pro[p].length,
    })
  })
  let type = 'name'
  return { name, productTypes, type }
}

let bP = (name, product) => {
  let pro = brands[ name ].products[ product ]
  return {
    products: pro,
    length: pro.length,
    type: 'product',
  }
}

const router = serverRouter([
  ['/', (req, res) => res.end(info)],
  ['/brands', (req, res) => res.end( j( b() ) )],
  ['/brands/:name', (req, res, params) => res.end( j( bN(params.name) ) )],
  ['/brands/:name/:product', (req, res, params) => res.end( j( bP(params.name, params.product) ) )],
  ['/404', (req, res) => res.end( j({error: 'not found'}) )],
])

http.createServer(router).listen(3000)
