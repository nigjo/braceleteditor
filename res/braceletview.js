const SVGNS = "http://www.w3.org/2000/svg";
const LOGGER = "VIEW";

const radius = 30;
const deltaX = Math.floor(radius * 4);
const deltaY = Math.floor(radius * 2);

const hx = deltaX / 2; // height-X
const hy = deltaY; // height-Y
const tx = hx / 4; // thread-X
const ty = hy / 4; // thread-Y

/**
 * @param config Object mit allen Einstellungen
 */
export function createNormalPatternView(config) {

  let pattern = config.pattern;
  let threads = [...config.threads];
  let colors = config.colors;

  console.debug(LOGGER, 'colors', colors);
  console.debug(LOGGER, 'threads', threads);
  console.debug(LOGGER, 'pattern', pattern);

  let threadCount = pattern[0].length;
  let rowCount = pattern.length;
  //console.debug(LOGGER, threadCount, 'x', rowCount);

  const root = new DocumentFragment();
  let svg = document.createElementNS(SVGNS, "svg");
  svg.setAttribute('xmlns', "http://www.w3.org/2000/svg");
  svg.setAttribute('version', "1.0");

  let width = Math.floor(threadCount * deltaX) + 2 * 20;
  let height = Math.floor((rowCount + 1) * deltaY + 16);

  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  svg.setAttribute("viewBox",
          [0, 0, width, height].join(' '));

  let defs = document.createElementNS(SVGNS, "defs");
  let arrows = createArrows();
  defs.append(arrows);
  let styles = createStyles(colors);
  defs.append(styles);
  svg.append(defs);

  let rowgroup = document.createElementNS(SVGNS, "g");
  svg.append(rowgroup);

  let current = threads;

  let y = deltaY / 2;
  let rownum = 1;
  for (let r of pattern) {
    rowgroup.append(document.createComment(current.join('')));
    let row = addRow(rownum++, r, r.length === threadCount, current);
    row.setAttribute('transform', 'translate(' + 20 + ',' + y + ')');
    rowgroup.append(row);

    y += deltaY;
  }
  rowgroup.append(document.createComment(current.join('')));

  const copy = document.createElementNS(SVGNS, "text");
  copy.textContent = '© 2023 braceletview by nigjo';
  copy.setAttribute('class', 'hint');
  copy.setAttribute('x', 4);
  copy.setAttribute('y', height - 16);
  svg.append(copy);

  root.append(svg);
//  console.debug(LOGGER, svg);
  return root;
}

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
    knotb.setAttribute('stroke', 'none');
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

export function createSmallView(pattern, threads) {
  const root = new DocumentFragment();
  let svg = document.createElementNS(SVGNS, "svg");

  root.append(svg);
  return root;
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

function createStyles(colors) {

  let css = '';
  const rules = {
    'text': {
      'font-family': 'sans-serif',
      'font-size': '16px'
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
  style.textContent = css;
  return style;
}



//export {createSmallView,createNormalPatternView};
