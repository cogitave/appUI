'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Conversation } from '@/components/blocks/conversation/conversation';
import { Message as ChatBubble } from '@/components/blocks/message/message';
import { MessageActions } from '@/components/blocks/message-actions/message-actions';
import { RiAddLine, RiArrowUpLine, RiAttachment2, RiMore2Line, RiShareForwardLine } from '@remixicon/react';

type Message = { id: string; role: 'user' | 'assistant'; text: string };
type Thread = { id: string; title: string; messages: Message[]; updated: number };
const storageKey = 'appui.chat-starter.threads';
const starters = ['Explain what this starter does', 'Write a product update in three sentences', 'Give me five names for a scheduling app'];

function previewReply(prompt: string) {
  if (/name/i.test(prompt)) return 'Here are five directions: Daylight, Flowline, Open Hours, Tempo, and Gather. Pick one and I can refine its voice.';
  if (/product update/i.test(prompt)) return 'We refined the workspace to make daily work feel clearer. Your recent activity, useful controls, and next steps now stay together. Try the new flow and tell us what could be simpler.';
  return 'This starter gives you a clean conversation, local history, and a place to connect your own model. You can start a new chat or continue one from the history panel.';
}

export function ChatStarterWorkspace({onAction,onSend}:{onAction?:(action:string)=>void;onSend?:(message:string)=>Promise<string>|string}) {
  const [threads,setThreads]=useState<Thread[]>([]);
  const [activeId,setActiveId]=useState<string|null>(null);
  const [value,setValue]=useState('');
  const [sending,setSending]=useState(false);
  const [attached,setAttached]=useState<File|null>(null);
  const fileInput=useRef<HTMLInputElement>(null);
  const active=threads.find(thread=>thread.id===activeId);
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey)??'[]') as Thread[];if(Array.isArray(saved))setThreads(saved.filter(item=>Array.isArray(item.messages)).slice(0,30))}catch{/* Invalid local history starts fresh. */}},[]);
  useEffect(()=>{if(threads.length)localStorage.setItem(storageKey,JSON.stringify(threads));else localStorage.removeItem(storageKey)},[threads]);
  function newChat(){setActiveId(null);setValue('');setAttached(null);onAction?.('New chat')}
  async function send(text:string){const clean=text.trim();if(!clean||sending)return;const id=activeId??`chat-${Date.now()}`;const user:Message={id:`message-${Date.now()}-u`,role:'user',text:attached?`${clean}\n📎 ${attached.name}`:clean};setActiveId(id);setValue('');setAttached(null);setSending(true);setThreads(current=>{const existing=current.find(thread=>thread.id===id);const next:Thread={id,title:existing?.title??clean.slice(0,42),messages:[...(existing?.messages??[]),user],updated:Date.now()};return [next,...current.filter(thread=>thread.id!==id)]});try{const response=onSend?await onSend(clean):previewReply(clean);setThreads(current=>current.map(thread=>thread.id===id?{...thread,messages:[...thread.messages,{id:`message-${Date.now()}-a`,role:'assistant',text:response}],updated:Date.now()}:thread));onAction?.('Message sent')}catch{setThreads(current=>current.map(thread=>thread.id===id?{...thread,messages:[...thread.messages,{id:`message-${Date.now()}-error`,role:'assistant',text:'The response could not be loaded. Please try again.'}]}:thread));onAction?.('Message failed')}finally{setSending(false)}}
  function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();void send(value)}
  async function share(){try{await navigator.clipboard.writeText(location.href);onAction?.('Chat link copied')}catch{onAction?.('Could not copy chat link')}}
  return <div className="ui-chat-starter"><section className="ui-chat-starter__conversation"><header><strong>{active?.title??'New chat'}</strong><div><button type="button" aria-label="Share chat" onClick={share}><RiShareForwardLine size={17}/></button><button type="button" aria-label="More chat options" onClick={()=>onAction?.('Chat options')}><RiMore2Line size={18}/></button></div></header>
    <Conversation className="ui-chat-starter__thread" conversationKey={activeId??"new"} isStreaming={sending}>{active?.messages.length?<div className="ui-chat-starter__messages">{active.messages.map(message=><ChatBubble key={message.id} role={message.role} variant="bubble" showHeader={false} actions={message.role==='assistant'?<MessageActions content={message.text}/>:undefined}><p>{message.text}</p></ChatBubble>)}{sending&&<span className="ui-chat-starter__typing" role="status">Thinking…</span>}</div>:<div className="ui-chat-starter__empty"><h1>What can I help with?</h1><p>This chat runs against your own API key. History stays in this browser.</p><div>{starters.map(prompt=><button type="button" key={prompt} onClick={()=>void send(prompt)}>{prompt}</button>)}</div></div>}</Conversation>
    <div className="ui-chat-starter__composer"><form onSubmit={submit}><input ref={fileInput} type="file" aria-label="Attach a file" hidden onChange={event=>setAttached(event.currentTarget.files?.[0]??null)}/><button type="button" aria-label="Attach a file" onClick={()=>fileInput.current?.click()}><RiAttachment2 size={19}/></button><input type="text" aria-label="Ask me anything" placeholder="Ask me anything" value={value} onChange={event=>setValue(event.target.value)}/><button type="submit" aria-label="Send message" disabled={!value.trim()||sending}><RiArrowUpLine size={19}/></button></form>{attached&&<button className="ui-chat-starter__attached" type="button" onClick={()=>setAttached(null)}>{attached.name} ×</button>}<footer><span>∞ {onSend?'Connected':'Preview mode'}</span><button type="button" onClick={newChat}>✧ New chat</button></footer></div>
  </section><aside className="ui-chat-starter__history" aria-label="Recent chats"><button type="button" onClick={newChat}><RiAddLine size={18}/>New chat</button><span>Recent</span>{threads.length?<div>{threads.map(thread=><button type="button" key={thread.id} aria-current={activeId===thread.id?'page':undefined} onClick={()=>setActiveId(thread.id)}><strong>{thread.title}</strong><small>{new Date(thread.updated).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</small></button>)}</div>:<p>Chats you start show up here.</p>}<footer><span>M</span>Maya Chen</footer></aside></div>;
}
