<!--
// Tomorrow:
// - Integrate this with gadgetron.
// - Add smd push buttons
// - Add Headers
// - Add external components (resisots / caps). 

-->

<template>
  <div id="app">

    <v-app id="inspire">

    <!-- #ToolBar Content -->
    <v-toolbar dense color="grey darken-4" dark fixed app>
      <v-toolbar-title class="hidden-sm-and-down">Appliancizer</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-tabs right slider-color="rgb(174, 213, 129)" color="grey darken-4">
          <v-tab @click="setEditMode()">
            <v-btn class="vbtn" flat >
              EDIT
              <v-icon>edit</v-icon>
            </v-btn>
          </v-tab>
          <v-tab @click="setRunMode()">
            <v-btn class="vbtn" flat >
              RUN
              <v-icon>play_arrow</v-icon>
            </v-btn>
          </v-tab>
        </v-tabs>
        <!-- 
        
        <!-- <v-btn class="vbtn" flat @click="testClick()">TEST</v-btn> -->
      </v-toolbar-items>
    </v-toolbar>

    <!-- #Main Content -->
    <v-content>
      <v-container fluid fill-height>
        <v-layout row wrap>
          <splitpanes class="default-theme" watch-slots>
              <span :splitpanes-size="webpageContainerPaneSize">
                <div id="webpageContainerProgressbar" class="text-xs-center">
                  <v-progress-circular  color="rgb(174, 213, 129)" :size="50" indeterminate></v-progress-circular>
                </div>
                  <v-layout row>
                    <v-toolbar-title class="pt-2 mx-3">Webpage</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn class="vbtn" @click="openHTMLEditor()">
                      ADD
                    <v-icon>add</v-icon>
                    </v-btn>
                  </v-layout>
                <v-divider class="pb-1"></v-divider>
                <div id="webpageContainer" @mouseover="webPageMouseOver($event)" @mouseout="webPageMouseOut($event)">
                  <!-- User Web page will be injected here -->
                </div>
              </span>
              <span>
                <div id="PCBPanel" :style="{height: pcbPanelHeight}">
                  <v-layout row>
                      <v-toolbar-title class="pt-2 mx-3">PCB</v-toolbar-title>
                      <v-spacer></v-spacer>
                      <v-btn class="vbtn" @click="openBuildScreen()">
                        BUILD
                        <v-icon>build</v-icon>
                      </v-btn>
                  </v-layout>
                  <v-divider class="pb-1"></v-divider>
                  <PcbBoard id="PCB" :w="pcbWidth" :h="pcbHeight" :brightness="pcbBrightness" 
                    :color="pcbColor" ondragover="event.preventDefault()" @pcbresize="BuildScreen_pcbresize($event)">
                    <!-- PCB components will be inserted here -->
			            </PcbBoard>
                </div>
                <!-- #Component Title -->
                <v-card dark color="grey darken-3" :style="{display: componentListDisplay}">
                    <v-card-title class="subheading py-1">
                      <strong>Part Number: </strong> | <strong> Type: </strong> {{currentComponentType}} | <strong> ID: </strong> {{currentComponentId}}
                      <v-spacer></v-spacer>
                      <v-btn class="vbtn" light @click="removeComponent()">
                        REMOVE
                        <v-icon>clear</v-icon>
                      </v-btn>
                    </v-card-title>
                </v-card>
                <!-- #List of Components -->
                <v-layout row class="noGlobalTrigger" :style="{display: componentListDisplay}" justify-start>
                  <v-flex class="noGlobalTrigger" xs2 v-for="(item, index) in eComponentImages" :key="index">
                    <v-img :key="index" @click="componentClick(index)"
                    :src="getComponentsImg(item)"
                    class="componentImages noGlobalTrigger"
                    v-bind:class="{componentSelect: componentSelected === index}"
                    ></v-img>
                  </v-flex>
                </v-layout>
            </span>
          </splitpanes>
        </v-layout>
      </v-container>
    </v-content>


    <!-- Snackbar for Info -->
    <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        :bottom="false"
        :left="false"
        :multi-line="false"
        :right="false"
        :timeout="snackbarTimeout"
        :top="true"
        :vertical="false"
      >
        {{ snackbarText }}
        <v-btn class="vbtn" flat @click="snackbar = false">
          Close
        </v-btn>
      </v-snackbar>

    <!-- #Footer -->
    <v-footer color="grey darken-4">
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

    <!-- HTML/CSS/Javscript Editor -->
    <v-dialog v-model="HTMLEditor" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card id="htmlEditorDialogHeight">
        <v-toolbar dark dense color="grey darken-4">
            <v-toolbar-title>Webpage Editor</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <v-btn class="vbtn warning " flat v-on="on">
                DEMOS
                  <v-icon>add</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile v-for="(item, index) in Demos" :key="index" @click="HTMLEditor_loadDemo(item.demo)">
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>

            <v-btn class="vbtn success" flat @click="HTMLEditor_run()">
              RUN
              <v-icon>arrow_forward_ios</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn dark class="vbtn" color="indigo" @click="HTMLEditor_injectWebPage()">INJECT
              <v-icon>arrow_downward</v-icon>
            </v-btn>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-toolbar-items>
              
              <v-btn icon dark class="vbtn" @click="HTMLEditor = false">
                <v-icon>close</v-icon>
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-container id="editorMainPanes" fluid fill-height>
            <splitpanes  class="default-theme" vertical :push-other-panes="false">
              <splitpanes horizontal :push-other-panes="false">
                <span>
                  <v-toolbar color="grey darken-4" dark dense>
                    <v-toolbar-title><strong>HTML</strong></v-toolbar-title>
                  </v-toolbar>
                  <v-divider></v-divider>
                  <div id="htmlEditor">{{EditorHTMLText}}</div>
                </span>
                <span>
                  <v-toolbar color="grey darken-4" dark dense>
                    <v-toolbar-title><strong>CSS</strong></v-toolbar-title>
                  </v-toolbar>
                  <v-divider></v-divider>
                  <div id="cssEditor">{{EditorCSSText}}</div>
                </span>
                <span>
                  <v-expansion-panel color="grey darken-4" dark>
                    <v-expansion-panel-content>
                      <template v-slot:header>
                        <v-toolbar-title><strong>JS</strong></v-toolbar-title>
                      </template>
                      <v-card class="white">
                        <v-container class="pt-4 pb-0 my-0">
                          <!-- <v-subheader class="py-1 my-1">Example: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js</v-subheader> -->
                          <v-text-field light class="pa-0 ma-1" v-model="EditorJS_extSoruceOne" label="External Source 1"  placeholder="https://..." type="text" clearable></v-text-field>
                          <v-text-field light class="pa-0 ma-1" v-model="EditorJS_extSoruceTwo" label="External Source 2"  placeholder="https://..." type="text" clearable></v-text-field>
                        </v-container>
                      </v-card>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                  <v-divider></v-divider>
                  <div id="jsEditor">{{EditorJSText}}</div>
                </span>
              </splitpanes>
              <span>
                <iframe id="HTMLEditor_iframe" @load="HTMLEditor_iframeOnLoad()"
                sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
                allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media"
                scrolling="auto" allowtransparency="true" allowpaymentrequest="true" allowfullscreen="true"
                ></iframe></span>
            </splitpanes>
          </v-container>
        </v-card>
    </v-dialog>


    <!-- Build Screen -->
    <v-dialog v-model="BuildScreen" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card id="buildScreenDialogHeight">
        <v-toolbar dark dense color="grey darken-4">
            <v-toolbar-title>Build Screen</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-toolbar-items>         
              <v-btn icon dark class="vbtn" @click="BuildScreen = false">
                <v-icon>close</v-icon>
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-container fluid>
            <v-card class="mb-12" color="white">
              <v-toolbar dense flat color="#f2f2f2">
                <v-toolbar-title>1.- PCB REVIEW</v-toolbar-title>
              </v-toolbar>
              <br>
              <v-layout row wrap id="buildScreen_layoutHeight">
                <div id="buildScreen_pcbHeightText" class="textVertical text-xs-center">{{ FinalPCB.height }} mm</div>
                <v-flex id="buildScreen_pcbCanvas" xs6 class="pr-3 flexBoxHeight">
                  <div id="canvasPCBimage" class="pr-3">
                    
                  </div>
                  <div id="buildScreen_pcbWidthText" class="text-sm-center">{{ FinalPCB.width }} mm</div>  
                </v-flex>
                <v-divider id="buildScreen_dividerHeight" class="mx-3" inset vertical></v-divider>
                <v-flex  xs4 id="buildScreen_info" class="flexBoxHeight">
                  <h3>PCB Dimensions: {{ FinalPCB.width }} mm х {{ FinalPCB.height }} mm</h3>
                  <h3>PCB Electrical Components:</h3>
                  <v-list two-line>
                    <template v-for="(item, index) in FinalComponents">
                      
                      <v-list-tile v-if="item.title" :key="index+'_list'" avatar>

                        <v-list-tile-avatar size="73">
                          <img :src="item.image">
                        </v-list-tile-avatar>

                        <v-list-tile-content class="pl-4">
                          <v-list-tile-title v-html="item.title"></v-list-tile-title>
                          <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                        </v-list-tile-content>

                      </v-list-tile>
                      <v-divider v-if="item.title" :key="index+'_divider'" :inset="true"></v-divider>

                    </template>
                  </v-list>
                </v-flex>
              </v-layout>
              <v-toolbar dense flat color="#f2f2f2">
                <v-toolbar-title>2.- GENERATE PCB</v-toolbar-title>
              </v-toolbar>
              <v-container>
                <h3>2. Generate PCB Gerber Files for manufacture.</h3>
                <v-progress-linear :indeterminate="true"></v-progress-linear>
                <v-btn class="vbtn info" flat @click="BuildScreen_downloadPCBFiles()">
                  DOWNLOAD PCB FILES
                </v-btn>
              </v-container>
              <v-layout row wrap class="pt-5">
                <div id="generatedPcbTop"></div>
                <div id="generatedPcbBottom"></div>
              </v-layout>
              <v-toolbar dense flat color="#f2f2f2">
                <v-toolbar-title>3- APP DEPLOYMENT</v-toolbar-title>
              </v-toolbar>
              <v-container>
                <h3>1. Download the OS image below and flash it to your raspberry pi SD card. We recomend 
                  <a href="https://www.balena.io/etcher/">Balena Etcher</a>   
                    for flashing the OS image.
                </h3>
                <v-btn class="vbtn info" flat @click="BuildScreen_downloadOSImage()">
                  DOWNLOAD OS IMAGE
                </v-btn>
                <br>
                <br>
                <h3>2. Deploy you app with hardware integration either online or locally. </h3>
                <br>
                <v-layout row wrap>
                  <v-flex xs6>
                    <v-card class="mx-4" color="white" style="height:100%">
                      <v-toolbar dense flat color="#f2f2f2">
                        <v-toolbar-title>DEPLOY APP ONLINE</v-toolbar-title>
                      </v-toolbar>
                      <br>
                      <div class="text-xs-center">
                        Link:
                        <a :href="GeneratedLink" target="_blank">{{GeneratedLink}}</a>
                      </div>
                      <v-card-actions class="justify-center">
                          <v-btn  class="vbtn info" flat @click="BuildScreen_deployOnline()">
                            DEPLOY APP ONLINE
                          </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-flex>
                  <v-flex xs6>
                    <v-card class="mx-4" color="white" style="height:100%">
                      <v-toolbar dense flat color="#f2f2f2">
                        <v-toolbar-title>DEPLOY APP LOCALLY</v-toolbar-title>
                      </v-toolbar>
                      <br>
                      <v-card-actions class="justify-center">
                        <v-btn  class="vbtn info" flat @click="BuildScreen_downloadAPP()">
                          DOWNLOAD APP
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-flex>
                </v-layout>
              </v-container>
              
            </v-card>
          </v-container>
          <!-- <v-container id="buildScreen_mainPane" fluid>
            <v-layout row wrap id="buildScreen_layoutHeight">
              <div id="buildScreen_pcbHeightText" class="textVertical text-xs-center">{{ FinalPCB.height }} mm</div>
              <v-flex id="buildScreen_pcbCanvas" xs6 class="pr-3 flexBoxHeight">
                <div id="canvasPCBimage" class="pr-3">
                  
                </div>
                <div id="buildScreen_pcbWidthText" class="text-sm-center">{{ FinalPCB.width }} mm</div>  
              </v-flex>
              <v-divider id="buildScreen_dividerHeight" class="mx-3" inset vertical></v-divider>
              <v-flex  xs4 id="buildScreen_info" class="flexBoxHeight">
                <h2><strong>PCB Dimensions: </strong>{{ FinalPCB.width }} mm х {{ FinalPCB.height }} mm</h2>
                <h2><strong>PCB Electrical Components:</strong></h2>
                <v-list two-line>
                  <template v-for="(item, index) in FinalComponents">
                    
                    <v-list-tile v-if="item.title" :key="index+'_list'" avatar>

                      <v-list-tile-avatar size="73">
                        <img :src="item.image">
                      </v-list-tile-avatar>

                      <v-list-tile-content class="pl-4">
                        <v-list-tile-title v-html="item.title"></v-list-tile-title>
                        <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                      </v-list-tile-content>

                    </v-list-tile>
                    <v-divider v-if="item.title" :key="index+'_divider'" :inset="true"></v-divider>

                  </template>
                </v-list>
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
            <div class="text-sm-center pl-5 ml-4">
              <v-btn class="vbtn info" flat @click="BuildScreen_build()">
                {{BuildButtonText}}
              </v-btn>
            </div>
          </v-container>
          <v-container id="buildScreen_downloadPane" fluid>
            <v-layout row wrap id="buildDownload_layoutHeight">
              <v-flex  xs6>
                <h3>Build Steps </h3>
                <h3>1. Download the OS image below and flash it to your raspberry pi SD card. We recomend 
                  <a href="https://www.balena.io/etcher/">Balena Etcher</a>   
                    for flashing the OS image.
                </h3>
                <v-btn class="vbtn info" flat @click="BuildScreen_downloadOSImage()">
                  DOWNLOAD OS IMAGE
                </v-btn>
                <h3>2. Download the generated app to your raspberry pi or deploy it online. </h3>
                <v-btn  class="vbtn info" flat @click="BuildScreen_downloadAPP()">
                  DOWNLOAD APP
                </v-btn>
                <v-btn  class="vbtn info" flat @click="BuildScreen_deployOnline()">
                  DEPLOY APP ONLINE
                </v-btn>
                <br>
                <a :href="GeneratedLink" target="_blank">{{GeneratedLink}}</a>   
                <h3>3. Generate PCB Gerber Files for mmanufacture.</h3>
                <v-progress-linear :indeterminate="true"></v-progress-linear>
                <v-btn class="vbtn info" flat @click="BuildScreen_downloadPCBFiles()">
                  DOWNLOAD PCB FILES
                </v-btn>
                <v-layout row wrap class="pt-5">
                  <div id="generatedPcbTop"></div>
                  <div id="generatedPcbBottom"></div>
                 </v-layout>
              </v-flex>
            </v-layout>
            <v-divider></v-divider>
            <div class="text-sm-center pl-5 ml-4">
              <v-btn class="vbtn info" flat @click="BuildScreen_cancelBuild()">
                {{ CancelBuildButtonText }}
              </v-btn>
            </div>
           </v-container> -->
        </v-card>
    </v-dialog>


  </v-app>


  </div>
