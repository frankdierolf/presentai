/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Chat = "chat",
	Customer = "customer",
	Feedback = "feedback",
	Files = "files",
	Messages = "messages",
	Newsletter = "newsletter",
	Notes = "notes",
	NotesCount = "notesCount",
	Price = "price",
	Product = "product",
	PublicChat = "publicChat",
	Subscription = "subscription",
	Tasks = "tasks",
	TasksCount = "tasksCount",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type ChatRecord = {
	created?: IsoDateString
	id: string
	title?: string
	updated?: IsoDateString
	user: RecordIdString
}

export type CustomerRecord = {
	created?: IsoDateString
	id: string
	stripe_customer_id?: string
	updated?: IsoDateString
	user_id?: RecordIdString
}

export enum FeedbackTypeOptions {
	"idea" = "idea",
	"issue" = "issue",
	"feature_request" = "feature_request",
	"other" = "other",
}
export type FeedbackRecord = {
	created?: IsoDateString
	id: string
	message: string
	type: FeedbackTypeOptions
	updated?: IsoDateString
	user?: RecordIdString
}

export type FilesRecord = {
	created?: IsoDateString
	file?: string
	id: string
	size: string
	type: string
	updated?: IsoDateString
	user: RecordIdString
}

export enum MessagesRoleOptions {
	"system" = "system",
	"user" = "user",
	"assistant" = "assistant",
}

export enum MessagesReactionOptions {
	"liked" = "liked",
	"disliked" = "disliked",
	"none" = "none",
}
export type MessagesRecord = {
	chat: RecordIdString
	content: string
	created?: IsoDateString
	id: string
	reaction?: MessagesReactionOptions
	role?: MessagesRoleOptions
	updated?: IsoDateString
	user: RecordIdString
}

export type NewsletterRecord = {
	created?: IsoDateString
	email: string
	id: string
	referrer?: string
	updated?: IsoDateString
}

export type NotesRecord = {
	content: string
	created?: IsoDateString
	id: string
	image: string
	title: string
	updated?: IsoDateString
	user: RecordIdString
}

export type NotesCountRecord = {
	id: string
	total?: number
	user?: RecordIdString
}

export type PriceRecord<Tmetadata = unknown> = {
	active?: boolean
	created?: IsoDateString
	currency?: string
	description?: string
	id: string
	interval?: string
	interval_count?: number
	metadata?: null | Tmetadata
	price_id: string
	product_id?: RecordIdString
	stripe_product_id?: string
	trial_period_days?: number
	type?: string
	unit_amount?: number
	updated?: IsoDateString
}

export type ProductRecord<Tfeatures = unknown, Tmetadata = unknown> = {
	active?: boolean
	created?: IsoDateString
	description?: string
	features?: null | Tfeatures
	id: string
	image?: string
	metadata?: null | Tmetadata
	name?: string
	product_id?: string
	product_order?: number
	updated?: IsoDateString
}
interface PublicChatAuthor {
	avatarUrl?: string
	name?: string
}
export type PublicChatRecord<Tauthor = PublicChatAuthor, Tmessages = unknown> = {
	author?: Tauthor
	created?: IsoDateString
	id: string
	messages: null | Tmessages
	title: string
	updated?: IsoDateString
	user: RecordIdString
}

export type SubscriptionRecord<Tmetadata = unknown> = {
	cancel_at?: IsoDateString
	cancel_at_period_end?: boolean
	canceled_at?: IsoDateString
	created?: IsoDateString
	current_period_end?: IsoDateString
	current_period_start?: IsoDateString
	ended_at?: IsoDateString
	id: string
	metadata?: null | Tmetadata
	price_id?: RecordIdString
	quantity?: number
	status?: string
	subscription_id?: string
	trial_end?: IsoDateString
	trial_start?: IsoDateString
	updated?: IsoDateString
	user_id?: RecordIdString
}

export type TasksRecord = {
	completed?: boolean
	created?: IsoDateString
	date?: IsoDateString
	id: string
	title?: string
	updated?: IsoDateString
	user: RecordIdString
}

