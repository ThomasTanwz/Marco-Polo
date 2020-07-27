//this is the main function of initiating the GMap Interface
//on Notebook Page. It contains function calls to:

//Components:
//1. addMarker--add a marker to the map by clicking
//2. InfoWindow--display user's note on this marker
//3. Text Editor with QuillJS API--allow user to use text editor on this page
//4. router for the marker set
//5. clear the markers, routes and drop-down menus
//6. connet text editor with markers
//TODO:
//1. add more travel mode options to routing part
//2. enable drawing tools on the map?

/*
  this function works as a caller of all functions related to map operations
  it initializes a google map centered on Uluru, Australia(why?)
  To see more function calls please see below
*/
function initMap() {
  /*
    Import direction services and directionsRenderer.
    suppressMarkers: do not generate waypoint markers for routing if true.
  */
  var directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true,});
  var directionsService = new google.maps.DirectionsService();
  // The location of Uluru
  var uluru = {lat: -25.344, lng: 131.036};
  // The map, centered at Uluru
  var map = new google.maps.Map(document.getElementById('map'), {zoom: 4, center: uluru});
  //calls addMarker function
  google.maps.event.addListener(map, "click", function(event){
     addMarker(event.latLng, map);
  });
  //generate route when the route marker button is clicked
  document.getElementById("route-markers").addEventListener("click", function(){
    //set up directions rednerer for routing
    directionsRenderer.setMap(map);
    generateRoute(directionsService, directionsRenderer);
  });
  //submit the marker query by clicking the submit button, it generates a drop-down list of submitted markers
  document.getElementById("submit-markers").addEventListener("click", function(){
    createDropDownList();
  });
  //clears markers and reset all arrays and label number by clicking clear marker button
  document.getElementById("clear-markers").addEventListener("click", function(){
    clearMarkers();
    //removes existing route
    directionsRenderer.setMap(null);
  });
  //press the compose journal button to invoke text-infowindow transferring function
  document.getElementById("compose-journal").addEventListener("click", function(){submitText();});
}

/*
  labelNum is the number on markers to show its serial number
  A set of waypoints will be generated for routing purpose
  A set of markers will be generated for journal entry linking purpose
  each marker generates a noteWindow to display user's notes on that marker
*/
var labelNum="0";
var waypointSet=[];
var markerSet=[];

/*
  this function's main purpose: inits markers and increases their serial numbers
  each time a new marker with its title and text is instantiated. It updates labelNum,
  wayPointSet and markerSet
*/
function addMarker(location, map){
  //generate marker and its label number
  var marker = new google.maps.Marker({
    position: location,
    label: labelNum,
    map: map,
    draggable: true,
    //it exhibits the title when cursor hovers over the marker
    title: 'You do not have a title for marker ' + labelNum
  });
  //The waypoint set pushes each marker's lng-lat for routing purposes
  //Since it is a set of waypoints instead of solely lng-lat, it contains
  //a bool value to tell the direction service that each marker is a stop in the route as well
  waypointSet.push({location: marker.getPosition(), stopover: true});
  //add marker to marker set
  markerSet.push(marker);
  //increments the label number of markers once it is created
  labelNum=(parseInt(labelNum) + 1).toString();
}

//instantiate a new Quill object for the text editor part
var quill = new Quill('#editor', {
  //toolbar functionalities
  modules: {toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'code-block']
    ] },
  //placeholder text inside the editor
  placeholder: 'Compose your title here\nCompose your content here',
  theme: 'snow'
});

//this function routes the marker set and reports error(if any)
function generateRoute(directionsService, directionsRenderer){
  //2+ way points required for a route, basic geometry eh?
  if(waypointSet.length >= 2){
    directionsService.route(
      {
        //origin and destination are first and last in the array of way points, they are {Lat, Lng} values
        origin: waypointSet[0].location,
        destination: waypointSet[waypointSet.length - 1].location,
        //waypoint is location + stopover
        waypoints: waypointSet,
        optimizeWaypoints: true,
        //currently only supports driving mode for routing, will add more selections
        travelMode: "DRIVING"
      },
      //informs users with error if any happens
      function(response, status){
        if (status == "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  } else {
    window.alert("2 or more markers required for routing");
  }
}

//this variable is the number of marker selected on the drop-down menu
var selectedMarkerNum;

/*
  This function generates a drop-down menu once the marker set is submitted
*/
function createDropDownList(){
  if(markerSet.length == 0){
    window.alert('No marker placed on map');
  }else{
    var dropDown=document.getElementById('select-markers');
    /*
      this for loop generates a drop down menu of all markers
      scenario: user adds 3 markers then submit, then adds 2 more and submit
      to prevent duplicate generating(0 - 3 - 0 - 5), this for loop starts off
      from the drop down menu's existing length
    */
    var length = document.getElementById("select-markers").options.length;
    for(var i=length-1; i < markerSet.length; i++){
      var markerName = "Marker "+ markerSet[i].label;
      var option = document.createElement("option");
      option.textContent = markerName;
      option.value = i;
      dropDown.appendChild(option);
    }
    //toggle hidden button
    document.getElementById('select-markers').hidden=false;
  }
  //update marker number when corresponding marker is selected
  dropDown.addEventListener("change", function(){
    selectedMarkerNum = dropDown.options[dropDown.selectedIndex].value;
  });
  //unhide the compose button for publishing journal
  document.getElementById("compose-journal").style.display = "inline-block";
}

/*
  this function clears all markers on map and sets way point array,
  marker set and labelNum to 0. It clears existing route if any
*/
function clearMarkers(){
  if(markerSet.length >= 1){
    //this for loop removes all markers from the map
    for(var i=0; i < markerSet.length; i++){
      markerSet[i].setMap(null);
    }
    //reset all data
    markerSet=[];
    waypointSet=[];
    labelNum="0";
    //now proceeds to clean up the drop down menu
    var length = document.getElementById("select-markers").options.length;
    //delete drop down menu's all options except the first one(which is the menu's name by default)
    for(var i = length-1; i >= 1; i--){
      document.getElementById("select-markers").options[i] = null;
    }
    //hide the marker drop down menu again
    document.getElementById("select-markers").hidden=true;
    //hide the compose journal button again
    document.getElementById("compose-journal").style.display = "none";
  }
}

/*
  This function processes the drop-down menu choice and append the text to the selected marker
*/
function submitText(){
  //get all content as a string from text editor
  var rawText = quill.getText();
  //dont submit if didnt write anything
  if(rawText.length == 1){
    alert("you did not write anything");
  } else {
    //split into an array of [title, string]
    var processedText = rawText.split("\n");
    //the selectedmarker from the drop down menu has spoken
    var selectedMarker = markerSet[selectedMarkerNum];
    //set title and modify the content with some html
    selectedMarker.setTitle(processedText[0]);
    var stuff = "<h1>"+processedText[0]+"</h1>" +
    '<p style="font-size: 16px; font-family: arial; color: #1287A8">' +
    processedText[1] + "</p>";
    //display people's journal as a pop window
    var markerContent = new google.maps.InfoWindow({content: stuff});
    selectedMarker.addListener('click', function(){markerContent.open(map, selectedMarker);});
  }
}
