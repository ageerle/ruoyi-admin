import type { WorkflowInfo } from '../types/index.d';

import { v4 as uuidv4 } from 'uuid';

export type DefaultGetter = (workflow: WorkflowInfo) => any;

function createUuid() {
  return uuidv4().replaceAll('-', '');
}
// 新建节点后的默认配置表
// 统一默认配置表：键名为节点 name 的小写
export const propertyDefaultGetters: Record<string, DefaultGetter> = {
  start: () => ({ prologue: '' }),
  end: () => ({ result: '' }),
  answer: () => ({ prompt: '', model_name: '' }),
  faqextractor: () => ({ top_n: 5, model_name: '' }),
  knowledgeretrieval: () => ({
    knowledge_base_uuid: '',
    knowledge_base_name: '',
    score: 0.6,
    top_n: 3,
    is_strict: true,
    default_response: '',
  }),
  dalle3: () => ({ prompt: '', size: '1024x1024', quality: 'standard' }),
  tongyiwanx: () => ({
    model_name: '',
    prompt: '',
    size: '1024*1024',
    seed: -1,
  }),
  google: () => ({
    query: '',
    search_engine: 'search_std',
    result_count: 10,
    search_domain_filter: '',
    search_recency_filter: 'noLimit',
    content_size: 'medium',
    include_image: false,
  }),
  mailsend: () => ({
    sender_type: 1,
    cc_mails: '',
    to_mails: '',
    subject: '',
    content: '',
    smtp: { host: '', port: 465 },
    sender: { name: '', mail: '', password: '' },
  }),
  httprequest: () => ({
    method: 'GET',
    url: '',
    content_type: 'text/plain',
    headers: [{ name: 'Accept', value: '*/*' }],
    params: [],
    text_body: '',
    json_body: {},
    form_data_body: [],
    form_urlencoded_body: [],
    body: {},
    timeout: 10,
    retry_times: 0,
    clear_html: false,
  }),
  // 条件分支：基于 workflow 的 Start 节点生成两条示例规则
  switcher: (workflow) => {
    const startNode = workflow.nodes.find(
      (n) => n.wfComponent?.name === 'Start',
    );
    const firstParam = startNode?.inputConfig?.user_inputs?.[0]?.name || '';
    return {
      default_target_node_uuid: '',
      cases: [
        {
          uuid: createUuid(),
          operator: 'and',
          target_node_uuid: '',
          conditions: [
            {
              node_uuid: startNode?.uuid || '',
              node_param_name: firstParam,
              operator: 'contains',
              value: '',
            },
          ],
        },
        {
          uuid: createUuid(),
          operator: 'and',
          target_node_uuid: '',
          conditions: [
            {
              node_uuid: startNode?.uuid || '',
              node_param_name: firstParam,
              operator: 'contains',
              value: '',
            },
          ],
        },
      ],
    };
  },
};
