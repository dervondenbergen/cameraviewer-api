const localDB = "postgresql://localhost/cameraviewer";
const knex = require("knex")({
  client: "pg",
  connection: process.env.DATABASE_URL || localDB,
  searchPath: "knex,public"
});

const brand = knex.schema.createTableIfNotExists("brand", table => {
  table.increments();
  table.text("name");
  table.text("url");
  table.text("logo");
  table.text("website");
});

const product = knex.schema.createTableIfNotExists("product", table => {
  table.increments();
  table.text("name");
  table.text("url");
  table.text("price");
  table.text("description");
  table.text("short_specs");
  table.jsonb("quick_specs");
  table.jsonb("specs");
  table.text("uid");
  table.text("type");
  table.date("release_date");
  table.integer("brand").unsigned();
  table.foreign("brand").references("brand.id");
});

const product_image = knex.schema.createTableIfNotExists(
  "product_image",
  table => {
    table.increments();
    table.text("url");
    table.integer("product").unsigned();
    table.foreign("product").references("product.id");
  }
);

Promise.all([brand, product, product_image])
  .then(creates => {
    console.info("Tables set up");
  })
  .catch(err => {
    console.error("ERROR: " + err.message);
    if (err.code === "3D000") {
      console.log("Create database or change connection information");
    }
  });
