function (doc) {
  if (doc._id.indexOf('patent-') == 0) {
    emit(doc._id, doc);
  }
}
