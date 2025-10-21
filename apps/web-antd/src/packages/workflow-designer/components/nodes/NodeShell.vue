<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import CommonNodeHeader from '../../components/CommonNodeHeader.vue'
import { computed } from 'vue'

interface Props {
  data: any
  hasTarget?: boolean
  hasSource?: boolean
  extra?: string
}
const props = withDefaults(defineProps<Props>(), { hasTarget: true, hasSource: true, extra: '' })

function cut(val: string, n = 30) {
  if (!val) return ''
  return val.length > n ? `${val.slice(0, n)}...` : val
}

const lines = computed(() => {
  const n = (props.data?.wfComponent?.name || '').toLowerCase()
  const c = props.data?.nodeConfig || {}
  switch (n) {
    case 'answer':
      return [`${c.model_name || ''}`]
    case 'documentextractor':
      return [cut(c.source || ''), cut(c.pattern || '')].filter(Boolean)
    case 'keywordextractor':
      return [`关键词数量： ${c.top_n ?? 5}`, `模型： ${c.model_name || ''}`]
    case 'faqextractor':
      return [`抽取数量： ${c.top_n ?? 5}`, `模型： ${c.model_name || ''}`]
    case 'knowledgeretrieval':
      return [
        `知识库： ${c.knowledge_base_name || c.knowledge_base_uuid || ''}`,
        `数量： ${c.top_n ?? 3}  分数： ${c.score ?? 0.6}`,
        `严格模式： ${c.is_strict ? '是' : '否'}`,
      ]
    case 'switcher':
      return [`分支数： ${Array.isArray(c.cases) ? c.cases.length : 0}`]
    case 'template':
      return [cut(c.content || c.prompt || '')]
    case 'httprequest':
      return [`${c.method || 'GET'} ${cut(c.url || '')}`]
    case 'mailsend':
      return [`收件人： ${cut(c.to_mails || '')}`, `主题： ${cut(c.subject || '')}`]
    case 'humanfeedback':
      return [cut(c.tip || '')]
    case 'google':
      return [`国家和地区： ${c.country || 'cn'}`, `语言： ${c.language || 'zh-cn'}`, `提取数量： ${c.top_n ?? 5}`]
    case 'dalle3':
      return [`尺寸： ${c.size || ''}`, `质量： ${c.quality || ''}`]
    case 'tongyiwanx':
      return [`模型： ${c.model_name || ''}`, `尺寸： ${c.size || ''}`]
    default:
      return props.extra ? [props.extra] : []
  }
})
</script>

<template>
  <div class="flex flex-col w-full">
    <Handle v-if="hasTarget" type="target" :position="Position.Left" />
    <Handle v-if="hasSource" type="source" :position="Position.Right" />
    <CommonNodeHeader :wf-node="data" />
    <div v-for="(line, idx) in lines" :key="idx" class="content_line text-left px-3">{{ line }}</div>
    <div v-if="!lines.length && extra" class="content_line text-left px-3">{{ extra }}</div>
  </div>
  
</template>


