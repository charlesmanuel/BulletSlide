$(document).ready(function(){
  
  $(".subpt").hide();
  $(".subtweet").hide();
  $(".subimg").hide();

  /*
  function firstswitch() {
    $(".subimg").slideUp( 1000, "swing", function() {

    });
    $(".subpt").show(1000);
  }
  */

  function slideup() {
    $(".subimg").slideUp( 1000, "swing", function() {
    // Animation complete.
      });
    }


  function firstswitch() {
    $("#highlight2").removeClass("highlighted");
    $("#highlight3").addClass("highlighted");
    $(".subimg").slideDown(1000, "swing").delay(2000).slideUp(1000, "swing").delay(2000);
    setTimeout(secondswitch, 7000);
  }
  function secondswitch() {
    $("#highlight3").removeClass("highlighted");
    $("#highlight1").addClass("highlighted");
    $(".subpt").show(1000).delay(2000).hide(1000).delay(2000);
    setTimeout(thirdswitch, 7000);
  }
  function thirdswitch() {
    $("#highlight1").removeClass("highlighted");
    $("#highlight2").addClass("highlighted");
    $(".subtweet").show(1000).delay(2000).hide(1000);
    setTimeout(firstswitch, 7000);
  }

/*
  function thirdswitch() {
    $(".subtweet").hide(1000);
    $(".subimg").slideDown( 1000, "swing", function() {
    });
  }
  */

  firstswitch();

});
