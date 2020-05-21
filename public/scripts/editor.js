

$(document).ready(function(){
  //hide all pre-generated dropdown menus
  $(".test").focusout(function(){
      var element = $(this);
      if (!element.text().replace(" ", "").length) {
          element.empty();
      }
  });

  //adds text icon to textfield, adds copy of sub bullet underneath
  $('.textbutton').click(function(){
    var currentli = $(this).closest("li");
    var currenttext = $(currentli).children(".test2");

    if (!currenttext.hasClass("texticonadded")){
      var myNumber = $(currenttext).data('icons');
      myNumber = myNumber + 1;
      $(currenttext).data('icons', myNumber);
    }

    $(currenttext).addClass("texticonadded");

    var subpt = $("#secretul").clone(true);
    $(subpt).css("display", "block");
    $(subpt).addClass("point")
    $(this).closest("li").append(subpt);
    $(this).closest(".dropdown-content").hide();


  });

  //add image
  $('.imgbutton').click(function(){
    var currentli = $(this).closest("li");
    var currenttext = $(currentli).children(".test2");

    if (!currenttext.hasClass("imgiconadded")){
      var myNumber = $(currenttext).data('icons');
      myNumber = myNumber + 1;
      $(currenttext).data('icons', myNumber);
    }

    $(currenttext).addClass("imgiconadded");

    var subimg = $("#secretimg").clone(true);
    $(subimg).css("display", "block");
    $(subimg).addClass("point");
    $(this).closest("li").append(subimg);

  });

  //opens up modal link input window, preps input list to receive link
  $('.linkbtn').click(function(){
    var currentli = $(this).closest("li");
    var currenttext = $(currentli).children(".test2");

    var linkvar = $(currenttext).next();
    var linktext = $(linkvar).attr("href");

    if (linktext!="#") {
      $('#inputURL').val(linktext);
    }
    else {
      $('#inputURL').val("");
    }

    $(currenttext).addClass("awaitingLink");
    $("#myModal").css("display", "block");
  });

  //cancel button for link popup
  $('#cancellink').click(function(){
    var linkwaiter = $(".awaitingLink");
    $(linkwaiter).removeClass("awaitingLink");
    $("#myModal").css("display", "none");
  });
  //submit button for link popup
  $('#submitlink').click(function(){
    var intext = $('#inputURL').val();
    if (intext == "") {
      intext = "#";
    }
    $("#myModal").css("display", "none");
    var linkwaiter = $(".awaitingLink");

    var linkvar = $(linkwaiter).next();
    $(linkvar).attr("href", intext);



    if (intext !== "#"){
      linkwaiter.addClass("linkiconadded");
    }
    else {
      linkwaiter.removeClass("linkiconadded");
    }

    $(linkwaiter).removeClass("awaitingLink");

  });

  //Function to remove bulletpoint upon clicking minus symbol
  $('.minusbutton').click(function(){

    var minustype = "";

    if ($(this).siblings(".addbutton").length == 0) {
      minustype = "img";
      var parentsecretimg = $(this).closest("li").parent("#secretimg");

      var parenttext = $(parentsecretimg).siblings("textarea");
      $(parentsecretimg).remove();
    }
    else {
      minustype = "txt";
      var parentsecretul = $(this).closest("li").parent("#secretul");
      var parenttext = $(parentsecretul).siblings("textarea");
      $(parentsecretul).remove();
    }


    $(this).closest("li").remove();
    return(minusCheck(minustype, parenttext));

  });

  $('#share').click(function(){
    var checkURL = window.location.href;
    var checkURL2 = checkURL.split("#");
    var checkURL3 = checkURL2[0];
    var checkURL4 = checkURL3.split("editor");
    var checkURL5 = checkURL4[0];
    var theURL = checkURL5 + 'preview';
    $("#shareURL").val(theURL);
    $("#shareModal").css("display", "block");
    $("#shareURL").select();
  });

  $('#cancelShare').click(function(){
    $("#shareModal").css("display", "none");
  });
  $('#submitShare').click(function(){
    var checkURL = window.location.href;
    var checkURL2 = checkURL.split("#");
    var checkURL3 = checkURL2[0];
    var checkURL4 = checkURL3.split("editor");
    var checkURL5 = checkURL4[0];
    var theURL = checkURL5 + 'share';
    $("#shareModal").css("display", "none");
    $.post(theURL);
  });

  //gets rid of img/text icon from parent textbox if there are no more matching items below
  function minusCheck(type, par){

    var istrue = $(par).hasClass("texticonadded");

    var imgnum = $(par).siblings("#secretimg").length;
    var txtnum = $(par).siblings("#secretul").length;

    if (type == "img" && imgnum == 0) {
      $(par).removeClass("imgiconadded");
    }
    else if (type == "txt" && txtnum == 0) {
      $(par).removeClass("texticonadded");
    }
  }

  //upon mouseover, dropdown content appears below "add button" (next to minus)
  $('.addbutton').mouseover(function(){
    var tt = $(this).siblings(".dropdown-content");
    if($(tt).is(":visible")) {
      $(tt).hide();
    }
    else {
      $(tt).show();
    }

  });

  //adds new main point to list via big button permanently at bottom
  $('.newpt2').click(function(){
    //$("<li><textarea class='test2' rows='1' placeholder='Bullet 3'></textarea><div class='btncol' align='left'><button class='btn btn-danger minusbutton' href='#'>&#x2212;</button><button class='btn btn-primary addbutton' href='#'>&#x22ef;</button></div></li>").appendTo( "#ultext");
    var nextpt = $( "#secretpt" ).clone(true);
    $(nextpt).css("display", "list-item");
    $(nextpt).addClass("point");
    $("#ultext").append(nextpt);
  });



});


$(window).on("load", function() {
  $("#focused").focus();
});

$(document).on("mouseover", function(event){
  var $trigger = $(".btncol");
  if($trigger !== event.target && !$trigger.has(event.target).length){
    $(".dropdown-content").hide();
  }
});
