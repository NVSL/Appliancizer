<!--
// Tomorrow:
// TODO Add test click for slider and screen components
-->

<template>
  <div id="app">

    <v-app id="inspire">

    <!-- #Drawer List -->
    <v-navigation-drawer fixed v-model="drawer" app>
      <v-list dense>
        <!-- Home option  -->
        <v-list-tile @click="">
          <v-list-tile-action>
            <v-icon>home</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Home</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <!-- Email option -->
        <v-list-tile @click="">
          <v-list-tile-action>
            <v-icon>contact_mail</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Contact</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <!-- Debug option -->
        <v-list-tile @click="">
          <div>
            <span>PCB dimensions:</span>
            <p>{{ lwidth }} х {{ height }} | {{ top }} х {{ left }}</p>
          </div>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <!-- #ToolBar Content -->
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-side-icon class="vbtn" @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class="hidden-sm-and-down">Applian??zer</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn class="vbtn" flat @click="runEnviroment()">{{runStopString}}</v-btn>
        <v-btn class="vbtn" flat @click="testClick()">TEST</v-btn>
        <v-btn class="vbtn" flat @click="testClick2()">TEST2</v-btn>
        <v-btn class="vbtn" flat @click="testClick3()">TEST3</v-btn>
         <v-btn class="vbtn" flat @click="testClick4()">TEST4</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <!-- #Main Content -->
    <v-content>
      <v-container fluid fill-height>
        <splitpanes class="default-theme"  @resize="panelResize($event)" watch-slots>
            <span>
              <div id="webpageContainer" @mouseover="webPageMouseOver($event)" @mouseout="webPageMouseOut($event)">
                <router-view/>
                <!-- Note: The thing below may work, just I need to change how the content is loaded -->
                <!-- <object type="text/html" data="./userapp/userapp.html" style="width:100%; height:100%">
                <p>backup content</p>
                </object> -->

              </div>
            </span>
            <span>
              <div id="PCBPanel" :style="{height: pcbPanelHeight}">
                <VueDragResize id="PCBBoard" class="noGlobalTrigger" :w="pcbWidth" :h="pcbHeight" :x="10" :y="10"
                  :isDraggable="false" v-on:resizing="resize" :sticks="['mr', 'bm', 'br']">
                <!-- <VueDragResize :isActive="true" :w="100" :h="100" :x="140" :y="30" v-on:resizing="resize" v-on:dragging="resize"> -->
                    <!-- <div class="filler" style="background-color: rgb(174, 213, 129);" ondrop="drop(event)" ondragover="allowDrop(event)"> -->

                    <div class="filler" id="PCB" ref="pcbcontainer" :style="{filter: pcbBrightness}"
                        ondragover="event.preventDefault()" :ondrop="drop">
                      <div style="color:white"><strong>PCB</strong></div>

                      <!-- <div id="ADIV" style="display:inline-block;border: 3px solid rgba(50, 50, 50, 0.2);border-radius: 5px;">
                        <div class="protector" :style="{ display: protectorStatus }"></div> -->
                        <!-- <button onclick="console.log('Button Click')" id="playPause" class="submit-physical-button"></button> -->
                        <!-- <input type="range" min="0" max="10" step="1" value="0" id="progressBar" class="range-physical-slider"> -->
                        <!-- class="range-physical-slider" -->
                      <!-- </div> -->


                    </div>

                </VueDragResize>
              </div>
              <!-- #Component Title -->
              <v-card dark color="indigo" :style="{display: componentListDisplay}">
                  <v-card-text class="subheading"><strong>Part Number: </strong> | <strong> Type: </strong> {{currentComponentType}} | <strong> ID: </strong> {{currentComponentId}}</v-card-text>
              </v-card>
              <!-- #List of Components -->
              <v-layout row class="noGlobalTrigger" :style="{display: componentListDisplay}" justify-start>
                <v-flex class="noGlobalTrigger" xs2 v-for="(item, index) in eComponentImages">
                  <v-img :key="index" @click="componentClick(index)"
                   :src="getComponentsImg(item)"
                   class="componentImages noGlobalTrigger"
                   v-bind:class="{componentSelect: componentSelected === index}"
                  ></v-img>
                </v-flex>
              </v-layout>
          </span>
        </splitpanes>
      </v-container>
    </v-content>

    <!-- #Footer -->
    <v-footer color="indigo">
      <span class="white--text">&copy; NVSL 2019</span>
    </v-footer>

    <!-- #Right Click Menu -->
    <v-menu v-model="menu_show" :position-x="menu_x" :position-y="menu_y" absolute offset-y>
       <v-list>
         <v-list-tile v-for="(item, index) in menu_items" :key="index" @click="">
           <v-list-tile-title @click="menuItemClick(index)">{{ item.title }}</v-list-tile-title>
         </v-list-tile>
       </v-list>
     </v-menu>

  </v-app>


  </div>
