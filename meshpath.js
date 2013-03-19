/*jslint browser:true */
/*global guid*/

var meshpath = (function () {
    "use strict";

    var G, NORMAL_COLOR, SOURCE_COLOR, DEST_COLOR, NEIGHBOR_COLOR, DEFAULT_RADIUS;

    NORMAL_COLOR = '#0000ff';
    SOURCE_COLOR = '#00ff00';
    DEST_COLOR   = '#ff0000';
    NEIGHBOR_COLOR = '#ff8000';
    DEFAULT_RADIUS = 25;

    function ReceiveEvent(dst, packet) {
        this.dst = dst;
        this.packet = packet;
    }

    function Point(x, y, color, radius) {
        this.x = x;
        this.y = y;
        this.color = color === undefined ? NORMAL_COLOR : color;
        this.radius = radius === undefined ? DEFAULT_RADIUS : radius;
        this.guid = guid();

        this.squared_distance_from = function (pt) {
            return ((x - pt.x) * (x - pt.x)) + ((y - pt.y) * (y - pt.y));
        };

        this.distance_from = function (pt) {
            return Math.sqrt(this.squared_distance_from(pt));
        };

        this.toString = function () {
            return '(' + this.x + ',' + this.y + ')';
        };
    }

    function randomIntRange(lower_bound, upper_bound) {
        return Math.floor((Math.random() * (upper_bound - lower_bound + 1)) + lower_bound);
    }

    function randomPoint(xrange, yrange) {
        return new Point(randomIntRange(0, xrange), randomIntRange(0, yrange));
    }

    function get_neighbors_in_radius(qt, pt, radius) {
        var neighborhood = [];

        if (qt) {
            if (qt.pt.squared_distance_from(pt) < radius * radius) {
                neighborhood.push(qt);
            }

            neighborhood.push.apply(neighborhood, get_neighbors_in_radius(qt.NW, pt, radius));
            neighborhood.push.apply(neighborhood, get_neighbors_in_radius(qt.NE, pt, radius));
            neighborhood.push.apply(neighborhood, get_neighbors_in_radius(qt.SW, pt, radius));
            neighborhood.push.apply(neighborhood, get_neighbors_in_radius(qt.SE, pt, radius));
        }

        return neighborhood;
    }

    function get_neighbors(qt, pt) {
        return get_neighbors_in_radius(qt, pt, pt.radius);
    }

    function QuadTree(pt) {
        this.NW = null;
        this.NE = null;
        this.SW = null;
        this.SE = null;

        this.pt = pt;
        pt.qt = this;

        this.toString = function () {
            return this.pt.toString() + ':' + this.pt.guid;
        };

        this.insert = function (pt) {
            if (this.pt.squared_distance_from(pt) !== 0) {
                if (pt.x > this.pt.x) {
                    if (pt.y > this.pt.y) {
                        if (this.NE) {
                            this.NE.insert(pt);
                        } else {
                            this.NE = new QuadTree(pt);
                        }
                    } else {
                        if (this.SE) {
                            this.SE.insert(pt);
                        } else {
                            this.SE = new QuadTree(pt);
                        }
                    }
                } else {
                    if (pt.y > this.pt.y) {
                        if (this.NW) {
                            this.NW.insert(pt);
                        } else {
                            this.NW = new QuadTree(pt);
                        }
                    } else {
                        if (this.SW) {
                            this.SW.insert(pt);
                        } else {
                            this.SW = new QuadTree(pt);
                        }
                    }
                }
            // } else {
                // Duplicates silently dropped!
                // Doug hates empty blocks!
            }
        };

        this.depth_first_traversal = function (fn) {
            if (this.NW) {
                this.NW.depth_first_traversal(fn);
            }
            if (this.NE) {
                this.NE.depth_first_traversal(fn);
            }
            if (this.SW) {
                this.SW.depth_first_traversal(fn);
            }
            if (this.SE) {
                this.SE.depth_first_traversal(fn);
            }
            if (this.pt) {
                return fn(this.pt);
            }
        };

        this.nearest_neighbor = function (pt) {
            var min, tmp;

            min = { 'best': this.pt.squared_distance_from(pt), 'qt': this };

            if (this.NW) {
                tmp = this.NW.nearest_neighbor(pt);
                if (tmp && tmp.best < min.best) {
                    min = tmp;
                }
            }

            if (this.NE) {
                tmp = this.NE.nearest_neighbor(pt);
                if (tmp && tmp.best < min.best) {
                    min = tmp;
                }
            }

            if (this.SW) {
                tmp = this.SW.nearest_neighbor(pt);
                if (tmp && tmp.best < min.best) {
                    min = tmp;
                }
            }

            if (this.SE) {
                tmp = this.SE.nearest_neighbor(pt);
                if (tmp && tmp.best < min.best) {
                    min = tmp;
                }
            }

            return min;
        };

        this.broadcast = function (packet) {
            var i, neighbors, event_queue;
            event_queue = [];
            neighbors = get_neighbors(G.quadtree, this.pt);
            for (i = 0; i < neighbors.length; i += 1) {
                if (this !== neighbors[i]) {
                    event_queue.push(new ReceiveEvent(neighbors[i], packet));
                }
            }

            return event_queue;
        };
    }

    function plot_point(pt) {
        G.ctx.beginPath();
        G.ctx.arc(pt.x, pt.y, 3, 2 * Math.PI, false);
        G.ctx.fillStyle = pt.color;
        G.ctx.fill();
    }

    function highlight_neighbors(pt, color, radius) {
        var neighbors, i;
        neighbors = get_neighbors_in_radius(G.quadtree, pt, radius === undefined ? pt.radius : radius);
        for (i = 0; i < neighbors.length; i += 1) {
            neighbors[i].pt.color = color === undefined ? NEIGHBOR_COLOR : color;
            plot_point(neighbors[i].pt);
        }
    }

    function canvas_click(e) {
        if (G.quadtree) {
            var coords, closest_point;

            coords = G.canvas.relMouseCoords(e);
            closest_point = G.quadtree.nearest_neighbor(new Point(coords.x, coords.y));

            if (closest_point.qt === G.src) {
                highlight_neighbors(G.src.pt, NORMAL_COLOR);
                G.src = null;
                closest_point.qt.pt.color = NORMAL_COLOR;
                G.src_node.innerHTML = '(none)';
            } else if (closest_point.qt === G.dst) {
                highlight_neighbors(G.dst.pt, NORMAL_COLOR);
                G.dst = null;
                closest_point.qt.pt.color = NORMAL_COLOR;
                G.dst_node.innerHTML = '(none)';
            } else if (null === G.src) {
                G.src = closest_point.qt;
                highlight_neighbors(G.src.pt, NEIGHBOR_COLOR);
                G.src.pt.color = SOURCE_COLOR;
                G.src_node.innerHTML = G.src.toString();
            } else if (null === G.dst) {
                G.dst = closest_point.qt;
                highlight_neighbors(G.dst.pt, NEIGHBOR_COLOR);
                G.dst.pt.color = DEST_COLOR;
                G.dst_node.innerHTML = G.dst.toString();
            } else {
                G.dst.pt.color = NORMAL_COLOR;
                highlight_neighbors(G.dst.pt, NORMAL_COLOR);
                plot_point(G.dst.pt);
                G.dst = closest_point.qt;
                highlight_neighbors(G.dst.pt, NEIGHBOR_COLOR);
                G.dst_node.innerHTML = G.dst.toString();
                G.dst.pt.color = DEST_COLOR;
            }

            plot_point(closest_point.qt.pt);
        }
    }

    function create_canvas(width, height) {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', 'map');
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
        canvas.addEventListener('click', function (e) { canvas_click(e); }, false);
        return canvas;
    }

    function init(x_dimension, y_dimension) {
        G = {};
        G.width = x_dimension;
        G.height = y_dimension;
        G.canvas = create_canvas(G.width, G.height);
        G.ctx = G.canvas.getContext('2d');
        document.getElementById('canvas_container').appendChild(G.canvas);
        G.quadtree = null;
        G.pixel = G.ctx.createImageData(1, 1).data;
        G.src = G.dst = null;
        G.src_node = document.getElementById('src');
        G.dst_node = document.getElementById('dst');
    }

    function draw_quadtree(qt) {
        qt.depth_first_traversal(plot_point);
    }

    function create_nodes(count) {
        var i = 0;

        if (!G.quadtree && count > 0) {
            G.quadtree = new QuadTree(randomPoint(G.width, G.height));
            i = 1;
        }

        for (i; i < count; i += 1) {
            G.quadtree.insert(randomPoint(G.width, G.height));
        }

        if (G.quadtree) {
            draw_quadtree(G.quadtree);
        }
    }

    function wagumba() {
        if (G.src && G.dst) {
            var packet, current_events, new_events, i;
            eval(document.getElementById('evalme').value);
            packet = G.src.pt.initiate(G.dst.pt.guid);
            current_events = G.src.broadcast(packet);
            while (current_events.length > 0) {
                new_events = [];
                for (i = 0; i < current_events.length; i += 1) {
                    new_events.push.apply(new_events, current_events[i].dst.pt.receive(current_events[i].packet));
                }
                current_events = new_events;
            }
        }
    }

    return { 'init': init, 'create_nodes': create_nodes, 'wagumba': wagumba };
}());
