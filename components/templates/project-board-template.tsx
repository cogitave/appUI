'use client';

import { publicPath } from '@/config/deployment';
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, pointerWithin, rectIntersection, useDroppable, useSensor, useSensors, type CollisionDetection, type DragEndEvent, type DragOverEvent, type DragStartEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from 'react-dom';
import { RiAddLine, RiArchive2Line, RiArrowRightSLine, RiArrowUpLine, RiCheckboxCircleLine, RiCircleLine, RiEyeLine, RiFilter3Line, RiFolder3Line, RiLayoutColumnLine, RiLink, RiMore2Line, RiMoreLine, RiNotification3Line, RiPieChartLine, RiSearchLine, RiStarLine, RiUser3Line } from '@remixicon/react';
import { Avatar } from '@/components/base/avatar/avatar';
import { Button } from '@/components/base/buttons/button';
import { IconButton } from '@/components/base/buttons/icon-button';
import { CloseButton } from '@/components/base/buttons/close-button';
import { Input } from '@/components/base/input/input';
import { Textarea } from '@/components/base/textarea/textarea';
import { Switch } from '@/components/base/switch/switch';
import { Select } from '@/components/base/select/select';
import { ScrollArea } from '@/components/base/scroll-area/scroll-area';
import { Dropdown, DropdownIconTrigger, DropdownPopover, DropdownGroup, DropdownItem } from '@/components/base/dropdown/dropdown';
import { NotificationCenter, type InboxNotification } from '@/components/blocks/notification-center/notification-center';
import type { BoardTask } from './template-presets';

type Status = BoardTask['status'];
type Props = { initialItems: BoardTask[]; title: string; workspaceName: string; onAction?: (action: string) => void };
const columns: { id: Status; name: string; capacity: number }[] = [
  { id: 'backlog', name: 'Backlog', capacity: 8 },
  { id: 'todo', name: 'To do', capacity: 5 },
  { id: 'progress', name: 'In progress', capacity: 4 },
  { id: 'review', name: 'Review', capacity: 3 },
  { id: 'done', name: 'Done', capacity: 6 },
];
const people = [{ id: 'MC', name: 'Maya Chen', portrait: 0 }, { id: 'NG', name: 'Noah Gray', portrait: 1 }, { id: 'EP', name: 'Elif Kaya', portrait: 2 }, { id: 'PS', name: 'Priya Shah', portrait: 3 }];
const statuses = [
  { value: 'backlog', label: 'Backlog', icon: RiArchive2Line },
  { value: 'todo', label: 'To do', icon: RiCircleLine },
  { value: 'progress', label: 'In progress', icon: RiPieChartLine },
  { value: 'review', label: 'Review', icon: RiEyeLine },
  { value: 'done', label: 'Done', icon: RiCheckboxCircleLine },
] as const;
function BoardAvatar({ initials, size = 'xs' }: { initials: string; size?: 'xs' | 'sm' }) {
  const portrait = people.find(person => person.id === initials)?.portrait ?? ({ NW: 1, EK: 2 } as Record<string, number>)[initials];
  return <Avatar initials={initials} size={size} src={portrait === undefined ? undefined : publicPath("/avatars/team-hire-portraits-b.webp")} data-portrait={portrait} className="ui-board-person-avatar"/>;
}
type DetailOption = { value: string; label: string; icon?: typeof RiCircleLine; initials?: string };
function DetailSelect({ name, value, options, onChange, open, onOpenChange, variant = 'plain' }: { name: string; value: string; options: DetailOption[]; onChange: (value: string) => void; open: boolean; onOpenChange: (open: boolean) => void; variant?: 'plain' | 'priority' }) {
  return <div className="ui-board-detail__selector" data-variant={variant} data-priority={variant === 'priority' ? value : undefined}>
    <Select aria-label={name} selectedKey={value} isOpen={open} onOpenChange={onOpenChange} onSelectionChange={key => { if (key) onChange(key); }} hideIndicator triggerClassName="ui-board-detail__selector-trigger" popoverClassName="ui-board-detail__select-menu" options={options.map(option => { const Icon = option.icon; return { id: option.value, label: option.label, leading: Icon ? <Icon size={18} aria-hidden/> : option.initials ? <BoardAvatar initials={option.initials}/> : undefined }; })}/>
  </div>;
}
function resourceHost(url: string, label: string) { try { return new URL(url).hostname; } catch { return label; } }
const boardCollision: CollisionDetection = args => {
  const hits = pointerWithin(args);
  const cards = hits.filter(hit => !String(hit.id).startsWith('column:'));
  return cards.length ? cards : hits.length ? hits : rectIntersection(args);
};

