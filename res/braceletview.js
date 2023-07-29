const SVGNS = "http://www.w3.org/2000/svg";
const LOGGER = "VIEW";

const textheight = 16;

/**
 * @param config Object mit allen Einstellungen
 */
export function createNormalPatternView(config) {
  const radius = 30;
  const borderX = 20;
  const deltaX = Math.floor(radius * 4);
  const deltaY = Math.floor(radius * 2);

  const hx = deltaX / 2; // height-X
  const hy = deltaY; // height-Y
  const tx = hx / 4; // thread-X
  const ty = hy / 4; // thread-Y

  function addRow(rownum, row, fullrow, threads) {
//  console.debug(rownum, row);

    let rowGroup = document.createElementNS(SVGNS, "g");
    let x = fullrow ? 0 : (deltaX / 2);
    let index = fullrow ? 0 : 1;

    //  <path id="arrowstraight" d="M-5,-20h10v30l5,-5l5,5l-10,10h-10l-10,-10,5,-5,5,5z"/>
    //  <path id="arrowcorner" d="M-20,-10h25v20l5,-5l5,5l-10,10h-10l-10,-10,5,-5,5,5v-10h-15z"/>


    let rowback = document.createElementNS(SVGNS, "g");
    rowback.setAttribute('transform', 'translate(0,' + deltaY / 2 + ')');
    let line = document.createElementNS(SVGNS, "line");
    line.setAttribute('class', 'border rowmark');
    line.setAttribute('x1', 0);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', deltaX * threads.length / 2);
    line.setAttribute('y2', 0);
    rowback.append(line);
    let tleft = document.createElementNS(SVGNS, "text");
    tleft.setAttribute('class', 'rowmark');
    tleft.setAttribute('text-anchor', 'end');
    tleft.setAttribute('x', '-4');
    tleft.setAttribute('y', '6');
    tleft.textContent = rownum;
    rowback.append(tleft);
    let tright = document.createElementNS(SVGNS, "text");
    tright.setAttribute('class', 'rowmark');
    tright.setAttribute('text-anchor', 'start');
    tright.setAttribute('x', deltaX * threads.length / 2 + 0);
    tright.setAttribute('y', '6');
    tright.textContent = rownum;
    rowback.append(tright);
    rowGroup.append(rowback);

    let lastrow = threads;
    for (let k of row) {
      let knotGroup = document.createElementNS(SVGNS, "g");
      knotGroup.setAttribute('class', 'knot');
      knotGroup.setAttribute('transform',
              'translate('
              + ((index + .5) * deltaX - x)
              + ','
              + (deltaY / 2)
              + ')'
              );

      let devcross = document.createElementNS(SVGNS, "path");
      devcross.setAttribute('fill', 'none');
      devcross.setAttribute('stroke', 'green');
      devcross.setAttribute('d', 'M-' + (hx / 2.) + ',-' + (hy / 2.)
              + 'v' + hy + 'h' + hx
              + 'v-' + hy + 'h-' + hx
              + 'l' + hx + ',' + hy
              + 'm0,-' + hy
              + 'l-' + hx + ',' + hy
              + 'z');
      //knotGroup.append(devcross);

      function addThread(dirx, diry, thread) {
        let ltopPath = 'M' + (dirx) * ty / 2 + ',' + (-diry) * tx / 2
                + 'l' + (dirx) * hx / 2 + ',' + (diry) * hy / 2
                + 'm' + (-dirx) * ty + ',' + (diry) * tx
                + 'l' + (-dirx) * hx / 2 + ',' + (-diry) * hy / 2
                + 'z';
        let ltop = document.createElementNS(SVGNS, "path");
        ltop.setAttribute('class', 'tcol_' + thread);
        ltop.setAttribute('d', ltopPath.replace('m', 'l'));
        let ltopb = document.createElementNS(SVGNS, "path");
        ltopb.setAttribute('class', 'border');
        ltopb.setAttribute('d', ltopPath);
        knotGroup.append(ltop);
        knotGroup.append(ltopb);
      }

      // let rtop = document.createElementNS(SVGNS, "path");
      // knotGroup.append(rtop)
      let tidx = index * 2 - (fullrow ? 0 : 1);
//    console.debug(k, index, tidx, threads);

      addThread(-1, -1, threads[tidx]);
      addThread(1, -1, threads[tidx + 1]);

      let knotcol = threads[tidx];
      switch (k) {
        case 2: // 'b'
          knotcol = threads[tidx + 1];
          //kein break!
        case 1: // 'f'
          // faeden tauschen
          let tmp = threads[tidx];
          threads[tidx] = threads[tidx + 1];
          threads[tidx + 1] = tmp;
          break;
        case 4: // 'bf'
          knotcol = threads[tidx + 1];
          break;
        case 3: // 'fb'
          // keine Aenderung
          break;
      }

      addThread(-1, 1, threads[tidx]);
      addThread(1, 1, threads[tidx + 1]);

      // let rtopPath = 'M'+ty/2+','+tx/2
      // +'l'+hx/2+',-'+hy/2
      // +'m-'+ty+',-'+tx
      // +'l-'+hx/2+','+hy/2
      // +'z';
      // let rtop = document.createElementNS(SVGNS, "path");
      // rtop.setAttribute('fill', 'red');
      // rtop.setAttribute('stroke', 'none');
      // rtop.setAttribute('d', rtopPath.replace('m','l'));
      // let rtopb = document.createElementNS(SVGNS, "path");
      // rtopb.setAttribute('fill', 'none');
      // rtopb.setAttribute('stroke', 'gray');
      // rtopb.setAttribute('d', rtopPath);
      // knotGroup.append(rtop)
      // knotGroup.append(rtopb)

      let knot = document.createElementNS(SVGNS, "circle");
      knot.setAttribute('class', 'tcol_' + knotcol);
      knot.setAttribute('cx', 0);
      knot.setAttribute('cy', 0);
      knot.setAttribute('r', radius);
      knotGroup.append(knot);
      let knotb = document.createElementNS(SVGNS, "circle");
      knotb.setAttribute('class', 'border');
      //knotb.setAttribute('stroke', 'none');
      knotb.setAttribute('cx', 0);
      knotb.setAttribute('cy', 0);
      knotb.setAttribute('r', radius);
      knotGroup.append(knotb);

      const types = ['-', 'f', 'b', 'fb', 'bf'];
      let arrow = document.createElementNS(SVGNS, "use");
      arrow.setAttribute('href', '#knot_' + types[k]);
      knotGroup.append(arrow);

      //knotGroup.append(devcross);

      rowGroup.append(knotGroup);
      //x+=deltaX;
      ++index;
    }
    return rowGroup;
  }

  function createArrows() {
    const arrows = new DocumentFragment();

    const au = radius / 6; // arrow unit

    const arrowpath =
            'l' + au + ',-' + au
            + 'l' + au + ',' + au
            + 'l-' + 2 * au + ',' + 2 * au
            //+'h-'+2*au
            //a7.5,7.5,1,0,1,-10,0
            + 'a' + 1.5 * au + ',' + 1.5 * au + ',1,0,1,' + au * -2 + ',0'
            + 'l-' + 2 * au + ',-' + 2 * au + ',' + au + ',-' + au + ',' + au + ',' + au
            + 'z';

    let straight = document.createElementNS(SVGNS, "path");
    straight.setAttribute('id', 'arrowstraight');
    straight.setAttribute('d',
            'M-' + au + ',-' + 4 * au + 'h' + 2 * au + 'v' + 6 * au
            + arrowpath);
    arrows.append(straight);
    let corner = document.createElementNS(SVGNS, "path");
    corner.setAttribute('id', 'arrowcorner');
    corner.setAttribute('d',
            'M-' + au + ',0h-' + 3 * au + 'v-' + 2 * au + 'h' + 5 * au + 'v' + 4 * au
            + arrowpath);
    arrows.append(corner);

    function addDirection(name) {
      let g = document.createElementNS(SVGNS, "g");
      g.id = 'knot_' + name;
      let template = 'arrow';
      switch (name) {
        case 'f':
          template = 'arrowstraight';
          g.setAttribute('transform',
                  ' scale(.8)'
                  + ' rotate(-45)'
                  );
          break;
        case 'b':
          template = 'arrowstraight';
          g.setAttribute('transform',
                  ' scale(.8)'
                  + ' rotate(45)'
                  );
          break;
        case 'fb':
          template = 'arrowcorner';
          g.setAttribute('transform',
                  ' scale(.8)'
                  + ' translate(5,0)'
                  + ' rotate(45)'
                  );
          break;
        case 'bf':
          template = 'arrowcorner';
          g.setAttribute('transform',
                  ' scale(-.8,.8)'
                  + ' translate(5,0)'
                  + ' rotate(45)'
                  );
          break;
      }
      let u1 = document.createElementNS(SVGNS, "use");
      u1.setAttribute('class', 'arrow');
      u1.setAttribute('href', '#' + template);
      g.append(u1);
      let u2 = document.createElementNS(SVGNS, "use");
      u2.setAttribute('class', 'aborder');
      u2.setAttribute('href', '#' + template);
      g.append(u2);
      arrows.append(g);
    }

    addDirection('f');
    addDirection('b');
    addDirection('fb');
    addDirection('bf');

    return arrows;
  }

  let pattern = config.pattern;
  let threads = [...config.threads];
  let colors = config.colors;

  console.debug(LOGGER, 'colors', colors);
  console.debug(LOGGER, 'threads', threads);
  console.debug(LOGGER, 'pattern', pattern);

  let threadCount = pattern[0].length;
  let rowCount = pattern.length;
  //console.debug(LOGGER, threadCount, 'x', rowCount);


  let width = Math.floor(threadCount * deltaX) + 2 * borderX;
  let height = Math.floor((rowCount + 1) * deltaY + 3 * textheight);
  const svg = createSvgSkeleton(width, height, config);

  let defs = document.createElementNS(SVGNS, "defs");
  let arrows = createArrows();
  defs.append(arrows);
  let styles = createStyles(colors, radius);
  defs.append(styles);
  svg.append(defs);

  let rowgroup = document.createElementNS(SVGNS, "g");
  rowgroup.setAttribute('transform', 'translate(0,' + textheight + ')');
  svg.append(rowgroup);

  let current = threads;

  let y = deltaY / 2;
  let rownum = 1;
  for (let r of pattern) {
    rowgroup.append(document.createComment(current.join('')));
    let row = addRow(rownum++, r, r.length === threadCount, current);
    row.setAttribute('transform', 'translate(' + borderX + ',' + y + ')');
    rowgroup.append(row);

    y += deltaY;
  }
  rowgroup.append(document.createComment(current.join('')));

  function _mkText(text, x, y) {
    const element = document.createElementNS(SVGNS, "text");
    element.textContent = text;
    element.setAttribute('x', x);
    element.setAttribute('y', y);
    return element;
  }

  let overflow = document.createElementNS(SVGNS, 'g');
  overflow.setAttribute('transform', 'translate(' + borderX + ',0)');
  overflow.setAttribute('class', 'overflow');
  let acode = Number(0x24d0);
  let idx = 0;
  for (let idx = 0; idx < threadCount; idx++) {
    let OA = _mkText(String.fromCodePoint(acode + idx), hx + deltaX * idx, textheight * 1.5);
    overflow.append(OA);
  }
  svg.append(overflow);
  overflow = overflow.cloneNode(true);
  overflow.setAttribute('transform', 'translate(' + borderX + ',' + (y + textheight * 1.5) + ')');
  svg.append(overflow);

  const copy = _mkText('© 2023 braceletview by nigjo', 4, height - textheight / 2);
  copy.setAttribute('class', 'hint');
  svg.append(copy);

  const root = new DocumentFragment();
  root.append(svg);
//  console.debug(LOGGER, svg);
  return root;
}