</template>

<script>
import Vue from "vue";
import Splitpanes from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import PcbBoard from './components/PcbBoard.vue';
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import * as ace from 'brace';
import 'brace/mode/html';
import 'brace/mode/css';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import JSZipUtils from 'jszip-utils';
import FileSaver from 'file-saver';
import axios from 'axios';
// import pcbStackup from 'pcb-stackup';
// Demos
import VideoPlayer from './demos/VideoPlayer';
import SimpleButton from './demos/SimpleButton';
import SimpleLED from './demos/SimpleLED';


// Server URL
const server = axios.create({
  baseURL: `http://localhost:8081/`
})

// App
export default {
  name: "app",
  components: {
    Splitpanes,
    PcbBoard
  },
  data: () => ({
        lwidth: 0,
        height: 0,
        top: 0,
        left: 0,
        panelHeight: 0,
        panelWidth: 0,
        pcbPanelHeight: '100%',
        pcbWidth: 120,
        pcbHeight: 120,
        pcbBrightness: 'brightness(1)',
        pcbColor: 'rgb(174, 213, 129)',
        webpageContainerPaneSize: 49,
        drawer: false,
        componentSelected: 0,
        componentSlot:'',
        protectorStatus: 'block',
        runStopString: 'white',
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
        nonAvailableComponents: [],
        snackbar: false,
        snackbarText: "Hi!",
        snackbarColor: "success",
        snackbarTimeout: 6000,
        menu_show: false,
        menu_y: 0,
        menu_x: 0,
        iframeOnScreen : false,
        menu_items: [
          { title: 'Remove' }
        ],
        HTMLEditor: false,
        EditorIFRAME_head: undefined,
        EditorIFRAME_body: undefined,
        EditorMAIN_cssTag: undefined,
        EditorMAIN_jsTag: undefined,
        EditorHTML: undefined,
        EditorCSS: undefined,
        EditorJS: undefined,
        EditorHTMLText: undefined,
        EditorCSSText: undefined,
        EditorJSText: undefined,
        EditorJS_Settings: false,
        EditorJS_extSoruceOne: undefined,
        EditorJS_extSoruceTwo: undefined,
        Demos: [
          { title: 'Simple LED', demo: SimpleLED  },   
          { title: 'Simple Button', demo: SimpleButton},
          { title: 'Video Player', demo: VideoPlayer },
        ],
        BuildScreen: false,
        FinalPCB: {
          height: 0,
          width: 0
        },
        FinalComponents: [
          {
            // image, title, subtitle
          }
        ],
        raspberryPinMap: {},
        FinalPinMap: {
          "gpio": [],
          "i2c": [],
          "spi": [],
          "serial": []
        },
        BuildButtonText : "BUILD",
        BuildButtonCount : 0,
        CancelBuildButtonText : "CANCEL",
        CancelBuildButtonCount : 0,
        GeneratedPCBimageTop: "",
        GeneratedPCBimageBottom: "",
        GeneratedLink: ""
  }),
  mounted: function () {
  
    // Load electrical component List:
    this.eComponentList = {
      "submit": {
        0: {
          "component": "physical-button-red",
          "hardElement": "physical-button",
          "hardElementVars": '(gpio:$gpio)',
          "partImage": "buttons/tactile-button-round-red.jpg",
          "image":"buttons/red-round-button.2D.svg",
          "height": "10mm",
          "width": "10mm"
        },
        1: {
          "component": "physical-button-blue",
          "hardElement": "physical-button",
          "hardElementVars": '(gpio:$gpio)',
          "partImage": "buttons/tactile-button-round-blue.jpg",
          "image":"buttons/blue-round-button.2D.svg",
          "height": "20mm",
          "width": "20mm"
        },
        2: {
          "component": "physical-button-green",
          "hardElement": "physical-button",
          "hardElementVars": '(gpio:$gpio)',
          "partImage": "buttons/tactile-button-round-green.jpg",
          "image":"buttons/green-round-button.2D.svg",
          "height": "30mm",
          "width": "30mm"
        }
      },
      "span": {
        0: {
          "component": "LED-5mm-red",
          "hardElement": "physical-output",
          "hardElementVars": '(gpio:$gpio)',
          "partImage": "output/LED-RED.jpg",
          "image":"output/red-5mm-LED.2D.svg",
          "height": "5mm",
          "width": "5mm"
        },
        1: {
          "component": "LED-5mm-blue",
          "hardElement": "physical-output",
          "hardElementVars": '(gpio:$gpio)',
          "partImage": "output/LED-BLUE.jpg",
          "image":"output/blue-5mm-LED.2D.svg",
          "height": "5mm",
          "width": "5mm"
        },
        2: {
          "component": "LED-5mm-green",
          "hardElement": "physical-output",
          "hardElementVars": '(gpio:$gpio)',
          "partImage": "output/LED-GREEN.jpg",
          "image":"output/green-5mm-LED.2D.svg",
          "height": "5mm",
          "width": "5mm"
        },
        3: {
          "component": "LED-5mm-white",
          "hardElement": "physical-output",
          "hardElementVars": '(gpio:$gpio)',
          "partImage": "output/LED-WHITE.jpg",
          "image":"output/white-5mm-LED.2D.svg",
          "height": "5mm",
          "width": "5mm"
        }
      },
      "range" : {
        0: {
          "component": "physical-dynamic-range",
          "hardElement": "physical-motorized-pot",
          "hardElementVars": '(i2c-port:url($i2c), i2c-addr:0x40)',
          "partImage": "range/motorized-potentiometer.png",
          "image":"range/motorizedPot.png",
          "height": "9mm",
          "width": "152mm"
        },
        1: {
          "component": "physical-static-range",
          "hardElement": "physical-pot",
          "hardElementVars": '(motora:$gpio, motorb:$gpio, \
                touch:$gpio, i2c-addr:0x48, i2c-port:url($i2c))',
          "partImage": "range/pot.png",
          "image":"range/potentiometer.png",
          "height": "20mm",
          "width": "20mm"
        }   
      },
      "screens" : {
        0: {
          "component": "utronics3-5inch",
          "hardElement": "",
          "image":"",
          "partImage":"screens/utronics_3.5inch.png",
          "height": "80mm",
          "width": "100mm"
        },
        1: {
          "component" : "geeekpi5inch",
          "hardElement": "",
          "image":"",
          "partImage":"screens/geeekpi_5inch.png",
          "height": "100mm",
          "width": "160mm"
        }
      }
    }

    this.raspberryPinMap = {
      "gpio" :  ["4", "17", "27", "22", "5", "6", "13",
          "26", "18", "23", "24", "25", "12"],
      "i2c": ["/dev/i2c-1"],
      "spi": ["/dev/spidev0.0"],
      "serial" : ["/dev/ttyUSB0"]
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
        var e_innerHTML = $(event.target).children()[0].innerHTML;
        var e_type = $(event.target).children()[0].type;
        var e_tagName = $(event.target).children()[0].tagName;

        // Set special cases (TODO: change in favor of (sensors, input, output))
        if (e_tagName == "IFRAME") {
          e_type = "screens";
          $("iframe").css("pointer-events", "none");
        } else if (e_tagName == "SPAN") {
          e_type = "span";
        }

        event.dataTransfer.setData("id", e_id);
        event.dataTransfer.setData("outerHTML", e_outerHTML);
        event.dataTransfer.setData("innerHTML", e_innerHTML);    
        event.dataTransfer.setData("type", e_type);
        
        console.log("startID:"+e_id);
        console.log("startOuterHTML:",e_outerHTML);
        console.log("startInnerHTML:",e_innerHTML);
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

      // Get coordinates where the element was droped
      var dataLeft = event.pageX - $(event.target).offset().left;
      var dataTop = event.pageY - $(event.target).offset().top;

      // Get soft comonent data
      var dataID = event.dataTransfer.getData("id");
      var dataOuterHTML = event.dataTransfer.getData("outerHTML");
      var dataInnerHTML = event.dataTransfer.getData("innerHTML");
      var dataType = event.dataTransfer.getData("type");

      // If dropped inside the PCB add the component
      if (event.target.id == "PCB") {
        this.pcbBrightness = 'brightness(1)';

        console.log("dataID:"+dataID);
        console.log("dataOuterHTML:"+dataOuterHTML);
        console.log("dataInnerHTML:"+dataInnerHTML);
        console.log("dataTYPE:"+dataType);
        console.log("Coordinates Mouse:", event.pageX , event.pageY);
        console.log("Coordinates Rect:", $(event.target).offset().left , $(event.target).offset().top);
        console.log("Coordinates Droped:", dataLeft , dataTop);
        this.addNewComponent(dataID, dataType, dataInnerHTML, dataOuterHTML, dataLeft, dataTop);

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

    // Initialize search of soft elements that can be harden. 
    //this.searchSoftElements();

    // #### HTML Editor inits
    // Prepare Main CSS and JS Tags
    this.EditorMAIN_cssTag = $("<style></style>").appendTo($('head'));
    this.EditorMAIN_jsTag = $("<script/>").appendTo($('body'));
    // Prepare IFRAME head and body Tags
    this.EditorIFRAME_head = $("#HTMLEditor_iframe").contents().find("head");
    this.EditorIFRAME_body = $("#HTMLEditor_iframe").contents().find("body");
    // Constumize Editors themes
    this.EditorHTML = ace.edit('htmlEditor');
    this.EditorHTML.getSession().setMode('ace/mode/html');
    this.EditorHTML.setTheme('ace/theme/monokai');
    this.EditorCSS = ace.edit('cssEditor');
    this.EditorCSS.getSession().setMode('ace/mode/css');
    this.EditorCSS.setTheme('ace/theme/monokai');
    this.EditorJS = ace.edit('jsEditor');
    this.EditorJS.getSession().setMode('ace/mode/javascript');
    this.EditorJS.setTheme('ace/theme/monokai');
    
    // #### Build PCB 
    // Init final pcb hieght and width 
    this.FinalPCB.height = this.pcbWidth;
    this.FinalPCB.width = this.pcbHeight;

  },
  methods: {
    searchSoftElements () {
      // Zero any previeous arrays
      this.eAvailableComponents = [];
      this.nonAvailableComponents = [];
      this.eComponentSaved = {};

      // Empty PCB board of any component
      $('#PCB').find('*').not('.vdr-stick').remove();

      // Make webpageContainer invisible
      $('#webpageContainer').css("visibility", "hidden")

      // Start progress bar
      $('#webpageContainerProgressbar').css("display", "block")

      
      var uniqueId = 0;
      let hardenNumber = 0;

      // Add Green Wrap to Buttons and Sliders if found, Red IF not
      for (var element of $('#webpageContainer').find( "*" )) {
        var e_width = $(element).outerWidth()+6;
        var e_height = $(element).outerHeight()+6;    

        // If element has no children and has an id
        if ($(element).children().length == 0 ) {

          // Skip specific elements 
          if (element.tagName == 'BR') {
            continue;
          }

          // If element is of type iframe, button or range then..
          if ( (element.tagName == 'BUTTON' || element.type == 'range' )
            || element.tagName == 'SPAN' && $(element).attr('id')) {
    
            // Green box size (added +1 to prevent overflow of text)
            $(element).wrap(
              `<div id="${element.id}_drag" class="draggable_element" 
                draggable="true" style="width:${e_width+1}px;height:${e_height+1}px;display:inline-block;">
                </div>`);

            // Add id to the available components that can be moved
            this.eAvailableComponents.push(element.id);

            // Increase elements that can be harden
            hardenNumber++;

          } else {
            // Elements that cannot be dragged
            var elementID = "";
            if (element.id == "") {
              // Add unique id 
              elementID = uniqueId + "_uniq";
              uniqueId ++;
            } else {
              elementID = element.id;
            }

            $(element).wrap(
              `<div id="${elementID}_nondrag" class="none_draggable_element" 
                style="width:${e_width}px;height:${e_height}px;display:inline-block;">
                </div>`);

            // Add list of non available components (in red)
            this.nonAvailableComponents.push(elementID);
          }
        } else {
          console.log("WARNING: OTHER ELEMENTS NOT AVAILABLE: "+element);
        }
      }

      // SPECIAL CASE FOR THE STUPID VIDEO PLAYER IFRAME
      // Execute funtion after 4 seconds to find iframe change.
      setTimeout( () => { 

        for (var element of $('#webpageContainer').find( "*" )) {  
          // If element has no children and has an id
          
          if ($(element).attr('id')) {
            // If element is of type iframe, button or range then..
            if (element.tagName == 'IFRAME') {
              var e_width = $(element).outerWidth()+6;
              var e_height = $(element).outerHeight()+6;

              var iframeWrapID = element.id+"_nondrag";
              
              // Change warped element to draggable 
              $("#"+iframeWrapID).removeClass("none_draggable_element");
              $("#"+iframeWrapID).addClass("draggable_element");
              $("#"+iframeWrapID).attr("draggable", "true");
              $("#"+iframeWrapID).css("width", e_width);
              $("#"+iframeWrapID).css("height", e_height);

              //Change id to drag
              $("#"+iframeWrapID).attr("id", element.id+"_drag");

              // Move it to eAvailableComponent
              this.nonAvailableComponents = this.nonAvailableComponents.filter(item => item!=element.id);
              console.log("NON AVAL:"+  this.nonAvailableComponents);
              this.eAvailableComponents.push(element.id);
              console.log("AVAL:"+  this.eAvailableComponents);

              // Increase elements that can be harden
              hardenNumber++;
            }
          }
        }
        
        // Hide progress bar
        $('#webpageContainerProgressbar').css("display", "none")
        
        // Make webpageContainer visible
        $('#webpageContainer').css("visibility", "visible")

        // Make webpageContainer a little to the right to make all contents visible
        this.webpageContainerPaneSize = 50;

        // Show snackbar
        if (hardenNumber == 0) {
          this.launchSnackbar('Sorry, no elements found that can be harden', "error", 10000);
        } else if (hardenNumber == 1) {
          this.launchSnackbar(`Great! You can harden ${hardenNumber} element`, "success", 6000);
        } else {
          this.launchSnackbar(`Great! You can harden ${hardenNumber} elements`, "success", 6000);
        }
        

      }, 3000);
    },
    launchSnackbar(text, color, timeout) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbarTimeout = timeout;
      this.snackbar = true;
    },
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
      var name = this.eComponentList[compType][newNumber].component;
      var hardElement = this.eComponentList[compType][newNumber].hardElement;
      var hardElementVars = this.eComponentList[compType][newNumber].hardElementVars;
      var partImage = this.eComponentList[compType][newNumber].partImage;
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
      //Save the new component number selected [Here we save the new selected component]
      this.eComponentSaved[compId].componentSelected = newNumber;       // Set new component selected
      this.eComponentSaved[compId].componentName = name;                // Set new component name
      this.eComponentSaved[compId].componentHardElement = hardElement;  // Set new component hardElement
      this.eComponentSaved[compId].componentHardElementVars = hardElementVars;  // Set new component hardElement
      this.eComponentSaved[compId].componentPartImage = partImage;      // Set new component part Image
      this.eComponentSaved[compId].componentImage = image;              // Set new component image path
      this.eComponentSaved[compId].componentWidth = width;              // Set new component width
      this.eComponentSaved[compId].componentHeight = height;            // Set new component height
      this.eComponentSaved[compId].gpio = [];                           // Set at the end
      this.eComponentSaved[compId].i2c = [];                            // Set at the end
      this.eComponentSaved[compId].spi = [];                            // Set at the end
      this.eComponentSaved[compId].serial = [];                         // Set at the end

    },  
    drop(event) {
      event.preventDefault();
      // console.log("Drop EVENT", event.target); // this element
    },
    getImgUrl(imagePath) {
      return require(imagePath);
    },
    getComponentsImg(item) {
      return require('./assets/'+item);
    },
    setRunMode() {
      console.log("Running MODE");

      // If already in run mode return 
      if (this.runStop ==  true) return;

      // Running mode
      this.runStop = true;
      this.runStopString = "EDIT";
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
      // For all non available comopnents, remove their class
      for (var ele of this.nonAvailableComponents) {
        console.log(ele);
        $('#'+ele+'_nondrag').removeClass('none_draggable_element');
      }
      // if (this.runStop == false) {
        
      // } else {
        

      // }

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
    setEditMode() {
      console.log("Edit MODE");

      // If already in edit mode return 
      if (this.runStop ==  false) return;

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
      // For all non available comopnents, add their class
      for (var ele of this.nonAvailableComponents) {
        console.log(ele);
        $('#'+ele+'_nondrag').addClass('none_draggable_element');
      }
    },
    testClick() {
      // TEST ADDING A BUTTON
      this.addNewComponent("playPause", "submit",
            '<button onclick="playPause()" id="playPause"></button>');

      // this.addNewComponent("video-placeholder", "screens",
      //       '<iframe id="video-placeholder" frameborder="0" allowfullscreen="1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" title="YouTube video player" src="https://www.youtube.com/embed/DCLrDnZO_0E?rel=0&amp;color=white&amp;playlist=dQiNVk_u0po%2C%20IvUU8joBb1Q%2CS-m-CHigCY4%2CHpaHvUOk3F0&amp;enablejsapi=1&amp;origin=http%3A%2F%2Flocalhost%3A8080&amp;widgetid=1" draggable="true"></iframe>');
      //var iframeBody = document.getElementById('video-placeholder').contentWindow.document.body.innerHTML; //$('#video-placeholder').contents();
      //console.log(iframeBody);

    },
    // Adds a new component to the PCB
    addNewComponent(thisId, thisType, thisInnerHtml, thisHtml, thisLeft, thisTop) {

      // // Hide the soft comonent in the user webpage
      // $('#'+thisId).css("visibility", "hidden");
      // // Change the id name of the user webpage
      // $('#'+thisId).attr("id",thisId+"_edit");

      // Get element data to save later:
      var thisWidth = $('#'+thisId).outerWidth();
      var thisHeight = $('#'+thisId).outerHeight();

      // Generate unique id:
      var elementId = "element_"+this.uniqueId;
      this.uniqueId++;

      // Create element container
      $("<div/>", {
        id: elementId,
        class: "noGlobalTrigger",
        style: "position:absolute;display:inline-block;border-radius:5px;border:3px solid transparent;"
      }).appendTo("#PCB");
      // Create protector
      $("#"+elementId).append('<div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div>');

      // Get user web element data // TODO
      $("#"+thisId).detach().appendTo("#"+elementId);
      console.log("ELEMENT TYPE = ", thisType, thisType == "span");
      // Add component element style class (TODO: select class accodign to the type)
      if (thisType == "submit") {
        $("#"+thisId).addClass("submit-physical-button");
      } else if (thisType == "span") {
        $("#"+thisId).addClass("submit-physical-button");
      } else if (thisType == "range") {
        $("#"+thisId).addClass("range-physical-slider");
      } else if (thisType == "screens") {
        $("#"+thisId).addClass("physical-screen");
      } else {
        console.error("FATAL ERROR: Unknown element type");
        return;
      }

      // Remove any innerHTML
      $("#"+thisId).empty();

      // Make it draggable
      $("#"+elementId).draggable({ containment: "#PCB", scroll: false,
        stop: ( event, ui ) => {
          // Set new component position
          for (var key in this.eComponentSaved) {
            if (this.eComponentSaved[key].elementId == elementId) {
              this.setComponentPosition(key);
            }
          }
        }
      });

      // Get element width and height for centering it;
      var eleId_center_x = $("#"+elementId).outerWidth() / 2;
      var eleId_center_y = $("#"+elementId).outerHeight() / 2;
      var mouse_center_x =  thisLeft - eleId_center_x;
      var mouse_center_y =  thisTop - eleId_center_y;

      // Move element to its dropped coordinated
      $("#"+elementId).css("left", (mouse_center_x > 0)? mouse_center_x : thisLeft+"px");
      $("#"+elementId).css("top", (mouse_center_y > 0)? mouse_center_y : thisTop+"px");
      
      // When the component in the PCB is clicked do:
      $("#"+elementId).mousedown((element) => {
        if (this.runStop == false) {
          console.log(this.mouseoverComponent);
          var ele = $(element.target).next()[0];
          // Get current ID
          this.currentComponentId = ele.id;
          // Get current Type
          console.log("Ele TAGNAME", ele.tagName);
          if (ele.type == undefined && ele.tagName != "SPAN") {
            // If type is not detected then is a screen
            this.currentComponentType = "screens";
          } else {
            if (ele.tagName == "SPAN")
              this.currentComponentType = "span";
            else
              this.currentComponentType = ele.type;
          }
          
          console.log("Eleemnt TYPE:"+this.currentComponentType);

          // Pupulate Component List Images
          this.eComponentImages = []; // Clear list
          var type = this.eComponentSaved[this.currentComponentId].type; // Get component type
          var elements = this.eComponentList[type]; // Get all components of the selected type
          for (var i in elements) {
            console.log("PART IMAGE:", elements[i].partImage);
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
          for (var key in this.eComponentSaved) {
            if (key == this.currentComponentId) {
              // Add selection border
              $("#"+this.eComponentSaved[key].elementId).css("border" , "3px solid rgba(50, 50, 50, 0.2)");
            } else {
              // Remove selection border
              $("#"+this.eComponentSaved[key].elementId).css("border" , "3px solid transparent");
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
        // Physical component values
        "componentSelected": selectedNumber,
        "componentName": null,            // Set in the next function
        "componentHardElement": null,     // Set in the next function
        "componentHardElementVars": null, // Set in the next function
        "componentPartImage": null,       // Set in the next function
        "componentImage": null,           // Set in the next function
        "componentWidth": null,           // Set in the next function
        "componentHeight": null,          // Set in the next function
        "componentLeft": null,            // Set in get position
        "comopnentTop": null,             // Set in get position
        "componentCenterLeft": null,      // Set in get position
        "componentCenterTop": null,       // Set in get position
        // Original html tag values
        "html": thisHtml,
        "width": thisWidth,
        "height": thisHeight,
        "innerHTML": thisInnerHtml
      };

      // Apply style settings for new component (TODO: get Id and type)
      this.setNewComponentSelection(thisId, thisType, selectedNumber);

      // Set component position
      this.setComponentPosition(thisId);

    },
    setComponentPosition(thisId) {

      // Get component data
      var elementId  = this.eComponentSaved[thisId].elementId;
      var componentWidth = parseFloat(this.eComponentSaved[thisId].componentWidth);
      var componentHeight = parseFloat(this.eComponentSaved[thisId].componentHeight);

      // Get top and left in mm
      var leftpx = parseFloat($("#"+elementId).css("left"));
      var toppx = parseFloat($("#"+elementId).css("top"));
      var ruler = $('#mm_rule').height();  
      var leftmm = Math.floor(leftpx/ (ruler/100));
      var topmm = Math.floor(toppx/ (ruler/100));

      // Set comopnent Top and left in mm
      this.eComponentSaved[thisId].componentLeft = leftmm;
      this.eComponentSaved[thisId].componentTop = topmm;

      // Set component center left and top in mm
      var centerLeft = leftmm + (componentWidth/2);
      var centerTop = topmm + (componentHeight/2);
      this.eComponentSaved[thisId].componentCenterLeft = centerLeft;
      this.eComponentSaved[thisId].componentCenterTop = centerTop;

      console.log("CENTER LEFT: "+ centerLeft +"mm" );
      console.log("CENTER TOP: "+ centerTop +"mm" );

    },
    menuItemClick(item) {
      console.log("Item Cliked"+item);
      removeComponent();
    },
    removeComponent() {
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
      } else if (e_type == "span") {
        $("#"+this.currentComponentId).removeClass("submit-physical-button");
      } else if (e_type == "range") {
        $("#"+this.currentComponentId).removeClass("range-physical-slider");
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
        this.unselectComponents();
      }
    },
    unselectComponents() {
      // Unselect components
      for (var key in this.eComponentSaved) {
          // Remove selection border
          $("#"+this.eComponentSaved[key].elementId).css("border" , "3px solid transparent");
      }
      // Hide Component Selection List
      this.componentListDisplay = 'none';
      this.pcbPanelHeight = '100%';
    },
    // Make user webpage elements draggable
    webPageMouseOver(e) {

    },
    webPageMouseOut(e) {
      // TODO: implement css layout
      // console.log("Mouse out of:"+e)
    },
    openHTMLEditor() {
      this.HTMLEditor = true;
    },
    HTMLEditor_loadDemo(Demo) {
      // HTML
      this.EditorHTMLText = Demo.html;
      this.EditorHTML.getSession().setValue(this.EditorHTMLText);
      // CSS
      this.EditorCSSText = Demo.css;
      this.EditorCSS.getSession().setValue(this.EditorCSSText);
      // JS
      this.EditorJSText = Demo.js;
      this.EditorJS.getSession().setValue(this.EditorJSText);
    },
    HTMLEditor_run() {
      
      // Refresh iframe 
      var iframe = document.querySelector('#HTMLEditor_iframe');
      iframe.contentWindow.location.reload(true); 
        // Will call funcition on iframe load:HTMLEditor_iframeOnLoad()

    },
    HTMLEditor_iframeOnLoad () {
      this.EditorIFRAME_head = $("#HTMLEditor_iframe").contents().find("head");
      this.EditorIFRAME_body = $("#HTMLEditor_iframe").contents().find("body");

      // this.EditorIFRAME_head.empty();
      // this.EditorIFRAME_body.empty();

      // Set External script sources
      if (this.EditorJS_extSoruceOne != undefined) {
        console.log("Ext Soruce One has:"+this.EditorJS_extSoruceOne);
        this.EditorIFRAME_head.append($("<script />", {
		      src: `${this.EditorJS_extSoruceOne}`
        }));
      }     
      if (this.EditorJS_extSoruceTwo != undefined) {
        console.log("Ext Soruce Two has:"+this.EditorJS_extSoruceTwo);
      }

      // Set CSS
      this.EditorIFRAME_head.append($("<style />", {
		    text: `${this.EditorCSS.getSession().getValue()}`
      }));

      // Set HTML
      this.EditorIFRAME_body.html(this.EditorHTML.getSession().getValue());

      // Set JS
      this.EditorIFRAME_body.append($("<script />", {
		    html: `${this.EditorJS.getSession().getValue()}`
      }));

    },
    HTMLEditor_injectWebPage() {
      console.log("Injecting to Appliancizer");
      this.HTMLEditor = false;
    
      // Inject HTML to webpageContainer
      $("#webpageContainer").empty();
      $("#webpageContainer").append(this.EditorHTML.getSession().getValue());
      // Inject CSS to whole document
      this.EditorMAIN_cssTag.remove();
      this.EditorMAIN_cssTag = $("<style></style>").appendTo($('head'));
      this.EditorMAIN_cssTag.text(this.EditorCSS.getSession().getValue());
      // Inject JS to whole document
      this.EditorMAIN_jsTag.remove();
      this.EditorMAIN_jsTag = $("<script/>").appendTo($('body'));
      this.EditorMAIN_jsTag.text(this.EditorJS.getSession().getValue());
      // Initialize search of soft elements that can be harden. 
      this.searchSoftElements();
    },
    mapComponentsPins (hardVars, key) {
      // Translate Pins (e.g. (gpio:$gpio) to (gpio:4) )
      do  {
        var occurrences = false;
        // Check for gpio, i2c, spi and serial occurences
        ["gpio", "i2c", "spi", "serial"].forEach((ioName) => {
          if (hardVars.includes("$"+ioName)) {
            occurrences = true;
            var nextPin = this.FinalPinMap[ioName].length;
            var availablePins = this.raspberryPinMap[ioName].length;
            if (nextPin >= availablePins) {
              // No more gpio pins avaliable
              console.log(`Error: Max num of ${ioName} pins avilable reached`);
              throw `Error: Max num of ${ioName} pins avilable reached`;          
            } else {
              // Replace string with next available Pin
              var pinName = this.raspberryPinMap[ioName][nextPin];
              hardVars = hardVars.replace("$"+ioName, `"${pinName}"`);

              // Add to parts dictionary
              this.eComponentSaved[key][ioName].push(pinName);

              // Add to dictionary
              this.FinalPinMap[ioName].push(this.raspberryPinMap[ioName][nextPin]);
            }
          }
        });
      } while (occurrences == true);

      return hardVars;
    },
    openBuildScreen() {
      // Just to test Build screen
      this.BuildScreen = true;
      // Reset Final Components
      this.FinalComponents = [];

      // Just for Test, Fill random component
      this.eComponentSaved["myButton"] = {
        comopnentTop: null,
        componentCenterLeft: 5,
        componentCenterTop: 5,
        componentHeight: "10mm",
        componentImage: "buttons/red-round-button.2D.svg",
        componentLeft: 0,
        componentName: "physical-button-red",
        componentHardElement : "physical-button",
        componentHardElementVars : '(gpio:$gpio)',
        componentPartImage: "buttons/tactile-button-round-red.jpg",
        componentSelected: 0,
        componentTop: 0,
        componentWidth: "10mm",
        gpio: [],
        i2c: [],
        spi: [],
        serial: [],
        elementId: "element_X",
        height: 25,
        html: '<button id="myButton" onclick="test()">test</button>',
        innerHTML: "test",
        type: "submit",
        width: 26.5781
      };

      // this.eComponentSaved["fakeid2"] = {
      //   comopnentTop: null,
      //   componentCenterLeft: 5,
      //   componentCenterTop: 5,
      //   componentHeight: "10mm",
      //   componentImage: "buttons/red-round-button.2D.svg",
      //   componentLeft: 0,
      //   componentName: "physical-button-red",
      //   componentHardElement : "physical-button",
      //   componentHardElementVars : '(motora:$gpio, motorb:$gpio, touch:$gpio, i2c-addr:0x48, i2c-port:url($i2c))',
      //   componentPartImage: "buttons/tactile-button-round-red.jpg",
      //   componentSelected: 0,
      //   componentTop: 0,
      //   componentWidth: "10mm",
      //   gpio: [],
      //   i2c: [],
      //   spi: [],
      //   serial: [],
      //   elementId: "element_X",
      //   height: 25,
      //   html: '<button id="myButton" onclick="test()">test</button>',
      //   innerHTML: "test",
      //   type: "submit",
      //   width: 26.5781
      // };

      
      // Reset Final Pin Mmap
      this.FinalPinMap = {
          "gpio": [],
          "i2c": [],
          "spi": [],
          "serial": []
      }; 
      
      // Map Component pins
      for (var key in this.eComponentSaved) {
        // Get hardware CSS variables
        var hardVars = this.eComponentSaved[key].componentHardElementVars;
        console.log("HARDWARE CSS VARS BEFORE:", hardVars);
        try {
          var hardVars = this.mapComponentsPins(hardVars, key);
        } catch (error) {
          // TODO manage error
          console.error(error);
        }
        // Save new hardware CSS variables
        console.log("HARDWARE CSS VARS AFTER:", hardVars);
        this.eComponentSaved[key].componentHardElementVars = hardVars;
      }

      // Unselect components before screenshoot
      this.unselectComponents();

      // Output all component data:
      for (var key in this.eComponentSaved) {
        console.log("COMPONENT ADDED:", this.eComponentSaved[key]);
        // Push to list
        this.FinalComponents.push({
          image: this.getComponentsImg(this.eComponentSaved[key].componentPartImage),
          title: this.eComponentSaved[key].componentName + " &lt"+this.eComponentSaved[key].componentHardElement+"&gt",
          subtitle: `Width: ${this.eComponentSaved[key].componentWidth} 
                     Height: ${this.eComponentSaved[key].componentHeight} |
                     CenterLeft: ${this.eComponentSaved[key].componentCenterLeft}mm
                     CenterTop: ${this.eComponentSaved[key].componentCenterTop}mm`
        })
      }

      // Take a picture of the PCB and add it to the left 
      $('#canvasPCBimage').empty(); // Delete previous image
      html2canvas(document.querySelector('#PCB')).then(function(canvas) {
        // Add canvas pcb image 
        document.querySelector('#canvasPCBimage').appendChild(canvas);

        // Adjust horizontal pcb width Text
        var widthFlexBox = $('#buildScreen_pcbCanvas').width()
        var widthCanvas =  canvas.width;
        var widthFinal = 0;
        if (widthCanvas > widthFlexBox ) {
          widthFinal = widthFlexBox;
        } else {
          widthFinal = widthCanvas;    
        }
        $('#buildScreen_pcbWidthText').css("width", widthFinal + 'px');
        
        // Adjust vertical pcb Text
        var heightFlexBox = $('#buildScreen_pcbCanvas').height()
        var heightCanvas =  canvas.height;
        var heightFinal = 0;
        if (heightCanvas > heightFlexBox ) {
          heightFinal = heightFlexBox;
        } else {
          heightFinal = heightCanvas;    
        }
        $('#buildScreen_pcbHeightText').css("height",  heightFinal + 'px');
      });

    },
    BuildScreen_pcbresize(pcb) {
      this.FinalPCB.height = pcb.height;
      this.FinalPCB.width = pcb.width;
    },
    BuildScreen_build() {
      if (this.BuildButtonCount == 0) {
        this.BuildButtonText = "THIS WILL TAKE TIME, ARE YOU SURE?";
        this.BuildButtonCount++;
      } else {
        // Execute Stuff here
        $('#buildScreen_mainPane').css("display", "none");
        $('#buildScreen_downloadPane').css("display", "block");
        // Return Button to normal value
        this.BuildButtonText = "BUILD";
        this.BuildButtonCount = 0;
      }
    },
    BuildScreen_cancelBuild() {
      if (this.CancelBuildButtonCount == 0) {
        this.CancelBuildButtonText = "THIS WILL CACNEL THE BUILD PROCESS, ARE YOU SURE?";
        this.CancelBuildButtonCount++;
      } else {
        // Execute Stuff here
        $('#buildScreen_mainPane').css("display", "block");
        $('#buildScreen_downloadPane').css("display", "none");
        // Return Button to normal value
        this.CancelBuildButtonText = "CANCEL";
        this.CancelBuildButtonCount = 0;
      }
    },
    BuildScreen_downloadPCBFiles() {
      console.log("Sending PCB parts to server");

      // Send html and css generated files
      server.post('generatePCB', {
        pcbHeight: this.FinalPCB.height,
        pcbWidth: this.FinalPCB.width,
        parts: this.eComponentSaved
      }).then((response) => {
        // Should return a link
        if (response.status != 200) {
          alert(response.data.error)
          console.error("Server error when trying to generate PCB")
        } else {
          console.log(response.data.msg);
        }
      }).catch(error => alert(error.message)); // if network error

      // this.GeneratedPCBimageTop;

      // // Empty images
      // $('#generatedPcbTop').empty();
      // $('#generatedPcbBottom').empty();

      // // const layers = [
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.dri').default, filename: './gerberfiles/Arduino/arduino.dri'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.GBL').default, filename: './gerberfiles/Arduino/arduino.GBL'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.GBP').default, filename: './gerberfiles/Arduino/arduino.GBP'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.GBS').default, filename: './gerberfiles/Arduino/arduino.GBS'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.GML').default, filename: './gerberfiles/Arduino/arduino.GML'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.gpi').default, filename: './gerberfiles/Arduino/arduino.gpi'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.GTL').default, filename: './gerberfiles/Arduino/arduino.GTL'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.GTO').default, filename: './gerberfiles/Arduino/arduino.GTO'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.GTP').default, filename: './gerberfiles/Arduino/arduino.GTP'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.GTS').default, filename: './gerberfiles/Arduino/arduino.GTS'},
      // //   {gerber: require('raw-loader!./gerberfiles/Arduino/arduino.TXT').default, filename: './gerberfiles/Arduino/arduino.TXT'}
      // // ]

      // const layers = [
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GBL').default, filename: './gerberfiles/artik530/artik530.GBL'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GBO').default, filename: './gerberfiles/artik530/artik530.GBO'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GBP').default, filename: './gerberfiles/artik530/artik530.GBP'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GBS').default, filename: './gerberfiles/artik530/artik530.GBS'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GML').default, filename: './gerberfiles/artik530/artik530.GML'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GTL').default, filename: './gerberfiles/artik530/artik530.GTL'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GTO').default, filename: './gerberfiles/artik530/artik530.GTO'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GTP').default, filename: './gerberfiles/artik530/artik530.GTP'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.GTS').default, filename: './gerberfiles/artik530/artik530.GTS'},
      //   {gerber: require('raw-loader!./gerberfiles/artik530/artik530.TXT').default, filename: './gerberfiles/artik530/artik530.TXT'}
      // ]

      // console.log(layers);

      // pcbStackup(layers).then(stackup => {
      //   //console.log(stackup.top.svg) // logs "<svg ... </svg>"
      //   //console.log(stackup.bottom.svg) // logs "<svg ... </svg>"
      //   $('#generatedPcbTop').append(stackup.top.svg);
      //   $('#generatedPcbBottom').append(stackup.bottom.svg);
      // })

    }, BuildScreen_downloadOSImage() {

      console.log("Download OS image");
      
    }, generateHTMLDoc() {
    
      // index.html is generated here
      return '<!DOCTYPE html>\n\
<html lang="en">\n\
  <head>\n\
  <meta charset="UTF-8">\n\
  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n\
  <meta name="viewport" content="width=device-width,initial-scale=1.0">\n\
  <link rel="import" href="amalgam/amalgam.html">\n\
  <link rel="stylesheet" href="hardware.css">\n\
  <style>\n'+SimpleLED.css+'  </style>\n\
  </head>\n\
  <body>\n'+SimpleLED.html+
    '\n  <script>\n'+ SimpleLED.js +'  <\/script>\n\
  </body>\n\
</html>\n';

    }, generateCSSDoc() {

      // Hardware.css is generated here 
      var cssDoc = "";
      for (var key in this.eComponentSaved) {
        var compId = key;
        var compHardElement = this.eComponentSaved[key].componentHardElement;
        var compHardElementVars = this.eComponentSaved[key].componentHardElementVars;
        cssDoc = cssDoc +
'#'+compId+' {\n\
  hardware: '+compHardElement+' '+compHardElementVars+';\n\
}\n\
\n\
'+compHardElement+' {\n\
  display: none;\n\
}\n\
\n'
      }
      return cssDoc;

    }, BuildScreen_downloadAPP() {

      var zip = new JSZip();

      // Create app.html file
      var htmlDoc = this.generateHTMLDoc();
      zip.file("app.html", htmlDoc);

      // Create hardware.css file
      var cssDoc = this.generateCSSDoc();
      console.log("CSS DOC: ", cssDoc);
      zip.file("hardware.css", cssDoc);

      // Add AmagamNative
      var amalgam = zip.folder("amalgam");
      amalgam.file("amalgam.html", require('raw-loader!./amalgamNative/amalgam.html').default);
      amalgam.file("amalgam.js", require('raw-loader!./amalgamNative/amalgam.js').default);
      amalgam.file("physical-button.js", require('raw-loader!./amalgamNative/physical-button.js').default);
      amalgam.file("physical-motorized-pot.js", require('raw-loader!./amalgamNative/physical-motorized-pot.js').default);
      amalgam.file("physical-pot.js", require('raw-loader!./amalgamNative/physical-pot.js').default);
      amalgam.file("physical-rgb-led.js", require('raw-loader!./amalgamNative/physical-rgb-led.js').default);
      amalgam.file("physical-servo-motor.js", require('raw-loader!./amalgamNative/physical-servo-motor.js').default);
      amalgam.file("physical.css", require('raw-loader!./amalgamNative/physical.css').default);
      amalgam.file("test-physical-button.js", require('raw-loader!./amalgamNative/test-physical-button.js').default);
      amalgam.file("test-physical-submit.js", require('raw-loader!./amalgamNative/test-physical-submit.js').default);

      var boards_pinout = amalgam.folder("boards_pinout");
      boards_pinout.file("raspberrypi_pinout.css", require('raw-loader!./amalgamNative/boards_pinout/raspberrypi_pinout.css').default);

      zip.generateAsync({type:"blob"}).then(function(content) {
          // see FileSaver.js
          FileSaver.saveAs(content, "app.zip");
      });


    }, BuildScreen_deployOnline() {

      console.log("Deploy online");

      // Send html and css generated files
      server.post('generateWebPage', {
        userName: "testUser",
        htmlDoc: this.generateHTMLDoc(),
        cssDoc: this.generateCSSDoc()
      }).then((response) => {
        // Should return a link
        if (response.status != 200) {
          alert(response.data.error)
          console.error("Server error when trying to generate web page")
        } else {
           console.log(response.data.link); 
           this.GeneratedLink = response.data.link;
        }
      }).catch(error => alert(error.message)); // if network error

    }

  },
  created () {

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
  width: 30%;
  height: 50%;
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

#PCB {
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
  visibility: hidden;
  height: 100%;
  overflow: scroll;
}

