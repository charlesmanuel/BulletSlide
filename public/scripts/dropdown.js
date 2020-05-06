$(document).ready(function(){
  $(".subpt").hide();
  $(".subimg").hide();
  $(".subtweet").hide();
  $('.drop').click(function(){
    var t = $(this).siblings(".subpt");
    if ($(t).is(":visible")) {
      $(t).hide(750);
    }
    else {
      $(t).show(750);
    }
  });

  $('.droptweet').click(function(){
    var tw = $(this).siblings(".subtweet");
    if ($(tw).is(":visible")) {
      $(tw).hide(750);
    }
    else {
      $(tw).show(750);
    }
  });

  $('.dropimg').click(function(){
    var z = $(this).siblings(".subimg");
    if ($(z).is(":visible")) {
      $(z).slideUp( 1000, "swing", function() {
    // Animation complete.
  });
    }
    else {
      $(z).slideDown( 1000, "swing", function() {
    // Animation complete.
  });
    }
  });
});
