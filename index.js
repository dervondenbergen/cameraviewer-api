const serverRouter = require("server-router");
const http = require("http");

const PORT = process.env.PORT || 3000;

const { brands } = require("./data");

const info = `
/ => information
/brands => list of brands
/brands/:name => list of product types of brand
/brands/:name/:product => list of products of product type of brand
`;

let j = json => {
  return JSON.stringify(json);
};

let AllBrands = req => {
  let brns = [];
  Object.keys(brands).forEach(br => {
    let name = brands[br].name;
    let url = brands[br].url;
    brns.push({ name, url });
  });
  return {
    brands: brns,
    type: "AllBrands"
  };
};

let Brand = (req, n) => {
  let name = brands[n].name;
  let pro = brands[n].products;
  let productTypes = [];
  Object.keys(pro).forEach(p => {
    productTypes.push({
      name: p,
      count: pro[p].length
    });
  });
  let type = "Brand";
  return {
    name,
    productTypes,
    type
  };
};

let AllProducts = (req, name, product) => {
  let products = [];
  brands[name].products[product].forEach(p => {
    let name = p.name;
    let image = p.images.length > 0 ? p.images[0] : "";
    products.push({
      name,
      image
    });
  });
  let length = products.length;
  let type = "AllProducts";
  return {
    products,
    length,
    type
  };
};

let Product = (req, name, product, id) => {
  let pid = parseInt(id);
  let pro = brands[name].products[product][pid];
  return {
    product: pro,
    type: "Product"
  };
};

const router = serverRouter([
  ["/", (req, res) => res.end(info)],
  ["/brands", (req, res) => res.end(j(AllBrands(req)))],
  ["/brands/:name", (req, res, params) => res.end(j(Brand(req, params.name)))],
  [
    "/brands/:name/:product",
    (req, res, params) =>
      res.end(j(AllProducts(req, params.name, params.product)))
  ],
  [
    "/brands/:name/:product/:id",
    (req, res, params) =>
      res.end(j(Product(req, params.name, params.product, params.id)))
  ],
  ["/404", (req, res) => res.end(j({ error: "not found" }))]
]);

http.createServer(router).listen(PORT);
