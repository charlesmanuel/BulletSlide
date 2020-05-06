$(document).ready(function(){


  class Point {
    type = "text";
    content = "";
    hasSubpoint = false;
    hasSubimg = false;
    hasLink = false;
    linktext = "";
    subpts = [];

    constructor(textfield) {
      this.content = $(textfield).val();

      if ($(textfield).hasClass("imgiconadded")){
        this.hasSubimg = true;
      }
      if ($(textfield).hasClass("texticonadded")){
        this.hasSubpoint = true;
      }
      if ($(textfield).hasClass("linkiconadded")){
        this.hasLink = true;
        var linkvar = $(textfield).next();
        var linkvartext = $(linkvar).attr("href");
        this.linktext = linkvartext;
      }
    }

    addpt(inPoint){
      this.subpts.push(inPoint);
    }

    hasChildren(){
      if (this.hasSubpoint == true || this.hasSubimg == true){
        return true;
      }
      else {
        return false;
      }
    }

  };

  class Image {
    type = "img";
    path = "";
    constructor(path) {
      this.path = path;
    }
  };

  function collect(parentObject, parentText) {
    $(parentText).siblings(".point").each(function(){
      if ($(this).attr('id') == "secretimg"){
        var inputLocation = $(this).find("input");
        var path = inputLocation.val();
        inImg = new Image(path);
        parentObject.addpt(inImg);
      }
      else {
        var textfield = $(this).find("textarea:first");
        newPoint = new Point(textfield);
        parentObject.addpt(newPoint);
        if (newPoint.hasChildren()){
          collect(newPoint, textfield);
        }
      }
    });
  }


  $("#savepreview").click(function(){
    var title = $.trim($("#intitle").html());
    console.log(title);
    var author = $.trim($("#inauthor").html());
    console.log(author);
    var masterarray = {"title": title, "author": author, "listitems":[]};
    $("li.point").each(function() {
      var textfield = $(this).children("textarea:first");
      var content = textfield.val();
      inpoint = new Point(textfield);
      if (inpoint.hasChildren()){
        collect(inpoint, textfield);
      }
      masterarray.listitems.push(inpoint);
    });

    var inputdata = JSON.stringify(masterarray, null, '\t');

    $.post("/editor", masterarray);
  });
});
