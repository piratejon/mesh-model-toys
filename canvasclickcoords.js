
/***
From "How do I get the coordinates of a mouse click on a canvas element?" <http://stackoverflow.com/a/5932203> accessed 14 March 2013 at 00:07 CDT
Question by: StackOverflow user "Tom"<http://stackoverflow.com/users/3715/tom>
Answer by: StackOverflow user "Ryan Artecona" <http://stackoverflow.com/users/671915/ryan-artecona>
Attributed in accordance with <http://stackoverflow.com/questions/4530182/using-code-from-this-site> as accessed 14 March 2013 at 00:13 CDT
  ***/
function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