#webpageContainerProgressbar {
  display : none;
  position: absolute;
  padding-top: 20%;
  padding-left: 20%;
  z-index: 5;
}

#webframecontiner {
	display: block;
	margin: 0 auto;
	height: 100%;
	width: 100%;
  overflow: scroll;
  border: 4px solid black;
}

#appInfo {
  width: 100%;
}

/* 
Build Screen css 
*/
.textVertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  transform: rotate(180deg);
}

.flexBoxHeight {
  height: 100%;
}

/* Build Screen */

#buildScreen_mainPane {
  display: block;
  height: 94%;
}

#buildScreen_info {
  overflow-y: auto;
}

#buildScreen_pcbCanvas {
  overflow: auto;
}

#buildScreen_layoutHeight {
  height: 88%;
}

#buildScreen_dividerHeight {
  height: 100%;
}

/* Download Screen */

#buildScreen_downloadPane {
  display: none;
  height: 94%;
}

#buildDownload_layoutHeight {
  height: 88%;
}

#generatedPcbTop {
  height: 20%;
}

#generatedPcbBottom {
  height: 20%;
}


/* 
Draggable elements css 
*/
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

/* None draggable elements css */
.none_draggable_element {
  background: transparent;
	position: relative;/*parent must have positioning*/
  border-color: red;
  border-style: dotted;
}

