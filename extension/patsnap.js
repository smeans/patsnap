function saveMeta(dl, o) {
  $.each($('dt', $(dl)), function () {
    var label = $(this).text().trim();
    var la = label.split('\n');
    o[la[0]] = $(this).next('dd').text().trim();
  });
}

function snapTable(id, va) {
  $(id).next('table').find('tr td>a').each(function () {
    va.push($(this).text().trim());
  });
}

function refreshPatent(doc) {
  doc.title = $('#title').text().trim();
  var pl = $("a:contains('Download PDF')");
  if (pl.length && pl.attr('href')) {
    doc.pdf_link = pl.attr('href');
  }

  if (!('metadata' in doc)) {
    doc.metadata = {};
  }

  saveMeta('.general-info', doc.metadata);
  saveMeta('.important-people', doc.metadata);
  saveMeta('.key-dates', doc.metadata);

  doc.cites = [];
  snapTable('#patentCitations', doc.cites);

  doc.cited_by = [];
  snapTable('#citedBy', doc.cited_by);

  $.ajax({
     type: "PUT",
     url: doc_url,
     contentType: "application/json",
     data: JSON.stringify(doc),
     dataType: "json",
     success: function (data) {
       $('.knowledge-card header h2').append('<span style="color: #0f0">&#x2713;</span>');
     }
    });
}

var DB_URL = "https://cox.getfleetcrm.com:6984/patsnap";
var doc_url;

function processPage() {
  $('.knowledge-card header h2').attr('data-processed', true);


  var patent_num = $('.knowledge-card header h2').text().trim();
  console.log('patent: ' + patent_num);

  doc_url = DB_URL + '/patent-' + patent_num;

  $.getJSON(doc_url)
    .done (function (data) {
      refreshPatent(data);
    })
    .fail(function () {
      doc = {patent_num: patent_num};
      refreshPatent(doc);
    });
}

function checkPage() {
  if ($('.knowledge-card header h2').attr('data-processed')) {
    return;
  }

  processPage();
}

checkPage();
setInterval(checkPage, 250);
