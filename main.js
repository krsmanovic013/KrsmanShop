//Lokacija stranice
let url = window.location.pathname;
url = url.substring(url.lastIndexOf("/"));

window.onload = () => {
  //Dohvatanje podataka i setovanje u local storage
  ajax("data/products.json", "proizvodi");
  ajax("data/brends.json", "brends");
  ajax("data/cellular-data.json", "cellular");
  ajax("data/sort.json", "sort");
  ajax("data/market.json", "market");

  document.querySelector("#ddlSelect").onchange = () => {
    ispisProzivoda(products);
  };
  document.querySelector("#cbnBrend").onchange = () => {
    ispisProzivoda(products);
  };
  document.querySelector("#cbnCellular").onchange = () => {
    ispisProzivoda(products);
  };
  document.querySelector("#cbnMarket").onchange = () => {
    ispisProzivoda(products);
  };
};

//Ajax callback
async function ajax(url, ime) {
  let res = await fetch(url);
  let data = await res.json();
  localStorage.setItem(ime, JSON.stringify(data));
}

//Setovanje podataka iz local storage u promenljive
let products = dohvatiLocal("proizvodi");
let brends = dohvatiLocal("brends");
let cellular = dohvatiLocal("cellular");
let sort = dohvatiLocal("sort");
let market = dohvatiLocal("market");

//Pravljenje checkbox lista
napraviChb(brends, "Brands", "cbnBrend");
napraviChb(cellular, "Cellular", "cbnCellular");
napraviChb(market, "Market/Region", "cbnMarket");

//Funkcija za dohvatanje iz local storage
function dohvatiLocal(ime) {
  return JSON.parse(localStorage.getItem(ime));
}

//Funkcija za pravljenje checkbox liste
function napraviChb(data, ime, id) {
  ispis = `<div class='border rounded p-2 mb-3' id='${id}'>
              <h5>${ime}</h5>`;

  for (let obj of data) {
    ispis += `<div class='mb-2'>
              <input class="form-check-input mt-0 ${id}" type="checkbox" value='${
      obj.id
    }' /> 
              <label>${obj.naziv} (${prebroj(obj)})</label>
          </div>`;
  }
  ispis += "</div>";

  document.querySelector("#filterList").innerHTML += ispis;
}

//Prebrojavanje
function prebroj(kat) {
  if (brends.includes(kat)) {
    var novi = products.filter((a) => kat.id == a.idBrend);
  }
  if (market.includes(kat)) {
    var novi = products.filter((a) => kat.id == a.idRegion);
  }
  if (cellular.includes(kat)) {
    var novi = products.filter((a) => kat.id == a.idCellular);
  }
  return novi.length;
}

//Pravljenje ddl Sort
createDdl(sort, "sortLista");

//Funkcija za pravljenje drowdown liste
function createDdl(data, idBloka) {
  let ispis = '<select id="ddlSelect" class="form-select">';
  for (let obj of data) {
    ispis += `<option value='${obj.value}'>${obj.naziv}</option>`;
  }
  document.querySelector(`#${idBloka}`).innerHTML = ispis;
}

//Proizvodi
ispisProzivoda(products);

function ispisProzivoda(data) {
  let ispis = "<div class='row d-flex justify-content-around'>";
  data = sortiranje(data);
  data = filtriranjeBrend(data);
  data = filtriranjeCellular(data);
  data = filtriranjeMarket(data);
  for (let obj of data) {
    ispis += `
    <div class='card product bg-light my-3 col-12 col-lg-4'>
      <img src=${obj.image.src} class='card-img-top' alt=${obj.image.alt} />
        <div class='card-body'>
            <h5 class='card-title klasa'>${obj.title}</h5>
            <hr />
            <div class='price klasa'>$${obj.price.new}</div>
            <a href='${obj.id}' class='btn boja my-1 dugmeCart' id='btnn'><i class='fa-solid fa-cart-shopping'> Add</i></a>
        </div>
    </div>`;
  }
  ispis += "</div>";
  document.querySelector("#products").innerHTML = ispis;
}

