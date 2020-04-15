<!--
// Tomorrow:
// - Integrate this with gadgetron.
// - ***Add RPI sound  header (Note that a device that needs one device more for the connectro is needed)
// - How to add a notification if max number of I/Os for the connector is reached? (hard)
// - Add rotation (Hard)
// - 1.- ***Get right part sizes (Missing both colored Tactile buttons and motorized pot correct size)
// - 2.- Check all schematc_names..
// - 3.- Check image and UI for raspberry PI.
// - 4.- Maybe add users
// - 6.- Try to remove jquery.min from injector (not necessary)
// Tomorrow 2: 
// - Add projects dashboard and save/load projects
// - Integrate users to project (SQL)
-->

<template>
  <div id="app">
    <v-app id="inspire">
      <!-- #ToolBar Content -->
      <v-toolbar dense color="grey darken-4" dark fixed app>
        <v-toolbar-title class="hidden-sm-and-down"
          >Appliancizer</v-toolbar-title
        >
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-tabs right slider-color="rgb(174, 213, 129)" color="grey darken-4">
            <v-tab @click="setEditMode()">
              <v-btn class="vbtn" flat>
                EDIT
                <v-icon>edit</v-icon>
              </v-btn>
            </v-tab>
            <v-tab @click="setRunMode()">
              <v-btn class="vbtn" flat>
                RUN
                <v-icon>play_arrow</v-icon>
              </v-btn>
            </v-tab>
          </v-tabs>

          <v-btn class="vbtn" flat @click="testClick()">TEST</v-btn>
          <v-btn class="vbtn" flat @click="project_save()">PR-SAVE</v-btn>
          <v-btn class="vbtn" flat @click="project_load()">PR-LOAD</v-btn>
          <v-btn class="vbtn" flat @click="ProjectsScreen_open()"
            >PR-SCREEN</v-btn
          >
        </v-toolbar-items>
      </v-toolbar>

      <!-- #Main Content -->
      <v-content>
        <v-container fluid fill-height>
          <v-layout row wrap>
            <splitpanes class="default-theme" watch-slots>
              <!-- <span :splitpanes-size="webpageContainerPaneSize"> -->
              <pane>
                <div id="webpageContainerProgressbar" class="text-xs-center">
                  <v-progress-circular
                    color="rgb(174, 213, 129)"
                    :size="50"
                    indeterminate
                  ></v-progress-circular>
                </div>
                <v-layout column fill-height>
                  <v-layout row>
                    <v-toolbar-title class="pt-2 mx-3"
                      >Device Screen</v-toolbar-title
                    >
                    <v-spacer></v-spacer>
                    <v-menu offset-y>
                      <template v-slot:activator="{ on }">
                        <v-btn
                          class="vbtn"
                          outline
                          v-on="on"
                          :disabled="hdmiScreens_button_disabled"
                        >
                          <v-icon>smartphone</v-icon>
                          HDMI SCREEN ({{ hdmiScreens_current }})
                          <v-icon>arrow_drop_down</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-tile
                          v-for="(screen, index) in hdmiScreens"
                          :key="screen.title"
                          avatar
                          @click="hdmiScreens_newScreenClick(index)"
                        >
                          <v-list-tile-content>
                            <v-list-tile-title>
                              {{ screen.title }}
                            </v-list-tile-title>
                          </v-list-tile-content>

                          <v-list-tile-avatar tile>
                            <img :src="require('./assets/' + screen.avatar)" />
                          </v-list-tile-avatar>
                        </v-list-tile>
                      </v-list>
                    </v-menu>
                    <v-btn
                      id="buttonAdd"
                      class="vbtn"
                      @click="openHTMLEditor()"
                    >
                      ADD WEB PAGE
                      <v-icon>add</v-icon>
                    </v-btn>
                  </v-layout>

                  <v-divider class="pb-1"></v-divider>
                  <v-flex fill-height style="background-color:rgb(35, 35, 35)">
                    <div
                      id="hdmiScreenBorder"
                      v-bind:class="{ phone: hdmiScreens_display }"
                      v-bind:style="{
                        height: hdmiScreens_height,
                        width: hdmiScreens_width
                      }"
                    >
                      <div id="webpageContainer" style="visibility: visible">
                        <!-- User Web page will be injected here -->
                      </div>
                    </div>
                  </v-flex>
                </v-layout>
              </pane>
              <pane>
                <div id="PCBPanel" :style="{ height: pcbPanelHeight }">
                  <v-layout row>
                    <v-toolbar-title class="pt-2 mx-3">PCB</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn
                      id="buttonBuild"
                      class="vbtn"
                      @click="openBuildScreen()"
                    >
                      BUILD
                      <v-icon>build</v-icon>
                    </v-btn>
                  </v-layout>
                  <v-divider class="pb-1"></v-divider>
                  <PcbBoard
                    ref="PcbBoard"
                    id="PCB"
                    :w="pcbWidth"
                    :h="pcbHeight"
                    :brightness="pcbBrightness"
                    :color="pcbColor"
                    ondragover="event.preventDefault()"
                    @pcbresize="BuildScreen_pcbresize($event)"
                  >
                    <!-- PCB components will be inserted here -->
                  </PcbBoard>
                </div>
                <!-- #Component Title -->
                <v-card
                  dark
                  color="grey darken-3"
                  :style="{ display: componentListDisplay }"
                >
                  <v-card-title class="subheading py-1">
                    <strong>Part Description:&nbsp;</strong>
                    <span>{{ currentComponentDescription.toUpperCase() }}</span>
                    <v-spacer></v-spacer>
                    <v-btn
                      class="vbtn"
                      light
                      :disabled="componentRemoveDisable"
                      @click="removeParentComponent()"
                    >
                      REMOVE
                    </v-btn>
                  </v-card-title>
                </v-card>
                <!-- #List of Components -->
                <v-layout
                  row
                  class="noGlobalTrigger"
                  :style="{ display: componentListDisplay }"
                  justify-start
                >
                  <v-flex
                    class="noGlobalTrigger"
                    xs2
                    v-for="(item, index) in eComponentImages"
                    :key="index"
                  >
                    <v-img
                      :key="index"
                      contain
                      @click="componentClick(index)"
                      :src="getComponentsImg(item)"
                      class="componentImages noGlobalTrigger"
                      v-bind:class="{
                        componentSelect: componentSelected === index
                      }"
                    ></v-img>
                  </v-flex>
                </v-layout>
              </pane>
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
        <v-btn class="vbtn" flat @click="snackbar = false">Close</v-btn>
      </v-snackbar>

      <!-- #Footer -->
      <v-footer color="grey darken-4">
        <span class="white--text">&copy; NVSL 2019</span>
      </v-footer>

      <!-- #Right Click Menu -->
      <v-menu
        v-model="menu_show"
        :position-x="menu_x"
        :position-y="menu_y"
        absolute
        offset-y
      >
        <v-list>
          <v-list-tile v-for="(item, index) in menu_items" :key="item.title">
            <v-list-tile-title @click="menuItemClick(index)">
              {{ item.title }}
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>

      <!-- HTML/CSS/Javscript Editor -->
      <v-dialog
        v-model="HTMLEditor"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card id="htmlEditorDialogHeight">
          <v-toolbar dark dense color="grey darken-4">
            <v-toolbar-title>Webpage Editor</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-menu offset-y>
              <template v-slot:activator="{ on }">
                <v-btn class="vbtn warning" flat v-on="on">
                  DEMOS
                  <v-icon>add</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-tile
                  v-for="(item, index) in Demos"
                  :key="index"
                  @click="HTMLEditor_loadDemo(item.demo)"
                >
                  <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile>
              </v-list>
            </v-menu>

            <v-btn class="vbtn success" flat @click="HTMLEditor_run()">
              RUN
              <v-icon>arrow_forward_ios</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              dark
              class="vbtn"
              color="indigo"
              @click="HTMLEditor_injectWebPage()"
            >
              INJECT
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
            <splitpanes
              class="default-theme"
              vertical
              :push-other-panes="false"
            >
              <pane>
                <splitpanes horizontal :push-other-panes="false">
                  <pane>
                    <v-toolbar color="grey darken-4" dark dense>
                      <v-toolbar-title>
                        <strong>HTML</strong>
                      </v-toolbar-title>
                    </v-toolbar>
                    <v-divider></v-divider>
                    <div id="htmlEditor">{{ EditorHTMLText }}</div>
                  </pane>
                  <pane>
                    <v-toolbar color="grey darken-4" dark dense>
                      <v-toolbar-title>
                        <strong>CSS</strong>
                      </v-toolbar-title>
                    </v-toolbar>
                    <v-divider></v-divider>
                    <div id="cssEditor">{{ EditorCSSText }}</div>
                  </pane>
                  <pane>
                    <v-expansion-panel color="grey darken-4" dark>
                      <v-expansion-panel-content>
                        <template v-slot:header>
                          <v-toolbar-title>
                            <strong>JS</strong>
                          </v-toolbar-title>
                        </template>
                        <v-card class="white">
                          <v-container class="pt-4 pb-0 my-0">
                            <!-- <v-subheader class="py-1 my-1">Example: https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js</v-subheader> -->
                            <v-text-field
                              light
                              class="pa-0 ma-1"
                              v-model="EditorJS_extSoruceOne"
                              label="External Source 1"
                              placeholder="https://..."
                              type="text"
                              clearable
                            ></v-text-field>
                            <v-text-field
                              light
                              class="pa-0 ma-1"
                              v-model="EditorJS_extSoruceTwo"
                              label="External Source 2"
                              placeholder="https://..."
                              type="text"
                              clearable
                            ></v-text-field>
                          </v-container>
                        </v-card>
                      </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-divider></v-divider>
                    <div id="jsEditor">{{ EditorJSText }}</div>
                  </pane>
                </splitpanes>
              </pane>
              <pane>
                <iframe
                  id="HTMLEditor_iframe"
                  @load="HTMLEditor_iframeOnLoad()"
                  sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
                  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media"
                  scrolling="auto"
                  allowtransparency="true"
                  allowpaymentrequest="true"
                  allowfullscreen="true"
                ></iframe>
              </pane>
            </splitpanes>
          </v-container>
        </v-card>
      </v-dialog>

      <!-- Build Screen -->
      <v-dialog
        v-model="BuildScreen"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
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
              <br />
              <v-layout row wrap id="buildScreen_layoutHeight">
                <div
                  id="buildScreen_pcbHeightText"
                  class="textVertical text-xs-center"
                >
                  {{ FinalPCB.height }} mm
                </div>
                <v-flex
                  id="buildScreen_pcbCanvas"
                  xs4
                  class="pr-3 flexBoxHeight"
                >
                  <div id="canvasPCBimage" class="pr-3"></div>
                  <div id="buildScreen_pcbWidthText" class="text-sm-center">
                    {{ FinalPCB.width }} mm
                  </div>
                </v-flex>
                <v-divider
                  id="buildScreen_dividerHeight"
                  class="mx-3"
                  inset
                  vertical
                ></v-divider>
                <v-flex xs6 id="buildScreen_info" class="flexBoxHeight">
                  <h3>
                    1. PCB electrical components list. Buy components using the
                    "Buy Link" in each component:
                  </h3>
                  <v-list two-line>
                    <template v-for="(item, index) in FinalComponents">
                      <v-list-tile
                        v-if="item.title"
                        :key="index + '_list'"
                        avatar
                      >
                        <v-list-tile-avatar tile size="62">
                          <img :src="item.image" />
                        </v-list-tile-avatar>

                        <v-list-tile-content class="pl-4">
                          <v-list-tile-title
                            v-html="item.title"
                          ></v-list-tile-title>
                          <v-list-tile-sub-title
                            v-html="item.subtitle"
                          ></v-list-tile-sub-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-divider
                        v-if="item.title"
                        :key="index + '_divider'"
                        :inset="true"
                      ></v-divider>
                    </template>
                  </v-list>
                </v-flex>
              </v-layout>
              <v-toolbar dense flat color="#f2f2f2">
                <v-toolbar-title>2.- GENERATE PCB</v-toolbar-title>
              </v-toolbar>
              <v-container>
                <h3>
                  2. Generate PCB Gerber Files and send your PCB to manufacture.
                  We recomedend
                  <a
                    href="https://jlcpcb.com/quote#/?orderType=1&stencilLayer=2"
                    target="_blank"
                    >JLCPCB</a
                  >
                  for manufacturing your PCB.
                </h3>
                <!-- <v-progress-linear :indeterminate="true"></v-progress-linear> -->
                <v-layout row align-center fill-height>
                  <v-flex xs4>
                    <v-btn
                      class="vbtn info"
                      :loading="pcbLoading"
                      :disabled="pcbLoading"
                      light
                      @click="BuildScreen_downloadPCBFiles()"
                      >GENERATE PCB FILES</v-btn
                    >
                    <v-progress-circular
                      :rotate="-90"
                      :size="100"
                      :width="15"
                      :value="pcbPercentage"
                      :color="
                        pcbPercentage == 100 ? 'rgb(174, 213, 129)' : 'info'
                      "
                    >
                      {{ pcbPercentage }}
                    </v-progress-circular>
                  </v-flex>
                  <v-flex xs4>
                    <div>
                      <v-icon v-if="pcbGenerate == 0" color="gray"
                        >access_time</v-icon
                      >
                      <v-icon v-else-if="pcbGenerate == 1" color="gray"
                        >directions_run</v-icon
                      >
                      <v-icon v-else-if="pcbGenerate == 2" color="green"
                        >check</v-icon
                      >
                      <v-icon v-else color="red">close</v-icon>
                      <span> Generating PCB </span>
                    </div>
                    <div>
                      <v-icon v-if="pcbAutoroute == 0" color="gray"
                        >access_time</v-icon
                      >
                      <v-icon v-else-if="pcbAutoroute == 1" color="gray"
                        >directions_run</v-icon
                      >
                      <v-icon v-else-if="pcbAutoroute == 2" color="green"
                        >check</v-icon
                      >
                      <v-icon v-else color="red">close</v-icon>
                      <span> Autorouting PCB </span>
                    </div>
                    <div>
                      <v-icon v-if="pcbGerberFiles == 0" color="gray"
                        >access_time</v-icon
                      >
                      <v-icon v-else-if="pcbGerberFiles == 1" color="gray"
                        >directions_run</v-icon
                      >
                      <v-icon v-else-if="pcbGerberFiles == 2" color="green"
                        >check</v-icon
                      >
                      <v-icon v-else color="red">close</v-icon>
                      <span> Generating PCB Gerber Files </span>
                    </div>
                  </v-flex>
                </v-layout>
                <br />
              </v-container>
              <v-layout row wrap class="pt-5">
                <div id="generatedPcbTop"></div>
                <div id="generatedPcbBottom"></div>
              </v-layout>
              <v-toolbar dense flat color="#f2f2f2">
                <v-toolbar-title>3- APP DEPLOYMENT</v-toolbar-title>
              </v-toolbar>
              <v-container>
                <h3>
                  3. Download the OS image below and flash it to your raspberry
                  pi SD card. We recomend
                  <a href="https://www.balena.io/etcher/" target="_blank"
                    >Balena Etcher</a
                  >
                  for flashing the OS image.
                </h3>
                <v-btn
                  class="vbtn info"
                  :href="`${serverURL}download/Appliancizer-rpi-image.zip`"
                  >DOWNLOAD OS IMAGE</v-btn
                >
                <br />
                <h3>
                  4. Turn on your raspberry pi with the flashed SD card. A
                  screen like the one shown below should show up.
                </h3>
                <br />
                <v-img
                  :src="require('./assets/_app/HardwareAppBrowser.png')"
                  contain
                  height="250px"
                ></v-img>
                <br />
                <h3>
                  5. Configure the Wifi and enter the generated web link in the
                  hardware app URL text field. Click "Go!" and now your hardware
                  app should be running. To return click or touch the screen 4
                  times.
                </h3>
                <br />
                <div class="text-xs-center">
                  <v-chip color="info" label outline large text-color="black">
                    <pre style="font-size: large;">Generated Web Link:  </pre>
                    <a
                      style="font-size: large;"
                      :href="GeneratedLink"
                      target="_blank"
                    >
                      {{ GeneratedLink }}
                    </a>
                  </v-chip>
                </div>
                <br />
                <br />
                <!-- UNCOMENT THIS IF IMPLEMENTING LOCAL APP -->
                <!-- 
                <h3>
                  2. Deploy you app with hardware integration either online or
                  locally.
                </h3>
                <br />
                <v-layout row wrap>
                  <v-flex xs6>
                    <v-card class="mx-4" color="white" style="height:100%">
                      <v-toolbar dense flat color="#f2f2f2">
                        <v-toolbar-title>DEPLOY APP ONLINE</v-toolbar-title>
                      </v-toolbar>
                      <br />
                      <v-container>
                        <h3>
                          3. Click "Deploy app online" to host your hardware app
                          on the web. A web link will be generated with the
                          address to your hardware app.
                        </h3>
                        <div class="text-xs-center">
                          <v-btn
                            class="vbtn info"
                            @click="BuildScreen_deployOnline()"
                            >DEPLOY APP ONLINE</v-btn
                          >
                          <br />
                          <v-chip
                            class="ma-2"
                            color="rgb(174, 213, 129)"
                            label
                            text-color="white"
                          >
                            <pre>Link:  </pre>
                            <a :href="GeneratedLink" target="_blank">
                              {{ GeneratedLink }}
                            </a>
                          </v-chip>
                        </div>
                        <br />
                        <h3>
                          4. Turn on your raspberry pi with the flashed SD card.
                          Configure the Wifi and enter the generated link in the
                          hardware app URL text field.
                        </h3>
                        <v-img
                          :src="require('./assets/_app/HardwareAppBrowser.png')"
                          contain
                          height="300px"
                        ></v-img>
                        <h3>
                          5. Click "Go!". Great!, now your hardware app should
                          be running. To return click or touch the screen 4
                          times.
                        </h3>
                      </v-container>
                    </v-card>
                  </v-flex>
                  <v-flex xs6>
                    <v-card class="mx-4" color="white" style="height:100%">
                      <v-toolbar dense flat color="#f2f2f2">
                        <v-toolbar-title>DEPLOY APP LOCALLY</v-toolbar-title>
                      </v-toolbar>
                      <br />
                      <v-container>
                        <h3>
                          3. Downlaod and unzip the application file.
                        </h3>
                        <br />
                        <div class="text-xs-center">
                          <v-btn
                            class="vbtn info"
                            @click="BuildScreen_downloadAPP()"
                            >DOWNLOAD APP</v-btn
                          >
                        </div>
                        <br />
                        <h3>
                          4. Either remove the Raspberry Pi SD card and copy the
                          files into <kbd>/home/pi/MyHardwareApp</kbd> or
                          connect the Raspberry pi to your computer using a USB
                          to Ethernet cable and copy the files using the scp
                          command (Image default ip = 10.42.0.100), example:
                        </h3>
                        <kbd style="width:100%">
                          <br />
                          <span> $ cd MyHardwareApp</span>
                          <br /> -->
                <!-- eslint-disable-next-line -->
                          <!-- <span> $ scp -r ./* pi@10.42.0.100:/home/pi/MyHardwareApp</span>
                          <br />
                        </kbd>
                        <br />
                        <h3>
                          4. ssh to your raspberry pi using an USB to Ethernet
                          and run the application using the following commands:
                        </h3>
                        <kbd style="width:100%">
                          <br />
                          <span> $ ssh pi@10.42.0.100</span>
                          <br />
                          <span> // Password: raspberry</span>
                          <br />
                          <span> $ cd MyHardwareApp</span>
                          <br />
                          <span> $ npm install</span>
                          <br />
                          <span> $ startgui </span>
                          <br />
                          <span> $ startapp </span>
                          <br />
                        </kbd>
                      </v-container>
                    </v-card>
                  </v-flex> 
                </v-layout> -->
                <!-- LOCAL AND ONLINE APP FINISH -->
              </v-container>
            </v-card>
          </v-container>
        </v-card>
      </v-dialog>

      <!-- Projects Screen -->
      <v-dialog
        v-model="ProjectsScreen"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
      >
        <v-card id="projectsScreenDialogHeight">
          <v-toolbar dark dense color="grey darken-4">
            <v-toolbar-title>Projects Screen</v-toolbar-title>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-divider class="mx-3" inset vertical></v-divider>
            <v-toolbar-items>
              <v-btn icon dark class="vbtn" @click="ProjectsScreen = false">
                <v-icon>close</v-icon>
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-container fluid> </v-container>
        </v-card>
      </v-dialog>
    </v-app>
  </div>
</template>

<script>
import { Splitpanes, Pane } from "splitpanes";
import "splitpanes/dist/splitpanes.css";
import PcbBoard from "./components/PcbBoard.vue";
import $ from "jquery";
import "jquery-ui/ui/widgets/draggable";
import * as ace from "brace";
import "brace/mode/html";
import "brace/mode/css";
import "brace/mode/javascript";
import "brace/theme/monokai";
import html2canvas from "html2canvas";
import JSZip from "jszip";
import FileSaver from "file-saver";
import axios from "axios";
// import pcbStackup from 'pcb-stackup';
// Demos
import VideoPlayer from "./demos/VideoPlayer";
import SimpleButton from "./demos/SimpleButton";
import SimpleLED from "./demos/SimpleLED";

var SERVER_URL;
if (process.env.NODE_ENV === "production") {
  // Set Production variables
  SERVER_URL = "https://appliancizer.com/api/";
} else {
  // Set Develpmnet variables
  SERVER_URL = "http://localhost:3000/api/";
}

// Server URL
const server = axios.create({
  baseURL: SERVER_URL
});

// App
export default {
  name: "app",
  components: {
    Splitpanes,
    Pane,
    PcbBoard
  },
  data: () => ({
    lwidth: 0,
    height: 0,
    top: 0,
    left: 0,
    panelHeight: 0,
    panelWidth: 0,
    pcbPanelHeight: "100%",
    pcbWidth: 120,
    pcbHeight: 120,
    pcbBrightness: "brightness(1)",
    pcbColor: "rgb(174, 213, 129)",
    webpageContainerPaneSize: 49,
    drawer: false,
    componentSelected: 0,
    componentSlot: "",
    protectorStatus: "block",
    runStopString: "white",
    runStop: false,
    componentListDisplay: "none",
    mouseoverComponent: true,
    componentRemoveDisable: false,
    currentComponentId: "None",
    currentComponentType: "None",
    currentComponentDescription: "None",
    uniqueId: 0,
    eComponentList: null,
    eComponentImages: [],
    eComponentSaved: {} /* Holds list of hardwarized components */,
    eAvailableComponents: [],
    nonAvailableComponents: [],
    snackbar: false,
    snackbarText: "Hi!",
    snackbarColor: "success",
    snackbarTimeout: 6000,
    menu_show: false,
    menu_y: 0,
    menu_x: 0,
    iframeOnScreen: false,
    menu_items: [{ title: "Rotate" }],
    HTMLEditor: false,
    HTMLEditor_clear: false,
    HTMLEditor_projectLoad: false,
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
      { title: "Simple LED", demo: SimpleLED },
      { title: "Simple Button", demo: SimpleButton },
      { title: "Video Player", demo: VideoPlayer }
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
    raspberryNetMap: {},
    FinalPinMap: {
      gpio: [],
      i2c: [],
      spi: [],
      serial: []
    },
    BuildButtonText: "BUILD",
    BuildButtonCount: 0,
    CancelBuildButtonText: "CANCEL",
    CancelBuildButtonCount: 0,
    GeneratedPCBimageTop: "",
    GeneratedPCBimageBottom: "",
    GeneratedLink: "",
    disableButtons: false,
    pcbLoading: false,
    pcbPercentage: 0,
    pcbGenerate: 0, //0: Halt, 1: Begin, 2: Correct, 3: Error
    pcbAutoroute: 0, //0: Halt, 1: Begin, 2: Correct, 3: Error
    pcbGerberFiles: 0, //0: Halt, 1: Begin, 2: Correct, 3: Error
    serverURL: SERVER_URL,

    hdmiScreens: [
      // {
      // key,
      // title,
      // avatar,
      // height,
      // width
      // }
      // populated with hdmiScreens_populate()
    ],
    hdmiScreens_current: "MONITOR",
    hdmiScreens_display: false,
    hdmiScreens_height: "100%",
    hdmiScreens_width: "100%",
    hdmiScreens_button_disabled: false,
    ProjectsScreen: false,
    project_data: {
      EditorHTMLText: "",
      EditorCSSText: "",
      EditorJSText: "",
      eComponentSaved: {},
      eAvailableComponents: [],
      nonAvailableComponents: [],
      webpageContainer: "",
      PCB: ""
    }
  }),
  mounted: function() {
    // TODO add this inside component list
    this.raspberryNetMap = {
      allNets: [
        "4",
        "17",
        "27",
        "22",
        "5",
        "6",
        "13",
        "26",
        "18",
        "23",
        "24",
        "25",
        "12",
        "16",
        "19",
        "20",
        "21",
        "2",
        "3",
        "9",
        "10",
        "11",
        "8",
        "14",
        "15",
        "3.3V",
        "5V"
      ],
      gpio: [
        "4",
        "17",
        "27",
        "22",
        "5",
        "6",
        "13",
        "26",
        "18",
        "23",
        "24",
        "25",
        "12",
        "16",
        "19",
        "20",
        "21"
      ],
      i2c: {
        0: {
          device: "/dev/i2c-1",
          type: "i2c",
          SDA: "2",
          SCL: "3"
        }
      },
      spi: {
        0: {
          device: "/dev/spidev0.0",
          type: "spi",
          MOSI: "10",
          MISO: "9",
          SCLK: "11",
          CE0: "8"
        }
      },
      serial: {
        0: {
          device: "/dev/ttyUSB0",
          type: "serial",
          TXD: "14",
          RXD: "15"
        }
      }
    };

    // Load electrical component List:
    this.eComponentList = {
      submit: {
        0: {
          component: "S1",
          description: "Tactile Push Button smd",
          schematic: "tactile_push_button_smd",
          buyLink:
            "https://www.digikey.com/product-detail/en/c-k/PTS645SL50SMTR92-LFS/CKN9088CT-ND/1146811",
          hardElement: "physical-button",
          hardElementVars: "(gpio:$gpio)",
          partImage: "buttons/smd-button.png",
          image: "buttons/smd-button.svg",
          height: "6mm",
          width: "9.5mm",
          requires: ["resistor_1206_10k"]
        },
        1: {
          component: "S1",
          description: "Tactile Push Button Red",
          schematic: "tactile_push_button_thruhole",
          buyLink:
            "https://www.digikey.com/product-detail/en/sparkfun-electronics/COM-10302/1568-1332-ND/5775291",
          hardElement: "physical-button",
          hardElementVars: "(gpio:$gpio)",
          partImage: "buttons/tactile-button-round-red.jpg",
          image: "buttons/red-round-button.2D.svg",
          height: "10mm",
          width: "15mm",
          requires: ["resistor_1206_10k"]
        },
        2: {
          component: "S1",
          description: "Tactile Push Button Blue",
          schematic: "tactile_push_button_thruhole",
          buyLink:
            "https://www.digikey.com/product-detail/en/sparkfun-electronics/COM-10302/1568-1332-ND/5775291",
          hardElement: "physical-button",
          hardElementVars: "(gpio:$gpio)",
          partImage: "buttons/tactile-button-round-blue.jpg",
          image: "buttons/blue-round-button.2D.svg",
          height: "10mm",
          width: "15mm",
          requires: ["resistor_1206_10k"]
        },
        3: {
          component: "S1",
          description: "Tactile Push Button Green",
          schematic: "tactile_push_button_thruhole",
          buyLink:
            "https://www.digikey.com/product-detail/en/sparkfun-electronics/COM-10302/1568-1332-ND/5775291",
          hardElement: "physical-button",
          hardElementVars: "(gpio:$gpio)",
          partImage: "buttons/tactile-button-round-green.jpg",
          image: "buttons/green-round-button.2D.svg",
          height: "10mm",
          width: "15mm",
          requires: ["resistor_1206_10k"]
        }
      },
      span: {
        0: {
          component: "LED1",
          description: "LED Thruhole 5mm red",
          schematic: "led_thruhole",
          buyLink:
            "https://www.digikey.com/product-detail/en/cree-inc/C503B-RAN-CZ0C0AA1/C503B-RAN-CZ0C0AA1-ND/6561758",
          hardElement: "physical-output",
          hardElementVars: "(gpio:$gpio)",
          partImage: "output/LED-RED.jpg",
          image: "output/red-5mm-LED.2D.svg",
          height: "5mm",
          width: "5mm",
          requires: ["resistor_1206_330ohm"]
        },
        1: {
          component: "LED1",
          description: "LED Thruhole 5mm blue",
          schematic: "led_thruhole",
          buyLink:
            "https://www.digikey.com/product-detail/en/cree-inc/C503B-BCN-CV0Z0461/C503B-BCN-CV0Z0461-ND/1922945",
          hardElement: "physical-output",
          hardElementVars: "(gpio:$gpio)",
          partImage: "output/LED-BLUE.jpg",
          image: "output/blue-5mm-LED.2D.svg",
          height: "5mm",
          width: "5mm",
          requires: ["resistor_1206_330ohm"]
        },
        2: {
          component: "LED1",
          description: "LED Thruhole 5mm green",
          schematic: "led_thruhole",
          buyLink:
            "https://www.digikey.com/product-detail/en/cree-inc/C503B-GAN-CB0F0791/C503B-GAN-CB0F0791-ND/1922938",
          hardElement: "physical-output",
          hardElementVars: "(gpio:$gpio)",
          partImage: "output/LED-GREEN.jpg",
          image: "output/green-5mm-LED.2D.svg",
          height: "5mm",
          width: "5mm",
          requires: ["resistor_1206_330ohm"]
        },
        3: {
          component: "D1",
          description: "LED smd 1206 red",
          schematic: "led_smd",
          buyLink:
            "https://www.digikey.com/product-detail/en/lite-on-inc/LTST-C150CKT/160-1167-1-ND/269239",
          hardElement: "physical-output",
          hardElementVars: "(gpio:$gpio)",
          partImage: "output/LED-1206-RED.png",
          image: "output/red-LED-1206.svg",
          height: "2mm",
          width: "4.5mm",
          requires: ["resistor_1206_330ohm"]
        },
        4: {
          component: "D1",
          description: "LED smd 1206 Blue",
          schematic: "led_smd",
          buyLink:
            "https://www.digikey.com/product-detail/en/lite-on-inc/LTST-C150TBKT/160-1643-1-ND/573584",
          hardElement: "physical-output",
          hardElementVars: "(gpio:$gpio)",
          partImage: "output/LED-1206-BLUE.png",
          image: "output/blue-LED-1206.svg",
          height: "2mm",
          width: "4.5mm",
          requires: ["resistor_1206_330ohm"]
        },
        5: {
          component: "D1",
          description: "LED smd 1206 Green",
          schematic: "led_smd",
          buyLink:
            "https://www.digikey.com/product-detail/en/lite-on-inc/LTST-C150GKT/160-1169-1-ND/269241",
          hardElement: "physical-output",
          hardElementVars: "(gpio:$gpio)",
          partImage: "output/LED-1206-GREEN.png",
          image: "output/green-LED-1206.svg",
          height: "2mm",
          width: "4.5mm",
          requires: ["resistor_1206_330ohm"]
        }
      },
      range: {
        0: {
          component: "U1",
          description: "Motorized Potentiometer 10K",
          schematic: "motorized_potentiometer",
          buyLink:
            "https://www.digikey.com/product-detail/en/bourns-inc/PSM60-082A-103B2/PSM60-082A-103B2-ND/5825442",
          hardElement: "physical-motorized-pot",
          hardElementVars:
            "(motora:$gpio, motorb:$gpio, \
                touch:$gpio, i2c-addr:0x48, i2c-port:url($i2c))",
          partImage: "range/motorized-potentiometer.png",
          image: "range/motorized-pot.svg",
          height: "36mm",
          width: "152mm",
          requires: ["ads1015", "at42qt1010", "tb6612fng"]
        },
        1: {
          component: "U1",
          description: "Temperature Sensor MCP9808",
          schematic: "temperature_sensor",
          buyLink:
            "https://www.digikey.com/product-detail/en/adafruit-industries-llc/1782/1528-1032-ND/4990781",
          hardElement: "physical-motorized-pot",
          hardElementVars: "(i2c-addr:0x18, i2c-port:url($i2c))",
          partImage: "range/mcp9808.png",
          image: "range/mcp9808.svg",
          height: "36mm",
          width: "36mm",
          requires: []
        },
        2: {
          component: "POTTODO", // TODO add device and schematic
          description: "Potentiometer 100K",
          schematic: "",
          buyLink:
            "https://www.digikey.com/product-detail/en/bourns-inc/PDB181-E420K-104B/PDB181-E420K-104B-ND/3780677",
          hardElement: "physical-pot",
          hardElementVars: "(i2c-port:url($i2c), i2c-addr:0x40)",
          partImage: "range/pot.png",
          image: "range/potentiometer.png",
          height: "20mm",
          width: "17mm",
          requires: ["ads1015"]
        }
      },
      screens: {
        0: {
          component: "GeekPi 5-inch",
          description: "5-inch touch screen",
          buyLink:
            "https://www.amazon.com/GeeekPi-Capacitive-800x480-Raspberry-BeagleBone/dp/B0749D617J",
          partImage: "screens/geeekpi_5inch.png",
          image: "",
          height: "100mm",
          width: "160mm"
        }
      },
      connector: {
        0: {
          component: "J1",
          description: "Raspberry Pi Connector",
          schematic: "connector_raspberrypi",
          connectorNetMap: this.raspberryNetMap,
          buyLink:
            "https://www.digikey.com/product-detail/en/PRT-14017/1568-1462-ND/6569366",
          partImage: "connectors/rpi_connector_partimage.jpg",
          image: "connectors/rpi_connector.png",
          height: "7mm",
          width: "51mm"
        }
      },
      misc: {
        // Required Components
        resistor_1206_10k: {
          component: "R1",
          description: "10k resistor smd 1206",
          buyLink:
            "https://www.digikey.com/product-detail/en/yageo/RC1206JR-0710KL/311-10KERCT-ND/732156",
          partImage: "misc/0603-RES.jpg",
          image: "misc/0603-RES.svg",
          height: "2mm",
          width: "4.5mm"
        },
        resistor_1206_330ohm: {
          component: "R1",
          description: "330 Ohm resistor smd 1206",
          buyLink:
            "https://www.digikey.com/product-detail/en/yageo/RC1206JR-07330RL/311-330ERCT-ND/732226",
          partImage: "misc/0603-RES.jpg",
          image: "misc/0603-RES.svg",
          height: "2mm",
          width: "4.5mm"
        },
        ads1015: {
          component: "U2",
          description: "ads1015 12-bit Channel ADC",
          buyLink: "https://www.digikey.com/products/en?mpart=1083&v=1528",
          partImage: "misc/ads1X15.png",
          image: "misc/ads1X15.svg",
          height: "18mm",
          width: "29mm"
        },
        at42qt1010: {
          component: "U3",
          description: "at42qt1010 Capacitive Touch Sensor",
          buyLink:
            "https://www.digikey.com/product-detail/en/adafruit-industries-llc/1374/1528-1782-ND/6238002",
          partImage: "misc/at42qt1010.png",
          image: "misc/at42qt1010.svg",
          height: "29mm",
          width: "20mm"
        },
        tb6612fng: {
          component: "U4",
          description: "TB6612FNG Motor Dirver",
          buyLink:
            "https://www.digikey.com/product-detail/en/sparkfun-electronics/ROB-14450/1568-1755-ND/7915576",
          partImage: "misc/TB6612FNG.png",
          image: "misc/TB6612FNG.svg",
          height: "21mm",
          width: "21mm"
        }
      }
    };

    document.addEventListener(
      "dragstart",
      function(event) {
        console.log("DRAGSTART", event.target);
        // if it's a frame send only the children content data

        if ($(event.target).hasClass("draggable_element")) {
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

          console.log("startID:" + e_id);
          console.log("startOuterHTML:", e_outerHTML);
          console.log("startInnerHTML:", e_innerHTML);
          console.log("startTYPE:" + e_type);
        } else {
          console.warn("WARNING, THIS ELEMENT CAN NOT BE A COMPONENT");
        }
      },
      false
    );

    document.addEventListener(
      "dragenter",
      event => {
        console.log("DRAGENTER:" + event.target.id);
        if (event.target.id == "PCB") {
          this.pcbBrightness = "brightness(0.8)";
        }
      },
      false
    );

    document.addEventListener(
      "dragleave",
      event => {
        console.log("DRAGLEAVE" + event.target.id);
        if (event.target.id == "PCB") {
          this.pcbBrightness = "brightness(1)";
        }
      },
      false
    );

    document.addEventListener(
      "drop",
      event => {
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
          this.pcbBrightness = "brightness(1)";

          console.log("dataID:" + dataID);
          console.log("dataOuterHTML:" + dataOuterHTML);
          console.log("dataInnerHTML:" + dataInnerHTML);
          console.log("dataTYPE:" + dataType);
          console.log("Coordinates Mouse:", event.pageX, event.pageY);
          console.log(
            "Coordinates Rect:",
            $(event.target).offset().left,
            $(event.target).offset().top
          );
          console.log("Coordinates Droped:", dataLeft, dataTop);
          this.addNewHTMLComponent(
            dataID,
            dataType,
            dataInnerHTML,
            dataOuterHTML,
            dataLeft,
            dataTop
          );
        }
      },
      false
    );

    // Enable right click Menu
    document.showContextMenu = e => {
      e.preventDefault();
      console.log("hello world" + e);
      this.menu_show = false;
      this.menu_x = e.clientX;
      this.menu_y = e.clientY;
      this.$nextTick(() => {
        this.menu_show = true;
      });
    };

    // Add global click
    this.$el.addEventListener("click", this.onGlobalClick);

    // Populate HDMI screens
    this.hdmiScreens_pupulate();

    // #### HTML Editor inits
    // Prepare Main CSS and JS Tags
    this.EditorMAIN_cssTag = $("<style></style>").appendTo($("head"));
    this.EditorMAIN_jsTag = $("<script/>").appendTo($("body"));
    // Prepare IFRAME head and body Tags
    this.EditorIFRAME_head = $("#HTMLEditor_iframe")
      .contents()
      .find("head");
    this.EditorIFRAME_body = $("#HTMLEditor_iframe")
      .contents()
      .find("body");
    // Constumize Editors themes
    this.EditorHTML = ace.edit("htmlEditor");
    this.EditorHTML.getSession().setMode("ace/mode/html");
    this.EditorHTML.setTheme("ace/theme/monokai");
    this.EditorCSS = ace.edit("cssEditor");
    this.EditorCSS.getSession().setMode("ace/mode/css");
    this.EditorCSS.setTheme("ace/theme/monokai");
    this.EditorJS = ace.edit("jsEditor");
    this.EditorJS.getSession().setMode("ace/mode/javascript");
    this.EditorJS.setTheme("ace/theme/monokai");

    // #### Build PCB
    // Init final pcb hieght and width
    this.FinalPCB.height = this.pcbWidth;
    this.FinalPCB.width = this.pcbHeight;
  },
  methods: {
    //##########
    //########## PROJECT SAVE/LOAD (TODO add hdmiScreens_button_disabled)
    //##########
    project_save() {
      // Clone PCB and remove inner childs that are not elements
      let pcbClone = document.querySelector("#PCB").cloneNode(true);
      pcbClone.removeChild(pcbClone.querySelector("#mm_rule"));
      pcbClone.removeChild(pcbClone.querySelector("#pcb-resizable-corners"));

      // Make a deep copy of object using JSON stringify
      this.project_data = JSON.stringify(
        {
          FinalPCB_height: this.FinalPCB.height,
          FinalPCB_width: this.FinalPCB.width,
          EditorHTMLText: this.EditorHTMLText,
          EditorCSSText: this.EditorCSSText,
          EditorJSText: this.EditorJSText,
          eComponentSaved: this.eComponentSaved,
          eAvailableComponents: this.eAvailableComponents,
          nonAvailableComponents: this.nonAvailableComponents,
          webpageContainer: document.querySelector("#webpageContainer")
            .innerHTML,
          PCB: pcbClone.innerHTML
        },
        null,
        2
      );
      console.log(this.project_data);
      // console.log(this.EditorHTMLText);
      // console.log(this.EditorCSSText);
      // console.log(this.EditorJSText);
      // console.log(this.eComponentSaved);
      // console.log(this.eAvailableComponents);
      // console.log(this.nonAvailableComponents);
      // console.log(document.querySelector("#webpageContainer").innerHTML);
      // console.log(document.querySelector("#PCB").innerHTML);
    },
    project_clear() {
      // Clear all content
      this.$refs.PcbBoard.setpcbsize(this.pcbHeight, this.pcbWidth);
      this.HTMLEditor_clear = true; // Clear will be executed when Editor opens.
      this.eComponentSaved = {};
      this.eAvailableComponents = [];
      this.nonAvailableComponents = [];
      $("#webpageContainer").empty();
      $("#PCB")
        .find("*")
        .not("#mm_rule")
        .not("#pcb-resizable-corners")
        .remove();
    },
    project_load() {
      let project = JSON.parse(this.project_data);

      // Clear current project
      this.project_clear();

      // Load project form database

      // Set project
      this.$refs.PcbBoard.setpcbsize(
        project.FinalPCB_height,
        project.FinalPCB_width
      );
      this.HTMLEditor_projectLoad = true;
      this.eComponentSaved = project.eComponentSaved;
      this.eAvailableComponents = project.eAvailableComponents;
      this.nonAvailableComponents = project.nonAvailableComponents;
      $("#webpageContainer").append(project.webpageContainer);
      this.EditorMAIN_cssTag.remove(); // Inject CSS to whole document
      this.EditorMAIN_cssTag = $("<style></style>").appendTo($("head"));
      this.EditorMAIN_cssTag.text(project.EditorCSSText);
      this.EditorMAIN_jsTag.remove(); // Inject JS to whole document
      this.EditorMAIN_jsTag = $("<script/>").appendTo($("body"));
      this.EditorMAIN_jsTag.text(project.EditorJSText);
      $("#PCB").append(project.PCB);
      for (let key in this.eComponentSaved) {
        // Add clickable functions to components after PCB html ready!
        if (this.eComponentSaved[key].html != "") {
          let elementId = this.eComponentSaved[key].elementId;
          this.addComponentClickFunctions(elementId);
        }
      }
      if (this.eComponentSaved["TouchScreen"]) {
        // Set HDMI screen
        let index = this.eComponentSaved["TouchScreen"].componentSelected;
        this.hdmiScreens_setScreen(index);
      }
    },
    //##########
    //########## PROJECTS SCREEN
    //##########
    ProjectsScreen_open() {
      this.ProjectsScreen = true;
    },
    //##########
    //########## MAIN SCREEN
    //##########
    hdmiScreens_pupulate() {
      // Populate default screen (Monitor)
      this.hdmiScreens.push({
        key: "monitor",
        title: "MONITOR",
        avatar: "screens/monitor.png",
        height: "100%",
        width: "100%"
      });

      // Populate screens in JSON file
      for (let key in this.eComponentList.screens) {
        this.hdmiScreens.push({
          key: key,
          title: this.eComponentList.screens[key].component,
          avatar: this.eComponentList.screens[key].partImage,
          height: this.eComponentList.screens[key].height,
          width: this.eComponentList.screens[key].width
        });
      }
    },
    hdmiScreens_setScreen(index) {
      // Set new screen
      this.hdmiScreens_current = this.hdmiScreens[index].title;
      this.hdmiScreens_height = this.hdmiScreens[index].height;
      this.hdmiScreens_width = this.hdmiScreens[index].width;

      if (this.hdmiScreens_current == "MONITOR") {
        // If MONITOR, set screen to max
        this.hdmiScreens_display = false;
        // Delete any touch screen from component dictionar
        delete this.eComponentSaved["TouchScreen"];
      } else {
        // Touch screen, resize screen to touch screen size
        this.hdmiScreens_display = true;
      }
    },
    hdmiScreens_newScreenClick(index) {
      // Save or delete new screen
      this.hdmiScreens_setScreen(index);
      if (this.hdmiScreens_current == "MONITOR") {
        // Delete any touch screen from component dictionary
        delete this.eComponentSaved["TouchScreen"];
      } else {
        // Add Touch screen to component dictionary
        this.hdmiScreens_saveMonitorScreenComponent(
          "TouchScreen",
          index,
          this.hdmiScreens[index].key
        );
      }
    },
    hdmiScreens_saveMonitorScreenComponent(monitorScreenId, index, key) {
      this.eComponentSaved[monitorScreenId] = {
        elementId: null,
        type: "screen",
        // Physical component values
        componentSelected: index,
        componentName: this.eComponentList.screens[key].component, // Set in the next function
        componentDescription: this.eComponentList.screens[key].description, // Set in the next function
        componentSchematic: null, // Set in the next function
        componentConnectorNetMap: null, // Set in next function (connector only)
        componentBuyLink: this.eComponentList.screens[key].buyLink, // Set in the next function
        componentHardElement: null, // Set in the next function
        componentHardElementVars: null, // Set in the next function
        componentPartImage: this.eComponentList.screens[key].partImage, // Set in the next function
        componentImage: null, // Set in the next function
        componentWidth: this.eComponentList.screens[key].width, // Set in the next function
        componentHeight: this.eComponentList.screens[key].height, // Set in the next function
        componentRequires: null, // Set in the next function
        componentChildIDs: [], // Set at the end
        componentIfaces: {},
        componentLeft: null, // Set in get position
        componentTop: null, // Set in get position
        componentCenterLeft: null, // Set in get position
        componentCenterTop: null, // Set in get position
        // Original html tag values
        html: "",
        width: "",
        height: "",
        innerHTML: ""
      };
    },
    searchSoftElements() {
      // Zero any previeous arrays
      this.eComponentSaved = {};
      this.eAvailableComponents = [];
      this.nonAvailableComponents = [];

      // Empty PCB board of any component except useful divs
      $("#PCB")
        .find("*")
        .not("#mm_rule")
        .not("#pcb-resizable-corners")
        .remove();

      // Make webpageContainer invisible
      $("#webpageContainer").css("visibility", "hidden");

      // Start progress bar
      $("#webpageContainerProgressbar").css("display", "block");

      var uniqueId = 0;
      let hardenNumber = 0;

      // Add Green Wrap to Buttons and Sliders if found, Red IF not
      for (var element of $("#webpageContainer").find("*")) {
        var e_width = $(element).outerWidth() + 6;
        var e_height = $(element).outerHeight() + 6;

        // If element has no children and has an id
        if ($(element).children().length == 0) {
          // Skip specific elements
          if (element.tagName == "BR") {
            continue;
          }

          // If element is of type iframe, button or range then..
          if (
            element.tagName == "BUTTON" ||
            element.type == "range" ||
            (element.tagName == "SPAN" && $(element).attr("id"))
          ) {
            // Green box size (added +1 to prevent overflow of text)
            $(element).wrap(
              `<div id="${element.id}_drag" class="draggable_element" 
                draggable="true" style="width:${e_width +
                  1}px;height:${e_height + 1}px;display:inline-block;">
                </div>`
            );

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
              uniqueId++;
            } else {
              elementID = element.id;
            }

            $(element).wrap(
              `<div id="${elementID}_nondrag" class="none_draggable_element" 
                style="width:${e_width}px;height:${e_height}px;display:inline-block;">
                </div>`
            );

            // Add list of non available components (in red)
            this.nonAvailableComponents.push(elementID);
          }
        } else {
          console.log("WARNING: OTHER ELEMENTS NOT AVAILABLE: " + element);
        }
      }

      // SPECIAL CASE FOR THE STUPID VIDEO PLAYER IFRAME
      // Execute funtion after 4 seconds to find iframe change.
      setTimeout(() => {
        for (var element of $("#webpageContainer").find("*")) {
          // If element has no children and has an id

          if ($(element).attr("id")) {
            // If element is of type iframe, button or range then..
            if (element.tagName == "IFRAME") {
              var e_width = $(element).outerWidth() + 6;
              var e_height = $(element).outerHeight() + 6;

              var iframeWrapID = element.id + "_nondrag";

              // Change warped element to draggable
              $("#" + iframeWrapID).removeClass("none_draggable_element");
              $("#" + iframeWrapID).addClass("draggable_element");
              $("#" + iframeWrapID).attr("draggable", "true");
              $("#" + iframeWrapID).css("width", e_width);
              $("#" + iframeWrapID).css("height", e_height);

              //Change id to drag
              $("#" + iframeWrapID).attr("id", element.id + "_drag");

              // Move it to eAvailableComponent
              this.nonAvailableComponents = this.nonAvailableComponents.filter(
                item => item != element.id
              );
              console.log("NON AVAL:" + this.nonAvailableComponents);
              this.eAvailableComponents.push(element.id);
              console.log("AVAL:" + this.eAvailableComponents);

              // Increase elements that can be harden
              hardenNumber++;
            }
          }
        }

        // Hide progress bar
        $("#webpageContainerProgressbar").css("display", "none");

        // Make webpageContainer visible
        $("#webpageContainer").css("visibility", "visible");

        // Make webpageContainer a little to the right to make all contents visible
        this.webpageContainerPaneSize = 50;

        // Show snackbar
        if (hardenNumber == 0) {
          this.launchSnackbar(
            "Sorry, no elements found that can be harden",
            "error",
            10000
          );
        } else if (hardenNumber == 1) {
          this.launchSnackbar(
            `Great! You can harden ${hardenNumber} element`,
            "success",
            6000
          );
        } else {
          this.launchSnackbar(
            `Great! You can harden ${hardenNumber} elements`,
            "success",
            6000
          );
        }
      }, 3000);

      // Add connector to the PCB Screen
      this.addNewHTMLComponent(
        "connector", // thisId
        "connector", // thisType
        "", // thisInnerHtml
        '<div id="connector"></div>', // thisHtml
        5, // thisLeft
        10 // thisTop
      );
    },
    launchSnackbar(text, color, timeout) {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbarTimeout = timeout;
      this.snackbar = true;
    },
    getComponentsImg(item) {
      return require("./assets/" + item);
    },
    // Sets app to RUN Mode
    setRunMode() {
      console.log("### ON Running MODE");

      // If already in run mode return
      if (this.runStop == true) return;

      // Running mode
      this.runStop = true;
      this.runStopString = "EDIT";

      // Remove protector from elements in PCB
      $(".protector").css("display", "none");

      // Set iframe events to all
      $("iframe").css("pointer-events", "all");

      // For all available comopnents, remove their draggable class
      console.log("Elements IDs that can be harden:");
      for (let ele of this.eAvailableComponents) {
        $("#" + ele + "_drag").removeClass("draggable_element");
        $("#" + ele + "_drag").attr("draggable", "false");
        // If element is on PCB remove it from the screen
        let isOnPCB = false;
        if (ele in this.eComponentSaved) {
          isOnPCB = true;
          // Display none
          $("#" + ele + "_drag").css("display", "none");
          // Add any innerHTML if component is span
          if (this.eComponentSaved[ele].type == "span") {
            $("#" + ele).append(this.eComponentSaved[ele].innerHTML);
          }
        }
        console.log("id: " + ele + " | OnSceen: " + isOnPCB);
      }

      // For all non available comopnents, remove their class
      console.log("Elements IDs that can not be harden:");
      for (let ele of this.nonAvailableComponents) {
        console.log("id: " + ele);
        $("#" + ele + "_nondrag").removeClass("none_draggable_element");
      }

      // Disable Add and Build Buttons (had to do it manually since split bug)
      $("#buttonAdd").addClass("v-btn--disabled");
      $("#buttonBuild").addClass("v-btn--disabled");
    },
    // Sets app to EDIT Mode
    setEditMode() {
      console.log("### ON Edit MODE");

      // If already in edit mode return
      if (this.runStop == false) return;

      // Edit mode
      this.runStop = false;
      this.runStopString = "RUN";

      // Add protector from elements in PCB
      $(".protector").css("display", "block");

      // Set iframe events to none
      $("iframe").css("pointer-events", "all");

      // For all available comopnents, add their draggable class
      console.log("Elements IDs that can be harden:");
      for (let ele of this.eAvailableComponents) {
        $("#" + ele + "_drag").addClass("draggable_element");
        $("#" + ele + "_drag").attr("draggable", "true");
        // If element is on PCB remove add it to the the screen
        let isOnPCB = false;
        if (ele in this.eComponentSaved) {
          isOnPCB = true;
          // Restore display settings
          $("#" + ele + "_drag").css("display", "inline-block");
          // Remove any innerHTML of element (e.g, Text) if span
          if (this.eComponentSaved[ele].type == "span") {
            $("#" + ele).empty();
          }
        }
        console.log("id: " + ele + " | OnSceen: " + isOnPCB);
      }

      // For all non available comopnents, add their class
      console.log("Elements IDs that can not be harden:");
      for (let ele of this.nonAvailableComponents) {
        console.log("id: " + ele);
        $("#" + ele + "_nondrag").addClass("none_draggable_element");
      }

      // Disable Add and Build Buttons (had to do it manually since split bug)
      $("#buttonAdd").removeClass("v-btn--disabled");
      $("#buttonBuild").removeClass("v-btn--disabled");
    },
    //##########
    //########## HTML COMPONENT MANAGMENT
    //##########
    testClick() {
      // TEST RANGE
      this.addNewHTMLComponent(
        "progressBar", // thisId
        "test_range", // thisType
        "", // thisInnerHtml
        '<input type="range" min="0" max="28" step="1" value="0" id="progressBar">', // thisHtml
        10, // thisLeft
        10 // thisTop
      );

      // // // TEST ADDING A BUTTON
      // this.addNewHTMLComponent(
      //   "playPause", // thisId
      //   "test_submit", // thisType
      //   "", // thisInnerHtml
      //   '<button onclick="playPause()" id="playPause"></button>', // thisHtml
      //   5, // thisLeft
      //   5 // thisTop
      // );

      // // // TEST ADDING AN LED
      // this.addNewHTMLComponent(
      //   "myLED", // thisId
      //   "test_span", // thisType
      //   "", // thisInnerHtml
      //   '<span id="myLED"></span>', // thisHtml
      //   5, // thisLeft
      //   5 // thisTop
      // );

      // // TEST CONNECTOR
      this.addNewHTMLComponent(
        "connector", // thisId
        "connector", // thisType
        "", // thisInnerHtml
        '<div id="connector"></div>', // thisHtml
        5, // thisLeft
        5 // thisTop
      );

      // // TEST MISC
      // this.addNewHTMLComponent(
      //   "resistor_1206_10k", // thisId
      //   "misc", // thisType
      //   "",          // thisInnerHtml
      //   '<div id="'+"resistor_1206_10k"+'" class="misc"></div>', // thisHtml
      //   5, // thisLeft
      //   5 // thisTop
      // );

      // // TEST SCREEN
      // this.addNewHTMLComponent("video-placeholder", "screens",
      //       '<iframe id="video-placeholder" frameborder="0" allowfullscreen="1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" title="YouTube video player" src="https://www.youtube.com/embed/DCLrDnZO_0E?rel=0&amp;color=white&amp;playlist=dQiNVk_u0po%2C%20IvUU8joBb1Q%2CS-m-CHigCY4%2CHpaHvUOk3F0&amp;enablejsapi=1&amp;origin=http%3A%2F%2Flocalhost%3A8080&amp;widgetid=1" draggable="true"></iframe>');
      //var iframeBody = document.getElementById('video-placeholder').contentWindow.document.body.innerHTML; //$('#video-placeholder').contents();
      //console.log(iframeBody);
    },
    // Adds a new HTML component to the PCB
    addNewHTMLComponent(
      thisId,
      thisType,
      thisInnerHtml,
      thisHtml,
      thisLeft,
      thisTop
    ) {
      //console.log(`### ADDING COMPONENT [${thisType}]`);

      // Init variables
      var thisWidth = 0;
      var thisHeight = 0;

      // Generate unique id:
      var elementId = "element_" + this.uniqueId;
      this.uniqueId++;

      // Create element container
      $("<div/>", {
        id: elementId,
        class: "noGlobalTrigger",
        style:
          "position:absolute;display:inline-block;border-radius:5px;border:3px solid transparent;"
      }).appendTo("#PCB");
      // Create protector
      $("#" + elementId).append(
        '<div class="protector" oncontextmenu="showContextMenu(event)" style="display: block"></div>'
      );

      // Create component in the PCB area
      if (thisType == "connector") {
        // Is a connector
        $("#" + elementId).append(thisHtml);
      } else if (thisType == "misc") {
        // Is a misc component part of a web element
        $("#" + elementId).append(thisHtml);
      } else if (thisType.includes("test_")) {
        // Test web elements that can be harden
        thisType = thisType.split("_")[1];

        // Append component html
        $("#" + elementId).append(thisHtml);

        // Add component element style class
        if (thisType == "submit") {
          $("#" + thisId).addClass("submit-physical-button");
        } else if (thisType == "span") {
          $("#" + thisId).addClass("submit-physical-button");
        } else if (thisType == "range") {
          $("#" + thisId).addClass("range-physical-slider");
        } else if (thisType == "screens") {
          $("#" + thisId).addClass("physical-screen");
          // Disable HDMI Screens button
          this.hdmiScreens_button_disabled = true;
        } else {
          console.error("FATAL ERROR: Unknown element type");
          return;
        }
      } else {
        // Is a web element that can be harden

        // Get element data to save later:
        thisWidth = $("#" + thisId).outerWidth();
        thisHeight = $("#" + thisId).outerHeight();

        // Detach component and add it to the PCB
        $("#" + thisId)
          .detach()
          .appendTo("#" + elementId);
        // Add component element style class
        if (thisType == "submit") {
          $("#" + thisId).addClass("submit-physical-button");
        } else if (thisType == "span") {
          $("#" + thisId).addClass("submit-physical-button");
        } else if (thisType == "range") {
          $("#" + thisId).addClass("range-physical-slider");
        } else if (thisType == "screens") {
          $("#" + thisId).addClass("physical-screen");
          // Disable HDMI Screens button
          this.hdmiScreens_button_disabled = true;
        } else {
          console.error("FATAL ERROR: Unknown element type");
          return;
        }

        // Remove any innerHTML
        $("#" + thisId).empty();
      }

      // Add Interactive functions when the component is clicked.
      this.addComponentClickFunctions(elementId);

      // Save new component
      var selectedNumber = 0; // First element by default
      this.eComponentSaved[thisId] = {
        elementId: elementId,
        type: thisType,
        // Physical component values
        componentSelected: selectedNumber,
        componentName: null, // Set in the next function
        componentDescription: null, // Set in the next function
        componentSchematic: null, // Set in the next function
        componentConnectorNetMap: null, // Set in next function (connector only)
        componentBuyLink: null, // Set in the next function
        componentHardElement: null, // Set in the next function
        componentHardElementVars: null, // Set in the next function
        componentPartImage: null, // Set in the next function
        componentImage: null, // Set in the next function
        componentWidth: null, // Set in the next function
        componentHeight: null, // Set in the next function
        componentRequires: null, // Set in the next function
        componentChildIDs: [], // Set at the end
        componentIfaces: {},
        componentLeft: null, // Set in get position
        componentTop: null, // Set in get position
        componentCenterLeft: null, // Set in get position
        componentCenterTop: null, // Set in get position
        // Original html tag values
        html: thisHtml,
        width: thisWidth,
        height: thisHeight,
        innerHTML: thisInnerHtml
      };

      // Apply style settings for new component (TODO: get Id and type)
      this.setNewComponentSelection(thisId, thisType, selectedNumber);

      // Move element to left, top coordinates
      this.moveComponentToPosition(thisId, thisLeft, thisTop);

      console.log(`### ADDING COMPONENT [${thisType}] END`);
    },
    addComponentClickFunctions(elementId) {
      // Make it draggable
      $("#" + elementId).draggable({
        containment: "#PCB",
        scroll: false,
        stop: () => {
          // Save new component position
          for (var key in this.eComponentSaved) {
            if (this.eComponentSaved[key].elementId == elementId) {
              this.saveComponentPosition(key);
            }
          }
        }
      });

      // When the component in the PCB is clicked do:
      $("#" + elementId).mousedown(element => {
        if (this.runStop == false) {
          // Get element clicked
          var ele = $(element.target).next()[0];
          if (ele == undefined) return;
          if (ele.id.includes("element_")) return;

          console.log("### CLICK ON COMPONENT");
          // Get current ID
          this.currentComponentId = ele.id;
          // Get current Type
          if (this.currentComponentId == "connector") {
            this.currentComponentType = "connector";
            this.componentRemoveDisable = true;
          } else if (ele.classList.contains("misc")) {
            this.currentComponentType = "misc";
            this.componentRemoveDisable = true;
          } else if (ele.type == undefined && ele.tagName != "SPAN") {
            // If type is not detected then is a screen
            this.currentComponentType = "screens";
            this.componentRemoveDisable = false;
          } else {
            if (ele.tagName == "SPAN") this.currentComponentType = "span";
            else this.currentComponentType = ele.type;
            this.componentRemoveDisable = false;
          }

          // Get current component Part Number
          this.currentComponentDescription = this.eComponentSaved[
            this.currentComponentId
          ].componentDescription;

          console.log("elementClicked:", ele);
          console.log("currentComponentID:" + this.currentComponentId);
          console.log("currentComponentType:" + this.currentComponentType);
          console.log(
            "currentComponentDescription:" + this.currentComponentDescription
          );
          console.log(
            "IsComponentRemoveDisabled:" + this.componentRemoveDisable
          );

          // Pupulate Component List Images
          this.eComponentImages = []; // Clear list
          var type = this.eComponentSaved[this.currentComponentId].type; // Get component type
          if (type == "misc") {
            // Just populate the misc image part
            var compId = this.currentComponentId;
            var part = compId.substr(0, compId.lastIndexOf("_"));
            console.log(
              "partImage:",
              this.eComponentList["misc"][part].partImage
            );
            this.eComponentImages.push(
              this.eComponentList["misc"][part].partImage
            );
          } else {
            // Populate all available web elements for that type
            // (button, range, span, screen, connector)
            var elements = this.eComponentList[type]; // Get all components of the selected type
            for (var i in elements) {
              console.log("partImage:", elements[i].partImage);
              this.eComponentImages.push(elements[i].partImage);
            }
          }

          // Update component selected for this element
          var selectedNumber = this.eComponentSaved[this.currentComponentId]
            .componentSelected; // Get component selected
          this.componentSelected = selectedNumber;

          // Add this element border and unselect others
          for (var key in this.eComponentSaved) {
            if (key == this.currentComponentId) {
              // Add selection border
              $("#" + this.eComponentSaved[key].elementId).css(
                "border",
                "3px solid rgba(50, 50, 50, 0.2)"
              );
            } else {
              // Remove selection border
              $("#" + this.eComponentSaved[key].elementId).css(
                "border",
                "3px solid transparent"
              );
            }
          }

          // Show Component Selection List
          this.componentListDisplay = "";
          this.pcbPanelHeight = "74%";

          console.log("### END");
        }
      });
    },
    addChildComponents(parentId, childComponentsList) {
      // Reset child components List
      this.eComponentSaved[parentId].componentChildIDs = [];

      // Add childs
      for (var i in childComponentsList) {
        // Set misc comopnent ID (e.g, 0603-RES_1)
        var miscId = childComponentsList[i] + "_" + this.uniqueId;

        // Save child generated IDs
        this.eComponentSaved[parentId].componentChildIDs.push(miscId);

        // Add extra required misc components:
        this.addNewHTMLComponent(
          miscId, // thisId
          "misc", // thisType
          "", // thisInnerHtml
          '<div id="' + miscId + '" class="misc"></div>', // thisHtml
          5, // thisLeft
          5 // thisTop
        );
      }
    },
    moveComponentToPosition(compId, left, top) {
      // Get element Id
      var elementId = this.eComponentSaved[compId].elementId;

      // Get element width and height for centering it;
      var eleId_center_x = $("#" + elementId).outerWidth() / 2;
      var eleId_center_y = $("#" + elementId).outerHeight() / 2;
      var mouse_center_x = left - eleId_center_x;
      var mouse_center_y = top - eleId_center_y;

      // Move element to its dropped coordinated
      $("#" + elementId).css(
        "left",
        mouse_center_x > 0 ? mouse_center_x : left + "px"
      );
      $("#" + elementId).css(
        "top",
        mouse_center_y > 0 ? mouse_center_y : top + "px"
      );

      // Save component position
      this.saveComponentPosition(compId);

      console.log(
        `<${compId}> LEFT: ` + this.eComponentSaved[compId].componentCenterLeft
      );
      console.log(
        `<${compId}> TOP: ` + this.eComponentSaved[compId].componentCenterTop
      );
    },
    saveComponentPosition(thisId) {
      // Get component data
      var elementId = this.eComponentSaved[thisId].elementId;
      var componentWidth = parseFloat(
        this.eComponentSaved[thisId].componentWidth
      );
      var componentHeight = parseFloat(
        this.eComponentSaved[thisId].componentHeight
      );

      // Get top and left in mm
      var leftpx = parseFloat($("#" + elementId).css("left"));
      var toppx = parseFloat($("#" + elementId).css("top"));
      var ruler = $("#mm_rule").height();
      var leftmm = Math.floor(leftpx / (ruler / 100));
      var topmm = Math.floor(toppx / (ruler / 100));

      // Set comopnent Top and left in mm
      this.eComponentSaved[thisId].componentLeft = leftmm;
      this.eComponentSaved[thisId].componentTop = topmm;

      // Set component center left and top in mm
      var centerLeft = leftmm + componentWidth / 2;
      var centerTop = topmm + componentHeight / 2;
      this.eComponentSaved[thisId].componentCenterLeft = centerLeft;
      this.eComponentSaved[thisId].componentCenterTop = centerTop;
    },
    // When a component is clicked from the list.
    componentClick(selectedNumber) {
      console.log("### ITEM CLICK");
      if (
        this.currentComponentId != "None" ||
        this.currentComponentType != "None"
      ) {
        this.componentSelected = parseInt(selectedNumber);
        // this.$refs.component[itemNum].$el.style.border = "1px solid red";
        console.log("currentComonentId:" + this.currentComponentId);
        console.log("currentComponentType:" + this.currentComponentType);

        if (this.currentComponentType == "misc") {
          // If misc, nothing to do, no need to change device
          console.log("Nothing to do");
          console.log("### ITEM CLICK END");
          return;
        }

        // Drop new parent componentinto the PCB
        this.setNewComponentSelection(
          this.currentComponentId,
          this.currentComponentType,
          selectedNumber
        );

        // Reset parent position
        this.moveComponentToPosition(this.currentComponentId, 5, 5);
      } else {
        console.log("Component not selected");
      }
      console.log("### ITEM CLICK END");
    },
    // Changes the comopnent in the PCB and in the directory.
    setNewComponentSelection(compId, compType, newNumber) {
      // Select between a component list or just one misc component
      var selectedNumber = null;
      if (compType == "misc") {
        // Is just one child component (e.g., resisotor_0630_1)
        selectedNumber = compId.substr(0, compId.lastIndexOf("_"));
        console.log(`### ADDING CHILD COMPONENT [${compType}]`);
      } else {
        // Its a parent component
        selectedNumber = newNumber;
        console.log(`### ADDING PARENT COMPONENT [${compType}]`);

        // Set new current component part number name
        this.currentComponentDescription = this.eComponentList[compType][
          selectedNumber
        ].description;
      }
      console.log("selectedNumber:", selectedNumber);

      // Get new image path
      var name = this.eComponentList[compType][selectedNumber].component;
      var description = this.eComponentList[compType][selectedNumber]
        .description;
      var schematic = this.eComponentList[compType][selectedNumber].schematic;
      var buyLink = this.eComponentList[compType][selectedNumber].buyLink;
      var connectorNetMap = this.eComponentList[compType][selectedNumber]
        .connectorNetMap;
      var hardElement = this.eComponentList[compType][selectedNumber]
        .hardElement;
      var hardElementVars = this.eComponentList[compType][selectedNumber]
        .hardElementVars;
      var partImage = this.eComponentList[compType][selectedNumber].partImage;
      var image = this.eComponentList[compType][selectedNumber].image;
      var height = this.eComponentList[compType][selectedNumber].height;
      var width = this.eComponentList[compType][selectedNumber].width;
      var requires = this.eComponentList[compType][selectedNumber].requires;

      if (image != "") {
        // Change the image
        $("#" + compId).css(
          "background-image",
          "url('" + require("./assets/" + image) + "')"
        );
      }
      // Change size
      $("#" + compId).css("height", height);
      $("#" + compId).css("width", width);

      //Save the new component number selected [Here we save the new selected component]
      this.eComponentSaved[compId].componentSelected = newNumber; // Set new component selected
      this.eComponentSaved[compId].componentName = name; // Set new component part number name
      this.eComponentSaved[compId].componentDescription = description; // Set new component part number name
      this.eComponentSaved[compId].componentSchematic = schematic; // Sets schematic file name
      this.eComponentSaved[compId].componentConnectorNetMap = connectorNetMap; // Sets connector Pin map
      this.eComponentSaved[compId].componentBuyLink = buyLink; // Set new component buy Link
      this.eComponentSaved[compId].componentHardElement = hardElement; // Set new component hardElement
      this.eComponentSaved[compId].componentHardElementVars = hardElementVars; // Set new component hardElement
      this.eComponentSaved[compId].componentPartImage = partImage; // Set new component part Image
      this.eComponentSaved[compId].componentImage = image; // Set new component image path
      this.eComponentSaved[compId].componentWidth = width; // Set new component width
      this.eComponentSaved[compId].componentHeight = height; // Set new component height
      this.eComponentSaved[compId].componentRequires = requires; // Set new component height
      this.eComponentSaved[compId].componentIfaces = {}; // Set in Build Screen

      console.log("ID:" + compId);
      console.log("TYPE:" + compType);
      console.log(
        "REQUIRES CHILDS: " + this.eComponentSaved[compId].componentRequires
      );

      // If component has childs add them
      var childComponentsList = this.eComponentSaved[compId].componentRequires;
      if (childComponentsList != undefined) {
        // If parent component has already been added, delete its childs
        var childIDList = this.eComponentSaved[compId].componentChildIDs;
        if (childIDList != null) {
          this.removeChildComponents(childIDList);
        }

        // Add child components of selected parent
        this.addChildComponents(compId, childComponentsList);
        console.log(
          "PARENT CHILD IDs:",
          this.eComponentSaved[compId].componentChildIDs
        );
      }
    },
    menuItemClick(item) {
      console.log("Item Cliked" + item);
      // Rotate component
      var elementId = this.eComponentSaved[this.currentComponentId].elementId;
      $("#" + elementId).css({ transform: "rotate(90deg)" });
    },
    removeParentComponent() {
      console.log("### REMOVE");

      // Get data
      var elementId = this.eComponentSaved[this.currentComponentId].elementId;
      var e_type = this.eComponentSaved[this.currentComponentId].type;
      // var e_width = this.eComponentSaved[this.currentComponentId].width;
      // var e_height = this.eComponentSaved[this.currentComponentId].height;
      var e_innerHTML = this.eComponentSaved[this.currentComponentId].innerHTML;

      // Restore user soft component id and visibility
      $("#" + this.currentComponentId)
        .detach()
        .appendTo("#" + this.currentComponentId + "_drag");

      // Remove type class
      if (e_type == "submit") {
        $("#" + this.currentComponentId).removeClass("submit-physical-button");
      } else if (e_type == "span") {
        $("#" + this.currentComponentId).removeClass("submit-physical-button");
      } else if (e_type == "range") {
        $("#" + this.currentComponentId).removeClass("range-physical-slider");
      } else if (e_type == "screens") {
        $("#" + this.currentComponentId).removeClass("physical-screen");
        // Enable HDMI Screens button
        this.hdmiScreens_button_disabled = false;
      } else {
        console.error("Unknown element type");
      }

      // Restore data
      $("#" + this.currentComponentId).css("background-image", "");
      $("#" + this.currentComponentId).css("height", "");
      $("#" + this.currentComponentId).css("width", "");
      $("#" + this.currentComponentId).html(e_innerHTML);

      // Hide Component Selection List
      this.componentListDisplay = "none";
      this.pcbPanelHeight = "100%";

      // Remove rest of comoponent from PCB
      $("#" + elementId).remove();
      console.log("Parent eId Removed: ", elementId);
      console.log("Parent Id Removed: ", this.currentComponentId);

      // Remove all childs asociated with the component
      var childIDList = this.eComponentSaved[this.currentComponentId]
        .componentChildIDs;
      this.removeChildComponents(childIDList);

      // Delete parent component id key from dictionary
      delete this.eComponentSaved[this.currentComponentId];

      console.log("### REMOVE END");
    },
    removeChildComponents(childIDList) {
      for (var i in childIDList) {
        // Get child component Id
        var id = childIDList[i];

        // Get childElementID
        var childElementID = this.eComponentSaved[id].elementId;

        // Remove component from PCB
        $("#" + childElementID).remove();
        console.log("Child eId Removed: ", childElementID);
        console.log("Child Id Removed: ", id);

        // Delete child from directory
        delete this.eComponentSaved[id];
      }
    },
    onGlobalClick(e) {
      //console.log("Global: ", $(e.target.parentElement).hasClass('noGlobalTrigger'));
      //console.log("Parent:"+ targetParent.className);

      // On a Global clikc, remove the border from the components selected.
      var targetParent = e.target.parentElement;
      if (!$(targetParent).hasClass("noGlobalTrigger")) {
        this.unselectComponents();
      }
    },
    unselectComponents() {
      // Unselect components
      for (var key in this.eComponentSaved) {
        // If element not in screen skip
        if (this.eComponentSaved[key].elementId == null) continue;

        // Remove selection border
        $("#" + this.eComponentSaved[key].elementId).css(
          "border",
          "3px solid transparent"
        );
      }
      // Hide Component Selection List
      this.componentListDisplay = "none";
      this.pcbPanelHeight = "100%";
    },
    //##########
    //########## HTML EDITOR
    //##########
    openHTMLEditor() {
      this.HTMLEditor = true;

      // Clear editor if there is a new project
      if (this.HTMLEditor_clear == true) {
        this.EditorHTML.getSession().setValue("");
        this.EditorCSS.getSession().setValue("");
        this.EditorJS.getSession().setValue("");
      }

      // Load new project data
      if (this.HTMLEditor_projectLoad == true) {
        let project = JSON.parse(this.project_data);
        this.EditorHTML.getSession().setValue(project.EditorHTMLText);
        this.EditorCSS.getSession().setValue(project.EditorCSSText);
        this.EditorJS.getSession().setValue(project.EditorJSText);
      }
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
      var iframe = document.querySelector("#HTMLEditor_iframe");
      iframe.contentWindow.location.reload(true);
      // Will call funcition on iframe load:HTMLEditor_iframeOnLoad()
    },
    HTMLEditor_iframeOnLoad() {
      this.EditorIFRAME_head = $("#HTMLEditor_iframe")
        .contents()
        .find("head");
      this.EditorIFRAME_body = $("#HTMLEditor_iframe")
        .contents()
        .find("body");

      // this.EditorIFRAME_head.empty();
      // this.EditorIFRAME_body.empty();

      // Set External script sources
      if (this.EditorJS_extSoruceOne != undefined) {
        console.log("Ext Soruce One has:" + this.EditorJS_extSoruceOne);
        this.EditorIFRAME_head.append(
          $("<script />", {
            src: `${this.EditorJS_extSoruceOne}`
          })
        );
      }
      if (this.EditorJS_extSoruceTwo != undefined) {
        console.log("Ext Soruce Two has:" + this.EditorJS_extSoruceTwo);
      }

      // Set CSS
      this.EditorIFRAME_head.append(
        $("<style />", {
          text: `${this.EditorCSS.getSession().getValue()}`
        })
      );

      // Set HTML
      this.EditorIFRAME_body.html(this.EditorHTML.getSession().getValue());

      // Set JS
      this.EditorIFRAME_body.append(
        $("<script />", {
          html: `${this.EditorJS.getSession().getValue()}`
        })
      );
    },
    HTMLEditor_injectWebPage() {
      this.HTMLEditor = false;

      // Inject HTML to webpageContainer
      $("#webpageContainer").empty();
      $("#webpageContainer").append(this.EditorHTML.getSession().getValue());
      // Inject CSS to whole document
      this.EditorMAIN_cssTag.remove();
      this.EditorMAIN_cssTag = $("<style></style>").appendTo($("head"));
      this.EditorMAIN_cssTag.text(this.EditorCSS.getSession().getValue());
      // Inject JS to whole document
      this.EditorMAIN_jsTag.remove();
      this.EditorMAIN_jsTag = $("<script/>").appendTo($("body"));
      this.EditorMAIN_jsTag.text(this.EditorJS.getSession().getValue());
      // Initialize search of soft elements that can be harden.
      this.searchSoftElements();
    },
    //##########
    //########## BUILD SCREEN
    //##########
    mapComponentsPins(hardVars, key) {
      // Translate Pins (e.g. (gpio:$gpio) to (gpio:4) )
      var hardVarsDic = [];
      var interfaceCounter = 0;
      var allTags = hardVars
        .replace(/[ ]/g, "")
        .slice(1, -1)
        .split(",");
      for (var i in allTags) {
        var hardTag = allTags[i].split(":");
        var net = hardTag[0];
        var variable = hardTag[1];

        // Get ioName without $ (e.g., ioName=gpio from variable=$gpio)
        var ioName = null;
        ["gpio", "i2c", "spi", "serial"].forEach(io => {
          if (variable.includes(io)) {
            ioName = io;
          }
        });

        // If ioName == null then its for example an i2c address.
        // Add it to dictionary and skip.
        if (ioName == null) {
          hardVarsDic.push(allTags[i]);
          continue;
        }

        // Select next pin form the available connector pins
        var nextPin = this.FinalPinMap[ioName].length;
        var availablePins = this.raspberryNetMap[ioName].length;
        if (nextPin >= availablePins) {
          // No more gpio pins avaliable
          console.log(`Error: Max num of ${ioName} pins avilable reached`);
          throw `Error: Max num of ${ioName} pins avilable reached`;
        } else {
          // Replace string with next available Pin
          var ifaceName = "iface_" + interfaceCounter;
          var pinName;
          if (ioName == "i2c" || ioName == "spi" || ioName == "serial") {
            // I2C, SPI, Serial e.g. url($i2c)
            var device = this.raspberryNetMap[ioName][nextPin];
            pinName = variable.replace("$" + ioName, `"${device.device}"`);
            hardVarsDic.push(net + ":" + pinName);

            // Add inetrface to component Dictionary
            this.eComponentSaved[key]["componentIfaces"][ifaceName] = device;
          } else {
            // GPIO
            pinName = this.raspberryNetMap[ioName][nextPin];
            hardVarsDic.push(net + ":" + `"${pinName}"`);

            // Add inetrface to component Dictionary
            this.eComponentSaved[key]["componentIfaces"][ifaceName] = {};
            this.eComponentSaved[key]["componentIfaces"][ifaceName]["type"] =
              "gpio";
            this.eComponentSaved[key]["componentIfaces"][ifaceName][
              net.toUpperCase()
            ] = pinName;
          }

          // Add to dictionary
          this.FinalPinMap[ioName].push(this.raspberryNetMap[ioName][nextPin]);
        }
        interfaceCounter++;
      }

      var finalhardVar = "(" + hardVarsDic.toString() + ")";
      //console.log("AFTER: "+finalhardVar);
      //console.log(this.eComponentSaved[key]["componentIfaces"]);
      return finalhardVar;
    },
    openBuildScreen() {
      // Just to test Build screen
      this.BuildScreen = true;

      // Generate PCB Final Comopnents Review
      this.BuildScreen_generatePCBReview();

      // Generate Hadware APP link
      this.BuildScreen_deployOnline();

      // Reset PCB Generation run flags
      this.pcbPercentage = 0;
      this.pcbGenerate = 0;
      this.pcbAutoroute = 0;
      this.pcbGerberFiles = 0;
    },
    BuildScreen_generatePCBReview() {
      // Reset Final Components
      this.FinalComponents = [];

      // Just for Test, Fill random component
      // this.eComponentSaved["myButton"] = {
      //   componentBuyLink:
      //     "https://www.digikey.com/product-detail/en/c-k/PTS645SL50SMTR92-LFS/CKN9088CT-ND/1146811",
      //   componentCenterLeft: 4,
      //   componentCenterTop: 4,
      //   componentChildIDs: ["resistor_1206_10k_Test"],
      //   componentIfaces: {},
      //   componentHardElement: "physical-button",
      //   //componentHardElementVars: '(gpio:"4")',
      //   componentHardElementVars:
      //     "(motora:$gpio, motorb:$gpio, touch:$gpio, i2c-addr:0x48, i2c-port:url($i2c))",
      //   componentHeight: "6mm",
      //   componentImage: "buttons/smd-button.svg",
      //   componentLeft: 1,
      //   componentName: "Tactile Push Button smd",
      //   componentPartImage: "buttons/smd-button.png",
      //   componentRequires: ["resistor_1206_10k"],
      //   componentSelected: 0,
      //   componentTop: 1,
      //   componentWidth: "6mm",
      //   elementId: "element_0",
      //   gpio: ["4"],
      //   height: 0,
      //   html: '<button onclick="playPause()" id="playPause"></button>',
      //   i2c: [],
      //   innerHTML: "",
      //   serial: [],
      //   spi: []
      // };

      // this.eComponentSaved["resistor_1206_10k_Test"] = {
      //   componentBuyLink: "",
      //   componentCenterLeft: 2.6,
      //   componentCenterTop: 1.8,
      //   componentChildIDs: [],
      //   componentIfaces: {},
      //   componentHardElement: undefined,
      //   componentHardElementVars: undefined,
      //   componentHeight: "1.6mm",
      //   componentImage: "misc/0603-RES.svg",
      //   componentLeft: 1,
      //   componentName: "10k resistor smd 1206 ",
      //   componentPartImage: "misc/0603-RES.jpg",
      //   componentRequires: undefined,
      //   componentSelected: 0,
      //   componentTop: 1,
      //   componentWidth: "3.2mm",
      //   elementId: "element_1",
      //   gpio: [],
      //   height: 0,
      //   html: '<div id="resistor_1206_10k_1" class="misc"></div>',
      //   i2c: [],
      //   innerHTML: "",
      //   serial: [],
      //   spi: [],
      //   type: "misc",
      //   width: 0
      // };

      // Reset Final Pin Mmap
      this.FinalPinMap = {
        gpio: [],
        i2c: [],
        spi: [],
        serial: []
      };

      // Map Component pins
      console.log("### PIN ASSIGNMENT");
      for (var key in this.eComponentSaved) {
        // Get hardware CSS variables
        var hardVars = this.eComponentSaved[key].componentHardElementVars;
        if (hardVars == undefined || hardVars == null) {
          console.log("SKIPPED:" + key);
          continue;
        }
        console.log("TRANSFOMING:" + key);
        console.log("BEFORE:", hardVars);
        try {
          hardVars = this.mapComponentsPins(hardVars, key);
        } catch (error) {
          // TODO manage error
          console.error(error);
        }
        // Save new hardware CSS variables
        console.log("AFTER:", hardVars);
        this.eComponentSaved[key].componentHardElementVars = hardVars;
      }
      console.log("### PIN ASSIGNMENT END");

      // Unselect components before screenshoot
      this.unselectComponents();

      // Output all component data to display list with quantities:
      console.log("### ADD TO LIST");
      var finalDisplayList = {};
      for (key in this.eComponentSaved) {
        // List added components
        console.log("ADDED:", this.eComponentSaved[key]);
        // Use component Description as key
        var displayKey = this.eComponentSaved[key].componentDescription;
        if (displayKey in finalDisplayList) {
          // Key exists, add Qunatity + 1.
          finalDisplayList[displayKey].qty =
            finalDisplayList[displayKey].qty + 1;
        } else {
          // Add key to final display List
          finalDisplayList[displayKey] = {
            component: this.eComponentSaved[key],
            qty: 1
          };
        }
      }

      // Show raspberry pi board first (TODO add this somewhere else)
      this.FinalComponents.push({
        image: this.getComponentsImg("boards/RaspberryPi.jpg"),
        title: `<strong>Part:</strong> Raspberry Pi`,
        subtitle: `<a href="https://www.digikey.com/product-detail/en/raspberry-pi/RASPBERRY-PI-4B-4GB/1690-RASPBERRYPI4B-4GB-ND/10258781?quantity=1" target="_blank">Buy Link</a> | Qty: 1`
      });

      // Generate list of components to be displayed
      for (key in finalDisplayList) {
        // Check if component is a main module element
        var componentSaved = finalDisplayList[key].component;
        var componentQty = finalDisplayList[key].qty;
        var hardElement = componentSaved.componentHardElement;
        var subtitleText = "";

        if (hardElement == undefined || hardElement == null) {
          // Generate subititle elemetn for a non Hard element
          hardElement = "";
          if (componentSaved.componentBuyLink.includes("digikey")) {
            // Add quantities for digikey
            console.log("LINK CONTAINS DIGIKEY", componentQty);
            subtitleText = `<a href="${
              componentSaved.componentBuyLink
            }?quantity=${componentQty}" target="_blank">Buy Link</a> | Qty: ${componentQty}`;
          } else {
            console.log("LINK DOES NOT CONTAINS DIGIKEY", componentQty);
            subtitleText = `<a href="${
              componentSaved.componentBuyLink
            }" target="_blank">Buy Link</a> | Qty: ${componentQty}`;
          }
        } else {
          // Get all interfaces in a summary
          var interfaces = finalDisplayList[key].component.componentIfaces;
          var ifacesSummary = "";
          for (var ifacekey in interfaces) {
            var type = interfaces[ifacekey].type;
            if (type == "gpio") {
              // Get gpio number from an unknown gpio net
              let gpioNum = null;
              for (let key in interfaces[ifacekey]) {
                if (key != "type") {
                  // If is not type then is the gpio net containing gpio num
                  gpioNum = interfaces[ifacekey][key];
                }
              }
              ifacesSummary =
                ifacesSummary + type.toUpperCase() + ":" + gpioNum + ", ";
            } else {
              ifacesSummary = ifacesSummary + type.toUpperCase() + ", ";
            }
          }
          // Remove two last characters
          ifacesSummary = ifacesSummary.substring(0, ifacesSummary.length - 2);

          // Generate subtitle Text for Hard element
          hardElement = " &lt" + hardElement + "&gt";
          if (componentSaved.componentBuyLink.includes("digikey")) {
            // Add quantities for digikey
            subtitleText = `<a href="${
              componentSaved.componentBuyLink
            }?quantity=${componentQty}" target="_blank">Buy Link</a> 
            | Qty: ${componentQty} | Hard HTML Tag: ${hardElement} (${ifacesSummary})`;
          } else {
            subtitleText = `<a href="${
              componentSaved.componentBuyLink
            }" target="_blank">Buy Link</a> 
            | Qty: ${componentQty} | Hard HTML Tag: ${hardElement} (${ifacesSummary})`;
          }
        }

        // Show generated list
        this.FinalComponents.push({
          image: this.getComponentsImg(componentSaved.componentPartImage),
          title: `<strong>Part:</strong> ${
            componentSaved.componentDescription
          }`,
          subtitle: subtitleText
          /*
          subtitle: `Width: ${this.eComponentSaved[key].componentWidth}
                     Height: ${this.eComponentSaved[key].componentHeight} |
                     CenterLeft: ${
                       this.eComponentSaved[key].componentCenterLeft
                     }mm
                     CenterTop: ${
                       this.eComponentSaved[key].componentCenterTop
                     }mm`
          */
        });
      }
      console.log("### ADD TO LIST END");

      // Take a picture of the PCB and add it to the left
      $("#canvasPCBimage").empty(); // Delete previous image
      html2canvas(document.querySelector("#PCB"), { logging: false }).then(
        function(canvas) {
          // Add canvas pcb image
          document.querySelector("#canvasPCBimage").appendChild(canvas);

          // Adjust horizontal pcb width Text
          var widthFlexBox = $("#buildScreen_pcbCanvas").width();
          var widthCanvas = canvas.width;
          var widthFinal = 0;
          if (widthCanvas > widthFlexBox) {
            widthFinal = widthFlexBox;
          } else {
            widthFinal = widthCanvas;
          }
          $("#buildScreen_pcbWidthText").css("width", widthFinal + "px");

          // Adjust vertical pcb Text
          var heightFlexBox = $("#buildScreen_pcbCanvas").height();
          var heightCanvas = canvas.height;
          var heightFinal = 0;
          if (heightCanvas > heightFlexBox) {
            heightFinal = heightFlexBox;
          } else {
            heightFinal = heightCanvas;
          }
          $("#buildScreen_pcbHeightText").css("height", heightFinal + "px");
        }
      );
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
        $("#buildScreen_mainPane").css("display", "none");
        $("#buildScreen_downloadPane").css("display", "block");
        // Return Button to normal value
        this.BuildButtonText = "BUILD";
        this.BuildButtonCount = 0;
      }
    },
    BuildScreen_cancelBuild() {
      if (this.CancelBuildButtonCount == 0) {
        this.CancelBuildButtonText =
          "THIS WILL CACNEL THE BUILD PROCESS, ARE YOU SURE?";
        this.CancelBuildButtonCount++;
      } else {
        // Execute Stuff here
        $("#buildScreen_mainPane").css("display", "block");
        $("#buildScreen_downloadPane").css("display", "none");
        // Return Button to normal value
        this.CancelBuildButtonText = "CANCEL";
        this.CancelBuildButtonCount = 0;
      }
    },
    BuildScreen_pcb_negativeY(pcbInput) {
      // Create a negative Y output of the PCB for eagle
      pcbInput["pcbHeight"] *= -1;
      pcbInput["connector"]["partsPosition"]["part_0"]["componentY"] *= -1;
      for (let module_x in pcbInput["modules"]) {
        for (let parts in pcbInput["modules"][module_x].partsPosition) {
          pcbInput["modules"][module_x]["partsPosition"][parts][
            "componentY"
          ] *= -1;
        }
      }
      return pcbInput;
    },
    async BuildScreen_downloadPCBFiles() {
      console.log("Sending PCB parts to server");

      var pcbInput = {}; // Empty object

      // Add pcb Width and Height
      pcbInput["pcbHeight"] = this.FinalPCB.height;
      pcbInput["pcbWidth"] = this.FinalPCB.width;

      // Add connector
      if (this.eComponentSaved["connector"] == undefined) {
        console.error("You are trying to build a PCB without a connector");
        return;
      } else {
        pcbInput["connector"] = {
          schematicName: this.eComponentSaved["connector"].componentSchematic,
          netsAvailabe: this.eComponentSaved["connector"]
            .componentConnectorNetMap["allNets"],
          partsPosition: {
            part_0: {
              componentName: this.eComponentSaved["connector"].componentName,
              componentX: this.eComponentSaved["connector"].componentCenterLeft,
              componentY: this.eComponentSaved["connector"].componentCenterTop
            }
          }
        };
      }
      // Add modules
      var moduleNum = 0;
      pcbInput["modules"] = {};
      for (var key in this.eComponentSaved) {
        // Get I/Os
        if (
          this.eComponentSaved[key].componentHardElement != undefined ||
          this.eComponentSaved[key].componentHardElement != null
        ) {
          // Its a parent comopnent
          var moduleName = "module_" + moduleNum;
          pcbInput["modules"][moduleName] = {
            schematicName: this.eComponentSaved[key].componentSchematic,
            interfaces: {},
            partsPosition: {}
          };

          // Add module interfaces
          pcbInput["modules"][moduleName]["interfaces"] = this.eComponentSaved[
            key
          ].componentIfaces;

          // Add partent part
          var partNum = 0;
          var partName = "part_" + partNum;
          pcbInput["modules"][moduleName]["partsPosition"][partName] = {
            componentName: this.eComponentSaved[key].componentName,
            componentX: this.eComponentSaved[key].componentCenterLeft,
            componentY: this.eComponentSaved[key].componentCenterTop
          };

          // Add childs Parts
          partNum++;
          partName = "part_" + partNum;
          var childParts = this.eComponentSaved[key].componentChildIDs;
          //console.log("CHILDS", childParts);
          for (var i in childParts) {
            var childID = childParts[i];
            pcbInput["modules"][moduleName]["partsPosition"][partName] = {
              componentName: this.eComponentSaved[childID].componentName,
              componentX: this.eComponentSaved[childID].componentCenterLeft,
              componentY: this.eComponentSaved[childID].componentCenterTop
            };
            partNum++;
            partName = "part_" + partNum;
          }
          moduleNum++;
        }
      }
      console.log("\n######\n###### Final PCB data\n######");
      // Generate Negative of PCB
      let pcbInputNegativeY = this.BuildScreen_pcb_negativeY(
        JSON.parse(JSON.stringify(pcbInput)) // Copy object
      );
      console.log(JSON.stringify(pcbInputNegativeY, null, 2));

      // Send pcbInput to server
      console.log("\n######\n###### Generating PCB (Server Side...) \n######");
      this.pcbLoading = true;
      this.pcbPercentage = 0;
      this.pcbGenerate = 0;
      this.pcbAutoroute = 0;
      this.pcbGerberFiles = 0;

      try {
        // Generate PCB
        this.pcbGenerate = 1;
        let genRes = await server.post("generatePCB", {
          pcbInput: pcbInputNegativeY
        });
        console.log("-- PCB Generation:", genRes.data.message);
        this.pcbPercentage = 50;
        this.pcbGenerate = 2;
        // Autoroutre PCB
        this.pcbAutoroute = 1;
        let autoRes = await server.get("autoroutePCB");
        console.log("-- PCB Autorouting:", autoRes.data.message);
        this.pcbPercentage = 75;
        this.pcbAutoroute = 2;
        // Generate PCB Gerber Files
        this.pcbGerberFiles = 1;
        let gerberRes = await server.get("generateGerber");
        console.log("-- PCB Gerber Files:", gerberRes.data.message);
        this.pcbPercentage = 100;
        this.pcbGerberFiles = 2;
        // Zip Gerber Files
        let zip = new JSZip();
        let gerberFiles = gerberRes.data.message;
        for (let key in gerberFiles) {
          if (gerberFiles[key].folder != "") {
            // Add file into folder
            zip
              .folder(gerberFiles[key].folder)
              .file(gerberFiles[key].filename, gerberFiles[key].data);
          } else {
            // Add file in root of folder
            zip.file(gerberFiles[key].filename, gerberFiles[key].data);
          }
        }
        zip.generateAsync({ type: "blob" }).then(function(content) {
          // see FileSaver.js
          FileSaver.saveAs(content, "GerberFiles.zip");
        });
        this.pcbLoading = false;
      } catch (error) {
        alert(error.response.statusText);
        this.pcbLoading = false;
        this.pcbPercentage = 0;
        if (this.pcbGenerate == 1) {
          this.pcbGenerate = 3;
        } else if (this.pcbAutoroute == 1) {
          this.pcbAutoroute = 3;
        } else if (this.pcbGerberFiles == 1) {
          this.pcbGerberFiles = 3;
        }
      }
    },
    generateHTMLDoc() {
      // index.html is generated here
      /*eslint-disable */
      // prettier-ignore
      return ('<!DOCTYPE html>\n\
<html lang="en">\n\
  <head>\n\
  <meta charset="UTF-8">\n\
  <meta http-equiv="X-UA-Compatible" content="IE=edge">\n\
  <meta name="viewport" content="width=device-width,initial-scale=1.0">\n\
  <link rel="import" href="amalgam/amalgam.html">\n\
  <link rel="stylesheet" href="hardware.css">\n\
  <style>\n'+this.EditorCSSText+'  </style>\n\
  </head>\n\
  <body>\n'+this.EditorHTMLText+
    '\n  <script>\n'+ this.EditorJSText +'  <\/script>\n\
  </body>\n\
</html>\n');
    },
    /*eslint-enable */

    generateCSSDoc() {
      console.log("### GENERATE CSS");
      // Hardware.css is generated here
      // prettier-ignore
      var cssDoc = "";
      for (var key in this.eComponentSaved) {
        var compId = key;
        var compHardElement = this.eComponentSaved[key].componentHardElement;
        if (compHardElement == undefined || compHardElement == null) {
          // Skip screen, connector, and misc components
          console.log("SKIPPED:" + key);
          continue;
        }
        console.log("ADDING:" + key);
        var compHardElementVars = this.eComponentSaved[key]
          .componentHardElementVars;

        // prettier-ignore
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
      console.log("FINAL CSS:\n", cssDoc);
      console.log("### GENERATE CSS END");
      return cssDoc;
    },
    BuildScreen_downloadAPP() {
      // Send html and css generated files
      server
        .get("amalgamFiles")
        .then(response => {
          // Should return a link
          if (response.status != 200) {
            alert(response.data.error);
            console.error("Server error when trying to communicate to server");
          } else {
            // Generate App zip file
            var zip = new JSZip();

            // Create app.html file
            var htmlDoc = this.generateHTMLDoc();
            zip.file("app.html", htmlDoc);

            // Create hardware.css file
            var cssDoc = this.generateCSSDoc();
            zip.file("hardware.css", cssDoc);

            // Create package.json
            var pckgJson = `{
  "name": "user-appliancizer-app",
  "description": "User Applianzicer App",
  "version": "1.0.0",
  "main": "main.js",
  "dependencies": {
    "css": "^2.2.4",
    "jquery": "^3.4.1",
    "linuxduino": "^0.2.0"
  },
  "scripts": {
    "app": "sudo DISPLAY=:0 electron . --no-sandbox"
  },
  "private": true
}`;
            zip.file("package.json", pckgJson);

            // Create main.js
            var electronMainjs = `const { app, BrowserWindow } = require('electron')
function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('app.html')
  win.maximize()
}
app.on('ready', createWindow)`;
            zip.file("main.js", electronMainjs);

            // Get Amalgam native Files
            var amalgam = zip.folder("amalgam");
            var amalgamFiles = response.data.message;
            for (var key in amalgamFiles) {
              if (amalgamFiles[key].folder != "") {
                // Add file into folder
                amalgam
                  .folder(amalgamFiles[key].folder)
                  .file(amalgamFiles[key].filename, amalgamFiles[key].data);
              } else {
                // Add file in root of folder
                amalgam.file(
                  amalgamFiles[key].filename,
                  amalgamFiles[key].data
                );
              }
            }

            zip.generateAsync({ type: "blob" }).then(function(content) {
              // see FileSaver.js
              FileSaver.saveAs(content, "MyHardwareApp.zip");
            });
          }
        })
        .catch(error => alert(error.message)); // if network error
    },
    BuildScreen_deployOnline() {
      console.log(
        "\n######\n###### Deploying App Online (Server Side...)\n######"
      );

      // Send html and css generated files
      server
        .post("generateWebPage", {
          userName: "testUser",
          htmlDoc: this.generateHTMLDoc(),
          cssDoc: this.generateCSSDoc()
        })
        .then(response => {
          // Should return a link
          if (response.status != 200) {
            alert(response.data.error);
            console.error("Server error when trying to generate web page");
          } else {
            console.log("GENERATED WEB LINK:", response.data.link);
            this.GeneratedLink = response.data.link;
          }
        })
        .catch(error => alert(error.message)); // if network error
    }
  },
  created() {}
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
  margin: 0px;
  padding: 0px;
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
  width: 100%;
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
  filter: brightness(0.8);
}

