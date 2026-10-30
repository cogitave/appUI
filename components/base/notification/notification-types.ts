import type {ReactNode} from 'react';

export type NotificationContent={
  title:string;
  description?:ReactNode;
  tone?:'neutral'|'information'|'success'|'error';
  avatar?:{src?:string;alt:string;initials:string;presence?:'online'|'busy'|'offline'};
  icon?:ReactNode;
  iconKey?:string;
  timestamp?:string;
  action?:{label:string;onPress:()=>void;dismiss?:boolean};
  secondaryAction?:{label:string;onPress:()=>void;dismiss?:boolean};
  isPending?:boolean;
};
export type NotificationOptions=NotificationContent&{duration?:number;onDismiss?:()=>void};
export type NotificationViewportPosition='top-left'|'top-center'|'top-right'|'bottom-left'|'bottom-center'|'bottom-right';
export type NotificationQueueLayout='list'|'stack';
