/*********************************************************
          Global Variables
**********************************************************/
var props = {}; //Stores the different proprieties
var combo = {}; //Stores the combo of the above
var proprietiesTypes = []; //Keeps the overlay order of different types when rendering the images
var curProprieties = []; //Keeps the individudal images to be used when clicking the "test" button

/*********************************************************
            General functions
**********************************************************/
//Simple remove from array function
const removeNumber = (arr, num) => arr.filter(el => el !== num);

//Checks if the proprietyType already exists before adding it to the array
function addProprietyType(name){
  if (!proprietiesTypes.includes(name)){
    proprietiesTypes.push(name);
  }
}
/*********************************************************
            Tab Control Functions
**********************************************************/
function moveTab(index, isUp){ //isUp = 0 = down,  1 = up
  var temp = proprietiesTypes[index];
  proprietiesTypes[index] = proprietiesTypes[index + (isUp > 0 ? -1 : 1)];
  proprietiesTypes[index + (isUp > 0 ? -1 : 1)] = temp;
  reloadTabs();
}
function deleteTab(index){
  //dispose of images
  for(let i of (Object.getOwnPropertyNames(props[proprietiesTypes[index]]))){
    props[proprietiesTypes[index]].src = '';
    props[proprietiesTypes[index]] = null;
  }
  //remove object
  delete props[proprietiesTypes[index]];
  //remove from array with the order
  proprietiesTypes = removeNumber(proprietiesTypes, proprietiesTypes[index]);
  //Reload view
  reloadTabs();
}
function addToTab(index){
  //Click new tab, but add the value of the selected tab in it
  document.getElementById('newTab').click();
  document.getElementById('propName').value = proprietiesTypes[index];
}

/**********************************************************
                Reload Tabs
***********************************************************/

function reloadTabs(){
  //EMpty the tab container
  document.getElementById('tabs').innerHTML = "";
  //make a new tab container
  var tabs = document.createElement('div');
  tabs.classList.add( "tabs" ); //add the CSS class to it
  //counter
  var t = 0;
  //add the tabs based on the proprieties to the new container
  for (let obj of proprietiesTypes){
    var newTab = document.createElement('div');
    newTab.classList.add("tab");
    newTab.innerHTML = '<div class="tabHeader">' + obj + '</div>';
    newTab.innerHTML +=
      '<div class="tabControls">'
      //Up button
      + (t > 0 ? '<input type="button" value="/\\" class="tabButtonUp" onclick="moveTab('+ t + ', 1)">' : '')
      //DOwn Button
      + (t < proprietiesTypes.length - 1 ? '<input type="button" value="\\/" class="tabButtonDown" onclick="moveTab('+ t + ', 0)">' : '')
      //Add Button
      + '<input type="button" value="Add" class="tabButtonDown" onclick="addToTab('+ t + ')">'
      //delete Button
      + '<input type="button" value="Delete" class="tabButtonDown" onclick="deleteTab('+ t + ')">'
      //Div for Switiching selected image
      + '<div class="tabContentSlider" >'
      ;
      //increment counter
      t++;
      //Go through every image in each propriety
    for(let i of (Object.getOwnPropertyNames(props[obj]))){
      newTab.innerHTML += '<div class="imageContainer"><img src="' + props[obj][i].src + '" width="250px" height="250px"></div>';
    }
    newTab.innerHTML += "</div></div>";
    tabs.appendChild(newTab);
  }
  //render the new tabs
  document.getElementById('tabs').innerHTML = tabs.innerHTML;
}

/**********************************************************
                After document loaded
***********************************************************/
document.addEventListener("DOMContentLoaded", function(event) {

  var canvas = document.getElementById('canvas');
  canvas.width = 300;
  canvas.height = 300;



  /**********************************************************
                  Parse new Images into props
  ***********************************************************/
  var countImages = 0;
  var countImagesLoaded = 0;
  function loadImages() {
    var picker = document.getElementById('inp'); //multi file picker from form
    for(let item of picker.files){
      var img = new Image();
      img.onload = loadProp;
      img.onerror = failed;
      img.src = URL.createObjectURL(item);
      img.name = item.name.split('.')[0].replace(/ /g, ''); //just the file name, no extension
      img.type = document.getElementById("propName").value; //The category name on the form/popup
      countImages++;
    }
  }
  function loadProp() {
    if (!(props.hasOwnProperty(this.type))){
      props[this.type] = {};
      addProprietyType(this.type);
    }
    props[this.type][this.name] = this;
    countImagesLoaded++;
    if (countImages = countImagesLoaded){
      reloadTabs();
    }
  }
  function failed() {
    console.error("The provided file couldn't be loaded as an Image media");
    countImagesLoaded++;
  }

/**********************************************************
          On Click Events for static controls
***********************************************************/
  document.getElementById('loadImages').onclick = function(e){
    document.getElementById('newTabPopup').classList.add("invisible");
    loadImages();
  };
  document.getElementById('test').onclick = function(e){
    for (let obj of /*Object.getOwnPropertyNames(props)*/ proprietiesTypes){
      for(let i of (Object.getOwnPropertyNames(props[obj]))){
        document.getElementById('canvas').getContext('2d').drawImage(props[obj][i], 0, 0, 300, 300);
      }
    }
  };
  document.getElementById('newTab').onclick = function(e){
    document.getElementById('newTabPopup').classList.remove("invisible");
    document.getElementById('propName').value = "";
    //if (document.getElementById('inp').files.length > 0){
      document.getElementById('inp').value = null;
    //}
  };
  document.getElementById('download').onclick = function(e){

    //suposed code to zip files before download sample
    //URL.createObjectURL(new Blob([...this.file],{type:'application/octet-stream'}));

    //Adding a template object with a canvas in it, to be reused by the recurse function
    var template = {};
    template.canvas = document.createElement('canvas');

    //Get the size of the first picture, to be used throughout the project
    var oneImage = props[proprietiesTypes[0]][Object.getOwnPropertyNames(props[proprietiesTypes[0]])[0]];
    template.canvas.width = oneImage.width;
    template.canvas.height = oneImage.height;

    //reset global variable to store combos
    combo = {};

    //Fill all possible combos into the combo varibale
    recurseProps(props, "", template, 0);

    //setup fake anchor to be clicked and triger the downloads
    const a = document.createElement('a');
    a.style.display = 'none';//
    a.download = document.getElementById('ProjectName').value + '.png'; //File name - do I need to have this set here?
    document.body.appendChild(a);

    //Counter for File Name
    var c = 0;
    //csv file tabContentSlider
    var csvFile = "";

    //go through each result and both download the file and fill the csv with it's data
    for(let i of Object.getOwnPropertyNames(combo)){
      //get new file Name and increment count
      var nam = document.getElementById('ProjectName').value + c + '.png';
      c++;
      //Setup the image download URL
      a.href = $(combo[i].canvas).get(0).toDataURL("img/png");
      //Add the name of this file and instance to the csv
      csvFile += nam + ',' + i + ',';
      //add every propriety to the same CSV line
      for(let j of Object.getOwnPropertyNames(combo[i])){
        if (j != "canvas"){
          csvFile += j + ',' + combo[i][j] + ',';
        }
      }
      //Make new line in the csv, to setup the next obj
      csvFile += '\n';
      //Change the name of the file to add instance number
      a.download = nam;
      //Trigger download
      a.click();
    }
    //save the csv file
    a.href = 'data:attachment/text,' + encodeURI(csvFile);
    a.download = 'test.csv';
    a.click();
  };
  /**********************************************************
                All possible combinations generator
  ***********************************************************/

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