</template>

<script>
import Vue from "vue";
import VueDragResize from 'vue-drag-resize';
import Splitpanes from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import ElectronicComponent from './components/ElectronicComponent.vue';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';


export default {
  name: "app",
  components: {
    Splitpanes,
    VueDragResize,
    ElectronicComponent
  },
  data: () => ({
        lwidth: 0,
        height: 0,
        top: 0,
        left: 0,
        panelHeight: 0,
        panelWidth: 0,
        pcbPanelHeight: '100%',
        pcbWidth: 250,
        pcbHeight: 300,
        pcbBrightness: 'brightness(1)',
        drawer: false,
        componentSelected: 0,
        componentSlot:'',
        protectorStatus: 'block',
        runStopString: 'RUN',
        runStop: false,
        componentListDisplay: 'none',
        mouseoverComponent: true,
        currentComponentId: 'None',
        currentComponentType: 'None',
        uniqueId: 0,
        eComponentList: null,
        eComponentImages: [],
        eComponentSaved: {},
        eAvailableComponents: [],
        menu_show: false,
        menu_y: 0,
        menu_x: 0,
        iframeOnScreen : false,
        menu_items: [
          { title: 'Remove' }
        ]
  }),
  mounted: function () {

    // Load electrical component List:
    this.eComponentList = {
            "submit": {
              0: {
                "component": "physical-button-red",
                "partImage": "buttons/tactile-button-round-red.jpg",
                "image":"buttons/red-round-button.2D.svg",
                "height": "10mm",
                "width": "10mm"
              },
              1: {
                "component": "physical-button-blue",
                "partImage": "buttons/tactile-button-round-blue.jpg",
                "image":"buttons/blue-round-button.2D.svg",
                "height": "20mm",
                "width": "20mm"
              },
              2: {
                "component": "physical-button-green",
                "partImage": "buttons/tactile-button-round-green.jpg",
                "image":"buttons/green-round-button.2D.svg",
                "height": "30mm",
                "width": "30mm"
              }
            },
            "range" : {
              0: {
                "component": "physical-static-range",
                "image":"pot.png",
                "height": "20mm",
                "width": "20mm"
              },
              1: {
                "component": "physical-dynamic-range",
                "image":"slider.jpg",
                "height": "9mm",
                "width": "152mm"
              }
            },
            "screens" : {
              0: {
                "component": "utronics3-5inch",
                "image":"",
                "partImage":"screens/utronics_3.5inch.png",
                "height": "50mm",
                "width": "50mm"
              },
              1: {
                "comopnent" : "geeekpi5inch",
                "image":"",
                "partImage":"screens/geeekpi_5inch.png",
                "height": "60mm",
                "width": "60mm"
              }
            }
          }

    document.addEventListener("drag", function( event ) {
      console.log("DRAG");
    }, false);

    document.addEventListener("dragstart", function( event ) {
      console.log("DRAGSTART", event.target);
      // if it's a frame send only the children content data

      if($(event.target).hasClass('draggable_element')) {
        var e_id = $(event.target).children()[0].id;
        var e_outerHTML = $(event.target).children()[0].outerHTML;
        var e_type = $(event.target).children()[0].type;
        var e_tagName = $(event.target).children()[0].tagName;

        if (e_tagName == "IFRAME") {
          e_type = "screens";
          $("iframe").css("pointer-events", "none");
        }

        event.dataTransfer.setData("id", e_id);
        event.dataTransfer.setData("outerHTML", e_outerHTML);
        event.dataTransfer.setData("type", e_type);
        
        console.log("startID:"+e_id);
        console.log("startOuterHTML:",e_outerHTML);
        console.log("startTYPE:"+e_type);
      } else {
        console.warn("WARNING, THIS ELEMENT CAN NOT BE A COMPONENT");
      }

    }, false);

    document.addEventListener("dragenter", ( event ) =>  {
      console.log("DRAGENTER:"+event.target.id);
      if (event.target.id == "PCB") {
        this.pcbBrightness = 'brightness(0.8)';
      }

    }, false);

    document.addEventListener("dragleave", ( event ) =>  {
      console.log("DRAGLEAVE"+event.target.id);
      if (event.target.id == "PCB") {
        this.pcbBrightness = 'brightness(1)';
      }
    }, false);

    document.addEventListener("drop", ( event ) =>  {
      event.preventDefault();
      // console.log("DROP", currentElement_g.outerHTML);
      console.log("DROPED IN", event.target);
      var dataID = event.dataTransfer.getData("id");
      var dataOuterHTML = event.dataTransfer.getData("outerHTML");
      var dataType = event.dataTransfer.getData("type");

      if (event.target.id == "PCB") {
        this.pcbBrightness = 'brightness(1)';

        // // ADD soft element to PCB
        // if (dataID == "draggable_iframe") {
        //   console.log("iTSA DRAGG")
        //   dataID = $('#draggable_iframe').children().attr("id");
        //   dataOuterHTML = $('#draggable_iframe').children()[0].outerHTML
        //   dataType = "screens";
        //   this.iframeOnScreen = true;
        //   $('#draggable_iframe').children().unwrap();
        // } 

        console.log("dataID:"+dataID);
        console.log("dataOuterHTML:"+dataOuterHTML);
        console.log("dataTYPE:"+dataType);
        this.addNewComponent(dataID, dataType,
              dataOuterHTML);

      }

    }, false);

    // Enable right click Menu
    document.showContextMenu = (e) => {
      e.preventDefault();
      console.log("hello world"+e);
      this.menu_show = false;
      this.menu_x = e.clientX;
      this.menu_y = e.clientY;
      this.$nextTick(() => {
        this.menu_show = true;
      })
    };

    // Add global click
    this.$el.addEventListener('click', this.onGlobalClick)

    //$("#webpageContainer").load("@/userapp/userapp.html");

  },
  methods: {
    resize(newRect) {
        console.log("Resizing!!"+this.panelHeight);
        this.lwidth = newRect.width;
        this.height = newRect.height;
        this.top = newRect.top;
        this.left = newRect.left;
    },
    panelResize(resize) {
      console.log(resize);
    },
    // When a component is clicked from the list.
    componentClick(selectedNumber) {
      if (this.currentComponentId != 'None'|| this.currentComponentType != 'None') {
        this.componentSelected = parseInt(selectedNumber);
        console.log(this.componentSelected);
        // this.$refs.component[itemNum].$el.style.border = "1px solid red";
        console.log(this.currentComponentId, this.currentComponentType);
        // TODO: Add not defined detection

        this.setNewComponentSelection(this.currentComponentId,
                                      this.currentComponentType,
                                      selectedNumber);

      } else {
        console.log("Component not selected");
      }
    },
    // Changes the comopnent in the PCB and in the directory.
    setNewComponentSelection(compId, compType, newNumber){
      // Get new image path
      var image = this.eComponentList[compType][newNumber].image;
      var height = this.eComponentList[compType][newNumber].height;
      var width = this.eComponentList[compType][newNumber].width;

      if (image != "") {
        // Change the image
        $("#"+compId).css("background-image", 'url(\'' + require('./assets/'+image) + '\')');
      }
      // Change size
      $("#"+compId).css("height", height);
      $("#"+compId).css("width", width);
      // Save the new component number selected [Here we save the new selected component]
      this.eComponentSaved[compId].componentSelected = newNumber; // Get component selected
    },
    drop(event) {
      event.preventDefault();
      // console.log("Drop EVENT", event.target); // this element
    },
    getImgUrl(image) {
      return require('./assets/'+image);
    },
    getComponentsImg(item) {
      return require('./assets/'+item);
    },
    runEnviroment() {
      
      if (this.runStop == false) {
        console.log("Running MODE");
        // Running mode
        this.runStop = true;
        this.runStopString = "STOP";
        // Remove protector from elements in PCB
        $(".protector").css("display", "none");
        // Set iframe events to all
        $("iframe").css("pointer-events", "all");
        // For all available comopnents, remove their draggable class
        for (var ele of this.eAvailableComponents) {
          console.log(ele);
          $('#'+ele+'_drag').removeClass('draggable_element');
          $('#'+ele+'_drag').attr("draggable", "false");
        }
      } else {
        console.log("Edit MODE");
        // Edit mode
        this.runStop = false;
        this.runStopString = "RUN";
        // Add protector from elements in PCB
        $(".protector").css("display", "block");
        // Set iframe events to none
        $("iframe").css("pointer-events", "all");
        // For all available comopnents, add their draggable class
        for (var ele of this.eAvailableComponents) {
          console.log(ele);
          $('#'+ele+'_drag').addClass('draggable_element');
          $('#'+ele+'_drag').attr("draggable", "true");
        }

      }

      // // TEST ADDING DRAGGABEL COMPONENTS
      // var img = $('<img/>')
      //   .attr("class", "abutton")
      //   .attr("src", this.getImgUrl('button.png'))
      //   .appendTo("#PCB");
      //   $( ".abutton" ).draggable({ containment: "#PCBBoard", scroll: false });


      // // DONT DELTE: Creating a Component and passing raw html
      // // Create and append comopnent
      // var ComponentClass = Vue.extend(ElectronicComponent)
      // var instance = new ComponentClass({
      //     propsData: { id: 'newComopnent', msg: 'A message', rawHTML: '<div id="idiot">LAL</div>' }
      // })
      // instance.$mount() // pass nothing
      // this.$refs.pcbcontainer.appendChild(instance.$el);
    },
    testClick() {
      // TEST ADDING A BUTTON
      this.addNewComponent("playPause", "submit",
            '<button onclick="playPause()" id="playPause"></button>');

    },testClick2() {
      // TEST ADDING A BUTTON
      this.addNewComponent("playPause2", "submit",
            '<button onclick="console.log(\'Button Click\')" id="playPause2"></button>');
    },
    testClick3() {
      // TEST ADDING A SLIDER
      this.addNewComponent("playPause2", "submit",
            '<button onclick="console.log(\'Button Click\')" id="playPause2"></button>');
    },
    testClick4() {
      // this.addNewComponent("video-placeholder", "screens",
      //       '<iframe id="video-placeholder" frameborder="0" allowfullscreen="1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" title="YouTube video player" src="https://www.youtube.com/embed/DCLrDnZO_0E?rel=0&amp;color=white&amp;playlist=dQiNVk_u0po%2C%20IvUU8joBb1Q%2CS-m-CHigCY4%2CHpaHvUOk3F0&amp;enablejsapi=1&amp;origin=http%3A%2F%2Flocalhost%3A8080&amp;widgetid=1" draggable="true"></iframe>');
      //var iframeBody = document.getElementById('video-placeholder').contentWindow.document.body.innerHTML; //$('#video-placeholder').contents();
      //console.log(iframeBody);

    },
    // Adds a new component to the PCB
    addNewComponent(thisId, thisType, thisHtml) {

      // // Hide the soft comonent in the user webpage
      // $('#'+thisId).css("visibility", "hidden");
      // // Change the id name of the user webpage
      // $('#'+thisId).attr("id",thisId+"_edit");

      // Get element data to save later:
      var thisWidth = $('#'+thisId).outerWidth();
      var thisHeight = $('#'+thisId).outerHeight();
      var thisInnerHTML = $('#'+thisId).html();

      // Generate unique id:
      var elementId = "element_"+this.uniqueId;
      this.uniqueId++;

      // Create element container
      $("<div/>", {
        id: elementId,
        class: "noGlobalTrigger",
        style: "display:inline-block;border-radius: 5px;"
      }).appendTo("#PCB");
      // Create protector
      $("#"+elementId).append('<div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div>');
      // Get user web element data // TODO
      $("#"+thisId).detach().appendTo("#"+elementId)

      // Add component element style class (TODO: select class accodign to the type)
      if (thisType == "submit") {
        $("#"+thisId).addClass("submit-physical-button");
      } else if (thisType == "screens") {
        $("#"+thisId).addClass("physical-screen");
      } else {
        console.error("Unknown element type");
      }
      // Remove any innerHTML
      $("#"+thisId).empty();


      // Make it draggable
      $("#"+elementId).draggable({ containment: "#PCBBoard", scroll: false });
      
      // When the component in the PCB is clicked do:
      $("#"+elementId).mousedown((element) => {
        if (this.runStop == false) {
          console.log(this.mouseoverComponent);
          var ele = $(element.target).next()[0];
          // Get current ID
          this.currentComponentId = ele.id;
          // Get current Type
          if (ele.type == undefined) {
            // If type is not detected then is a screen
            this.currentComponentType = "screens";
          } else {
            this.currentComponentType = ele.type;
          }
          
          console.log("Eleemnt TYPE:"+this.currentComponentType);

          // Pupulate Component List Images
          this.eComponentImages = []; // Clear list
          var type = this.eComponentSaved[this.currentComponentId].type; // Get component type
          var elements = this.eComponentList[type]; // Get all components of the selected type
          for (var i in elements) {
            var partImage = elements[i].partImage;
            this.eComponentImages.push(partImage);
          }

          // Update component selected for this element
          var selectedNumber = this.eComponentSaved[this.currentComponentId].componentSelected; // Get component selected
          this.componentSelected = selectedNumber;

          // Debug
          console.log(ele.id);
          console.log(ele.type);
          //console.log(ele.tagName.toLowerCase());

          // Add this element border and unselect others
          console.log(this.eComponentSaved);
          for (var key in this.eComponentSaved) {
            if (key == this.currentComponentId) {
              // Add selection border
              $("#"+this.eComponentSaved[key].elementId).css("border" , "3px solid rgba(50, 50, 50, 0.2)");
            } else {
              // Remove selection border
              $("#"+this.eComponentSaved[key].elementId).css("border" , "");
            }
          }

          // Show Component Selection List
          this.componentListDisplay = '';
          this.pcbPanelHeight = '74%';
        }
      });

      // Save new component
      var selectedNumber = 0; // First element by default
      this.eComponentSaved[thisId] = {
                  "elementId": elementId,
                  "type": thisType,
                  "componentSelected": selectedNumber,
                  "html": thisHtml,
                  "width": thisWidth,
                  "height": thisHeight,
                  "innerHTML": thisInnerHTML
                };

      // Apply style settings for new component (TODO: get Id and type)
      this.setNewComponentSelection(thisId, thisType, selectedNumber);

    },
    menuItemClick(item) {
      console.log("Item Cliked"+item);

      // Get data
      var elementId = this.eComponentSaved[this.currentComponentId].elementId;
      var e_type = this.eComponentSaved[this.currentComponentId].type;
      // var e_width = this.eComponentSaved[this.currentComponentId].width;
      // var e_height = this.eComponentSaved[this.currentComponentId].height;
      var e_innerHTML = this.eComponentSaved[this.currentComponentId].innerHTML;

      // Delete component id key from dictionary
      delete this.eComponentSaved[this.currentComponentId];

      // Restore user soft component id and visibility
      $('#'+this.currentComponentId).detach().appendTo('#'+this.currentComponentId+'_drag')

      // Remove type class
      if (e_type == "submit") {
        $("#"+this.currentComponentId).removeClass("submit-physical-button");
      } else if (e_type == "screens") {
        $("#"+this.currentComponentId).removeClass("physical-screen");
      } else {
        console.error("Unknown element type");
      } 

      // Restore data
      $("#"+this.currentComponentId).css("background-image", "");
      $("#"+this.currentComponentId).css("height", "");
      $("#"+this.currentComponentId).css("width", "");
      $("#"+this.currentComponentId).html(e_innerHTML);

      // Hide Component Selection List
      this.componentListDisplay = 'none';
      this.pcbPanelHeight = '100%';

      // Remove rest of the comoponent
      $('#'+elementId).remove();
    },
    onGlobalClick(e) {
      //console.log("Global: ", $(e.target.parentElement).hasClass('noGlobalTrigger'));
      //console.log("Parent:"+ targetParent.className);

      // On a Global clikc, remove the border from the components selected.
      var targetParent = e.target.parentElement;
      if (!$(targetParent).hasClass('noGlobalTrigger')) {
        // Unselect components
        for (var key in this.eComponentSaved) {
            // Remove selection border
            $("#"+this.eComponentSaved[key].elementId).css("border" , "");
        }
        // Hide Component Selection List
        this.componentListDisplay = 'none';
        this.pcbPanelHeight = '100%';
      }
    },
    // Make user webpage elements draggable
    webPageMouseOver(e) {
        console.log(e.target.tagName);
        console.log("ID:"+e.target.id);
        console.log(e.target.type);
        console.log(e.target.className);
        if ($(e.target).is('html, body')) {
          console.log("Element is html or body");
        } else if ($(e.target).children().length > 0) {
          console.log("Element has childrens");
        } else {
          // If target has ID
          if ($(e.target).attr('id') && 
            !$(e.target).parent().hasClass('dragy') &&
            !$(e.target).hasClass('dragy')) {
            console.log("MOUSE IN:"+e.target.outerHTML);
            if (this.runStopString == 'RUN') {
                // Only executed once (Execute at init??)
                // Wrapp iframe element, we only need this once
                var e_width = $('#'+e.target.id).outerWidth()+6;
                var e_height = $('#'+e.target.id).outerHeight()+6;        
                $('#'+e.target.id).wrap(
                  `<div id="${e.target.id}_drag" class="dragy draggable_element" 
                    draggable="true" style="width:${e_width}px;height:${e_height}px;display:inline-block;">
                    </div>`);

                // Add id to the available components that can ve moved
                this.eAvailableComponents.push(e.target.id);

            } else {
              // Set draggable item to true if running demo
              $('#'+e.target.id).attr('draggable', 'false');
              //$('#'+e.target.id).css('pointer-events', 'auto');
              //$('#'+e.target.id).draggable( 'disable' );
            }

          }
        }
    },
    webPageMouseOut(e) {
      // TODO: implement css layout
      // console.log("Mouse out of:"+e)
    }

  },
  created () {

    // window.onmouseover=function(e) {
    //   // console.log(e.target.tagName);
    //   // console.log("ID:"+e.target.id);
    //   // console.log(e.target.type);
    //   // console.log(e.target.className);
    //   if ($(e.target).is('html, body')) {
    //     // console.log("Mose over html or body");
    //   } else {
    //     // If target has ID
    //     if ($(e.target).attr('id')) {
    //       // console.log("MOUSE IN:"+e.target.outerHTML);
    //       // Set draggable item to true.
    //       $('#'+e.target.id).attr('draggable', 'true');
    //     }
    //   }
    //
    // };
    //
    // window.onmouseout=function(e) {
    //   if ($(e.target).is('html, body')) {
    //     // console.log("Mose over html or body");
    //   } else {
    //     if ($(e.target).attr('id')) {
    //       // console.log("MOUSE OUT:"+e.target.outerHTML);
    //     }
    //   }
    // }
    //
    // window.onmousedown =function(e) {
    //   if ($(e.target).is('html, body')) {
    //     // console.log("Mose click on html or body");
    //   } else {
    //     if ($(e.target).attr('id')) {
    //       // console.log("MOUSE CLICK:"+e.target.outerHTML);
    //     }
    //
    //   }
    // };

  }
};
</script>



