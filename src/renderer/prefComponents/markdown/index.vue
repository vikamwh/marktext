<template>
  <div class="pref-markdown">
    <h4>Markdown</h4>
    <compound>
      <template #head>
        <h6 class="title">Lists:</h6>
      </template>
      <template #children>
        <bool
          description="Prefer loose list items"
          :bool="preferLooseListItem"
          :onChange="value => onSelectChange('preferLooseListItem', value)"
          more="https://spec.commonmark.org/0.29/#loose"
        ></bool>
        <cur-select
          description="Preferred marker for bullet lists"
          :value="bulletListMarker"
          :options="bulletListMarkerOptions"
          :onChange="value => onSelectChange('bulletListMarker', value)"
          more="https://spec.commonmark.org/0.29/#bullet-list-marker"
        ></cur-select>
        <cur-select
          description="Preferred marker for ordered lists"
          :value="orderListDelimiter"
          :options="orderListDelimiterOptions"
          :onChange="value => onSelectChange('orderListDelimiter', value)"
          more="https://spec.commonmark.org/0.29/#ordered-list"
        ></cur-select>
        <cur-select
          description="Preferred list indentation"
          :value="listIndentation"
          :options="listIndentationOptions"
          :onChange="value => onSelectChange('listIndentation', value)"
        ></cur-select>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">Markdown extensions:</h6>
      </template>
      <template #children>
        <cur-select
          description="Front matter format"
          :value="frontmatterType"
          :options="frontmatterTypeOptions"
          :onChange="value => onSelectChange('frontmatterType', value)"
        ></cur-select>
        <bool
          description="Enable Pandoc-style superscript and subscript"
          :bool="superSubScript"
          :onChange="value => onSelectChange('superSubScript', value)"
          more="https://pandoc.org/MANUAL.html#superscripts-and-subscripts"
        ></bool>
        <bool
          description="Enable Pandoc-style footnotes"
          notes="Requires restart."
          :bool="footnote"
          :onChange="value => onSelectChange('footnote', value)"
          more="https://pandoc.org/MANUAL.html#footnotes"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">Compatibility:</h6>
      </template>
      <template #children>
        <bool
          description="Enable HTML rendering"
          :bool="isHtmlEnabled"
          :onChange="value => onSelectChange('isHtmlEnabled', value)"
        ></bool>
        <bool
          description="Enable GitLab compatibility mode"
          :bool="isGitlabCompatibilityEnabled"
          :onChange="value => onSelectChange('isGitlabCompatibilityEnabled', value)"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">Diagrams:</h6>
      </template>
      <template #children>
        <cur-select
          description="Sequence diagram theme"
          :value="sequenceTheme"
          :options="sequenceThemeOptions"
          :onChange="value => onSelectChange('sequenceTheme', value)"
          more="https://bramp.github.io/js-sequence-diagrams/"
        ></cur-select>
        <bool
          description="Render diagrams via Kroki"
          notes="If enabled, MarkText sends diagram code to the configured Kroki server and embeds the returned SVG."
          :bool="enableKroki"
          :onChange="value => onSelectChange('enableKroki', value)"
        ></bool>
        <text-box
          description="Kroki server URL"
          :input="krokiServerUrl"
          :onChange="value => onSelectChange('krokiServerUrl', value)"
          :defaultValue="'http://localhost:8000'"
          :regexValidator="/^(https?:\/\/).*/"
        ></text-box>
        <text-box
          description="Kroki timeout (ms)"
          notes="Timeout for Kroki requests in milliseconds. 0 = no timeout."
          :input="String(krokiTimeoutMs)"
          :onChange="value => onSelectChange('krokiTimeoutMs', Math.max(0, parseInt(value || '0', 10) || 0))"
          :defaultValue="'5000'"
          :regexValidator="/^(?:\d+)$|^$/"
        ></text-box>
        <bool
          description="Kroki: Keep exact diagram size (no responsive scaling)"
          notes="Applies only to Kroki-rendered diagrams. Keeps SVG width/height/preserveAspectRatio as returned by Kroki."
          :bool="diagramExactSize"
          :onChange="value => onSelectChange('diagramExactSize', value)"
        ></bool>
      </template>
    </compound>

    <compound>
      <template #head>
        <h6 class="title">Misc:</h6>
      </template>
      <template #children>
        <cur-select
          description="Preferred heading style"
          :value="preferHeadingStyle"
          :options="preferHeadingStyleOptions"
          :onChange="value => onSelectChange('preferHeadingStyle', value)"
          :disable="true"
        ></cur-select>
      </template>
    </compound>
  </div>
</template>

<script>
import Compound from '../common/compound'
import Separator from '../common/separator'
import { mapState } from 'vuex'
import Bool from '../common/bool'
import CurSelect from '../common/select'
import {
  bulletListMarkerOptions,
  orderListDelimiterOptions,
  preferHeadingStyleOptions,
  listIndentationOptions,
  frontmatterTypeOptions,
  sequenceThemeOptions
} from './config'
import TextBox from '../common/textBox'

export default {
  components: {
    Compound,
    Separator,
    Bool,
    CurSelect,
    TextBox
  },
  data () {
    this.bulletListMarkerOptions = bulletListMarkerOptions
    this.orderListDelimiterOptions = orderListDelimiterOptions
    this.preferHeadingStyleOptions = preferHeadingStyleOptions
    this.listIndentationOptions = listIndentationOptions
    this.frontmatterTypeOptions = frontmatterTypeOptions
    this.sequenceThemeOptions = sequenceThemeOptions
    return {}
  },
  computed: {
    ...mapState({
      preferLooseListItem: state => state.preferences.preferLooseListItem,
      bulletListMarker: state => state.preferences.bulletListMarker,
      orderListDelimiter: state => state.preferences.orderListDelimiter,
      preferHeadingStyle: state => state.preferences.preferHeadingStyle,
      listIndentation: state => state.preferences.listIndentation,
      frontmatterType: state => state.preferences.frontmatterType,
      superSubScript: state => state.preferences.superSubScript,
      footnote: state => state.preferences.footnote,
      isHtmlEnabled: state => state.preferences.isHtmlEnabled,
      isGitlabCompatibilityEnabled: state => state.preferences.isGitlabCompatibilityEnabled,
      sequenceTheme: state => state.preferences.sequenceTheme,
      enableKroki: state => state.preferences.enableKroki,
      krokiServerUrl: state => state.preferences.krokiServerUrl,
      krokiTimeoutMs: state => state.preferences.krokiTimeoutMs,
      diagramExactSize: state => state.preferences.diagramExactSize
    })
  },
  methods: {
    onSelectChange (type, value) {
      this.$store.dispatch('SET_SINGLE_PREFERENCE', { type, value })
    }
  }
}
</script>

<style scoped>
  .pref-markdown {
  }
</style>
