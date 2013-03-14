
var G;

function Point (x, y)
{
  this.x = x;
  this.y = y;

  this.squared_distance_from = function ( pt )
  {
    return ((x-pt.x)*(x-pt.x)) + ((y-pt.y)*(y-pt.y));
  }

  this.distance_from = function ( pt )
  {
    return sqrt(this.squared_distance_from(pt));
  }
}

function RandomIntRange ( lower_bound, upper_bound )
{
  var lol = Math.floor((Math.random() * (upper_bound - lower_bound + 1)) + lower_bound);
  return lol;
}

function RandomPoint ( xrange, yrange )
{
  return new Point ( RandomIntRange ( 0, xrange ), RandomIntRange ( 0, yrange ) );
}

function QuadTree(pt)
{
  this.NW = null;
  this.NE = null;
  this.SW = null;
  this.SE = null;

  this.pt = pt;

  this.insert = function(pt)
  {
    if ( this.pt.squared_distance_from ( pt ) != 0 )
    {
      if ( pt.x > this.pt.x )
      {
        if ( pt.y > this.pt.y )
        {
          if ( this.NE ) this.NE.insert(pt);
          else this.NE = new QuadTree(pt);
        }
        else
        {
          if ( this.SE ) this.SE.insert(pt);
          else this.SE = new QuadTree(pt);
        }
      }
      else
      {
        if ( pt.y > this.pt.y )
        {
          if ( this.NW ) this.NW.insert(pt);
          else this.NW = new QuadTree(pt);
        }
        else
        {
          if ( this.SW ) this.SW.insert(pt);
          else this.SW = new QuadTree(pt);
        }
      }
    }
    else
    {
      // Duplicates not supported!
    }
  }

  this.depth_first_traversal = function ( fn )
  {
    if ( this.NW ) this.NW.depth_first_traversal ( fn );
    if ( this.NE ) this.NE.depth_first_traversal ( fn );
    if ( this.SW ) this.SW.depth_first_traversal ( fn );
    if ( this.SE ) this.SE.depth_first_traversal ( fn );
    if ( this.pt ) fn ( this.pt );
  }

  this.nearest_neighbor = function ( pt )
  {
    var min, tmp;

    min = { 'best': this.pt.squared_distance_from(pt), 'qt': this }

    if ( this.NW )
    {
      tmp = this.NW.nearest_neighbor ( pt );
      if ( tmp && tmp.best < min.best ) min = tmp;
    }

    if ( this.NE )
    {
      tmp = this.NE.nearest_neighbor ( pt );
      if ( tmp && tmp.best < min.best ) min = tmp;
    }

    if ( this.SW )
    {
      tmp = this.SW.nearest_neighbor ( pt );
      if ( tmp && tmp.best < min.best ) min = tmp;
    }

    if ( this.SE )
    {
      tmp = this.SE.nearest_neighbor ( pt );
      if ( tmp && tmp.best < min.best ) min = tmp;
    }

    return min;
  }
}

function canvas_click ( e )
{
  coords = G.canvas.relMouseCoords(e);
  closest_point = G.quadtree.nearest_neighbor ( new Point ( coords.x, coords.y ) );
  alert(closest_point.qt.pt.x + ' ' + closest_point.qt.pt.y);
}

function create_canvas ( width, height )
{
  var canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'map');
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
  canvas.addEventListener('click', function(e) { canvas_click(e); }, false);
  return canvas;
}

function __init__ ( x_dimension, y_dimension )
{
  G = new Object();
  G.width = x_dimension;
  G.height = y_dimension;
  G.canvas = create_canvas ( G.width, G.height );
  G.ctx = G.canvas.getContext('2d');
  document.getElementById('canvas_container').appendChild(G.canvas);
  G.quadtree = null;
  G.pixel = G.ctx.createImageData(1,1).data;
}

function plot_point ( pt )
{
  G.ctx.beginPath();
  G.ctx.arc(pt.x, pt.y, 3, 2*Math.PI, false);
  G.ctx.fillStyle = 'blue';
  G.ctx.fill();
}

function draw_quadtree ( qt )
{
  qt.depth_first_traversal ( plot_point );
}

function create_nodes ( count )
{
  var i = 0;

  if ( !G.quadtree && count > 0 ) 
  {
    G.quadtree = new QuadTree ( RandomPoint ( G.width, G.height ) );
    i = 1;
  }

  while ( i ++ < count )
  {
    G.quadtree.insert ( RandomPoint ( G.width, G.height ) );
  }

  if ( G.quadtree ) draw_quadtree ( G.quadtree );
}

