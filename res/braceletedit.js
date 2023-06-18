import * as view from "./braceletview.js"
console.group("INIT in");

function loadPattern(patternName){
  fetch('./'
      +patternName
        .replaceAll('\\', '/')
        .replaceAll('../', '')
      +'.json'
      ).then(r=>{
    if(r.ok)
      return r.json(); 
    throw r;
  }).then(config=>{
    if(config._version===1 &&
       config._format==='braceletview'){
      let patternView =
        view.createNormalPatternView(config);
      
      const svg = patternView.querySelector('svg');
      svg.setAttribute('xmlns', "http://www.w3.org/2000/svg")
      svg.setAttribute('version', "1.0")
      console.debug(svg);
      console.debug(svg.outerHTML);
      const uri = 'data:'
          + 'image/svg+xml'
          + ';name=pattern.svg'
          + ';base64'
          + ','
          + btoa(unescape(encodeURIComponent(svg.outerHTML)));
      //const frame = document.createElement('img');
      const frame = document.createElement('object');
      //frame.src = uri;
      frame.data = uri;
      //frame.setAttribute('download', 'pattern.svg');
      frame.type = 'image/svg+xml';
      frame.width = svg.width.baseVal.value;
      frame.height = svg.height.baseVal.value;
      //frame.alt = 'Pattern';
      
      document.getElementById('pattern').append(frame);
    } else {
      throw 'no valid data found';
    }
  });
}

function initPage(){
  console.debug(view);
  console.debug("init page");
  
  var infile = 'demo';
  var q = new URLSearchParams(location.search);
  if(q.has('pattern'))
    infile = q.get('pattern');
 
  loadPattern(infile);
}
initPage();
//export default initPage;
console.groupEnd("INIT out");
