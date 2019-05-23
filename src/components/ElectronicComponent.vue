<!-- Component comoponent  -->
<template>
  <div :id="id" class="hello">
    {{ msg }}
    <strong>
      <div v-html="rawHTML"></div>
    </strong>
  </div>
</template>

<script>
import $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable'

export default {
  name: "ElectronicComponent",
  props: {
    id: null,
    msg: {
      type: String,
      required: true
    },
    rawHTML: {
      type: String,
      required: false
    }
  },
  mounted () {
    console.log("LOL"+this.msg);
  },
  methods: {

  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