function createSvgSkeleton(width, height, config) {
  let svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
  svg.setAttribute('version', "1.0");
  addMetadataToSvg(svg, config);

  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  svg.setAttribute("viewBox",
          [0, 0, width, height].join(' '));
  svg.setAttribute("preserveAspectRatio", "xMinYMin meet");

  return svg;
}

let _counter = 1;

export function createSmallView(config, scaleX = 3, scaleY = 4) {

  if (!scaleX || scaleX === 0 || !scaleY || scaleY === 0) {
    console.error(LOGGER, "invalid scaling factor", scaleX, scaleY);
    return null;
  }

  const SV_RX = 5;
  //const SV_RY = SV_RX * 2 / 3;
//  const SV_RY = SV_RX * 3 / 4;
  const SV_RY = SV_RX * scaleY / scaleX;
//  const SV_RY = SV_RX;

  const SV_DELTA_X = 1.75 * SV_RX;
  const SV_DELTA_Y = 2 * SV_RY;

  const SV_MAX_LENGTH = 100;

  function addRow(row, fullrow, threads) {
    let rowGroup = document.createElementNS(SVGNS, "g");
    //let x = fullrow ? 0 : (deltaX / 2);
    let index = fullrow ? 0 : 1;
    //console.debug('ADDROW', threads);

    let y = SV_DELTA_Y * (row.length - 1) - fullrow ? 0 : SV_RY;

    for (let k of row) {
      let tidx = index * 2 - (fullrow ? 0 : 1);
      let knotcol = threads[tidx];
      switch (k) {
        case 2: // 'b'
          knotcol = threads[tidx + 1];
          //kein break!
        case 1: // 'f'
          // faeden tauschen
          let tmp = threads[tidx];
          threads[tidx] = threads[tidx + 1];
          threads[tidx + 1] = tmp;
          break;
        case 4: // 'bf'
          knotcol = threads[tidx + 1];
          break;
        case 3: // 'fb'
          // keine Aenderung
          break;
      }

      let knotGroup = document.createElementNS(SVGNS, "g");
      knotGroup.setAttribute('transform',
              'translate(' + 0 + ',' + y + ')');
//        <ellipse cx="0" cy="0" rx="30" ry="20" class="tcol_A"></ellipse>        
//        <ellipse cx="0" cy="0" rx="30" ry="20" class="border" stroke="none"></ellipse>      
      let knot = document.createElementNS(SVGNS, "ellipse");
      knot.setAttribute("cx", 0);
      knot.setAttribute("cy", 0);
      knot.setAttribute("rx", SV_RX);
      knot.setAttribute("ry", SV_RY);
      knot.setAttribute("class", "tcol_" + knotcol);//TODO:farbe?
      knotGroup.append(knot);
      let knotb = knot.cloneNode();
      knotb.setAttribute("class", "border");
      knotGroup.append(knotb);

      rowGroup.append(knotGroup);

      y -= SV_DELTA_Y;
      ++index;
    }
    return rowGroup;
  }

  let pattern = config.pattern;
  let threads = [...config.threads];
  let colors = config.colors;

  console.debug(LOGGER, 'colors', colors);
  console.debug(LOGGER, 'threads', threads);
  console.debug(LOGGER, 'pattern', pattern);

  let threadCount = pattern[0].length;
  let rowCount = pattern.length;
  //console.debug(LOGGER, threadCount, 'x', rowCount);
  let maxrows = Math.max(SV_MAX_LENGTH, Math.floor(rowCount * 1.5));

  let width = Math.floor((maxrows + 1) * SV_DELTA_X);
  let height = Math.floor((threadCount + 1) * SV_DELTA_Y + 24);
  const svg = createSvgSkeleton(width, height, config);

  let defs = document.createElementNS(SVGNS, "defs");
  //let arrows = createArrows();
  //defs.append(arrows);
  let styles = createStyles(colors, SV_RX);
  defs.append(styles);
  svg.append(defs);

  let rowgroup = document.createElementNS(SVGNS, "g");
  svg.append(rowgroup);

  let current = threads;

  let x = SV_RX * 1.5;
  let y = SV_DELTA_Y * (pattern[0].length);
  let ymax = y * 2 - SV_RY;
  do {
    for (let r of pattern) {
      rowgroup.append(document.createComment(current.join('')));
      let row = addRow(r, r.length === threadCount, current);
      row.setAttribute('transform', 'translate(' + x + ',' + y + ')');
      rowgroup.append(row);
      x += SV_DELTA_X;
      y = ymax - y;
      if (--maxrows <= 0)
        break;
    }
    if (maxrows <= 0)
      break;
  } while (true);
  rowgroup.append(document.createComment(current.join('')));

  const copy = document.createElementNS(SVGNS, "text");
  copy.textContent = '© 2023 braceletview by nigjo';
  copy.setAttribute('class', 'hint');
  copy.setAttribute('x', 4);
  copy.setAttribute('y', height - 8);
  svg.append(copy);

  const root = new DocumentFragment();
  root.append(svg);
//  console.debug(LOGGER, svg);
  return root;
}

