// Generated by CoffeeScript 1.10.0
(function() {
  var G, Player, exports, reach_range, ref, shot_direction,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  exports = (ref = typeof module !== "undefined" && module !== null ? module.exports : void 0) != null ? ref : {};

  if (typeof window !== "undefined" && window !== null) {
    window.player = exports;
  }

  G = ball.G;

  exports.reach_range = reach_range = function(ball, velocity, player, speed, t0, sign) {
    var a, b, c, d, qp, ss, v;
    qp = ball.clone().sub(player).setY(0.0);
    v = new THREE.Vector3(velocity.x, 0.0, velocity.z);
    ss = speed * speed;
    a = v.dot(v) - ss;
    b = v.dot(qp) - ss * t0;
    c = qp.dot(qp) - ss * t0 * t0;
    d = b * b - a * c;
    if (d < 0.0) {
      return -b / a;
    } else {
      return (-b + sign * Math.sqrt(d)) / a;
    }
  };

  exports.shot_direction = shot_direction = function(ball, end, left, right, forward, backward) {
    var vx, vz;
    vx = -ball.x;
    if (left) {
      vx -= 12 * 12 * 0.0254 * end;
    }
    if (right) {
      vx += 12 * 12 * 0.0254 * end;
    }
    vz = -24 * 12 * 0.0254 * end - ball.z;
    if (forward) {
      vz -= 16 * 12 * 0.0254 * end;
    }
    if (backward) {
      vz += 10 * 12 * 0.0254 * end;
    }
    return new THREE.Vector3(vx, 0.0, vz);
  };

  Player = (function() {
    var Action, Motion, Run, RunMotion, State, Swing, is_lower, is_not_root, is_upper, load, lowers, record_animation;

    Player.prototype.State = State = function(enter, step, perform) {
      return {
        enter: enter,
        step: step,
        perform: perform
      };
    };

    Action = (function() {
      function Action(skin, start, duration, use) {
        var bone, data;
        if (use == null) {
          use = function(x) {
            return true;
          };
        }
        this.start = start;
        data = skin.geometry.animation;
        this.animation = new THREE.Animation(skin, {
          fps: data.fps,
          hierarchy: (function() {
            var i, len, ref1, results;
            ref1 = data.hierarchy;
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              bone = ref1[i];
              if (use(bone)) {
                results.push(bone);
              }
            }
            return results;
          })(),
          length: start + duration,
          name: 'animation_' + start
        });
        this.animation.hierarchy = (function() {
          var i, len, ref1, results;
          ref1 = this.animation.hierarchy;
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            bone = ref1[i];
            if (use(bone)) {
              results.push(bone);
            }
          }
          return results;
        }).call(this);
        this.animation.loop = false;
      }

      Action.prototype.play = function() {
        this.animation.play(this.start);
        if (this.start < this.animation.data.length) {
          return;
        }
        this.animation.resetBlendWeights();
        this.animation.update(0.0);
        return this.animation.stop();
      };

      return Action;

    })();

    Swing = (function(superClass) {
      extend(Swing, superClass);

      Swing.prototype.bone = function(time, skin, name) {
        var bone, i, len, ref1;
        this.animation.play(time);
        THREE.AnimationHandler.update(0.0);
        this.animation.stop();
        skin.updateMatrixWorld(true);
        ref1 = skin.skeleton.bones;
        for (i = 0, len = ref1.length; i < len; i++) {
          bone = ref1[i];
          if (bone.name === name) {
            return bone;
          }
        }
      };

      function Swing(skin, start, duration, impact, speed, spin) {
        var root;
        if (spin == null) {
          spin = new THREE.Vector3(0.0, 0.0, 0.0);
        }
        Swing.__super__.constructor.call(this, skin, start, duration);
        this.impact = start + impact;
        this.speed = speed;
        this.spin = spin;
        this.spot = this.bone(this.impact, skin, 'Spot').matrixWorld.clone();
        root = this.bone(start + duration, skin, 'Root').matrixWorld;
        this.end_position = new THREE.Vector3(root.elements[12], 0.0, root.elements[14]);
        this.end_toward = new THREE.Vector3(root.elements[8], 0.0, root.elements[10]);
      }

      Swing.prototype.merge = function(player) {
        var at, node;
        node = player.node;
        node.localToWorld(node.position.copy(this.end_position));
        at = this.end_position.clone().add(this.end_toward);
        return node.lookAt(node.localToWorld(at));
      };

      return Swing;

    })(Action);

    Run = (function(superClass) {
      extend(Run, superClass);

      function Run(skin, start, duration, use) {
        var animation, bone, i, len, ref1, root;
        Run.__super__.constructor.call(this, skin, start, duration, use);
        animation = new THREE.Animation(skin, skin.geometry.animation);
        animation.loop = false;
        animation.play(start);
        THREE.AnimationHandler.update(0.0);
        animation.stop();
        skin.updateMatrixWorld(true);
        ref1 = skin.skeleton.bones;
        for (i = 0, len = ref1.length; i < len; i++) {
          bone = ref1[i];
          if (bone.name === 'Root') {
            break;
          }
        }
        root = bone.matrixWorld;
        this.toward = new THREE.Vector3(root.elements[4], 0.0, root.elements[6]);
      }

      return Run;

    })(Action);

    Motion = (function() {
      function Motion(action1) {
        this.action = action1;
      }

      Motion.prototype.play = function() {
        return this.action.play();
      };

      Motion.prototype.time = function() {
        return this.action.animation.currentTime;
      };

      Motion.prototype.playing = function() {
        return this.action.animation.isPlaying;
      };

      return Motion;

    })();

    exports.Motion = Motion;

    RunMotion = (function(superClass) {
      var duration;

      extend(RunMotion, superClass);

      duration = 4.0 / 64.0;

      function RunMotion(run, toward1, player) {
        var elements, t0, t1;
        this.toward = toward1;
        RunMotion.__super__.constructor.call(this, run);
        this.node = player.node;
        elements = this.node.matrix.elements;
        this.toward0 = new THREE.Vector3(elements[8], 0.0, elements[10]);
        player.root.matrix.copy(player.root_transform);
        player.root.applyMatrix(new THREE.Matrix4);
        t0 = this.toward.clone().normalize();
        t1 = run.toward;
        this.toward1 = new THREE.Vector3(t0.x * t1.z + t0.z * t1.x, 0.0, t0.z * t1.z - t0.x * t1.x);
        this.duration = this.toward0.dot(this.toward1) < -0.75 ? 0.0 : duration;
      }

      RunMotion.prototype.step = function() {
        var t, t0, t1;
        if (this.duration > 0.0) {
          this.duration -= 1.0 / 64.0;
        }
        t = this.duration / duration;
        t0 = this.toward0.clone().multiplyScalar(t);
        t1 = this.toward1.clone().multiplyScalar(1.0 - t);
        return this.node.lookAt(t0.add(t1).add(this.node.position));
      };

      return RunMotion;

    })(Motion);

    lowers = {
      Center: true,
      Leg0_R: true,
      Leg1_R: true,
      Foot_R: true,
      Toe_R: true,
      Leg0_L: true,
      Leg1_L: true,
      Foot_L: true,
      Toe_L: true
    };

    is_not_root = function(x) {
      return x.name !== 'Root';
    };

    is_lower = function(x) {
      return lowers[x.name] != null;
    };

    is_upper = function(x) {
      return is_not_root(x) && !is_lower(x);
    };

    load = function(skin, source, next) {
      var fps, read_action, read_ready_action, read_run, read_run_actions, read_shot, read_shot_with_reach, read_swing, read_swing_actions, request, source_fps;
      source_fps = null;
      fps = 64.0;
      read_action = function(e, use) {
        var duration, start;
        if (use == null) {
          use = function(x) {
            return true;
          };
        }
        start = parseFloat(e.getAttribute('start')) / source_fps;
        duration = parseFloat(e.getAttribute('duration')) / source_fps;
        return new Action(skin, start, duration, use);
      };
      read_swing = function(e) {
        var duration, impact, speed, spin, start;
        start = parseFloat(e.getAttribute('start')) / source_fps;
        duration = parseFloat(e.getAttribute('duration')) / source_fps;
        impact = parseFloat(e.getAttribute('impact')) / source_fps;
        speed = parseFloat(e.getAttribute('speed')) / fps;
        spin = e.getAttribute('spin').split(/\s+/).map(parseFloat);
        return new Swing(skin, start, duration, impact, speed, new THREE.Vector3(spin[0], spin[1], spin[2]));
      };
      read_run = function(e, use) {
        var duration, start;
        start = parseFloat(e.getAttribute('start')) / source_fps;
        duration = parseFloat(e.getAttribute('duration')) / source_fps;
        return new Run(skin, start, duration, use);
      };
      read_shot = function(e) {
        return {
          flat: read_swing(e.querySelector('flat')),
          topspin: read_swing(e.querySelector('topspin')),
          lob: read_swing(e.querySelector('lob')),
          slice: read_swing(e.querySelector('slice'))
        };
      };
      read_shot_with_reach = function(e) {
        var shots;
        shots = read_shot(e);
        shots.reach = read_swing(e.querySelector('reach'));
        return shots;
      };
      read_ready_action = function(e) {
        return {
          stroke: read_run(e.querySelector('stroke'), is_not_root),
          volley: read_run(e.querySelector('volley'), is_not_root),
          smash: read_run(e.querySelector('smash'), is_not_root)
        };
      };
      read_run_actions = function(e) {
        return {
          lowers: (function(e) {
            return [null, read_run(e.querySelector('left'), is_lower), read_run(e.querySelector('right'), is_lower), null, read_run(e.querySelector('forward'), is_lower), read_run(e.querySelector('forward_left'), is_lower), read_run(e.querySelector('forward_right'), is_lower), null, read_run(e.querySelector('backward'), is_lower), read_run(e.querySelector('backward_left'), is_lower), read_run(e.querySelector('backward_right'), is_lower)];
          })(e.querySelector('lowers')),
          stroke: read_action(e.querySelector('stroke'), is_upper),
          volley: read_action(e.querySelector('volley'), is_upper),
          smash: read_action(e.querySelector('smash'), is_upper)
        };
      };
      read_swing_actions = function(e) {
        return {
          stroke: read_shot_with_reach(e.querySelector('stroke')),
          volley: read_shot_with_reach(e.querySelector('volley')),
          smash: read_swing(e.querySelector('smash'))
        };
      };
      request = new XMLHttpRequest;
      request.addEventListener('load', function() {
        var e, ready, ref1, root, run, serve, swing, xml;
        xml = (ref1 = this.responseXML) != null ? ref1 : new DOMParser().parseFromString(this.responseText, 'application/xml');
        root = xml.querySelector('player');
        source_fps = parseFloat(root.getAttribute('fps'));
        e = root.querySelector(':scope > serve');
        serve = {
          set: read_action(e.querySelector('set')),
          toss: read_action(e.querySelector('toss')),
          swing: read_shot(e.querySelector('swing'))
        };
        e = root.querySelector(':scope > ready');
        ready = {
          "default": read_run(e.querySelector('default'), is_not_root),
          forehand: read_ready_action(e.querySelector('forehand')),
          backhand: read_ready_action(e.querySelector('backhand'))
        };
        e = root.querySelector(':scope > run');
        run = {
          speed: parseFloat(e.getAttribute('speed')) / fps,
          lower: read_run(e.querySelector('lower'), is_lower),
          "default": read_action(e.querySelector('default'), is_upper),
          forehand: read_run_actions(e.querySelector('forehand')),
          backhand: read_run_actions(e.querySelector('backhand'))
        };
        e = root.querySelector(':scope > swing');
        swing = {
          forehand: read_swing_actions(e.querySelector('forehand')),
          backhand: read_swing_actions(e.querySelector('backhand')),
          toss: read_swing(e.querySelector('toss')),
          toss_lob: read_swing(e.querySelector('toss_lob'))
        };
        return next({
          serve: serve,
          ready: ready,
          run: run,
          swing: swing
        });
      });
      request.open('GET', source);
      return request.send();
    };

    function Player(stage) {
      this.stage = stage;
      this.ball = this.stage.ball;
    }

    Player.prototype.initialize = function(model, next) {
      var loader;
      loader = new THREE.ColladaLoader;
      loader.options.convertUpAxis = true;
      return loader.load(model + '.dae', (function(_this) {
        return function(collada) {
          var bone, i, len, ref1;
          collada.scene.traverse(function(child) {
            var i, len, material, ref1, results;
            if (!child.material) {
              return;
            }
            child.material.alphaTest = 0.5;
            if (child.material.materials != null) {
              ref1 = child.material.materials;
              results = [];
              for (i = 0, len = ref1.length; i < len; i++) {
                material = ref1[i];
                results.push(material.alphaTest = 0.5);
              }
              return results;
            }
          });
          _this.node = collada.scene;
          ref1 = collada.skins[0].skeleton.bones;
          for (i = 0, len = ref1.length; i < len; i++) {
            bone = ref1[i];
            if (bone.name !== 'Root') {
              continue;
            }
            _this.root = bone;
            break;
          }
          _this.root_transform = _this.root.matrix.clone();
          return load(collada.skins[0], model + '.player', function(actions) {
            _this.actions = actions;
            _this.speed = _this.actions.run.speed;
            _this.actions.serve.set.play();
            _this.lefty = _this.root.position.x < 0.0 ? -1.0 : 1.0;
            _this.smash_hand = -0.25 * _this.lefty;
            _this.motion = new RunMotion(_this.actions.ready["default"], new THREE.Vector3(0.0, 0.0, 1.0), _this);
            _this.ready = null;
            _this.blend_last = null;
            _this.blend_duration = 0.0;
            _this.blend_current = 0.0;
            _this.suspended = null;
            _this.reset(1.0, _this.state_default);
            return next();
          });
        };
      })(this));
    };

    Player.prototype.set_motion = function(motion, blend) {
      var ref1;
      if (blend == null) {
        blend = 0.0;
      }
      if ((ref1 = this.blend_last) != null) {
        ref1.stop();
      }
      this.blend_last = this.motion.action.animation;
      this.blend_duration = blend;
      this.blend_current = blend;
      this.motion = motion;
      return this.motion.play();
    };

    Player.prototype.transit = function(state) {
      this.state = state;
      return this.state.enter.call(this);
    };

    Player.prototype.reset = function(end, state) {
      this.left = this.right = this.forward = this.backward = false;
      if (end) {
        this.end = end;
      }
      if (state) {
        return this.transit(state);
      }
    };

    Player.prototype.setup = function() {};

    Player.prototype.root_position = function() {
      this.node.updateMatrixWorld(false);
      return this.node.localToWorld(this.root.position.clone());
    };

    Player.prototype.direction = function() {
      var e, v;
      v = this.ball.velocity;
      e = (v.z < 0.0 ? 1.0 : -1.0) * this.end;
      v = new THREE.Vector3(v.x * e, 0.0, v.z * e);
      if (v.length() > 0.01 / 64.0) {
        return v;
      } else {
        return v.set(0.0, 0.0, -this.end);
      }
    };

    Player.prototype.whichhand = function(v) {
      return new THREE.Vector3(-v.z, 0.0, v.x).dot(this.ball.position.clone().sub(this.node.position));
    };

    Player.prototype.relative_ball = function(swing, ball) {
      var p, x, y, z;
      if (ball == null) {
        ball = null;
      }
      if (!ball) {
        ball = this.ball.position.clone();
      }
      p = this.node.worldToLocal(ball);
      x = p.x - swing.spot.elements[12];
      y = p.y - swing.spot.elements[13];
      z = p.z - swing.spot.elements[14];
      if (swing.spot.elements[8] < 0.0) {
        return new THREE.Vector3(-x, y, -z);
      } else {
        return new THREE.Vector3(x, y, z);
      }
    };

    Player.prototype.step = function() {
      var base, position, ref1, ref2;
      if (this.suspended) {
        return;
      }
      this.state.step.call(this);
      if (this.blend_current > 0.0) {
        if ((ref1 = this.blend_last) != null) {
          ref1.weight = this.blend_current / this.blend_duration;
        }
        this.motion.action.animation.weight = (this.blend_duration - this.blend_current) / this.blend_duration;
        this.blend_current -= 1.0 / 64.0;
      } else {
        if ((ref2 = this.blend_last) != null) {
          ref2.stop();
        }
        this.blend_last = null;
      }
      if (typeof (base = this.motion).step === "function") {
        base.step();
      }
      position = this.node.position;
      if (position.x < -30 * 12 * 0.0254) {
        position.x = -30 * 12 * 0.0254;
      } else if (position.x > 30 * 12 * 0.0254) {
        position.x = 30 * 12 * 0.0254;
      }
      if (position.z * this.end < 1.0) {
        return position.z = 1.0 * this.end;
      } else if (position.z * this.end > 60 * 12 * 0.0254) {
        return position.z = 60 * 12 * 0.0254 * this.end;
      }
    };

    Player.prototype.perform = function(shot) {
      return this.state.perform.call(this, shot);
    };

    Player.prototype.shot_direction = function() {
      if (this.ball.position.z * this.end < 0.0) {
        return new THREE.Vector3(0.0, 0.0, -this.end);
      } else {
        return shot_direction(this.ball.position, this.end, this.left, this.right, this.forward, this.backward);
      }
    };

    Player.prototype.smash_height = function() {
      return this.actions.swing.forehand.smash.spot.elements[13] - 0.25;
    };

    Player.prototype.create_record = function() {
      var record;
      record = {};
      this.record(record);
      return record;
    };

    record_animation = function(animation) {
      return {
        animation: animation,
        time: animation != null ? animation.currentTime : void 0,
        weight: animation != null ? animation.weight : void 0
      };
    };

    Player.prototype.record = function(to) {
      to.position = this.node.position.clone();
      to.quaternion = this.node.quaternion.clone();
      to.root = this.root.matrix.clone();
      to.animations = [record_animation(this.motion.action.animation)];
      if (this.blend_last) {
        to.animations.push(record_animation(this.blend_last));
      }
      if (this.ready) {
        return to.animations.push(record_animation(this.ready.animation));
      }
    };

    Player.prototype.replay = function(from) {
      var i, j, k, len, len1, len2, ref1, ref2, ref3, x;
      ref1 = from.animations;
      for (i = 0, len = ref1.length; i < len; i++) {
        x = ref1[i];
        x.animation.weight = x.weight;
        x.animation.play(x.time);
        x.animation.resetBlendWeights();
      }
      ref2 = from.animations;
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        x = ref2[j];
        x.animation.update(0.0);
      }
      ref3 = from.animations;
      for (k = 0, len2 = ref3.length; k < len2; k++) {
        x = ref3[k];
        x.animation.stop();
      }
      this.node.position.copy(from.position);
      this.node.quaternion.copy(from.quaternion);
      this.root.matrix.copy(from.root);
      return this.root.applyMatrix(new THREE.Matrix4);
    };

    Player.prototype.suspend = function() {
      var ref1, ref2;
      this.suspended = {
        action: this.motion.action.animation.currentTime,
        blend: (ref1 = this.blend_last) != null ? ref1.currentTime : void 0
      };
      if ((ref2 = this.blend_last) != null) {
        ref2.stop();
      }
      return this.motion.action.animation.stop();
    };

    Player.prototype.resume = function() {
      var ref1;
      if ((ref1 = this.blend_last) != null) {
        ref1.play(this.suspended.blend);
      }
      this.motion.action.animation.play(this.suspended.action);
      return this.suspended = null;
    };

    Player.prototype.state_default = State(function() {
      var v;
      v = this.ball.position.clone().setY(0.0);
      this.node.lookAt(v);
      this.node.updateMatrix();
      v.sub(this.node.position).normalize();
      return this.set_motion(new RunMotion(this.actions.ready["default"], v, this), 4.0 / 64.0);
    }, function() {
      var action, actions, d, hand, run, t, v, whichhand, y;
      d = new THREE.Vector3(0.0, 0.0, 0.0);
      if (this.left) {
        d.x = -this.speed * this.end;
      }
      if (this.right) {
        d.x = this.speed * this.end;
      }
      if (this.forward) {
        d.z = -this.speed * this.end;
      }
      if (this.backward) {
        d.z = this.speed * this.end;
      }
      actions = d.x === 0.0 && d.z === 0.0 ? this.actions.ready : this.actions.run;
      if (this.ball.done) {
        v = new THREE.Vector3(0.0, 0.0, -this.end);
        action = actions["default"];
        if (actions === this.actions.run) {
          run = this.actions.run.lower;
        }
      } else if (this.ball.hitter === null || this.ball.hitter.end === this.end) {
        v = this.ball.position.clone().sub(this.node.position).setY(0.0).normalize();
        action = actions["default"];
        if (actions === this.actions.run) {
          if (this.forward) {
            run = this.actions.run.lower;
          } else if (this.left) {
            run = actions.backhand.lowers[9];
          } else if (this.right) {
            run = actions.forehand.lowers[10];
          } else if (this.backward) {
            run = v.x * this.end > 0.0 ? actions.forehand.lowers[9] : actions.backhand.lowers[10];
          } else {
            run = this.actions.run.lower;
          }
        }
      } else {
        v = this.direction().normalize();
        whichhand = this.whichhand(v);
        t = reach_range(this.ball.position, this.ball.velocity, this.node.position, 0.0, 0.0, 1.0);
        y = this.ball.position.y + (this.ball.velocity.y - 0.5 * G * t) * t;
        if (y > this.smash_height()) {
          hand = whichhand > this.smash_hand ? actions.forehand : actions.backhand;
          action = hand.smash;
        } else {
          hand = whichhand > 0.0 ? actions.forehand : actions.backhand;
          action = this.ball["in"] || y < 0.0 ? hand.stroke : hand.volley;
        }
        if (actions === this.actions.run) {
          run = hand.lowers[(this.left ? 1 : this.right ? 2 : 0) + (this.forward ? 4 : this.backward ? 8 : 0)];
        }
      }
      if (actions === this.actions.ready) {
        this.set_motion(new RunMotion(action, v, this), 4.0 / 64.0);
        return this.ready = null;
      } else {
        if (this.motion.action !== run || !d.equals(this.motion.toward)) {
          this.set_motion(new RunMotion(run, d, this), 4.0 / 64.0);
        }
        if (!this.motion.playing()) {
          this.motion.play();
        }
        this.ready = action;
        action.play();
        return this.node.position.add(d);
      }
    }, function(shot) {
      var actions, ball, hand, impact, shots, swing, t, whichhand;
      this.ready = null;
      this.node.lookAt(this.shot_direction().add(this.node.position));
      this.node.updateMatrixWorld(false);
      actions = this.actions.swing;
      whichhand = this.whichhand(this.direction().normalize());
      t = this.ball.projected_time_for_y(this.smash_height(), 1.0);
      if (t) {
        swing = whichhand > this.smash_hand ? actions.forehand.smash : actions.backhand.smash;
        impact = (swing.impact - swing.start) * 60.0;
        if (t > impact) {
          ball = this.relative_ball(swing, this.ball.velocity.clone().multiplyScalar(impact).add(this.ball.position));
          if (Math.abs(ball.x) < 0.5) {
            this.set_motion(new Motion(swing));
            return this.transit(this.state_smash_swing);
          }
        }
      }
      t = this.ball["in"] ? 0.0 : this.ball.projected_time_for_y(this.ball.radius, 1.0);
      hand = whichhand > 0.0 ? actions.forehand : actions.backhand;
      if (this.ball.done) {
        this.set_motion(new Motion((this.node.position.z * this.end > 21 * 12 * 0.0254 ? hand.stroke : hand.volley)[shot]));
      } else {
        shots = hand.volley;
        swing = shots[shot];
        impact = (swing.impact - swing.start) * 60.0;
        if (t < impact) {
          shots = hand.stroke;
          swing = shots[shot];
          impact = (swing.impact - swing.start) * 60.0;
        }
        ball = this.relative_ball(swing, this.ball.velocity.clone().multiplyScalar(impact).add(this.ball.position));
        if (ball.x < -0.5 || (whichhand > 0.0 ? ball.z > 1.0 : ball.z < -1.0)) {
          this.set_motion(new Motion(shots.reach));
          return this.transit(this.state_reach_swing);
        }
        this.set_motion(new Motion(swing));
      }
      return this.transit(this.state_swing);
    });

    Player.prototype.state_serve_set = State(function() {
      this.set_motion(new Motion(this.actions.serve.set));
      return this.ready = null;
    }, function() {
      var center, es, speed, wide, xes;
      speed = 2.0 / 64.0;
      if (this.left) {
        this.ball.position.x = this.ball.position.x - speed * this.end;
      }
      if (this.right) {
        this.ball.position.x = this.ball.position.x + speed * this.end;
      }
      es = this.end * this.stage.side;
      xes = this.ball.position.x * es;
      center = 12 * 0.0254;
      wide = 14 * 12 * 0.0254;
      if (xes < center) {
        this.ball.position.x = center * es;
      }
      if (xes > wide) {
        this.ball.position.x = wide * es;
      }
      this.ball.position.y = 0.875;
      this.ball.velocity.set(0.0, 0.0, 0.0);
      this.ball.spin.set(0.0, 0.0, 0.0);
      this.node.position.set(this.ball.position.x, 0.0, this.ball.position.z);
      return this.node.lookAt(new THREE.Vector3((6 * 12 + 9) * -0.0254 * es + 2 * 12 * 0.0254 * this.lefty * this.end, 0.0, 21 * 12 * -0.0254 * this.end));
    }, function(shot) {
      return this.transit(this.state_serve_toss);
    });

    Player.prototype.state_serve_toss = State(function() {
      this.ball.position.y = 1.5;
      this.ball.velocity.set(0.0075 * this.lefty, 0.085, 0.01).applyQuaternion(this.node.getWorldQuaternion());
      this.ball.spin.set(0.0, 0.0, 0.0);
      return this.set_motion(new Motion(this.actions.serve.toss));
    }, function() {
      if (this.ball.position.y <= 1.5) {
        this.ball.position.x = this.node.position.x;
        this.ball.position.z = this.node.position.z;
        this.ball.velocity.set(0.0, 0.0, 0.0);
        this.transit(this.state_serve_set);
      }
      if (this.left) {
        this.node.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0.0), 1.0 / 64.0);
      }
      if (this.right) {
        return this.node.rotateOnAxis(new THREE.Vector3(0.0, 1.0, 0.0), -1.0 / 64.0);
      }
    }, function(shot) {
      this.set_motion(new Motion(this.actions.serve.swing[shot]));
      return this.transit(this.state_serve_swing);
    });

    Player.prototype.state_serve_swing = State(function() {
      return this.stage.sound_swing.play();
    }, function() {
      var ball, d, speed, spin, toward;
      if (Math.abs(this.motion.time() - this.motion.action.impact) < 0.5 / 60.0) {
        this.node.updateMatrixWorld(false);
        ball = this.relative_ball(this.motion.action);
        if (Math.abs(ball.y) < 0.3) {
          d = 58 * 12 * 0.0254 + ball.y * 10.0;
          spin = this.motion.action.spin;
          d *= Math.pow(2.0, -spin.x * (4.0 / 64.0));
          speed = this.motion.action.speed + ball.y * 0.125;
          toward = new THREE.Vector3(0.0, 0.0, 1.0).applyQuaternion(this.node.getWorldQuaternion());
          this.ball.impact(toward.x, toward.z, speed, G * d / (2.0 * speed) - this.ball.position.y * speed / d, spin);
          this.ball.hitter = this;
          this.stage.sound_hit.play();
        }
      }
      if (this.motion.playing()) {
        return;
      }
      if (!this.ball.done && this.ball.hitter === null) {
        this.ball.emit_serve_air();
      }
      this.motion.action.merge(this);
      return this.transit(this.state_default);
    }, function(shot) {});

    Player.prototype.swing_impact = function(v) {
      var a, b, ball, d, dd, dx, dz, n, nh, speed, spin, vm;
      if (Math.abs(this.motion.time() - this.motion.action.impact) < 0.5 / 60.0) {
        this.node.updateMatrixWorld(false);
        ball = this.relative_ball(this.motion.action);
        if (Math.abs(ball.x) < 0.5 && ball.y < 1.0 && Math.abs(ball.z) < 1.0) {
          d = v.length();
          n = -d * this.ball.position.z / v.z;
          b = this.ball.position.y * (d - n) / d;
          a = d / (60 * 12 * 0.0254);
          speed = this.motion.action.speed * (a > 1.25 ? 1.25 : a < 0.85 ? 0.85 : a);
          spin = this.motion.action.spin;
          dd = this.ball.position.z * this.end;
          d = dd + (d - dd) * Math.pow(2.0, -spin.x * ((spin.x > 0.0 ? 12.0 : 8.0) / 64.0));
          nh = (36 + 42) * 0.5 * 0.0254 + this.ball.radius;
          if (b < nh) {
            vm = Math.sqrt(G * (d - n) * n * 0.5 / (nh - b));
            if (vm < speed) {
              speed = vm;
            }
          }
          d -= ball.x * 2.0;
          speed -= ball.x * 0.125;
          dx = v.x + v.z * ball.z * 0.0625;
          dz = v.z - v.x * ball.z * 0.0625;
          this.ball.impact(dx, dz, speed, G * d / (2.0 * speed) - this.ball.position.y * speed / d, spin);
          this.ball.hit(this);
          this.stage.sound_hit.play();
        }
      }
      if (this.motion.playing()) {
        return;
      }
      this.motion.action.merge(this);
      return this.transit(this.state_default);
    };

    Player.prototype.state_swing = State(function() {
      return this.stage.sound_swing.play();
    }, function() {
      var v;
      v = this.shot_direction();
      if (this.motion.time() <= this.motion.action.impact) {
        this.node.lookAt(this.node.position.clone().add(v));
      }
      return this.swing_impact(v);
    }, function(shot) {});

    Player.prototype.state_smash_swing = State(function() {
      return this.stage.sound_swing.play();
    }, function() {
      var ball, d, dx, dz, speed, v;
      v = this.shot_direction();
      if (this.motion.time() <= this.motion.action.impact) {
        this.node.lookAt(this.node.position.clone().add(v));
      }
      if (Math.abs(this.motion.time() - this.motion.action.impact) < 0.5 / 60.0) {
        this.node.updateMatrixWorld(false);
        ball = this.relative_ball(this.motion.action);
        if (Math.abs(ball.x) < 0.5 && Math.abs(ball.y) < 1.0 && Math.abs(ball.z) < 1.0) {
          d = v.length() + (ball.y - ball.z) * 2.0;
          speed = this.motion.action.speed + ball.y * 0.125;
          dx = v.x + v.z * ball.x * 0.0625;
          dz = v.z - v.x * ball.x * 0.0625;
          this.ball.impact(dx, dz, speed, G * d / (2.0 * speed) - this.ball.position.y * speed / d, this.motion.action.spin);
          this.ball.hit(this);
          this.stage.sound_hit.play();
        }
      }
      if (this.motion.playing()) {
        return;
      }
      this.motion.action.merge(this);
      return this.transit(this.state_default);
    }, function(shot) {});

    Player.prototype.state_reach_swing = State(function() {
      var impact, vx, vz;
      impact = (this.motion.action.impact - this.motion.time()) * 60.0;
      vx = this.ball.position.x + this.ball.velocity.x * impact;
      vz = this.ball.position.z + this.ball.velocity.z * impact;
      this.node.lookAt(new THREE.Vector3(vx, 0.0, vz));
      return this.stage.sound_swing.play();
    }, function() {
      return this.swing_impact(this.shot_direction());
    }, function(shot) {});

    return Player;

  })();

  exports.Player = Player;

}).call(this);

//# sourceMappingURL=player.js.map