.componentSelect {
  border: 4px solid #2962ff !important;
}

#webpageContainer {
  background-color: #f2f2f2;
  visibility: hidden;
  height: 100%;
  overflow: scroll;
}

#webpageContainerProgressbar {
  display: none;
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
  position: relative; /*parent must have positioning*/
  border-color: rgb(174, 213, 129);
  border-style: dotted;
  vertical-align: top;
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
  position: relative; /*parent must have positioning*/
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
Hdmi Screen Phone like border 
*/
#hdmiScreenBorder {
  -webkit-transition: all 0.5s ease;
  transition: all 0.5s ease;
  -webkit-animation: fadein 2s; /* Safari, Chrome and Opera > 12.1 */
  -moz-animation: fadein 2s; /* Firefox < 16 */
  -ms-animation: fadein 2s; /* Internet Explorer */
  -o-animation: fadein 2s; /* Opera < 12.1 */
  animation: fadein 2s;
}

.phone {
  position: relative;
  border: 40px solid #121212;
  border-width: 40px 7px;
  border-radius: 40px;
  margin: 20px auto;
  overflow: hidden;
}

/*
HTML Editor css
*/
#htmlEditorDialogHeight {
  height: 100%;
}

#htmlEditor {
  width: 100%;
  height: 80%;
  overflow: hidden;
}

