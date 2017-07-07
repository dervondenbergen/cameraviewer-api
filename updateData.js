const cheerio = require("cheerio");
const fetch = require("node-fetch");
const moment = require("moment");

const updateData = knex => {
  const runUpdate = (type, url) => {
    if (type === "brand") {
      updateBrands(url);
    } else {
      updateProducts(url, type);
    }
  };

  const checkIfExisting = (type, url) => {
    return knex
      .first()
      .from(type)
      .where({ url: url })
      .then(entry => {
        if (entry) {
          return true;
        } else {
          return false;
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const scrapeContent = url => {
    return fetch(url).then(res => {
      return res.text();
    });
  };

  const getBrands = body => {
    let $ = cheerio.load(body);

    let urls = $(".brand")
      .map((i, el) => {
        return $(el).attr("href");
      })
      .get();

    return { urls };
  };

  const getBrandInformation = body => {
    let $ = cheerio.load(body);

    let name = $(".breadcrumbs").children().last().text();

    let website = $(".quickInfo").find("a").first().attr("href");

    let logo = `https://3.img-dpreview.com/resources/images/brands/${name}/logo-light.png?v=4098`;
    return { name, logo, website };
  };

  const insertBrandInformation = info => {
    return knex
      .insert(info, "id")
      .into("brand")
      .then(id => {
        return id;
      })
      .catch(error => {
        console.error(error);
      });
  };

  const updateBrands = url => {
    scrapeContent(url)
      .then(body => getBrands(body))
      .then(info => {
        info.urls.forEach(url => {
          checkIfExisting("brand", url).then(exists => {
            if (!exists) {
              scrapeContent(url)
                .then(getBrandInformation)
                .then(info => {
                  info.url = url;
                  return insertBrandInformation(info);
                })
                .then(id => {
                  console.log("brand " + id + " saved");
                })
                .catch(error => {
                  console.error(error);
                });
            }
          });
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

  const getProducts = body => {
    let $ = cheerio.load(body);

    let urls = $(".product")
      .map((i, el) => {
        return $(el).find(".name").find("a").attr("href");
      })
      .get();

    return { urls };
  };

  const getProductInformation = body => {
    let $ = cheerio.load(body);

    let name = $("h1").text();

    let release_dateElement = $(".shortSpecs").contents().get(2);
    let release_date = null;
    if (release_dateElement) {
      let date = release_dateElement.data.replace("•", "").trim();
      if (date !== "") {
        release_date = moment(date, "MMM DD, YYYY").format("YYYY-MM-DD");
      }
    }

    let short_specs = $(".shortProductSpecs").text();

    let priceElement = $("div.price");
    let price;
    if (priceElement.hasClass("range")) {
      price = priceElement.children().first().text();
    } else if (priceElement.hasClass("single")) {
      price = priceElement.text();
    } else {
      price = null;
    }

    let description = $('meta[itemprop="description"]').attr("content") || null;

    let quick_specs = $(".quickSpecs table")
      .find("tr")
      .map((i, elem) => {
        var label = $(".label", $(elem)).text().trim();
        var value = $(".value", $(elem)).text().trim();

        return { label, value };
      })
      .get();

    let scriptTag = $('meta[property="og:image"]').next().html();
    let productInfo = JSON.parse(
      scriptTag.split("ProductController(")[1].split(");")[0]
    );

    let uid = productInfo.productDprCode;

    let images = productInfo.productImages;

    let brand = $('meta[itemprop="brand"]').attr("content");

    return {
      uid,
      name,
      release_date,
      short_specs,
      price,
      description,
      quick_specs,
      images,
      brand
    };
  };

  const getProductSpecs = body => {
    let $ = cheerio.load(body);

    let specs = $(".specsTable")
      .children()
      .filter("thead")
      .map((i, el) => {
        let group = $(el).find("th").text().trim();
        let facts = $(el)
          .next()
          .children()
          .map((i, el) => {
            let label = $(el).find(".label").text().trim();
            let value = $(el).find(".value").text().trim();

            return { label, value };
          })
          .get();

        return { group, facts };
      })
      .get();

    return specs;
  };

  const insertProductInformation = info => {
    let images = info.images.map(image => {
      return { url: image };
    });
    delete info.images;

    info.specs = JSON.stringify(info.specs);
    info.quick_specs = JSON.stringify(info.quick_specs);

    let uid = info.uid;

    return knex
      .first("id")
      .from("brand")
      .where({ name: info.brand })
      .then(brand => {
        if (brand) {
          info.brand = brand.id;

          return knex
            .transaction(function(trx) {
              return trx.insert(info, "id").into("product").then(function(ids) {
                return Promise.all(
                  images.map(function(image) {
                    image.product = ids[0];

                    return trx.insert(image).into("product_image");
                  })
                );
              });
            })
            .then(inserts => {
              return uid;
            })
            .catch(error => {
              console.error(error);
              console.error(`Url was '${info.url}'.`);
            });
        } else {
          console.error(`Brand '${info.brand}' does not exist.`);
          console.error(`Url was '${info.url}'.`);
          return { err: "NOBRAND" };
        }
      })
      .catch(error => {
        console.error(error);
        console.error(`url was ${info.url}`);
      });
  };

  const updateProducts = (url, type) => {
    scrapeContent(url)
      .then(body => getProducts(body))
      .then(info => {
        var counter = 0;
        info.urls.forEach(url => {
          checkIfExisting("product", url).then(exists => {
            if (!exists) {
              counter += 1;

              var infos = scrapeContent(url).then(getProductInformation);

              var specsUrl = url + "/specifications";
              var specs = scrapeContent(specsUrl).then(getProductSpecs);

              Promise.all([infos, specs])
                .then(values => {
                  let info = values[0];

                  info.specs = values[1];
                  info.url = url;
                  info.type = type;

                  return insertProductInformation(info);
                })
                .then(uid => {
                  counter -= 1;
                  if (uid && !uid.err) {
                    console.log(
                      `Product ${uid} saved. ${counter} saves missing.`
                    );
                  }
                })
                .catch(error => {
                  counter -= 1;
                  console.error(error);
                  console.error(`url was ${url}`);
                });
            }
          });
        });
      })
      .catch(error => {
        console.error(error);
      });
  };

  return runUpdate;
};

module.exports = updateData;
