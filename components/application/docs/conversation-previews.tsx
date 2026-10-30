'use client';

import { useEffect, useRef, useState } from 'react';
import { RiChatAiLine } from '@remixicon/react';
import { Button } from '@/components/base/buttons/button';
import { Breadcrumb, BreadcrumbItem } from '@/components/base/breadcrumb/breadcrumb';
import { EmptyState } from '@/components/base/empty-state/empty-state';
import { StreamingText } from '@/components/base/streaming-text/streaming-text';
import { Conversation } from '@/components/blocks/conversation/conversation';
import { Composer } from '@/components/blocks/composer/composer';
import { Message } from '@/components/blocks/message/message';
import { MessageActions, type MessageFeedback } from '@/components/blocks/message-actions/message-actions';
import { Sources, type Source } from '@/components/blocks/sources/sources';
import { ToolCall } from '@/components/blocks/tool-call/tool-call';
import { DocExampleSection as Section } from './doc-example-section';
import type { ConversationSlug } from './conversation-pages';

const answer='Start with one clear goal. Keep the essential controls close to the work, give every action a visible result, and use the same spacing and type roles across the product.';
const alternate='Build the smallest useful flow first. Show the next action clearly, preserve the user’s work, and make loading, success and recovery feel like parts of the same interface.';
const source:Source={id:'react-aria',title:'Keyboard access for interactive previews',publisher:'React Aria',url:'https://react-aria.adobe.com/PreviewTrigger',description:'Focus and pointer behavior for previews with interactive content.'};

function useExampleStream() {
  const [text,setText]=useState(answer),[running,setRunning]=useState(false),timer=useRef<ReturnType<typeof setInterval>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearInterval(timer.current);},[]);
  function run(){if(timer.current)clearInterval(timer.current);setText('');setRunning(true);let count=0;timer.current=setInterval(()=>{count=Math.min(answer.length,count+7);setText(answer.slice(0,count));if(count>=answer.length){if(timer.current)clearInterval(timer.current);setRunning(false);}},48);}
  function stop(){if(timer.current)clearInterval(timer.current);setRunning(false);}
  return {text,running,run,stop};
}

function StreamDemo({showCursor=true,animate=true,message=false}:{showCursor?:boolean;animate?:boolean;message?:boolean}) {
  const {text,running,run,stop}=useExampleStream();
  const content=<StreamingText text={text} isStreaming={running} showCursor={showCursor} animate={animate}/>;
  return <div className="docs-extended-stack">{message?<Message role="assistant" isStreaming={running} actions={<MessageActions content={text}/>}><p>{content}</p></Message>:<p className="docs-stream-line">{content}</p>}<div className="docs-extended-actions"><Button size="small" variant="secondary" onClick={run} disabled={running}>Stream response</Button>{running&&<Button size="small" variant="ghost" onClick={stop}>Stop response</Button>}</div><span className="sr-only" role="status">{running?'Response in progress.':'Response ready.'}</span></div>;
}


function ActionsDemo({feedback=true,regenerate=false}:{feedback?:boolean;regenerate?:boolean}) {
  const [text,setText]=useState(answer),[rating,setRating]=useState<MessageFeedback>(null);
  return <Message role="assistant" actions={<MessageActions content={text} showFeedback={feedback} feedback={rating} onFeedbackChange={setRating} onRegenerate={regenerate?()=>{setText(t=>t===answer?alternate:answer);setRating(null);}:undefined}/>}><p>{text}</p></Message>;
}

