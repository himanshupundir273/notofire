export type Importance = 'low' | 'medium' | 'high'

export interface Case {
  id: string
  case_code: string
  title: string
  client_name: string
  contact_number: string | null
  address: string | null
  description: string | null
  importance: Importance
  party_details: string | null
  next_update: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  case_id: string
  event_description: string
  event_date: string
  importance: Importance
  internal_remark: string | null
  final_remark: string | null
  created_at: string
  links?: EventLink[]
  attachments?: Attachment[]
  event_comments?: EventComment[]
}

export interface EventLink {
  label: string
  url: string
}

export interface Attachment {
  id: string
  event_id: string
  file_name: string
  file_type: string
  file_url: string
  created_at: string
}

export interface EventComment {
  id: string
  event_id: string
  content: string
  author: string
  created_at: string
}

export type SortOrder = 'asc' | 'desc'