<style>

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.filler {
  margin:0px;
  padding:0px;
  width: 100%;
  height: 100%;
  display: inline-block;
  position: absolute;
  background-color: rgb(174, 213, 129);
}

.iframeContainer {
  margin-left: 20%;
  margin-right: 20%;
  margin-top: 5%;
  height: 75%;
}

#PCBBoard {
  position: relative !important; /* Makes the PCB inlined to parent */
}

#PCBPanel {
  height: 74%;
  width:100%;
  /* display: block; */
  overflow-x: auto;
}

#componentsLayout {
  height: 18%;
  overflow-x: auto;
}

.componentImages {
  margin: 15px;
  margin-bottom: 5px;
  height: 90px;
  width: 90px;
  background-origin: content-box;
  border-radius: 4px;
  border: 4px solid #f2f2f2;
}

.componentImages:hover {
  box-shadow: 0px 2px 8px 2px rgba(50, 50, 50, 0.3);
  /* transform: scale(0.9); */
  /* border: 4px solid #2962FF; */
  filter: brightness(.8);
}

.componentSelect {
  border: 4px solid #2962FF !important;
}

#webpageContainer {
  height: 100%;
  overflow: scroll;
}

#webframecontiner {
	display: block;
	margin: 0 auto;
	height: 100%;
	width: 100%;
  overflow: scroll;
  border: 4px solid black;
}

