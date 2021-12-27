var props = {};
var combo = {};
var proprietiesTypes = [];
document.addEventListener("DOMContentLoaded", function(event) {

  var canvas = document.getElementById('canvas');
  canvas.width = 500;
  canvas.height = 500;

  document.getElementById('inp').onchange = function(e) {
    for(let item of this.files){
      var img = new Image();
      img.onload = draw;
      img.onerror = failed;
      img.src = URL.createObjectURL(item);
      img.name = item.name.split('.')[0].replace(/ /g, '');
      img.type = document.getElementById("propName").value;
    }
  };
  function draw() {
    if (!(props.hasOwnProperty(this.type))){
      props[this.type] = {};
    }
    props[this.type][this.name] = this;
  }
  function failed() {
    console.error("The provided file couldn't be loaded as an Image media");
  }
  document.getElementById('test').onclick = function(e){
    for (let obj of Object.getOwnPropertyNames(props)){
      for(let i of (Object.getOwnPropertyNames(props[obj]))){
        document.getElementById('canvas').getContext('2d').drawImage(props[obj][i], 0, 0, 500, 500);
      }
    }
  }

  document.getElementById('download').onclick = function(e){
    /*const url = $("#canvas").get(0).toDataURL("img/png");
    const a = document.createElement('a');
    a.style.display = 'none';//
    a.href = url;

    // the filename you want
    a.download = 'Test_image.png';
    document.body.appendChild(a);
    a.click();*/

    //URL.createObjectURL(new Blob([...this.file],{type:'application/octet-stream'}));
      var x = [];

      var template = {};
      template.canvas = document.createElement('canvas');
      proprietiesTypes = Object.getOwnPropertyNames(props);
      var oneImage = props[proprietiesTypes[0]][Object.getOwnPropertyNames(props[proprietiesTypes[0]])[0]];
      template.canvas.width = oneImage.width;
      template.canvas.height = oneImage.height;
      //reset global variable
      combo = {};

      recurseProps(props, "", template, 0);

      //setup fake anchor to be clicked and triger the downloads
      const a = document.createElement('a');
      a.style.display = 'none';//
      //a.href = $(canv).get(0).toDataURL("img/png");

      // the filename you want
      a.download = 'Test_image.png';
      document.body.appendChild(a);
      for(let i of Object.getOwnPropertyNames(combo)){
        a.href = $(combo[i].canvas).get(0).toDataURL("img/png");
        console.log("Saving2: " + i);
        a.click();
      }
    };

    function recurseProps(proprieties, key, ret, headerIndex){
        if(headerIndex == proprietiesTypes.length) {
          //if there's no more proprieties to go through, add results
          //to combo and end
          combo[key] = ret;
          return;
        }
        //get first propriety {}, make a copy of it's proprieties
        //and remove it from the one to be recursed
        var objectName = proprietiesTypes[headerIndex];
        var thisProp = proprieties[objectName];
        for(let i of Object.getOwnPropertyNames(thisProp)){
            //make copys to add i's data to the values
            var thisKey = key + i;
            var thisRet = JSON.parse(JSON.stringify(ret));
            thisRet.canvas = document.createElement('canvas');
            thisRet.canvas.width = ret.canvas.width;
            thisRet.canvas.height = ret.canvas.height;
            thisRet.canvas.getContext('2d').drawImage(ret.canvas, 0, 0);
            //draw image to canvas
            thisRet.canvas.getContext('2d').drawImage(thisProp[i], 0, 0);
            //add picture information to return {}
            thisRet[objectName] = i;
            //recurse
            recurseProps(proprieties, thisKey, thisRet, headerIndex + 1);
        }
        return;
      }
  });