#cssEditor {
  width: 100%;
  height: 80%;
  overflow: hidden;
}

#jsEditor {
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

#projectsScreenDialogHeight {
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
  position: absolute;
  z-index: 2;
  width: 100%;
  height: 100%;
}

/* # Submit Style */
.submit-physical-button {
  display: block;
  background-color: transparent;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-style: none;
  width: 10mm;
  height: 10mm;
  background-image: url("~@/assets/buttons/1.png");
}

/* # Span Style */
.span-physical-output {
  display: block;
  background-color: transparent;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  border-style: none;
  width: 10mm;
  height: 10mm;
  background-image: url("~@/assets/output/LED-RED.jpg");
}

/* # Range Style */
.range-physical-slider {
  display: block;
  -webkit-appearance: none;
  background-image: url("~@/assets/range/motorizedPot.png");
  background-size: contain;
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
  border: 10px solid rgb(17, 17, 17);
  border-radius: 15px;
}

/* # Connector Type CSS */
#connector {
  display: block;
  background-color: transparent;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-style: none;
  width: 51mm;
  height: 5mm;
  background-image: url("~@/assets/connectors/rpi_connector.png");
}

/* # Misc component Type CSS */
.misc {
  display: block;
  background-color: transparent;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  border-style: none;
  width: 5mm;
  height: 5mm;
  background-image: url("~@/assets/misc/0603-RES.svg");
}
</style>
