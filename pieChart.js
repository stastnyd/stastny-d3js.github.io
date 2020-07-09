const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5)};
document.cookie = "username=John Doe";
// kreiranje svg containera
const svg = d3.select('.canvas')
  .append('svg')
  .attr('width', dims.width + 150)
  .attr('height', dims.height + 150);

const graph = svg.append('g')
  .attr("transform", `translate(${cent.x}, ${cent.y})`);
  // centriranje grupe 

const pie = d3.pie()
  .sort(null)
  .value(d => d.cost);
  // vrijednosti koje kreiraju kuteve od podataka

const arcPath = d3.arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

// Set boja
const colour = d3.scaleOrdinal(d3["schemeSet2"]);

// legenda
const legendGroup = svg.append('g')
  .attr('transform', `translate(${dims.width + 40}, 10)`)

const legend = d3.legendColor()
  .shape('path', d3.symbol().type(d3.symbolCircle)())
  .shapePadding(20)
  .scale(colour);

const tip = d3.tip()
  .attr('class', 'tip-card')
  .html(d => {
    let content = `<div class="name">${d.data.name}</div>`;
    content += `<div class="cost">${d.data.cost} kn</div>`;
    content += `<div class="delete">Click slice to delete</div>`
    return content;
  });

graph.call(tip);

// funkcija azuriranja podataka
const update = (data) => {

  // azuriranje boja
  colour.domain(data.map(d => d.name));

  // azuriranje legende
  legendGroup.call(legend);
  legendGroup.selectAll('text').attr('fill', 'black');
  
  
  // pridruzivanje podataka grafikonu
  const paths = graph.selectAll('path')
    .data(pie(data));

 // exit selection 
  paths.exit()
    .transition().duration(750)
    .attrTween("d", arcTweenExit)
    .remove();

// azuriranje trenutnih DOM pathova
  paths.transition().duration(750)
    .attrTween("d", arcTweenUpdate);

  paths.enter()
    .append('path')
      .attr('class', 'arc')
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('fill', d => colour(d.data.name))
      .each(function(d){ this._current = d })
      .transition().duration(750).attrTween("d", arcTweenEnter);

  // Dodavanje evenata
  graph.selectAll('path')
    .on('mouseover', (d,i,n) => {
      tip.show(d, n[i]);
      handleMouseOver(d, i, n);
    })
    .on('mouseout', (d,i,n) => {
      tip.hide();
      handleMouseOut(d, i, n);
    })
    .on('click', handleClick);

};

// niz podataka i firestore
var data = [];

db.collection('food').orderBy('cost').onSnapshot(res => {

  res.docChanges().forEach(change => {

    const doc = {...change.doc.data(), id: change.doc.id};

    switch (change.type) {
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => item.id == doc.id);
        data[index] = doc;
        break;
      case 'removed':
        data = data.filter(item => item.id !== doc.id);
        break;
      default:
        break;
    }

  });

  // pozivanje funkcije azuriranja
  update(data);

});

const arcTweenEnter = (d) => {
  var i = d3.interpolate(d.endAngle, d.startAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  var i = d3.interpolate(d.startAngle, d.endAngle);

  return function(t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// koristenje ES5 sintakse zbog 'this'
function arcTweenUpdate(d) {
  // interpolacija izmedu objekata
  var i = d3.interpolate(this._current, d);
  // azuriranje trenutnog svojstva s novim podacima
  this._current = i(1);

  return function(t) {
    // i(t) vraca vrijednost d (data object) koju proslijedujemo arcPath
    return arcPath(i(t));
  };
};


const handleMouseOver = (d,i,n) => {

  d3.select(n[i])
    .transition('changeSliceFill').duration(300)
      .attr('fill', '#fff');
};

const handleMouseOut = (d,i,n) => {
  d3.select(n[i])
    .transition('changeSliceFill').duration(300)
      .attr('fill', colour(d.data.name));
};

const handleClick = (d) => {
  const id = d.data.id;
  db.collection('food').doc(id).delete();
};