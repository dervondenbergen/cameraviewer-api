var allProducts = document.querySelectorAll(".product");

var products = [];

Array.prototype.forEach.call(allProducts, camera => {
  var name = camera.querySelector(".name a").textContent;
  var url = camera.querySelector(".name a").href;
  var price = camera.querySelector(".prices a").textContent;
  var data = { name, url, price, specs };
  var specs = camera.querySelector(".specs .singleline");
  if (specs) {
    data.specs = specs.textContent;
  } else {
    data.specs = "";
  }
  getImages(url, images => {
    if (images.length > 0) {
      data.images = images;
    } else {
      var imagesrc = camera.querySelector(".image img");
      image = [];
      if (imagesrc) {
        image.push(imagesrc.src);
      }
      data.images = image;
    }
    products.push(data);
  });
});

function getImages(url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.onload = function() {
    var parser = new DOMParser();
    var productPage = parser.parseFromString(xhr.responseText, "text/html");
    var metaTag = productPage.querySelector('[property="og:image"]');
    var scriptTag = metaTag.nextElementSibling.textContent;
    var images = JSON.parse(
      scriptTag.split("ProductController(")[1].split(");")[0]
    ).productImages;
    callback(images);
  };
  xhr.onerror = function() {
    console.log("ERROR WITH ", url);
    callback([]);
  };
  xhr.send();
}
