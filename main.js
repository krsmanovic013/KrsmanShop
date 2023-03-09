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

  if (url == "/shop.html") {
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
  }
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

//Funkcija za dohvatanje iz local storage
function dohvatiLocal(ime) {
  return JSON.parse(localStorage.getItem(ime));
}
//Funkcija za setovanje u local storage
function setujLocal(ime, data) {
  localStorage.setItem(ime, JSON.stringify(data));
}

if (url == "/shop.html") {
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

  //Pravljenje checkbox lista
  napraviChb(brends, "Brands", "cbnBrend");
  napraviChb(cellular, "Cellular", "cbnCellular");
  napraviChb(market, "Market/Region", "cbnMarket");

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
           <button class='btn boja my-1 dugmeCart' id='btnn' data-id='${obj.id}'><i class='fa-solid fa-cart-shopping'> Add</i></button>
        </div>
    </div>`;
    }
    ispis += "</div>";
    document.querySelector("#products").innerHTML = ispis;

    //Add to cart dugme
    const btnAddToCard = document.querySelectorAll(".dugmeCart");
    for (let btn of btnAddToCard) {
      btn.onclick = (e) => {
        e.preventDefault();
        idProizvoda = btn.getAttribute("data-id");
        addToCart(idProizvoda);
      };
    }

    if (data.length < 5) {
      document.querySelector("#futer").classList.add("fix");
    } else {
      document.querySelector("#futer").classList.remove("fix");
    }
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
}

//Ispis nav
ajax("data/nav.json", "nav");
let nav = dohvatiLocal("nav");

function ispisNav(data) {
  let ispis = "<ul class='navbar-nav ms-auto'>";
  for (let obj of data) {
    ispis += `<li class="nav-item ms-4">  
                 <a class="nav-link" href="${obj.href}">${obj.tekst}</a>
             </li>`;
  }
  ispis += `<a href='cart.html' class='btn  text-light ms-0 ms-lg-3'>
                <i class='fa-solid fa-cart-shopping'></i>
                <span id='cartItemsCounter'>${brojProizvoda()}</span>
           </a>
         </ul>`;
  document.querySelector("#navbarNav").innerHTML = ispis;
}
ispisNav(nav);

//dinamicka godina footer
document.querySelector("#god").innerHTML = new Date().getFullYear();

//CART

function addToCart(id) {
  let korpaProizvodi = dohvatiLocal("korpaProizvodi");
  if (korpaProizvodi) {
    if (proizvodPostoji()) {
      povecaj();
    } else {
      dodajUKorpu();
      ispisNav(dohvatiLocal("nav"));
    }
  } else {
    dodajPrvi();
    ispisNav(dohvatiLocal("nav"));
  }
  //Dodavanje prvog proizvoda , samo u slucaju da je korpa bila skroz prazna !
  function dodajPrvi() {
    let nizPr = [];
    nizPr[0] = {
      id: id,
      kolicina: 1,
    };
    setujLocal("korpaProizvodi", nizPr);
  }

  //Provera da li dodajemo novi proizvod ili samo povecavamo kolicinu
  function proizvodPostoji() {
    return korpaProizvodi.find((a) => a.id == id); //vraca undefined ako ne postoji
  }

  //Povecavanje kolicine
  function povecaj() {
    let pr = dohvatiLocal("korpaProizvodi");
    let item = pr.find((a) => a.id == id);
    item.kolicina++;
    setujLocal("korpaProizvodi", pr);
  }

  //Dodavanje novog proizvoda
  function dodajUKorpu() {
    //a
    let pr = dohvatiLocal("korpaProizvodi");
    let obj = {
      id: id,
      kolicina: 1,
    };
    pr.push(obj);
    setujLocal("korpaProizvodi", pr);
  }
}

if (url == "/cart.html") {
  //ispis prozivoda
  function ispisKorpa() {
    let prKorpa = dohvatiLocal("korpaProizvodi");
    let pr = dohvatiLocal("proizvodi");
    let ispis = `<div class="d-flex justify-content-between align-items-center mb-4">
                    <h3 class="fw-normal mb-0 text-black">Shopping Cart</h3>
                 </div>`;

    if (prKorpa.length) {
      for (let p of prKorpa) {
        let obj = pr.find((a) => a.id == p.id);
        ispis += `
                    <div class="card rounded-3 mb-4">
                    <div class="card-body p-4">
                      <div
                        class="row d-flex justify-content-between align-items-center"
                      >
                        <div class="col-md-2 col-lg-2 col-xl-2">
                          <img
                            src="${obj.image.src}"
                            class="img-fluid rounded-3"
                            alt="${obj.image.alt}"
                          />
                        </div>
                        <div class="col-md-3 col-lg-3 col-xl-3">
                          <p class="lead fw-normal mb-2">${obj.title}</p>
                          <p>
                            <span class="text-muted"> Region: ${obrada(
                              obj.idRegion,
                              market
                            )}</span> 
                            <p class="text-muted"> Cellular: ${obrada(
                              obj.idCellular,
                              cellular
                            )}</p> 
                          </p>
                        </div>
                        <div class="col-md-3 col-lg-3 col-xl-2 d-flex">
                          
              
                          <input
                            id="kol"
                            
                            data-id='${p.id}'
                            name="quantity"
                            value="Quantity: ${p.kolicina}"
                            type="text"
                            class="form-control form-control-sm kol"
                            readonly
                          />
              
                          
                        </div>
                        <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                          <h5 class="mb-0">$${(
                            obj.price.new * p.kolicina
                          ).toFixed(2)}</h5>
                        </div>
                        <div class="col-md-1 col-lg-1 col-xl-1 text-end">
                          <button data-id='${
                            obj.id
                          }' class="btn text-danger btnBrisi">
                          <i class="fas fa-trash fa-lg"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                    `;
      }
    } else {
      ispis = `<h1>Cart is empty</h1>`;
    }
    ispis += `<div class="card">
    <div class="card-body">
      <button type="button" class="btn boja btn-block btn-lg">
        Proceed to Pay
      </button>
    </div>
  </div>`;
    document.querySelector("#ispisKart").innerHTML = ispis;

    //Brisanje iz korpe
    const sviBtnBrisi = Array.from(document.querySelectorAll(".btnBrisi"));
    console.log(sviBtnBrisi);

    for (let btn of sviBtnBrisi) {
      btn.onclick = () => {
        let id = btn.getAttribute("data-id");
        let prKorpa = dohvatiLocal("korpaProizvodi");
        let index = prKorpa.indexOf(prKorpa.find((a) => a.id == id));
        prKorpa.splice(index, 1);
        setujLocal("korpaProizvodi", prKorpa);
        ispisKorpa();
        ispisNav(dohvatiLocal("nav"));
      };
    }
    //quantity u korpi

    //Fix footera da se ne raspada veliki i srednji ekrani
    if (prKorpa.length < 3) {
      document.getElementById("footer").classList.add("fix");
    } else {
      document.getElementById("footer").classList.remove("fix");
    }

    //Fix footera mobile
    if (prKorpa.length < 1) {
      document.getElementById("footer").classList.add("fixx");
    } else {
      document.getElementById("footer").classList.remove("fixx");
    }
  }
  ispisKorpa();
}
function brojProizvoda() {
  if (dohvatiLocal("korpaProizvodi")) {
    return dohvatiLocal("korpaProizvodi").length;
  } else {
    return "0";
  }
}
brojProizvoda();

function obrada(id, niz) {
  for (let r of niz) {
    if (r.id == id) {
      return r.naziv;
    }
  }
}
