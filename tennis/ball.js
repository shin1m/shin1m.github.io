// Generated by CoffeeScript 1.9.1
(function() {
  var Ball, G, Mark, exports, projected_time_for_y, radius, ref;

  exports = (ref = typeof module !== "undefined" && module !== null ? module.exports : void 0) != null ? ref : {};

  if (typeof window !== "undefined" && window !== null) {
    window.ball = exports;
  }

  exports.G = G = 9.8 / (64.0 * 64.0);

  exports.projected_time_for_y = projected_time_for_y = function(py, vy, y, sign) {
    var a;
    a = vy * vy + 2.0 * G * (py - y);
    if (a < 0.0) {
      return null;
    } else {
      return (vy + sign * Math.sqrt(a)) / G;
    }
  };

  radius = 0.0625;

  Ball = (function() {
    var rally;

    Ball.prototype.radius = radius;

    function Ball(stage) {
      var shadow;
      this.stage = stage;
      this.position = new THREE.Vector3(0.0, 0.0, 0.0);
      this.velocity = new THREE.Vector3(0.0, 0.0, 0.0);
      this.spin = new THREE.Vector3(0.0, 0.0, 0.0);
      this.node = new THREE.Object3D;
      shadow = new THREE.Mesh(new THREE.CircleGeometry(radius), new THREE.MeshBasicMaterial({
        color: 0x000000
      }));
      shadow.position.y = 1.0 / 64.0;
      shadow.rotateOnAxis(new THREE.Vector3(1.0, 0.0, 0.0), Math.PI * -0.5);
      this.body = new THREE.Mesh(new THREE.SphereGeometry(radius), new THREE.MeshLambertMaterial({
        color: 0xffff00
      }));
      this.node.add(shadow, this.body);
    }

    Ball.prototype.setup = function() {
      this.node.position.x = this.position.x;
      this.body.position.y = this.position.y;
      return this.node.position.z = this.position.z;
    };

    Ball.prototype.netin_part = function(x0, y0, x1, y1) {
      var dx, dy, ex, ey, l, m, n, p, v, vm, vn, vv, x, y;
      ex = x1 - x0;
      ey = y1 - y0;
      l = Math.sqrt(ex * ex + ey * ey);
      ex /= l;
      ey /= l;
      dx = this.position.x - x0;
      dy = this.position.y - y0;
      y = -ey * dx + ex * dy;
      if (y > radius) {
        return;
      }
      if (y < 0.0) {
        this.position.z = this.velocity.z < 0.0 ? radius : -radius;
        this.velocity.z = this.velocity.z * -1.0;
        this.velocity.multiplyScalar(0.125);
        this.stage.ball_net();
      } else {
        x = ex * dx + ey * dy;
        this.position.x = x0 + ex * x - ey * radius;
        this.position.y = y0 + ey * x + ex * radius;
        if (this.velocity.z < 0.0) {
          if (this.position.z < 0.0) {
            this.position.z = 0.0;
          }
        } else {
          if (this.position.z > 0.0) {
            this.position.z = 0.0;
          }
        }
        v = new THREE.Vector3(ex, ey, 0.0);
        p = new THREE.Vector3(dx, dy, this.position.z);
        n = p.clone().cross(v).normalize();
        m = v.clone().cross(n).normalize();
        vv = v.dot(this.velocity) * 0.375;
        vn = n.dot(this.velocity) * 0.375;
        vm = m.dot(this.velocity) * 0.0;
        this.velocity = v.multiplyScalar(vv).add(n.multiplyScalar(vn)).add(m.multiplyScalar(vm));
        this.stage.ball_chip();
      }
      return this.net = true;
    };

    Ball.prototype.netin = function() {
      if (this.position.x < -21 * 12 * 0.0254) {
        return;
      }
      if (this.position.x < -0.0254) {
        return this.netin_part(-21 * 12 * 0.0254, (3 * 12 + 6) * 0.0254, -0.0254, 3 * 12 * 0.0254);
      } else if (this.position.x < 0.0254) {
        return this.netin_part(-0.0254, 3 * 12 * 0.0254, 0.0254, 3 * 12 * 0.0254);
      } else if (this.position.x < 21 * 12 * 0.0254) {
        return this.netin_part(0.0254, 3 * 12 * 0.0254, 21 * 12 * 0.0254, (3 * 12 + 6) * 0.0254);
      }
    };

    Ball.prototype.emit_ace = function() {
      this.done = true;
      return this.stage.ball_ace();
    };

    Ball.prototype.emit_out = function() {
      this.done = true;
      return this.stage.ball_out();
    };

    Ball.prototype.emit_bounce = function() {
      return this.stage.ball_bounce();
    };

    Ball.prototype.wall = function() {
      if (this.done) {
        return;
      }
      if (this["in"]) {
        return this.emit_ace();
      } else {
        return this.emit_out();
      }
    };

    Ball.prototype.step = function() {
      var last, x, z;
      last = this.position.clone();
      this.position.add(this.velocity);
      this.position.y = this.position.y - 0.5 * G;
      this.velocity.y = this.velocity.y - G;
      this.velocity.add(this.spin.clone().cross(this.velocity).multiplyScalar(1.0 / 1500.0)).multiplyScalar(0.999);
      this.spin.multiplyScalar(0.99);
      if (this.position.y - radius <= 0.0) {
        this.position.y = radius;
        this.bounce();
        if (!this.done) {
          if (this["in"]) {
            this.emit_ace();
          } else if (this.hitter === null) {
            this.done = true;
            this.stage.ball_serve_air();
          } else {
            x = this.hitter.end * this.position.x;
            z = this.hitter.end * this.position.z;
            if (z > 0.0) {
              this.done = true;
              this.stage.ball_miss();
            } else if (x < this.target[0] || x > this.target[1] || z < this.target[2]) {
              this.emit_out();
            } else {
              this["in"] = true;
              if (this.serving() && this.net) {
                this.done = true;
                this.stage.ball_let();
              } else {
                this.stage.ball_in();
              }
            }
          }
        }
        if (this.velocity.y > 1.0 / 64.0) {
          this.emit_bounce();
        }
      }
      if (this.position.x - radius <= -30 * 12 * 0.0254) {
        this.position.x = radius - 30 * 12 * 0.0254;
        this.velocity.x = this.velocity.x * -0.5;
        this.wall();
        if (Math.abs(this.velocity.x) > 1.0 / 64.0) {
          this.emit_bounce();
        }
      } else if (this.position.x + radius >= 30 * 12 * 0.0254) {
        this.position.x = 30 * 12 * 0.0254 - radius;
        this.velocity.x = this.velocity.x * -0.5;
        this.wall();
        if (Math.abs(this.velocity.x) > 1.0 / 64.0) {
          this.emit_bounce();
        }
      }
      if (this.position.z - radius <= -60 * 12 * 0.0254) {
        this.position.z = radius - 60 * 12 * 0.0254;
        this.velocity.z = this.velocity.z * -0.5;
        this.wall();
        if (Math.abs(this.velocity.z) > 1.0 / 64.0) {
          this.emit_bounce();
        }
      } else if (this.position.z + radius >= 60 * 12 * 0.0254) {
        this.position.z = 60 * 12 * 0.0254 - radius;
        this.velocity.z = this.velocity.z * -0.5;
        this.wall();
        if (Math.abs(this.velocity.z) > 1.0 / 64.0) {
          this.emit_bounce();
        }
      }
      if (this.velocity.z < 0.0) {
        if (last.z > radius && this.position.z <= radius) {
          return this.netin();
        }
      } else {
        if (last.z < -radius && this.position.z >= -radius) {
          return this.netin();
        }
      }
    };

    rally = [-(13 * 12 + 6) * 0.0254, (13 * 12 + 6) * 0.0254, -39 * 12 * 0.0254];

    Ball.prototype.set = function(hitter, target) {
      this.hitter = hitter;
      this.target = target;
      return this["in"] = this.net = false;
    };

    Ball.prototype.reset = function(side, x, y, z) {
      var x0, x1;
      this.position.set(x, y, z);
      this.velocity.set(0.0, 0.0, 0.0);
      this.spin.set(0.0, 0.0, 0.0);
      this.done = false;
      x0 = 1 * 0.0254 * side;
      x1 = -(13 * 12 + 6) * 0.0254 * side;
      return this.set(null, [x0 < x1 ? x0 : x1, x0 < x1 ? x1 : x0, -21 * 12 * 0.0254]);
    };

    Ball.prototype.hit = function(hitter) {
      if (!this.done) {
        return this.set(hitter, rally);
      }
    };

    Ball.prototype.serving = function() {
      return this.target !== rally;
    };

    Ball.prototype.impact = function(dx, dz, speed, vy, spin) {
      var dl;
      dl = 1.0 / Math.sqrt(dx * dx + dz * dz);
      dx *= dl;
      dz *= dl;
      this.velocity.set(dx * speed, vy, dz * speed);
      return this.spin.set(-dz * spin.x + dx * spin.z, spin.y, dx * spin.x + dz * spin.z);
    };

    Ball.prototype.calculate_bounce = function(velocity, spin) {
      var b, d, e, f, v0, v1x, v1z, w0, w1x, w1z;
      f = 0.0;
      v0 = velocity;
      w0 = spin;
      v1x = v0.x + radius * w0.z;
      v1z = v0.z - radius * w0.x;
      e = 1.25 + v0.y * 10.0;
      if (e < 0.25) {
        e = 0.0;
      }
      if (e > 1.0) {
        e = 1.0;
      }
      b = (e + 2.0 / 3.0) * radius;
      w1x = (1.0 - e) * v0.z + b * w0.x + f * v1z;
      w1z = (e - 1.0) * v0.x + b * w0.z - f * v1x;
      velocity.x = e * v1x - 3.0 / 5.0 * w1z;
      velocity.y = v0.y * -0.75;
      velocity.z = e * v1z + 3.0 / 5.0 * w1x;
      d = 3.0 / 5.0 / radius;
      spin.x = w1x * d;
      return spin.z = w1z * d;
    };

    Ball.prototype.bounce = function() {
      return this.calculate_bounce(this.velocity, this.spin);
    };

    Ball.prototype.projected_time_for_y = function(y, sign) {
      return projected_time_for_y(this.position.y, this.velocity.y, y, sign);
    };

    return Ball;

  })();

  exports.Ball = Ball;

  Mark = (function() {
    function Mark() {
      var node__render;
      this.duration = 0.0;
      this.stretch = 1.0;
      this.node = new THREE.Mesh(new THREE.CircleGeometry(radius), new THREE.MeshBasicMaterial({
        color: 0x000000
      }));
      this.node.position.y = 1.0 / 64.0;
      node__render = this.node.render;
    }

    Mark.prototype.setup = function() {
      this.node.visible = this.duration > 0.0;
      return this.node.scale.y = this.stretch;
    };

    Mark.prototype.step = function() {
      if (this.duration > 0.0) {
        return this.duration -= 1.0;
      }
    };

    Mark.prototype.mark = function(ball) {
      var v;
      this.duration = 2.0 * 64.0;
      this.node.position.x = ball.position.x;
      this.node.position.z = ball.position.z;
      v = this.node.up.set(ball.velocity.x, 0.0, ball.velocity.z);
      this.stretch = 1.0 + v.length() * 8.0;
      return this.node.lookAt(new THREE.Vector3(0.0, 1.0, 0.0).add(this.node.position));
    };

    return Mark;

  })();

  exports.Mark = Mark;

}).call(this);
