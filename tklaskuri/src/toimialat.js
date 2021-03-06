import React, {useState} from 'react';
import datatoimialatKunnittain from "./toimialatKunnittain2";
import dataToimialojenVerot from "./toimialojenVerot";
import dataPaastot from "./paastotToimialoittain";
import FadeIn from 'react-fade-in';

// asetetaan dataa jsoneista muuttujiin
const toimialalista = datatoimialatKunnittain.dataset.dimension.Toimiala2008.category.label
const toimialaIndeksit = datatoimialatKunnittain.dataset.dimension.Toimiala2008.category.index
const toimialojenMaarat = datatoimialatKunnittain.dataset.value
const kuntienIndeksit = datatoimialatKunnittain.dataset.dimension.Kunta.category.index
const kuntienNimet = datatoimialatKunnittain.dataset.dimension.Kunta.category.label
const nimiJaIndeksi = dataToimialojenVerot.dataset.dimension.Toimiala.category.index
const toimialojenVerot = dataToimialojenVerot.dataset.value
const toimialojenPaastot = dataPaastot.dataset.value
const toimialojenPaastotIndeksit = dataPaastot.dataset.dimension["Toimialat (TOL2008) ja kotitaloudet"].category.index;

//Pääkomponentti toimialoille
const Toimialat = () => {

  // Counter pitää tiedossa valitun toimialan indeksin
  const [counter, setCounter] = useState(53)
  const setToValue = (value) => setCounter(value)

  //iso läjä listoja
  var enitenKunnassa = [];
  var verotaulukko = [];
  var alataulukko = [];
  var maarataulukko = [];
  var kuntienToimialaLkm = [];
  var paastotaulukko = [];
  var toimialojenAvaimet = [];
  var kunnanNimiAvain;
  var kuntienKaikkiToimialat = [];
  var toimialojenLkm = Object.keys(toimialalista).length
  var toimialojenSLtaulukko = [];

  /*Jokaisen kunnan kaikki toimialat ovat peräkkäin listassa ositettuna 
  (n kpl koko suomen toimialoja, n kpl seuraavan kunnan toimialoja...)
  Saadaksesi kunnan x kaikki toimialat, aloita ensimmäisestä kyseisen toimialan indeksistä
  ja hyppää toimialojen lukumäärän verran eteenpäin. 
  */
  function toimialanPaikkakunnat(counter) {
    var haettavaIndeksi = toimialojenAvaimet[counter]
    var ekaToimialanArvo = toimialaIndeksit[haettavaIndeksi]

    for (let i = ekaToimialanArvo; i < toimialojenMaarat.length; i = (i + toimialojenLkm)) {

      kuntienToimialaLkm.push(toimialojenMaarat[i])
    }

    etsiEniten();
    kunnanNimiAvain = haeAvain(kuntienIndeksit, enitenKunnassa[1])

  }

  //jarjestaa toimialat taulukkoo suhdeluvun mukaan pitäen ylhäällä vanhaa indeksiä
  function jarjestaToimialojenSL() {
    for (let i = 0; i < verotaulukko.length; i++) {
      toimialojenSLtaulukko[i] = { slIndeksi: i, suhde: (verotaulukko[i] / paastotaulukko[i]) }
      if (isNaN(toimialojenSLtaulukko[i].suhde)) {
        toimialojenSLtaulukko[i].suhde = 0;
        continue;
      }
    }

    let suhdeluvutJarj = toimialojenSLtaulukko

    suhdeluvutJarj.sort(function (a, b) {
      return b.suhde - a.suhde;
    })
    for (let i = 0; i < suhdeluvutJarj.length; i++) {
      if (suhdeluvutJarj[i].suhde === 0) {
        suhdeluvutJarj.splice(i, suhdeluvutJarj.length - i)
        break;
      }
    }

    return suhdeluvutJarj;
  }

  //Annetaan value, jolle etsitään ja palautetaan sitä vastaava key
  function haeAvain(lista, value) {

    return Object.keys(lista).find(key => lista[key] === value);
  }

  //Hakee jokaisen kunnan toimialojen määrän listaan. Kokomaa = 0, Akaa = 1...
  function KunnanKaikkiToimialatLkm() {

    for (let key in kuntienIndeksit) {

      kuntienKaikkiToimialat[kuntienIndeksit[key]] = toimialojenMaarat[(toimialojenLkm * kuntienIndeksit[key])]

    }
  }

  //pitää järjestettyä listaa eniten valittua toimialaa sisältävien kuntien indekseistä
  function etsiEniten() {

    for (let i = 0; i < kuntienToimialaLkm.length; i++) {

      enitenKunnassa.push(i);
      enitenKunnassa.sort(function (a, b) { return kuntienToimialaLkm[b] - kuntienToimialaLkm[a]; });

    }
    KunnanKaikkiToimialatLkm();
  }

  //Luo ison läjän keyn mukaan indeksöityjä listoja
  //listasta valittaessa saadaan samalla indeksillä muista listoista oikeita arvoja
  function luoTaulukot() {
    let paastoToimialojenlkm = (Object.keys(toimialojenPaastotIndeksit).length)
    for (let key in toimialalista) {
      if (key.length === 2) {

        toimialojenAvaimet.push(key)
        alataulukko.push(toimialalista[key])
        maarataulukko.push(toimialojenMaarat[toimialaIndeksit[key]])
        paastotaulukko.push(toimialojenPaastot[toimialojenPaastotIndeksit[key] + paastoToimialojenlkm * 9])
        if (toimialojenVerot[nimiJaIndeksi[key]] == null) {

          verotaulukko.push("Ei tiedossa")
        }
        else {

          verotaulukko.push(toimialojenVerot[nimiJaIndeksi[key]])

        }
      }
    }
    return alataulukko;
  }
  //Korvaa toimialojen nimissä olevat numerot ja alun välit tyhjällä
  function parsiTaulukko(taulukko) {

    for (let x in taulukko) {
      taulukko[x] = taulukko[x].replace(/^[\s\d]+/, '');
    }
  }
  function compare(a, b) {
  if (a.nimi > b.nimi) return 1;
  if (b.nimi > a.nimi) return -1;

  return 0;
  }

  function aakkosta(lista){
  	var uusilista = [];
  	for (let i = 0; i < lista.length; i++){
  		uusilista[i] = {indeksi : i, nimi: lista[i]}
  	}
  	uusilista.sort(compare);
  	return uusilista
  }

  var toimialaInd = 0;
  var haettava;
  var select;
  var taulukkoToimialoista = luoTaulukot();
  parsiTaulukko(taulukkoToimialoista);
  var valmislista = aakkosta(taulukkoToimialoista)

  //Hakupalkki, joka vertaa hakupalkin sisältöä select -listan sisältöön ja näyttää vain matchaavat
  const etsiToimiala = (hakusana) => {

    haettava = hakusana.target.value
    select = document.getElementById("listaToimialoista");
    for (var i = 0; i < select.length; i++) {
      var txt = select[i].text
      var include = txt.toLowerCase().startsWith(haettava.toLowerCase());
      select.options[i].style.display = include ? '' : 'none';

    }
  }

  //asettaa countteriin valitun indeksin, josta sitä voi sitten käyttää kaikkialla
  const tulostaToimiala = (listaValittu) => {

    setToValue(valmislista[listaValittu.target.value].indeksi)

  }
  //console.log(counter)

  //tämä pitää olla täällä, koska counter
  toimialanPaikkakunnat(counter)

  var suhdeluvutJarj = jarjestaToimialojenSL();
  var mediaaniIndeksi = Math.floor((suhdeluvutJarj.length / 2) - 1)

  // jakaa hienosti regexillä luvut kolmen sarjoihin
  function lukupilkuilla(x) {
    if (x === undefined) return "Ei tiedossa";
    else return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }

  let paastoTulostus = "Ei tiedossa";
  if (lukupilkuilla(paastotaulukko[counter]) !== "Ei tiedossa") {
    paastoTulostus = lukupilkuilla(paastotaulukko[counter]) + " tonnia/vuosi";
  }

  let veroTulostus = "Ei tiedossa";
  if (lukupilkuilla(verotaulukko[counter]) !== "Ei tiedossa") {
    veroTulostus = lukupilkuilla(verotaulukko[counter]) + "€/vuosi";
  }

  let sijaTulostus = "Ei sijoitusta";

  if (toimialojenSLtaulukko[counter] !== "Ei tiedossa") {
    for (let i = 0; i < suhdeluvutJarj.length; i++) {
      if (suhdeluvutJarj[i].slIndeksi == counter) {
        sijaTulostus = i + 1 + "/" + suhdeluvutJarj.length;

      }
    }
  }

  //lasketaan tulostus mediaanien vertailulle
  let mediaaniTulostus = "";

  if (toimialojenSLtaulukko[counter] !== "Ei tiedossa" && sijaTulostus !== "Ei tiedossa") {
    for (let i = 0; i < suhdeluvutJarj.length; i++) {
      if (suhdeluvutJarj[i].slIndeksi == counter) {
        let mediaaniArvo = suhdeluvutJarj[mediaaniIndeksi].suhde
        let verrattavaArvo = suhdeluvutJarj[i].suhde

        if (verrattavaArvo < mediaaniArvo) {
          mediaaniTulostus = ((mediaaniArvo - verrattavaArvo) / verrattavaArvo) * 100
          mediaaniTulostus = mediaaniTulostus * (-1)
          mediaaniTulostus = lukupilkuilla(mediaaniTulostus.toFixed(0))
          mediaaniTulostus += "% mediaanista"
        }
        else if (verrattavaArvo > mediaaniArvo) {
          mediaaniTulostus = ((verrattavaArvo - mediaaniArvo) / mediaaniArvo) * 100
          mediaaniTulostus = lukupilkuilla(mediaaniTulostus.toFixed(0))
          mediaaniTulostus = "+" + mediaaniTulostus + "% mediaanista"
        }
        else {
          mediaaniTulostus = "Mediaani"
        }
      }
    }
  }

  // lista kuntien toimialojen yritysten määrästä paikkakunnittain
  const Maara = () => {
    let monesko = "";
    let jaettuSija = 1;
    var lista = [];

    for (let i = 1; i < enitenKunnassa.length; i++) {
      let lukumaara = kuntienToimialaLkm[enitenKunnassa[i]]
      let kunta = kuntienNimet[haeAvain(kuntienIndeksit, enitenKunnassa[i])]
      if (lukumaara == 0) {
        break;
      }
      if( i > 1){
        monesko = (jaettuSija + 1) + '.'
        if(lukumaara !==  kuntienToimialaLkm[enitenKunnassa[i - 1]]){
          jaettuSija++;
        }
        else if (i === 1) monesko = ""
        else monesko = jaettuSija + "."
      }

      lista.push(<li class="list-group-item"><small class="text-muted">{monesko} Eniten paikkakunnalla: </small> {kunta}
        <small class="oikealle">{kuntienToimialaLkm[enitenKunnassa[i]]} kpl</small> </li>)

    }

    return (
      <div>
        {lista}
      </div>
    )

  }


  return (
    // Bootstrapin pääcontainer
    <FadeIn>
      <div className="container">

        <div className="row">
          <div className="col-sm">

            <div>

              <input type="text" id="search" className="form-control" name="search" placeholder="Hae..." onKeyUp={etsiToimiala} />

            </div>

            <select id="listaToimialoista" className="form-control" size="30" onChange={tulostaToimiala} >

              {valmislista.map(s => (<option value={toimialaInd++}>{s.nimi}</option>))}

            </select>
          </div>

          <div className="col-6">
            <div className="row">
              <div className="col jumbotron">
                <div>

                  <h6>Tietoa toimialasta</h6>

                </div>
                <ul class="list-group">

                  <li class="list-group-item"><small class="text-muted">Toimialan kokonaispäästöt: </small><small class="oikealle">{paastoTulostus}</small></li>
                  <li class="list-group-item"><small class="text-muted">Toimialojen kokonaislukumäärä: </small><small class="oikealle"> {lukupilkuilla(maarataulukko[counter])} kpl</small></li>
                  <li class="list-group-item"> <small class="text-muted">Toimialan verot yhteensä: </small><small class="oikealle">{veroTulostus}</small></li>
                  <li class="list-group-item"> <small class="text-muted">Toimialaa eniten paikkakunnalla: </small>{kuntienNimet[kunnanNimiAvain]}<small class="oikealle">{kuntienToimialaLkm[kuntienIndeksit[kunnanNimiAvain]]} kpl</small></li>
                  <li class="list-group-item"> <small class="text-muted">Toimialan sijoitus ekologisuuden mukaan: </small> {sijaTulostus}<small class="oikealle">{mediaaniTulostus}</small></li>

                </ul>
              </div>
            </div>

            <div className="row">
              <div className="col jumbotron">

                <h6>Toimialan yritysten määrät paikkakunnilla</h6>

                <div>

                  <div class="oikeala2">
                  <Maara />


                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>

  );
}


export default Toimialat;