.none_draggable_element:after {
  content: "";
	display: block;
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
}


/*
HTML Editor css
*/
#htmlEditorDialogHeight {
  height: 100%;
}

#htmlEditor{
  width: 100%;
  height: 80%;
  overflow: hidden;
}

#cssEditor{
  width: 100%;
  height: 80%;
  overflow: hidden;
}

#jsEditor{
  width: 100%;
  height: 80%;
  overflow: hidden;
}

#HTMLEditor_iframe {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

#editorMainPanes {
  height: 90%;
}

#buildScreenDialogHeight {
  /* height: 100%; */
  overflow-x: auto;
}

.output {
   background: #fff;
   border-left: 1px solid #f3f3f3;
   overflow: hidden;
   padding: 0 20px;
   margin: 20px 0;
}
.output iframe {
   border: none;
   width: 100%;
   height: 100%;
   overflow: hidden;
}
.output iframe::-webkit-scrollbar {
   display: none;
}


/*
Vuetify edited styles
*/
.vbtn {
  /* Set vewutify styles again */
  background-color: transparent;
  border-style: none;
  color: inherit;
}

.v-expansion-panel__container {
  /* Get expansion panel color right */
  background-color: #212121 !important;
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

/* # Span Style */
.span-physical-output {
 display: block;
 background-color: transparent;
 background-size: contain;
 border-style: none;
 width: 10mm;
 height: 10mm;
 background-image: url('~@/assets/output/LED-RED.jpg');
}

/* # Range Style */
.range-physical-slider {
  display: block;
  -webkit-appearance: none;
  background-image: url('~@/assets/range/motorizedPot.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-color: transparent;
  border: none; 
}

.range-physical-slider::-webkit-slider-runnable-track {
  background: black;
  height: 0px;
  margin-top: -6px;
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
