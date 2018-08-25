const _ = {};

_.click = function(class) {
    [].forEach.call(document.querySelectorAll(class), function(el) {
  el.addEventListener('click', function() {
    // code…
  })
})
}