function TicketCardVisual({ task, onOpen, onMove, overlay = false, buttonProps, activatorRef }: { task: BoardTask; onOpen?: () => void; onMove?: (status: Status) => void; overlay?: boolean; buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>; activatorRef?: (element: HTMLElement | null) => void }) {
  return <><button ref={activatorRef} type="button" className="ui-board-card__open" {...buttonProps} aria-label={`Open ${task.id}: ${task.title}`} onClick={onOpen} tabIndex={overlay ? -1 : buttonProps?.tabIndex}><div className="ui-template-board__card-top"><span>{task.id}{task.category && <> <b>›</b> {task.category}</>}</span><div className="ui-board-card__avatar"><BoardAvatar initials={task.assignee ?? '—'}/></div></div><div className="ui-template-board__card-tags"><em data-priority={task.priority ?? 'low'}>{task.priority ?? 'low'}</em>{task.project && <span><RiFolder3Line size={12} aria-hidden/>{task.project}</span>}</div><h4>{task.title}</h4></button><div className="ui-template-board__card-footer"><span>{task.since ?? 'Just now'}</span></div></>;
}

function SortableTicket({ task, onOpen, onMove, reducedMotion }: { task: BoardTask; onOpen: () => void; onMove: (status: Status) => void; reducedMotion: boolean | null }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'ticket', status: task.status } });
  return <article ref={setNodeRef} data-dragging={isDragging || undefined} style={{ transform: CSS.Translate.toString(transform), transition: reducedMotion ? undefined : transition ?? 'transform 260ms cubic-bezier(.22,1,.36,1)' }}><TicketCardVisual task={task} onOpen={onOpen} onMove={onMove} buttonProps={{ ...attributes, ...listeners }} activatorRef={setActivatorNodeRef}/></article>;
}

function TicketColumn({ column, tasks, compact, onOpen, onMove, onCreate, onSearch, reducedMotion }: { column: typeof columns[number]; tasks: BoardTask[]; compact: boolean; onOpen: (id: string) => void; onMove: (id: string, status: Status) => void; onCreate: (status: Status) => void; onSearch: () => void; reducedMotion: boolean | null }) {
  const { setNodeRef } = useDroppable({ id: `column:${column.id}`, data: { type: 'column', status: column.id } });
  return <section ref={setNodeRef} aria-label={column.name} data-compact={compact || undefined}><header><h3>{column.name}</h3><span>{tasks.length}/{column.capacity}</span><Dropdown><DropdownIconTrigger icon={RiMoreLine} size="xs" variant="ghost" aria-label={`More ${column.name} actions`}/><DropdownPopover aria-label={`${column.name} actions`} placement="bottom end" className="ui-board-popover"><DropdownItem onSelect={() => onCreate(column.id)}>Add ticket</DropdownItem><DropdownItem onSelect={onSearch}>Search tickets</DropdownItem></DropdownPopover></Dropdown><IconButton icon={RiAddLine} size="xs" variant="ghost" aria-label={`Add task to ${column.name}`} onClick={() => onCreate(column.id)}/></header><SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>{tasks.map(task => <SortableTicket key={task.id} task={task} onOpen={() => onOpen(task.id)} onMove={status => onMove(task.id, status)} reducedMotion={reducedMotion}/>)}</SortableContext></section>;
}

function TokenChart({ metric }: { metric: NonNullable<BoardTask['tokenMetric']> }) {
  const gradientId = useId();
  const reducedMotion = useReducedMotion();
  const values = metric.history;
  const width = 500;
  const height = 138;
  const lower = Math.min(...values) - 8;
  const upper = Math.max(...values) + 8;
  const points = values.map((value, index) => `${index * width / Math.max(values.length - 1, 1)},${height - (value - lower) / Math.max(upper - lower, 1) * height}`);
  const path = `M ${points.join(' L ')}`;
  return <div className="ui-board-detail__chart"><span>Tokens burned</span><strong>{metric.value} <em>{metric.change}</em></strong><svg viewBox={`0 0 ${width} ${height + 8}`} preserveAspectRatio="none" role="img" aria-label="Token usage over time"><defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--chart-violet)" stopOpacity=".22"/><stop offset="1" stopColor="var(--chart-violet)" stopOpacity="0"/></linearGradient></defs><motion.path d={`${path} L ${width},${height + 8} L 0,${height + 8} Z`} fill={`url(#${gradientId})`} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0 : .6, delay: reducedMotion ? 0 : .12 }}/><motion.path d={path} fill="none" stroke="var(--chart-violet)" strokeWidth="2" vectorEffect="non-scaling-stroke" initial={reducedMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reducedMotion ? 0 : .65, ease: [.22, 1, .36, 1] }}/></svg><div><span>{metric.startLabel}</span><span>{metric.endLabel}</span></div></div>;
}