/* Make iframe draggable */
.draggable_element {
  background: transparent;
	position: relative;/*parent must have positioning*/
  border-color:rgb(174, 213, 129);
  border-style: dotted;
}

.draggable_element:after {
  content: "";
	display: block;
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
}

/*
Vuetify removed styles
*/
.vbtn {
  background-color: transparent;
  border-style: none;
  color: inherit;
}

/*
Component Styles
*/
.protector {
/* To avoid clicks */
  position:absolute;
  z-index:2;
  width:100%;
  height:100%;
}

/* # Submit Style */
.submit-physical-button {
 display: block;
 background-color: transparent;
 background-size: contain;
 border-style: none;
 width: 10mm;
 height: 10mm;
 background-image: url('~@/assets/buttons/1.png');
}

.submit-physical-button:hover {
  /* box-shadow: 0px 0px 0px 2px rgba(255, 255, 0, 0.8); */
}

/* # Range Style */
.range-physical-slider {
  display: block;
  -webkit-appearance: none;
  /* background-image: url('~@/assets/buttons/1.png'); */
  background-size: contain;
  background-repeat: no-repeat;
  background-color: gray;
  /* border: 1px solid black; */
}

.range-physical-slider::-webkit-slider-runnable-track {
  /* background: #ddd; */
  background: black;
  height: 3px;
  margin-top: -10px;
}
.range-physical-slider::-webkit-slider-thumb {
  margin-top: -9px;
}

/* # Physical Screen */
.physical-screen {
 display: block;
 border:10px solid rgb(17, 17, 17);
 border-radius: 15px;
}

</style>