export type TasksCountRecord = {
	id: string
	total?: number
	user?: RecordIdString
}

export type UsersRecord = {
	avatar?: string
	billing_address?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	payment_method?: string
	pro_account?: boolean
	subscription?: RecordIdString
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ChatResponse<Texpand = unknown> = Required<ChatRecord> & BaseSystemFields<Texpand>
export type CustomerResponse<Texpand = unknown> = Required<CustomerRecord> & BaseSystemFields<Texpand>
export type FeedbackResponse<Texpand = unknown> = Required<FeedbackRecord> & BaseSystemFields<Texpand>
export type FilesResponse<Texpand = unknown> = Required<FilesRecord> & BaseSystemFields<Texpand>
export type MessagesResponse<Texpand = unknown> = Required<MessagesRecord> & BaseSystemFields<Texpand>
export type NewsletterResponse<Texpand = unknown> = Required<NewsletterRecord> & BaseSystemFields<Texpand>
export type NotesResponse<Texpand = unknown> = Required<NotesRecord> & BaseSystemFields<Texpand>
export type NotesCountResponse<Texpand = unknown> = Required<NotesCountRecord> & BaseSystemFields<Texpand>
export type PriceResponse<Tmetadata = unknown, Texpand = unknown> = Required<PriceRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type ProductResponse<Tfeatures = unknown, Tmetadata = unknown, Texpand = unknown> = Required<ProductRecord<Tfeatures, Tmetadata>> & BaseSystemFields<Texpand>
export type PublicChatResponse<Tauthor = unknown, Tmessages = unknown, Texpand = unknown> = Required<PublicChatRecord<Tauthor, Tmessages>> & BaseSystemFields<Texpand>
export type SubscriptionResponse<Tmetadata = unknown, Texpand = unknown> = Required<SubscriptionRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type TasksResponse<Texpand = unknown> = Required<TasksRecord> & BaseSystemFields<Texpand>
export type TasksCountResponse<Texpand = unknown> = Required<TasksCountRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	chat: ChatRecord
	customer: CustomerRecord
	feedback: FeedbackRecord
	files: FilesRecord
	messages: MessagesRecord
	newsletter: NewsletterRecord
	notes: NotesRecord
	notesCount: NotesCountRecord
	price: PriceRecord
	product: ProductRecord
	publicChat: PublicChatRecord
	subscription: SubscriptionRecord
	tasks: TasksRecord
	tasksCount: TasksCountRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	chat: ChatResponse
	customer: CustomerResponse
	feedback: FeedbackResponse
	files: FilesResponse
	messages: MessagesResponse
	newsletter: NewsletterResponse
	notes: NotesResponse
	notesCount: NotesCountResponse
	price: PriceResponse
	product: ProductResponse
	publicChat: PublicChatResponse
	subscription: SubscriptionResponse
	tasks: TasksResponse
	tasksCount: TasksCountResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'chat'): RecordService<ChatResponse>
	collection(idOrName: 'customer'): RecordService<CustomerResponse>
	collection(idOrName: 'feedback'): RecordService<FeedbackResponse>
	collection(idOrName: 'files'): RecordService<FilesResponse>
	collection(idOrName: 'messages'): RecordService<MessagesResponse>
	collection(idOrName: 'newsletter'): RecordService<NewsletterResponse>
	collection(idOrName: 'notes'): RecordService<NotesResponse>
	collection(idOrName: 'notesCount'): RecordService<NotesCountResponse>
	collection(idOrName: 'price'): RecordService<PriceResponse>
	collection(idOrName: 'product'): RecordService<ProductResponse>
	collection(idOrName: 'publicChat'): RecordService<PublicChatResponse>
	collection(idOrName: 'subscription'): RecordService<SubscriptionResponse>
	collection(idOrName: 'tasks'): RecordService<TasksResponse>
	collection(idOrName: 'tasksCount'): RecordService<TasksCountResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