export function ProjectBoardWorkspace({ initialItems, title, workspaceName, onAction }: Props) {
  const reducedMotion = useReducedMotion();
  const dndId = useId();
  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 6 } }), useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const [tasks, setTasks] = useState(initialItems);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<'all' | NonNullable<BoardTask['priority']>>('all');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [compact, setCompact] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStatus, setCreateStatus] = useState<Status | ''>('');
  const [createDefaultStatus, setCreateDefaultStatus] = useState<Status>('backlog');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState<NonNullable<BoardTask['priority']> | ''>('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newProject, setNewProject] = useState('');
  const [keepCreating, setKeepCreating] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [ticketActionsOpen, setTicketActionsOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [propertyMenu, setPropertyMenu] = useState<'status' | 'priority' | 'assignee' | 'project' | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Record<string, NonNullable<BoardTask['comments']>>>(() => Object.fromEntries(initialItems.map(task => [task.id, task.comments ?? []])));
  const [dragId, setDragId] = useState<string | null>(null);
  const dragSnapshot = useRef<BoardTask[] | null>(null);
  const nextTicketNumber = useRef(Math.max(0, ...initialItems.map(task => Number(task.id.match(/\d+$/)?.[0] ?? 0))) + 1);
  const modalClose = useRef<HTMLButtonElement>(null);
  const modalTitle = useRef<HTMLInputElement>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  const selectedTask = tasks.find(task => task.id === detailId);
  const defaultProject = initialItems[0]?.project ?? workspaceName;
  const visibleTasks = tasks.filter(task => (priorityFilter === 'all' || task.priority === priorityFilter) && `${task.title} ${task.id} ${task.category ?? ''} ${task.description ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  const notifications: InboxNotification[] = initialItems.slice(0, 5).map((task, index) => ({
    id: task.id,
    category: index < 2 ? 'mentions' : 'activity',
    title: `${task.id} · ${task.category ?? 'Project board'}`,
    description: task.title,
    time: ['2m', '18m', '1h', '3h', '1d'][index],
    unread: !readNotificationIds.includes(task.id),
    avatar: { initials: task.assignee ?? 'MC', alt: people.find(person => person.id === task.assignee)?.name ?? 'Team member' },
    action: { label: 'View ticket', variant: 'secondary', onPress: () => { setNotificationsOpen(false); setDetailId(task.id); } },
  }));
  const unreadNotifications = notifications.filter(item => item.unread).length;

  useEffect(() => {
    if (!createOpen && !detailId) return;
    if (createOpen) modalTitle.current?.focus();
    else drawerClose.current?.focus();
  }, [createOpen, detailId]);
  useEffect(() => {
    if (!createOpen && !detailId) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && !event.defaultPrevented) { if (ticketActionsOpen) setTicketActionsOpen(false); else if (propertyMenu) setPropertyMenu(null); else { setCreateOpen(false); setDetailId(null); } } };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [createOpen, detailId, propertyMenu, ticketActionsOpen]);
  useEffect(() => {
    if (sessionStorage.getItem('appui.board.create') !== '1') return;
    sessionStorage.removeItem('appui.board.create');
    setCreateOpen(true);
  }, []);

  function openCreate(status: Status) {
    setCreateStatus('');
    setCreateDefaultStatus(status);
    setCreateOpen(true);
    setDetailId(null);
  }
  function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newTitle.trim()) return;
    const task: BoardTask = { id: `ST-${nextTicketNumber.current++}`, title: newTitle.trim(), description: newDescription.trim() || undefined, status: createStatus || createDefaultStatus, priority: newPriority || 'low', assignee: newAssignee || 'MC', project: newProject || defaultProject, since: 'Just now' };
    setTasks(current => [...current, task]);
    setNewTitle('');
    setNewDescription('');
    setNewPriority('');
    setNewAssignee('');
    setNewProject('');
    setCreateOpen(keepCreating);
    onAction?.(`create ticket ${task.id}`);
  }
  function moveTask(id: string, status: Status) {
    setTasks(current => current.map(task => task.id === id ? { ...task, status, since: status === 'done' ? 'Completed just now' : task.since } : task));
  }
  function updateTask(id: string, changes: Partial<BoardTask>) {
    setTasks(current => current.map(task => task.id === id ? { ...task, ...changes } : task));
  }
  function statusForDrop(overId: string): Status | null {
    if (overId.startsWith('column:')) return overId.slice(7) as Status;
    return tasks.find(task => task.id === overId)?.status ?? null;
  }
  function onDragStart(event: DragStartEvent) {
    dragSnapshot.current = tasks;
    setDragId(String(event.active.id));
  }
  function onDragOver(event: DragOverEvent) {
    if (!event.over) return;
    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    if (activeId === overId) return;
    const targetStatus = statusForDrop(overId);
    if (!targetStatus) return;
    setTasks(current => {
      const from = current.findIndex(task => task.id === activeId);
      const over = current.findIndex(task => task.id === overId);
      if (from < 0 || (over >= 0 && from === over)) return current;
      const active = current[from];
      if (over < 0 && active.status === targetStatus) return current;
      const next = [...current];
      next.splice(from, 1);
      const insertion = over < 0 ? next.findLastIndex(task => task.status === targetStatus) + 1 : Math.max(0, next.findIndex(task => task.id === overId));
      next.splice(insertion, 0, { ...active, status: targetStatus });
      if (next.every((task, index) => task === current[index])) return current;
      return next;
    });
  }
  function onDragEnd(event: DragEndEvent) {
    const moved = tasks.find(task => task.id === event.active.id);
    const before = dragSnapshot.current?.find(task => task.id === event.active.id);
    if (!event.over && dragSnapshot.current) setTasks(dragSnapshot.current);
    else if (moved && before && moved.status !== before.status) updateTask(moved.id, { since: moved.status === 'done' ? 'Completed just now' : moved.since });
    dragSnapshot.current = null;
    setDragId(null);
  }
  function postComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedTask || !commentText.trim()) return;
    setComments(current => ({ ...current, [selectedTask.id]: [...(current[selectedTask.id] ?? []), { author: 'Maya Chen', time: 'Just now', text: commentText.trim() }] }));
    setCommentText('');
    onAction?.(`comment on ${selectedTask.id}`);
  }

  return <div className="ui-template-board-view">
    <div className="ui-template-board-view__top"><div><span>{workspaceName}</span><RiArrowRightSLine size={15} aria-hidden/><span>Projects</span><RiArrowRightSLine size={15} aria-hidden/><strong>Project board</strong></div></div>
    <header className="ui-template-board-view__heading"><h2 title={title}>{title}</h2><div className="ui-template-board-view__notifications">
      <Dropdown isOpen={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DropdownIconTrigger icon={RiNotification3Line} size="small" variant="ghost" aria-label="Notifications" badge={unreadNotifications} aria-description={`${unreadNotifications} unread notifications`}/>
        <DropdownPopover aria-label="Project notifications" placement="bottom end" className="ui-board-popover ui-board-notifications-popover">
          <NotificationCenter items={notifications} onReadChange={id => setReadNotificationIds(current => current.includes(id) ? current : [...current, id])} onMarkAllRead={() => setReadNotificationIds(notifications.map(item => item.id))} onAction={(_, action) => onAction?.(action)}/>
        </DropdownPopover>
      </Dropdown>
      </div><div className="ui-template-board-view__actions" role="group" aria-label="Board tools">
      <Dropdown isOpen={searchOpen} onOpenChange={setSearchOpen}>
        <DropdownIconTrigger icon={RiSearchLine} size="small" variant="ghost" aria-label="Search tickets" aria-pressed={Boolean(query)} aria-description={query ? `Filtering by ${query}` : undefined}/>
        <DropdownPopover aria-label="Search board" placement="bottom end" className="ui-board-popover ui-board-search-popover">
          <Input inputRef={searchInput} label="Search tickets" hideLabel type="search" value={query} onChange={setQuery} placeholder="Search tickets" leading={<RiSearchLine/>}/>
          <div className="ui-board-search-popover__summary"><span role="status">{visibleTasks.length} {visibleTasks.length === 1 ? 'ticket' : 'tickets'} found</span><Button variant="ghost" size="xs" disabled={!query} onClick={() => { setQuery(''); searchInput.current?.focus(); }}>Clear search</Button></div>
        </DropdownPopover>
      </Dropdown>
      <Dropdown isOpen={filtersOpen} onOpenChange={setFiltersOpen}>
        <DropdownIconTrigger icon={RiFilter3Line} size="small" variant="ghost" aria-label="Filter tickets" aria-pressed={priorityFilter !== 'all'} aria-description={`Priority: ${priorityFilter}`}/>
        <DropdownPopover aria-label="Ticket filters" placement="bottom end" className="ui-board-popover">
          <DropdownGroup label="Priority">{(['all','low','medium','high','urgent'] as const).map(priority => <DropdownItem key={priority} selected={priorityFilter === priority} onSelect={() => setPriorityFilter(priority)}>{priority === 'all' ? 'All tickets' : priority[0].toUpperCase() + priority.slice(1)}</DropdownItem>)}</DropdownGroup>
        </DropdownPopover>
      </Dropdown>
      <IconButton icon={RiLayoutColumnLine} size="small" variant="ghost" aria-label={compact ? 'Comfortable board view' : 'Compact board view'} aria-pressed={compact} onClick={() => setCompact(value => !value)}/>
    </div><Button className="ui-template-board-view__create" size="small" leadingIcon={RiAddLine} onClick={() => openCreate('backlog')}>New ticket</Button></header>
    <DndContext id={dndId} sensors={sensors} collisionDetection={boardCollision} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd} onDragCancel={() => { if (dragSnapshot.current) setTasks(dragSnapshot.current); dragSnapshot.current = null; setDragId(null); }}>
      <div className="ui-template-board-navigation">
        <ScrollArea label="Project board columns" orientation="horizontal" className="ui-template-board-scroll" renderViewport={({ref,className,children})=><div ref={ref} className={`${className} ui-template-board`} data-compact={compact || undefined} data-dragging={Boolean(dragId) || undefined} role="region" aria-label="Project board columns" tabIndex={0}>{children}</div>}>
          {columns.map(column => <TicketColumn key={column.id} column={column} tasks={visibleTasks.filter(task => task.status === column.id)} compact={compact} onOpen={setDetailId} onMove={moveTask} onCreate={openCreate} onSearch={() => setSearchOpen(true)} reducedMotion={reducedMotion}/>)}
        </ScrollArea>
        <span className="ui-template-board-navigation__hint" aria-hidden>Browse columns</span>
      </div>
      {typeof document !== 'undefined' && createPortal(<DragOverlay adjustScale={false} dropAnimation={reducedMotion ? null : { duration: 260, easing: 'cubic-bezier(.22,1,.36,1)' }}>{dragId && <article className="ui-board-drag-overlay"><TicketCardVisual task={tasks.find(task => task.id === dragId) ?? initialItems.find(task => task.id === dragId)!} overlay/></article>}</DragOverlay>, document.body)}
    </DndContext>
    <AnimatePresence>{createOpen && <motion.div className="ui-board-overlay ui-board-overlay--create" key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .2 }}><button className="ui-board-overlay__backdrop" type="button" aria-label="Close new ticket" onClick={() => setCreateOpen(false)}/><motion.section className="ui-board-create" role="dialog" aria-modal="true" aria-label="Create ticket" initial={{ y: reducedMotion ? 0 : 35, scaleY: reducedMotion ? 1 : .78, opacity: 0, filter: reducedMotion ? 'none' : 'blur(7px)' }} animate={{ y: 0, scaleY: 1, opacity: 1, filter: 'blur(0px)' }} exit={{ y: reducedMotion ? 0 : 25, scaleY: reducedMotion ? 1 : .85, opacity: 0, filter: reducedMotion ? 'none' : 'blur(5px)' }} style={{ transformOrigin: 'bottom center' }} transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 27, mass: .85 }}><form onSubmit={createTicket}><header><span>{title} <b>›</b> ST-{nextTicketNumber.current} <b>›</b> New ticket</span><CloseButton ref={modalClose} size="sm" aria-label="Close new ticket" onClick={() => setCreateOpen(false)}/></header><Input inputRef={modalTitle} className="ui-board-create__title" label="Ticket title" hideLabel variant="plain" value={newTitle} onChange={setNewTitle} placeholder="Enter ticket title" maxLength={200} isRequired/><Textarea label="Description" hideLabel variant="plain" className="ui-board-create__description" value={newDescription} onChange={setNewDescription} autoResize placeholder="Description area" rows={1}/><div className="ui-board-create__properties">
<div className="ui-board-create__select"><RiAddLine aria-hidden/><Select aria-label="Status" placeholder="Status" selectedKey={createStatus || null} onSelectionChange={key => setCreateStatus((key ?? '') as Status | '')} hideIndicator triggerClassName="ui-board-create__property-trigger" popoverClassName="ui-board-detail__select-menu" options={statuses.map(({value,label,icon:Icon}) => ({id:value,label,leading:<Icon size={18} aria-hidden/>}))}/></div>
<div className="ui-board-create__select"><RiFilter3Line aria-hidden/><Select aria-label="Urgency" placeholder="Urgency" selectedKey={newPriority || null} onSelectionChange={key => setNewPriority((key ?? '') as NonNullable<BoardTask['priority']> | '')} hideIndicator triggerClassName="ui-board-create__property-trigger" popoverClassName="ui-board-detail__select-menu" options={[{id:'low',label:'Low'},{id:'medium',label:'Medium'},{id:'high',label:'High'},{id:'urgent',label:'Urgent'}]}/></div>
<div className="ui-board-create__select"><RiUser3Line aria-hidden/><Select aria-label="Assignee" placeholder="Assignee" selectedKey={newAssignee || null} onSelectionChange={key => setNewAssignee(key ?? '')} hideIndicator triggerClassName="ui-board-create__property-trigger" popoverClassName="ui-board-detail__select-menu" options={people.map(person => ({id:person.id,label:person.name,leading:<BoardAvatar initials={person.id}/>}))}/></div>
<div className="ui-board-create__select"><RiFolder3Line aria-hidden/><Select aria-label="Project" placeholder="Project" selectedKey={newProject || null} onSelectionChange={key => setNewProject(key ?? '')} hideIndicator triggerClassName="ui-board-create__property-trigger" popoverClassName="ui-board-detail__select-menu" options={Array.from(new Set([defaultProject,...tasks.map(task => task.project).filter((value): value is string => Boolean(value))])).map(project => ({id:project,label:project,leading:<RiFolder3Line size={18} aria-hidden/>}))}/></div>
</div><footer><Switch size="sm" className="ui-board-create__keep" isSelected={keepCreating} onChange={setKeepCreating}>Keep creating</Switch><span/><Button variant="secondary" size="small" onClick={() => setCreateOpen(false)}>Cancel</Button><Button size="small" type="submit">Create ticket</Button></footer></form></motion.section></motion.div>}</AnimatePresence>
    <AnimatePresence>{selectedTask && <motion.div className="ui-board-overlay ui-board-overlay--detail" key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reducedMotion ? 0 : .2 }}><button className="ui-board-overlay__backdrop" type="button" aria-label="Close ticket details" onClick={() => setDetailId(null)}/><motion.aside className="ui-board-detail" role="dialog" aria-modal="true" aria-label={`${selectedTask.id} details`} initial={{ x: reducedMotion ? 0 : '100%' }} animate={{ x: 0 }} exit={{ x: reducedMotion ? 0 : '100%' }} transition={{ duration: reducedMotion ? 0 : .34, ease: [.2, .75, .25, 1] }}><header><div className="ui-board-detail__breadcrumbs"><span>{title}</span><RiArrowRightSLine size={14}/><span>{selectedTask.id}</span><RiArrowRightSLine size={14}/><strong>{selectedTask.category ?? 'Project board'}</strong></div><div className="ui-board-detail__header-actions"><IconButton icon={RiStarLine} size="xs" aria-label="Favorite ticket" aria-pressed={favoriteIds.includes(selectedTask.id)} onClick={() => setFavoriteIds(current => current.includes(selectedTask.id) ? current.filter(id => id !== selectedTask.id) : [...current, selectedTask.id])}/><IconButton icon={RiLink} size="xs" aria-label="Copy ticket link" onClick={() => { void navigator.clipboard.writeText(`${location.href.split('#')[0]}#ticket-${selectedTask.id}`).then(() => onAction?.('Ticket link copied'), () => onAction?.('Could not copy ticket link')); }}/><Dropdown isOpen={ticketActionsOpen} onOpenChange={setTicketActionsOpen}><DropdownIconTrigger icon={RiMore2Line} size="xs" aria-label="More ticket actions"/><DropdownPopover aria-label="Ticket actions" placement="bottom end" offset={6} className="ui-board-detail__select-menu ui-board-detail__actions-menu"><DropdownItem onSelect={() => { void navigator.clipboard.writeText(selectedTask.id).then(() => onAction?.('Ticket ID copied'), () => onAction?.('Could not copy ticket ID')); }}>Copy ticket ID</DropdownItem><DropdownItem onSelect={() => moveTask(selectedTask.id, 'done')}>Move to Done</DropdownItem></DropdownPopover></Dropdown></div><CloseButton ref={drawerClose} size="sm" className="ui-board-detail__close" aria-label="Close ticket details" onClick={() => setDetailId(null)}/></header><div className="ui-board-detail__scroll"><div className="ui-board-detail__created">Created by <BoardAvatar initials={selectedTask.assignee ?? 'MC'}/><strong>{people.find(person => person.id === selectedTask.assignee)?.name ?? 'Studio team'}</strong></div><h2>{selectedTask.title}</h2><p className="ui-board-detail__description">{selectedTask.description ?? 'Add a clear description to help your team understand this ticket.'}</p><div className="ui-board-detail__property"><span>Properties</span><div className="ui-board-detail__property-controls">
  <DetailSelect name="Ticket status" value={selectedTask.status} options={statuses.map(status => ({ ...status }))} onChange={value => moveTask(selectedTask.id, value as Status)} open={propertyMenu === 'status'} onOpenChange={open => setPropertyMenu(open ? 'status' : null)}/>
  <DetailSelect name="Ticket priority" value={selectedTask.priority ?? 'low'} variant="priority" options={[{value:'low',label:'Low'},{value:'medium',label:'Medium'},{value:'high',label:'High'},{value:'urgent',label:'Urgent'}]} onChange={value => updateTask(selectedTask.id,{priority:value as NonNullable<BoardTask['priority']>})} open={propertyMenu === 'priority'} onOpenChange={open => setPropertyMenu(open ? 'priority' : null)}/>
  <DetailSelect name="Ticket assignee" value={selectedTask.assignee ?? 'MC'} options={people.map(person => ({value:person.id,label:person.name,initials:person.id}))} onChange={value => updateTask(selectedTask.id,{assignee:value})} open={propertyMenu === 'assignee'} onOpenChange={open => setPropertyMenu(open ? 'assignee' : null)}/>
  <DetailSelect name="Ticket project" value={selectedTask.project ?? defaultProject} options={Array.from(new Set([defaultProject,...tasks.map(task => task.project).filter((value): value is string => Boolean(value))])).map(project => ({value:project,label:project,icon:RiFolder3Line}))} onChange={value => updateTask(selectedTask.id,{project:value})} open={propertyMenu === 'project'} onOpenChange={open => setPropertyMenu(open ? 'project' : null)}/>
</div></div>{selectedTask.resources?.length ? <div className="ui-board-detail__resources"><span>Resources</span><div>{selectedTask.resources.map(resource => <a href={resource.url} key={resource.url} target="_blank" rel="noreferrer">{resourceHost(resource.url, resource.label)}</a>)}</div></div> : null}{selectedTask.tokenMetric?.history.length ? <TokenChart metric={selectedTask.tokenMetric}/> : null}<div className="ui-board-detail__comments">{(comments[selectedTask.id] ?? []).map((comment, index) => <div key={`${selectedTask.id}-${index}`}><BoardAvatar initials={comment.author.split(' ').map(part => part[0]).join('')}/><p><strong>{comment.author}</strong><span>{comment.time}</span><br/>{comment.text}</p></div>)}</div></div><form className="ui-board-detail__comment-form" onSubmit={postComment}><Textarea label="Comment" hideLabel variant="plain" placeholder="Enter your comment" value={commentText} onChange={setCommentText} rows={2}/><IconButton icon={RiArrowUpLine} size="xs" type="submit" aria-label="Post comment" disabled={!commentText.trim()}/></form></motion.aside></motion.div>}</AnimatePresence>
  </div>;
}
