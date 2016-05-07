var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .linkDistance(10)
    .linkStrength(2)
    .size([width, height]);

var svg = d3.select("svg");

var patents;

function showInfo(d) {
  $('.node').removeClass('focus');
  $(this).addClass('focus');

  d3.select('.title')
    .text(d.title ? d.patent_num + ': ' + d.title : d.patent_num)
    .attr('href', 'https://patents.google.com/patent/' + d.patent_num);

  if (d.pdf_link) {
    $('.pdf_link').attr('href', d.pdf_link).removeClass('hidden');
  } else {
    $('.pdf_link').addClass('hidden');
  }

  $('.info label').each(function () {
    var key = $(this).text();

    if (key in d.metadata) {
      $(this).next('span').text(d.metadata[key]);
    }
  });
}

d3.json("../../_design/patsnap/_view/patents?include_docs=true", function(error, data) {
  if (error) throw error;

  var nodes = [],
      links = [],
      bilinks = [];

  patents = {};
  data.rows.forEach(function(row){
    nodes.push(row.doc);
    patents[row.doc.patent_num] = row.doc;
  });

  var inodes = [];
  nodes.forEach(function(patent) {
    patent.cites.forEach(function (num) {
      if (num in patents) {
        var s = patent,
            t = patents[num],
            i = {}; // intermediate node
        inodes.push(i);
        links.push({source: s, target: i}, {source: i, target: t});
        bilinks.push([s, i, t]);
      }
    });
  });

  nodes = nodes.concat(inodes);

  force
      .nodes(nodes)
      .links(links)
      .linkDistance(30)
      .start();

  var link = svg.selectAll(".link")
      .data(bilinks)
      .enter().append("path")
      .attr("class", "link");

  var node = svg.selectAll(".node")
      .data(nodes)
      .enter().append("circle")
      .attr("class", function (d) {
        return d.patent_num ? 'node' : 'i';
      })
      .attr("xlink:title", function (d) {
        return d.title;
      })
      .attr("r", function (d) {
        return 5 + (d.cited_by && d.cited_by.length ? Math.log(d.cited_by.length) : 0);
      })
      .call(force.drag)
      .on("click", showInfo);

  node.append("title")
      .text(function(d) { return d.title ? d.patent_num + ': ' + d.title : d.patent_num; });

  force.on("tick", function() {
    link.attr("d", function(d) {
      return "M" + d[0].x + "," + d[0].y
          + "S" + d[1].x + "," + d[1].y
          + " " + d[2].x + "," + d[2].y;
    });
    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  });
});
