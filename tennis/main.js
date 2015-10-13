// Generated by CoffeeScript 1.9.3
(function() {
  var Audio, Match, Player, Stage, Training, audio, chooseItem, controller0, controller1, setup, showMenu, showPlayers0, showPlayers1, showReady, slide,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Player = player.Player;

  Stage = stage.Stage;

  Match = (function(superClass) {
    var points0, points1, state_close;

    extend(Match, superClass);

    function Match() {
      return Match.__super__.constructor.apply(this, arguments);
    }

    Match.prototype.new_game = function() {
      var games;
      this.player0.point = this.player1.point = 0;
      this.second = false;
      games = this.player0.game + this.player1.game;
      this.end = games % 4 < 2 ? 1.0 : -1.0;
      this.server = games % 2 === 0 ? this.player0 : this.player1;
      return this.receiver = games % 2 === 0 ? this.player1 : this.player0;
    };

    Match.prototype.point = function(player) {
      ++player.point;
      if (player.point < 4 || player.point - player.opponent.point < 2) {
        return;
      }
      ++player.game;
      if (player.game < 6 || player.game - player.opponent.game < 2) {
        return this.new_game();
      } else {
        return this.closed = true;
      }
    };

    Match.prototype.ball_ace = function() {
      this.second = false;
      this.point(this.ball.hitter);
      this.duration = 2.0 * 64.0;
      return this.sound_ace.play();
    };

    Match.prototype.ball_let = function() {
      this.mark.mark(this.ball);
      this.set_message(['LET']);
      return this.duration = 2.0 * 64.0;
    };

    Match.prototype.serve_miss = function() {
      if (this.second) {
        this.set_message(['DOUBLE FAULT']);
        this.second = false;
        this.point(this.receiver);
      } else {
        this.set_message(['FAULT']);
        this.second = true;
      }
      this.duration = 2.0 * 64.0;
      return this.sound_miss.play();
    };

    Match.prototype.ball_serve_air = function() {
      return this.serve_miss();
    };

    Match.prototype.miss = function(message) {
      this.set_message([message]);
      this.second = false;
      this.point(this.ball.hitter.opponent);
      this.duration = 2.0 * 64.0;
      return this.sound_miss.play();
    };

    points0 = [' 0', '15', '30', '40'];

    points1 = ['0 ', '15', '30', '40'];

    Match.prototype.transit_ready = function() {
      var game;
      this.state = this.state_ready;
      if (this.player0.point + this.player1.point < 6) {
        game = points0[this.player0.point] + ' - ' + points1[this.player1.point];
      } else if (this.player0.point > this.player1.point) {
        game = ' A -   ';
      } else if (this.player0.point < this.player1.point) {
        game = '   - A ';
      } else {
        game = ' DEUCE ';
      }
      this.set_message(['P1 ' + this.player0.game + ' - ' + this.player1.game + ' P2', (this.player0 === this.server ? '* ' : '  ') + game + (this.player1 === this.server ? ' *' : '  ')]);
      this.duration = 1.0 * 64.0;
      return this.step_things();
    };

    state_close = Stage.prototype.State(function() {
      return this.step_things();
    }, {
      13: function() {
        return this.new_set();
      },
      27: function() {
        return this.back();
      }
    }, {});

    Match.prototype.transit_close = function() {
      this.state = state_close;
      this.set_message([(this.player0.game > this.player1.game ? 'P1' : 'P2') + ' WON!', 'P1 ' + this.player0.game + ' - ' + this.player1.game + ' P2', 'PRESS START', 'TO PLAY AGAIN']);
      return this.sound_ace.play();
    };

    Match.prototype.transit_play = function() {
      this.state = this.state_play;
      return this.set_message([]);
    };

    Match.prototype.reset = function() {
      this.side = (this.player0.point + this.player1.point) % 2 === 0 ? 1.0 : -1.0;
      this.ball.reset(this.side, 2 * 12 * 0.0254 * this.end * this.side, 0.875, 39 * 12 * 0.0254 * this.end);
      this.mark.duration = 0.0;
      this.server.reset(this.end, Player.prototype.state_serve_set);
      this.receiver.node.position.set(-9 * 12 * 0.0254 * this.end * this.side, 0.0, -39 * 12 * 0.0254 * this.end);
      this.receiver.reset(-this.end, Player.prototype.state_default);
      this.camera0.position.set(0.0, 14.0, 0.0);
      this.camera0.lookAt(new THREE.Vector3(0.0, -12.0, -40.0 * (this.fixed ? 1.0 : this.player0.end)).add(this.camera0.position));
      this.camera1.position.set(0.0, 14.0, 0.0);
      return this.camera1.lookAt(new THREE.Vector3(0.0, -12.0, -40.0 * (this.fixed ? -1.0 : this.player1.end)).add(this.camera1.position));
    };

    Match.prototype.initialize = function(controller0, player0, controller1, player1, container, next) {
      return Match.__super__.initialize.call(this, controller0, player0, controller1, player1, (function(_this) {
        return function() {
          _this.exited = false;
          _this.container = container;
          _this.message = container.querySelector('.message');
          _this.onclick = function(event) {
            if (event.target.tagName !== 'BUTTON') {
              return;
            }
            _this.audio.sound_select.play();
            if (event.target.value === '') {
              return _this.back();
            } else {
              return _this.next();
            }
          };
          _this.container.addEventListener('click', _this.onclick);
          _this.new_set();
          return next();
        };
      })(this));
    };

    Match.prototype.new_set = function() {
      this.closed = false;
      this.player0.game = this.player1.game = 0;
      this.new_game();
      this.reset();
      return this.transit_ready();
    };

    Match.prototype.next = function() {
      if (!this.ball.done) {
        return;
      }
      if (this.second || this.ball.serving() && this.ball["in"] && this.ball.net) {
        this.reset();
        this.set_message([]);
        return this.step_things();
      } else if (this.closed) {
        return this.transit_close();
      } else {
        this.reset();
        return this.transit_ready();
      }
    };

    Match.prototype.back = function() {
      this.container.removeEventListener('click', this.onclick);
      return this.exited = true;
    };

    Match.prototype.set_message = function(message) {
      return this.message.innerText = message.join('\n');
    };

    return Match;

  })(Stage);

  Training = (function(superClass) {
    var state_select, toss_message, trainings;

    extend(Training, superClass);

    Training.prototype.ball_in = function() {
      this.mark.mark(this.ball);
      if (this.ball.hitter !== this.player0) {
        return;
      }
      return this.set_message(['IN']);
    };

    Training.prototype.ball_ace = function() {
      return this.duration = 0.5 * 64.0;
    };

    Training.prototype.ball_let = function() {
      this.mark.mark(this.ball);
      this.set_message(['LET']);
      return this.duration = 0.5 * 64.0;
    };

    Training.prototype.serve_miss = function() {
      this.set_message(['FAULT']);
      this.duration = 0.5 * 64.0;
      return this.sound_miss.play();
    };

    Training.prototype.ball_serve_air = function() {
      return this.serve_miss();
    };

    Training.prototype.miss = function(message) {
      this.set_message([message]);
      this.duration = 0.5 * 64.0;
      return this.sound_miss.play();
    };

    Training.prototype.step_things = function() {
      Training.__super__.step_things.call(this);
      this.camera1.position.set((this.ball.position.x + this.player0.root_position().x) * 0.5, 4.0, (this.ball.position.z + 40.0 * this.player1.end) * 0.5);
      return this.camera1.lookAt(new THREE.Vector3(0.0, -6.0, -40.0 * this.player1.end).add(this.camera1.position));
    };

    function Training(audio) {
      Training.__super__.constructor.call(this, audio, true, false);
    }

    Training.prototype.initialize = function(controller0, player0, player1, container, next) {
      return Training.__super__.initialize.call(this, controller0, player0, (function(_this) {
        return function(controller, player) {
          var super__step;
          super__step = controller.step;
          return controller.step = function() {
            if (player.state !== Player.prototype.state_swing) {
              player.left = player.right = player.forward = player.backward = false;
            }
            return super__step.call(this);
          };
        };
      })(this), player1, (function(_this) {
        return function() {
          var key, ref, value;
          ref = {
            9: function() {
              this.side = -this.side;
              return this.transit_ready();
            },
            13: function() {
              return this.transit_ready();
            }
          };
          for (key in ref) {
            value = ref[key];
            _this.state_ready.key_press[key] = value;
            _this.state_play.key_press[key] = value;
          }
          _this.camera0.position.set(0.0, 14.0, 0.0);
          _this.camera0.lookAt(new THREE.Vector3(0.0, -12.0, -40.0 * _this.player0.end).add(_this.camera0.position));
          _this.exited = false;
          _this.container = container;
          _this.message = container.querySelector('.message');
          _this.onclick = function(event) {
            if (event.target.tagName !== 'BUTTON') {
              return;
            }
            _this.audio.sound_select.play();
            if (event.target.value === '') {
              if (_this.current) {
                return _this.transit_select();
              } else {
                return _this.exit();
              }
            } else {
              slide(_this.container.querySelector('#trainings'), 'left');
              _this.current = trainings[event.target.value];
              return _this.transit_ready();
            }
          };
          _this.container.addEventListener('click', _this.onclick);
          _this.transit_select();
          return next();
        };
      })(this));
    };

    Training.prototype.next = function() {
      return this.ball.done && this.transit_ready();
    };

    Training.prototype.reset = function(x, y, z, position, shot) {
      this.ball.reset(this.side, x, y, z, false);
      this.mark.duration = 0.0;
      this.player0.node.position.copy(position);
      this.player0.reset(1.0, Player.prototype.state_default);
      this.player1.node.position.copy(this.ball.position).sub(new THREE.Vector3(0.0, 0.0, 0.0).applyMatrix4(this.player1.actions.swing[shot].spot));
      this.player1.node.position.setY(0.0);
      return this.player1.reset(-1.0, Player.prototype.state_default);
    };

    Training.prototype.toss = function(shot) {
      this.player1.node.lookAt(this.player1.shot_direction().add(this.player1.node.position));
      this.player1.set_motion(new player.Motion(this.player1.actions.swing[shot]));
      return this.player1.transit(Player.prototype.state_swing);
    };

    toss_message = ['     CHANGE SIDES: SELECT', '         POSITION: +     ', 'PLACEMENT & SWING: + & * ', '', '             LOB         ', '      TOPSPIN * FLAT     ', '            SLICE        '];

    trainings = {
      serve: {
        reset: function() {
          this.ball.reset(this.side, 2 * 12 * 0.0254 * this.side, 0.875, 39 * 12 * 0.0254);
          this.mark.duration = 0.0;
          this.player0.reset(1.0, Player.prototype.state_serve_set);
          this.player1.node.position.set(-9 * 12 * 0.0254 * this.side, 0.0, -39 * 12 * 0.0254);
          this.player1.reset(-1.0, Player.prototype.state_default);
          this.set_instruction(['CHANGE SIDES: SELECT', '    POSITION: < + > ', '        TOSS:   *   ', '   DIRECTION: < + > ', '       SWING:   *   ', '', '        SECOND      ', '     SPIN * FLAT    ', '        SLICE       ']);
          return this.duration = 0.0 * 64.0;
        },
        play: function() {}
      },
      stroke: {
        reset: function() {
          this.reset(3 * 12 * 0.0254 * this.side, 1.0, -39 * 12 * 0.0254, new THREE.Vector3((0.0 - 3.2 * this.side) * 12 * 0.0254, 0.0, 39 * 12 * 0.0254), 'toss');
          this.set_instruction(toss_message);
          return this.duration = 0.5 * 64.0;
        },
        play: function() {
          return this.toss('toss');
        }
      },
      volley: {
        reset: function() {
          this.reset(3 * 12 * 0.0254 * this.side, 1.0, -39 * 12 * 0.0254, new THREE.Vector3((0.1 - 2.0 * this.side) * 12 * 0.0254, 0.0, 13 * 12 * 0.0254), 'toss');
          this.set_instruction(toss_message);
          return this.duration = 0.5 * 64.0;
        },
        play: function() {
          return this.toss('toss');
        }
      },
      smash: {
        reset: function() {
          this.reset(3 * 12 * 0.0254 * this.side, 1.0, -39 * 12 * 0.0254, new THREE.Vector3((0.4 - 0.4 * this.side) * 12 * 0.0254, 0.0, 9 * 12 * 0.0254), 'toss_lob');
          this.set_instruction(toss_message);
          return this.duration = 0.5 * 64.0;
        },
        play: function() {
          return this.toss('toss_lob');
        }
      }
    };

    Training.prototype.back = function() {
      return this.transit_select();
    };

    Training.prototype.exit = function() {
      this.container.removeEventListener('click', this.onclick);
      return this.exited = true;
    };

    state_select = Stage.prototype.State((function() {}), {
      27: function() {
        return this.exit();
      }
    }, {});

    Training.prototype.transit_select = function() {
      slide(this.container.querySelector('#trainings'), 'center');
      this.state = state_select;
      this.current = null;
      this.side = 1.0;
      this.ball.reset(this.side, 2 * 12 * 0.0254, this.ball.radius + 0.01, 2 * 12 * 0.0254);
      this.mark.duration = 0.0;
      this.player0.node.position.set((0.1 - 2.0 * this.side) * 12 * 0.0254, 0.0, 13 * 12 * 0.0254);
      this.player0.reset(1.0, Player.prototype.state_default);
      this.player1.node.position.set((0.1 + 2.0 * this.side) * 12 * 0.0254, 0.0, -13 * 12 * 0.0254);
      this.player1.reset(-1.0, Player.prototype.state_default);
      this.set_message([]);
      return this.step_things();
    };

    Training.prototype.transit_ready = function() {
      this.state = this.state_ready;
      this.current.reset.call(this);
      return this.step_things();
    };

    Training.prototype.transit_play = function() {
      this.state = this.state_play;
      return this.current.play.call(this);
    };

    Training.prototype.set_message = function(message) {
      this.message.style.verticalAlign = 'middle';
      this.message.style.fontSize = '2em';
      return this.message.innerText = message.join('\n');
    };

    Training.prototype.set_instruction = function(message) {
      this.message.style.verticalAlign = 'bottom';
      this.message.style.fontSize = '0.5em';
      return this.message.innerText = message.join('\n');
    };

    return Training;

  })(Stage);

  controller0 = function(controller, player) {
    var key, ref, ref1, results, value;
    ref = {
      49: function() {
        return player.perform('topspin');
      },
      50: function() {
        return player.perform('flat');
      },
      VOLUMEUP: function() {
        return player.perform('lob');
      },
      VOLUMEDOWN: function() {
        return player.perform('slice');
      },
      37: function() {
        return player.left = true;
      },
      39: function() {
        return player.right = true;
      },
      38: function() {
        return player.forward = true;
      },
      40: function() {
        return player.backward = true;
      },
      74: function() {
        return player.perform('topspin');
      },
      76: function() {
        return player.perform('flat');
      },
      73: function() {
        return player.perform('lob');
      },
      77: function() {
        return player.perform('slice');
      },
      83: function() {
        return player.left = true;
      },
      70: function() {
        return player.right = true;
      },
      69: function() {
        return player.forward = true;
      },
      67: function() {
        return player.backward = true;
      }
    };
    for (key in ref) {
      value = ref[key];
      controller.key_press[key] = value;
    }
    ref1 = {
      37: function() {
        return player.left = false;
      },
      39: function() {
        return player.right = false;
      },
      38: function() {
        return player.forward = false;
      },
      40: function() {
        return player.backward = false;
      },
      83: function() {
        return player.left = false;
      },
      70: function() {
        return player.right = false;
      },
      69: function() {
        return player.forward = false;
      },
      67: function() {
        return player.backward = false;
      }
    };
    results = [];
    for (key in ref1) {
      value = ref1[key];
      results.push(controller.key_release[key] = value);
    }
    return results;
  };

  controller1 = function(controller, player) {
    var key, ref, ref1, results, value;
    ref = {
      55: function() {
        return player.perform('topspin');
      },
      57: function() {
        return player.perform('flat');
      },
      60: function() {
        return player.perform('lob');
      },
      62: function() {
        return player.perform('slice');
      },
      52: function() {
        return player.left = true;
      },
      54: function() {
        return player.right = true;
      },
      56: function() {
        return player.forward = true;
      },
      53: function() {
        return player.backward = true;
      }
    };
    for (key in ref) {
      value = ref[key];
      controller.key_press[key] = value;
    }
    ref1 = {
      52: function() {
        return player.left = false;
      },
      54: function() {
        return player.right = false;
      },
      56: function() {
        return player.forward = false;
      },
      53: function() {
        return player.backward = false;
      }
    };
    results = [];
    for (key in ref1) {
      value = ref1[key];
      results.push(controller.key_release[key] = value);
    }
    return results;
  };

  Audio = (function() {
    var Source;

    Source = (function() {
      function Source(audio1, buffer1) {
        this.audio = audio1;
        this.buffer = buffer1;
      }

      Source.prototype.play = function() {
        var source;
        source = this.audio.createBufferSource();
        source.buffer = this.buffer;
        source.connect(this.audio.destination);
        return source.start(0);
      };

      return Source;

    })();

    function Audio() {
      this.audio = new AudioContext;
    }

    Audio.prototype.load = function(url, next) {
      var request;
      request = new XMLHttpRequest;
      request.open('GET', url);
      request.responseType = 'arraybuffer';
      request.onload = (function(_this) {
        return function() {
          return _this.audio.decodeAudioData(request.response, function(buffer) {
            return next(new Source(_this.audio, buffer));
          });
        };
      })(this);
      return request.send();
    };

    return Audio;

  })();

  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  setup = function(screen, container, onexit) {
    var back, onclick, onkeydown, onkeyup, onresize, overlay, render, renderer, stats;
    back = container.querySelector('.back');
    overlay = container.querySelector('div');
    renderer = new THREE.WebGLRenderer;
    renderer.autoClear = false;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.insertBefore(renderer.domElement, overlay);
    stats = new Stats;
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '3em';
    stats.domElement.style.visibility = back.style.visibility;
    container.appendChild(stats.domElement);
    onresize = function() {
      return renderer.setSize(window.innerWidth, window.innerHeight);
    };
    onkeydown = function(event) {
      if (screen.key_press(event.keyCode)) {
        return event.preventDefault();
      }
    };
    onkeyup = function(event) {
      if (screen.key_release(event.keyCode)) {
        return event.preventDefault();
      }
    };
    window.addEventListener('resize', onresize);
    window.addEventListener('keydown', onkeydown);
    window.addEventListener('keyup', onkeyup);
    onclick = function() {
      var value;
      if (!event.target.classList.contains('content')) {
        return;
      }
      value = back.style.visibility === 'hidden' ? 'visible' : 'hidden';
      back.style.visibility = value;
      return stats.domElement.style.visibility = value;
    };
    window.addEventListener('click', onclick);
    render = function() {
      if (screen.exited) {
        window.removeEventListener('resize', onresize);
        window.removeEventListener('keydown', onkeydown);
        window.removeEventListener('keyup', onkeyup);
        window.removeEventListener('click', onclick);
        container.removeChild(renderer.domElement);
        container.removeChild(stats.domElement);
        return onexit();
      }
      requestAnimationFrame(render);
      THREE.AnimationHandler.update(1.0 / 60.0);
      screen.step();
      screen.render(renderer, window.innerWidth, window.innerHeight);
      return stats.update();
    };
    return render();
  };

  audio = new Audio;

  slide = function(element, where) {
    element.disabled = where !== 'center';
    element.classList.remove('slide-left');
    element.classList.remove('slide-center');
    element.classList.remove('slide-right');
    return element.classList.add('slide-' + where);
  };

  chooseItem = function(items, next) {
    var onclick;
    onclick = function(event) {
      if (event.target.tagName !== 'BUTTON') {
        return;
      }
      audio.sound_select.play();
      items.removeEventListener('click', onclick);
      return next(event.target);
    };
    return items.addEventListener('click', onclick);
  };

  showMenu = function() {
    var i, j, len, len1, menu, ref, ref1, screen, slider;
    ref = document.querySelectorAll('.screen');
    for (i = 0, len = ref.length; i < len; i++) {
      screen = ref[i];
      screen.style.display = 'none';
    }
    ref1 = document.querySelectorAll('.slider');
    for (j = 0, len1 = ref1.length; j < len1; j++) {
      slider = ref1[j];
      slide(slider, 'right');
    }
    slide(document.getElementById('players0'), 'center');
    document.getElementById('players-screen').style.display = 'table';
    document.getElementById('background').style.display = 'block';
    menu = document.getElementById('menu-screen');
    slide(menu, 'center');
    menu.style.display = 'table';
    return chooseItem(menu, showPlayers0);
  };

  showPlayers0 = function(stage) {
    var players;
    slide(document.getElementById('menu-screen'), 'left');
    slide(document.getElementById('players1'), 'right');
    slide(document.getElementById('players0'), 'center');
    players = document.getElementById('players-screen');
    players.querySelector('.title').innerText = stage.innerText + '\n???? vs ____';
    slide(players, 'center');
    return chooseItem(players, function(player0) {
      if (player0.value === '') {
        return showMenu();
      }
      return showPlayers1(stage, player0);
    });
  };

  showPlayers1 = function(stage, player0) {
    var players;
    slide(document.getElementById('players0'), 'left');
    slide(document.getElementById('ready'), 'right');
    players = document.getElementById('players-screen');
    players.querySelector('.title').innerText = stage.innerText + '\n' + player0.innerText + ' vs ????';
    slide(document.getElementById('players1'), 'center');
    return chooseItem(players, function(player1) {
      if (player1.value === '') {
        return showPlayers0(stage);
      }
      return showReady(stage, player0, player1);
    });
  };

  showReady = function(stage, player0, player1) {
    var players;
    slide(document.getElementById('players1'), 'left');
    players = document.getElementById('players-screen');
    players.querySelector('.title').innerText = stage.innerText + '\n' + player0.innerText + ' vs ' + player1.innerText;
    slide(document.getElementById('ready'), 'center');
    return chooseItem(players, function(start) {
      var container, onready, screen;
      if (start.value === '') {
        return showPlayers1(stage, player0);
      }
      players.style.display = 'none';
      document.getElementById('loading-screen').style.display = 'table';
      container = document.getElementById(stage.value === 'training' ? 'training-screen' : 'match-screen');
      onready = function(screen) {
        return function() {
          document.getElementById('background').style.display = 'none';
          container.style.display = 'block';
          return setup(screen, container, showMenu);
        };
      };
      switch (stage.value) {
        case '1pvscom':
          screen = new Match(audio, false, false);
          return screen.initialize(controller0, player0.value, computer.controller, player1.value, container, onready(screen));
        case 'comvscom':
          screen = new Match(audio, false, true);
          return screen.initialize(computer.controller, player0.value, computer.controller, player1.value, container, onready(screen));
        case 'training':
          screen = new Training(audio);
          return screen.initialize(controller0, player0.value, player1.value, container, onready(screen));
      }
    });
  };

  audio.load('data/select.wav', function(sound) {
    audio.sound_select = sound;
    return showMenu();
  });

}).call(this);