function createStyles(colors, radius) {

  let css = '';
  let rules = {
    'text': {
      'font-family': 'sans-serif',
      'font-size': textheight + 'px'
    },
    'text.hint': {
      'fill': 'lightgray'
    },
    '.border': {
      'fill': 'none',
      'stroke': 'gray',
      'stroke-width': radius / 8
    },
    '.rowmark': {
      'stroke-dasharray': '10 5'
    },
    'text.rowmark': {
      'fill': 'gray'
    },
    '.arrow': {
      'fill': 'lightgray',
      'stroke': 'none'
    },
    '.aborder': {
      'fill': 'none',
      'stroke': 'gray',
      'stroke-width': radius / 12
    },
    '.overflow text': {
      'font-size': Math.floor(textheight * 1.5) + 'px',
      'fill': 'gray',
      'text-anchor': 'middle'
    }
  };

  let acode = Number("A".charCodeAt(0));
  for (const i in colors) {
    //console.debug('COLORS', colors[i]);
    rules['.tcol_' + String.fromCodePoint(acode + Number(i))] = {
      'fill': '#' + (colors[i].replace('#', '')).toString(16).padStart(6, '0')
    };
  }

  for (const [s, r] of Object.entries(rules)) {
    css += s + '{';
    for (const [k, v] of Object.entries(r)) {
      css += '\n' + k + ':' + v + ';';
    }
    css += '\n}';
  }

  let style = document.createElementNS(SVGNS, "style");
  style.textContent = css.replaceAll(/\n+\s*/gs,'');
  return style;
}

