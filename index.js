const serverRouter = require("server-router");
const http = require("http");

const PORT = process.env.PORT || 3000;

const localDB = "postgresql://localhost/cameraviewer";
const knex = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL || localDB,
  searchPath: "knex,public"
});

const OwnlessExport = require("./OwnlessExport")(knex);
const runUpdate = require("./updateData")(knex);

const Info = (req, res, params) => {
  res.end(`/ => information
/brands => list of brands
/brands/:name => list of product types of brand
/brands/:name/:product => list of products of product type of brand
/brands/:name/:product/:id => information of specific product
/update/:type => add new content from type into DB`);
};

let j = json => {
  return JSON.stringify(json);
};

let buildPath = (req, to) => {
  var protocol = req.connection.encrypted ? "https://" : "http://";
  var url = req.url;
  if (url[url.length - 1] !== "/") {
    url += "/";
  }
  return `${protocol}${req.headers.host}${url}${to}`;
};

let AllBrands = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  knex
    .select(["id", "name", "url AS website", "website AS url", "logo"])
    .from("brand")
    .orderBy("name")
    .then(brands => {
      var brns = brands.map(brand => {
        brand.path = buildPath(req, brand.name);
        return brand;
      });

      res.end(
        j({
          brands: brns,
          type: "AllBrands"
        })
      );
    })
    .catch(err => {
      res.end(
        j({
          success: false,
          error: err
        })
      );
    });
};

let Brand = (req, res, { name }) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  knex
    .first()
    .from("brand")
    .where({ name: name })
    .then(brand => {
      let lensQuery = knex.count("type").from("product").where({
        brand: brand.id,
        type: "lens"
      });
      let cameraQuery = knex.count("type").from("product").where({
        brand: brand.id,
        type: "camera"
      });

      Promise.all([lensQuery, cameraQuery])
        .then(counts => {
          counts = counts.map(count => {
            return Number(count[0].count);
          });

          let productTypes = [];

          let lensAmount = counts[0];
          if (lensAmount > 0) {
            productTypes.push({
              name: "lenses",
              count: lensAmount,
              path: buildPath(req, "lenses")
            });
          }

          let cameraAmount = counts[1];
          if (cameraAmount > 0) {
            productTypes.push({
              name: "cameras",
              count: cameraAmount,
              path: buildPath(req, "cameras")
            });
          }

          let type = "Brand";
          res.end(
            j({
              name,
              productTypes,
              type
            })
          );
        })
        .catch(err => {
          console.error(err);
          res.end(
            j({
              success: false,
              error: err
            })
          );
        });
    })
    .catch(err => {
      console.error(err);
      res.end(
        j({
          success: false,
          error: err
        })
      );
    });
};

let AllProducts = (req, res, { name, product }) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  let types = {
    cameras: "camera",
    lenses: "lens"
  };

  knex
    .first()
    .from("brand")
    .where({ name: name })
    .then(brand => {
      let productQuery = knex
        .select(["release_date", "name", "id"])
        .from("product")
        .where({
          brand: brand.id,
          type: types[product]
        })
        .orderByRaw("release_date DESC NULLS LAST");

      var imageQuery = knex
        .select()
        .from("product_image")
        .whereIn("product", function() {
          this.select("id").from("product").where({
            brand: brand.id,
            type: types[product]
          });
        });

      Promise.all([productQuery, imageQuery])
        .then(results => {
          let products = [];

          let images = results[1];
          results[0].forEach((product, index) => {
            product.path = buildPath(req, index);

            let pimg = images.filter(img => {
              return img.product === product.id;
            });
            if (pimg.length > 0) {
              image = pimg[0].url;
            } else {
              image = "";
            }
            product.image = image;

            delete product.id;

            products.push(product);
          });

          let length = products.length;

          res.end(
            j({
              products,
              length,
              type: "AllProducts"
            })
          );
        })
        .catch(err => {
          console.error(err);
          res.end(
            j({
              success: false,
              error: err
            })
          );
        });
    })
    .catch(err => {
      console.error(err);
      res.end(
        j({
          success: false,
          error: err
        })
      );
    });
};

let Product = (req, res, { name, product, id }) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  let pid = parseInt(id);

  let types = {
    cameras: "camera",
    lenses: "lens"
  };

  knex
    .first()
    .from("brand")
    .where({ name: name })
    .then(brand => {
      knex
        .first(["id", "name", "url", "short_specs AS specs", "price"])
        .from("product")
        .where({
          brand: brand.id,
          type: types[product]
        })
        .orderByRaw("release_date DESC NULLS LAST")
        .offset(pid)
        .limit(1)
        .then(product => {
          knex
            .select(["url"])
            .from("product_image")
            .where({ product: product.id })
            .then(images => {
              product.images = images.map(img => img.url);

              res.end(
                j({
                  product,
                  type: "Product"
                })
              );
            })
            .catch(err => {
              console.error(err);
              res.end(
                j({
                  success: false,
                  error: err
                })
              );
            });
        })
        .catch(err => {
          console.error(err);
          res.end(
            j({
              success: false,
              error: err
            })
          );
        });
    })
    .catch(err => {
      console.error(err);
      res.end(
        j({
          success: false,
          error: err
        })
      );
    });
};

let Update = (req, res, { type, brand }) => {
  let types = {
    brand: "https://www.dpreview.com/products/",
    camera: "https://www.dpreview.com/products/cameras/all",
    lens: "https://www.dpreview.com/products/lenses/all"
  };
  let updateUrl = types[type];
  if (updateUrl) {
    if (brand !== undefined) {
      updateUrl = updateUrl.replace("all", brand);
    }
    runUpdate(type, updateUrl);
    res.end(
      j({
        success: true,
        message: `'${type}' update initiated`
      })
    );
  } else {
    res.end(
      j({
        success: false,
        message: `update for '${type}' not possible`
      })
    );
  }
};

let Images = (req, res, { id }) => {
  knex
    .select(["url"])
    .from("product_image")
    .where({ product: id })
    .map(img => img.url)
    .then(images => {
      res.end(j({ images }));
    });
};

let FourOhFour = (req, res, params) => {
  res.end(j({ error: "not found" }));
};

const router = serverRouter([
  ["/", Info],
  ["/brands", AllBrands],
  ["/brands/:name", Brand],
  ["/brands/:name/:product", AllProducts],
  ["/brands/:name/:product/:id", Product],
  ["/update/:type", Update],
  ["/update/:type/:brand", Update],
  ["/OwnlessExport/:type", OwnlessExport],
  ["/images/:id", Images],
  ["/404", FourOhFour]
]);

http.createServer(router).listen(PORT);
