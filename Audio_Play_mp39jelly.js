/* //////////////////////////////////////////////
Plus d'informations liées à la solution  : 
////////////////////////////////////////////// */

/*
Toutes le fonctions ci-dessous peuvent être optimisées
elles sont même volontairement non optimisées
Elles sont là juste pour vous présenter le concept à vous de les améliorer 
*/

/*
 * @param String  sIdPlayer         valeur de l'attribut Id element contenant
 *                                  une balise audio 
 *                                  et classe play-list ses fils directs déclenche l'audio
 * @param Boolean bStopOtherParam   true = met en pause les autres playlists liées
 *                                  false par défaut
 **/
function PlayList(sIdPlayer, bStopOtherParam) {
  this.bStopOther = bStopOtherParam == undefined ? false : bStopOtherParam;
  this.sName = sIdPlayer;
  this.oPlayer = null;
  this.oPlaylist = null;
  this.oChanson = null;
  this.oLecteur = null;
  this.iNbChansons = 0;
  this.createSound = function(oParent) {
    var oSound = document.createElement("audio");
    oSound.setAttribute("preload", "auto");
    oSound.setAttribute("controls", "true");
    oSound.setAttribute("autoplay", "true");
    oSound.style.display = "none";
    oParent.parentNode.insertBefore(oSound, oParent);
    return oSound;
  }; //fct
  this.getaPlayers = function() {
    return window["aPlayers"] != undefined ? window["aPlayers"] : null;
  }; //fct
  this.resetSlection = function() {
    if (this.oChanson != null) {
      this.oPlayer.pause();
      this.setLine(this.oChanson, this.oPlayer.paused, true);
    } //if
  }; //fct
  this.stopOther = function() {
    var aPlayers = this.getaPlayers();
    if (this.bStopOther == true && aPlayers != null) {
      for (var i = 0; i < aPlayers.length; i++) {
        if (aPlayers[i] != this) {
          aPlayers[i].resetSlection();
        } //if
      } //for
    } //iff
  }; //fct
  this.playChanson = function(oEvent) {
    var oItem = oEvent.currentTarget,
      sSound = oItem.getAttribute("data-sound"),
      sUrl = "https://docs.google.com/uc?export=open&id=" + sSound;
    /* A vous de gérer la manière de recupere l'ur du son */
    this.stopOther();
    if (this.oChanson == oItem) {
      if (this.oPlayer.paused == true) {
        this.oPlayer.play();
      } else {
        this.oPlayer.pause();
      } //else
      this.setLine(this.oChanson, this.oPlayer.paused, true);
    } else {
      this.oPlayer.src = sUrl;
      this.oPlayer.play();
      this.setLine(this.oChanson, true, false);
      this.setLine(oItem, false, true);
    } //else
    this.oChanson = oItem;
  }; //fct
  this.setLine = function(oItem, bPause, bSelected, bError) {
    if (oItem == null) {
      return;
    }
    if (bError == undefined) {
      bError = false;
    }
    var sSelected = "selected",
      sPause = "pause_circle_outline",
      sPlay = "play_circle_outline",
      sError = "block",
      oIcone = oItem.children[0];
    if (bSelected == true) {
      oItem.classList.add(sSelected);
    } else {
      oItem.classList.remove(sSelected);
    } //else
    if (bError == true) {
      oIcone.innerHTML = sError;
      return;
    } //if
    if (bPause == true) {
      oIcone.innerHTML = sPlay;
    } else if (bPause == false) {
      oIcone.innerHTML = sPause;
    } else {
      oIcone.innerHTML = bPause;
    } //else
  }; //fct

  this.playerEvent = function(oEvent) {
    if (
      this.oChanson != null &&
      (oEvent.type == "play" ||
        oEvent.type == "pause" ||
        oEvent.type == "playing")
    ) {
      this.setLine(this.oChanson, this.oPlayer.paused, true);
    } else if (oEvent.type == "error") {
      this.setLine(this.oChanson, this.oPlayer.paused, false, true);
      this.oChanson = null;
    } else if (oEvent.type == "waiting") {
      this.setLine(this.oChanson, "cloud_queue", true);
    } //else if
  }; //fct
  this.getNext = function(oEvent) {
    if (this.oChanson !== null && this.oLecteur.bLoop == true) {
      var iPos = Number(this.oChanson.getAttribute("data-position"));
      if (iPos + 1 >= this.iNbChansons) {
        iPos = 0;
      } else {
        iPos++;
      }
      this.playChanson({ currentTarget: this.oPlaylist.children[iPos] });
    }
  }; //fct
  this.init = function() {
    if (this.sName == "") {
      return false;
    }
    var oPlayerWdg = document.getElementById(this.sName);
    if (oPlayerWdg == null) {
      return false;
    }
    var oMyWdg = this,
      aPlaylist = null,
      oTmpAudio = oPlayerWdg.getElementsByTagName("audio"),
      oTmpList = oPlayerWdg.getElementsByClassName("play-list");
    if (oTmpList.length == 0) {
      return false;
    }
    this.oPlaylist = oTmpList[0];
    this.oPlayer = this.createSound(this.oPlaylist);
    if (this.bStopOther) {
      window["aPlayers"] =
        window["aPlayers"] == undefined ? [] : window["aPlayers"];
      window["aPlayers"].push(this);
    }
    aPlaylist = this.oPlaylist.children;
    for (var i = 0; i < aPlaylist.length; i++) {
      aPlaylist[i].addEventListener("click", function(oEvent) {
        oMyWdg.playChanson(oEvent);
      });
      aPlaylist[i].setAttribute("data-position", i);
    }
    this.iNbChansons = aPlaylist.length;
    this.oLecteur = new lecteur(oPlayerWdg, this.oPlayer);
    this.oPlayer.addEventListener("play", function(oEvent) {
      oMyWdg.playerEvent(oEvent);
      oMyWdg.oLecteur.playerEvent(oEvent);
    });
    this.oPlayer.addEventListener("pause", function(oEvent) {
      oMyWdg.playerEvent(oEvent);
    });
    this.oPlayer.addEventListener("error", function(oEvent) {
      oMyWdg.playerEvent(oEvent);
    });
    this.oPlayer.addEventListener("ended", function(oEvent) {
      oMyWdg.getNext(oEvent);
    });
    this.oPlayer.addEventListener("waiting", function(oEvent) {
      oMyWdg.playerEvent(oEvent);
    });
    this.oPlayer.addEventListener("playing", function(oEvent) {
      oMyWdg.playerEvent(oEvent);
    });

    return this.oLecteur.bError;
  };
  this.bError = this.init();
} //fct