/**
 * @param {SVGSVGElement} svg
 * @param {Object} config
 * @returns {undefined}
 */
function addMetadataToSvg(svg, config) {
  let meta = svg.querySelector("metadata");
  if (!meta) {
    meta = document.createElementNS(svg.namespaceURI, 'metadata');
    svg.insertAdjacentElement("afterbegin", meta);
    meta = svg.querySelector("metadata");
  }

  const NS_META = 'urn:de.nigjo:braceletview:config';
  meta.setAttribute('xmlns:bv', NS_META);

  let bvCreator = document.createElementNS(NS_META, 'bv:generator');
  bvCreator.textContent = 'BraceletViewer v0.1';
  meta.append(bvCreator);

  let bvCreated = document.createElementNS(NS_META, 'bv:created');
  if (config.meta && "created" in config.meta) {
    bvCreated.textContent = config.meta.created;
  } else {
    bvCreated.textContent = new Date().toISOString();
  }
  meta.append(bvCreated);

  if (config.meta) {
    for (let key of Object.keys(config.meta)) {
      let old =
              meta.querySelector('bv\\:' + key) || meta.querySelector(key);
      if (!old) {
        let bvProperty = document.createElementNS(NS_META, 'bv:' + key);
        bvProperty.textContent = config.meta[key];
        meta.append(bvProperty);
      }
    }
  }
}

//export {createSmallView,createNormalPatternView};