//Search po name-u
const search = document.querySelector("#search");
search.onkeyup = () => {
  let val = search.value;
  let novi = products.filter(
    (a) => a.title.toLowerCase().indexOf(val.toLowerCase()) != -1
  );
  ispisProzivoda(novi);
};

//Ispis nav
ajax("data/nav.json", "nav");
let nav = dohvatiLocal("nav");

function ispisNav(data) {
  let ispis = "<ul class='navbar-nav ms-auto'>";
  for (let obj of data) {
    ispis += `<li class="nav-item ms-4">  
                  <a class="nav-link" href="${obj.href}}">${obj.tekst}</a>
              </li>`;
  }
  ispis += `<a href='cart.html' class='btn  text-light ms-0 ms-lg-3'>
                 <i class='fa-solid fa-cart-shopping'></i>
                 <span id='cartItemsCounter'></span>
            </a>
          </ul>`;
  document.querySelector("#navbarNav").innerHTML = ispis;
}
ispisNav(nav);

//dinamicka godina footer
document.querySelector("#god").innerHTML = new Date().getFullYear();

//Add to cart dugme
const btnAddToCard = document.querySelectorAll(".dugmeCart");
for (let btn of btnAddToCard) {
  btn.onclick = (e) => {
    e.preventDefault();
    idProizvoda = e.target.getAttribute("href");
    console.log(idProizvoda);
  };
}

// sortiranje
function sortiranje(nizProizvoda) {
  let sortiraniProizvodi = [];
  let izbor = $("#ddlSelect").val();

  if (izbor == "default") {
    sortiraniProizvodi = nizProizvoda;
  } else {
    sortiraniProizvodi = nizProizvoda.sort(function (a, b) {
      if (izbor == "price-asc") {
        return a.price.new - b.price.new;
      }
      if (izbor == "price-desc") {
        return b.price.new - a.price.new;
      }
      if (izbor == "a-z") {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        } else {
          return 0;
        }
      }
      if (izbor == "z-a") {
        if (a.title > b.title) {
          return -1;
        } else if (a.title < b.title) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }
  return sortiraniProizvodi;
}

//filtriranje brend
function filtriranjeBrend(nizProizvoda) {
  let filtriraniNiz = [];
  let nizCekiranih = [];
  for (let c of document.querySelectorAll(".cbnBrend")) {
    if (c.checked) {
      nizCekiranih.push(parseInt(c.value));
    }
  }
  if (nizCekiranih.length > 0) {
    filtriraniNiz = nizProizvoda.filter((x) =>
      nizCekiranih.includes(x.idBrend)
    );
  } else {
    filtriraniNiz = nizProizvoda;
  }

  return filtriraniNiz;
}

//filtriranje cellular
function filtriranjeCellular(nizProizvoda) {
  let filtriraniNiz = [];
  let nizCekiranih = [];
  for (let c of document.querySelectorAll(".cbnCellular")) {
    if (c.checked) {
      nizCekiranih.push(parseInt(c.value));
    }
  }
  if (nizCekiranih.length > 0) {
    filtriraniNiz = nizProizvoda.filter((x) =>
      nizCekiranih.includes(x.idCellular)
    );
  } else {
    filtriraniNiz = nizProizvoda;
  }

  return filtriraniNiz;
}

//filtriranje market/region
function filtriranjeMarket(nizProizvoda) {
  let filtriraniNiz = [];
  let nizCekiranih = [];
  for (let c of document.querySelectorAll(".cbnMarket")) {
    if (c.checked) {
      nizCekiranih.push(parseInt(c.value));
    }
  }
  if (nizCekiranih.length > 0) {
    filtriraniNiz = nizProizvoda.filter((x) =>
      nizCekiranih.includes(x.idRegion)
    );
  } else {
    filtriraniNiz = nizProizvoda;
  }

  return filtriraniNiz;
}