type DemoMessage={id:number;role:'user'|'assistant';text:string};
const history:DemoMessage[]=Array.from({length:8},(_,i)=>({id:i,role:i%2?'assistant':'user',text:i%2?`Plan ${Math.floor(i/2)+1}: ${answer}`:`How should we approach part ${Math.floor(i/2)+1} of the project?`}));
function ConversationDemo({composer=true,empty=false,longHistory=false}:{composer?:boolean;empty?:boolean;longHistory?:boolean}) {
  const [messages,setMessages]=useState<DemoMessage[]>(empty?[]:longHistory?history:[{id:1,role:'user',text:'Review the navigation behavior on smaller screens.'},{id:2,role:'assistant',text:'I’ll check the sidebar, composer and side panel at tablet and mobile widths, then adjust their shared layout rules.'}]);
  function add(text='A new response arrived. Your reading position stays where you left it.'){setMessages(current=>[...current,{id:Date.now(),role:composer?'user':'assistant',text}]);}
  return <div className="docs-extended-stack"><Conversation height={composer?480:360} label="Studio conversation" className="docs-conversation" header={<Breadcrumb><BreadcrumbItem>Studio app</BreadcrumbItem><BreadcrumbItem current>Navigation polish</BreadcrumbItem></Breadcrumb>} footer={composer?<Composer onSend={add} placeholder="Ask me anything" branch="Main" project="Studio app" agentLabel="Agent" contextPercent={57}/>:undefined}>
    {messages.length?messages.map(message=><Message key={message.id} role={message.role} actions={message.role==='assistant'?<MessageActions content={message.text}/>:undefined}><p>{message.text}</p></Message>):<EmptyState title="Start a conversation" description="Ask a question or choose a useful place to begin." icon={<RiChatAiLine size={24}/>} actions={<Button variant="outline" onClick={()=>add('Help me plan the next release.')}>Plan a release</Button>}/>}
  </Conversation>{!composer&&<Button variant="secondary" size="small" onClick={()=>add()}>Add a response</Button>}</div>;
}

export function ConversationPreview({slug}:{slug:ConversationSlug}) {
  return <div className="docs-extended-preview docs-extended-preview--wide">{slug==='streaming-text'?<StreamDemo/>:slug==='message-actions'?<ActionsDemo/>:slug==='message'?<div className="docs-message-list"><Message role="user"><p>How can we make this flow feel clearer?</p></Message><ActionsDemo/></div>:<ConversationDemo/>}</div>;
}

export function ConversationExamples({slug}:{slug:ConversationSlug}) {
  if(slug==='streaming-text')return <><Section title="Cursor and motion" description="The cursor and appended-text fade can be disabled independently."><StreamDemo showCursor={false} animate={false}/></Section><Section title="Incoming chunks" description="Existing text keeps its place as new chunks arrive; stopping retains the text already received."><StreamDemo/></Section></>;
  if(slug==='message-actions')return <><Section title="Feedback" description="Helpful and unhelpful are mutually exclusive. Press the selected action again to clear the choice."><ActionsDemo/></Section><Section title="Optional actions" description="Regeneration changes this example's response and resets its feedback. Add read-aloud only when your application supplies it."><ActionsDemo regenerate feedback={false}/></Section><Section title="Disabled state" description="Keep unavailable actions visible and named while a response is running."><MessageActions content={answer} showFeedback isDisabled/></Section></>;
  if(slug==='message')return <><Section title="Bubble surfaces" description="Use the same message content and identity with an enclosed surface."><div className="docs-message-list"><Message role="user" variant="bubble" timestamp="10:24"><p>Keep the important controls nearby.</p></Message><Message role="assistant" variant="bubble" timestamp="10:25" actions={<MessageActions content={answer}/>}><p>{answer}</p></Message><Message role="system"><p>This conversation is stored only in this example.</p></Message></div></Section><Section title="Sources and tools" description="Messages compose the same source and tool blocks used elsewhere in the library."><Message role="assistant" footer={<Sources sources={[source]} defaultExpanded={false}/>}><p>I checked the accessible preview behavior.</p><ToolCall name="lookup_documentation" title="Check preview behavior" status="completed" durationMs={840} result={<p>Keyboard and pointer interactions are supported.</p>}/></Message></Section><Section title="Streaming response" description="The message's actions appear after its response finishes or is stopped."><StreamDemo message/></Section></>;
  return <><Section title="Scroll behavior" description="Scroll up, then add a response. The viewport preserves your place and offers a jump to the latest message."><ConversationDemo composer={false} longHistory/></Section><Section title="Composer footer" description="The footer is measured by normal layout. A growing composer leaves the message area and jump control usable."><ConversationDemo composer longHistory/></Section><Section title="Empty conversation" description="Use the shared Empty State and a useful first action for a new thread."><ConversationDemo empty composer={false}/></Section></>;
}