function lecteur(oPlayerWdg, oPlayerParam) {
  this.oPlayerWdg = null;
  this.btPlay = null;
  this.btBoucle = null;
  this.btVolume = null;
  this.btMuted = null;
  this.textCurrentTime = null;
  this.textDuration = null;
  this.blocVolume = null;
  this.lineVolume = null;
  this.blocTime = null;
  this.lineCurrentTime = null;
  this.blocTimeLoad = null;
  this.btCurrentTime = null;
  this.oPlayer = oPlayerParam;
  this.bLoop = false;
  this.btDragCurrent = false;
  this.btDragVol = false;
  this.setTimeupdate = function(oEvent) {
    //console.log("setTimeupdate");
    this.textCurrentTime.innerHTML = this.formatTime(this.oPlayer.currentTime);
    this.setBarreTime();
  };
  this.setBarreTime = function() {
    var iDure = this.oPlayer.duration,
      iWidth = this.blocTime.offsetWidth,
      iCurrentTime = this.oPlayer.currentTime,
      iPoucent = iCurrentTime * 100 / iDure;
    //console.log(iDure,iWidth,iCurrentTime, iPoucent);
    this.lineCurrentTime.style.width = iPoucent + "%";
    this.btCurrentTime.style.left = iPoucent + "%";
  }; //fct

  this.deleteBuffered = function() {
    this.blocTimeLoad.innerHTML = "";
  };
  this.setProgress = function(oEvent) {
    var sDuration = this.oPlayer.duration,
      aBuffered = this.oPlayer.buffered;
    for (var i = 0; i < aBuffered.length; i++) {
      var oBuffered = document.createElement("span"),
        iStart = aBuffered.start(i),
        iEnd = aBuffered.end(i);
      if (typeof this.blocTimeLoad.children[i] == "undefined") {
        oBuffered.className = "line-pos";
        this.blocTimeLoad.append(oBuffered);
      } else {
        oBuffered = this.blocTimeLoad.children[i];
      }
      oBuffered.style.width =
        Math.ceil((iEnd - iStart) * 100 / sDuration) + "%";
      oBuffered.style.left = Math.ceil(iStart * 100 / sDuration) + "%";
    }

    while (
      this.blocTimeLoad.children.length > aBuffered.length &&
      this.blocTimeLoad.children.length > 0
    ) {
      this.blocTimeLoad.children[
        this.blocTimeLoad.children.length - 1
      ].remove();
    }
  }; //fct
  this.setLoadeddata = function(oEvent) {
    //console.log("setLoadeddata");
    this.deleteBuffered();
    this.textDuration.innerHTML = this.formatTime(this.oPlayer.duration);
  }; //fct
  this.playerEvent = function(oEvent) {
    if (oEvent.type == "play" || oEvent.type == "pause") {
      this.setBtPlay();
    }
  }; //fct
  this.setBtPlay = function() {
    var sIcone = "pause";
    if (this.oPlayer.paused == true) {
      sIcone = "play_arrow";
    }
    this.btPlay.innerHTML = sIcone;
  }; //fct
  this.setPlay = function(oEvent) {
    if (this.oPlayer.paused == true) {
      this.oPlayer.play();
    } else {
      this.oPlayer.pause();
    }
    this.setBtPlay();
  }; //fct
  this.setMuted = function(oEvent) {
    if (this.oPlayer.muted == true) {
      this.oPlayer.volume = 0.5;
    }
    this.oPlayer.muted = !this.oPlayer.muted;
  }; //fct
  this.setBtMuted = function() {
    var sIcone = "volume_up";
    if (this.oPlayer.muted == true) {
      sIcone = "volume_off";
      this.oPlayer.volume = 0;
    }
    this.btMuted.innerHTML = sIcone;
  }; //fct
  this.setVolumechange = function(oEvent) {
    //console.log("setVolumechange");
    if (this.oPlayer.volume == 0 && this.oPlayer.muted == false) {
      this.oPlayer.muted = true;
    }
    this.setBtMuted();
    this.setBarreVolume();
  }; //fct

  this.setBarreVolume = function() {
    var iVolume = this.oPlayer.volume * 100;
    this.btVolume.style.left = iVolume + "%";
    this.lineVolume.style.width = iVolume + "%";
  }; //fct

  this.setLoop = function(oEvent) {
    this.btBoucle.classList.toggle("selected");
    this.bLoop = this.btBoucle.classList.contains("selected");
  }; //fct

  this.formatTime = function(fSeconde) {
    var fFormat = "00:00",
      d = new Date("July 20, 69 00:00:00");
    d.setSeconds(fSeconde);
    var sH = Number(d.getHours()),
      sMi = Number(d.getMinutes()),
      sSe = Number(d.getSeconds());
    fFormat = (sMi < 10 ? "0" + sMi : sMi) + ":" + (sSe < 10 ? "0" + sSe : sSe);
    if (sH > 0) {
      fFormat = (sH < 10 ? "0" + sH : sH) + ":" + fFormat;
    }
    return fFormat;
  }; //fct

  this.getPourcentage = function(iClientX, iWidth, oRect) {
    return (iClientX - oRect.left) * 100 / iWidth;
  }; //fct

  this.getCurrentTime = function(iPoucent) {
    return (this.oPlayer.duration * iPoucent / 100).toFixed(5);
  }; //fct
  this.setInBarre = function(oEvent) {
    //console.log("setInBarre",this.oPlayer.duration);
    var oBarre = oEvent.currentTarget,
      iPoucent = this.getPourcentage(
        oEvent.clientX,
        oBarre.offsetWidth,
        oBarre.getBoundingClientRect()
      );
    if (oBarre == this.blocVolume) {
      this.oPlayer.volume = iPoucent / 100;
    } else if (
      oBarre == this.blocTime &&
      isNaN(this.oPlayer.duration) != true
    ) {
      this.oPlayer.currentTime = this.getCurrentTime(iPoucent);
    }
  }; //fct
  this.setBtinBarreCurrentTime = function(oEvent) {
    //console.log("setBtinBarreCurrentTime");
    if (oEvent.type == "mousedown") {
      this.btDragCurrent = true;
    } else if (
      oEvent.type == "mousemove" &&
      this.btDragCurrent == true &&
      isNaN(this.oPlayer.duration) != true
    ) {
      var iPoucent = this.getPourcentage(
        oEvent.clientX,
        this.blocTime.offsetWidth,
        this.blocTime.getBoundingClientRect()
      );
      //console.log("setBtinBarreCurrentTime mousemove", (this.oPlayer.duration * iPoucent / 100).toFixed(5));
      this.oPlayer.currentTime = this.getCurrentTime(iPoucent);
    }
  }; //fct

  this.setBtinBarreVolume = function(oEvent) {
    //console.log("setBtinBarreVolume");
    if (oEvent.type == "mousedown") {
      this.btDragVol = true;
    } else if (oEvent.type == "mousemove" && this.btDragVol == true) {
      var iWidth = this.blocVolume.offsetWidth,
        oRect = this.blocVolume.getBoundingClientRect(),
        iPoucent = (oEvent.clientX - oRect.left) * 100 / iWidth;
      this.oPlayer.volume = iPoucent / 100;
    }
  }; //fct

  this.setMousePos = function(oEvent) {
    if (this.btDragVol == true) {
      this.setBtinBarreVolume(oEvent);
    } else if (this.btDragCurrent == true) {
      this.setBtinBarreCurrentTime(oEvent);
    }
  }; //fct

  this.setEnableBtBarre = function(oEvent) {
    this.btDragCurrent = false;
    this.btDragVol = false;
  }; //fct

  this.init = function(oPlayerWdg) {
    var aConf = {
        btPlay: "bt-play",
        btVolume: "bt-volumePos",
        btMuted: "bt-volumeMuted",
        btBoucle: "bt-loop",
        textCurrentTime: "id-currentTimeText",
        textDuration: "id-durationText",
        blocVolume: "id-blocVolumeLine",
        lineVolume: "id-volumeLinePast",
        blocTime: "id-blocTimeLine",
        lineCurrentTime: "id-timeLinePast",
        blocTimeLoad: "id-blocTimeLineLoaded",
        btCurrentTime: "bt-currentTime"
      },
      oMyWdg = this;
    for (var i in aConf) {
      var oTemp = oPlayerWdg.getElementsByClassName(aConf[i]);
      console.log(i, aConf[i]);
      if (oTemp.length > 0) {
        this[i] = oTemp[0];
      } else {
        return false;
      }
    }
    this.oPlayerWdg = oPlayerWdg;
    this.btPlay.addEventListener("click", function(oEvent) {
      oMyWdg.setPlay(oEvent);
    });
    this.btMuted.addEventListener("click", function(oEvent) {
      oMyWdg.setMuted(oEvent);
    });
    this.btBoucle.addEventListener("click", function(oEvent) {
      oMyWdg.setLoop(oEvent);
    });
    this.blocVolume.addEventListener("click", function(oEvent) {
      oMyWdg.setInBarre(oEvent);
    });
    this.blocTime.addEventListener("click", function(oEvent) {
      oMyWdg.setInBarre(oEvent);
    });

    this.btVolume.addEventListener("mousedown", function(oEvent) {
      oMyWdg.setBtinBarreVolume(oEvent);
    });
    this.btCurrentTime.addEventListener("mousedown", function(oEvent) {
      oMyWdg.setBtinBarreCurrentTime(oEvent);
    });

    this.oPlayer.addEventListener("pause", function(oEvent) {
      oMyWdg.playerEvent(oEvent);
    });
    this.oPlayer.addEventListener("progress", function(oEvent) {
      oMyWdg.setProgress(oEvent);
    });
    this.oPlayer.addEventListener("volumechange", function(oEvent) {
      oMyWdg.setVolumechange(oEvent);
    });
    this.oPlayer.addEventListener(
      "timeupdate",
      function(oEvent) {
        oMyWdg.setTimeupdate(oEvent);
      },
      true
    );
    this.oPlayer.addEventListener("loadeddata", function(oEvent) {
      oMyWdg.setLoadeddata(oEvent);
    });

    document.addEventListener("mousemove", function(oEvent) {
      oMyWdg.setMousePos(oEvent);
    });
    document.addEventListener("mouseup", function(oEvent) {
      oMyWdg.setEnableBtBarre(oEvent);
    });
  };
  this.bError = this.init(oPlayerWdg);
}

document.addEventListener("DOMContentLoaded", function() {
  var oMyPlayListOne = new PlayList("playerone", true);
  var oMyPlayListTwo = new PlayList("playertwo", true);
});
