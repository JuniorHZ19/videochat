"use strict";

var datos = ["junior", "jose", 17];
filtro = datos.filter(function (dato) {
  return dato == "junior";
});
console.log("".concat(filtro));
