  this.playChanson = function(oEvent) {
    var oItem = oEvent.currentTarget,
      sDownload = oItem.getAttribute("data-download"),
      sUrl = "https://docs.google.com/uc?export=open&id=" + sDownload;
    /* A vous de gérer la manière de recupere l'ur du son */
